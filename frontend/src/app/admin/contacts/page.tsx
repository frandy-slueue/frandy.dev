"use client";

import { useEffect, useState } from "react";

interface ContactList {
  id: string;
  name: string;
  email: string;
  subject: string;
  company: string | null;
  is_read: boolean;
  created_at: string;
}

interface ContactDetail {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string | null;
  company: string | null;
  is_read: boolean;
  created_at: string;
}

export default function AdminContact() {
  const [contacts, setContacts] = useState<ContactList[]>([]);
  const [selected, setSelected] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");

  async function fetchContacts(unread = false) {
    try {
      const res = await fetch(
        `/api/contact?unread_only=${unread}&page_size=50`,
        { credentials: "include" }
      );
      const data = await res.json();
      setContacts(data);
    } catch {
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  }

  async function openMessage(id: string) {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setSelected(data);

      // Mark as read
      if (!data.is_read) {
        await fetch(`/api/contact/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ is_read: true }),
        });
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_read: true } : c))
        );
      }
    } catch {
      setError("Failed to load message");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    try {
      await fetch(`/api/contact/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      setError("Failed to delete message");
    }
  }

  useEffect(() => {
    fetchContacts(unreadOnly);
  }, [unreadOnly]);

  const unreadCount = contacts.filter((c) => !c.is_read).length;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="contact">
      <div className="contact__header">
        <div>
          <h1>Contact Inbox</h1>
          <p>
            {unreadCount} unread · {contacts.length} total
          </p>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
          Unread only
        </label>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="contact__layout">
        {/* Message list */}
        <div className="contact__list">
          {loading ? (
            <p className="loading">Loading...</p>
          ) : contacts.length === 0 ? (
            <p className="empty">No messages yet.</p>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                className={`contact__item ${
                  !c.is_read ? "unread" : ""
                } ${selected?.id === c.id ? "active" : ""}`}
                onClick={() => openMessage(c.id)}
              >
                <div className="contact__item-top">
                  <span className="contact__name">{c.name}</span>
                  <span className="contact__date">
                    {formatDate(c.created_at)}
                  </span>
                </div>
                <div className="contact__subject">{c.subject}</div>
                {c.company && (
                  <div className="contact__company">{c.company}</div>
                )}
                {!c.is_read && <span className="contact__dot" />}
              </div>
            ))
          )}
        </div>

        {/* Message detail */}
        <div className="contact__detail">
          {selected ? (
            <>
              <div className="contact__detail-header">
                <div>
                  <h2>{selected.subject}</h2>
                  <p>
                    From{" "}
                    <strong>{selected.name}</strong>{" "}
                    &lt;{selected.email}&gt;
                    {selected.company && ` · ${selected.company}`}
                    {selected.phone && ` · ${selected.phone}`}
                  </p>
                  <p className="contact__detail-date">
                    {formatDate(selected.created_at)}
                  </p>
                </div>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(selected.id)}
                >
                  Delete
                </button>
              </div>
              <div className="contact__message">{selected.message}</div>
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                className="btn-primary"
              >
                Reply via Email
              </a>
            </>
          ) : (
            <div className="contact__detail-empty">
              <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .contact__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .contact__header h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          margin: 0;
        }
        .contact__header p {
          color: var(--color-text-muted);
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
        }
        .toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-muted);
          cursor: pointer;
        }
        .error-banner {
          background: rgba(255, 80, 80, 0.1);
          border: 1px solid rgba(255, 80, 80, 0.3);
          color: #ff5050;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .contact__layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
          min-height: 500px;
        }
        .contact__list {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          overflow-y: auto;
          max-height: 70vh;
        }
        .contact__item {
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
          cursor: pointer;
          position: relative;
          transition: background 0.15s;
        }
        .contact__item:hover {
          background: var(--color-bg);
        }
        .contact__item.active {
          background: var(--color-bg);
          border-left: 2px solid var(--color-accent);
        }
        .contact__item.unread .contact__name {
          color: var(--color-accent);
          font-weight: 600;
        }
        .contact__item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .contact__name {
          font-size: 0.9rem;
          color: var(--color-text);
        }
        .contact__date {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }
        .contact__subject {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .contact__company {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 0.2rem;
        }
        .contact__dot {
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-accent);
        }
        .contact__detail {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1.5rem;
        }
        .contact__detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
        }
        .contact__detail-header h2 {
          font-family: var(--font-display);
          font-size: 1.25rem;
          margin: 0 0 0.5rem;
        }
        .contact__detail-header p {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin: 0.2rem 0;
        }
        .contact__detail-date {
          font-family: var(--font-mono);
          font-size: 0.8rem !important;
        }
        .contact__message {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--color-text);
          white-space: pre-wrap;
          margin-bottom: 1.5rem;
        }
        .contact__detail-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--color-text-muted);
          font-size: 0.9rem;
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
        .btn-danger {
          background: none;
          border: 1px solid rgba(255, 80, 80, 0.3);
          color: #ff5050;
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-danger:hover {
          background: rgba(255, 80, 80, 0.1);
        }
        .loading,
        .empty {
          padding: 2rem;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
