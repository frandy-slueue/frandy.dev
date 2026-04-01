"use client";

import { useEffect, useState } from "react";

interface Stats {
  projects: number;
  messages: number;
  views: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    messages: 0,
    views: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [projectsRes, messagesRes] = await Promise.all([
          fetch("/api/projects", { credentials: "include" }),
          fetch("/api/contact", { credentials: "include" }),
        ]);
        const projects = await projectsRes.json();
        const messages = await messagesRes.json();
        setStats({
          projects: projects?.length ?? 0,
          messages: messages?.length ?? 0,
          views: 0,
        });
      } catch {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Projects",
      value: stats.projects,
      icon: "◈",
      href: "/admin/projects",
    },
    {
      label: "Messages",
      value: stats.messages,
      icon: "◎",
      href: "/admin/contact",
    },
    {
      label: "Page Views",
      value: stats.views,
      icon: "◐",
      href: "/admin/analytics",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Dashboard</h1>
        <p>Welcome back, here's what's happening on frandy.dev</p>
      </div>

      <div className="dashboard__grid">
        {cards.map((card) => (
          <a key={card.label} href={card.href} className="dashboard__card">
            <div className="dashboard__card-icon">{card.icon}</div>
            <div className="dashboard__card-body">
              <span className="dashboard__card-value">
                {loading ? "—" : card.value}
              </span>
              <span className="dashboard__card-label">{card.label}</span>
            </div>
          </a>
        ))}
      </div>

      <div className="dashboard__quick">
        <h2>Quick Actions</h2>
        <div className="dashboard__actions">
          <a href="/admin/projects" className="dashboard__action">
            + Add Project
          </a>
          <a href="/admin/resume" className="dashboard__action">
            + Update Resume
          </a>
          <a href="/admin/settings" className="dashboard__action">
            ⚙ Site Settings
          </a>
          <a href="/" target="_blank" className="dashboard__action">
            ↗ View Site
          </a>
        </div>
      </div>

      <style jsx>{`
        .dashboard__header {
          margin-bottom: 2rem;
        }
        .dashboard__header h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          color: var(--color-text);
          margin: 0;
        }
        .dashboard__header p {
          color: var(--color-text-muted);
          margin: 0.25rem 0 0;
          font-size: 0.9rem;
        }
        .dashboard__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .dashboard__card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          color: var(--color-text);
          transition: border-color 0.2s;
        }
        .dashboard__card:hover {
          border-color: var(--color-accent);
        }
        .dashboard__card-icon {
          font-size: 1.75rem;
          color: var(--color-accent);
        }
        .dashboard__card-body {
          display: flex;
          flex-direction: column;
        }
        .dashboard__card-value {
          font-size: 1.75rem;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--color-text);
          line-height: 1;
        }
        .dashboard__card-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 0.25rem;
        }
        .dashboard__quick h2 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: var(--color-text);
          margin: 0 0 1rem;
        }
        .dashboard__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .dashboard__action {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 0.625rem 1.25rem;
          text-decoration: none;
          color: var(--color-text-muted);
          font-size: 0.875rem;
          transition: all 0.15s;
        }
        .dashboard__action:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }
      `}</style>
    </div>
  );
}
