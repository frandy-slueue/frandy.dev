"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Code2, FolderOpen, Clock, Mail } from "lucide-react";

const NAV_LINKS = [
  { label: "About",    href: "#about" },
  { label: "Skills",   href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Timeline", href: "#timeline" },
  { label: "Contact",  href: "#contact" },
];

const BOTTOM_NAV = [
  { label: "About",    href: "#about",    icon: User },
  { label: "Skills",   href: "#skills",   icon: Code2 },
  { label: "Projects", href: "#projects", icon: FolderOpen },
  { label: "Timeline", href: "#timeline", icon: Clock },
  { label: "Contact",  href: "#contact",  icon: Mail },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeBottom, setActiveBottom] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Top nav ───────────────────────────────────────────── */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "52px",
          zIndex: 50,
          backgroundColor: scrolled ? "rgba(8,8,8,0.95)" : "rgba(8,8,8,0.80)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transition: "background-color 300ms ease",
        }}
      >
        <div
          className="site-container"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div style={{
              width: "28px", height: "28px",
              transform: "rotate(45deg)",
              border: "1.5px solid var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: "3px",
                border: "0.5px solid rgba(192,192,192,0.2)",
                pointerEvents: "none",
              }} />
              <span style={{
                transform: "rotate(-45deg)",
                fontFamily: "var(--font-display)",
                fontSize: "11px", color: "var(--accent)",
                letterSpacing: "1px", lineHeight: 1,
                position: "relative", zIndex: 1,
              }}>FS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{
                fontFamily: "var(--font-display)", fontSize: "18px",
                color: "var(--text-primary)", letterSpacing: "3px", lineHeight: 1,
              }}>FRANDY</span>
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "9px",
                letterSpacing: "3px", color: "var(--accent-muted)",
                textTransform: "uppercase", lineHeight: 1,
              }}>· dev</span>
            </div>
          </Link>

          <nav className="hidden md:flex" style={{ gap: "32px", alignItems: "center" }}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--font-body)", fontSize: "13px",
                  fontWeight: 600, letterSpacing: "2px",
                  textTransform: "uppercase", color: "var(--accent-muted)",
                  textDecoration: "none", transition: "color 200ms ease",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--accent)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--accent-muted)")}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Bottom nav — mobile only ───────────────────────────── */}
      <nav className="bottom-nav-mobile">
        <ul className="bottom-nav-list">
          {BOTTOM_NAV.map((item, i) => {
            const Icon = item.icon;
            const isActive = activeBottom === i;
            return (
              <li
                key={item.href}
                className={`bottom-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveBottom(i)}
              >
                <a href={item.href} className="bottom-nav-link">
                  <span className="bottom-nav-icon">
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
                  <span className="bottom-nav-label">{item.label}</span>
                </a>
              </li>
            );
          })}
          <div
            className="bottom-nav-indicator"
            style={{ transform: `translateX(${activeBottom * 100}%)` }}
          />
        </ul>
      </nav>

      <style>{`
        .bottom-nav-mobile {
          display: none;
        }

        @media (max-width: 767px) {
          .bottom-nav-mobile {
            display: flex;
            position: fixed;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 50;
            padding: 0 8px;
          }

          .bottom-nav-list {
            position: relative;
            display: flex;
            align-items: center;
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 40px;
            padding: 0;
            margin: 0;
            list-style: none;
            overflow: visible;
            width: 350px;
          }

          .bottom-nav-item {
            position: relative;
            width: 70px;
            height: 64px;
            z-index: 1;
            cursor: pointer;
          }

          .bottom-nav-link {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            text-decoration: none;
            gap: 2px;
          }

          .bottom-nav-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--border);
            transition: transform 500ms cubic-bezier(0.22,1,0.36,1), color 300ms ease;
          }

          .bottom-nav-item.active .bottom-nav-icon {
            transform: translateY(-28px);
            color: var(--bg-primary);
          }

          .bottom-nav-label {
            position: absolute;
            bottom: 10px;
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: var(--accent-muted);
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 400ms 100ms ease, transform 400ms 100ms ease;
            white-space: nowrap;
          }

          .bottom-nav-item.active .bottom-nav-label {
            opacity: 1;
            transform: translateY(0);
          }

          /* Sliding indicator */
          .bottom-nav-indicator {
            position: absolute;
            top: -28px;
            left: 0;
            width: 70px;
            height: 70px;
            background: var(--accent);
            border-radius: 50%;
            border: 6px solid var(--bg-primary);
            transition: transform 500ms cubic-bezier(0.22,1,0.36,1);
            pointer-events: none;
            z-index: 0;
          }

          /* Curved cutouts */
          .bottom-nav-indicator::before {
            content: "";
            position: absolute;
            top: 50%;
            left: -22px;
            width: 20px;
            height: 20px;
            border-top-right-radius: 20px;
            box-shadow: 1px -8px 0 0 var(--bg-primary);
          }

          .bottom-nav-indicator::after {
            content: "";
            position: absolute;
            top: 50%;
            right: -22px;
            width: 20px;
            height: 20px;
            border-top-left-radius: 20px;
            box-shadow: -1px -8px 0 0 var(--bg-primary);
          }

          main {
            padding-bottom: 100px !important;
          }
        }
      `}</style>
    </>
  );
}
