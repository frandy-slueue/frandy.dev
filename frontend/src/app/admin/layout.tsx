"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getMe, logout } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "⬡" },
  { label: "Projects", href: "/admin/projects", icon: "◈" },
  { label: "Contact", href: "/admin/contact", icon: "◎" },
  { label: "Resume", href: "/admin/resume", icon: "◰" },
  { label: "Settings", href: "/admin/settings", icon: "◑" },
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

          {/* Mobile bottom nav */}
      <nav className="admin__bottom-nav">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`admin__bottom-nav-item ${
              pathname === item.href ? "active" : ""
            }`}
          >
            <span className="admin__bottom-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
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
          border-radius: 6px;
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

        /* Bottom nav — hidden on desktop */
        .admin__bottom-nav {
          display: none;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .admin__sidebar {
            display: none;
          }
          .admin__main {
            margin-left: 0;
          }
          .admin__content {
            padding: 1.25rem 1rem 90px;
          }
          .admin__bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: var(--color-surface);
            border-top: 1px solid var(--color-border);
            z-index: 200;
            align-items: center;
            justify-content: space-around;
            padding: 0 0.25rem;
            padding-bottom: env(safe-area-inset-bottom);
          }
          .admin__bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            padding: 0.5rem 0.25rem;
            text-decoration: none;
            color: var(--color-text-muted);
            font-size: 11px;
            font-family: var(--font-mono);
            transition: color 0.15s;
            flex: 1;
            text-align: center;
          }
          .admin__bottom-nav-item:hover,
          .admin__bottom-nav-item.active {
            color: var(--accent);
          }
          .admin__bottom-nav-icon {
            font-size: 1.3rem;
            line-height: 1;
          }
        }
      `}</style>
    </div>
  );
}
