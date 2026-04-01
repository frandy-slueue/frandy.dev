"use client";

import { useEffect, useState } from "react";
import { Skel } from "@/components/ui/Skeleton";

interface Stats { projects: number; messages: number; views: number; }

const CARDS = [
  { label: "Projects",   icon: "◈", href: "/admin/projects" },
  { label: "Messages",   icon: "◎", href: "/admin/contact" },
  { label: "Page Views", icon: "◐", href: "/admin/analytics" },
];

const QUICK_ACTIONS = [
  { label: "+ Add Project",   href: "/admin/projects" },
  { label: "+ Update Resume", href: "/admin/resume" },
  { label: "⚙ Site Settings", href: "/admin/settings" },
  { label: "↗ View Site",     href: "/", target: "_blank" },
];

function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <div className="db-header">
        <Skel.Title width="quarter" />
        <Skel.Text width="half" />
      </div>
      <div className="db-grid">
        {[0,1,2].map((i) => (
          <div key={i} className="db-card" style={{ pointerEvents:"none" }}>
            <Skel.Circle size={36} />
            <div className="skel-group" style={{ flex:1 }}>
              <Skel.Box height={32} className="skel--w-quarter" />
              <Skel.Text width="third" size="sm" />
            </div>
          </div>
        ))}
      </div>
      <div className="db-quick">
        <Skel.Heading width="quarter" />
        <div className="db-actions" style={{ marginTop:"1rem" }}>
          {[0,1,2,3].map((i) => <Skel.Box key={i} height={38} style={{ width:130 }} />)}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch("/api/projects", { credentials: "include" }),
          fetch("/api/contact",  { credentials: "include" }),
        ]);
        const projects = await pRes.json();
        const messages = await mRes.json();
        setStats({ projects: projects?.length ?? 0, messages: messages?.length ?? 0, views: 0 });
      } catch {
        setStats({ projects: 0, messages: 0, views: 0 });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const vals = [stats!.projects, stats!.messages, stats!.views];

  return (
    <div className="dashboard">
      <div className="db-header">
        <h1>Dashboard</h1>
        <p>Welcome back, here's what's happening on frandy.dev</p>
      </div>

      {/* Stat cards — dframe */}
      <div className="db-grid">
        {CARDS.map((card, i) => (
          <a key={card.label} href={card.href} className="db-card">
            <div className="db-card__icon">{card.icon}</div>
            <div className="db-card__body">
              <span className="db-card__value">{vals[i]}</span>
              <span className="db-card__label">{card.label}</span>
            </div>
          </a>
        ))}
      </div>

      {/* Quick actions — secondary pill buttons */}
      <div className="db-quick">
        <h2>Quick Actions</h2>
        <div className="db-actions">
          {QUICK_ACTIONS.map((a) => (
            <a
              key={a.label}
              href={a.href}
              target={(a as { target?: string }).target}
              className="admin-btn-secondary"
            >
              <span>{a.label}</span>
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        .db-header { margin-bottom: 2rem; }
        .db-header h1 { font-family: var(--font-display); font-size: 2rem; color: var(--color-text); margin: 0; }
        .db-header p  { color: var(--color-text-muted); margin: 0.25rem 0 0; font-size: 0.9rem; }

        .db-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        /* stat card — dframe */
        .db-card {
          position: relative;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          color: var(--color-text);
          transition: border-color 250ms ease;
          overflow: hidden;
        }
        /* inner rounded frame */
        .db-card::before {
          content: '';
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 6px;
          pointer-events: none;
        }
        /* corner accents TL + BR — fade on hover */
        .db-card::after {
          content: '';
          position: absolute;
          inset: -1px;
          background:
            linear-gradient(var(--color-accent), var(--color-accent)) top left / 14px 1.5px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) top left / 1.5px 14px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) bottom right / 14px 1.5px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) bottom right / 1.5px 14px no-repeat;
          pointer-events: none;
          transition: opacity 250ms ease;
        }
        .db-card:hover::after  { opacity: 0; }
        .db-card:hover { border-color: var(--color-accent); }
        .db-card > * { position: relative; z-index: 1; }

        .db-card__icon  { font-size: 1.75rem; color: var(--color-accent); flex-shrink: 0; }
        .db-card__body  { display: flex; flex-direction: column; }
        .db-card__value { font-size: 1.75rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-text); line-height: 1; }
        .db-card__label { font-size: 0.8rem; color: var(--color-text-muted); margin-top: 0.25rem; }

        .db-quick h2 { font-family: var(--font-display); font-size: 1.25rem; color: var(--color-text); margin: 0 0 1rem; }
        .db-actions   { display: flex; flex-wrap: wrap; gap: 0.75rem; }
      `}</style>
    </div>
  );
}