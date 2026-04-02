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
interface TNode {
  id: string; sort_order: number; period: string; date_label: string;
  title: string; category: string; description: string; image_url: string | null;
}

// ── Fallback data ─────────────────────────────────────────────────────
const FALLBACK: TNode[] = [
  { id:"foundation",   sort_order:0, period:"Before", date_label:"",          title:"The Foundation",         category:"Background",     description:"Life before code. A persistent drive to understand how things work and an instinct to build. That mindset was already there — software gave it a direction.", image_url:null },
  { id:"atlas",        sort_order:1, period:"2023",   date_label:"January",   title:"Atlas School of Tulsa",  category:"Education",      description:"Enrolled in an intensive, project-based software engineering program. No lectures — just building, breaking, and figuring it out. The hardest and most formative experience of my engineering life.", image_url:null },
  { id:"first-deploy", sort_order:2, period:"2023",   date_label:"August",    title:"First Deployed Project", category:"Milestone",      description:"First working application shipped to the web. Seeing something I built live on a real URL changed how I thought about what was possible.", image_url:null },
  { id:"advanced",     sort_order:3, period:"2024",   date_label:"March",     title:"Advanced Curriculum",    category:"Education",      description:"React, Next.js, Python, Django, FastAPI, PostgreSQL, Docker. The stack expanded fast. Started understanding not just how to use tools but why certain tools exist.", image_url:null },
  { id:"freelance",    sort_order:4, period:"2024",   date_label:"September", title:"First Freelance Project",category:"Work",           description:"First client project delivered. Real deadline, real feedback, real money. A completely different pressure than school projects — in a good way.", image_url:null },
  { id:"devops",       sort_order:5, period:"2024",   date_label:"November",  title:"DevOps & Docker",        category:"Certifications", description:"Containerisation and deployment workflows. Docker Compose went from intimidating to natural. Started thinking about infrastructure as part of the product.", image_url:null },
  { id:"portfolio",    sort_order:6, period:"2025",   date_label:"February",  title:"Portfolio Launch",       category:"Milestone",      description:"frandy.dev — this portfolio. FastAPI backend, Next.js frontend, five Docker services, four animated themes, a CodeBreeder identity baked into the work layer.", image_url:null },
  { id:"first-role",   sort_order:7, period:"2025",   date_label:"Present",   title:"Seeking First Role",     category:"Work",           description:"Open to full-stack engineering roles and freelance projects. If you are reading this and you have something worth building — I want to hear about it.", image_url:null },
];

const FUTURE = [
  "First Full-Time Role", "Open Source Contribution", "CodeBreeder Launch",
];

const FILTER_TABS: TabItem[] = ["All","Education","Work","Milestone","Certifications"].map(l=>({label:l}));

// ── Category meta ─────────────────────────────────────────────────────
const CAT: Record<string,{icon:React.ReactNode;color:string}> = {
  Education:      { icon:<GraduationCap size={12}/>, color:"#f59e0b" },
  Work:           { icon:<Briefcase size={12}/>,     color:"#10b981" },
  Milestone:      { icon:<Star size={12}/>,          color:"#ef4444" },
  Certifications: { icon:<Award size={12}/>,         color:"#8b5cf6" },
  Background:     { icon:<Clock size={12}/>,         color:"#94a3b8" },
};
const getCat = (c:string) => CAT[c] ?? CAT.Background;

// ── Dimensions ────────────────────────────────────────────────────────
const W_OPEN   = 240;  // expanded panel width
const W_STACK  = 44;   // collapsed "tab" width — tight for stacking effect
const SNAP_AT  = 130;  // snap threshold
const SPRING   = { type:"spring", stiffness:420, damping:36, mass:0.8 } as const;
const H_TRACK  = 460;  // fixed track height

// ── Fold panel ────────────────────────────────────────────────────────
function FoldPanel({ node, stackDepth, isActive, onExpand, onOpenPanel }: {
  node: TNode;
  stackDepth: number;  // how many collapsed panels follow this one (for shadow depth)
  isActive: boolean;
  onExpand: () => void;
  onOpenPanel: (n: TNode) => void;
}) {
  const [width, setWidth]         = useState(W_OPEN);
  const [dragging, setDragging]   = useState(false);
  const startXRef  = useRef(0);
  const startWRef  = useRef(W_OPEN);
  const velRef     = useRef(0);
  const lastXRef   = useRef(0);
  const lastTRef   = useRef(0);
  const movedRef   = useRef(false);

  const cat         = getCat(node.category);
  const isCollapsed = width <= W_STACK + 6;

  // Shadow layers simulate card stack depth behind this collapsed panel
  const stackShadow = isCollapsed && stackDepth > 0
    ? Array.from({ length: Math.min(stackDepth, 3) }, (_, i) => {
        const offset = (i + 1) * 5;
        const dim    = 1 - (i + 1) * 0.18;
        return `${offset}px ${offset}px 0 rgba(0,0,0,${0.55 - i * 0.12}), ${offset}px ${offset}px 0 rgba(255,255,255,${0.025 * dim})`;
      }).join(", ")
    : "none";

  const foldRatio     = 1 - Math.max(0, Math.min(1, (width - W_STACK) / (W_OPEN - W_STACK)));
  const creaseOpacity = 0.06 + foldRatio * 0.32;

  const onHandleDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true); movedRef.current = false;
    startXRef.current = e.clientX; startWRef.current = width;
    velRef.current = 0; lastXRef.current = e.clientX; lastTRef.current = e.timeStamp;
  }, [width]);

  const onHandleMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    movedRef.current = true;
    const dt = e.timeStamp - lastTRef.current;
    if (dt > 0) velRef.current = (e.clientX - lastXRef.current) / dt;
    lastXRef.current = e.clientX; lastTRef.current = e.timeStamp;
    const raw = startWRef.current + (e.clientX - startXRef.current);
    setWidth(raw > W_OPEN ? W_OPEN + (raw - W_OPEN) * 0.12 : raw < W_STACK ? W_STACK + (raw - W_STACK) * 0.12 : raw);
  }, [dragging]);

  const onHandleUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const snap = Math.abs(velRef.current) > 0.5
      ? velRef.current > 0 ? W_OPEN : W_STACK
      : width > SNAP_AT ? W_OPEN : W_STACK;
    setWidth(snap);
  }, [dragging, width]);

  function handleClick() {
    if (movedRef.current) { movedRef.current = false; return; }
    if (isCollapsed) { setWidth(W_OPEN); onExpand(); }
    else             { onOpenPanel(node); }
  }

  return (
    <motion.div
      animate={{ width }}
      transition={dragging ? { duration:0 } : SPRING}
      style={{
        flexShrink: 0,
        position: "relative",
        height: "100%",
        willChange: "width",
        // Stack depth shadow — only on collapsed panels
        filter: isCollapsed && stackDepth > 0
          ? `drop-shadow(${Math.min(stackDepth,3)*5}px ${Math.min(stackDepth,3)*5}px 0 rgba(0,0,0,0.5))`
          : "none",
        zIndex: isCollapsed ? 1 : 2,
        transition: dragging ? "none" : "filter 0.4s ease",
      }}
    >
      {/* Paper face */}
      <div
        onClick={handleClick}
        style={{
          position:"absolute", inset:0,
          background: isActive
            ? "linear-gradient(160deg, var(--bg-elevated) 0%, var(--bg-secondary) 100%)"
            : "var(--bg-secondary)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          borderLeft:  isActive ? `2px solid ${cat.color}` : "none",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
          cursor: isCollapsed ? "e-resize" : "pointer",
          transition:"background 300ms ease, border-color 300ms ease",
          // 3-D depth: top-left light, bottom-right dark
          boxShadow: isCollapsed
            ? `inset 1px 0 0 rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)`
            : "none",
        }}
      >
        {/* Active accent corners */}
        {isActive && (
          <div style={{ position:"absolute", inset:-1, pointerEvents:"none", zIndex:4,
            background:`
              linear-gradient(${cat.color},${cat.color}) top left/12px 1.5px no-repeat,
              linear-gradient(${cat.color},${cat.color}) top left/1.5px 12px no-repeat,
              linear-gradient(${cat.color},${cat.color}) bottom right/12px 1.5px no-repeat,
              linear-gradient(${cat.color},${cat.color}) bottom right/1.5px 12px no-repeat` }} />
        )}

        {/* ── Year header ── */}
        <div style={{ padding:"20px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0, overflow:"hidden", whiteSpace:"nowrap" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"2rem", fontWeight:700, letterSpacing:"-0.02em", lineHeight:1, color:cat.color, marginBottom:3 }}>
            {node.period}
          </div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.65rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", opacity:isCollapsed?0:1, transition:"opacity 0.12s" }}>
            {node.date_label || node.category}
          </div>
        </div>

        {/* ── Spine row ── */}
        <div style={{ height:40, flexShrink:0, position:"relative", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center" }}>
          <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, background:"rgba(255,255,255,0.1)", transform:"translateY(-50%)" }} />
          <div style={{
            position:"absolute", left:16, top:"50%", transform:"translateY(-50%)",
            width:11, height:11, borderRadius:"50%",
            background:cat.color,
            boxShadow: isActive ? `0 0 0 3px ${cat.color}40, 0 0 14px ${cat.color}80` : `0 0 0 2px ${cat.color}50`,
            border:"2px solid var(--bg-primary)", zIndex:2, transition:"box-shadow 0.35s",
          }} />
        </div>

        {/* ── Body ── */}
        <div style={{ flex:1, padding:"14px 16px 0", display:"flex", flexDirection:"column", gap:8, overflow:"hidden", opacity:isCollapsed?0:1, transition:"opacity 0.1s" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, color:cat.color, fontFamily:"var(--font-body)", fontSize:"0.58rem", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700 }}>
            {getCat(node.category).icon}<span>{node.category}</span>
          </div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"0.88rem", fontWeight:600, lineHeight:1.25, color:"var(--text-primary)" }}>{node.title}</div>
          <div style={{ fontFamily:"var(--font-body)", fontSize:"0.7rem", color:"rgba(200,210,220,0.5)", lineHeight:1.6, flex:1, overflow:"hidden" }}>
            {node.description}
          </div>
          {/* Image */}
          <div style={{ height:64, flexShrink:0, marginTop:"auto", marginBottom:14, overflow:"hidden", border:"0.5px solid rgba(255,255,255,0.07)", position:"relative", background:"rgba(255,255,255,0.025)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {node.image_url
              ? <img src={node.image_url} alt={node.title} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.8 }} />
              : <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.55rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.12)" }}>no image</span>
            }
          </div>
        </div>

        {/* ── Collapsed tab — vertical year + dot ── */}
        {isCollapsed && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:cat.color, boxShadow:`0 0 6px ${cat.color}`, flexShrink:0 }} />
            <div style={{ fontFamily:"var(--font-display)", fontSize:"0.72rem", fontWeight:700, color:cat.color, writingMode:"vertical-rl", transform:"rotate(180deg)", whiteSpace:"nowrap", letterSpacing:"0.06em" }}>
              {node.period}
            </div>
          </div>
        )}

        {/* Crease shadow */}
        {!isCollapsed && (
          <div style={{ position:"absolute", top:0, right:0, bottom:0, width:16, background:`linear-gradient(to right,transparent,rgba(0,0,0,${creaseOpacity}))`, pointerEvents:"none", zIndex:3 }} />
        )}
      </div>

      {/* Drag handle */}
      <div
        onPointerDown={onHandleDown} onPointerMove={onHandleMove}
        onPointerUp={onHandleUp}    onPointerCancel={onHandleUp}
        onClick={e=>e.stopPropagation()}
        style={{ position:"absolute", top:0, right:0, bottom:0, width:18, cursor:"ew-resize", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", touchAction:"none" }}
      >
        <div style={{ width:3, height:dragging?44:28, borderRadius:2, background:dragging?cat.color:"rgba(255,255,255,0.1)", transition:"height 0.2s,background 0.2s" }} />
      </div>
    </motion.div>
  );
}

// ── Future ghost ──────────────────────────────────────────────────────
function FutureFold({ label, opacity }: { label:string; opacity:number }) {
  return (
    <div style={{ flexShrink:0, width:W_OPEN, height:"100%", opacity, position:"relative", borderRight:"1px solid rgba(255,255,255,0.03)", background:"rgba(255,255,255,0.012)", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"20px 16px 12px", borderBottom:"1px solid rgba(255,255,255,0.04)", flexShrink:0 }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:"2rem", fontWeight:700, color:"rgba(255,255,255,0.08)", marginBottom:3 }}>?</div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.65rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.06)" }}>Future</div>
      </div>
      <div style={{ height:40, flexShrink:0, position:"relative", borderBottom:"1px solid rgba(255,255,255,0.03)", display:"flex", alignItems:"center" }}>
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, background:"rgba(255,255,255,0.05)", transform:"translateY(-50%)" }} />
        <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", width:11, height:11, borderRadius:"50%", border:"1px dashed rgba(255,255,255,0.1)", zIndex:2 }} />
      </div>
      <div style={{ flex:1, padding:"14px 16px", display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:"0.85rem", fontWeight:600, color:"rgba(255,255,255,0.12)" }}>{label}</div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.58rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.08)" }}>Coming soon</div>
      </div>
      <div style={{ height:64, flexShrink:0, margin:"0 16px 14px", border:"0.5px dashed rgba(255,255,255,0.05)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <ImageIcon size={12} style={{ color:"rgba(255,255,255,0.08)" }} />
      </div>
    </div>
  );
}

// ── Side panel — centered modal-ish drawer ────────────────────────────
function TimelinePanel({ node, allNodes, index, onClose, onNavigate }: {
  node: TNode | null; allNodes: TNode[]; index: number;
  onClose: ()=>void; onNavigate: (i:number)=>void;
}) {
  const cat = node ? getCat(node.category) : null;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* Backdrop */}
          <motion.div key="bd"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.22 }}
            onClick={onClose}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(3px)", zIndex:49 }}
          />

          {/* Panel — fixed width, centered horizontally */}
          <motion.div key="pn"
            initial={{ opacity:0, y:24, scale:0.97 }}
            animate={{ opacity:1, y:0,  scale:1 }}
            exit={{ opacity:0, y:16, scale:0.98 }}
            transition={SPRING}
            style={{
              position:"fixed",
              top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              width:"min(560px,90vw)",
              maxHeight:"80vh",
              background:"var(--bg-elevated)",
              border:"1px solid var(--border)",
              zIndex:50,
              display:"flex",
              flexDirection:"column",
              overflow:"hidden",
            }}
          >
            {/* dframe inner frame */}
            <div style={{ position:"absolute", inset:4, border:"1px solid rgba(255,255,255,0.05)", borderRadius:6, pointerEvents:"none", zIndex:0 }} />
            {/* Corner accents */}
            <div style={{ position:"absolute", inset:-1, pointerEvents:"none", zIndex:2, background:`
              linear-gradient(${cat?.color},${cat?.color}) top left/14px 1.5px no-repeat,
              linear-gradient(${cat?.color},${cat?.color}) top left/1.5px 14px no-repeat,
              linear-gradient(${cat?.color},${cat?.color}) bottom right/14px 1.5px no-repeat,
              linear-gradient(${cat?.color},${cat?.color}) bottom right/1.5px 14px no-repeat` }} />

            {/* Header bar */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0, position:"relative", zIndex:3 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:cat?.color, boxShadow:`0 0 8px ${cat?.color}` }} />
                <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:cat?.color }}>{node.category}</span>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", color:"rgba(255,255,255,0.25)" }}>·</span>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.08em", color:"rgba(255,255,255,0.3)" }}>{node.period}{node.date_label ? ` · ${node.date_label}` : ""}</span>
              </div>
              <button onClick={onClose} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)", cursor:"pointer", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color 0.2s,color 0.2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=cat?.color||""; e.currentTarget.style.color=cat?.color||""; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}>
                <X size={13} style={{ pointerEvents:"none" }} />
              </button>
            </div>

            {/* Content */}
            <div style={{ flex:1, overflowY:"auto", position:"relative", zIndex:1 }}>
              {/* Image */}
              <div style={{ height:180, background:"var(--bg-secondary)", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"relative", overflow:"hidden" }}>
                {node.image_url
                  ? <img src={node.image_url} alt={node.title} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.85 }} />
                  : <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
                      <ImageIcon size={24} style={{ color:"rgba(255,255,255,0.12)" }} />
                      <span style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)" }}>No image added yet</span>
                    </div>
                }
                {/* Color wash overlay at bottom */}
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:`linear-gradient(transparent, var(--bg-elevated))` }} />
              </div>

              <div style={{ padding:"20px 24px 24px" }}>
                {/* Title */}
                <h3 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.4rem,3vw,1.8rem)", letterSpacing:"0.02em", color:"var(--text-primary)", margin:"0 0 12px", lineHeight:1.1 }}>{node.title}</h3>

                {/* Category badge */}
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", background:`${cat?.color}15`, border:`1px solid ${cat?.color}30`, marginBottom:18, fontFamily:"var(--font-body)", fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:cat?.color, fontWeight:600 }}>
                  {cat?.icon}{node.category}
                </div>

                {/* Description */}
                <p style={{ fontFamily:"var(--font-body)", fontSize:"0.85rem", color:"rgba(200,215,225,0.7)", lineHeight:1.75, margin:0 }}>{node.description}</p>
              </div>
            </div>

            {/* Footer nav */}
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"relative", zIndex:3, background:"var(--bg-elevated)" }}>
              <button
                onClick={() => index > 0 && onNavigate(index-1)}
                disabled={index === 0}
                style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"1px solid rgba(255,255,255,0.1)", padding:"6px 12px", cursor:index===0?"not-allowed":"pointer", opacity:index===0?0.3:1, color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", transition:"border-color 0.2s,color 0.2s" }}
                onMouseEnter={e=>{ if(index>0){ e.currentTarget.style.borderColor=cat?.color||""; e.currentTarget.style.color=cat?.color||""; }}}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}>
                <ChevronLeft size={12} style={{ pointerEvents:"none" }} />
                <span style={{ maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{index>0 ? allNodes[index-1].title : "—"}</span>
              </button>

              <span style={{ fontFamily:"var(--font-mono)", fontSize:"9px", color:"rgba(255,255,255,0.2)", letterSpacing:"0.06em" }}>{index+1} / {allNodes.length}</span>

              <button
                onClick={() => index < allNodes.length-1 && onNavigate(index+1)}
                disabled={index === allNodes.length-1}
                style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"1px solid rgba(255,255,255,0.1)", padding:"6px 12px", cursor:index===allNodes.length-1?"not-allowed":"pointer", opacity:index===allNodes.length-1?0.3:1, color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", transition:"border-color 0.2s,color 0.2s" }}
                onMouseEnter={e=>{ if(index<allNodes.length-1){ e.currentTarget.style.borderColor=cat?.color||""; e.currentTarget.style.color=cat?.color||""; }}}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}>
                <span style={{ maxWidth:100, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{index<allNodes.length-1 ? allNodes[index+1].title : "—"}</span>
                <ChevronRight size={12} style={{ pointerEvents:"none" }} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Mobile node ───────────────────────────────────────────────────────
function MobileNode({ node, index, isExpanded, onToggle, onOpen }: {
  node:TNode; index:number; isExpanded:boolean;
  onToggle:()=>void; onOpen:(n:TNode,i:number)=>void;
}) {
  const cat = getCat(node.category);
  return (
    <motion.div layout initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-12 }} transition={{ duration:0.25, delay:index*0.04 }}
      style={{ position:"relative", marginBottom:28, cursor:"pointer" }} onClick={onToggle}>
      <div style={{ position:"absolute", left:-28, top:4, width:12, height:12, borderRadius:"50%", background:cat.color, boxShadow:`0 0 8px ${cat.color}`, border:"2px solid var(--bg-primary)", transition:"transform 0.2s", transform:isExpanded?"scale(1.35)":"scale(1)" }} />
      <p className="timeline-node-mobile__period">{node.period}{node.date_label?` · ${node.date_label}`:""}</p>
      <div className="timeline-node-mobile__badge" style={{ color:cat.color }}>
        <span aria-hidden>{cat.icon}</span>
        <span className="timeline-node__badge-text">{node.category}</span>
      </div>
      <p className="timeline-node-mobile__title">{node.title}</p>
      <span className="timeline-node-mobile__toggle">{isExpanded?"— collapse":"+ expand"}</span>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} transition={{ duration:0.28 }} style={{ overflow:"hidden" }}>
            <p className="timeline-node-mobile__desc">{node.description}</p>
            {node.image_url && <div style={{ marginTop:10, height:90, overflow:"hidden" }}><img src={node.image_url} alt={node.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} /></div>}
            <button onClick={e=>{ e.stopPropagation(); onOpen(node,index); }} style={{ marginTop:8, background:"none", border:"none", padding:0, fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:cat.color, cursor:"pointer" }}>+ Full detail</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main section ──────────────────────────────────────────────────────
export default function Timeline() {
  const [nodes, setNodes]              = useState<TNode[]>(FALLBACK);
  const [filter, setFilter]            = useState("All");
  const [panelNode, setPanelNode]      = useState<TNode | null>(null);
  const [panelIndex, setPanelIndex]    = useState(0);
  const [expandedMobile, setExpandMob] = useState<string | null>(null);
  const [canRight, setCanRight]        = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragRef = useRef(false);
  const startXRef = useRef(0);
  const scrollRef = useRef(0);
  const movedRef  = useRef(false);

  useEffect(() => {
    fetch("/api/timeline").then(r=>r.json()).then((d:TNode[])=>{ if(d?.length) setNodes(d); }).catch(()=>{});
  }, []);

  const filtered = filter === "All" ? nodes : nodes.filter(n=>n.category===filter);

  function openPanel(node: TNode) {
    const idx = filtered.findIndex(n=>n.id===node.id);
    setPanelNode(node); setPanelIndex(idx);
  }
  function navigate(idx: number) {
    if (idx < 0 || idx >= filtered.length) return;
    setPanelNode(filtered[idx]); setPanelIndex(idx);
  }

  function checkScroll() {
    const el = trackRef.current; if (!el) return;
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }
  useEffect(() => { setTimeout(checkScroll, 100); }, [filtered.length]);

  function onDown(e: React.MouseEvent) {
    isDragRef.current = true; movedRef.current = false;
    startXRef.current = e.pageX; scrollRef.current = trackRef.current?.scrollLeft ?? 0;
  }
  function onMove(e: React.MouseEvent) {
    if (!isDragRef.current) return;
    const dx = e.pageX - startXRef.current;
    if (Math.abs(dx) > 4) movedRef.current = true;
    if (trackRef.current) { trackRef.current.scrollLeft = scrollRef.current - dx; checkScroll(); }
  }
  function onUp() { isDragRef.current = false; }

  // Compute stackDepth for each panel — how many collapsed panels follow it consecutively
  // (determines shadow depth intensity)
  function getStackDepths(nodes: TNode[]): number[] {
    // We can't know which are collapsed from here, so pass 0 — panels compute internally
    return nodes.map(() => 0);
  }

  return (
    <section id="timeline" className="section-pad" aria-labelledby="timeline-heading" style={{ backgroundColor:"var(--bg-primary)" }}>
      {/* Label + tabs inside site-container */}
      <div className="site-container">
        <SectionLabel>04 — Timeline</SectionLabel>
        <h2 id="timeline-heading" className="sr-only">Timeline</h2>
        <TabBar tabs={FILTER_TABS} active={filter} onChange={label=>{ setFilter(label); setPanelNode(null); setExpandMob(null); }} />
      </div>

      {/* ── Desktop — contained track ── */}
      <div className="timeline-desktop">
        <div className="site-container" style={{ padding:0 }}>
          <div style={{ position:"relative" }}>
            {/* Scroll track — left-anchored, scrolls only right */}
            <div
              ref={trackRef}
              onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
              onScroll={checkScroll}
              style={{
                overflowX:"auto", overflowY:"hidden",
                scrollbarWidth:"none",
                cursor:"grab",
                // Left edge is flush, content anchors left
                paddingRight: canRight ? 48 : 0,
              }}
            >
              <div style={{ display:"flex", height:H_TRACK, minWidth:"max-content", paddingLeft:0 }}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((node, i) => (
                    <FoldPanel
                      key={node.id}
                      node={node}
                      stackDepth={0}  // simplified — shadow applied via CSS filter
                      isActive={panelNode?.id === node.id}
                      onExpand={() => {}}
                      onOpenPanel={openPanel}
                    />
                  ))}
                </AnimatePresence>
                {filter === "All" && FUTURE.map((label, i) => (
                  <FutureFold key={`f${i}`} label={label} opacity={Math.max(0.08, 0.5 - i * 0.18)} />
                ))}
              </div>
            </div>

            {/* Right fade + scroll arrow */}
            {canRight && (
              <>
                <div style={{ position:"absolute", top:0, right:0, bottom:0, width:80, background:"linear-gradient(to right,transparent,var(--bg-primary))", pointerEvents:"none", zIndex:5 }} />
                <button
                  onClick={() => { trackRef.current?.scrollBy({ left:W_OPEN, behavior:"smooth" }); setTimeout(checkScroll,350); }}
                  style={{ position:"absolute", top:"50%", right:8, transform:"translateY(-50%)", background:"var(--bg-elevated)", border:"1px solid var(--border)", color:"var(--text-muted)", cursor:"pointer", width:32, height:48, display:"flex", alignItems:"center", justifyContent:"center", zIndex:6, transition:"color 0.2s,border-color 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.color="var(--text-primary)"; e.currentTarget.style.borderColor="var(--accent-muted)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.borderColor="var(--border)"; }}
                  aria-label="Scroll right">
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          <p style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.15)", textAlign:"left", marginTop:10, paddingLeft:0 }}>
            drag edge → fold · click folded → expand · click open → full detail · drag track → scroll
          </p>
        </div>
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
                  onOpen={(n,idx) => openPanel(n)} />
              ))}
            </AnimatePresence>
            {filter === "All" && FUTURE.map((label, i) => (
              <div key={`fm${i}`} className="timeline-future-mobile" style={{ opacity:Math.max(0.06, 0.22 - i * 0.07) }}>
                <div className="timeline-future-mobile__dot" />
                <p className="timeline-future-mobile__period">Future</p>
                <p className="timeline-future-mobile__title">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Centered modal panel */}
      <TimelinePanel node={panelNode} allNodes={filtered} index={panelIndex} onClose={() => setPanelNode(null)} onNavigate={navigate} />

      <style>{`
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
        .timeline-desktop ::-webkit-scrollbar{display:none;}
      `}</style>
    </section>
  );
}
