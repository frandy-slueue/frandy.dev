"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getMe, logout } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/admin",          icon: "⬡" },
  { label: "Projects",  href: "/admin/projects",  icon: "◈" },
  { label: "Timeline",  href: "/admin/timeline",  icon: "◎" },
  { label: "Contact",   href: "/admin/contact",   icon: "◉" },
  { label: "Resume",    href: "/admin/resume",    icon: "◰" },
  { label: "Settings",  href: "/admin/settings",  icon: "◑" },
  { label: "Analytics", href: "/admin/analytics", icon: "◐" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getMe().then((user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        setUsername(user.username);
      }
    });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    <div className="admin">
      {/* Sidebar */}
      <aside className={`admin__sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="admin__sidebar-header">
          <span className="admin__logo">frandy.dev</span>
          <button
            className="admin__toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="admin__nav">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`admin__nav-item ${
                pathname === item.href ? "active" : ""
              }`}
            >
              <span className="admin__nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <span className="admin__nav-label">{item.label}</span>
              )}
            </a>
          ))}
        </nav>

        <div className="admin__sidebar-footer">
          {sidebarOpen && (
            <span className="admin__username">@{username}</span>
          )}
          <button className="admin__logout" onClick={handleLogout}>
            ⏻
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin__main">
        <div className="admin__content">{children}</div>
      </main>

      {/* Mobile floating hamburger */}
      <div className="admin__fab-wrap">
        {menuOpen && (
          <div
            className="admin__fab-backdrop"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <div className={`admin__fab-menu ${menuOpen ? "open" : ""}`}>
          <div className="admin__fab-menu-header">
            <span className="admin__fab-username">@{username}</span>
            <button className="admin__fab-logout" onClick={handleLogout}>
              ⏻ Logout
            </button>
          </div>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`admin__fab-nav-item ${
                pathname === item.href ? "active" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="admin__fab-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        <button
          className={`admin__fab ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className="admin__fab-line line1" />
          <span className="admin__fab-line line2" />
          <span className="admin__fab-line line3" />
        </button>
      </div>

      <style jsx>{`
        .admin {
          display: flex;
          min-height: 100vh;
          background: var(--color-bg);
          color: var(--color-text);
          font-family: var(--font-body);
        }
        .admin__sidebar {
          display: flex;
          flex-direction: column;
          background: var(--color-surface);
          border-right: 1px solid var(--color-border);
          transition: width 0.25s ease;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 100;
        }
        .admin__sidebar.open { width: 220px; }
        .admin__sidebar.closed { width: 60px; }
        .admin__sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--color-border);
          min-height: 60px;
        }
        .admin__logo {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--color-accent);
          white-space: nowrap;
          overflow: hidden;
        }
        .admin__toggle {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 0.75rem;
          padding: 0.25rem;
          flex-shrink: 0;
        }
        .admin__toggle:hover { color: var(--color-accent); }
        .admin__nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1rem 0.5rem;
          flex: 1;
        }
        .admin__nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0;
          text-decoration: none;
          color: var(--color-text-muted);
          transition: all 0.15s;
          white-space: nowrap;
          overflow: hidden;
        }
        .admin__nav-item:hover {
          background: var(--color-bg);
          color: var(--color-text);
        }
        .admin__nav-item.active {
          background: var(--color-bg);
          color: var(--color-accent);
          border-left: 2px solid var(--color-accent);
        }
        .admin__nav-icon { font-size: 1.1rem; flex-shrink: 0; }
        .admin__nav-label { font-size: 0.9rem; }
        .admin__sidebar-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-top: 1px solid var(--color-border);
          min-height: 60px;
        }
        .admin__username {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
          white-space: nowrap;
          overflow: hidden;
        }
        .admin__logout {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
          flex-shrink: 0;
        }
        .admin__logout:hover { color: #ff5050; }
        .admin__main {
          flex: 1;
          margin-left: 220px;
          transition: margin-left 0.25s ease;
          min-height: 100vh;
        }
        .admin__content {
          padding: 2rem;
          max-width: 1200px;
        }

        .admin__fab-wrap { display: none; }

        @media (max-width: 1024px) {
          .admin__sidebar { display: none; }
          .admin__main { margin-left: 0; }
          .admin__content { padding: 1.25rem 1rem 100px; }

          .admin__fab-wrap {
            display: block;
            position: fixed;
            bottom: 32px;
            right: 32px;
            z-index: 300;
          }

          .admin__fab-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 290;
            backdrop-filter: blur(2px);
          }

          .admin__fab-menu {
            position: fixed;
            bottom: 0;
            right: 0;
            left: 0;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: 0;
            overflow-y: auto;
            max-height: 70vh;
            z-index: 295;
            transform: translateY(100%);
            opacity: 0;
            pointer-events: none;
            transition: transform 350ms cubic-bezier(0.22,1,0.36,1),
                        opacity 250ms ease;
            transform-origin: bottom center;
            width: 100%;
          }

          .admin__fab-menu.open {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all;
          }

          .admin__fab-menu-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.875rem 1rem;
            border-bottom: 1px solid var(--color-border);
          }

          .admin__fab-username {
            font-family: var(--font-mono);
            font-size: 0.8rem;
            color: var(--color-text-muted);
          }

          .admin__fab-logout {
            background: none;
            border: none;
            color: #ff5050;
            font-size: 0.8rem;
            cursor: pointer;
            font-family: var(--font-mono);
          }

          .admin__fab-nav-item {
            display: flex;
            align-items: center;
            gap: 0.875rem;
            padding: 0.875rem 1rem;
            text-decoration: none;
            color: var(--color-text-muted);
            font-size: 1rem;
            transition: background 0.15s, color 0.15s;
            border-bottom: 1px solid var(--color-border);
          }

          .admin__fab-nav-item:last-child { border-bottom: none; }

          .admin__fab-nav-item:hover {
            background: var(--color-bg);
            color: var(--color-text);
          }

          .admin__fab-nav-item.active {
            color: var(--accent);
            background: var(--color-bg);
          }

          .admin__fab-nav-icon {
            font-size: 1.2rem;
            width: 24px;
            text-align: center;
          }

          .admin__fab {
            width: 44px;
            height: 44px;
            border-radius: 0;
            background: var(--color-surface);
            border: 1px solid var(--accent);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            position: relative;
            z-index: 300;
            color: var(--accent);
            transition: background 200ms ease, color 200ms ease;
            animation: fab-glow 3s ease-in-out infinite;
          }

          /* Double-frame corner accents — matches BackToTop/dframe */
          .admin__fab::before {
            content: '';
            position: absolute;
            inset: 3px;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 2px;
            pointer-events: none;
          }

          .admin__fab::after {
            content: '';
            position: absolute;
            inset: -1px;
            background:
              linear-gradient(var(--accent), var(--accent)) top left / 10px 1.5px no-repeat,
              linear-gradient(var(--accent), var(--accent)) top left / 1.5px 10px no-repeat,
              linear-gradient(var(--accent), var(--accent)) bottom right / 10px 1.5px no-repeat,
              linear-gradient(var(--accent), var(--accent)) bottom right / 1.5px 10px no-repeat;
            pointer-events: none;
            transition: opacity 200ms ease;
          }

          .admin__fab:hover {
            background: var(--accent);
            color: var(--color-bg);
            animation: none;
          }

          .admin__fab:hover::after { opacity: 0; }

          @keyframes fab-glow {
            0%, 100% { box-shadow: 0 0 4px var(--accent-glow); }
            50%       { box-shadow: 0 0 12px var(--accent-glow); }
          }

          .admin__fab-line {
            display: block;
            width: 18px;
            height: 1.5px;
            background: currentColor;
            border-radius: 0;
            transform-origin: center;
            transition: transform 300ms ease, opacity 300ms ease;
          }

          .admin__fab:not(.open) .line1 {
            animation: wave1 2s ease-in-out infinite;
          }
          .admin__fab:not(.open) .line2 {
            animation: wave2 2s ease-in-out infinite 0.15s;
          }
          .admin__fab:not(.open) .line3 {
            animation: wave3 2s ease-in-out infinite 0.3s;
          }

          .admin__fab.open .line1 {
            transform: translateY(7px) rotate(45deg);
            animation: none;
          }
          .admin__fab.open .line2 {
            opacity: 0;
            transform: scaleX(0);
            animation: none;
          }
          .admin__fab.open .line3 {
            transform: translateY(-7px) rotate(-45deg);
            animation: none;
          }

          @keyframes wave1 {
            0%, 100% { transform: translateX(0px); }
            25% { transform: translateX(4px); }
            75% { transform: translateX(-4px); }
          }
          @keyframes wave2 {
            0%, 100% { transform: translateX(0px); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          @keyframes wave3 {
            0%, 100% { transform: translateX(0px); }
            25% { transform: translateX(4px); }
            75% { transform: translateX(-4px); }
          }
        }
      `}</style>
    </div>
  );
}
