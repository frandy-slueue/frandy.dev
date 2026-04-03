"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import type { Theme, Mode } from "@/lib/theme";

const ACCENTS: { value: Theme; label: string; dark: string; light: string }[] = [
  { value:"silver", label:"Silver", dark:"#c0c0c0", light:"#4a4a4a" },
  { value:"cobalt", label:"Cobalt", dark:"#3b82f6", light:"#1d4ed8" },
  { value:"ember",  label:"Ember",  dark:"#d4842a", light:"#b45309" },
  { value:"jade",   label:"Jade",   dark:"#3d9970", light:"#065f46" },
];

// ── Desktop: icon button + dropdown panel ─────────────────────────────
export function ThemeToggleDesktop() {
  const { theme, mode, setTheme, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Theme settings"
        style={{
          background:"none", border:"none", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"6px",
          color: open ? "var(--accent)" : "rgba(255,255,255,0.6)",
          transition:"color 200ms ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
      >
        <Palette size={18} strokeWidth={1.5} />
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 12px)", right:0,
          background:"var(--bg-elevated)",
          border:"1px solid var(--border)",
          padding:"16px",
          zIndex:200,
          minWidth:200,
          boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
        }}>
          {/* dframe corners */}
          <div style={{ position:"absolute", inset:-1, pointerEvents:"none",
            background:`
              linear-gradient(var(--accent),var(--accent)) top left/10px 1.5px no-repeat,
              linear-gradient(var(--accent),var(--accent)) top left/1.5px 10px no-repeat,
              linear-gradient(var(--accent),var(--accent)) bottom right/10px 1.5px no-repeat,
              linear-gradient(var(--accent),var(--accent)) bottom right/1.5px 10px no-repeat`,
          }} />

          {/* Mode toggle */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:8 }}>Mode</div>
            <div style={{ display:"flex", border:"1px solid var(--border)", padding:3, gap:3 }}>
              {(["dark","light"] as Mode[]).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  style={{
                    flex:1, padding:"6px 0", border:"none", cursor:"pointer",
                    fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"1px", textTransform:"uppercase",
                    background: mode === m ? "var(--accent)" : "transparent",
                    color: mode === m ? "var(--bg-primary)" : "var(--text-muted)",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                    transition:"background 200ms, color 200ms",
                  }}>
                  {m === "dark" ? <Moon size={11}/> : <Sun size={11}/>}
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Accent swatches */}
          <div>
            <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:8 }}>Accent</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {ACCENTS.map(a => {
                const color = mode === "dark" ? a.dark : a.light;
                const active = theme === a.value;
                return (
                  <button key={a.value} onClick={() => setTheme(a.value)}
                    style={{
                      display:"flex", alignItems:"center", gap:8, padding:"7px 8px",
                      border:`1px solid ${active ? color : "var(--border)"}`,
                      background: active ? `${color}18` : "transparent",
                      cursor:"pointer", transition:"border-color 200ms, background 200ms",
                    }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background:color, flexShrink:0, boxShadow: active ? `0 0 6px ${color}` : "none" }} />
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"1px", textTransform:"uppercase", color: active ? color : "var(--text-muted)" }}>{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mobile: slide-down sheet from top bar ─────────────────────────────
export function ThemeToggleMobile({ visible }: { visible: boolean }) {
  const { theme, mode, setTheme, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  // Hide when BackToTop is visible
  useEffect(() => { if (!visible) setOpen(false); }, [visible]);

  function onDragStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY;
  }
  function onDragMove(e: React.TouchEvent) {
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy < -30) setOpen(false); // drag up to dismiss
  }

  if (!visible) return null;

  return (
    <>
      {/* Floating circle button — top right */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Theme settings"
        className="theme-fab dframe"
        style={{
          position:"fixed", top:14, right:16,
          width:36, height:36,
          background:"var(--bg-elevated)",
          border:"1px solid var(--accent)",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", zIndex:56,
          color:"var(--accent)",
          animation:"glow-pulse 3s ease-in-out infinite",
          transition:"background 200ms, color 200ms",
        }}
      >
        <Palette size={15} strokeWidth={1.5} />
      </button>

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, zIndex:57, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(2px)" }} />
      )}

      {/* Slide-down sheet */}
      <div
        ref={sheetRef}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        style={{
          position:"fixed", top:0, left:0, right:0,
          zIndex:58,
          background:"var(--bg-elevated)",
          borderBottom:"1px solid var(--border)",
          borderBottomLeftRadius:16, borderBottomRightRadius:16,
          padding:"60px 20px 20px",
          transform: open ? "translateY(0)" : "translateY(-110%)",
          transition:"transform 400ms cubic-bezier(0.22,1,0.36,1)",
          boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Drag handle */}
        <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", width:36, height:4, borderRadius:2, background:"var(--border)" }} />

        {/* Mode toggle */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:10 }}>Mode</div>
          <div style={{ display:"flex", border:"1px solid var(--border)", padding:3, gap:3 }}>
            {(["dark","light"] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{
                  flex:1, padding:"10px 0", border:"none", cursor:"pointer",
                  fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"1px", textTransform:"uppercase",
                  background: mode === m ? "var(--accent)" : "transparent",
                  color: mode === m ? "var(--bg-primary)" : "var(--text-muted)",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  transition:"background 200ms, color 200ms",
                }}>
                {m === "dark" ? <Moon size={13}/> : <Sun size={13}/>}
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Accent swatches 2×2 */}
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:"9px", letterSpacing:"2px", textTransform:"uppercase", color:"var(--text-muted)", marginBottom:10 }}>Accent</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {ACCENTS.map(a => {
              const color = mode === "dark" ? a.dark : a.light;
              const active = theme === a.value;
              return (
                <button key={a.value} onClick={() => setTheme(a.value)}
                  style={{
                    display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                    border:`1px solid ${active ? color : "var(--border)"}`,
                    background: active ? `${color}18` : "transparent",
                    cursor:"pointer", transition:"border-color 200ms, background 200ms",
                  }}>
                  <div style={{ width:16, height:16, borderRadius:"50%", background:color, flexShrink:0, boxShadow: active ? `0 0 8px ${color}` : "none" }} />
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:"10px", letterSpacing:"1px", textTransform:"uppercase", color: active ? color : "var(--text-muted)" }}>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
