"use client";

import { useEffect, useState } from "react";
import { Skel } from "@/components/ui/Skeleton";

// ── Constants ─────────────────────────────────────────────────────────
const THEMES = [
  { value: "silver", label: "Silver", color: "#c0c0c0" },
  { value: "cobalt", label: "Cobalt", color: "#3b82f6" },
  { value: "ember",  label: "Ember",  color: "#d4842a" },
  { value: "jade",   label: "Jade",   color: "#3d9970" },
];

const SOCIAL_FIELDS = [
  { key: "social_github",   label: "GitHub",      placeholder: "https://github.com/username" },
  { key: "social_linkedin", label: "LinkedIn",     placeholder: "https://linkedin.com/in/username" },
  { key: "social_x",        label: "X (Twitter)", placeholder: "https://x.com/username" },
  { key: "social_facebook", label: "Facebook",     placeholder: "https://facebook.com/username" },
  { key: "social_medium",   label: "Medium",       placeholder: "https://medium.com/@username" },
  { key: "social_hashnode", label: "Hashnode",     placeholder: "https://hashnode.com/@username" },
  { key: "social_devto",    label: "Dev.to",       placeholder: "https://dev.to/username" },
];

const CONTACT_FIELDS = [
  { key: "contact_email",    label: "Email",                        placeholder: "your@email.com" },
  { key: "contact_phone",    label: "Phone (with country code)",    placeholder: "+19188004855" },
  { key: "contact_whatsapp", label: "WhatsApp (with country code)", placeholder: "+19188004855" },
];

const SECTION_FIELDS = [
  { key: "section_about",    label: "About",    description: "Your story and photo" },
  { key: "section_skills",   label: "Skills",   description: "Tech stack grid" },
  { key: "section_projects", label: "Projects", description: "Portfolio mosaic" },
  { key: "section_timeline", label: "Timeline", description: "Career history" },
  { key: "section_contact",  label: "Contact",  description: "Contact form and links" },
];

// ── Types ─────────────────────────────────────────────────────────────
interface SocialLinks       { [key: string]: string | null; }
interface ContactInfo       { [key: string]: string | null; }
interface SectionVisibility { [key: string]: boolean; }

// ── Skeleton ──────────────────────────────────────────────────────────
function SettingsSkeleton() {
  return (
    <div className="settings">
      <div className="settings__header">
        <Skel.Title width="quarter" />
        <Skel.Text width="half" size="sm" />
      </div>
      {/* Theme — always open, no chevron */}
      <div className="settings__section">
        <Skel.Heading width="quarter" />
        <div className="skel-group" style={{ marginTop: 8 }}>
          <Skel.Text width="3-4" />
          <Skel.Box height={36} style={{ width: 140 }} />
        </div>
      </div>
      {/* Collapsible skeletons */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="collapsible">
          <div className="collapsible__trigger" style={{ pointerEvents: "none" }}>
            <Skel.Heading width="quarter" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Toggle — uses global CSS classes (not styled-jsx scoped) ──────────
function Toggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      className={`toggle ${checked ? "on" : "off"}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle__thumb" />
    </button>
  );
}

// ── Collapsible panel — uses global CSS classes ───────────────────────
function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="collapsible">
      <button
        type="button"
        className="collapsible__trigger"
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        <h2 className="collapsible__title">{title}</h2>
        <span className={`collapsible__chevron ${open ? "open" : ""}`}>▼</span>
      </button>
      {open && <div className="collapsible__body">{children}</div>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [theme,    setTheme]    = useState("silver");
  const [social,   setSocial]   = useState<SocialLinks>({});
  const [contact,  setContact]  = useState<ContactInfo>({});
  const [sections, setSections] = useState<SectionVisibility>({
    section_about: true, section_skills: true, section_projects: true,
    section_timeline: true, section_contact: true,
  });

  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [savingSocial,   setSavingSocial]   = useState(false);
  const [savingContact,  setSavingContact]  = useState(false);
  const [savingSections, setSavingSections] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [themeRes, socialRes, contactRes, sectionsRes] = await Promise.all([
          fetch("/api/settings/theme",        { credentials: "include" }),
          fetch("/api/settings/social",       { credentials: "include" }),
          fetch("/api/settings/contact-info", { credentials: "include" }),
          fetch("/api/settings/sections",     { credentials: "include" }),
        ]);
        if (themeRes.ok)    { const d = await themeRes.json();    setTheme(d.active_theme); }
        if (socialRes.ok)   { const d = await socialRes.json();   setSocial(d); }
        if (contactRes.ok)  { const d = await contactRes.json();  setContact(d); }
        if (sectionsRes.ok) { const d = await sectionsRes.json(); setSections(d); }
      } catch {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  function notify(msg: string) {
    setError(""); setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }
  function notifyError(msg: string) { setSuccess(""); setError(msg); }

  async function handleSaveTheme() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/theme", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      if (!res.ok) throw new Error();
      notify("Theme saved");
    } catch { notifyError("Failed to save theme"); } finally { setSaving(false); }
  }

  async function handleSaveSections() {
    setSavingSections(true);
    try {
      const res = await fetch("/api/settings/sections", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sections),
      });
      if (!res.ok) throw new Error();
      notify("Section visibility saved");
    } catch { notifyError("Failed to save visibility"); } finally { setSavingSections(false); }
  }

  async function handleSaveSocial() {
    setSavingSocial(true);
    try {
      const res = await fetch("/api/settings/social", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(social),
      });
      if (!res.ok) throw new Error();
      notify("Social links saved");
    } catch { notifyError("Failed to save social links"); } finally { setSavingSocial(false); }
  }

  async function handleSaveContact() {
    setSavingContact(true);
    try {
      const res = await fetch("/api/settings/contact-info", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });
      if (!res.ok) throw new Error();
      notify("Contact info saved");
    } catch { notifyError("Failed to save contact info"); } finally { setSavingContact(false); }
  }

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="settings">
      <div className="settings__header">
        <div>
          <h1>Site Settings</h1>
          <p>Manage theme, visibility, social links, and contact info</p>
        </div>
      </div>

      {error   && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      {/* ── Theme — always expanded, no collapse ── */}
      <div className="settings__section">
        <h2>Theme</h2>
        <div className="themes">
          {THEMES.map((t) => (
            <button
              key={t.value}
              className={`theme-card ${theme === t.value ? "active" : ""}`}
              onClick={() => setTheme(t.value)}
            >
              <div className="theme-card__swatch" style={{ background: t.color }} />
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
      </div>

      {/* ── Section Visibility — collapsible ── */}
      <Collapsible title="Section Visibility" defaultOpen={true}>
        <p className="settings__hint">
          Hero is always shown. Toggle the rest on or off — changes take
          effect on the live site after saving.
        </p>
        <div className="sections-grid">
          {SECTION_FIELDS.map(({ key, label, description }) => (
            <div key={key} className="section-row">
              <div className="section-row__info">
                <span className="section-row__label">{label}</span>
                <span className="section-row__desc">{description}</span>
              </div>
              <Toggle
                id={`toggle-${key}`}
                checked={!!sections[key]}
                onChange={(v) => setSections({ ...sections, [key]: v })}
              />
            </div>
          ))}
        </div>
        <button
          className="admin-btn-primary"
          onClick={handleSaveSections}
          disabled={savingSections}
          style={{ marginTop: "1.25rem" }}
        >
          <span>{savingSections ? "Saving..." : "Save Visibility"}</span>
        </button>
      </Collapsible>

      {/* ── Social Links — collapsible ── */}
      <Collapsible title="Social Links">
        <div className="social-grid">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <input
                type="url"
                value={(social[key] as string) ?? ""}
                onChange={(e) => setSocial({ ...social, [key]: e.target.value })}
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
      </Collapsible>

      {/* ── Contact Info — collapsible ── */}
      <Collapsible title="Contact Info">
        <div className="social-grid">
          {CONTACT_FIELDS.map(({ key, label, placeholder }) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <input
                type="text"
                value={(contact[key] as string) ?? ""}
                onChange={(e) => setContact({ ...contact, [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
        <button
          className="admin-btn-primary"
          onClick={handleSaveContact}
          disabled={savingContact}
          style={{ marginTop: "1rem" }}
        >
          <span>{savingContact ? "Saving..." : "Save Contact Info"}</span>
        </button>
      </Collapsible>

      <style jsx>{`
        .settings__header { margin-bottom: 2rem; }
        .settings__header h1 { font-family: var(--font-display); font-size: 2rem; margin: 0; }
        .settings__header p  { color: var(--color-text-muted); margin: 0.25rem 0 0; font-size: 0.875rem; }

        .error-banner   { background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.3); color: #ff5050; padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1rem; }
        .success-banner { background: rgba(0,255,128,0.1); border: 1px solid rgba(0,255,128,0.3); color: #00ff80; padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1rem; }

        /* Theme section — always open, no collapsible wrapper */
        .settings__section { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .settings__section h2 { font-family: var(--font-display); font-size: 1.1rem; margin: 0 0 1.25rem; color: var(--color-accent); }
        .settings__hint { font-size: 0.825rem; color: var(--color-text-muted); margin: 0 0 1.25rem; line-height: 1.6; }

        .themes { display: flex; gap: 1rem; flex-wrap: wrap; }
        .theme-card { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; background: var(--color-bg); border: 2px solid var(--color-border); border-radius: 8px; cursor: pointer; transition: border-color 0.2s; min-width: 80px; color: var(--color-text); font-size: 0.875rem; }
        .theme-card:hover  { border-color: var(--color-text-muted); }
        .theme-card.active { border-color: var(--color-accent); }
        .theme-card__swatch { width: 40px; height: 40px; border-radius: 50%; }

        /* Section visibility rows */
        .sections-grid { display: flex; flex-direction: column; border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; }
        .section-row { display: flex; align-items: center; justify-content: space-between; padding: 0.875rem 1rem; border-bottom: 1px solid var(--color-border); transition: background 0.15s; }
        .section-row:last-child { border-bottom: none; }
        .section-row:hover { background: var(--color-bg); }
        .section-row__info { display: flex; flex-direction: column; gap: 2px; }
        .section-row__label { font-size: 0.9rem; color: var(--color-text); font-weight: 600; }
        .section-row__desc  { font-size: 0.78rem; color: var(--color-text-muted); font-family: var(--font-mono); }

        /* Social / contact fields */
        .social-grid { display: flex; flex-direction: column; gap: 1rem; }
        .field { display: flex; flex-direction: column; gap: 0.4rem; }
        .field label { font-size: 0.8rem; color: var(--color-text-muted); font-family: var(--font-mono); }
        .field input { background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 4px; padding: 0.625rem 0.75rem; color: var(--color-text); font-size: 0.9rem; outline: none; font-family: var(--font-body); transition: border-color 0.2s; }
        .field input:focus { border-color: var(--color-accent); }
      `}</style>
    </div>
  );
}
