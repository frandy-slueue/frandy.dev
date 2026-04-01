"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Code2, FolderOpen, Clock, Mail } from "lucide-react";

const ALL_NAV_LINKS = [
  { label: "About",    href: "#about",    sectionKey: "section_about" },
  { label: "Skills",   href: "#skills",   sectionKey: "section_skills" },
  { label: "Projects", href: "#projects", sectionKey: "section_projects" },
  { label: "Timeline", href: "#timeline", sectionKey: "section_timeline" },
  { label: "Contact",  href: "#contact",  sectionKey: "section_contact" },
];

const ALL_BOTTOM_NAV = [
  { label: "About",    href: "#about",    sectionKey: "section_about",    icon: User },
  { label: "Skills",   href: "#skills",   sectionKey: "section_skills",   icon: Code2 },
  { label: "Projects", href: "#projects", sectionKey: "section_projects", icon: FolderOpen },
  { label: "Timeline", href: "#timeline", sectionKey: "section_timeline", icon: Clock },
  { label: "Contact",  href: "#contact",  sectionKey: "section_contact",  icon: Mail },
];

const NAV_HEIGHT = 72;

interface SectionVisibility { [key: string]: boolean; }

export default function Nav() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [activeSection, setActive]  = useState<string>("");
  const [visibility, setVisibility] = useState<SectionVisibility>({
    section_about: true, section_skills: true, section_projects: true,
    section_timeline: true, section_contact: true,
  });

  useEffect(() => {
    fetch("/api/settings/sections")
      .then((r) => r.json())
      .then((d: SectionVisibility) => setVisibility(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids      = ALL_NAV_LINKS.map((l) => l.href.slice(1));
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(`#${e.target.id}`); }); },
      { rootMargin: `-${NAV_HEIGHT}px 0px -85% 0px`, threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const navLinks  = ALL_NAV_LINKS.filter((l) => visibility[l.sectionKey]);
  const bottomNav = ALL_BOTTOM_NAV.filter((l) => visibility[l.sectionKey]);
  const activeIdx = bottomNav.findIndex((l) => l.href === activeSection);
  const indicatorIdx = activeIdx === -1 ? 0 : activeIdx;

  return (
    <>
      {/* ── Top nav ─────────────────────────────────────────── */}
      <header className={`top-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="site-container top-nav__inner">

          <Link href="/" className="nav-logo">
            <div className="nav-logo__diamond">
              <div className="nav-logo__diamond-border" />
              <span className="nav-logo__fs">FS</span>
            </div>
            <div className="nav-logo__wordmark">
              <span className="nav-logo__name">FRANDY</span>
              <span className="nav-logo__sub">· dev</span>
            </div>
          </Link>

          {/* Desktop links — Option B active state, sharp */}
          <nav className="nav-desktop" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`nav-link ${activeSection === link.href ? "active" : ""}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className={`nav-ham-line line1 ${menuOpen ? "open" : ""}`} />
            <span className={`nav-ham-line line2 ${menuOpen ? "open" : ""}`} />
            <span className={`nav-ham-line line3 ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="nav-mobile-menu" role="dialog" aria-label="Navigation menu">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-mobile-link ${activeSection === link.href ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
      {menuOpen && <div className="nav-mobile-backdrop" onClick={() => setMenuOpen(false)} />}

      {/* ── Bottom nav — portrait mobile only ───────────────── */}
      <nav className="bottom-nav-mobile" aria-label="Section navigation">
        <div className="bottom-nav-bar">
          {/* Sliding full-height accent fill — boxy indicator */}
          <div
            className="bottom-nav-indicator"
            style={{ transform: `translateX(${indicatorIdx * 100}%)` }}
          />
          {bottomNav.map((item) => {
            const Icon     = item.icon;
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`bottom-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setActive(item.href)}
              >
                <span className="bottom-nav-icon">
                  <Icon size={18} strokeWidth={1.5} />
                </span>
                <span className="bottom-nav-label">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      <style>{`
        /* ── Top nav ──────────────────────────────────────── */
        .top-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: ${NAV_HEIGHT}px;
          z-index: 50;
          background-color: rgba(8,8,8,0.80);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: background-color 300ms ease;
        }
        .top-nav.scrolled { background-color: rgba(8,8,8,0.96); }
        .top-nav__inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
        .nav-logo__diamond {
          width: 32px; height: 32px;
          transform: rotate(45deg);
          border: 1.5px solid var(--accent);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; position: relative;
        }
        .nav-logo__diamond-border {
          position: absolute; inset: 3px;
          border: 0.5px solid rgba(192,192,192,0.2);
          pointer-events: none;
        }
        .nav-logo__fs {
          transform: rotate(-45deg);
          font-family: var(--font-display); font-size: 12px;
          color: var(--accent); letter-spacing: 1px; line-height: 1;
          position: relative; z-index: 1;
        }
        .nav-logo__wordmark { display: flex; flex-direction: column; gap: 1px; }
        .nav-logo__name { font-family: var(--font-display); font-size: 20px; color: var(--text-primary); letter-spacing: 3px; line-height: 1; }
        .nav-logo__sub  { font-family: var(--font-body); font-size: 9px; letter-spacing: 3px; color: var(--accent-muted); text-transform: uppercase; line-height: 1; }

        /* Desktop nav links — Option B, sharp edges */
        .nav-desktop { display: flex; gap: 4px; align-items: center; }
        .nav-link {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--accent-muted);
          text-decoration: none;
          padding: 6px 12px;
          border: 1px solid transparent;
          transition: color 200ms ease, background 200ms ease, border-color 200ms ease;
        }
        .nav-link:hover {
          color: var(--accent);
          border-color: var(--border);
        }
        .nav-link.active {
          color: var(--bg-primary);
          background: var(--accent);
          border-color: var(--accent);
        }

        /* Hamburger */
        .nav-hamburger { display: none; }
        .nav-mobile-menu { display: none; }
        .nav-mobile-backdrop { display: none; }
        .bottom-nav-mobile { display: none; }

        /* ── Landscape / tablet ───────────────────────────── */
        @media (max-width: 1024px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
            width: 40px; height: 40px;
            background: none;
            border: 1px solid var(--border);
            border-radius: 0;
            cursor: pointer;
            padding: 0; flex-shrink: 0;
          }
          .nav-ham-line {
            display: block; width: 18px; height: 1.5px;
            background: var(--accent); border-radius: 0;
            transform-origin: center;
            transition: transform 300ms ease, opacity 300ms ease;
          }
          .nav-ham-line:not(.open) { animation: navwave 2s ease-in-out infinite; }
          .line2:not(.open) { animation-delay: 0.15s; }
          .line3:not(.open) { animation-delay: 0.3s; }
          @keyframes navwave {
            0%, 100% { transform: translateX(0); }
            25%  { transform: translateX(3px); }
            75%  { transform: translateX(-3px); }
          }
          .line1.open { transform: translateY(6.5px) rotate(45deg); animation: none; }
          .line2.open { opacity: 0; transform: scaleX(0); animation: none; }
          .line3.open { transform: translateY(-6.5px) rotate(-45deg); animation: none; }

          .nav-mobile-backdrop {
            display: block; position: fixed; inset: 0;
            background: rgba(0,0,0,0.5); z-index: 48;
            backdrop-filter: blur(2px);
          }
          .nav-mobile-menu {
            display: flex; flex-direction: column;
            position: fixed;
            top: ${NAV_HEIGHT}px; right: 0;
            width: min(280px, 80vw);
            background: var(--bg-secondary);
            border-left: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            border-radius: 0;
            z-index: 49;
            padding: 0;
            max-height: calc(100vh - ${NAV_HEIGHT}px);
            overflow-y: auto;
          }
          .nav-mobile-link {
            padding: 16px 24px;
            font-family: var(--font-body); font-size: 13px;
            font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
            color: var(--text-muted); text-decoration: none;
            border-bottom: 1px solid var(--border-subtle);
            border-left: 2px solid transparent;
            transition: color 150ms ease, background 150ms ease, border-left-color 150ms ease;
            display: block;
          }
          .nav-mobile-link:last-child { border-bottom: none; }
          .nav-mobile-link:hover {
            color: var(--accent);
            background: var(--bg-elevated);
          }
          .nav-mobile-link.active {
            color: var(--bg-primary);
            background: var(--accent);
            border-left-color: transparent;
          }
        }

        /* ── Portrait phone — boxy bottom nav ────────────── */
        @media (max-width: 767px) and (orientation: portrait) {
          .nav-hamburger { display: none !important; }
          .bottom-nav-mobile {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 50;
          }
          .bottom-nav-bar {
            position: relative;
            display: flex;
            width: 100%;
            background: var(--bg-secondary);
            border-top: 1px solid var(--border);
          }
          /* Full-height sliding accent block — intentionally boxy */
          .bottom-nav-indicator {
            position: absolute;
            top: 0; bottom: 0;
            left: 0;
            width: 20%;
            background: var(--accent);
            transition: transform 400ms cubic-bezier(0.22,1,0.36,1);
            pointer-events: none;
            z-index: 0;
          }
          .bottom-nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 10px 0;
            text-decoration: none;
            position: relative;
            z-index: 1;
          }
          .bottom-nav-icon {
            display: flex; align-items: center; justify-content: center;
            color: var(--text-muted);
            transition: color 300ms ease;
          }
          .bottom-nav-label {
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 9px;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: var(--text-muted);
            transition: color 300ms ease;
            white-space: nowrap;
          }
          .bottom-nav-item.active .bottom-nav-icon,
          .bottom-nav-item.active .bottom-nav-label {
            color: var(--bg-primary);
          }
          main { padding-bottom: 72px !important; }
        }
      `}</style>
    </>
  );
}
