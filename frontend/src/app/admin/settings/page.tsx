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

interface SocialLinks {
  social_github: string | null;
  social_linkedin: string | null;
  social_x: string | null;
  social_facebook: string | null;
  social_medium: string | null;
}

export default function AdminSettings() {
  const [theme, setTheme] = useState("silver");
  const [social, setSocial] = useState<SocialLinks>({
    social_github: "",
    social_linkedin: "",
    social_x: "",
    social_facebook: "",
    social_medium: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [themeRes, socialRes] = await Promise.all([
          fetch("/api/settings/theme", { credentials: "include" }),
          fetch("/api/settings/social", { credentials: "include" }),
        ]);
        if (themeRes.ok) {
          const data: ThemeSettings = await themeRes.json();
          setTheme(data.active_theme);
        }
        if (socialRes.ok) {
          const data: SocialLinks = await socialRes.json();
          setSocial({
            social_github: data.social_github ?? "",
            social_linkedin: data.social_linkedin ?? "",
            social_x: data.social_x ?? "",
            social_facebook: data.social_facebook ?? "",
            social_medium: data.social_medium ?? "",
          });
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

  async function handleSaveSocial() {
    setSavingSocial(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/settings/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(social),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess("Social links saved successfully");
    } catch {
      setError("Failed to save social links");
    } finally {
      setSavingSocial(false);
    }
  }

  if (loading) return <p className="loading">Loading settings...</p>;

  return (
    <div className="settings">
      <div className="settings__header">
        <div>
          <h1>Site Settings</h1>
          <p>Manage your site theme and social links</p>
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
          <span>{saving ? "Saving..." : "Save Theme"}</span>
        </button>
      </section>

      {/* Social Links */}
      <section className="settings__section">
        <h2>Social Links</h2>
        <div className="social-grid">
          {[
            { key: "social_github", label: "GitHub", placeholder: "https://github.com/username" },
            { key: "social_linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
            { key: "social_x", label: "X (Twitter)", placeholder: "https://x.com/username" },
            { key: "social_facebook", label: "Facebook", placeholder: "https://facebook.com/username" },
            { key: "social_medium", label: "Medium", placeholder: "https://medium.com/@username" },
          ].map(({ key, label, placeholder }) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <input
                type="url"
                value={social[key as keyof SocialLinks] ?? ""}
                onChange={(e) =>
                  setSocial({ ...social, [key]: e.target.value })
                }
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
        <button
          className="admin-btn-primary"
          onClick={handleSaveSocial}
          disabled={savingSocial}
          style={{ marginTop: "1rem" }}
        >
          <span>{savingSocial ? "Saving..." : "Save Social Links"}</span>
        </button>
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
        .theme-card:hover { border-color: var(--color-text-muted); }
        .theme-card.active { border-color: var(--color-accent); }
        .theme-card__swatch {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }
        .social-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .field label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }
        .field input {
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          padding: 0.625rem 0.75rem;
          color: var(--color-text);
          font-size: 0.9rem;
          outline: none;
          font-family: var(--font-body);
          transition: border-color 0.2s;
        }
        .field input:focus { border-color: var(--color-accent); }
        .loading {
          padding: 3rem;
          text-align: center;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}
