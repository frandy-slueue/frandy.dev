"use client";

import { useEffect, useRef, useState } from "react";
import { Skel } from "@/components/ui/Skeleton";

interface Resume {
  id: string; filename: string; file_url: string;
  is_active: boolean; uploaded_at: string;
}

interface ResumeSettings {
  resume_url: string | null;
  resume_url_docx: string | null;
  resume_url_share: string | null;
  resume_uploaded_at: string | null;
}

function ResumeSkeleton() {
  return (
    <div className="resume">
      <div className="rv-header">
        <div className="skel-group" style={{ gap:8 }}>
          <Skel.Title width="quarter" /><Skel.Text width="third" size="sm" />
        </div>
        <Skel.Box height={36} style={{ width:120 }} />
      </div>
      <div className="rv-list">
        {[0,1].map(i => (
          <div key={i} className="rv-item">
            <Skel.Circle size={40} />
            <div style={{ flex:1 }} className="skel-group">
              <Skel.Text width="half" /><Skel.Text width="third" size="sm" />
            </div>
            <Skel.Row>
              <Skel.Box height={30} style={{ width:52 }} />
              <Skel.Box height={30} style={{ width:72 }} />
            </Skel.Row>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilenameEditor({ resume, onSaved }: { resume: Resume; onSaved: (id:string, name:string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue]     = useState(resume.filename);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  function handleEdit()   { setValue(resume.filename); setError(""); setEditing(true); }
  function handleCancel() { setValue(resume.filename); setError(""); setEditing(false); }

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) { setError("Filename cannot be empty"); return; }
    if (trimmed === resume.filename) { setEditing(false); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/resume/${resume.id}/rename`, { method:"PATCH", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ filename: trimmed }) });
      if (!res.ok) throw new Error();
      onSaved(resume.id, trimmed); setEditing(false);
    } catch { setError("Failed to rename. Try again."); }
    finally  { setSaving(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter")  handleSave();
    if (e.key === "Escape") handleCancel();
  }

  if (editing) {
    return (
      <div className="fn-editor">
        <input ref={inputRef} className={`fn-editor__input ${error?"is-error":""}`} value={value} onChange={e=>setValue(e.target.value)} onKeyDown={handleKeyDown} disabled={saving} aria-label="Edit filename" />
        {error && <p className="fn-editor__error">{error}</p>}
        <div className="fn-editor__actions">
          <button className="admin-btn-primary" onClick={handleSave} disabled={saving||!value.trim()}>
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
          <button className="admin-btn-secondary" onClick={handleCancel} disabled={saving}><span>Cancel</span></button>
        </div>
      </div>
    );
  }

  return (
    <div className="fn-display">
      <span className="rv-filename">{resume.filename}</span>
      <button className="fn-edit-btn" onClick={handleEdit} title="Edit filename" aria-label="Edit filename">✎</button>
    </div>
  );
}

export default function AdminResume() {
  const [resumes, setResumes]         = useState<Resume[]>([]);
  const [settings, setSettings]       = useState<ResumeSettings | null>(null);
  const [loading, setLoading]         = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [uploadingDocx, setUpDocx]    = useState(false);
  const [deletingDocx, setDelDocx]    = useState(false);
  const [shareInput, setShareInput]   = useState("");
  const [savingShare, setSavingShare] = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const fileInputRef     = useRef<HTMLInputElement>(null);
  const docxInputRef     = useRef<HTMLInputElement>(null);

  async function fetchResumes() {
    try {
      const [resumeRes, settingsRes] = await Promise.all([
        fetch("/api/resume", { credentials:"include" }),
        fetch("/api/settings/resume"),
      ]);
      setResumes(await resumeRes.json());
      const s: ResumeSettings = await settingsRes.json();
      setSettings(s);
      setShareInput(s.resume_url_share || "");
    } catch { setError("Failed to load resumes"); }
    finally  { setLoading(false); }
  }

  useEffect(() => { fetchResumes(); }, []);

  // ── PDF ────────────────────────────────────────────────────────────────────

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(""); setSuccess("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/resume", { method:"POST", credentials:"include", body:fd });
      if (!res.ok) throw new Error();
      setSuccess("PDF uploaded successfully"); await fetchResumes();
    } catch { setError("Failed to upload PDF"); }
    finally  { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  async function handleActivate(id: string) {
    try {
      const res = await fetch(`/api/resume/${id}/activate`, { method:"PATCH", credentials:"include" });
      if (!res.ok) throw new Error();
      setSuccess("Resume set as active"); await fetchResumes();
    } catch { setError("Failed to activate resume"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume?")) return;
    try {
      await fetch(`/api/resume/${id}`, { method:"DELETE", credentials:"include" });
      setResumes(p => p.filter(r => r.id!==id)); setSuccess("Resume deleted");
    } catch { setError("Failed to delete resume"); }
  }

  function handleRenamed(id: string, newName: string) {
    setResumes(p => p.map(r => r.id===id ? { ...r, filename:newName } : r));
    setSuccess("Filename updated");
  }

  // ── DOCX ───────────────────────────────────────────────────────────────────

  async function handleUploadDocx(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpDocx(true); setError(""); setSuccess("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/settings/resume/docx", { method:"POST", credentials:"include", body:fd });
      if (!res.ok) throw new Error();
      setSuccess("DOCX uploaded successfully"); await fetchResumes();
    } catch { setError("Failed to upload DOCX"); }
    finally  { setUpDocx(false); if (docxInputRef.current) docxInputRef.current.value = ""; }
  }

  async function handleDeleteDocx() {
    if (!confirm("Remove the DOCX resume?")) return;
    setDelDocx(true); setError(""); setSuccess("");
    try {
      await fetch("/api/settings/resume/docx", { method:"DELETE", credentials:"include" });
      setSuccess("DOCX removed"); await fetchResumes();
    } catch { setError("Failed to remove DOCX"); }
    finally  { setDelDocx(false); }
  }

  // ── Share link ─────────────────────────────────────────────────────────────

  async function handleSaveShare() {
    setSavingShare(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/settings/resume/share", {
        method:"PUT", credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ resume_url_share: shareInput.trim() || null }),
      });
      if (!res.ok) throw new Error();
      setSuccess("Share link saved"); await fetchResumes();
    } catch { setError("Failed to save share link"); }
    finally  { setSavingShare(false); }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  }

  if (loading) return <ResumeSkeleton />;

  return (
    <div className="resume">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="rv-header">
        <div>
          <h1>Resume Manager</h1>
          <p>{resumes.length} PDF file{resumes.length!==1?"s":""} uploaded</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display:"none" }} id="resume-upload" />
          <label htmlFor="resume-upload" className="admin-btn-primary">
            <span>{uploading ? "Uploading..." : "+ Upload PDF"}</span>
          </label>
        </div>
      </div>

      {error   && <div className="rv-banner rv-banner--error">{error}</div>}
      {success && <div className="rv-banner rv-banner--ok">{success}</div>}

      {/* ── PDF list ───────────────────────────────────────────────────── */}
      {resumes.length === 0 ? (
        <div className="rv-empty">
          <p>No resumes uploaded yet.</p>
          <label htmlFor="resume-upload" className="admin-btn-primary">
            <span>Upload your first resume</span>
          </label>
        </div>
      ) : (
        <div className="rv-list">
          {resumes.map(r => (
            <div key={r.id} className={`rv-item ${r.is_active?"active":""}`}>
              <div className="rv-item__icon">📄</div>
              <div className="rv-item__info">
                <FilenameEditor resume={r} onSaved={handleRenamed} />
                <div className="rv-item__meta">
                  Uploaded {formatDate(r.uploaded_at)}
                  {r.is_active && <span className="rv-badge">Active</span>}
                </div>
              </div>
              <div className="rv-item__actions">
                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="admin-btn-secondary"><span>View</span></a>
                {!r.is_active && (
                  <button className="admin-btn-secondary" onClick={() => handleActivate(r.id)}><span>Set Active</span></button>
                )}
                <button className="admin-btn-primary" onClick={() => handleDelete(r.id)}><span>Delete</span></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DOCX card ──────────────────────────────────────────────────── */}
      <div className="rv-section-divider">
        <span>DOCX Version</span>
      </div>

      <div className={`rv-item ${settings?.resume_url_docx ? "active" : ""}`}>
        <div className="rv-item__icon">📝</div>
        <div className="rv-item__info">
          <div className="fn-display">
            <span className="rv-filename">
              {settings?.resume_url_docx
                ? "frandy-slueue-resume.docx"
                : "No DOCX uploaded"}
            </span>
          </div>
          <div className="rv-item__meta">
            {settings?.resume_url_docx
              ? <span className="rv-badge">Uploaded</span>
              : <span style={{ color:"var(--color-text-muted)" }}>Upload a .docx file to enable DOCX downloads</span>
            }
          </div>
        </div>
        <div className="rv-item__actions">
          {settings?.resume_url_docx && (
            <>
              <a href={settings.resume_url_docx} target="_blank" rel="noopener noreferrer" className="admin-btn-secondary">
                <span>View</span>
              </a>
              <button className="admin-btn-primary" onClick={handleDeleteDocx} disabled={deletingDocx}>
                <span>{deletingDocx ? "Removing..." : "Remove"}</span>
              </button>
            </>
          )}
          <input ref={docxInputRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleUploadDocx} style={{ display:"none" }} id="docx-upload" />
          <label htmlFor="docx-upload" className="admin-btn-secondary">
            <span>{uploadingDocx ? "Uploading..." : settings?.resume_url_docx ? "Replace" : "+ Upload DOCX"}</span>
          </label>
        </div>
      </div>

      {/* ── Share link card ────────────────────────────────────────────── */}
      <div className="rv-section-divider">
        <span>Share Link</span>
      </div>

      <div className="rv-item">
        <div className="rv-item__icon">🔗</div>
        <div className="rv-item__info" style={{ flex:1 }}>
          <p className="rv-filename" style={{ marginBottom:8 }}>Custom share URL</p>
          <p style={{ fontSize:"0.8rem", color:"var(--color-text-muted)", marginBottom:12 }}>
            Optionally set a custom URL for the Share button (e.g. a Google Drive link or LinkedIn profile). Defaults to <code style={{ fontFamily:"var(--font-mono)", fontSize:"0.78rem" }}>frandy.dev/resume</code> if left empty.
          </p>
          <div className="share-input-row">
            <input
              className="fn-editor__input"
              style={{ flex:1, maxWidth:"100%" }}
              value={shareInput}
              onChange={e => setShareInput(e.target.value)}
              placeholder="https://..."
              aria-label="Custom share URL"
            />
            <button
              className="admin-btn-primary"
              onClick={handleSaveShare}
              disabled={savingShare}
            >
              <span>{savingShare ? "Saving..." : "Save"}</span>
            </button>
            {shareInput && (
              <button
                className="admin-btn-secondary"
                onClick={() => { setShareInput(""); }}
              >
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .rv-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:2rem; }
        .rv-header h1 { font-family:var(--font-display); font-size:2rem; margin:0; }
        .rv-header p  { color:var(--color-text-muted); margin:0.25rem 0 0; font-size:0.875rem; }
        .rv-banner { padding:0.75rem 1rem; margin-bottom:1rem; font-size:0.875rem; }
        .rv-banner--error { background:rgba(255,80,80,0.08); border:1px solid rgba(255,80,80,0.3); color:#ff5050; }
        .rv-banner--ok    { background:rgba(0,255,128,0.08); border:1px solid rgba(0,255,128,0.3); color:#00ff80; }

        .rv-section-divider {
          display:flex; align-items:center; gap:12px;
          margin:2rem 0 1rem;
          color:var(--color-text-muted);
          font-family:var(--font-mono);
          font-size:0.75rem;
          letter-spacing:2px;
          text-transform:uppercase;
        }
        .rv-section-divider::before,
        .rv-section-divider::after {
          content:''; flex:1; height:1px; background:var(--color-border);
        }

        .rv-list { display:flex; flex-direction:column; gap:0.75rem; }

        /* document panel — dframe */
        .rv-item {
          position:relative;
          display:flex; align-items:flex-start; flex-wrap:wrap; gap:1rem;
          background:var(--color-surface);
          border:1px solid var(--color-border);
          padding:1.25rem;
          transition:border-color 250ms ease;
          margin-bottom:0.75rem;
        }
        .rv-item::before {
          content:''; position:absolute; inset:4px;
          border:1px solid rgba(255,255,255,0.04); border-radius:6px; pointer-events:none;
        }
        .rv-item::after {
          content:''; position:absolute; inset:-1px;
          background:
            linear-gradient(var(--color-accent),var(--color-accent)) top left / 14px 1.5px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) top left / 1.5px 14px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) bottom right / 14px 1.5px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) bottom right / 1.5px 14px no-repeat;
          pointer-events:none; z-index:2; transition:opacity 250ms ease;
        }
        .rv-item:hover::after { opacity:0; }
        .rv-item.active { border-color:var(--color-accent); }
        .rv-item.active::after { opacity:0; }
        .rv-item > * { position:relative; z-index:1; }

        .rv-item__icon { font-size:2rem; flex-shrink:0; }
        .rv-item__info { flex:1; min-width:0; }
        .rv-filename   { font-size:0.95rem; color:var(--color-text); font-family:var(--font-mono); word-break:break-all; }
        .rv-item__meta { font-size:0.8rem; color:var(--color-text-muted); margin-top:0.25rem; display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; }
        .rv-badge { background:rgba(0,255,128,0.1); color:#00ff80; font-size:0.7rem; padding:0.2rem 0.6rem; border-radius:999px; font-family:var(--font-mono); }
        .rv-item__actions { display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; }

        /* filename editor */
        .fn-display { display:flex; align-items:center; gap:8px; }
        .fn-edit-btn { background:none; border:none; color:var(--color-text-muted); cursor:pointer; font-size:14px; padding:2px 4px; transition:color 0.15s; flex-shrink:0; line-height:1; }
        .fn-edit-btn:hover { color:var(--color-accent); }
        .fn-editor { display:flex; flex-direction:column; gap:8px; }
        .fn-editor__input { background:var(--color-bg); border:1px solid var(--color-accent); padding:6px 10px; color:var(--color-text); font-family:var(--font-mono); font-size:0.9rem; outline:none; width:100%; max-width:360px; }
        .fn-editor__input:focus { box-shadow:0 0 0 1px var(--color-accent); }
        .fn-editor__input.is-error { border-color:#ff5050; }
        .fn-editor__error { font-size:0.78rem; color:#ff5050; font-family:var(--font-mono); margin:0; }
        .fn-editor__actions { display:flex; gap:6px; }

        /* share link row */
        .share-input-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .share-input-row .fn-editor__input { max-width:480px; }

        .rv-empty { padding:3rem; text-align:center; color:var(--color-text-muted); display:flex; flex-direction:column; align-items:center; gap:1rem; }
        @media (max-width:768px) {
          .rv-header { flex-direction:column; gap:1rem; }
          .rv-item__actions { width:100%; }
          .share-input-row { flex-direction:column; align-items:flex-start; }
          .share-input-row .fn-editor__input { max-width:100%; }
        }
      `}</style>
    </div>
  );
}
