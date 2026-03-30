"use client";

import { useEffect, useRef, useState } from "react";

interface Resume {
  id: string;
  filename: string;
  file_url: string;
  is_active: boolean;
  uploaded_at: string;
}

export default function AdminResume() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchResumes() {
    try {
      const res = await fetch("/api/resume", { credentials: "include" });
      const data = await res.json();
      setResumes(data);
    } catch {
      setError("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResumes();
  }, []);

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
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

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
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to activate");
      setSuccess("Resume set as active");
      await fetchResumes();
    } catch {
      setError("Failed to activate resume");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume?")) return;
    try {
      await fetch(`/api/resume/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setResumes((prev) => prev.filter((r) => r.id !== id));
      setSuccess("Resume deleted");
    } catch {
      setError("Failed to delete resume");
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

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
          <label htmlFor="resume-upload" className="btn-primary">
            {uploading ? "Uploading..." : "+ Upload PDF"}
          </label>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {loading ? (
        <p className="loading">Loading...</p>
      ) : resumes.length === 0 ? (
        <div className="empty">
          <p>No resumes uploaded yet.</p>
          <label htmlFor="resume-upload" className="btn-primary">
            Upload your first resume
          </label>
        </div>
      ) : (
        <div className="resume__list">
          {resumes.map((r) => (
            <div key={r.id} className={`resume__item ${r.is_active ? "active" : ""}`}>
              <div className="resume__icon">📄</div>
              <div className="resume__info">
                <div className="resume__filename">{r.filename}</div>
                <div className="resume__meta">
                  Uploaded {formatDate(r.uploaded_at)}
                  {r.is_active && (
                    <span className="resume__badge">Active</span>
                  )}
                </div>
              </div>
              <div className="resume__actions">
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  View
                </a>
                {!r.is_active && (
                  <button
                    className="btn-ghost"
                    onClick={() => handleActivate(r.id)}
                  >
                    Set Active
                  </button>
                )}
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(r.id)}
                >
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
          background: rgba(255, 80, 80, 0.1);
          border: 1px solid rgba(255, 80, 80, 0.3);
          color: #ff5050;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .success-banner {
          background: rgba(0, 255, 128, 0.1);
          border: 1px solid rgba(0, 255, 128, 0.3);
          color: #00ff80;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .resume__list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .resume__item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1.25rem;
          transition: border-color 0.2s;
        }
        .resume__item.active {
          border-color: var(--color-accent);
        }
        .resume__icon {
          font-size: 2rem;
          flex-shrink: 0;
        }
        .resume__info {
          flex: 1;
        }
        .resume__filename {
          font-size: 0.95rem;
          color: var(--color-text);
          font-family: var(--font-mono);
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
          background: rgba(0, 255, 128, 0.1);
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
        .btn-ghost {
          background: none;
          border: none;
          color: var(--color-accent);
          cursor: pointer;
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
          text-decoration: none;
        }
        .btn-danger {
          background: none;
          border: none;
          color: #ff5050;
          cursor: pointer;
          font-size: 0.875rem;
          padding: 0.25rem 0.5rem;
        }
        .loading,
        .empty {
          padding: 3rem;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
}
