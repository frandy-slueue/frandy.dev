"use client";

const UMAMI = "http://104.131.169.140:8080";

const QUICK_LINKS = [
  { icon: "◐", label: "Realtime Visitors" },
  { icon: "◎", label: "Page Views" },
  { icon: "◈", label: "Top Pages" },
  { icon: "◑", label: "Referrers" },
];

export default function AdminAnalytics() {
  return (
    <div className="analytics">
      <div className="an-header">
        <div>
          <h1>Analytics</h1>
          <p>Visitor stats powered by Umami</p>
        </div>
        {/* Open Umami — primary */}
        <a href={UMAMI} target="_blank" rel="noopener noreferrer" className="admin-btn-primary">
          <span>Open Umami Dashboard ↗</span>
        </a>
      </div>

      <div className="an-notice">
        <div className="an-notice__icon">◐</div>
        <div>
          <p>Analytics are tracked via Umami running on your server.</p>
          <p>Once the domain is live at <strong>frandy.dev</strong> and SSL is configured, the full dashboard will be embeddable here. For now, open the Umami dashboard directly using the button above.</p>
        </div>
      </div>

      <div className="an-links">
        <h2>Quick Links</h2>
        <div className="an-grid">
          {QUICK_LINKS.map(({ icon, label }) => (
            /* quick link card — dframe */
            <a key={label} href={UMAMI} target="_blank" rel="noopener noreferrer" className="an-card">
              <span className="an-card__icon">{icon}</span>
              <span className="an-card__label">{label}</span>
              <span className="an-card__sub">Open Umami →</span>
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        .an-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:2rem; }
        .an-header h1 { font-family:var(--font-display); font-size:2rem; margin:0; }
        .an-header p  { color:var(--color-text-muted); margin:0.25rem 0 0; font-size:0.875rem; }

        .an-notice { display:flex; gap:1rem; background:var(--color-surface); border:1px solid var(--color-border); border-left:3px solid var(--accent); padding:1.25rem; margin-bottom:2rem; }
        .an-notice__icon { font-size:1.5rem; color:var(--accent); flex-shrink:0; }
        .an-notice p { font-size:0.9rem; color:var(--color-text-muted); margin:0 0 0.4rem; line-height:1.6; }
        .an-notice p:last-child { margin:0; }
        .an-notice strong { color:var(--color-text); }

        .an-links h2 { font-family:var(--font-display); font-size:1.25rem; margin:0 0 1rem; }
        .an-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; }

        /* quick link card — dframe */
        .an-card {
          position:relative;
          background:var(--color-surface);
          border:1px solid var(--color-border);
          padding:1.25rem;
          display:flex; flex-direction:column; gap:0.5rem;
          text-decoration:none;
          transition:border-color 250ms ease;
        }
        .an-card::before {
          content:''; position:absolute; inset:4px;
          border:1px solid rgba(255,255,255,0.04); border-radius:6px; pointer-events:none;
        }
        .an-card::after {
          content:''; position:absolute; inset:-1px;
          background:
            linear-gradient(var(--color-accent),var(--color-accent)) top left / 14px 1.5px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) top left / 1.5px 14px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) bottom right / 14px 1.5px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) bottom right / 1.5px 14px no-repeat;
          pointer-events:none; z-index:2; transition:opacity 250ms ease;
        }
        .an-card:hover::after { opacity:0; }
        .an-card:hover { border-color:var(--color-accent); }
        .an-card > * { position:relative; z-index:1; }

        .an-card__icon  { font-size:1.5rem; color:var(--color-accent); }
        .an-card__label { font-size:0.95rem; color:var(--color-text); font-weight:600; }
        .an-card__sub   { font-size:0.8rem; color:var(--color-text-muted); }
      `}</style>
    </div>
  );
}
