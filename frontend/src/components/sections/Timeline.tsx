"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, Award, Star, Clock } from "lucide-react";

const CATEGORIES = ["All", "Education", "Work", "Milestone", "Certifications"];

type NodeCategory = "Education" | "Work" | "Milestone" | "Certifications" | "Background";

interface TimelineNode {
  id: string;
  period: string;
  title: string;
  category: NodeCategory;
  description: string;
  future?: boolean;
}

const NODES: TimelineNode[] = [
  {
    id: "foundation",
    period: "Before",
    title: "The Foundation",
    category: "Background",
    description:
      "Life before code. A persistent drive to understand how things work and an instinct to build. That mindset was already there — software gave it a direction.",
  },
  {
    id: "atlas",
    period: "2023",
    title: "Atlas School of Tulsa",
    category: "Education",
    description:
      "Enrolled in an intensive, project-based software engineering program. No lectures — just building, breaking, and figuring it out. The hardest and most formative experience of my engineering life.",
  },
  {
    id: "first-deploy",
    period: "2023",
    title: "First Deployed Project",
    category: "Milestone",
    description:
      "First working application shipped to the web. Seeing something I built live on a real URL changed how I thought about what was possible.",
  },
  {
    id: "advanced",
    period: "2024",
    title: "Advanced Curriculum",
    category: "Education",
    description:
      "React, Next.js, Python, Django, FastAPI, PostgreSQL, Docker. The stack expanded fast. Started understanding not just how to use tools but why certain tools exist.",
  },
  {
    id: "freelance",
    period: "2024",
    title: "First Freelance Project",
    category: "Work",
    description:
      "First client project delivered. Real deadline, real feedback, real money. A completely different pressure than school projects — in a good way.",
  },
  {
    id: "devops",
    period: "2024",
    title: "DevOps & Docker",
    category: "Certifications",
    description:
      "Containerisation and deployment workflows. Docker Compose went from intimidating to natural. Started thinking about infrastructure as part of the product.",
  },
  {
    id: "portfolio",
    period: "2025",
    title: "Portfolio Launch",
    category: "Milestone",
    description:
      "frandy.dev — this portfolio. FastAPI backend, Next.js frontend, five Docker services, four animated themes, a CodeBreeder identity baked into the work layer. The most complete thing I have built.",
  },
  {
    id: "first-role",
    period: "2025",
    title: "Seeking First Role",
    category: "Work",
    description:
      "Open to full-stack engineering roles and freelance projects. If you are reading this and you have something worth building — I want to hear about it.",
  },
];

const FUTURE_NODES = [
  "First Full-Time Role",
  "Open Source Contribution",
  "CodeBreeder Launch",
  "Team Lead",
  "Building Something Big",
  "What Comes Next",
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Education:      <GraduationCap size={14} />,
  Work:           <Briefcase size={14} />,
  Milestone:      <Star size={14} />,
  Certifications: <Award size={14} />,
  Background:     <Clock size={14} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Education:      "var(--accent)",
  Work:           "#4a9eff",
  Milestone:      "#d4842a",
  Certifications: "#3d9970",
  Background:     "var(--accent-muted)",
};

export default function Timeline() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterPill, setFilterPill] = useState({ left: 0, width: 0 });
  const filterRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [pulseProgress, setPulseProgress] = useState(0);

  useEffect(() => {
    const idx = CATEGORIES.indexOf(activeFilter);
    const el = filterRefs.current[idx];
    const bar = filterBarRef.current;
    if (!el || !bar) return;
    const barRect = bar.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setFilterPill({ left: elRect.left - barRect.left, width: elRect.width });
  }, [activeFilter]);

  // EKG pulse animation
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 3000;

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) % duration;
      setPulseProgress(elapsed / duration);
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const filtered =
    activeFilter === "All"
      ? NODES
      : NODES.filter((n) => n.category === activeFilter);

  const toggle = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <section
      id="timeline"
      className="section-pad"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="site-container">

        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "var(--accent-muted)",
            marginBottom: "48px",
          }}
        >
          04 — Timeline
        </motion.p>

        {/* Filter bar */}
        <div style={{ position: "relative", marginBottom: "56px", overflowX: "auto", paddingBottom: "4px" }}>
          <div
            ref={filterBarRef}
            style={{
              position: "relative",
              display: "inline-flex",
              border: "1px solid var(--border)",
              padding: "4px",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "4px",
                bottom: "4px",
                left: filterPill.left,
                width: filterPill.width,
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--accent-muted)",
                transition: "left 500ms cubic-bezier(0.22,1,0.36,1), width 500ms cubic-bezier(0.22,1,0.36,1)",
                pointerEvents: "none",
              }}
            />
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                ref={(el) => { filterRefs.current[i] = el; }}
                onClick={() => setActiveFilter(cat)}
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: "10px 20px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: activeFilter === cat ? "var(--accent)" : "var(--text-muted)",
                  transition: "color 300ms ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {cat !== "All" && (
                  <span style={{
                    color: activeFilter === cat ? "var(--accent)" : "var(--text-muted)",
                    display: "flex", alignItems: "center",
                    transition: "color 300ms ease",
                  }}>
                    {CATEGORY_ICONS[cat]}
                  </span>
                )}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop timeline — horizontal */}
        <div className="timeline-desktop">

          {/* EKG pulse SVG spine */}
          <div style={{ position: "relative", marginBottom: "32px", height: "40px" }}>
            <svg
              ref={svgRef}
              width="100%"
              height="40"
              style={{ overflow: "visible" }}
            >
              {/* Base line */}
              <line
                x1="0" y1="20" x2="100%" y2="20"
                stroke="var(--border)"
                strokeWidth="1"
              />
              {/* EKG waveform overlay */}
              <polyline
                points={`
                  0,20
                  5%,20
                  8%,20 9%,5 10%,35 11%,10 12%,20
                  25%,20
                  28%,20 29%,5 30%,35 31%,10 32%,20
                  50%,20
                  53%,20 54%,5 55%,35 56%,10 57%,20
                  75%,20
                  78%,20 79%,5 80%,35 81%,10 82%,20
                  100%,20
                `}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                opacity="0.3"
              />
              {/* Traveling pulse dot */}
              <circle
                cx={`${pulseProgress * 100}%`}
                cy="20"
                r="3"
                fill="var(--accent)"
                opacity="0.8"
              />
              <circle
                cx={`${pulseProgress * 100}%`}
                cy="20"
                r="6"
                fill="var(--accent)"
                opacity="0.15"
              />
            </svg>
          </div>

          {/* Nodes */}
          <div
            style={{
              display: "flex",
              gap: "0",
              overflowX: "auto",
              paddingBottom: "16px",
            }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((node, i) => (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  style={{
                    flex: "0 0 auto",
                    width: "200px",
                    borderLeft: "1px solid var(--border)",
                    padding: "0 0 0 16px",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => toggle(node.id)}
                >
                  {/* Node dot on the line */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-40px",
                      left: "-5px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: CATEGORY_COLORS[node.category],
                      border: "2px solid var(--bg-primary)",
                      boxShadow: `0 0 8px ${CATEGORY_COLORS[node.category]}`,
                      transition: "transform 250ms ease",
                      transform: expanded === node.id ? "scale(1.4)" : "scale(1)",
                    }}
                  />

                  {/* Period */}
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                    }}
                  >
                    {node.period}
                  </p>

                  {/* Category badge */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: CATEGORY_COLORS[node.category], display: "flex", alignItems: "center" }}>
                      {CATEGORY_ICONS[node.category]}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "10px",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: CATEGORY_COLORS[node.category],
                      }}
                    >
                      {node.category}
                    </span>
                  </div>

                  {/* Title */}
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "18px",
                      color: "var(--text-primary)",
                      letterSpacing: "1px",
                      lineHeight: 1.1,
                      marginBottom: "8px",
                    }}
                  >
                    {node.title}
                  </p>

                  {/* Expand indicator */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--border)",
                      letterSpacing: "1px",
                    }}
                  >
                    {expanded === node.id ? "— collapse" : "+ expand"}
                  </span>

                  {/* Expanded description */}
                  <AnimatePresence>
                    {expanded === node.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "13px",
                            color: "var(--text-muted)",
                            lineHeight: 1.7,
                            marginTop: "12px",
                            paddingTop: "12px",
                            borderTop: "1px solid var(--border-subtle)",
                          }}
                        >
                          {node.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Future ghost nodes */}
            {activeFilter === "All" &&
              FUTURE_NODES.map((label, i) => (
                <div
                  key={`future-${i}`}
                  style={{
                    flex: "0 0 auto",
                    width: "160px",
                    borderLeft: "1px dashed var(--border-subtle)",
                    padding: "0 0 0 16px",
                    opacity: 0.3 - i * 0.04,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      marginTop: "-40px",
                      marginLeft: "-5px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      border: "1px dashed var(--border)",
                      backgroundColor: "transparent",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      color: "var(--border)",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                    }}
                  >
                    Future
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "16px",
                      color: "var(--border)",
                      letterSpacing: "1px",
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Mobile timeline — vertical */}
        <div className="timeline-mobile">
          <div style={{ position: "relative", paddingLeft: "32px" }}>
            {/* Vertical spine */}
            <div
              style={{
                position: "absolute",
                left: "8px",
                top: 0,
                bottom: 0,
                width: "1px",
                backgroundColor: "var(--border)",
              }}
            />

            <AnimatePresence mode="popLayout">
              {filtered.map((node, i) => (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  style={{
                    position: "relative",
                    marginBottom: "32px",
                    cursor: "pointer",
                  }}
                  onClick={() => toggle(node.id)}
                >
                  {/* Node dot */}
                  <div
                    style={{
                      position: "absolute",
                      left: "-28px",
                      top: "4px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: CATEGORY_COLORS[node.category],
                      border: "2px solid var(--bg-primary)",
                      boxShadow: `0 0 8px ${CATEGORY_COLORS[node.category]}`,
                      transform: expanded === node.id ? "scale(1.4)" : "scale(1)",
                      transition: "transform 250ms ease",
                    }}
                  />

                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      color: "var(--text-muted)",
                      marginBottom: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    {node.period}
                  </p>

                  <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
                    <span style={{ color: CATEGORY_COLORS[node.category], display: "flex", alignItems: "center" }}>
                      {CATEGORY_ICONS[node.category]}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "10px",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: CATEGORY_COLORS[node.category],
                      }}
                    >
                      {node.category}
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "20px",
                      color: "var(--text-primary)",
                      letterSpacing: "1px",
                      lineHeight: 1.1,
                      marginBottom: "6px",
                    }}
                  >
                    {node.title}
                  </p>

                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--border)", letterSpacing: "1px" }}>
                    {expanded === node.id ? "— collapse" : "+ expand"}
                  </span>

                  <AnimatePresence>
                    {expanded === node.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "14px",
                            color: "var(--text-muted)",
                            lineHeight: 1.7,
                            marginTop: "12px",
                            paddingTop: "12px",
                            borderTop: "1px solid var(--border-subtle)",
                          }}
                        >
                          {node.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Future ghost nodes — mobile */}
            {activeFilter === "All" &&
              FUTURE_NODES.slice(0, 3).map((label, i) => (
                <div
                  key={`future-m-${i}`}
                  style={{
                    position: "relative",
                    marginBottom: "24px",
                    opacity: 0.25 - i * 0.06,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "-28px",
                      top: "4px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      border: "1px dashed var(--border)",
                    }}
                  />
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "2px", color: "var(--border)", marginBottom: "4px", textTransform: "uppercase" }}>
                    Future
                  </p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--border)", letterSpacing: "1px" }}>
                    {label}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      <style>{`
        .timeline-desktop { display: block; }
        .timeline-mobile  { display: none; }
        @media (max-width: 768px) {
          .timeline-desktop { display: none; }
          .timeline-mobile  { display: block; }
        }
      `}</style>
    </section>
  );
}
