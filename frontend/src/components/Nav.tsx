"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "About",    href: "#about" },
  { label: "Skills",   href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Timeline", href: "#timeline" },
  { label: "Contact",  href: "#contact" },
];

const BOTTOM_NAV = [
  { label: "About",    href: "#about",    icon: "man-outline" },
  { label: "Skills",   href: "#skills",   icon: "archive-outline" },
  { label: "Projects", href: "#projects", icon: "library-outline" },
  { label: "Timeline", href: "#timeline", icon: "pulse-outline" },
  { label: "Contact",  href: "#contact",  icon: "person-circle-outline" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeBottom, setActiveBottom] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
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
          backgroundColor: scrolled
            ? "rgba(8,8,8,0.95)"
            : "rgba(8,8,8,0.80)",
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
          {/* FS monogram — original simple design */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                transform: "rotate(45deg)",
                border: "1.5px solid var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {/* Inner faded border */}
              <div
                style={{
                  position: "absolute",
                  inset: "3px",
                  border: "0.5px solid rgba(192,192,192,0.2)",
                  pointerEvents: "none",
                }}
              />
              <span
                style={{
                  transform: "rotate(-45deg)",
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  color: "var(--accent)",
                  letterSpacing: "1px",
                  lineHeight: 1,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                FS
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  color: "var(--text-primary)",
                  letterSpacing: "3px",
                  lineHeight: 1,
                }}
              >
                FRANDY
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "9px",
                  letterSpacing: "3px",
                  color: "var(--accent-muted)",
                  textTransform: "uppercase",
                  lineHeight: 1,
                }}
              >
                · dev
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav
            className="hidden md:flex"
            style={{ gap: "32px", alignItems: "center" }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "var(--accent-muted)",
                  textDecoration: "none",
                  transition: "color 200ms ease",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--accent-muted)")
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Bottom nav — strictly mobile only ─────────────────── */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "70px",
          backgroundColor: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          zIndex: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
        className="bottom-nav-mobile"
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: "100%",
            maxWidth: "420px",
            margin: "0 auto",
          }}
        >
          <ul
            style={{
              display: "flex",
              flex: 1,
              padding: 0,
              margin: 0,
              listStyle: "none",
              position: "relative",
            }}
          >
            {BOTTOM_NAV.map((item, i) => (
              <li
                key={item.href}
                style={{
                  position: "relative",
                  width: "70px",
                  height: "70px",
                  zIndex: 1,
                  cursor: "pointer",
                }}
                onClick={() => setActiveBottom(i)}
              >
                <a
                  href={item.href}
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    width: "100%",
                    textDecoration: "none",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      lineHeight: "75px",
                      fontSize: "1.4em",
                      textAlign: "center",
                      transition:
                        "transform 500ms cubic-bezier(0.22,1,0.36,1), color 300ms ease",
                      color:
                        activeBottom === i
                          ? "var(--bg-primary)"
                          : "var(--border)",
                      transform:
                        activeBottom === i
                          ? "translateY(-32px)"
                          : "translateY(0)",
                    }}
                  >
                    {/* @ts-ignore */}
                    <ion-icon name={item.icon} />
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "16px",
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: "10px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      color: "var(--accent-muted)",
                      opacity: activeBottom === i ? 1 : 0,
                      transform:
                        activeBottom === i
                          ? "translateY(0)"
                          : "translateY(10px)",
                      transition:
                        "opacity 400ms 100ms ease, transform 400ms 100ms ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}

           {/* Floating indicator — flush with top border */}
            <div
              style={{
                position: "absolute",
                top: "-35px",
                width: "70px",
                height: "70px",
                backgroundColor: "var(--accent)",
                borderRadius: "50%",
                border: "8px solid var(--bg-primary)",
                transition: "transform 500ms cubic-bezier(0.22,1,0.36,1)",
                transform: `translateX(${activeBottom * 70}px)`,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "-24px",
                  width: "20px",
                  height: "20px",
                  borderTopRightRadius: "20px",
                  boxShadow: "1px -8px 0 0 var(--bg-primary)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "-24px",
                  width: "20px",
                  height: "20px",
                  borderTopLeftRadius: "20px",
                  boxShadow: "-1px -8px 0 0 var(--bg-primary)",
                }}
              />
            </div>
          </ul>

          
        </div>
      </nav>

      {/* Ionicons */}
      <script
        type="module"
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
        async
      />

      <style>{`
        /* Bottom nav — mobile only, strict */
        .bottom-nav-mobile {
          display: none;
        }
        @media (max-width: 767px) {
          .bottom-nav-mobile {
            display: flex;
          }
          main {
            padding-bottom: 70px !important;
          }
        }
      `}</style>
    </>
  );
}