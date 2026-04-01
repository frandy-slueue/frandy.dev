"use client";

import { useEffect, useState } from "react";
import { Skel } from "@/components/ui/Skeleton";

interface ContactList {
  id: string;
  name: string;
  email: string;
  subject: string;
  company: string | null;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
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
  is_starred: boolean;
  is_archived: boolean;
  created_at: string;
}

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "starred", label: "Starred" },
  { value: "archived", label: "Archived" },
];

export default function AdminContact() {
  const [contacts, setContacts] = useState<ContactList[]>([]);
  const [selected, setSelected] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  async function fetchContacts(f = "all") {
    setLoading(true);
    try {
      const res = await fetch(`/api/contact?filter=${f}&page_size=50`, {
        credentials: "include",
      });
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

      if (!data.is_read) {
        await patch(id, { is_read: true });
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_read: true } : c))
        );
      }
    } catch {
      setError("Failed to load message");
    }
  }

  async function patch(id: string, payload: object) {
    await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  }

  async function handleStar(id: string, current: boolean) {
    await patch(id, { is_starred: !current });
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_starred: !current } : c))
    );
    if (selected?.id === id)
      setSelected((s) => s && { ...s, is_starred: !current });
  }

  async function handleArchive(id: string, current: boolean) {
    await patch(id, { is_archived: !current });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  async function handleMarkRead(id: string, current: boolean) {
    await patch(id, { is_read: !current });
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_read: !current } : c))
    );
    if (selected?.id === id)
      setSelected((s) => s && { ...s, is_read: !current });
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

  function handleForward(email: string, subject: string) {
    window.open(
      `mailto:?subject=Fwd: ${subject}&body=Forwarded from frandy.dev contact form.`,
      "_blank"
    );
  }

  useEffect(() => {
    fetchContacts(filter);
  }, [filter]);

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
            {unreadCount} unread · {contacts.length} shown
          </p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Filter tabs */}
      <div className="contact__filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-tab ${filter === f.value ? "active" : ""}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="contact__layout">
        {/* Message list */}
        <div className="contact__list">
          {loading ? (
            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: 12 }}>
              {[0,1,2,3,4].map((i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0.75rem 1rem", borderBottom: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Skel.Text width="third" />
                    <Skel.Text width="quarter" size="sm" />
                  </div>
                  <Skel.Text width="half" size="sm" />
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <p className="empty">No messages here.</p>
          ) : (
            contacts.map((c) => (
              <div
                key={c.id}
                className={`contact__item ${!c.is_read ? "unread" : ""} ${
                  selected?.id === c.id ? "active" : ""
                }`}
                onClick={() => openMessage(c.id)}
              >
                <div className="contact__item-top">
                  <span className="contact__name">{c.name}</span>
                  <div className="contact__item-icons">
                    {c.is_starred && <span className="icon-star active">★</span>}
                    <span className="contact__date">
                      {formatDate(c.created_at)}
                    </span>
                  </div>
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
                    From <strong>{selected.name}</strong> &lt;{selected.email}&gt;
                    {selected.company && ` · ${selected.company}`}
                    {selected.phone && ` · ${selected.phone}`}
                  </p>
                  <p className="contact__detail-date">
                    {formatDate(selected.created_at)}
                  </p>
                </div>
              </div>

              <div className="contact__message">{selected.message}</div>

              <div className="contact__actions">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                  className="admin-btn-primary"
                >
                  <span>Reply</span>
                </a>
                <button
                  className="admin-btn-ghost"
                  onClick={() =>
                    handleForward(selected.email, selected.subject)
                  }
                >
                  <span>Forward</span>
                </button>
                <button
                  className={`admin-btn-ghost ${
                    selected.is_starred ? "starred" : ""
                  }`}
                  onClick={() => handleStar(selected.id, selected.is_starred)}
                >
                  <span>{selected.is_starred ? "★ Starred" : "☆ Star"}</span>
                </button>
                <button
                  className="admin-btn-ghost"
                  onClick={() =>
                    handleMarkRead(selected.id, selected.is_read)
                  }
                >
                  <span>
                    {selected.is_read ? "Mark Unread" : "Mark Read"}
                  </span>
                </button>
                <button
                  className="admin-btn-ghost"
                  onClick={() =>
                    handleArchive(selected.id, selected.is_archived)
                  }
                >
                  <span>
                    {selected.is_archived ? "Unarchive" : "Archive"}
                  </span>
                </button>
                <button
                  className="admin-btn-danger"
                  onClick={() => handleDelete(selected.id)}
                >
                  <span>Delete</span>
                </button>
              </div>
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
          margin-bottom: 1.5rem;
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
        .error-banner {
          background: rgba(255, 80, 80, 0.1);
          border: 1px solid rgba(255, 80, 80, 0.3);
          color: #ff5050;
          padding: 0.75rem 1rem;
          border-radius: 0;
          margin-bottom: 1rem;
        }
        .contact__filters {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 0;
        }
        .filter-tab {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
          font-family: var(--font-body);
          margin-bottom: -1px;
        }
        .filter-tab:hover {
          color: var(--color-text);
        }
        .filter-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
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
          border-radius: 0;
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
        .contact__item:hover { background: var(--color-bg); }
        .contact__item.active {
          background: var(--color-bg);
          border-left: 2px solid var(--accent);
        }
        .contact__item.unread .contact__name {
          color: var(--accent);
          font-weight: 600;
        }
        .contact__item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        .contact__item-icons {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .contact__name { font-size: 0.9rem; color: var(--color-text); }
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
          background: var(--accent);
        }
        .icon-star { font-size: 0.75rem; color: var(--color-text-muted); }
        .icon-star.active { color: #f5a623; }
        .contact__detail {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .contact__detail-header {
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
          flex: 1;
        }
        .contact__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
        }
        .starred span { color: #f5a623; }
        .contact__detail-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
        .loading, .empty {
          padding: 2rem;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
