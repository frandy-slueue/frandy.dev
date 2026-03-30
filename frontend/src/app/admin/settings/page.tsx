"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { value: "silver", label: "Silver", color: "#c0c0c0" },
  { value: "cobalt", label: "Cobalt", color: "#0047ab" },
  { value: "ember", label: "Ember", color: "#ff4500" },
  { value: "jade", label: "Jade", color: "#00a86b" },
];

interface ThemeSettings {
  active_theme: string;
  last_theme_changed: string;
}

interface ResumeSettings {
  resume_url: string | null;
  resume_uploaded_at: string | null;
}

export default function AdminSettings() {
  const [theme, setTheme] = useState("silver");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeUploadedAt, setResumeUploadedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [themeRes, resumeRes] = await Promise.all([
          fetch("/api/settings/theme", { credentials: "include" }),
          fetch("/api/settings/resume", { credentials: "include" }),
        ]);
        if (themeRes.ok) {
          const data: ThemeSettings = await themeRes.json();
          setTheme(data.active_theme);
        }
        if (resumeRes.ok) {
          const data: ResumeSettings = await resumeRes.json();
          setResumeUrl(data.resume_url);
          setResumeUploadedAt(data.resume_uploaded_at);
        }
      } catch {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSaveTheme() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/settings/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ theme }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess("Theme saved successfully");
    } catch {
      setError("Failed to save theme");
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/settings/resume", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data: ResumeSettings = await res.json();
      setResumeUrl(data.resume_url);
      setResumeUploadedAt(data.resume_uploaded_at);
      setSuccess("Resume uploaded successfully");
    } catch {
      setError("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteResume() {
    if (!confirm("Delete the current resume?")) return;
    try {
      await fetch("/api/settings/resume", {
        method: "DELETE",
        credentials: "include",
      });
      setResumeUrl(null);
      setResumeUploadedAt(null);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) return <p className="loading">Loading settings...</p>;

  return (
    <div className="settings">
      <div className="settings__header">
        <div>
          <h1>Site Settings</h1>
          <p>Manage your site theme and resume</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {/* Theme */}
      <section className="settings__section">
        <h2>Theme</h2>
        <div className="themes">
          {THEMES.map((t) => (
            <button
              key={t.value}
              className={`theme-card ${theme === t.value ? "active" : ""}`}
              onClick={() => setTheme(t.value)}
            >
              <div
                className="theme-card__swatch"
                style={{ background: t.color }}
              />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <button
          className="admin-btn-primary"
          onClick={handleSaveTheme}
          disabled={saving}
          style={{ marginTop: "1rem" }}
        >
          {saving ? "Saving..." : "Save Theme"}
        </button>
      </section>

      {/* Resume */}
      <section className="settings__section">
        <h2>Resume</h2>
        {resumeUrl ? (
          <div className="resume-row">
            <div className="resume-info">
              <span className="resume-icon">📄</span>
              <div>
                <div className="resume-url">{resumeUrl}</div>
                {resumeUploadedAt && (
                  <div className="resume-date">
                    Uploaded {formatDate(resumeUploadedAt)}
                  </div>
                )}
              </div>
            </div>
            <div className="resume-actions">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-ghost"
              >
                View
              </a>
              <button className="admin-btn-danger" onClick={handleDeleteResume}>
                Delete
              </button>
            </div>
          </div>
        ) : (
          <p className="no-resume">No resume uploaded yet.</p>
        )}
        <div style={{ marginTop: "1rem" }}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            style={{ display: "none" }}
            id="settings-resume-upload"
          />
          <label htmlFor="settings-resume-upload" className="admin-btn-primary">
            {uploading ? "Uploading..." : resumeUrl ? "Replace Resume" : "+ Upload Resume"}
          </label>
        </div>
      </section>

      <style jsx>{`
        .settings__header {
          margin-bottom: 2rem;
        }
        .settings__header h1 {
          font-family: var(--font-display);
          font-size: 2rem;
          margin: 0;
        }
        .settings__header p {
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
        .settings__section {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .settings__section h2 {
          font-family: var(--font-display);
          font-size: 1.1rem;
          margin: 0 0 1.25rem;
          color: var(--color-accent);
        }
        .themes {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .theme-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--color-bg);
          border: 2px solid var(--color-border);
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.2s;
          min-width: 80px;
          color: var(--color-text);
          font-size: 0.875rem;
        }
        .theme-card:hover {
          border-color: var(--color-text-muted);
        }
        .theme-card.active {
          border-color: var(--color-accent);
        }
        .theme-card__swatch {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .resume-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 1rem;
        }
        .resume-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .resume-icon {
          font-size: 1.75rem;
        }
        .resume-url {
          font-size: 0.875rem;
          font-family: var(--font-mono);
          color: var(--color-text);
        }
        .resume-date {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 0.25rem;
        }
        .resume-actions {
          display: flex;
          gap: 0.5rem;
        }
        .no-resume {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          margin: 0 0 0.5rem;
        }
        .loading {
          padding: 3rem;
          text-align: center;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
