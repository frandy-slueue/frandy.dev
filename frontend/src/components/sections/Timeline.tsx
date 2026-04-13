"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GraduationCap, Briefcase, Award, Star, Clock,
  X, ChevronLeft, ChevronRight, ImageIcon,
} from "lucide-react";
import { MdOutlineKeyboardDoubleArrowLeft, MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import SectionLabel from "@/components/ui/SectionLabel";
import TabBar, { TabItem } from "@/components/ui/TabBar";

interface TNode {
  id: string; sort_order: number; period: string; date_label: string;
  title: string; category: string; description: string; image_url: string | null;
}

const FALLBACK: TNode[] = [
  { id:"foundation",   sort_order:0,  period:"Before", date_label:"",           title:"The Foundation",              category:"Background",     description:"Life before code. A persistent drive to understand how things work and an instinct to build. That mindset was already there — software gave it a direction.", image_url:null },
  { id:"spartan",      sort_order:1,  period:"2007",   date_label:"January",    title:"Spartan College",             category:"Education",      description:"Enrolled at Spartan College of Aeronautics and Technology in Tulsa. Earned Avionics and Airframe & Powerplant certifications with a 3.6 GPA. Also pursued a B.S. in Technology Management — completed 2 of 3 years before pivoting careers.", image_url:null },
  { id:"lagosu",       sort_order:2,  period:"2009",   date_label:"January",    title:"Lagos State University",      category:"Education",      description:"Bachelor of Science in Computer Science — Lagos State University, Lagos, Nigeria. Accelerated program, completed 2012. Formalized the computer science foundation that had been building for years alongside aviation training.", image_url:null },
  { id:"dish",         sort_order:3,  period:"2012",   date_label:"December",   title:"DishNetwork — IT Specialist", category:"Work",           description:"First professional IT role at DishNetwork (Future Vision). Primary technical specialist for all automated systems — resolving network and system issues, leading system upgrade projects, training staff on hardware and software.", image_url:null },
  { id:"uscellular",   sort_order:4,  period:"2014",   date_label:"September",  title:"U.S. Cellular — IT Support",  category:"Work",           description:"IT Support at U.S. Cellular. Managed Help Desk tracking, configured telecom systems for multi-site moves and changes, developed problem-tracking databases, and communicated SLAs across support tiers.", image_url:null },
  { id:"va",           sort_order:5,  period:"2019",   date_label:"September",  title:"US Dept. of Veterans Affairs", category:"Work",          description:"IT Specialist GS-11 within the VA DevSecOps division — 4 years supporting 400+ staff across the VA Health Care System. Led vulnerability assessments, AIS security planning, ServiceNow workflows, Cisco infrastructure, Intune MDM deployments, and two major clinic projects. Earned four Certificates of Appreciation.", image_url:null },
  { id:"atlas",        sort_order:6,  period:"2023",   date_label:"January",    title:"Atlas School of Tulsa",       category:"Education",      description:"Intensive, project-based full-stack software engineering program. No lectures — just building, breaking, and figuring it out. Stack: Python, JavaScript, React, Node.js, C, PostgreSQL, MongoDB, GraphQL, Docker, REST APIs. All coursework completed. Certification pending final capstone submission.", image_url:null },
  { id:"codebreeder",  sort_order:7,  period:"2024",   date_label:"January",    title:"CodeBreeder — Freelance SE",  category:"Work",           description:"Launched CodeBreeder, an independent software engineering practice. Building HBS Events Studio — a full-stack luxury event platform on Next.js 15+, Django, FastAPI, GraphQL, PostgreSQL, Redis, Docker, Stripe, and Claude AI. Also delivered SEO work for James' Donut and built React Native mobile apps during Atlas.", image_url:null },
  { id:"portfolio",    sort_order:8,  period:"2025",   date_label:"February",   title:"Portfolio Launch — frandy.dev", category:"Milestone",    description:"frandy.dev — production portfolio and engineering showcase. FastAPI backend, Next.js 16+ frontend, five Docker services, four animated themes, CI/CD via GitHub Actions on DigitalOcean. The CodeBreeder identity baked into every layer.", image_url:null },
  { id:"first-role",   sort_order:9,  period:"2025",   date_label:"Present",    title:"Seeking First SE Role",       category:"Work",           description:"Full-stack engineer with a decade of enterprise IT behind me and a freelance engineering practice in front. Open to software engineering and IT operations roles where security awareness, systems thinking, and the ability to ship real software are all valued. If you have something worth building — let's talk.", image_url:null },
];

const FUTURE       = ["First Full-Time Role","Open Source Contribution"];
const FILTER_TABS: TabItem[] = ["All","Education","Work","Milestone","Certifications"].map(l=>({label:l}));

const CAT: Record<string,{icon:React.ReactNode;color:string}> = {
  Education:      { icon:<GraduationCap size={11}/>, color:"#f59e0b" },
  Work:           { icon:<Briefcase size={11}/>,     color:"#10b981" },
  Milestone:      { icon:<Star size={11}/>,          color:"#ef4444" },
  Certifications: { icon:<Award size={11}/>,         color:"#8b5cf6" },
  Background:     { icon:<Clock size={11}/>,         color:"#94a3b8" },
};
const getCat = (c:string) => CAT[c] ?? CAT.Background;

// ── Desktop constants (your adjustments preserved) ────────────────────
const W_OPEN  = 360;
const W_PEEK  = 110;
const STOPS   = [W_OPEN, W_PEEK] as const;
const H_TRACK = 652;

// ── Mobile constants ──────────────────────────────────────────────────
const W_OPEN_M  = 320;
const W_PEEK_M  = 100;
const H_TRACK_M = 492;

const RESIST     = 0.10;
const VEL_THRESH = 0.28;
const SPRING     = { type:"spring", stiffness:400, damping:22, mass:1.1 } as const;
const W_MIN      = W_PEEK;
const W_FLOOR    = W_PEEK - 60;

function snapTo(w:number, vel:number, wOpen=W_OPEN, wPeek=W_PEEK):number {
  if (w < wPeek) return wPeek;
  if (Math.abs(vel) > VEL_THRESH) {
    if (vel > 0) { const n=[wOpen,wPeek].sort((a,b)=>a-b).find(s=>s>w); return n??wOpen; }
    else         { return wPeek; }
  }
  return [wOpen,wPeek].reduce((b,s)=>Math.abs(s-w)<Math.abs(b-w)?s:b, wOpen);
}

function resist(raw:number, wOpen=W_OPEN, wPeek=W_PEEK):number {
  if (raw > wOpen) return wOpen + (raw - wOpen) * RESIST;
  if (raw < wPeek) return wPeek + (raw - wPeek) * RESIST;
  return raw;
}

// Spine center vertical offset from card top: 3px stripe + 16px pad + ~40px year + 10px pad + 70px/2 spine = 114px
const SPINE_TOP_FROM_CARD = 114;

// ── SpinePulse — 3-track neon convoy ────────────────────────────────
// Architecture:
//   - 3 traveling lights loop continuously left → right → wrap to left
//   - Top + Bottom escorts: dim var(--accent), phase-offset behind center by 28px
//   - Center: category-colored comet with tail, snaps color at card boundary
//   - At each node: center flashes (2 spins), escorts pulse outward briefly
//   - Future cards: center drops to var(--accent) — loses identity
//   - Speed: slows 40% approaching node, accelerates away
// All static lines are removed from FoldPanel — these 3 are the only spines.

const ESCORT_OFFSET  = 28;  // px behind center light
const COMET_LEN      = 48;  // px length of comet tail

function SpinePulse({
  isMobile, onFlash, measureKey, filterKey, interactingRef,
}:{
  isMobile:boolean; onFlash:(n:number)=>void;
  measureKey:number; filterKey:string;
  interactingRef: React.MutableRefObject<boolean>;
}) {
  const SPEED_FRAC = 0.11; // overlay widths per second — cross visible area in ~9s

  const [cx,          setCx]          = useState(0);
  const [escortX,     setEscortX]     = useState(0);
  const [centerColor, setCenterColor] = useState("var(--accent)");
  const [escortRipple, setRipple]     = useState(false);
  const [escortPaused, setPause]      = useState(false);
  const [spineTop,    setSpineTop]    = useState(100);

  const overlayRef      = useRef<HTMLDivElement>(null);
  const rafRef          = useRef(0);
  const lastRef         = useRef(performance.now());
  const xRef            = useRef(0);
  const flashSet        = useRef(new Set<number>());
  const dirtyRef        = useRef(true);
  const currentColorRef = useRef("var(--accent)");
  const overlayWidthRef = useRef(800);
  const spineTopRef     = useRef(100);
  const nodesRef        = useRef<{x:number; idx:number; color:string}[]>([]);
  const cardBoundsRef   = useRef<{x:number; color:string}[]>([]);

  function measure() {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const oRect = overlay.getBoundingClientRect();
    const W     = oRect.width;
    overlayWidthRef.current = W;

    // Spine row top position
    const spineRow = overlay.parentElement?.querySelector("[data-tl-spine='row']") as HTMLElement|null;
    if (spineRow) {
      const pRect = overlay.parentElement!.getBoundingClientRect();
      spineTopRef.current = Math.round(spineRow.getBoundingClientRect().top - pRect.top);
    }

    // ── Card left borders — color snapping reference ──────────────────────
    // The moment the comet crosses a card's left edge it adopts that card's color.
    // Measured from [data-tl-color] elements — always reflects current card width.
    const cards = Array.from(document.querySelectorAll("[data-tl-color]"));
    const bounds: {x:number; color:string}[] = [];
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      const x = r.left - oRect.left;
      bounds.push({ x, color: card.getAttribute("data-tl-color") ?? "var(--accent)" });
    }
    cardBoundsRef.current = bounds.sort((a, b) => a.x - b.x);

    // ── Node dot centers — flash timing reference ─────────────────────────
    // The flash fires exactly when the comet reaches a node dot's center.
    // Measured from [data-tl-node] elements — always reflects current card width.
    const dots = Array.from(document.querySelectorAll("[data-tl-node]"));
    const nodes: {x:number; idx:number; color:string}[] = [];
    for (const dot of dots) {
      const r = dot.getBoundingClientRect();
      const x = r.left + r.width / 2 - oRect.left;
      if (x < -10 || x > W + 10) continue;
      nodes.push({
        x,
        idx:   parseInt(dot.getAttribute("data-tl-node") ?? "0"),
        color: dot.getAttribute("data-tl-node-color") ?? "var(--accent)",
      });
    }
    nodesRef.current = nodes.sort((a, b) => a.x - b.x);
    setSpineTop(spineTopRef.current);
  }

  // Soft remeasure when scroll or card width changes — keep xRef position
  useEffect(() => { dirtyRef.current = true; }, [measureKey]);

  // Hard reset when filter changes — restart light from left
  useEffect(() => {
    xRef.current = 0;
    flashSet.current.clear();
    currentColorRef.current = "var(--accent)";
    dirtyRef.current = true;
  }, [filterKey]);

  // Resize listener
  useEffect(() => {
    const onResize = () => { dirtyRef.current = true; };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── RAF loop ─────────────────────────────────────────────────────────
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      xRef.current = 0;
      flashSet.current.clear();
      mountedRef.current = true;
    }
    dirtyRef.current = true;
    lastRef.current = performance.now();

    function tick(now: number) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05); // cap at 50ms
      lastRef.current = now;

      // Soft remeasure — during interaction measure every frame so card
      // drag/peek/open never causes stale left-border or node positions
      if (dirtyRef.current || interactingRef.current) {
        measure();
        dirtyRef.current = false;
      }

      const W       = overlayWidthRef.current;
      const SPEED   = W * SPEED_FRAC;
      const WRAP_AT = W + ESCORT_OFFSET + COMET_LEN + 4;

      xRef.current += SPEED * dt;

      // Restart once escort tail has cleared the right edge
      if (xRef.current >= WRAP_AT) {
        xRef.current = 0;
        flashSet.current.clear();
        currentColorRef.current = "var(--accent)";
      }

      // ── Color snap — card LEFT BORDER ────────────────────────────────────
      // The moment the comet crosses a card's left edge it takes that card's color.
      // Walk boundaries in order — last one the comet has passed wins.
      let color = "var(--accent)";
      for (const bound of cardBoundsRef.current) {
        if (xRef.current >= bound.x) color = bound.color;
        else break;
      }
      currentColorRef.current = color;

      // ── Flash — NODE DOT CENTER ───────────────────────────────────────────
      // Fires exactly once per pass when comet head is within 6px of the node dot.
      for (const node of nodesRef.current) {
        if (!flashSet.current.has(node.idx) && Math.abs(xRef.current - node.x) < 6) {
          flashSet.current.add(node.idx);
          onFlash(node.idx);
          setPause(true);
          setRipple(true);
          setTimeout(() => { onFlash(-1); setPause(false); }, 700);
          setTimeout(() => { setRipple(false); }, 900);
        }
      }

      setCx(xRef.current);
      setEscortX(Math.max(0, xRef.current - ESCORT_OFFSET));
      setCenterColor(currentColorRef.current);

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // empty — dirty flag handles all updates

  const escortOpacity = escortPaused ? 0.04 : escortRipple ? 0.35 : 0.12;
  const COMET_H = 3;
  const ESCORT_H = 1;
  const TOP_Y    = 14;
  const CENTER_Y = 35;
  const BOT_Y    = 56;

  return (
    <div ref={overlayRef} style={{
      position:"absolute", left:0, right:0,
      top: spineTop,
      height:70,
      pointerEvents:"none", zIndex:8,
      overflow:"hidden",
    }}>
      {/* Top escort */}
      <div style={{ position:"absolute", top:TOP_Y - 0.5, left:escortX - COMET_LEN, width:COMET_LEN, height:ESCORT_H+1,
        background:`linear-gradient(to right,transparent,var(--accent))`,
        opacity:escortOpacity, transition:"opacity 0.15s", zIndex:9 }} />

      {/* Center static guide rail */}
      <div style={{ position:"absolute", top:CENTER_Y, left:0, right:0, height:1, background:"rgba(255,255,255,0.08)" }} />
      {/* Center comet tail */}
      <div style={{ position:"absolute", top:CENTER_Y - COMET_H/2, left:cx - COMET_LEN, width:COMET_LEN, height:COMET_H,
        background:`linear-gradient(to right,transparent,${centerColor})`,
        opacity:0.85, zIndex:10, borderRadius:"0 2px 2px 0" }} />
      {/* Center leading head */}
      <div style={{ position:"absolute", top:CENTER_Y - COMET_H/2 - 1, left:cx - 4, width:10, height:COMET_H+2,
        background:centerColor, opacity:0.95, borderRadius:2,
        boxShadow:`0 0 8px ${centerColor},0 0 20px ${centerColor}80`, zIndex:11 }} />

      {/* Bottom escort */}
      <div style={{ position:"absolute", top:BOT_Y - 0.5, left:escortX - COMET_LEN, width:COMET_LEN, height:ESCORT_H+1,
        background:`linear-gradient(to right,transparent,var(--accent))`,
        opacity:escortOpacity, transition:"opacity 0.15s", zIndex:9 }} />
    </div>
  );
}


// ── Fold panel ────────────────────────────────────────────────────────
function FoldPanel({ node, cardIndex, isActive, isFocused, onOpenPanel, onFocus, isMobile=false, flashingNode=-1, onWidthChange }:{
  node:TNode; cardIndex:number; isActive:boolean; isFocused:boolean;
  onOpenPanel:(n:TNode)=>void; onFocus:()=>void;
  isMobile?:boolean; flashingNode?:number; onWidthChange?:(idx:number,w:number)=>void;
}) {
  const wOpen  = isMobile ? W_OPEN_M  : W_OPEN;
  const wPeek  = isMobile ? W_PEEK_M  : W_PEEK;
  const imgH   = isMobile ? 100       : 150;

  const [width, setWidth]       = useState(wOpen);
  const [dragging, setDragging] = useState(false);
  const startXRef    = useRef(0); const startWRef = useRef(wOpen);
  const velRef       = useRef(0); const lastXRef  = useRef(0);
  const lastTRef     = useRef(0); const movedRef  = useRef(false);
  const lastClickRef = useRef(0);

  const cat    = getCat(node.category);
  const isPeek = width <= wPeek + 8;
  const isOpen = !isPeek;
  const foldRatio     = 1 - Math.max(0, Math.min(1, (width-wPeek)/(wOpen-wPeek)));
  const creaseOpacity = 0.04 + foldRatio * 0.36;
  const tensionRatio  = dragging ? Math.max(0, Math.min(1, (wPeek - width) / (wPeek - W_FLOOR))) : 0;
  const tensionColor  = tensionRatio < 0.5
    ? `rgb(${Math.round(220+tensionRatio*2*35)},${Math.round(180-tensionRatio*2*80)},${Math.round(60-tensionRatio*2*60)})`
    : `rgb(255,${Math.round(20+(1-tensionRatio)*2*80)},20)`;
  const tensionWidth  = tensionRatio * 100;
  const isFlashing    = flashingNode === cardIndex;

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
    setWidth(resist(startWRef.current+(e.clientX-startXRef.current), wOpen, wPeek));
  },[dragging, wOpen, wPeek]);

  const onHandleUp = useCallback(()=>{
    if (!dragging) return;
    setDragging(false);
    const snapped = snapTo(width, velRef.current, wOpen, wPeek);
    setWidth(snapped);
    onWidthChange?.(cardIndex, snapped);
  },[dragging, width, wOpen, wPeek, cardIndex, onWidthChange]);

  function handleClick() {
    if (movedRef.current) { movedRef.current=false; return; }
    onFocus();
    if (isPeek) { setWidth(wOpen); onWidthChange?.(cardIndex, wOpen); return; }
    const now=Date.now(), gap=now-lastClickRef.current;
    lastClickRef.current=now;
    if (gap < 350) { onOpenPanel(node); lastClickRef.current=0; }
  }

  return (
    <motion.div
      animate={{ width }}
      transition={dragging?{duration:0}:SPRING}
      data-tl-color={cat.color}
      style={{ flexShrink:0, position:"relative", height:"100%", zIndex:isPeek?1:2 }}
    >
      {/* Shadow layer */}
      <div style={{ position:"absolute", inset:0,
        boxShadow: isPeek ? "8px 0 24px rgba(0,0,0,0.7),14px 0 36px rgba(0,0,0,0.4)" : "4px 0 14px rgba(0,0,0,0.4),6px 0 20px rgba(0,0,0,0.2)",
        transition:"box-shadow 0.4s ease", pointerEvents:"none", zIndex:0 }} />

      {/* Paper face */}
      <div onClick={handleClick} style={{
        position:"absolute", inset:0,
        background:isActive?"var(--bg-elevated)":"var(--bg-secondary)",
        borderRight:"1px solid rgba(255,255,255,0.07)",
        borderLeft:isActive?`2px solid ${cat.color}`:"1px solid rgba(255,255,255,0.04)",
        display:"flex", flexDirection:"column", overflow:"hidden",
        cursor:isPeek?"e-resize":dragging?"grabbing":"pointer",
        transition:"background 300ms ease,border-color 300ms ease",
        outline:isFocused?`2px solid ${cat.color}`:"none", outlineOffset:-2, zIndex:1,
      }}>

        {/* Top stripe */}
        <div style={{ height:3, flexShrink:0, background:cat.color, opacity:isPeek?0.45:1, transition:"opacity 0.3s" }} />

        {/* Active corners */}
        {isActive && <div style={{ position:"absolute", inset:-1, pointerEvents:"none", zIndex:4,
          boxShadow:`0 0 0 1px ${cat.color}50,inset 0 0 24px ${cat.color}08`,
          background:`
            linear-gradient(${cat.color},${cat.color}) top left/12px 1.5px no-repeat,
            linear-gradient(${cat.color},${cat.color}) top left/1.5px 12px no-repeat,
            linear-gradient(${cat.color},${cat.color}) bottom right/12px 1.5px no-repeat,
            linear-gradient(${cat.color},${cat.color}) bottom right/1.5px 12px no-repeat`,
        }} />}

        {/* Year header */}
        <div style={{ padding:"16px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0, overflow:"hidden", whiteSpace:"nowrap", position:"relative" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"2.5rem", fontWeight:500, letterSpacing:"-0.02em", lineHeight:1, color:cat.color, marginBottom:3 }}>{node.period}</div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:".95rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", opacity:isPeek?0:1, transition:"opacity 0.12s" }}>
            {node.date_label || node.category}
          </div>
          {!isPeek && (
            <div style={{ position:"absolute", top:10, right:12, fontFamily:"var(--font-display)", fontSize:"2.2rem", fontWeight:700, lineHeight:1, color:cat.color, opacity:0.1, pointerEvents:"none", letterSpacing:"-0.02em", mixBlendMode:"screen" }}>
              {String(cardIndex+1).padStart(2,"0")}
            </div>
          )}
        </div>

        {/* Spine row — data attr lets SpinePulse measure exact position */}
        <div data-tl-spine="row" style={{ height:70, flexShrink:0, position:"relative", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center" }}>
          {/* No static rails here — SpinePulse overlay owns all 3 spine tracks */}
          {/* Node dot — data attrs let SpinePulse measure exact position */}
          <div data-tl-node={cardIndex} data-tl-node-color={cat.color} style={{
            position:"absolute", left:16, top:"50%", transform:"translateY(-50%)",
            width:14, height:14, borderRadius:"50%", opacity:0.7,
            background:cat.color, border:"2px solid var(--bg-primary)", zIndex:2,
            boxShadow: isFlashing
              ? `0 0 0 5px ${cat.color}50,0 0 22px ${cat.color},0 0 44px ${cat.color}80`
              : isActive
              ? `0 0 0 3px ${cat.color}40,0 0 14px ${cat.color}80`
              : `0 0 0 2px ${cat.color}30`,
            transition:"box-shadow 0.15s",
            animation: isFlashing
              ? "tl-node-flash 0.35s ease-in-out 2"
              : isActive ? "tl-dot-pulse 2.2s ease-in-out infinite" : "none",
          }} />
        </div>

        {/* Badge — always visible, dimmed when open */}
        <div style={{ padding:"10px 16px 0", flexShrink:0, opacity:isPeek?1:0.5, transition:"opacity 0.3s" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, color:cat.color, fontFamily:"var(--font-body)", fontSize:"1rem", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700 }}>
            {getCat(node.category).icon}<span>{node.category}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, padding:"4px 16px 0", display:"flex", flexDirection:"column", gap:8, overflow:"hidden", opacity:isPeek?0:1, transition:"opacity 0.1s" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"1.5rem", fontWeight:500, lineHeight:1.25, color:"var(--text-primary)", letterSpacing:"0.01em" }}>{node.title}</div>
          <div style={{ fontFamily:"var(--font-body)", fontSize:"1rem", color:"rgba(200,210,220,0.75)", lineHeight:1.6, flex:1, overflow:"hidden" }}>{node.description}</div>
          <div style={{ height:imgH, flexShrink:0, marginTop:"auto", marginBottom:12, overflow:"hidden", border:"0.5px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {node.image_url
              ? <img src={node.image_url} alt={node.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              : <span style={{ fontFamily:"var(--font-mono)", fontSize:"0.9rem", letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(255,255,255,0.12)" }}>no image</span>
            }
          </div>
        </div>

        {/* Peek tab */}
        {isPeek && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
            <div style={{ position:"relative", width:7, height:7, flexShrink:0 }}>
              {/* Breathing pulse ring — category colored, slow radial expand */}
              <div style={{
                position:"absolute", inset:-5,
                borderRadius:"50%",
                border:`1px solid ${cat.color}`,
                animation:"tl-peek-breathe 3s ease-in-out infinite",
                pointerEvents:"none",
              }} />
              {/* Core dot */}
              <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:cat.color, boxShadow:`0 0 6px ${cat.color}` }} />
            </div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:400, color:cat.color, opacity:0.6, writingMode:"vertical-rl", transform:"rotate(180deg)", whiteSpace:"nowrap", letterSpacing:"0.18em" }}>{node.period}</div>
            <div style={{ position:"absolute", bottom:8, right:10, fontFamily:"var(--font-display)", fontSize:"2.4rem", fontWeight:700, lineHeight:1, color:cat.color, opacity:0.14, pointerEvents:"none", zIndex:1, letterSpacing:"-0.02em", mixBlendMode:"screen" }}>
              {String(cardIndex+1).padStart(2,"0")}
            </div>
          </div>
        )}

        {/* Crease */}
        {isOpen && <div style={{ position:"absolute", top:0, right:0, bottom:0, width:`${14+foldRatio*14}px`, background:`linear-gradient(to right,transparent,rgba(0,0,0,${creaseOpacity}))`, pointerEvents:"none", zIndex:3, transition:dragging?"none":"width 0.2s" }} />}
        {foldRatio > 0.04 && <div style={{ position:"absolute", inset:0, background:`rgba(0,0,0,${foldRatio*0.16})`, pointerEvents:"none", zIndex:2, transition:dragging?"none":"background 0.15s" }} />}

        {/* Tension bar */}
        {tensionRatio > 0 && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4, zIndex:10, pointerEvents:"none", overflow:"hidden", background:"rgba(0,0,0,0.3)" }}>
            <div style={{ position:"absolute", bottom:0, left:0, width:`${tensionWidth}%`, height:"100%", background:tensionColor, transition:"none", boxShadow:`0 0 8px ${tensionColor},0 0 16px ${tensionColor}60` }} />
          </div>
        )}
      </div>

      {/* Drag handle */}
      <div onPointerDown={onHandleDown} onPointerMove={onHandleMove} onPointerUp={onHandleUp} onPointerCancel={onHandleUp}
        onMouseDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}
        style={{ position:"absolute", top:0, right:0, bottom:0, width:18, cursor:"ew-resize", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", touchAction:"none" }}>
        <div style={{ width:6, height:dragging?44:28, borderRadius:2, background:dragging?cat.color:"rgba(255,255,255,0.12)", transition:"height 0.2s,background 0.2s" }} />
      </div>
    </motion.div>
  );
}

// ── Future ghost ──────────────────────────────────────────────────────
function FutureFold({ label, opacity, wOpen=W_OPEN, isMobile=false }:{
  label:string; opacity:number; wOpen?:number; isMobile?:boolean;
}) {
  const wPeek = isMobile ? W_PEEK_M : W_PEEK;
  const [width, setWidth] = useState(wOpen);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0); const startWRef = useRef(wOpen);
  const velRef = useRef(0); const lastXRef = useRef(0); const lastTRef = useRef(0);

  const isPeek = width <= wPeek + 8;

  const onHandleDown = useCallback((e:React.PointerEvent)=>{
    e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    startXRef.current=e.clientX; startWRef.current=width;
    velRef.current=0; lastXRef.current=e.clientX; lastTRef.current=e.timeStamp;
  },[width]);

  const onHandleMove = useCallback((e:React.PointerEvent)=>{
    if (!dragging) return;
    const dt=e.timeStamp-lastTRef.current;
    if (dt>0) velRef.current=(e.clientX-lastXRef.current)/dt;
    lastXRef.current=e.clientX; lastTRef.current=e.timeStamp;
    setWidth(resist(startWRef.current+(e.clientX-startXRef.current), wOpen, wPeek));
  },[dragging, wOpen, wPeek]);

  const onHandleUp = useCallback(()=>{
    if (!dragging) return;
    setDragging(false);
    setWidth(snapTo(width, velRef.current, wOpen, wPeek));
  },[dragging, width, wOpen, wPeek]);

  return (
    <motion.div
      animate={{ width }}
      transition={dragging?{duration:0}:SPRING}
      data-tl-color="var(--accent)"
      style={{ flexShrink:0, position:"relative", height:"100%", zIndex:1 }}
    >
      {/* Paper face */}
      <div style={{
        position:"absolute", inset:0,
        background:"rgba(255,255,255,0.015)",
        borderRight:"1px solid rgba(255,255,255,0.04)",
        borderLeft:"1px solid rgba(255,255,255,0.03)",
        display:"flex", flexDirection:"column", overflow:"hidden",
        opacity,
      }}>
        {/* Top stripe — dim */}
        <div style={{ height:3, background:"rgba(255,255,255,0.08)", flexShrink:0 }} />

        {/* Year header */}
        <div style={{ padding:"16px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.05)", flexShrink:0, overflow:"hidden", whiteSpace:"nowrap", position:"relative" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"2.5rem", fontWeight:500, letterSpacing:"-0.02em", lineHeight:1, color:"rgba(255,255,255,0.35)", marginBottom:3 }}>
            {isPeek ? "?" : "Soon"}
          </div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:".95rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", opacity:isPeek?0:1, transition:"opacity 0.12s" }}>
            Next
          </div>
        </div>

        {/* Spine row — no static lines, SpinePulse covers */}
        <div style={{ height:70, flexShrink:0, position:"relative", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"flex", alignItems:"center" }}>
          <div style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", width:11, height:11, borderRadius:"50%", border:"1px dashed rgba(255,255,255,0.2)", zIndex:2 }} />
        </div>

        {/* Badge */}
        <div style={{ padding:"10px 16px 0", flexShrink:0, opacity:isPeek?1:0.5, transition:"opacity 0.3s" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, color:"rgba(255,255,255,0.4)", fontFamily:"var(--font-body)", fontSize:"1rem", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:700 }}>
            Future
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, padding:"4px 16px 0", display:"flex", flexDirection:"column", gap:8, overflow:"hidden", opacity:isPeek?0:1, transition:"opacity 0.1s" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"1.5rem", fontWeight:500, lineHeight:1.25, color:"rgba(255,255,255,0.5)", letterSpacing:"0.01em" }}>{label}</div>
          <div style={{ fontFamily:"var(--font-body)", fontSize:"1rem", color:"rgba(255,255,255,0.3)", lineHeight:1.6 }}>Coming soon...</div>
        </div>

        {/* Peek tab */}
        {isPeek && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", border:"1px dashed rgba(255,255,255,0.25)", flexShrink:0 }} />
            <div style={{ fontFamily:"var(--font-display)", fontSize:"1rem", fontWeight:400, color:"rgba(255,255,255,0.3)", writingMode:"vertical-rl", transform:"rotate(180deg)", whiteSpace:"nowrap", letterSpacing:"0.18em" }}>Soon</div>
          </div>
        )}
      </div>

      {/* Drag handle — same as FoldPanel */}
      <div
        onPointerDown={onHandleDown} onPointerMove={onHandleMove}
        onPointerUp={onHandleUp}    onPointerCancel={onHandleUp}
        onMouseDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()}
        style={{ position:"absolute", top:0, right:0, bottom:0, width:18, cursor:"ew-resize", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center", touchAction:"none" }}
      >
        <div style={{ width:6, height:dragging?44:28, borderRadius:2, background:dragging?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.1)", transition:"height 0.2s,background 0.2s" }} />
      </div>
    </motion.div>
  );
}

// ── Floating scroll arrows — bottom center ────────────────────────────
function ScrollArrows({ canLeft, canRight, onLeft, onRight, interacting }:{
  canLeft:boolean; canRight:boolean; onLeft:()=>void; onRight:()=>void; interacting:boolean;
}) {
  const [idle, setIdle]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);

  function resetIdle() {
    setIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(()=>setIdle(true), 15000);
  }

  useEffect(()=>{
    if (interacting) { setIdle(false); return; }
    resetIdle();
    return ()=>{ if(timerRef.current) clearTimeout(timerRef.current); };
  },[interacting]);

  if (!canLeft && !canRight) return null;

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:4, marginTop:16 }}>
      <button
        onClick={()=>{ if(canLeft&&!interacting){ onLeft(); resetIdle(); }}}
        aria-label="Scroll left"
        style={{
          background:"none", border:"none", cursor:canLeft&&!interacting?"pointer":"default",
          color:"var(--accent)", display:"flex", alignItems:"center", padding:"6px 10px",
          opacity: interacting ? 0 : !canLeft ? 0 : idle ? 0.12 : 0.65,
          transition:"opacity 600ms ease",
          pointerEvents: interacting || !canLeft ? "none" : "all",
        }}>
        <MdOutlineKeyboardDoubleArrowLeft size={26}
          style={{ animation:canLeft&&!interacting&&!idle?"tl-arrow-l 1.3s ease-in-out infinite":"none" }} />
      </button>

      <span style={{
        fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase",
        color:"rgba(255,255,255,0.2)",
        opacity: interacting ? 0 : idle ? 0.15 : 0.5,
        transition:"opacity 600ms ease",
      }}>scroll</span>

      <button
        onClick={()=>{ if(canRight&&!interacting){ onRight(); resetIdle(); }}}
        aria-label="Scroll right"
        style={{
          background:"none", border:"none", cursor:canRight&&!interacting?"pointer":"default",
          color:"var(--accent)", display:"flex", alignItems:"center", padding:"6px 10px",
          opacity: interacting ? 0 : !canRight ? 0 : idle ? 0.12 : 0.65,
          transition:"opacity 600ms ease",
          pointerEvents: interacting || !canRight ? "none" : "all",
        }}>
        <MdOutlineKeyboardDoubleArrowRight size={26}
          style={{ animation:canRight&&!interacting&&!idle?"tl-arrow-r 1.3s ease-in-out infinite":"none" }} />
      </button>
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────
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
          <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, pointerEvents:"none" }}>
            <motion.div key="pn" initial={{ opacity:0, y:24, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:16, scale:0.98 }} transition={SPRING}
              style={{ width:"min(748px,92vw)", maxHeight:"90vh", background:"var(--bg-elevated)", border:"1px solid var(--border)", display:"flex", flexDirection:"column", overflow:"hidden", pointerEvents:"all", position:"relative" }}>
              <div style={{ height:3, flexShrink:0, background:cat?.color }} />
              <div style={{ position:"absolute", inset:4, border:"1px solid rgba(255,255,255,0.05)", borderRadius:6, pointerEvents:"none", zIndex:0 }} />
              <div style={{ position:"absolute", inset:-1, pointerEvents:"none", zIndex:2, background:`
                linear-gradient(${cat?.color},${cat?.color}) top left/14px 1.5px no-repeat,
                linear-gradient(${cat?.color},${cat?.color}) top left/1.5px 14px no-repeat,
                linear-gradient(${cat?.color},${cat?.color}) bottom right/14px 1.5px no-repeat,
                linear-gradient(${cat?.color},${cat?.color}) bottom right/1.5px 14px no-repeat` }} />
              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0, position:"relative", zIndex:3 }}>
                <div style={{ position:"absolute", right:80, top:"50%", transform:"translateY(-50%)", fontFamily:"var(--font-display)", fontSize:"2.2rem", fontWeight:700, lineHeight:1, letterSpacing:"-0.02em", color:cat?.color, opacity:0.1, pointerEvents:"none", zIndex:0, mixBlendMode:"screen" }}>
                  {String(index+1).padStart(2,"0")}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, position:"relative", zIndex:1 }}>
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
                  <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", background:`${cat?.color}18`, border:`1px solid ${cat?.color}30`, marginBottom:18, fontFamily:"var(--font-body)", fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color:cat?.color, fontWeight:600 }}>{cat?.icon}{node.category}</div>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:"0.875rem", color:"rgba(200,215,225,0.75)", lineHeight:1.78, margin:0 }}>{node.description}</p>
                </div>
              </div>
              {/* Footer */}
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"12px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0, zIndex:3, background:"var(--bg-elevated)" }}>
                {([
                  { dir:-1 as const, icon:<ChevronLeft size={12} style={{ pointerEvents:"none" }}/>, label:index>0?allNodes[index-1].title:"—", ok:index>0, align:"flex-start" as const },
                  { dir:+1 as const, icon:<ChevronRight size={12} style={{ pointerEvents:"none" }}/>, label:index<allNodes.length-1?allNodes[index+1].title:"—", ok:index<allNodes.length-1, align:"flex-end" as const },
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

// ── Main ──────────────────────────────────────────────────────────────
export default function Timeline() {
  const [nodes, setNodes]              = useState<TNode[]>(FALLBACK);
  const [filter, setFilter]            = useState("All");
  const [panelNode, setPanelNode]      = useState<TNode|null>(null);
  const [panelIndex, setPanelIndex]    = useState(0);
  const [canRight, setCanRight]        = useState(false);
  const [canLeft, setCanLeft]          = useState(false);
  const [canMobileRight, setCanMobileRight] = useState(false);
  const [scrollOverdrag, setScrollOverdrag] = useState(0);
  const [focusedIdx, setFocusedIdx]    = useState<number|null>(null);
  const [interacting, setInteracting]  = useState(false);
  const [flashingNode, setFlashingNode]= useState(-1);
  const [measureKey, setMeasureKey]     = useState(0);
  // Ref mirror of interacting — readable by RAF loop without causing re-renders
  const interactingRef = useRef(false);

  const trackRef      = useRef<HTMLDivElement>(null);
  const mobilTrackRef = useRef<HTMLDivElement>(null);
  const isDragRef  = useRef(false);
  const startXRef  = useRef(0);
  const scrollRef  = useRef(0);
  const movedRef   = useRef(false);
  const isDragMRef = useRef(false);
  const startXMRef = useRef(0);
  const scrollMRef = useRef(0);
  const interactTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(()=>{ fetch("/api/timeline").then(r=>r.json()).then((d:TNode[])=>{ if(d?.length) setNodes(d); }).catch(()=>{}); },[]);

  // Global pointer-up
  useEffect(()=>{
    function globalUp() {
      if (isDragRef.current) { isDragRef.current=false; setScrollOverdrag(0); }
      if (isDragMRef.current) isDragMRef.current=false;
      endInteract();
    }
    window.addEventListener("pointerup",globalUp);
    window.addEventListener("pointercancel",globalUp);
    return ()=>{ window.removeEventListener("pointerup",globalUp); window.removeEventListener("pointercancel",globalUp); };
  },[]);

  function startInteract() {
    setInteracting(true);
    interactingRef.current = true;
    if (interactTimer.current) clearTimeout(interactTimer.current);
  }
  function endInteract() {
    if (interactTimer.current) clearTimeout(interactTimer.current);
    interactTimer.current = setTimeout(()=>{ setInteracting(false); interactingRef.current = false; }, 800);
  }

  const filtered    = filter==="All"?nodes:nodes.filter(n=>n.category===filter);

  // Increment measureKey on filter change so SpinePulse hard-resets
  useEffect(()=>{ setMeasureKey(k=>k+1); },[filter]);

  // Trigger initial measure when timeline scrolls into view —
  // delay 300ms so all cards are fully painted before SpinePulse reads positions
  useEffect(()=>{
    const el = document.getElementById("timeline");
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setMeasureKey(k => k + 1), 300);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function openPanel(node:TNode) { const idx=filtered.findIndex(n=>n.id===node.id); setPanelNode(node); setPanelIndex(idx); }
  function navigate(idx:number) { if(idx<0||idx>=filtered.length) return; setPanelNode(filtered[idx]); setPanelIndex(idx); }

  function checkScroll() {
    const el=trackRef.current; if(!el) return;
    setCanRight(el.scrollLeft<el.scrollWidth-el.clientWidth-4);
    setCanLeft(el.scrollLeft>4);
  }
  function checkMobileScroll() { const el=mobilTrackRef.current; if(!el) return; setCanMobileRight(el.scrollLeft<el.scrollWidth-el.clientWidth-4); }
  useEffect(()=>{ setTimeout(checkScroll,100); setTimeout(checkMobileScroll,100); },[filtered.length]);

  function onDown(e:React.PointerEvent) {
    isDragRef.current=true; movedRef.current=false;
    startXRef.current=e.pageX; scrollRef.current=trackRef.current?.scrollLeft??0;
    setScrollOverdrag(0); startInteract();
  }
  function onMove(e:React.PointerEvent) {
    if (!isDragRef.current) return;
    const dx=e.pageX-startXRef.current;
    if (Math.abs(dx)>8) movedRef.current=true;
    if (trackRef.current) {
      const raw=scrollRef.current-dx;
      if (raw<0) { trackRef.current.scrollLeft=0; setScrollOverdrag(raw*0.18); }
      else       { trackRef.current.scrollLeft=raw; setScrollOverdrag(0); }
      checkScroll();
    }
  }
  function onUp() { isDragRef.current=false; setScrollOverdrag(0); endInteract(); }

  function onMobileDown(e:React.PointerEvent) { isDragMRef.current=true; startXMRef.current=e.pageX; scrollMRef.current=mobilTrackRef.current?.scrollLeft??0; startInteract(); }
  function onMobileMove(e:React.PointerEvent) { if(!isDragMRef.current) return; const dx=e.pageX-startXMRef.current; if(mobilTrackRef.current){ mobilTrackRef.current.scrollLeft=Math.max(0,scrollMRef.current-dx); checkMobileScroll(); } }
  function onMobileUp() { isDragMRef.current=false; endInteract(); }

  function scrollLeft()  { trackRef.current?.scrollBy({left:-W_OPEN,behavior:"smooth"}); setTimeout(checkScroll,350); }
  function scrollRight() { trackRef.current?.scrollBy({left:W_OPEN, behavior:"smooth"}); setTimeout(checkScroll,350); }

  useEffect(()=>{
    if(panelNode) return;
    function onKey(e:KeyboardEvent) {
      const tl=document.getElementById("timeline"); if(!tl) return;
      const r=tl.getBoundingClientRect(); if(r.top>window.innerHeight||r.bottom<0) return;
      if(e.key==="ArrowRight"){ e.preventDefault(); setFocusedIdx(p=>p===null?0:Math.min(p+1,filtered.length-1)); }
      else if(e.key==="ArrowLeft"){ e.preventDefault(); setFocusedIdx(p=>p===null?0:Math.max(p-1,0)); }
      else if(e.key==="Enter"&&focusedIdx!==null){ e.preventDefault(); openPanel(filtered[focusedIdx]); }
      else if(e.key==="Escape") setFocusedIdx(null);
    }
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[filtered,focusedIdx,panelNode]);

  return (
    <section id="timeline" className="section-pad" aria-labelledby="timeline-heading" style={{ backgroundColor:"var(--bg-primary)", userSelect:"none", WebkitUserSelect:"none" }}>
      <div className="site-container">
        <SectionLabel>04 — Timeline</SectionLabel>
        <h2 id="timeline-heading" className="sr-only">Timeline</h2>
        <TabBar tabs={FILTER_TABS} active={filter} onChange={label=>{ setFilter(label); setPanelNode(null); setFocusedIdx(null); }} />
      </div>

      {/* ── Desktop ── */}
      <div className="timeline-desktop">
        <div className="site-container" style={{ padding:0 }}>
          <div style={{ position:"relative" }}>
            <div style={{
              display:"flex",
              transform:scrollOverdrag?`translateX(${scrollOverdrag}px)`:"none",
              transition:isDragRef.current?"none":"transform 0.55s cubic-bezier(0.22,1,0.36,1)",
              position:"relative",
            }}>
              {/* SpinePulse overlay — covers full strip */}
              {filtered.length > 0 && (
                <SpinePulse
                  isMobile={false}
                  onFlash={setFlashingNode}
                  measureKey={measureKey}
                  filterKey={filter}
                  interactingRef={interactingRef}
                />
              )}

              {/* Sticky first card */}
              {filtered.length > 0 && (
                <div style={{ flexShrink:0, zIndex:4 }}>
                  <FoldPanel key={filtered[0].id} node={filtered[0]} cardIndex={0}
                    isActive={panelNode?.id===filtered[0].id} isFocused={focusedIdx===0}
                    onOpenPanel={openPanel} onFocus={()=>setFocusedIdx(0)} flashingNode={flashingNode} onWidthChange={()=>setMeasureKey(k=>k+1)} />
                </div>
              )}

              {/* Scrollable strip */}
              <div ref={trackRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                onScroll={()=>{ checkScroll(); setMeasureKey(k=>k+1); }}
                style={{ overflowX:"auto", overflowY:"hidden", scrollbarWidth:"none", cursor:"grab", flex:1, touchAction:"pan-y" }}>
                <div style={{ display:"flex", height:H_TRACK, minWidth:"max-content" }}>
                  <AnimatePresence mode="popLayout">
                    {filtered.slice(1).map((node,i)=>(
                      <FoldPanel key={node.id} node={node} cardIndex={i+1}
                        isActive={panelNode?.id===node.id} isFocused={focusedIdx===i+1}
                        onOpenPanel={openPanel} onFocus={()=>setFocusedIdx(i+1)} flashingNode={flashingNode} onWidthChange={()=>setMeasureKey(k=>k+1)} />
                    ))}
                  </AnimatePresence>
                  {filter==="All"&&FUTURE.map((label,i)=>(
                    <FutureFold key={`f${i}`} label={label} opacity={Math.max(0.08,0.5-i*0.18)} />
                  ))}
                </div>
              </div>
            </div>

            {/* Left tension strip */}
            {scrollOverdrag < -2 && (
              <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, zIndex:20, pointerEvents:"none", overflow:"hidden" }}>
                <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)" }} />
                <div style={{ position:"absolute", bottom:0, left:0, right:0,
                  height:`${Math.min(100,(Math.abs(scrollOverdrag)/60)*100)}%`,
                  background:Math.abs(scrollOverdrag)<6?"var(--accent)":Math.abs(scrollOverdrag)<12?"#f59e0b":"#ef4444",
                  transition:"none" }} />
              </div>
            )}

            {/* Right fade */}
            {canRight&&<div style={{ position:"absolute", top:0, right:0, bottom:0, width:80, background:"linear-gradient(to right,transparent,var(--bg-primary))", pointerEvents:"none", zIndex:5 }} />}
          </div>

          {/* Floating scroll arrows */}
          <ScrollArrows canLeft={canLeft} canRight={canRight} onLeft={scrollLeft} onRight={scrollRight} interacting={interacting} />

          <p style={{ fontFamily:"var(--font-mono)", fontSize:"12px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.14)", textAlign:"center", marginTop:8 }}>
            drag edge → peek · drag back → expand · double-tap open card → detail · ← → keys navigate
          </p>
        </div>
      </div>

      {/* ── Mobile — same fold track ── */}
      <div className="timeline-mobile">
        <div style={{ position:"relative" }}>
          {filtered.length > 0 && (
            <SpinePulse isMobile onFlash={setFlashingNode}
              measureKey={measureKey} filterKey={filter}
              interactingRef={interactingRef} />
          )}
          <div ref={mobilTrackRef} onPointerDown={onMobileDown} onPointerMove={onMobileMove}
            onPointerUp={onMobileUp} onPointerCancel={onMobileUp} onScroll={checkMobileScroll}
            style={{ overflowX:"auto", overflowY:"hidden", scrollbarWidth:"none", cursor:"grab", touchAction:"pan-y" }}>
            <div style={{ display:"flex", height:H_TRACK_M, minWidth:"max-content", paddingLeft:"1rem" }}>
              <AnimatePresence mode="popLayout">
                {filtered.map((node,i)=>(
                  <FoldPanel key={node.id} node={node} cardIndex={i}
                    isActive={panelNode?.id===node.id} isFocused={false}
                    onOpenPanel={openPanel} onFocus={()=>{}} isMobile flashingNode={flashingNode} onWidthChange={()=>setMeasureKey(k=>k+1)} />
                ))}
              </AnimatePresence>
              {filter==="All"&&FUTURE.map((label,i)=>(
                <FutureFold key={`fm${i}`} label={label} opacity={Math.max(0.08,0.5-i*0.18)} wOpen={W_OPEN_M} isMobile />
              ))}
            </div>
          </div>
          {canMobileRight&&<div style={{ position:"absolute", top:0, right:0, bottom:0, width:60, background:"linear-gradient(to right,transparent,var(--bg-primary))", pointerEvents:"none", zIndex:5 }} />}
        </div>
        <p style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.14)", textAlign:"center", marginTop:10 }}>
          drag edge → peek · drag back → expand · double-tap open card → detail
        </p>
      </div>

      <TimelinePanel node={panelNode} allNodes={filtered} index={panelIndex} onClose={()=>setPanelNode(null)} onNavigate={navigate} />

      <style>{`
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
        .timeline-desktop ::-webkit-scrollbar{display:none;}
        .timeline-mobile  ::-webkit-scrollbar{display:none;}
        #timeline{-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;}

        @keyframes tl-dot-pulse{
          0%,100%{box-shadow:0 0 0 2px rgba(255,255,255,0.1),0 0 8px rgba(255,255,255,0.3);}
          50%    {box-shadow:0 0 0 4px rgba(255,255,255,0.06),0 0 16px rgba(255,255,255,0.6);}
        }
        @keyframes tl-node-flash{
          0%  {transform:translateY(-50%) rotate(0deg)   scale(1);}
          25% {transform:translateY(-50%) rotate(180deg) scale(1.45);}
          50% {transform:translateY(-50%) rotate(360deg) scale(1);}
          75% {transform:translateY(-50%) rotate(540deg) scale(1.45);}
          100%{transform:translateY(-50%) rotate(720deg) scale(1);}
        }
        @keyframes tl-peek-breathe{
          0%  { transform:scale(1);   opacity:0.6; }
          50% { transform:scale(2.2); opacity:0;   }
          100%{ transform:scale(1);   opacity:0.6; }
        }
        @keyframes tl-arrow-l{
          0%,100%{transform:translateX(0);   opacity:0.65;}
          50%    {transform:translateX(-5px); opacity:1;}
        }
        @keyframes tl-arrow-r{
          0%,100%{transform:translateX(0);  opacity:0.65;}
          50%    {transform:translateX(5px);opacity:1;}
        }
      `}</style>
    </section>
  );
}
