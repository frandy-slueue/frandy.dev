"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Briefcase, Award, Star, Clock, X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import TabBar, { TabItem } from "@/components/ui/TabBar";

// ── Types ─────────────────────────────────────────────────────────────
type NodeCategory = "Education" | "Work" | "Milestone" | "Certifications" | "Background";

interface TimelineNode {
  id: string;
  period: string;
  title: string;
  category: NodeCategory;
  description: string;
  image_url: string | null;
}

// ── Data ──────────────────────────────────────────────────────────────
const FILTER_TABS: TabItem[] = [
  "All", "Education", "Work", "Milestone", "Certifications",
].map((label) => ({ label }));

const NODES: TimelineNode[] = [
  { id: "foundation",   period: "Before", title: "The Foundation",        category: "Background",     description: "Life before code. A persistent drive to understand how things work and an instinct to build. That mindset was already there — software gave it a direction.", image_url: null },
  { id: "atlas",        period: "2023",   title: "Atlas School of Tulsa", category: "Education",      description: "Enrolled in an intensive, project-based software engineering program. No lectures — just building, breaking, and figuring it out. The hardest and most formative experience of my engineering life.", image_url: null },
  { id: "first-deploy", period: "2023",   title: "First Deployed Project", category: "Milestone",     description: "First working application shipped to the web. Seeing something I built live on a real URL changed how I thought about what was possible.", image_url: null },
  { id: "advanced",     period: "2024",   title: "Advanced Curriculum",   category: "Education",      description: "React, Next.js, Python, Django, FastAPI, PostgreSQL, Docker. The stack expanded fast. Started understanding not just how to use tools but why certain tools exist.", image_url: null },
  { id: "freelance",    period: "2024",   title: "First Freelance Project", category: "Work",         description: "First client project delivered. Real deadline, real feedback, real money. A completely different pressure than school projects — in a good way.", image_url: null },
  { id: "devops",       period: "2024",   title: "DevOps & Docker",       category: "Certifications", description: "Containerisation and deployment workflows. Docker Compose went from intimidating to natural. Started thinking about infrastructure as part of the product.", image_url: null },
  { id: "portfolio",    period: "2025",   title: "Portfolio Launch",      category: "Milestone",      description: "frandy.dev — this portfolio. FastAPI backend, Next.js frontend, five Docker services, four animated themes, a CodeBreeder identity baked into the work layer.", image_url: null },
  { id: "first-role",   period: "2025",   title: "Seeking First Role",    category: "Work",           description: "Open to full-stack engineering roles and freelance projects. If you are reading this and you have something worth building — I want to hear about it.", image_url: null },
];

const FUTURE_NODES = [
  "First Full-Time Role", "Open Source Contribution",
  "CodeBreeder Launch", "Team Lead",
  "Building Something Big", "What Comes Next",
];

// ── Category config ───────────────────────────────────────────────────
const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Education:      { icon: <GraduationCap size={13} />, color: "var(--accent)",       bg: "rgba(192,192,192,0.1)" },
  Work:           { icon: <Briefcase size={13} />,     color: "#4a9eff",             bg: "rgba(74,158,255,0.1)" },
  Milestone:      { icon: <Star size={13} />,          color: "var(--accent)",       bg: "rgba(192,192,192,0.08)" },
  Certifications: { icon: <Award size={13} />,         color: "#3d9970",             bg: "rgba(61,153,112,0.1)" },
  Background:     { icon: <Clock size={13} />,         color: "var(--accent-muted)", bg: "rgba(192,192,192,0.06)" },
};

// ── Snap stops ────────────────────────────────────────────────────────
const SNAP_OPEN   = 260;
const SNAP_PEEK   = 72;
const SNAP_CLOSED = 0;
const SNAP_STOPS  = [SNAP_OPEN, SNAP_PEEK, SNAP_CLOSED];

function nearestStop(w: number, velocity: number): number {
  if (Math.abs(velocity) > 0.6) {
    const sorted = velocity < 0
      ? [...SNAP_STOPS].sort((a, b) => b - a)
      : [...SNAP_STOPS].sort((a, b) => a - b);
    const next = sorted.find((s) => velocity < 0 ? s < w : s > w);
    if (next !== undefined) return next;
  }
  return SNAP_STOPS.reduce((prev, curr) =>
    Math.abs(curr - w) < Math.abs(prev - w) ? curr : prev
  );
}

const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 } as const;

// ── Fold panel ────────────────────────────────────────────────────────
interface FoldProps {
  node: TimelineNode;
  index: number;
  isActive: boolean;
  onOpen: (node: TimelineNode, index: number) => void;
}

function FoldPanel({ node, index, isActive, onOpen }: FoldProps) {
  const [width, setWidth]         = useState(SNAP_OPEN);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef     = useRef(0);
  const startWRef     = useRef(SNAP_OPEN);
  const velocityRef   = useRef(0);
  const lastXRef      = useRef(0);
  const lastTRef      = useRef(0);

  const meta     = CATEGORY_META[node.category] ?? CATEGORY_META.Background;
  const isOpen   = width >= SNAP_PEEK + 10;
  const isPeek   = width > SNAP_CLOSED && width < SNAP_PEEK + 10;
  const isClosed = width <= SNAP_CLOSED + 2;

  function resistedWidth(raw: number): number {
    if (raw > SNAP_OPEN)   return SNAP_OPEN   + (raw - SNAP_OPEN)   * 0.18;
    if (raw < SNAP_CLOSED) return SNAP_CLOSED + (raw - SNAP_CLOSED) * 0.18;
    return Math.min(SNAP_OPEN + 28, Math.max(SNAP_CLOSED - 20, raw));
  }

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    startXRef.current   = e.clientX;
    startWRef.current   = width;
    lastXRef.current    = e.clientX;
    lastTRef.current    = e.timeStamp;
    velocityRef.current = 0;
  }, [width]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx  = e.clientX - startXRef.current;
    const dt  = e.timeStamp - lastTRef.current;
    if (dt > 0) velocityRef.current = (e.clientX - lastXRef.current) / dt;
    lastXRef.current = e.clientX;
    lastTRef.current = e.timeStamp;
    setWidth(resistedWidth(startWRef.current + dx));
  }, [isDragging]);

  const onPointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setWidth(nearestStop(width, velocityRef.current));
  }, [isDragging, width]);

  const bendRatio    = 1 - Math.max(0, Math.min(1, (width - SNAP_PEEK) / (SNAP_OPEN - SNAP_PEEK)));
  const creaseOpacity = 0.08 + bendRatio * 0.32;
  const creaseWidth   = 16 + bendRatio * 12;

  if (isClosed) return null;

  return (
    <motion.div
      animate={{ width }}
      transition={isDragging ? { duration: 0 } : SPRING}
      style={{ flexShrink: 0, position: "relative", overflow: "hidden", height: "100%", willChange: "width" }}
    >
      {/* Paper face */}
      <div style={{
        position: "absolute", inset: 0,
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* dframe corner accents */}
        <div style={{
          position: "absolute", inset: -1,
          background: isActive
            ? `linear-gradient(var(--accent),var(--accent)) top left/14px 1.5px no-repeat,
               linear-gradient(var(--accent),var(--accent)) top left/1.5px 14px no-repeat,
               linear-gradient(var(--accent),var(--accent)) bottom right/14px 1.5px no-repeat,
               linear-gradient(var(--accent),var(--accent)) bottom right/1.5px 14px no-repeat`
            : "none",
          pointerEvents: "none", zIndex: 4,
        }} />

        {/* Year + category */}
        <div style={{
          padding: "20px 16px 12px",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0, overflow: "hidden", whiteSpace: "nowrap",
        }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            letterSpacing: "0.02em", lineHeight: 1, marginBottom: 4,
            color: meta.color, overflow: "hidden", textOverflow: "clip",
          }}>
            {node.period}
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--text-muted)", opacity: isOpen ? 1 : 0, transition: "opacity 0.2s",
          }}>
            {node.category}
          </div>
        </div>

        {/* Spine dot row */}
        <div style={{
          height: 40, flexShrink: 0, position: "relative",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: 0, right: 0,
            height: 1, background: "var(--border-subtle)", transform: "translateY(-50%)",
          }} />
          <div style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)",
            width: 12, height: 12, borderRadius: "50%",
            background: meta.color,
            boxShadow: isActive ? `0 0 14px ${meta.color}, 0 0 4px ${meta.color}` : `0 0 8px ${meta.color}`,
            border: "2px solid var(--bg-primary)", zIndex: 2,
            transition: "box-shadow 0.3s",
          }} />
        </div>

        {/* Body */}
        <div style={{
          flex: 1, padding: "14px 16px 0",
          display: "flex", flexDirection: "column", gap: 10,
          overflow: "hidden", opacity: isOpen ? 1 : 0, transition: "opacity 0.15s",
        }}>
          {/* Category badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            color: meta.color, fontFamily: "var(--font-body)",
            fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
          }}>
            {meta.icon}<span>{node.category}</span>
          </div>

          {/* Title */}
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
            letterSpacing: "0.02em", lineHeight: 1.1, color: "var(--text-primary)",
          }}>
            {node.title}
          </div>

          {/* Description */}
          <div style={{
            fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)",
            lineHeight: 1.65, display: "-webkit-box",
            WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {node.description}
          </div>

          {/* Read more CTA */}
          <button
            onClick={() => onOpen(node, index)}
            style={{
              background: "none", border: "none", padding: 0,
              fontFamily: "var(--font-mono)", fontSize: 10,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: meta.color, cursor: "pointer", textAlign: "left",
              opacity: 0.75, transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.75")}
          >
            + Read more
          </button>

          {/* Image block */}
          <div style={{
            marginTop: "auto", marginBottom: 14, height: 72,
            overflow: "hidden", border: "1px solid var(--border-subtle)",
            flexShrink: 0, position: "relative", background: "var(--bg-elevated)",
          }}>
            {node.image_url ? (
              <img src={node.image_url} alt={node.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
            ) : (
              <div style={{
                inset: 0, position: "absolute",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontFamily: "var(--font-mono)", fontSize: 9,
                letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--border)",
              }}>
                <ImageIcon size={12} style={{ color: "var(--border)" }} />
                No image
              </div>
            )}
          </div>
        </div>

        {/* Peek state */}
        {isPeek && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
          }}>
            <div style={{
              fontFamily: "var(--font-display)", fontSize: 13,
              letterSpacing: "0.1em", color: meta.color,
              writingMode: "vertical-rl", textOrientation: "mixed",
              transform: "rotate(180deg)", whiteSpace: "nowrap",
            }}>
              {node.period} — {node.title}
            </div>
          </div>
        )}

        {/* Crease shadow */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0,
          width: creaseWidth,
          background: `linear-gradient(to right, transparent, rgba(0,0,0,${creaseOpacity}))`,
          pointerEvents: "none", zIndex: 3,
          transition: isDragging ? "none" : "width 0.3s, opacity 0.3s",
        }} />
      </div>

      {/* Drag handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: 24,
          cursor: "ew-resize", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          touchAction: "none",
        }}
      >
        <div style={{
          width: 3, height: isDragging ? 48 : 32, borderRadius: 2,
          background: isDragging ? meta.color : "rgba(255,255,255,0.1)",
          transition: "background 0.2s, height 0.2s",
        }} />
      </div>
    </motion.div>
  );
}

// ── Future ghost fold ─────────────────────────────────────────────────
function FutureFold({ label, opacity }: { label: string; opacity: number }) {
  return (
    <div style={{
      flexShrink: 0, width: SNAP_OPEN, height: "100%", opacity,
      position: "relative", borderRight: "1px solid var(--border-subtle)",
      background: "var(--bg-secondary)", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "0.02em", lineHeight: 1, color: "var(--border)", marginBottom: 4 }}>Soon</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--border)" }}>Future</div>
      </div>
      <div style={{ height: 40, flexShrink: 0, position: "relative", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "var(--border-subtle)", transform: "translateY(-50%)" }} />
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", border: "1px dashed var(--border)", background: "transparent", zIndex: 2 }} />
      </div>
      <div style={{ flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 1.8vw, 1.3rem)", letterSpacing: "0.02em", lineHeight: 1.2, color: "var(--border)" }}>{label}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--border)" }}>Coming soon</div>
      </div>
      <div style={{ margin: "0 16px 14px", height: 72, border: "1px dashed var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ImageIcon size={14} style={{ color: "var(--border)" }} />
      </div>
    </div>
  );
}

// ── Side Drawer ───────────────────────────────────────────────────────
interface DrawerProps {
  node: TimelineNode | null;
  allNodes: TimelineNode[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function TimelineDrawer({ node, allNodes, activeIndex, onClose, onNavigate }: DrawerProps) {
  const meta    = node ? CATEGORY_META[node.category] ?? CATEGORY_META.Background : null;
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < allNodes.length - 1;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const navBtnStyle = (enabled: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 6,
    background: "none", border: "1px solid var(--border)",
    padding: "8px 14px",
    cursor: enabled ? "pointer" : "not-allowed",
    opacity: enabled ? 1 : 0.3,
    color: "var(--text-muted)",
    fontFamily: "var(--font-body)", fontSize: 12,
    letterSpacing: "0.08em", textTransform: "uppercase",
    transition: "border-color 0.2s, color 0.2s",
    flex: 1,
  });

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 39 }}
          />

          <motion.div
            key="drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={SPRING}
            style={{
              position: "fixed", top: 72, right: 0, bottom: 0,
              width: "min(480px, 100vw)",
              background: "var(--bg-elevated)",
              borderLeft: "1px solid var(--border)",
              zIndex: 40, display: "flex", flexDirection: "column", overflowY: "auto",
            }}
          >
            {/* dframe inner frame */}
            <div style={{ position: "absolute", inset: 4, border: "1px solid var(--border-subtle)", borderRadius: 6, pointerEvents: "none", zIndex: 0 }} />
            {/* dframe corner accents */}
            <div style={{
              position: "absolute", inset: -1,
              background: `
                linear-gradient(var(--accent),var(--accent)) top left/14px 1.5px no-repeat,
                linear-gradient(var(--accent),var(--accent)) top left/1.5px 14px no-repeat,
                linear-gradient(var(--accent),var(--accent)) bottom right/14px 1.5px no-repeat,
                linear-gradient(var(--accent),var(--accent)) bottom right/1.5px 14px no-repeat`,
              pointerEvents: "none", zIndex: 2,
            }} />

            {/* Close button */}
            <button
              onClick={onClose}
              className="project-detail__close"
              style={{ position: "sticky", top: 20, left: "calc(100% - 56px)", zIndex: 10, flexShrink: 0 }}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div style={{ padding: "0 28px 32px", position: "relative", zIndex: 1, flex: 1 }}>
              {/* Image */}
              <div style={{
                height: 200, background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                marginBottom: 24, overflow: "hidden", position: "relative",
              }}>
                {node.image_url ? (
                  <img src={node.image_url} alt={node.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <ImageIcon size={28} style={{ color: "var(--border)" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--border)" }}>
                      No image added yet
                    </span>
                  </div>
                )}
              </div>

              <span className="project-detail__meta" style={{ color: meta?.color }}>
                {node.category} · {node.period}
              </span>
              <h3 className="project-detail__title">{node.title}</h3>

              {/* Category badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 12px",
                background: meta?.bg,
                border: `1px solid ${meta?.color}33`,
                marginBottom: 20,
                fontFamily: "var(--font-body)", fontSize: 11,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: meta?.color, fontWeight: 600,
              }}>
                {meta?.icon}{node.category}
              </div>

              <p className="project-detail__body">{node.description}</p>
            </div>

            {/* Prev / Next nav */}
            <div style={{
              position: "sticky", bottom: 0,
              background: "var(--bg-elevated)",
              borderTop: "1px solid var(--border-subtle)",
              padding: "14px 28px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              zIndex: 2, flexShrink: 0,
            }}>
              <button
                onClick={() => hasPrev && onNavigate(activeIndex - 1)}
                disabled={!hasPrev}
                style={{ ...navBtnStyle(hasPrev), justifyContent: "flex-start" }}
                onMouseEnter={(e) => { if (hasPrev) { e.currentTarget.style.borderColor = "var(--accent-muted)"; e.currentTarget.style.color = "var(--text-primary)"; }}}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <ChevronLeft size={14} />
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {hasPrev ? allNodes[activeIndex - 1].title : "—"}
                </span>
              </button>

              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0 }}>
                {activeIndex + 1} / {allNodes.length}
              </div>

              <button
                onClick={() => hasNext && onNavigate(activeIndex + 1)}
                disabled={!hasNext}
                style={{ ...navBtnStyle(hasNext), justifyContent: "flex-end" }}
                onMouseEnter={(e) => { if (hasNext) { e.currentTarget.style.borderColor = "var(--accent-muted)"; e.currentTarget.style.color = "var(--text-primary)"; }}}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {hasNext ? allNodes[activeIndex + 1].title : "—"}
                </span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Mobile node ───────────────────────────────────────────────────────
interface MobileNodeProps {
  node: TimelineNode;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenDrawer: (node: TimelineNode, index: number) => void;
}

function MobileNode({ node, index, isExpanded, onToggle, onOpenDrawer }: MobileNodeProps) {
  const meta = CATEGORY_META[node.category] ?? CATEGORY_META.Background;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      style={{ position: "relative", marginBottom: 28, cursor: "pointer" }}
      onClick={onToggle}
    >
      <div style={{
        position: "absolute", left: -28, top: 4,
        width: 12, height: 12, borderRadius: "50%",
        background: meta.color, boxShadow: `0 0 8px ${meta.color}`,
        border: "2px solid var(--bg-primary)",
        transition: "transform 0.25s",
        transform: isExpanded ? "scale(1.35)" : "scale(1)",
      }} />

      <p className="timeline-node-mobile__period">{node.period}</p>
      <div className="timeline-node-mobile__badge" style={{ color: meta.color }}>
        <span aria-hidden>{meta.icon}</span>
        <span className="timeline-node__badge-text">{node.category}</span>
      </div>
      <p className="timeline-node-mobile__title">{node.title}</p>
      <span className="timeline-node-mobile__toggle">{isExpanded ? "— collapse" : "+ expand"}</span>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <p className="timeline-node-mobile__desc">{node.description}</p>
            <div style={{
              marginTop: 12, height: 100,
              background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {node.image_url
                ? <img src={node.image_url} alt={node.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <ImageIcon size={18} style={{ color: "var(--border)" }} />}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onOpenDrawer(node, index); }}
              style={{
                marginTop: 10, background: "none", border: "none", padding: 0,
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: meta.color, cursor: "pointer",
              }}
            >
              + Read more
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main section ──────────────────────────────────────────────────────
export default function Timeline() {
  const [activeFilter, setActiveFilter]   = useState("All");
  const [expandedMobile, setExpanded]     = useState<string | null>(null);
  const [drawerNode, setDrawerNode]       = useState<TimelineNode | null>(null);
  const [drawerIndex, setDrawerIndex]     = useState(0);

  const filtered = activeFilter === "All"
    ? NODES
    : NODES.filter((n) => n.category === activeFilter);

  function openDrawer(node: TimelineNode, index: number) { setDrawerNode(node); setDrawerIndex(index); }
  function closeDrawer() { setDrawerNode(null); }
  function navigateDrawer(newIndex: number) {
    if (newIndex < 0 || newIndex >= filtered.length) return;
    setDrawerNode(filtered[newIndex]);
    setDrawerIndex(newIndex);
  }

  return (
    <section id="timeline" className="section-pad" aria-labelledby="timeline-heading" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="site-container">
        <SectionLabel>04 — Timeline</SectionLabel>
        <h2 id="timeline-heading" className="sr-only">Timeline</h2>
        <TabBar
          tabs={FILTER_TABS}
          active={activeFilter}
          onChange={(label) => { setActiveFilter(label); setExpanded(null); closeDrawer(); }}
        />
      </div>

      {/* Desktop — folded paper */}
      <div className="timeline-desktop">
        <div style={{ overflowX: "auto", overflowY: "hidden", scrollbarWidth: "none", msOverflowStyle: "none" as React.CSSProperties["msOverflowStyle"] }}>
          <div style={{ display: "flex", height: 420, minWidth: "max-content" }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((node, i) => (
                <FoldPanel key={node.id} node={node} index={i} isActive={drawerNode?.id === node.id} onOpen={openDrawer} />
              ))}
            </AnimatePresence>
            {activeFilter === "All" && FUTURE_NODES.map((label, i) => (
              <FutureFold key={`future-${i}`} label={label} opacity={Math.max(0.06, 0.55 - i * 0.09)} />
            ))}
          </div>
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--border)", textAlign: "center", marginTop: 10 }}>
          drag each panel edge to fold / unfold · click + read more to expand
        </p>
      </div>

      {/* Mobile — vertical */}
      <div className="timeline-mobile">
        <div className="site-container">
          <div className="timeline-mobile-list">
            <div className="timeline-mobile-spine" aria-hidden />
            <AnimatePresence mode="popLayout">
              {filtered.map((node, i) => (
                <MobileNode
                  key={node.id} node={node} index={i}
                  isExpanded={expandedMobile === node.id}
                  onToggle={() => setExpanded(expandedMobile === node.id ? null : node.id)}
                  onOpenDrawer={openDrawer}
                />
              ))}
            </AnimatePresence>
            {activeFilter === "All" && FUTURE_NODES.slice(0, 3).map((label, i) => (
              <div key={`future-m-${i}`} className="timeline-future-mobile" style={{ opacity: Math.max(0.06, 0.25 - i * 0.07) }}>
                <div className="timeline-future-mobile__dot" />
                <p className="timeline-future-mobile__period">Future</p>
                <p className="timeline-future-mobile__title">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TimelineDrawer node={drawerNode} allNodes={filtered} activeIndex={drawerIndex} onClose={closeDrawer} onNavigate={navigateDrawer} />

      <style>{`
        .sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
        .timeline-desktop ::-webkit-scrollbar { display:none; }
      `}</style>
    </section>
  );
}
