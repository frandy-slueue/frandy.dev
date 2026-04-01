"use client";

import { useEffect, useRef, useState } from "react";
import { Skel } from "@/components/ui/Skeleton";

interface Resume {
  id: string;
  filename: string;
  file_url: string;
  is_active: boolean;
  uploaded_at: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────
function ResumeSkeleton() {
  return (
    <div className="resume">
      <div className="resume__header">
        <div className="skel-group" style={{ gap: 8 }}>
          <Skel.Title width="quarter" />
          <Skel.Text width="third" size="sm" />
        </div>
        <Skel.Box height={36} style={{ width: 120 }} />
      </div>
      <div className="resume__list">
        {[0, 1].map((i) => (
          <div key={i} className="resume__item">
            <Skel.Circle size={40} />
            <div style={{ flex: 1 }} className="skel-group">
              <Skel.Text width="half" />
              <Skel.Text width="third" size="sm" />
            </div>
            <Skel.Row>
              <Skel.Box height={30} style={{ width: 52 }} />
              <Skel.Box height={30} style={{ width: 72 }} />
            </Skel.Row>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Inline filename editor ────────────────────────────────────────────
function FilenameEditor({
  resume,
  onSaved,
}: {
  resume: Resume;
  onSaved: (id: string, newName: string) => void;
}) {
  const [editing, setEditing]   = useState(false);
  const [value, setValue]       = useState(resume.filename);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function handleEdit() {
    setValue(resume.filename);
    setError("");
    setEditing(true);
  }

  function handleCancel() {
    setValue(resume.filename);
    setError("");
    setEditing(false);
  }

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) { setError("Filename cannot be empty"); return; }
    if (trimmed === resume.filename) { setEditing(false); return; }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/resume/${resume.id}/rename`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: trimmed }),
      });
      if (!res.ok) throw new Error();
      onSaved(resume.id, trimmed);
      setEditing(false);
    } catch {
      setError("Failed to rename. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter")  handleSave();
    if (e.key === "Escape") handleCancel();
  }

  if (editing) {
    return (
      <div className="filename-editor">
        <input
          ref={inputRef}
          className={`filename-editor__input ${error ? "is-error" : ""}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={saving}
          aria-label="Edit filename"
        />
        {error && <p className="filename-editor__error">{error}</p>}
        <div className="filename-editor__actions">
          <button
            className="admin-btn-primary"
            onClick={handleSave}
            disabled={saving || !value.trim()}
          >
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
          <button className="admin-btn-ghost" onClick={handleCancel} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="filename-display">
      <span className="resume__filename">{resume.filename}</span>
      <button
        className="filename-edit-btn"
        onClick={handleEdit}
        title="Edit filename"
        aria-label="Edit filename"
      >
        ✎
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function AdminResume() {
  const [resumes, setResumes]     = useState<Resume[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchResumes() {
    try {
      const res  = await fetch("/api/resume", { credentials: "include" });
      const data = await res.json();
      setResumes(data);
    } catch {
      setError("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchResumes(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume", {
        method: "POST", credentials: "include", body: formData,
      });
      if (!res.ok) throw new Error();
      setSuccess("Resume uploaded successfully");
      await fetchResumes();
    } catch {
      setError("Failed to upload resume");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleActivate(id: string) {
    try {
      const res = await fetch(`/api/resume/${id}/activate`, {
        method: "PATCH", credentials: "include",
      });
      if (!res.ok) throw new Error();
      setSuccess("Resume set as active");
      await fetchResumes();
    } catch {
      setError("Failed to activate resume");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume?")) return;
    try {
      await fetch(`/api/resume/${id}`, { method: "DELETE", credentials: "include" });
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setSuccess("Resume deleted");
    } catch {
      setError("Failed to delete resume");
    }
  }

  // Called by FilenameEditor after a successful rename
  function handleRenamed(id: string, newName: string) {
    setResumes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, filename: newName } : r))
    );
    setSuccess("Filename updated");
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  }

  if (loading) return <ResumeSkeleton />;

  return (
    <div className="resume">
      <div className="resume__header">
        <div>
          <h1>Resume Manager</h1>
          <p>{resumes.length} file{resumes.length !== 1 ? "s" : ""} uploaded</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            style={{ display: "none" }}
            id="resume-upload"
          />
          <label htmlFor="resume-upload" className="admin-btn-primary">
            <span>{uploading ? "Uploading..." : "+ Upload PDF"}</span>
          </label>
        </div>
      </div>

      {error   && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {resumes.length === 0 ? (
        <div className="empty">
          <p>No resumes uploaded yet.</p>
          <label htmlFor="resume-upload" className="admin-btn-primary">
            <span>Upload your first resume</span>
          </label>
        </div>
      ) : (
        <div className="resume__list">
          {resumes.map((r) => (
            <div key={r.id} className={`resume__item ${r.is_active ? "active" : ""}`}>
              <div className="resume__icon">📄</div>

              <div className="resume__info">
                <FilenameEditor resume={r} onSaved={handleRenamed} />
                <div className="resume__meta">
                  Uploaded {formatDate(r.uploaded_at)}
                  {r.is_active && <span className="resume__badge">Active</span>}
                </div>
              </div>

              <div className="resume__actions">
                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="admin-btn-ghost">
                  View
                </a>
                {!r.is_active && (
                  <button className="admin-btn-ghost" onClick={() => handleActivate(r.id)}>
                    Set Active
                  </button>
                )}
                <button className="admin-btn-danger" onClick={() => handleDelete(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .resume__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .resume__header h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          margin: 0;
        }
        .resume__header p {
          color: var(--color-text-muted);
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
        }
        .error-banner {
          background: rgba(255,80,80,0.1);
          border: 1px solid rgba(255,80,80,0.3);
          color: #ff5050;
          padding: 0.75rem 1rem;
          border-radius: 0;
          margin-bottom: 1rem;
        }
        .success-banner {
          background: rgba(0,255,128,0.1);
          border: 1px solid rgba(0,255,128,0.3);
          color: #00ff80;
          padding: 0.75rem 1rem;
          border-radius: 0;
          margin-bottom: 1rem;
        }
        .resume__list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .resume__item {
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 0;
          padding: 1.25rem;
          transition: border-color 0.2s;
        }
        .resume__item.active { border-color: var(--color-accent); }
        .resume__icon { font-size: 2rem; flex-shrink: 0; }
        .resume__info { flex: 1; min-width: 0; }
        .resume__filename {
          font-size: 0.95rem;
          color: var(--color-text);
          font-family: var(--font-mono);
          word-break: break-all;
        }
        .resume__meta {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .resume__badge {
          background: rgba(0,255,128,0.1);
          color: #00ff80;
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-family: var(--font-mono);
        }
        .resume__actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        /* Filename display row */
        .filename-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filename-edit-btn {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          font-size: 14px;
          padding: 2px 4px;
          border-radius: 2px;
          transition: color 0.15s;
          flex-shrink: 0;
          line-height: 1;
        }
        .filename-edit-btn:hover { color: var(--color-accent); }

        /* Filename editor */
        .filename-editor {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .filename-editor__input {
          background: var(--color-bg);
          border: 1px solid var(--color-accent);
          border-radius: 0;
          padding: 6px 10px;
          color: var(--color-text);
          font-family: var(--font-mono);
          font-size: 0.9rem;
          outline: none;
          width: 100%;
          max-width: 360px;
          transition: box-shadow 0.15s;
        }
        .filename-editor__input:focus {
          box-shadow: 0 0 0 1px var(--color-accent);
        }
        .filename-editor__input.is-error {
          border-color: #ff5050;
          box-shadow: 0 0 0 1px #ff5050;
        }
        .filename-editor__error {
          font-size: 0.78rem;
          color: #ff5050;
          font-family: var(--font-mono);
          margin: 0;
        }
        .filename-editor__actions {
          display: flex;
          gap: 6px;
        }

        .empty {
          padding: 3rem;
          text-align: center;
          color: var(--color-text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .resume__header { flex-direction: column; gap: 1rem; align-items: flex-start; }
          .resume__actions { width: 100%; }
        }
      `}</style>
    </div>
  );
}
