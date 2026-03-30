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
          href="http://104.131.169.140:8080"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Open Umami Dashboard ↗
        </a>
      </div>

      <div className="analytics__embed">
        <iframe
          src="http://104.131.169.140:8080/share/cd42587e-f235-499b-b8fc-1583470bf54d/frandy.dev"
          width="100%"
          height="600"
          frameBorder="0"
          title="Umami Analytics"
        />
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
        .analytics__embed {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          overflow: hidden;
        }
        .btn-primary {
          background: var(--color-accent);
          color: var(--color-bg);
          border: none;
          border-radius: 4px;
          padding: 0.625rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: opacity 0.2s;
        }
        .btn-primary:hover {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
