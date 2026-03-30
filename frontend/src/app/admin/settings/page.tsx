"use client";

import { useEffect, useState } from "react";

interface SiteSettings {
  site_title: string;
  site_description: string;
  hero_tagline: string;
  hero_subtext: string;
  show_hero: boolean;
  show_about: boolean;
  show_skills: boolean;
  show_projects: boolean;
  show_timeline: boolean;
  show_contact: boolean;
  primary_color: string;
  background_style: string;
}

const defaultSettings: SiteSettings = {
  site_title: "",
  site_description: "",
  hero_tagline: "",
  hero_subtext: "",
  show_hero: true,
  show_about: true,
  show_skills: true,
  show_projects: true,
  show_timeline: true,
  show_contact: true,
  primary_color: "#00ff88",
  background_style: "default",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSettings({ ...defaultSettings, ...data });
        }
      } catch {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess("Settings saved successfully");
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="loading">Loading settings...</p>;

  return (
    <div className="settings">
      <div className="settings__header">
        <div>
          <h1>Site Settings</h1>
          <p>Manage your site content and appearance</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {/* SEO */}
      <section className="settings__section">
        <h2>SEO & Meta</h2>
        <div className="form-grid">
          <div className="field field--full">
            <label>Site Title</label>
            <input
              value={settings.site_title}
              onChange={(e) =>
                setSettings({ ...settings, site_title: e.target.value })
              }
              placeholder="Frandy Slueue — Full Stack Engineer"
            />
          </div>
          <div className="field field--full">
            <label>Site Description</label>
            <textarea
              value={settings.site_description}
              onChange={(e) =>
                setSettings({ ...settings, site_description: e.target.value })
              }
              placeholder="Portfolio description for search engines"
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="settings__section">
        <h2>Hero Section</h2>
        <div className="form-grid">
          <div className="field field--full">
            <label>Tagline</label>
            <input
              value={settings.hero_tagline}
              onChange={(e) =>
                setSettings({ ...settings, hero_tagline: e.target.value })
              }
              placeholder="Full Stack Software Engineer"
            />
          </div>
          <div className="field field--full">
            <label>Subtext</label>
            <textarea
              value={settings.hero_subtext}
              onChange={(e) =>
                setSettings({ ...settings, hero_subtext: e.target.value })
              }
              placeholder="Short intro below your name"
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Sections visibility */}
      <section className="settings__section">
        <h2>Section Visibility</h2>
        <div className="settings__toggles">
          {[
            { key: "show_hero", label: "Hero" },
            { key: "show_about", label: "About" },
            { key: "show_skills", label: "Skills" },
            { key: "show_projects", label: "Projects" },
            { key: "show_timeline", label: "Timeline" },
            { key: "show_contact", label: "Contact" },
          ].map(({ key, label }) => (
            <label key={key} className="toggle-row">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={settings[key as keyof SiteSettings] as boolean}
                onChange={(e) =>
                  setSettings({ ...settings, [key]: e.target.checked })
                }
              />
            </label>
          ))}
        </div>
      </section>

      {/* Appearance */}
      <section className="settings__section">
        <h2>Appearance</h2>
        <div className="form-grid">
          <div className="field">
            <label>Primary Accent Color</label>
            <div className="color-row">
              <input
                type="color"
                value={settings.primary_color}
                onChange={(e) =>
                  setSettings({ ...settings, primary_color: e.target.value })
                }
                className="color-picker"
              />
              <input
                type="text"
                value={settings.primary_color}
                onChange={(e) =>
                  setSettings({ ...settings, primary_color: e.target.value })
                }
                placeholder="#00ff88"
              />
            </div>
          </div>
          <div className="field">
            <label>Background Style</label>
            <select
              value={settings.background_style}
              onChange={(e) =>
                setSettings({ ...settings, background_style: e.target.value })
              }
            >
              <option value="default">Default</option>
              <option value="matrix">Matrix Rain</option>
              <option value="particles">Particles</option>
              <option value="gradient">Gradient</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>
      </section>

      <style jsx>{`
        .settings__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
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
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .field--full {
          grid-column: 1 / -1;
        }
        .field label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
        }
        .field input,
        .field textarea,
        .field select {
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
        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: var(--color-accent);
        }
        .color-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .color-picker {
          width: 48px;
          height: 38px;
          padding: 2px;
          border-radius: 4px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .settings__toggles {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: var(--color-bg);
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--color-text);
        }
        .toggle-row:hover {
          border-color: var(--color-accent);
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
          transition: opacity 0.2s;
        }
        .btn-primary:hover {
          opacity: 0.85;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
