"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GraduationCap, Briefcase, Award, Star, Clock,
  X, ChevronLeft, ChevronRight, ImageIcon,
} from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import TabBar, { TabItem } from "@/components/ui/TabBar";

interface TNode {
  id: string; sort_order: number; period: string; date_label: string;
  title: string; category: string; description: string; image_url: string | null;
}

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

const FUTURE       = ["First Full-Time Role","Open Source Contribution","CodeBreeder Launch"];
const FILTER_TABS: TabItem[] = ["All","Education","Work","Milestone","Certifications"].map(l=>({label:l}));

const CAT: Record<string,{icon:React.ReactNode;color:string}> = {
  Education:      { icon:<GraduationCap size={11}/>, color:"#f59e0b" },
  Work:           { icon:<Briefcase size={11}/>,     color:"#10b981" },
  Milestone:      { icon:<Star size={11}/>,          color:"#ef4444" },
  Certifications: { icon:<Award size={11}/>,         color:"#8b5cf6" },
  Background:     { icon:<Clock size={11}/>,         color:"#94a3b8" },
};
const getCat = (c:string) => CAT[c] ?? CAT.Background;

const W_OPEN = 240;
const W_PEEK = 68;
const STOPS  = [W_OPEN, W_PEEK] as const;
const H_TRACK = 460;
const RESIST  = 0.10;
const VEL_THRESH = 0.28;
// Spring with real bounce — damping 22, mass 1.1
const SPRING = { type:"spring", stiffness:400, damping:22, mass:1.1 } as const;

function snapTo(w:number, vel:number):number {
  if (Math.abs(vel) > VEL_THRESH) {
    if (vel > 0) { const n=[...STOPS].sort((a,b)=>a-b).find(s=>s>w); return n??W_OPEN; }
    else         { const n=[...STOPS].sort((a,b)=>b-a).find(s=>s<w); return n??W_PEEK; }
  }
  return STOPS.reduce((b,s)=>Math.abs(s-w)<Math.abs(b-w)?s:b,STOPS[0]);
}
function resist(raw:number):number {
  if (raw>W_OPEN) return W_OPEN+(raw-W_OPEN)*RESIST;
  if (raw<W_PEEK) return W_PEEK+(raw-W_PEEK)*RESIST;
  return raw;
}

// ── Fold panel ────────────────────────────────────────────────────────
function FoldPanel({ node, isActive, isFocused, onOpenPanel, onFocus }:{
  node:TNode; isActive:boolean; isFocused:boolean;
  onOpenPanel:(n:TNode)=>void; onFocus:()=>void;
}) {
  const [width, setWidth]       = useState(W_OPEN);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const startXRef = useRef(0); const startWRef = useRef(W_OPEN);
  const velRef    = useRef(0); const lastXRef  = useRef(0);
  const lastTRef  = useRef(0); const movedRef  = useRef(false);

  const cat    = getCat(node.category);
  const isPeek = width <= W_PEEK + 8;
  const isOpen = !isPeek;
  const foldRatio = 1 - Math.max(0, Math.min(1, (width-W_PEEK)/(W_OPEN-W_PEEK)));
  const creaseOpacity = 0.04 + foldRatio * 0.36;

  const onHandleDown = useCallback((e:React.PointerEvent)=>{
    e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true); movedRef.current=false;
    startXRef.current=e.clientX; startWRef.current=width;
    velRef.current=0; lastXRef.current=e.clientX; lastTRef.current=e.timeStamp;
  },[width]);

  const onHandleMove = useCallback((e:React.PointerEvent)=>{
    if (!dragging) return;
    movedRef.current=true;
    const dt=e.timeStamp-lastTRef.current;
    if (dt>0) velRef.current=(e.clientX-lastXRef.current)/dt;
    lastXRef.current=e.clientX; lastTRef.current=e.timeStamp;
    setWidth(resist(startWRef.current+(e.clientX-startXRef.current)));
  },[dragging]);

  const onHandleUp = useCallback(()=>{
    if (!dragging) return;
    setDragging(false);
    setWidth(snapTo(width, velRef.current));
  },[dragging, width]);

  function handleClick() {
    if (movedRef.current) { movedRef.current=false; return; }
    onFocus();
    if (isPeek) setWidth(W_OPEN);
    else        onOpenPanel(node);
  }

  return (
    <motion.div
      animate={{ width }}
      transition={dragging?{duration:0}:SPRING}
      style={{
        flexShrink:0, position:"relative", height:"100%",
        // NO willChange, NO filter, NO transform other than width animation
        // All of those force GPU compositing which blurs text
        zIndex: isPeek ? 1 : hovered ? 3 : 2,
      }}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
    >
      {/* ── Shadow layer — separate div BEHIND the content so filter never touches text ── */}
      <div style={{
        position:"absolute", inset:0,
        // Shadow via box-shadow on a background div — never bleeds into text rendering
        boxShadow: isPeek
          ? "8px 0 24px rgba(0,0,0,0.7), 14px 0 36px rgba(0,0,0,0.4)"
          : hovered
          ? "6px 0 20px rgba(0,0,0,0.5), 2px 0 8px rgba(0,0,0,0.3)"
          : "4px 0 14px rgba(0,0,0,0.4), 6px 0 20px rgba(0,0,0,0.2)",
        transition:"box-shadow 0.4s ease",
        pointerEvents:"none",
        zIndex:0,
      }} />

      {/* ── Paper face — NO filter, NO transform, clean stacking context ── */}
      <div
        onClick={handleClick}
        style={{
          position:"absolute", inset:0,
          background: isActive ? "var(--bg-elevated)" : "var(--bg-secondary)",
          borderRight:"1px solid rgba(255,255,255,0.07)",
          borderLeft: isActive ? `2px solid ${cat.color}` : "1px solid rgba(255,255,255,0.04)",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
          cursor: isPeek ? "e-resize" : "pointer",
          // Hover elevation — margin-top instead of translateY avoids compositing
          transition:"background 300ms ease, border-color 300ms ease",
          outline: isFocused ? `2px solid ${cat.color}` : "none",
          outlineOffset:-2,
          zIndex:1,
        }}
      >
        {/* Top color stripe */}
        <div style={{ height:3, flexShrink:0, background:cat.color, opacity:isPeek?0.45:1, transition:"opacity 0.3s" }} />

        {/* Active corner accents */}
        {isActive && (
          <div style={{ position:"absolute", inset:-1, pointerEvents:"none", zIndex:4,
            boxShadow:`0 0 0 1px ${cat.color}50, inset 0 0 24px ${cat.color}08`,
            background:`
              linear-gradient(${cat.color},${cat.color}) top left/12px 1.5px no-repeat,
              linear-gradient(${cat.color},${cat.color}) top left/1.5px 12px no-repeat,
              linear-gradient(${cat.color},${cat.color}) bottom right/12px 1.5px no-repeat,
              linear-gradient(${cat.color},${cat.color}) bottom right/1.5px 12px no-repeat`,
          }} />
        )}

        {/* Year header */}
        <div style={{ padding:"16px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0, overflow:"hidden", whiteSpace:"nowrap" }}>
          {/* Plain color — no gradient clip, no WebkitBackgroundClip, no blurring */}
          <div style={{ fontFamily:"var(--font-display)", fontSize:"2rem", fontWeight:700, letterSpacing:"-0.02em", lineHeight:1, color:cat.color, marginBottom:3 }}>
            {node.period}
          </div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.62rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", opacity:isPeek?0:1, transition:"opacity 0.12s" }}>
            {node.date_label || node.category}
          </div>
        </div>

        {/* Spine */}
        <div style={{ height:38, flexShrink:0, position:"relative", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center" }}>
          <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, background:"rgba(255,255,255,0.08)", transform:"translateY(-50%)" }} />
          <div style={{
            position:"absolute", left:16, top:"50%", transform:"translateY(-50%)",
            width:11, height:11, borderRadius:"50%",
            background:cat.color, border:"2px solid var(--bg-primary)", zIndex:2,
            boxShadow:(isActive||hovered)?`0 0 0 3px ${cat.color}40, 0 0 14px ${cat.color}80`:`0 0 0 2px ${cat.color}30`,
            transition:"box-shadow 0.3s",
            animation:isActive?"tl-dot-pulse 2.2s ease-in-out infinite":"none",
          }} />
        </div>

        {/* Body */}
        <div style={{ flex:1, padding:"12px 16px 0", display:"flex", flexDirection:"column", gap:8, overflow:"hidden", opacity:isPeek?0:1, transition:"opacity 0.1s" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, color:cat.color, fontFamily:"var(--font-body)", fontSize:"0.58rem", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700 }}>
            {getCat(node.category).icon}<span>{node.category}</span>
          </div>
          {/* Title — plain color, full opacity, no compositing tricks */}
          <div style={{ fontFamily:"var(--font-display)", fontSize:"0.9rem", fontWeight:600, lineHeight:1.25, color:"var(--text-primary)", letterSpacing:"0.01em" }}>
            {node.title}
          </div>
          <div style={{ fontFamily:"var(--font-body)", fontSize:"0.7rem", color:"rgba(200,210,220,0.55)", lineHeight:1.6, flex:1, overflow:"hidden" }}>
            {node.description}
          </div>
          {/* Image */}
          <div style={{ height:60, flexShrink:0, marginTop:"auto", marginBottom:12, overflow:"hidden", border:"0.5px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {node.image_url
              ? <img src={node.image_url} alt={node.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              : <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.52rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.12)" }}>no image</span>
            }
          </div>
        </div>

        {/* Peek tab — plain color, no gradient clip */}
        {isPeek && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:cat.color, boxShadow:`0 0 6px ${cat.color}`, flexShrink:0 }} />
            <div style={{ fontFamily:"var(--font-display)", fontSize:"0.65rem", fontWeight:400, color:cat.color, opacity:0.7, writingMode:"vertical-rl", transform:"rotate(180deg)", whiteSpace:"nowrap", letterSpacing:"0.18em" }}>
              {node.period}
            </div>
          </div>
        )}

        {/* Crease shadow — grows with foldRatio */}
        {isOpen && (
          <div style={{ position:"absolute", top:0, right:0, bottom:0, width:`${14+foldRatio*14}px`, background:`linear-gradient(to right,transparent,rgba(0,0,0,${creaseOpacity}))`, pointerEvents:"none", zIndex:3, transition:dragging?"none":"width 0.2s" }} />
        )}

        {/* Fold darkening overlay — semi-transparent div, never blurs text */}
        {foldRatio > 0.04 && (
          <div style={{ position:"absolute", inset:0, background:`rgba(0,0,0,${foldRatio*0.16})`, pointerEvents:"none", zIndex:2, transition:dragging?"none":"background 0.15s" }} />
        )}
      </div>

      {/* Drag handle */}
      <div
        onPointerDown={onHandleDown} onPointerMove={onHandleMove}
        onPointerUp={onHandleUp}    onPointerCancel={onHandleUp}
        onMouseDown={e=>e.stopPropagation()}
        onClick={e=>e.stopPropagation()}
        style={{ position:"absolute", top:0, right:0, bottom:0, width:18, cursor:"ew-resize", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", touchAction:"none" }}
      >
        <div style={{ width:3, height:dragging?44:28, borderRadius:2, background:dragging?cat.color:"rgba(255,255,255,0.12)", transition:"height 0.2s,background 0.2s" }} />
      </div>
    </motion.div>
  );
}

// ── Future ghost ──────────────────────────────────────────────────────
function FutureFold({ label, opacity }:{ label:string; opacity:number }) {
  return (
    <div style={{ flexShrink:0, width:W_OPEN, height:"100%", opacity, position:"relative", borderRight:"1px solid rgba(255,255,255,0.03)", background:"rgba(255,255,255,0.012)", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ height:3, background:"rgba(255,255,255,0.05)", flexShrink:0 }} />
      <div style={{ padding:"16px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.04)", flexShrink:0 }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:"2rem", fontWeight:700, color:"rgba(255,255,255,0.08)", marginBottom:3 }}>?</div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.62rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.06)" }}>Future</div>
      </div>
      <div style={{ height:38, flexShrink:0, position:"relative", borderBottom:"1px solid rgba(255,255,255,0.03)", display:"flex", alignItems:"center" }}>
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:1, background:"rgba(255,255,255,0.04)", transform:"translateY(-50%)" }} />
        <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", width:11, height:11, borderRadius:"50%", border:"1px dashed rgba(255,255,255,0.1)", zIndex:2 }} />
      </div>
      <div style={{ flex:1, padding:"12px 16px", display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:"0.85rem", fontWeight:600, color:"rgba(255,255,255,0.12)" }}>{label}</div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.58rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.08)" }}>Coming soon</div>
      </div>
    </div>
  );
}

// ── Detail panel — centered via flex overlay (no transform conflict) ──
function TimelinePanel({ node, allNodes, index, onClose, onNavigate }:{
  node:TNode|null; allNodes:TNode[]; index:number;
  onClose:()=>void; onNavigate:(i:number)=>void;
}) {
  const cat = node ? getCat(node.category) : null;
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[onClose]);

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div key="bd" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.22 }}
            onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)", zIndex:49 }} />

          {/* Flex overlay centers panel — Framer Motion only handles y+scale, no transform conflict */}
          <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, pointerEvents:"none" }}>
            <motion.div key="pn"
              initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:16, scale:0.98 }} transition={SPRING}
              style={{ width:"min(560px,90vw)", maxHeight:"82vh", background:"var(--bg-elevated)", border:"1px solid var(--border)", display:"flex", flexDirection:"column", overflow:"hidden", pointerEvents:"all", position:"relative" }}
            >
              {/* Top stripe */}
              <div style={{ height:3, flexShrink:0, background:cat?.color }} />
              {/* dframe inner frame */}
              <div style={{ position:"absolute", inset:4, border:"1px solid rgba(255,255,255,0.05)", borderRadius:6, pointerEvents:"none", zIndex:0 }} />
              {/* Corner accents */}
              <div style={{ position:"absolute", inset:-1, pointerEvents:"none", zIndex:2, background:`
                linear-gradient(${cat?.color},${cat?.color}) top left/14px 1.5px no-repeat,
                linear-gradient(${cat?.color},${cat?.color}) top left/1.5px 14px no-repeat,
                linear-gradient(${cat?.color},${cat?.color}) bottom right/14px 1.5px no-repeat,
                linear-gradient(${cat?.color},${cat?.color}) bottom right/1.5px 14px no-repeat` }} />

              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0, position:"relative", zIndex:3 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:cat?.color, boxShadow:`0 0 8px ${cat?.color}` }} />
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase", color:cat?.color }}>{node.category}</span>
                  <span style={{ color:"rgba(255,255,255,0.2)" }}>·</span>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"0.08em", color:"rgba(255,255,255,0.3)" }}>{node.period}{node.date_label?` · ${node.date_label}`:""}</span>
                </div>
                <button onClick={onClose} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)", cursor:"pointer", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color 0.2s,color 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=cat?.color||""; e.currentTarget.style.color=cat?.color||""; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}>
                  <X size={13} style={{ pointerEvents:"none" }} />
                </button>
              </div>

              {/* Content */}
              <div style={{ flex:1, overflowY:"auto", position:"relative", zIndex:1 }}>
                <div style={{ height:180, background:"var(--bg-secondary)", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"relative", overflow:"hidden" }}>
                  {node.image_url
                    ? <img src={node.image_url} alt={node.title} style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.9 }} />
                    : <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
                        <ImageIcon size={24} style={{ color:"rgba(255,255,255,0.12)" }} />
                        <span style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)" }}>No image added yet</span>
                      </div>
                  }
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:`linear-gradient(transparent,var(--bg-elevated))` }} />
                </div>
                <div style={{ padding:"20px 24px 24px" }}>
                  <h3 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(1.4rem,3vw,1.8rem)", letterSpacing:"0.02em", color:"var(--text-primary)", margin:"0 0 12px", lineHeight:1.1 }}>{node.title}</h3>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", background:`${cat?.color}18`, border:`1px solid ${cat?.color}30`, marginBottom:18, fontFamily:"var(--font-body)", fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:cat?.color, fontWeight:600 }}>
                    {cat?.icon}{node.category}
                  </div>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:"0.875rem", color:"rgba(200,215,225,0.75)", lineHeight:1.78, margin:0 }}>{node.description}</p>
                </div>
              </div>

              {/* Footer nav */}
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"12px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0, zIndex:3, background:"var(--bg-elevated)" }}>
                {([
                  { dir:-1 as const, icon:<ChevronLeft size={12} style={{ pointerEvents:"none" }}/>,  label:index>0?allNodes[index-1].title:"—",                ok:index>0,                   align:"flex-start" as const },
                  { dir:+1 as const, icon:<ChevronRight size={12} style={{ pointerEvents:"none" }}/>, label:index<allNodes.length-1?allNodes[index+1].title:"—", ok:index<allNodes.length-1,   align:"flex-end"   as const },
                ]).map(({dir,icon,label,ok,align},ki)=>(
                  <button key={ki} onClick={()=>ok&&onNavigate(index+dir)} disabled={!ok}
                    style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"1px solid rgba(255,255,255,0.1)", padding:"6px 12px", cursor:ok?"pointer":"not-allowed", opacity:ok?1:0.3, color:"rgba(255,255,255,0.5)", fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", transition:"border-color 0.2s,color 0.2s", flex:1, justifyContent:align }}
                    onMouseEnter={e=>{ if(ok){ e.currentTarget.style.borderColor=cat?.color||""; e.currentTarget.style.color=cat?.color||""; }}}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}>
                    {dir===-1&&icon}
                    <span style={{ maxWidth:110, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{label}</span>
                    {dir===+1&&icon}
                  </button>
                ))}
                <span style={{ fontFamily:"var(--font-mono)", fontSize:"9px", color:"rgba(255,255,255,0.2)", letterSpacing:"0.06em", flexShrink:0 }}>{index+1} / {allNodes.length}</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────
function MobileCard({ node, index, isExpanded, onToggle, onOpen }:{
  node:TNode; index:number; isExpanded:boolean;
  onToggle:()=>void; onOpen:(n:TNode,i:number)=>void;
}) {
  const cat = getCat(node.category);
  return (
    <motion.div layout
      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
      transition={{ duration:0.28, delay:index*0.04 }}
      onClick={onToggle}
      style={{ position:"relative", marginBottom:12, cursor:"pointer", background:"var(--bg-secondary)", border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}
    >
      <div style={{ height:3, background:cat.color }} />
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px" }}>
        <div style={{ width:10, height:10, borderRadius:"50%", background:cat.color, boxShadow:`0 0 8px ${cat.color}`, flexShrink:0, border:"2px solid var(--bg-primary)", animation:isExpanded?"tl-dot-pulse 2.2s ease-in-out infinite":"none" }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ fontFamily:"var(--font-display)", fontSize:"1.1rem", fontWeight:700, color:cat.color, letterSpacing:"0.02em" }}>{node.period}</span>
            {node.date_label && <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.6rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>{node.date_label}</span>}
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:4, color:cat.color, fontFamily:"var(--font-body)", fontSize:"0.58rem", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700 }}>
            {cat.icon}<span>{node.category}</span>
          </div>
        </div>
        <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", color:"rgba(255,255,255,0.3)", flexShrink:0 }}>{isExpanded?"— less":"+ more"}</div>
      </div>
      <div style={{ padding:"0 16px 14px", fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:600, lineHeight:1.25, color:"var(--text-primary)" }}>{node.title}</div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} transition={{ duration:0.28, ease:"easeInOut" }} style={{ overflow:"hidden" }}>
            {node.image_url && <div style={{ height:120, overflow:"hidden", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}><img src={node.image_url} alt={node.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} /></div>}
            <div style={{ padding:"14px 16px" }}>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"0.82rem", color:"rgba(200,210,220,0.65)", lineHeight:1.7, margin:"0 0 12px" }}>{node.description}</p>
              <button onClick={e=>{ e.stopPropagation(); onOpen(node,index); }} style={{ background:"none", border:"none", padding:0, fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.12em", textTransform:"uppercase", color:cat.color, cursor:"pointer", opacity:0.85 }}>+ Full detail →</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isExpanded && <div style={{ position:"absolute", inset:-1, pointerEvents:"none", border:`1px solid ${cat.color}30`, zIndex:2 }} />}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function Timeline() {
  const [nodes, setNodes]              = useState<TNode[]>(FALLBACK);
  const [filter, setFilter]            = useState("All");
  const [panelNode, setPanelNode]      = useState<TNode|null>(null);
  const [panelIndex, setPanelIndex]    = useState(0);
  const [expandedMobile, setExpandMob] = useState<string|null>(null);
  const [canRight, setCanRight]           = useState(false);
  const [canMobileRight, setCanMobileRight] = useState(false);
  const [focusedIdx, setFocusedIdx]       = useState<number|null>(null);
  const trackRef      = useRef<HTMLDivElement>(null);
  const mobilTrackRef = useRef<HTMLDivElement>(null);
  const isDragRef  = useRef(false);
  const startXRef  = useRef(0);
  const scrollRef  = useRef(0);
  const movedRef   = useRef(false);
  const isDragMRef = useRef(false);
  const startXMRef = useRef(0);
  const scrollMRef = useRef(0);
  const movedMRef  = useRef(false);

  useEffect(()=>{ fetch("/api/timeline").then(r=>r.json()).then((d:TNode[])=>{ if(d?.length) setNodes(d); }).catch(()=>{}); },[]);

  const filtered = filter==="All"?nodes:nodes.filter(n=>n.category===filter);

  function openPanel(node:TNode) { const idx=filtered.findIndex(n=>n.id===node.id); setPanelNode(node); setPanelIndex(idx); }
  function navigate(idx:number) { if(idx<0||idx>=filtered.length) return; setPanelNode(filtered[idx]); setPanelIndex(idx); }

  function checkScroll() { const el=trackRef.current; if(!el) return; setCanRight(el.scrollLeft<el.scrollWidth-el.clientWidth-4); }
  function checkMobileScroll() { const el=mobilTrackRef.current; if(!el) return; setCanMobileRight(el.scrollLeft<el.scrollWidth-el.clientWidth-4); }
  useEffect(()=>{ setTimeout(checkScroll,100); setTimeout(checkMobileScroll,100); },[filtered.length]);

  function onDown(e:React.PointerEvent) { isDragRef.current=true; movedRef.current=false; startXRef.current=e.pageX; scrollRef.current=trackRef.current?.scrollLeft??0; }
  function onMove(e:React.PointerEvent) { if(!isDragRef.current) return; const dx=e.pageX-startXRef.current; if(Math.abs(dx)>4) movedRef.current=true; if(trackRef.current){ trackRef.current.scrollLeft=Math.max(0,scrollRef.current-dx); checkScroll(); } }
  function onUp() { isDragRef.current=false; }
  function onMobileDown(e:React.PointerEvent) { isDragMRef.current=true; movedMRef.current=false; startXMRef.current=e.pageX; scrollMRef.current=mobilTrackRef.current?.scrollLeft??0; }
  function onMobileMove(e:React.PointerEvent) { if(!isDragMRef.current) return; const dx=e.pageX-startXMRef.current; if(Math.abs(dx)>4) movedMRef.current=true; if(mobilTrackRef.current){ mobilTrackRef.current.scrollLeft=Math.max(0,scrollMRef.current-dx); checkMobileScroll(); } }
  function onMobileUp() { isDragMRef.current=false; }

  useEffect(()=>{
    if(panelNode) return;
    function onKey(e:KeyboardEvent) {
      const tl=document.getElementById("timeline"); if(!tl) return;
      const r=tl.getBoundingClientRect();
      if(r.top>window.innerHeight||r.bottom<0) return;
      if(e.key==="ArrowRight"){ e.preventDefault(); setFocusedIdx(p=>p===null?0:Math.min(p+1,filtered.length-1)); }
      else if(e.key==="ArrowLeft"){ e.preventDefault(); setFocusedIdx(p=>p===null?0:Math.max(p-1,0)); }
      else if(e.key==="Enter"&&focusedIdx!==null){ e.preventDefault(); openPanel(filtered[focusedIdx]); }
      else if(e.key==="Escape") setFocusedIdx(null);
    }
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[filtered,focusedIdx,panelNode]);

  return (
    <section id="timeline" className="section-pad" aria-labelledby="timeline-heading" style={{ backgroundColor:"var(--bg-primary)" }}>
      <div className="site-container">
        <SectionLabel>04 — Timeline</SectionLabel>
        <h2 id="timeline-heading" className="sr-only">Timeline</h2>
        <TabBar tabs={FILTER_TABS} active={filter} onChange={label=>{ setFilter(label); setPanelNode(null); setExpandMob(null); setFocusedIdx(null); }} />
      </div>

      {/* Desktop */}
      <div className="timeline-desktop">
        <div className="site-container" style={{ padding:0 }}>
          <div style={{ position:"relative" }}>
            <div ref={trackRef}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
              onScroll={checkScroll}
              style={{ overflowX:"auto", overflowY:"hidden", scrollbarWidth:"none", cursor:"grab", paddingRight:canRight?48:0, touchAction:"pan-y" }}
            >
              <div style={{ display:"flex", height:H_TRACK, minWidth:"max-content" }}>
                <AnimatePresence mode="popLayout">
                  {filtered.map((node,i)=>(
                    <FoldPanel key={node.id} node={node} isActive={panelNode?.id===node.id} isFocused={focusedIdx===i} onOpenPanel={openPanel} onFocus={()=>setFocusedIdx(i)} />
                  ))}
                </AnimatePresence>
                {filter==="All"&&FUTURE.map((label,i)=>(
                  <FutureFold key={`f${i}`} label={label} opacity={Math.max(0.08,0.5-i*0.18)} />
                ))}
              </div>
            </div>
            {canRight&&(
              <>
                <div style={{ position:"absolute", top:0, right:0, bottom:0, width:80, background:"linear-gradient(to right,transparent,var(--bg-primary))", pointerEvents:"none", zIndex:5 }} />
                <button onClick={()=>{ trackRef.current?.scrollBy({left:W_OPEN,behavior:"smooth"}); setTimeout(checkScroll,350); }}
                  style={{ position:"absolute", top:"50%", right:8, transform:"translateY(-50%)", background:"var(--bg-elevated)", border:"1px solid var(--border)", color:"var(--text-muted)", cursor:"pointer", width:32, height:48, display:"flex", alignItems:"center", justifyContent:"center", zIndex:6, transition:"color 0.2s,border-color 0.2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.color="var(--text-primary)"; e.currentTarget.style.borderColor="var(--accent-muted)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.borderColor="var(--border)"; }}
                  aria-label="Scroll right"><ChevronRight size={16} /></button>
              </>
            )}
          </div>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.14)", textAlign:"left", marginTop:10 }}>
            drag edge → peek · drag back → expand · click open → detail · ← → keys navigate
          </p>
        </div>
      </div>

      {/* Mobile — same fold track, touch-driven via pointer events */}
      <div className="timeline-mobile">
        <div style={{ position:"relative" }}>
          <div
            ref={mobilTrackRef}
            onPointerDown={onMobileDown} onPointerMove={onMobileMove}
            onPointerUp={onMobileUp}    onPointerCancel={onMobileUp}
            onScroll={checkMobileScroll}
            style={{ overflowX:"auto", overflowY:"hidden", scrollbarWidth:"none", cursor:"grab", touchAction:"pan-y" }}
          >
            <div style={{ display:"flex", height:340, minWidth:"max-content", paddingLeft:"1rem" }}>
              <AnimatePresence mode="popLayout">
                {filtered.map((node,i)=>(
                  <FoldPanel key={node.id} node={node} isActive={panelNode?.id===node.id} isFocused={false} onOpenPanel={openPanel} onFocus={()=>{}} />
                ))}
              </AnimatePresence>
              {filter==="All"&&FUTURE.map((label,i)=>(
                <FutureFold key={`fm${i}`} label={label} opacity={Math.max(0.08,0.5-i*0.18)} />
              ))}
            </div>
          </div>
          {canMobileRight&&(
            <div style={{ position:"absolute", top:0, right:0, bottom:0, width:60, background:"linear-gradient(to right,transparent,var(--bg-primary))", pointerEvents:"none", zIndex:5 }} />
          )}
        </div>
        <p style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.14)", textAlign:"left", marginTop:10, paddingLeft:"1rem" }}>
          drag edge → fold · tap folded → expand · tap open → detail
        </p>
      </div>

      <TimelinePanel node={panelNode} allNodes={filtered} index={panelIndex} onClose={()=>setPanelNode(null)} onNavigate={navigate} />

      <style>{`
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
        .timeline-desktop ::-webkit-scrollbar{display:none;}
        @keyframes tl-dot-pulse{
          0%,100%{box-shadow:0 0 0 2px rgba(255,255,255,0.1), 0 0 8px rgba(255,255,255,0.3);}
          50%    {box-shadow:0 0 0 4px rgba(255,255,255,0.06),0 0 16px rgba(255,255,255,0.6);}
        }
      `}</style>
    </section>
  );
}
