"use client";

export default function AdminAnalytics() {
  return (
    <div className="analytics">
      <div className="analytics__header">
        <div>
          <h1>Analytics</h1>
          <p>Visitor stats powered by Umami</p>
        </div>
        <a
          href={`http://104.131.169.140:8080`}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-primary"
        >
          <span>Open Umami Dashboard ↗</span>
        </a>
      </div>

      <div className="analytics__notice">
        <div className="analytics__notice-icon">◐</div>
        <div>
          <p>Analytics are tracked via Umami running on your server.</p>
          <p>
            Once the domain is live at{" "}
            <strong>frandy.dev</strong> and SSL is configured, the full
            dashboard will be embeddable here. For now, open the Umami
            dashboard directly using the button above.
          </p>
        </div>
      </div>

      <div className="analytics__links">
        <h2>Quick Links</h2>
        <div className="analytics__grid">
          <a
            href="http://104.131.169.140:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="analytics__card"
          >
            <span className="analytics__card-icon">◐</span>
            <span className="analytics__card-label">Realtime Visitors</span>
            <span className="analytics__card-sub">Open Umami →</span>
          </a>
          <a
            href="http://104.131.169.140:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="analytics__card"
          >
            <span className="analytics__card-icon">◎</span>
            <span className="analytics__card-label">Page Views</span>
            <span className="analytics__card-sub">Open Umami →</span>
          </a>
          <a
            href="http://104.131.169.140:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="analytics__card"
          >
            <span className="analytics__card-icon">◈</span>
            <span className="analytics__card-label">Top Pages</span>
            <span className="analytics__card-sub">Open Umami →</span>
          </a>
          <a
            href="http://104.131.169.140:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="analytics__card"
          >
            <span className="analytics__card-icon">◑</span>
            <span className="analytics__card-label">Referrers</span>
            <span className="analytics__card-sub">Open Umami →</span>
          </a>
        </div>
      </div>

      <style jsx>{`
        .analytics__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .analytics__header h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          margin: 0;
        }
        .analytics__header p {
          color: var(--color-text-muted);
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
        }
        .analytics__notice {
          display: flex;
          gap: 1rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-left: 3px solid var(--accent);
          border-radius: 0;
          padding: 1.25rem;
          margin-bottom: 2rem;
        }
        .analytics__notice-icon {
          font-size: 1.5rem;
          color: var(--accent);
          flex-shrink: 0;
        }
        .analytics__notice p {
          font-size: 0.9rem;
          color: var(--color-text-muted);
          margin: 0 0 0.4rem;
          line-height: 1.6;
        }
        .analytics__notice p:last-child { margin: 0; }
        .analytics__notice strong { color: var(--color-text); }
        .analytics__links h2 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          margin: 0 0 1rem;
        }
        .analytics__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }
        .analytics__card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 0;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-decoration: none;
          transition: border-color 0.2s;
        }
        .analytics__card:hover { border-color: var(--accent); }
        .analytics__card-icon {
          font-size: 1.5rem;
          color: var(--accent);
        }
        .analytics__card-label {
          font-size: 0.95rem;
          color: var(--color-text);
          font-weight: 600;
        }
        .analytics__card-sub {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
