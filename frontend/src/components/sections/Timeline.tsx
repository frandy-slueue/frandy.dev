"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GraduationCap, Briefcase, Award, Star, Clock,
  X, ChevronLeft, ChevronRight, ImageIcon,
} from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import TabBar, { TabItem } from "@/components/ui/TabBar";

// ── Types ─────────────────────────────────────────────────────────────
interface TimelineNode {
  id: string; sort_order: number; period: string; date_label: string;
  title: string; category: string; description: string; image_url: string | null;
}

// ── Fallback hardcoded data ───────────────────────────────────────────
const FALLBACK: TimelineNode[] = [
  { id:"foundation",   sort_order:0, period:"Before", date_label:"",          title:"The Foundation",         category:"Background",     description:"Life before code. A persistent drive to understand how things work and an instinct to build. That mindset was already there — software gave it a direction.", image_url:null },
  { id:"atlas",        sort_order:1, period:"2023",   date_label:"January",   title:"Atlas School of Tulsa",  category:"Education",      description:"Enrolled in an intensive, project-based software engineering program. No lectures — just building, breaking, and figuring it out. The hardest and most formative experience of my engineering life.", image_url:null },
  { id:"first-deploy", sort_order:2, period:"2023",   date_label:"August",    title:"First Deployed Project", category:"Milestone",      description:"First working application shipped to the web. Seeing something I built live on a real URL changed how I thought about what was possible.", image_url:null },
  { id:"advanced",     sort_order:3, period:"2024",   date_label:"March",     title:"Advanced Curriculum",    category:"Education",      description:"React, Next.js, Python, Django, FastAPI, PostgreSQL, Docker. The stack expanded fast. Started understanding not just how to use tools but why certain tools exist.", image_url:null },
  { id:"freelance",    sort_order:4, period:"2024",   date_label:"September", title:"First Freelance Project",category:"Work",           description:"First client project delivered. Real deadline, real feedback, real money. A completely different pressure than school projects — in a good way.", image_url:null },
  { id:"devops",       sort_order:5, period:"2024",   date_label:"November",  title:"DevOps & Docker",        category:"Certifications", description:"Containerisation and deployment workflows. Docker Compose went from intimidating to natural. Started thinking about infrastructure as part of the product.", image_url:null },
  { id:"portfolio",    sort_order:6, period:"2025",   date_label:"February",  title:"Portfolio Launch",       category:"Milestone",      description:"frandy.dev — this portfolio. FastAPI backend, Next.js frontend, five Docker services, four animated themes, a CodeBreeder identity baked into the work layer.", image_url:null },
  { id:"first-role",   sort_order:7, period:"2025",   date_label:"Present",   title:"Seeking First Role",     category:"Work",           description:"Open to full-stack engineering roles and freelance projects. If you are reading this and you have something worth building — I want to hear about it.", image_url:null },
];

const FUTURE_NODES = [
  { label:"First Full-Time Role",     opacity:0.55 },
  { label:"Open Source Contribution", opacity:0.35 },
  { label:"CodeBreeder Launch",        opacity:0.20 },
];

const FILTER_TABS: TabItem[] = ["All","Education","Work","Milestone","Certifications"].map(l=>({ label:l }));

// ── Category config ───────────────────────────────────────────────────
const CAT: Record<string, { icon: React.ReactNode; color: string }> = {
  Education:      { icon:<GraduationCap size={12}/>, color:"#f59e0b" },
  Work:           { icon:<Briefcase size={12}/>,     color:"#10b981" },
  Milestone:      { icon:<Star size={12}/>,          color:"#ef4444" },
  Certifications: { icon:<Award size={12}/>,         color:"#8b5cf6" },
  Background:     { icon:<Clock size={12}/>,         color:"#94a3b8" },
};
function getCat(category: string) { return CAT[category] ?? CAT.Background; }

// ── Fold constants ────────────────────────────────────────────────────
const W_OPEN = 260;
const W_FOLD = 48;
const THRESHOLD = 140;
const SPRING = { type:"spring", stiffness:380, damping:32, mass:0.85 } as const;

// ── Individual fold panel ─────────────────────────────────────────────
function FoldPanel({ node, isActive, onSelect }: {
  node: TimelineNode; isActive: boolean; onSelect: (n: TimelineNode) => void;
}) {
  const [width, setWidth]       = useState(W_OPEN);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const startWRef = useRef(W_OPEN);
  const velRef    = useRef(0);
  const lastXRef  = useRef(0);
  const lastTRef  = useRef(0);
  const movedRef  = useRef(false);

  const cat         = getCat(node.category);
  const isCollapsed = width <= W_FOLD + 4;
  const foldRatio   = 1 - Math.max(0, Math.min(1, (width - W_FOLD) / (W_OPEN - W_FOLD)));
  const creaseOpacity = 0.08 + foldRatio * 0.38;

  const onHandleDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    movedRef.current   = false;
    startXRef.current  = e.clientX;
    startWRef.current  = width;
    velRef.current     = 0;
    lastXRef.current   = e.clientX;
    lastTRef.current   = e.timeStamp;
  }, [width]);

  const onHandleMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    movedRef.current = true;
    const dt = e.timeStamp - lastTRef.current;
    if (dt > 0) velRef.current = (e.clientX - lastXRef.current) / dt;
    lastXRef.current = e.clientX;
    lastTRef.current = e.timeStamp;
    const raw = startWRef.current + (e.clientX - startXRef.current);
    const clamped = raw > W_OPEN
      ? W_OPEN + (raw - W_OPEN) * 0.15
      : raw < W_FOLD
      ? W_FOLD + (raw - W_FOLD) * 0.15
      : raw;
    setWidth(clamped);
  }, [dragging]);

  const onHandleUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const snap = Math.abs(velRef.current) > 0.5
      ? velRef.current > 0 ? W_OPEN : W_FOLD
      : width > THRESHOLD ? W_OPEN : W_FOLD;
    setWidth(snap);
  }, [dragging, width]);

  function handleClick() {
    if (movedRef.current) { movedRef.current = false; return; }
    if (isCollapsed) { setWidth(W_OPEN); return; }
    onSelect(node);
  }

  return (
    <motion.div
      animate={{ width }}
      transition={dragging ? { duration:0 } : SPRING}
      style={{ flexShrink:0, position:"relative", height:"100%", willChange:"width" }}
    >
      {/* Paper face — click anywhere except handle */}
      <div
        onClick={handleClick}
        style={{
          position:"absolute", inset:0,
          background: isActive ? "var(--bg-elevated)" : "var(--bg-secondary)",
          borderRight:"1px solid rgba(255,255,255,0.06)",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
          cursor: isCollapsed ? "e-resize" : "pointer",
          transition:"background 250ms ease",
        }}
      >
        {/* Active corner accents */}
        {isActive && (
          <div style={{
            position:"absolute", inset:-1, pointerEvents:"none", zIndex:4,
            background:`
              linear-gradient(${cat.color},${cat.color}) top left/14px 1.5px no-repeat,
              linear-gradient(${cat.color},${cat.color}) top left/1.5px 14px no-repeat,
              linear-gradient(${cat.color},${cat.color}) bottom right/14px 1.5px no-repeat,
              linear-gradient(${cat.color},${cat.color}) bottom right/1.5px 14px no-repeat`,
          }} />
        )}

        {/* Year + date */}
        <div style={{ padding:"22px 18px 14px", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0, overflow:"hidden", whiteSpace:"nowrap" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"2.1rem", fontWeight:700, letterSpacing:"-0.03em", lineHeight:1, marginBottom:4, color:cat.color }}>
            {node.period}
          </div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", opacity:isCollapsed?0:1, transition:"opacity 0.15s" }}>
            {node.date_label}
          </div>
        </div>

        {/* Spine */}
        <div style={{ height:44, flexShrink:0, position:"relative", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center" }}>
          <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, background:"rgba(255,255,255,0.12)", transform:"translateY(-50%)" }} />
          <div style={{
            position:"absolute", left:18, top:"50%", transform:"translateY(-50%)",
            width:12, height:12, borderRadius:"50%",
            background:cat.color,
            boxShadow: isActive ? `0 0 0 2px ${cat.color}, 0 0 12px ${cat.color}` : `0 0 0 2px ${cat.color}`,
            border:"2px solid var(--bg-primary)", zIndex:2, transition:"box-shadow 0.3s",
          }} />
        </div>

        {/* Body — hidden when collapsed */}
        <div style={{ flex:1, padding:"16px 18px 0", display:"flex", flexDirection:"column", gap:10, overflow:"hidden", opacity:isCollapsed?0:1, transition:"opacity 0.12s" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, color:cat.color, fontFamily:"var(--font-body)", fontSize:"0.6rem", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:600 }}>
            {getCat(node.category).icon}<span>{node.category}</span>
          </div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"0.9rem", fontWeight:600, lineHeight:1.3, color:"var(--text-primary)" }}>{node.title}</div>
          <div style={{ fontFamily:"var(--font-body)", fontSize:"0.72rem", color:"rgba(200,210,220,0.55)", lineHeight:1.6, flex:1, overflow:"hidden" }}>
            {node.description}
          </div>
          {/* Image */}
          <div style={{ height:72, flexShrink:0, marginTop:"auto", marginBottom:16, overflow:"hidden", border:"0.5px solid rgba(255,255,255,0.08)", position:"relative", background:"rgba(255,255,255,0.03)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {node.image_url
              ? <img src={node.image_url} alt={node.title} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.85 }} />
              : <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.6rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.15)" }}>image</span>
            }
          </div>
        </div>

        {/* Collapsed tab */}
        {isCollapsed && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:cat.color, flexShrink:0 }} />
            <div style={{ fontFamily:"var(--font-display)", fontSize:"0.75rem", fontWeight:700, letterSpacing:"0.04em", color:cat.color, writingMode:"vertical-rl", transform:"rotate(180deg)", whiteSpace:"nowrap" }}>
              {node.period}
            </div>
          </div>
        )}

        {/* Crease shadow */}
        {!isCollapsed && (
          <div style={{ position:"absolute", top:0, right:0, bottom:0, width:18, background:`linear-gradient(to right,transparent,rgba(0,0,0,${creaseOpacity}))`, pointerEvents:"none", zIndex:3, transition:dragging?"none":"opacity 0.3s" }} />
        )}
      </div>

      {/* Drag handle */}
      <div
        onPointerDown={onHandleDown}
        onPointerMove={onHandleMove}
        onPointerUp={onHandleUp}
        onPointerCancel={onHandleUp}
        style={{ position:"absolute", top:0, right:0, bottom:0, width:20, cursor:"ew-resize", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", touchAction:"none" }}
      >
        <div style={{ width:4, height:dragging?48:36, borderRadius:2, background:dragging?cat.color:"rgba(255,255,255,0.12)", transition:"height 0.2s,background 0.2s" }} />
      </div>
    </motion.div>
  );
}

// ── Future ghost ──────────────────────────────────────────────────────
function FutureFold({ label, opacity }: { label:string; opacity:number }) {
  return (
    <div style={{ flexShrink:0, width:W_OPEN, height:"100%", opacity, position:"relative", borderRight:"1px solid rgba(255,255,255,0.04)", background:"#161616", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"22px 18px 14px", borderBottom:"1px solid rgba(255,255,255,0.04)", flexShrink:0 }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:"2.1rem", fontWeight:700, color:"rgba(255,255,255,0.1)", marginBottom:4 }}>Soon</div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.08)" }}>Future</div>
      </div>
      <div style={{ height:44, flexShrink:0, position:"relative", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"flex", alignItems:"center" }}>
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, background:"rgba(255,255,255,0.06)", transform:"translateY(-50%)" }} />
        <div style={{ position:"absolute", left:18, top:"50%", transform:"translateY(-50%)", width:12, height:12, borderRadius:"50%", border:"1px dashed rgba(255,255,255,0.12)", background:"transparent", zIndex:2 }} />
      </div>
      <div style={{ flex:1, padding:"16px 18px", display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:"0.9rem", fontWeight:600, color:"rgba(255,255,255,0.15)" }}>{label}</div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.6rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.1)" }}>Coming soon</div>
      </div>
      <div style={{ height:72, flexShrink:0, margin:"0 18px 16px", border:"0.5px dashed rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <ImageIcon size={14} style={{ color:"rgba(255,255,255,0.1)" }} />
      </div>
    </div>
  );
}

// ── Side panel — slides in from right (like project detail) ───────────
function TimelinePanel({ node, allNodes, index, onClose, onNavigate }: {
  node: TimelineNode | null; allNodes: TimelineNode[]; index: number;
  onClose: () => void; onNavigate: (i: number) => void;
}) {
  const cat = node ? getCat(node.category) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.25 }}
            onClick={onClose}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:39 }}
          />
          <motion.aside
            key="panel"
            initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
            transition={SPRING}
            style={{ position:"fixed", top:72, right:0, bottom:0, width:"min(480px,100vw)", background:"var(--bg-elevated)", borderLeft:"1px solid var(--border)", zIndex:40, display:"flex", flexDirection:"column", overflowY:"auto" }}
          >
            {/* dframe inner frame */}
            <div style={{ position:"absolute", inset:4, border:"1px solid rgba(255,255,255,0.04)", borderRadius:6, pointerEvents:"none", zIndex:0 }} />
            {/* dframe corner accents */}
            <div style={{ position:"absolute", inset:-1, pointerEvents:"none", zIndex:2, background:`
              linear-gradient(var(--accent),var(--accent)) top left/14px 1.5px no-repeat,
              linear-gradient(var(--accent),var(--accent)) top left/1.5px 14px no-repeat,
              linear-gradient(var(--accent),var(--accent)) bottom right/14px 1.5px no-repeat,
              linear-gradient(var(--accent),var(--accent)) bottom right/1.5px 14px no-repeat` }} />

            {/* Close */}
            <button onClick={onClose} className="project-detail__close" aria-label="Close">
              <X size={16} />
            </button>

            {/* Content */}
            <div style={{ padding:"0 28px 32px", position:"relative", zIndex:1, flex:1 }}>
              {/* Image */}
              <div style={{ height:200, background:"var(--bg-secondary)", border:"1px solid var(--border-subtle)", marginBottom:24, overflow:"hidden", position:"relative" }}>
                {node.image_url
                  ? <img src={node.image_url} alt={node.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <ImageIcon size={28} style={{ color:"var(--border)" }} />
                      <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--border)" }}>No image added yet</span>
                    </div>
                }
              </div>

              {/* Meta */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, color:cat?.color, fontFamily:"var(--font-body)", fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:600, marginBottom:8 }}>
                {cat?.icon}
                <span>{node.category}{node.period ? ` · ${node.period}` : ""}{node.date_label ? ` · ${node.date_label}` : ""}</span>
              </div>

              {/* Title */}
              <h3 className="project-detail__title">{node.title}</h3>

              {/* Category badge */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", background:`${cat?.color}18`, border:`1px solid ${cat?.color}33`, marginBottom:20, fontFamily:"var(--font-body)", fontSize:"11px", letterSpacing:"0.08em", textTransform:"uppercase", color:cat?.color, fontWeight:600 }}>
                {cat?.icon}{node.category}
              </div>

              <p className="project-detail__body">{node.description}</p>
            </div>

            {/* Prev / Next */}
            <div style={{ position:"sticky", bottom:0, background:"var(--bg-elevated)", borderTop:"1px solid var(--border-subtle)", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, zIndex:2, flexShrink:0 }}>
              {[
                { show: index > 0,                   dir:-1, icon:<ChevronLeft size={14}/>,  label: allNodes[index-1]?.title ?? "", align:"flex-start" },
                { show: index < allNodes.length - 1, dir:+1, icon:<ChevronRight size={14}/>, label: allNodes[index+1]?.title ?? "", align:"flex-end" },
              ].map(({ show, dir, icon, label, align }, i) => (
                <button key={i}
                  onClick={() => show && onNavigate(index + dir)}
                  disabled={!show}
                  style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"1px solid var(--border)", padding:"8px 14px", cursor:show?"pointer":"not-allowed", opacity:show?1:0.3, color:"var(--text-muted)", fontFamily:"var(--font-body)", fontSize:"12px", letterSpacing:"0.08em", textTransform:"uppercase", transition:"border-color 0.2s,color 0.2s", flex:1, justifyContent:align as "flex-start"|"flex-end" }}
                  onMouseEnter={e=>{ if(show){ e.currentTarget.style.borderColor="var(--accent-muted)"; e.currentTarget.style.color="var(--text-primary)"; }}}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-muted)"; }}
                >
                  {dir === -1 && icon}
                  <span style={{ maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{label}</span>
                  {dir === +1 && icon}
                </button>
              ))}
              <div style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"var(--text-muted)", letterSpacing:"0.06em", whiteSpace:"nowrap", flexShrink:0 }}>
                {index + 1} / {allNodes.length}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Mobile node ───────────────────────────────────────────────────────
function MobileNode({ node, index, isExpanded, onToggle, onOpen }: {
  node: TimelineNode; index: number; isExpanded: boolean;
  onToggle: () => void; onOpen: (n: TimelineNode, i: number) => void;
}) {
  const cat = getCat(node.category);
  return (
    <motion.div layout initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} transition={{ duration:0.3, delay:index*0.04 }}
      style={{ position:"relative", marginBottom:28, cursor:"pointer" }} onClick={onToggle}>
      <div style={{ position:"absolute", left:-28, top:4, width:12, height:12, borderRadius:"50%", background:cat.color, boxShadow:`0 0 8px ${cat.color}`, border:"2px solid var(--bg-primary)", transition:"transform 0.25s", transform:isExpanded?"scale(1.35)":"scale(1)" }} />
      <p className="timeline-node-mobile__period">{node.period}{node.date_label ? ` · ${node.date_label}` : ""}</p>
      <div className="timeline-node-mobile__badge" style={{ color:cat.color }}>
        <span aria-hidden>{cat.icon}</span>
        <span className="timeline-node__badge-text">{node.category}</span>
      </div>
      <p className="timeline-node-mobile__title">{node.title}</p>
      <span className="timeline-node-mobile__toggle">{isExpanded ? "— collapse" : "+ expand"}</span>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} transition={{ duration:0.3 }} style={{ overflow:"hidden" }}>
            <p className="timeline-node-mobile__desc">{node.description}</p>
            {node.image_url && (
              <div style={{ marginTop:12, height:100, overflow:"hidden" }}>
                <img src={node.image_url} alt={node.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              </div>
            )}
            <button onClick={e=>{ e.stopPropagation(); onOpen(node, index); }}
              style={{ marginTop:10, background:"none", border:"none", padding:0, fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:cat.color, cursor:"pointer" }}>
              + Read more
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function Timeline() {
  const [nodes, setNodes]               = useState<TimelineNode[]>(FALLBACK);
  const [filter, setFilter]             = useState("All");
  const [panelNode, setPanelNode]       = useState<TimelineNode | null>(null);
  const [panelIndex, setPanelIndex]     = useState(0);
  const [expandedMobile, setExpandMob]  = useState<string | null>(null);
  // hydration-safe scroll arrows — start both false, set on mount
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);
  const trackRef  = useRef<HTMLDivElement>(null);
  const isDragRef = useRef(false);
  const startXRef = useRef(0);
  const scrollRef = useRef(0);
  const movedRef  = useRef(false);

  useEffect(() => {
    fetch("/api/timeline")
      .then(r => r.json())
      .then((data: TimelineNode[]) => { if (data?.length) setNodes(data); })
      .catch(() => {});
  }, []);

  const filtered = filter === "All" ? nodes : nodes.filter(n => n.category === filter);

  function openPanel(node: TimelineNode) {
    const idx = filtered.findIndex(n => n.id === node.id);
    setPanelNode(node); setPanelIndex(idx);
  }
  function navigate(idx: number) {
    if (idx < 0 || idx >= filtered.length) return;
    setPanelNode(filtered[idx]); setPanelIndex(idx);
  }

  function checkScroll() {
    const el = trackRef.current; if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  // Set initial scroll state after mount (hydration-safe)
  useEffect(() => { checkScroll(); }, [filtered.length]);

  function onDown(e: React.MouseEvent) {
    isDragRef.current = true; movedRef.current = false;
    startXRef.current = e.pageX;
    scrollRef.current = trackRef.current?.scrollLeft ?? 0;
  }
  function onMove(e: React.MouseEvent) {
    if (!isDragRef.current) return;
    const dx = e.pageX - startXRef.current;
    if (Math.abs(dx) > 4) movedRef.current = true;
    if (trackRef.current) { trackRef.current.scrollLeft = scrollRef.current - dx; checkScroll(); }
  }
  function onUp() { isDragRef.current = false; }

  function scrollBy(dir: number) {
    trackRef.current?.scrollBy({ left: dir * W_OPEN, behavior:"smooth" });
    setTimeout(checkScroll, 350);
  }

  return (
    <section id="timeline" className="section-pad" aria-labelledby="timeline-heading" style={{ backgroundColor:"var(--bg-primary)" }}>
      <div className="site-container">
        <SectionLabel>04 — Timeline</SectionLabel>
        <h2 id="timeline-heading" className="sr-only">Timeline</h2>
        <TabBar tabs={FILTER_TABS} active={filter} onChange={label => { setFilter(label); setPanelNode(null); setExpandMob(null); }} />
      </div>

      {/* ── Desktop — folded paper ── */}
      <div className="timeline-desktop" style={{ position:"relative" }}>
        {/* Left arrow */}
        {canLeft && (
          <button onClick={() => scrollBy(-1)} aria-label="Scroll left"
            style={{ position:"absolute", top:0, bottom:0, left:0, width:32, zIndex:10, background:"var(--bg-primary)", border:"none", borderRight:"1px solid var(--border)", cursor:"pointer", color:"var(--text-muted)", display:"flex", alignItems:"center", justifyContent:"center" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}>
            <ChevronLeft size={16} />
          </button>
        )}
        {canLeft && <div style={{ position:"absolute", left:32, top:0, bottom:0, width:40, background:"linear-gradient(to right,var(--bg-primary),transparent)", pointerEvents:"none", zIndex:5 }} />}

        {/* Track */}
        <div ref={trackRef} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onScroll={checkScroll}
          style={{ overflowX:"auto", overflowY:"hidden", scrollbarWidth:"none", cursor:"grab", paddingLeft:canLeft?32:0, paddingRight:canRight?32:0 }}>
          <div style={{ display:"flex", height:480, minWidth:"max-content" }}>
            <AnimatePresence mode="popLayout">
              {filtered.map(node => (
                <FoldPanel key={node.id} node={node} isActive={panelNode?.id === node.id} onSelect={openPanel} />
              ))}
            </AnimatePresence>
            {filter === "All" && FUTURE_NODES.map((f, i) => (
              <FutureFold key={`f-${i}`} label={f.label} opacity={f.opacity} />
            ))}
          </div>
        </div>

        {canRight && <div style={{ position:"absolute", right:32, top:0, bottom:0, width:40, background:"linear-gradient(to left,var(--bg-primary),transparent)", pointerEvents:"none", zIndex:5 }} />}
        {/* Right arrow */}
        {canRight && (
          <button onClick={() => scrollBy(1)} aria-label="Scroll right"
            style={{ position:"absolute", top:0, bottom:0, right:0, width:32, zIndex:10, background:"var(--bg-primary)", border:"none", borderLeft:"1px solid var(--border)", cursor:"pointer", color:"var(--text-muted)", display:"flex", alignItems:"center", justifyContent:"center" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}>
            <ChevronRight size={16} />
          </button>
        )}

        <p style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--border)", textAlign:"center", marginTop:10 }}>
          drag edge to fold · click panel to read · arrows to scroll
        </p>
      </div>

      {/* ── Mobile ── */}
      <div className="timeline-mobile">
        <div className="site-container">
          <div className="timeline-mobile-list">
            <div className="timeline-mobile-spine" aria-hidden />
            <AnimatePresence mode="popLayout">
              {filtered.map((node, i) => (
                <MobileNode key={node.id} node={node} index={i}
                  isExpanded={expandedMobile === node.id}
                  onToggle={() => setExpandMob(expandedMobile === node.id ? null : node.id)}
                  onOpen={(n, idx) => openPanel(n)} />
              ))}
            </AnimatePresence>
            {filter === "All" && FUTURE_NODES.slice(0, 3).map((f, i) => (
              <div key={`fm-${i}`} className="timeline-future-mobile" style={{ opacity:Math.max(0.06, 0.25 - i * 0.07) }}>
                <div className="timeline-future-mobile__dot" />
                <p className="timeline-future-mobile__period">Future</p>
                <p className="timeline-future-mobile__title">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side panel */}
      <TimelinePanel node={panelNode} allNodes={filtered} index={panelIndex} onClose={() => setPanelNode(null)} onNavigate={navigate} />

      <style>{`
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
        .timeline-desktop ::-webkit-scrollbar{display:none;}
      `}</style>
    </section>
  );
}
