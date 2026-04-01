"use client";

import { useEffect, useState } from "react";
import { Skel } from "@/components/ui/Skeleton";

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

const PATTERNS = [
  { value: "grid",     label: "Grid",     preview: "linear-gradient(#333 1px,transparent 1px),linear-gradient(90deg,#333 1px,transparent 1px)", size: "24px 24px" },
  { value: "dots",     label: "Dots",     preview: "radial-gradient(circle,#333 1.5px,transparent 1.5px)", size: "12px 12px" },
  { value: "diagonal", label: "Diagonal", preview: "repeating-linear-gradient(45deg,transparent,transparent 10px,#333 10px,#333 11px)", size: "auto" },
  { value: "cross",    label: "Cross",    preview: "linear-gradient(#333 1px,transparent 1px),linear-gradient(90deg,#333 1px,transparent 1px),repeating-linear-gradient(45deg,transparent,transparent 8px,#333 8px,#333 9px)", size: "16px 16px,16px 16px,16px 16px" },
];

const SECTION_FIELDS = [
  { key: "section_about",    label: "About",    description: "Your story and photo" },
  { key: "section_skills",   label: "Skills",   description: "Tech stack grid" },
  { key: "section_projects", label: "Projects", description: "Portfolio mosaic" },
  { key: "section_timeline", label: "Timeline", description: "Career history" },
  { key: "section_contact",  label: "Contact",  description: "Contact form and links" },
];

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
      <div className="s-panel">
        <Skel.Heading width="quarter" />
        <div className="skel-group" style={{ marginTop: 8 }}>
          <Skel.Text width="3-4" />
          <Skel.Box height={36} style={{ width: 140 }} />
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="s-panel" style={{ padding: "1.1rem 1.5rem" }}>
          <Skel.Heading width="quarter" />
        </div>
      ))}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────
function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} id={id}
      className={`toggle ${checked ? "on" : "off"}`} onClick={() => onChange(!checked)}>
      <span className="toggle__thumb" />
    </button>
  );
}

// ── Collapsible ───────────────────────────────────────────────────────
function Collapsible({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="s-panel s-collapsible">
      <button type="button" className="s-collapsible__trigger" onClick={() => setOpen(p => !p)} aria-expanded={open}>
        <h2 className="s-collapsible__title">{title}</h2>
        <span className={`collapsible__chevron ${open ? "open" : ""}`}>▼</span>
      </button>
      {open && <div className="s-collapsible__body">{children}</div>}
    </div>
  );
}

// ── Save button helper ────────────────────────────────────────────────
function SaveBtn({ onClick, disabled, label, saving }: { onClick: () => void; disabled: boolean; label: string; saving: boolean }) {
  return (
    <button className="admin-btn-primary s-save-btn" onClick={onClick} disabled={disabled}>
      <span>{saving ? "Saving..." : label}</span>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function AdminSettings() {
  const [theme,    setTheme]    = useState("silver");
  const [social,   setSocial]   = useState<SocialLinks>({});
  const [contact,  setContact]  = useState<ContactInfo>({});
  const [sections, setSections] = useState<SectionVisibility>({ section_about: true, section_skills: true, section_projects: true, section_timeline: true, section_contact: true });
  const [pattern,  setPattern]  = useState("grid");

  const [pwCurrent,    setPwCurrent]    = useState("");
  const [pwNew,        setPwNew]        = useState("");
  const [pwConfirm,    setPwConfirm]    = useState("");
  const [savingPw,     setSavingPw]     = useState(false);
  const [pwError,      setPwError]      = useState("");
  const [pwSuccess,    setPwSuccess]    = useState("");

  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [savingSocial,   setSavingSocial]   = useState(false);
  const [savingContact,  setSavingContact]  = useState(false);
  const [savingSections, setSavingSections] = useState(false);
  const [savingPattern,  setSavingPattern]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [themeRes, socialRes, contactRes, sectionsRes, patternRes] = await Promise.all([
          fetch("/api/settings/theme",        { credentials: "include" }),
          fetch("/api/settings/social",       { credentials: "include" }),
          fetch("/api/settings/contact-info", { credentials: "include" }),
          fetch("/api/settings/sections",     { credentials: "include" }),
          fetch("/api/settings/pattern",      { credentials: "include" }),
        ]);
        if (themeRes.ok)    { const d = await themeRes.json();    setTheme(d.active_theme); }
        if (socialRes.ok)   { const d = await socialRes.json();   setSocial(d); }
        if (contactRes.ok)  { const d = await contactRes.json();  setContact(d); }
        if (sectionsRes.ok) { const d = await sectionsRes.json(); setSections(d); }
        if (patternRes.ok)  { const d = await patternRes.json();  setPattern(d.background_pattern ?? "grid"); }
      } catch { setError("Failed to load settings"); }
      finally  { setLoading(false); }
    }
    fetchAll();
  }, []);

  function notify(msg: string) { setError(""); setSuccess(msg); setTimeout(() => setSuccess(""), 3000); }
  function notifyError(msg: string) { setSuccess(""); setError(msg); }

  async function save(url: string, body: object, msg: string, setFn: (v: boolean) => void) {
    setFn(true);
    try {
      const res = await fetch(url, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      notify(msg);
    } catch { notifyError(`Failed to save`); }
    finally  { setFn(false); }
  }

  async function handleChangePassword() {
    setPwError(""); setPwSuccess("");
    if (!pwCurrent || !pwNew || !pwConfirm) { setPwError("All fields are required"); return; }
    if (pwNew.length < 8) { setPwError("New password must be at least 8 characters"); return; }
    if (pwNew !== pwConfirm) { setPwError("Passwords do not match"); return; }
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew }),
      });
      if (res.status === 400) { const d = await res.json(); setPwError(d.detail || "Incorrect current password"); return; }
      if (!res.ok) throw new Error();
      setPwSuccess("Password changed successfully");
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
      setTimeout(() => setPwSuccess(""), 4000);
    } catch { setPwError("Failed to change password. Try again."); }
    finally  { setSavingPw(false); }
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

      {error   && <div className="s-banner s-banner--error">{error}</div>}
      {success && <div className="s-banner s-banner--ok">{success}</div>}

      {/* ── Theme ── always expanded ── */}
      <div className="s-panel">
        <h2 className="s-panel__title">Theme</h2>
        <div className="themes">
          {THEMES.map((t) => (
            <button key={t.value} className={`theme-card ${theme === t.value ? "active" : ""}`} onClick={() => setTheme(t.value)}>
              {/* dframe inner frame via ::before / ::after in CSS */}
              <div className="theme-card__swatch" style={{ background: t.color }} />
              <span className="theme-card__label">{t.label}</span>
            </button>
          ))}
        </div>
        <SaveBtn onClick={() => save("/api/settings/theme", { theme }, "Theme saved", setSaving)} disabled={saving} label="Save Theme" saving={saving} />
      </div>

      {/* ── Section Visibility ── */}
      <Collapsible title="Section Visibility" defaultOpen={true}>
        <p className="s-hint">Hero is always shown. Toggle sections on or off.</p>
        <div className="sections-grid">
          {SECTION_FIELDS.map(({ key, label, description }) => (
            <div key={key} className="section-row">
              <div className="section-row__info">
                <span className="section-row__label">{label}</span>
                <span className="section-row__desc">{description}</span>
              </div>
              <Toggle id={`toggle-${key}`} checked={!!sections[key]} onChange={(v) => setSections({ ...sections, [key]: v })} />
            </div>
          ))}
        </div>
        <SaveBtn onClick={() => save("/api/settings/sections", sections, "Visibility saved", setSavingSections)} disabled={savingSections} label="Save Visibility" saving={savingSections} />
      </Collapsible>

      {/* ── Background Pattern ── */}
      <Collapsible title="Background Pattern">
        <p className="s-hint">Hero section background pattern.</p>
        <div className="pattern-grid">
          {PATTERNS.map((p) => (
            <button key={p.value} className={`pattern-card ${pattern === p.value ? "active" : ""}`} onClick={() => setPattern(p.value)}>
              <div className="pattern-card__preview" style={{ backgroundImage: p.preview, backgroundSize: p.size }} />
              <span className="pattern-card__label">{p.label}</span>
            </button>
          ))}
        </div>
        <SaveBtn onClick={() => save("/api/settings/pattern", { background_pattern: pattern }, "Pattern saved", setSavingPattern)} disabled={savingPattern} label="Save Pattern" saving={savingPattern} />
      </Collapsible>

      {/* ── Social Links ── */}
      <Collapsible title="Social Links">
        <div className="s-field-group">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <div className="s-field" key={key}>
              <label className="s-field__label">{label}</label>
              <input type="url" className="s-field__input" value={(social[key] as string) ?? ""} onChange={(e) => setSocial({ ...social, [key]: e.target.value })} placeholder={placeholder} />
            </div>
          ))}
        </div>
        <SaveBtn onClick={() => save("/api/settings/social", social, "Social links saved", setSavingSocial)} disabled={savingSocial} label="Save Social Links" saving={savingSocial} />
      </Collapsible>

      {/* ── Contact Info ── */}
      <Collapsible title="Contact Info">
        <div className="s-field-group">
          {CONTACT_FIELDS.map(({ key, label, placeholder }) => (
            <div className="s-field" key={key}>
              <label className="s-field__label">{label}</label>
              <input type="text" className="s-field__input" value={(contact[key] as string) ?? ""} onChange={(e) => setContact({ ...contact, [key]: e.target.value })} placeholder={placeholder} />
            </div>
          ))}
        </div>
        <SaveBtn onClick={() => save("/api/settings/contact-info", contact, "Contact info saved", setSavingContact)} disabled={savingContact} label="Save Contact Info" saving={savingContact} />
      </Collapsible>

      {/* ── Security ── */}
      <Collapsible title="Security">
        <p className="s-hint">Change your admin password. You will need your current password to confirm.</p>
        {pwError   && <div className="s-banner s-banner--error" style={{ marginBottom:"1rem" }}>{pwError}</div>}
        {pwSuccess && <div className="s-banner s-banner--ok"   style={{ marginBottom:"1rem" }}>{pwSuccess}</div>}
        <div className="s-field-group">
          <div className="s-field">
            <label className="s-field__label">Current Password</label>
            <input type="password" className="s-field__input" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} placeholder="Enter current password" autoComplete="current-password" />
          </div>
          <div className="s-field">
            <label className="s-field__label">New Password</label>
            <input type="password" className="s-field__input" value={pwNew} onChange={e => setPwNew(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
          </div>
          <div className="s-field">
            <label className="s-field__label">Confirm New Password</label>
            <input type="password" className="s-field__input" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" />
          </div>
        </div>
        <SaveBtn onClick={handleChangePassword} disabled={savingPw} label="Change Password" saving={savingPw} />
      </Collapsible>

      <style jsx>{`
        /* ── Page header ── */
        .settings__header { margin-bottom: 2rem; }
        .settings__header h1 { font-family: var(--font-display); font-size: 2rem; margin: 0; }
        .settings__header p  { color: var(--color-text-muted); margin: 0.25rem 0 0; font-size: 0.875rem; }

        /* ── Banners ── */
        .s-banner { padding: 0.75rem 1rem; margin-bottom: 1rem; font-size: 0.875rem; }
        .s-banner--error { background: rgba(255,80,80,0.08); border: 1px solid rgba(255,80,80,0.3); color: #ff5050; }
        .s-banner--ok    { background: rgba(0,255,128,0.08); border: 1px solid rgba(0,255,128,0.3); color: #00ff80; }

        /* ── Panel — dframe style with admin CSS vars ── */
        .s-panel {
          position: relative;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          padding: 1.5rem;
          margin-bottom: 1rem;
        }
        /* inner rounded frame */
        .s-panel::before {
          content: '';
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 6px;
          pointer-events: none;
          z-index: 0;
        }
        /* corner accents TL + BR */
        .s-panel::after {
          content: '';
          position: absolute;
          inset: -1px;
          background:
            linear-gradient(var(--color-accent), var(--color-accent)) top left / 14px 1.5px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) top left / 1.5px 14px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) bottom right / 14px 1.5px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) bottom right / 1.5px 14px no-repeat;
          pointer-events: none;
          z-index: 2;
          transition: opacity 250ms ease;
        }
        .s-panel > * { position: relative; z-index: 1; }

        .s-panel__title { font-family: var(--font-display); font-size: 1.1rem; margin: 0 0 1.25rem; color: var(--color-accent); }

        /* ── Collapsible ── */
        .s-collapsible { padding: 0; }
        .s-collapsible__trigger {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 1.5rem; background: none; border: none; cursor: pointer; text-align: left;
          position: relative; z-index: 1;
          transition: background 150ms ease;
        }
        .s-collapsible__trigger:hover { background: rgba(255,255,255,0.02); }
        .s-collapsible__title { font-family: var(--font-display); font-size: 1.1rem; color: var(--color-accent); margin: 0; }
        .s-collapsible__body { padding: 0 1.5rem 1.5rem; border-top: 1px solid var(--color-border); position: relative; z-index: 1; }

        /* ── Save button — full width on small screens ── */
        .s-save-btn { margin-top: 1.25rem; }

        /* ── Hint text ── */
        .s-hint { font-size: 0.825rem; color: var(--color-text-muted); margin: 0 0 1.25rem; line-height: 1.6; }

        /* ── Theme cards — dframe style ── */
        .themes { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0; }
        .theme-card {
          position: relative;
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          padding: 1rem; min-width: 80px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          cursor: pointer; color: var(--color-text); font-size: 0.875rem;
          transition: border-color 0.2s;
        }
        .theme-card::before {
          content: ''; position: absolute; inset: 3px;
          border: 1px solid rgba(255,255,255,0.04); border-radius: 6px; pointer-events: none;
        }
        .theme-card::after {
          content: ''; position: absolute; inset: -1px;
          background:
            linear-gradient(var(--color-accent), var(--color-accent)) top left / 10px 1.5px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) top left / 1.5px 10px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) bottom right / 10px 1.5px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) bottom right / 1.5px 10px no-repeat;
          pointer-events: none; transition: opacity 250ms ease;
        }
        .theme-card:hover::after  { opacity: 0; }
        .theme-card.active::after { opacity: 0; }
        .theme-card:hover  { border-color: var(--color-text-muted); }
        .theme-card.active { border-color: var(--color-accent); }
        .theme-card > * { position: relative; z-index: 1; }
        .theme-card__swatch { width: 40px; height: 40px; border-radius: 50%; }
        .theme-card__label  { font-family: var(--font-body); font-size: 0.8rem; }

        /* ── Section visibility rows ── */
        .sections-grid { display: flex; flex-direction: column; border: 1px solid var(--color-border); overflow: hidden; margin-bottom: 0; }
        .section-row { display: flex; align-items: center; justify-content: space-between; padding: 0.875rem 1rem; border-bottom: 1px solid var(--color-border); transition: background 0.15s; }
        .section-row:last-child { border-bottom: none; }
        .section-row:hover { background: var(--color-bg); }
        .section-row__info { display: flex; flex-direction: column; gap: 2px; }
        .section-row__label { font-size: 0.9rem; color: var(--color-text); font-weight: 600; }
        .section-row__desc  { font-size: 0.78rem; color: var(--color-text-muted); font-family: var(--font-mono); }

        /* ── Pattern cards — dframe style ── */
        .pattern-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
        .pattern-card {
          position: relative;
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          padding: 0.75rem; background: var(--color-bg); border: 1px solid var(--color-border);
          cursor: pointer; transition: border-color 0.2s;
        }
        .pattern-card::before {
          content: ''; position: absolute; inset: 3px;
          border: 1px solid rgba(255,255,255,0.04); border-radius: 4px; pointer-events: none;
        }
        .pattern-card::after {
          content: ''; position: absolute; inset: -1px;
          background:
            linear-gradient(var(--color-accent), var(--color-accent)) top left / 8px 1px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) top left / 1px 8px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) bottom right / 8px 1px no-repeat,
            linear-gradient(var(--color-accent), var(--color-accent)) bottom right / 1px 8px no-repeat;
          pointer-events: none; transition: opacity 250ms ease;
        }
        .pattern-card:hover::after  { opacity: 0; }
        .pattern-card.active::after { opacity: 0; }
        .pattern-card:hover  { border-color: var(--color-text-muted); }
        .pattern-card.active { border-color: var(--color-accent); }
        .pattern-card > * { position: relative; z-index: 1; }
        .pattern-card__preview { width: 100%; height: 52px; opacity: 0.6; }
        .pattern-card__label { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-text-muted); letter-spacing: 1px; text-transform: uppercase; }
        .pattern-card.active .pattern-card__label { color: var(--color-accent); }
        @media (max-width: 600px) { .pattern-grid { grid-template-columns: repeat(2, 1fr); } }

        /* ── Fields ── */
        .s-field-group { display: flex; flex-direction: column; gap: 1rem; }
        .s-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .s-field__label { font-size: 0.8rem; color: var(--color-text-muted); font-family: var(--font-mono); }
        .s-field__input {
          background: var(--color-bg); border: 1px solid var(--color-border);
          padding: 0.625rem 0.75rem; color: var(--color-text); font-size: 0.9rem;
          outline: none; font-family: var(--font-body); transition: border-color 0.2s;
          width: 100%;
        }
        .s-field__input:focus { border-color: var(--color-accent); }
      `}</style>
    </div>
  );
}
