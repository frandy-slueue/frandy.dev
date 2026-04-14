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
function Collapsible({ title, icon, defaultOpen = false, children }: {
  title: string; icon?: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="s-collapsible">
      <button type="button" className="s-collapsible__bar" onClick={() => setOpen(p => !p)} aria-expanded={open}>
        <div className="s-collapsible__bar-left">
          {icon && <span className="s-collapsible__icon">{icon}</span>}
          <span className="s-collapsible__title">{title}</span>
        </div>
        <div className="s-collapsible__bar-right">
          <span className="s-collapsible__status">{open ? "Collapse" : "Expand"}</span>
          <span className={`s-collapsible__chevron ${open ? "open" : ""}`}>▼</span>
        </div>
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
  const [themeMode, setThemeMode] = useState("dark");
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

  const [unCurrent,    setUnCurrent]    = useState("");
  const [unNew,        setUnNew]        = useState("");
  const [savingUn,     setSavingUn]     = useState(false);
  const [unError,      setUnError]      = useState("");
  const [unSuccess,    setUnSuccess]    = useState("");

  const [loading,        setLoading]        = useState(true);
  const [activePanel,    setActivePanel]    = useState<string>("visibility");
  function togglePanel(key: string) { setActivePanel(p => p === key ? "" : key); }
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
        if (themeRes.ok)    { const d = await themeRes.json();    setTheme(d.active_theme); setThemeMode(d.theme_mode ?? "dark"); }
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

  async function handleChangeUsername() {
    setUnError(""); setUnSuccess("");
    if (!unCurrent || !unNew) { setUnError("All fields are required"); return; }
    if (unNew.length < 3) { setUnError("Username must be at least 3 characters"); return; }
    setSavingUn(true);
    try {
      const res = await fetch("/api/auth/change-username", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: unCurrent, new_username: unNew }),
      });
      if (res.status === 400) { const d = await res.json(); setUnError(d.detail || "Incorrect password"); return; }
      if (!res.ok) throw new Error();
      setUnSuccess("Username changed successfully");
      setUnCurrent(""); setUnNew("");
      setTimeout(() => setUnSuccess(""), 4000);
    } catch { setUnError("Failed to change username. Try again."); }
    finally { setSavingUn(false); }
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
        {/* Mode toggle */}
        <div style={{ marginBottom:"1rem" }}>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"1px", textTransform:"uppercase", color:"var(--color-text-muted)", marginBottom:"0.5rem" }}>Default Mode</p>
          <div style={{ display:"flex", gap:"0.5rem" }}>
            {["dark","light"].map(m=>(
              <button key={m} onClick={()=>setThemeMode(m)}
                style={{ flex:1, padding:"8px", border:`1px solid ${themeMode===m?"var(--color-accent)":"var(--color-border)"}`, background:themeMode===m?"var(--color-accent)":"transparent", color:themeMode===m?"var(--color-bg)":"var(--color-text-muted)", fontFamily:"var(--font-mono)", fontSize:"11px", letterSpacing:"1px", textTransform:"uppercase", cursor:"pointer", transition:"all 150ms" }}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <SaveBtn onClick={() => save("/api/settings/theme", { theme, mode: themeMode }, "Theme saved", setSaving)} disabled={saving} label="Save Theme" saving={saving} />
      </div>

      {/* ── Section Visibility ── */}
      <Collapsible title="Section Visibility" icon="◧" description="Toggle sections on or off" isOpen={activePanel==="visibility"} onToggle={()=>togglePanel("visibility")}>
        <p className="s-hint">Hero is always shown. Toggle sections on or off.</p>
        <div className="sections-grid two-col">
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
      <Collapsible title="Background Pattern" icon="◫" description="Hero section background pattern" isOpen={activePanel==="pattern"} onToggle={()=>togglePanel("pattern")}>
        <p className="s-hint">Hero section background pattern.</p>
        <div className="pattern-grid two-col">
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
      <Collapsible title="Social Links" icon="◈" description="GitHub, LinkedIn, Twitter and more" isOpen={activePanel==="social"} onToggle={()=>togglePanel("social")}>
        <div className="s-field-group two-col">
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
      <Collapsible title="Contact Info" icon="◉" description="Email, phone and WhatsApp" isOpen={activePanel==="contact"} onToggle={()=>togglePanel("contact")}>
        <div className="s-field-group two-col">
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
      <Collapsible title="Security" icon="◑" description="Change password and username" isOpen={activePanel==="security"} onToggle={()=>togglePanel("security")}>
        <div className="s-security-grid">

          {/* Change Password */}
          <div className="s-security-card">
            <h3 className="s-security-card__title">Change Password</h3>
            <p className="s-hint">You will need your current password to confirm.</p>
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
          </div>

          {/* Change Username */}
          <div className="s-security-card">
            <h3 className="s-security-card__title">Change Username</h3>
            <p className="s-hint">Enter your current password to confirm the username change.</p>
            {unError   && <div className="s-banner s-banner--error" style={{ marginBottom:"1rem" }}>{unError}</div>}
            {unSuccess && <div className="s-banner s-banner--ok"   style={{ marginBottom:"1rem" }}>{unSuccess}</div>}
            <div className="s-field-group">
              <div className="s-field">
                <label className="s-field__label">Current Password</label>
                <input type="password" className="s-field__input" value={unCurrent} onChange={e => setUnCurrent(e.target.value)} placeholder="Enter current password" autoComplete="current-password" />
              </div>
              <div className="s-field">
                <label className="s-field__label">New Username</label>
                <input type="text" className="s-field__input" value={unNew} onChange={e => setUnNew(e.target.value)} placeholder="At least 3 characters" autoComplete="username" />
              </div>
            </div>
            <SaveBtn onClick={handleChangeUsername} disabled={savingUn} label="Change Username" saving={savingUn} />
          </div>

        </div>
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

        /* ── Collapsible accordion — elegant bar design ── */
        .s-collapsible {
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          margin-bottom: 0.5rem;
          position: relative;
          transition: border-color 200ms ease;
        }
        .s-collapsible.is-open {
          border-color: var(--color-accent);
        }
        .s-collapsible__bar {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.25rem;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          position: relative;
          z-index: 1;
          transition: background 150ms ease;
          border-left: 3px solid transparent;
        }
        .is-open .s-collapsible__bar { border-left-color: var(--color-accent); }
        .s-collapsible__bar:hover { background: rgba(255,255,255,0.025); border-left-color: var(--color-accent); }
        .s-collapsible__bar-left { display: flex; align-items: center; gap: 0.875rem; }
        .s-collapsible__bar-right { display: flex; align-items: center; gap: 0.5rem; }
        .s-collapsible__bar-text { display: flex; flex-direction: column; gap: 2px; }
        .s-collapsible__icon { font-size: 1.1rem; color: var(--color-accent); flex-shrink: 0; }
        .s-collapsible__title { font-family: var(--font-display); font-size: 1rem; color: var(--color-text); margin: 0; letter-spacing: 1px; line-height: 1.2; }
        .s-collapsible__desc { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 1px; color: var(--color-text-muted); text-transform: uppercase; }
        .s-collapsible__chevron { font-size: 0.65rem; color: var(--color-text-muted); transition: transform 250ms ease, color 200ms ease; display: inline-block; }
        .s-collapsible__chevron.open { transform: rotate(180deg); color: var(--color-accent); }
        .s-collapsible__body { padding: 1.25rem 1.5rem; border-top: 1px solid var(--color-border); position: relative; z-index: 1; }

        /* ── 2-column grids ── */
        .sections-grid.two-col { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--color-border); overflow: hidden; margin-bottom: 0; }
        .sections-grid.two-col .section-row { border-right: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
        .sections-grid.two-col .section-row:nth-child(2n) { border-right: none; }
        .s-field-group.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .pattern-grid.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

        /* ── Security 2-col ── */
        .s-security-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .s-security-card { background: var(--color-bg); border: 1px solid var(--color-border); padding: 1.25rem; }
        .s-security-card__title { font-family: var(--font-display); font-size: 0.95rem; color: var(--color-accent); margin: 0 0 0.5rem; letter-spacing: 1px; }

        @media (max-width: 768px) {
          .sections-grid.two-col { grid-template-columns: 1fr; }
          .s-field-group.two-col { grid-template-columns: 1fr; }
          .pattern-grid.two-col { grid-template-columns: 1fr 1fr; }
          .s-security-grid { grid-template-columns: 1fr; }
        }

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
        .section-row { display: flex; align-items: center; justify-content: space-between; padding: 0.875rem 1rem; transition: background 0.15s; }
        .section-row:hover { background: var(--color-bg); }
        .section-row__info { display: flex; flex-direction: column; gap: 2px; }
        .section-row__label { font-size: 0.9rem; color: var(--color-text); font-weight: 600; }
        .section-row__desc  { font-size: 0.78rem; color: var(--color-text-muted); font-family: var(--font-mono); }

        /* ── Pattern cards ── */
        .pattern-card {
          position: relative;
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          padding: 0.75rem; background: var(--color-bg); border: 1px solid var(--color-border);
          cursor: pointer; transition: border-color 0.2s;
        }
        .pattern-card:hover  { border-color: var(--color-text-muted); }
        .pattern-card.active { border-color: var(--color-accent); }
        .pattern-card > * { position: relative; z-index: 1; }
        .pattern-card__preview { width: 100%; height: 52px; opacity: 0.6; }
        .pattern-card__label { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-text-muted); letter-spacing: 1px; text-transform: uppercase; }
        .pattern-card.active .pattern-card__label { color: var(--color-accent); }

        /* ── Save button ── */
        .s-save-btn { margin-top: 1.25rem; }
        .s-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .s-field__label { font-size: 0.8rem; color: var(--color-text-muted); font-family: var(--font-mono); }
        .s-field__input {
          background: var(--color-bg); border: 1px solid var(--color-border);
          padding: 0.625rem 0.75rem; color: var(--color-text); font-size: 0.9rem;
          outline: none; font-family: var(--font-body); transition: border-color 0.2s;
          width: 100%;
        }
        .s-field__input:focus { border-color: var(--color-accent); }
        @media (max-width: 768px) {
          .sections-grid.two-col { grid-template-columns: 1fr; }
          .s-field-group.two-col { grid-template-columns: 1fr; }
          .pattern-grid.two-col { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
