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

function ResumeSkeleton() {
  return (
    <div className="res-admin">
      <div className="res-admin__header">
        <Skel.Title width="quarter" />
        <Skel.Text width="half" size="sm" />
      </div>
      <Skel.Box height={120} style={{ marginBottom: "1rem" }} />
      {[0, 1].map((i) => (
        <Skel.Box key={i} height={64} style={{ marginBottom: "0.5rem" }} />
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function AdminResumePage() {
  const [resumes, setResumes]       = useState<Resume[]>([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [dragOver, setDragOver]     = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchResumes() {
    try {
      const res = await fetch("/api/resume", { credentials: "include" });
      if (res.ok) setResumes(await res.json());
    } catch { setError("Failed to load resumes"); }
    finally   { setLoading(false); }
  }

  useEffect(() => { fetchResumes(); }, []);

  function notify(msg: string) {
    setError(""); setSuccess(msg);
    setTimeout(() => setSuccess(""), 3500);
  }
  function notifyError(msg: string) {
    setSuccess(""); setError(msg);
    setTimeout(() => setError(""), 4000);
  }

  async function handleUpload(file: File) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx"].includes(ext ?? "")) {
      notifyError("Only PDF and DOCX files are accepted."); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notifyError("File must be under 10 MB."); return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/resume", {
        method: "POST", credentials: "include", body: form,
      });
      if (!res.ok) throw new Error();
      notify(`"${file.name}" uploaded successfully`);
      await fetchResumes();
    } catch { notifyError("Upload failed. Try again."); }
    finally  { setUploading(false); }
  }

  async function handleActivate(id: string) {
    try {
      const res = await fetch(`/api/resume/${id}/activate`, {
        method: "PATCH", credentials: "include",
      });
      if (!res.ok) throw new Error();
      notify("Resume set as active");
      await fetchResumes();
    } catch { notifyError("Failed to activate resume"); }
  }

  async function handleDelete(id: string, filename: string) {
    if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error();
      notify(`"${filename}" deleted`);
      await fetchResumes();
    } catch { notifyError("Failed to delete resume"); }
  }

  async function handleRename(id: string) {
    const name = renameVal.trim();
    if (!name) { notifyError("Filename cannot be empty"); return; }
    try {
      const res = await fetch(`/api/resume/${id}/rename`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: name }),
      });
      if (!res.ok) throw new Error();
      notify("Renamed successfully");
      setRenamingId(null);
      await fetchResumes();
    } catch { notifyError("Failed to rename"); }
  }

  if (loading) return <ResumeSkeleton />;

  const active = resumes.find(r => r.is_active);

  return (
    <div className="res-admin">

      {/* Header */}
      <div className="res-admin__header">
        <div>
          <h1>Resume</h1>
          <p>Upload and manage resume files. Set one as active to display on your site.</p>
        </div>
        {active && (
          <a href={active.file_url} target="_blank" rel="noopener noreferrer"
            className="admin-btn-secondary res-admin__preview-btn">
            ↗ View Active
          </a>
        )}
      </div>

      {error   && <div className="s-banner s-banner--error">{error}</div>}
      {success && <div className="s-banner s-banner--ok">{success}</div>}

      {/* Active resume card */}
      {active && (
        <div className="res-active-card">
          <div className="res-active-card__left">
            <span className="res-active-card__label">Currently Active</span>
            <span className="res-active-card__name">{active.filename}</span>
            <span className="res-active-card__meta">Uploaded {formatDate(active.uploaded_at)}</span>
          </div>
          <a href={active.file_url} target="_blank" rel="noopener noreferrer"
            className="res-action-btn" style={{ alignSelf: "center" }}>
            ↗ Open
          </a>
        </div>
      )}

      {/* Upload zone */}
      <div
        className={`res-dropzone ${dragOver ? "over" : ""} ${uploading ? "uploading" : ""}`}
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleUpload(file);
        }}
      >
        <input
          ref={fileRef} type="file" accept=".pdf,.docx"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
        />
        <div className="res-dropzone__icon">
          {uploading ? "⟳" : "↑"}
        </div>
        <div className="res-dropzone__text">
          {uploading
            ? "Uploading…"
            : <><strong>Drop a file here</strong> or click to browse</>}
        </div>
        <div className="res-dropzone__hint">PDF or DOCX · max 10 MB</div>
      </div>

      {/* File list */}
      {resumes.length === 0 ? (
        <div className="res-empty">No resume files uploaded yet.</div>
      ) : (
        <div className="res-list">
          <div className="res-list__head">
            <span>File</span>
            <span>Uploaded</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {resumes.map((r) => (
            <div key={r.id} className={`res-row ${r.is_active ? "active" : ""}`}>

              {/* Filename / rename */}
              <div className="res-row__name">
                <span className="res-row__ext">{r.filename.split(".").pop()?.toUpperCase()}</span>
                {renamingId === r.id ? (
                  <div className="res-rename">
                    <input
                      className="res-rename__input"
                      value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleRename(r.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      autoFocus
                    />
                    <button className="res-rename__save" onClick={() => handleRename(r.id)}>✓</button>
                    <button className="res-rename__cancel" onClick={() => setRenamingId(null)}>✕</button>
                  </div>
                ) : (
                  <span className="res-row__filename" title={r.filename}>{r.filename}</span>
                )}
              </div>

              {/* Date */}
              <span className="res-row__date">{formatDate(r.uploaded_at)}</span>

              {/* Status badge */}
              <span className={`res-badge ${r.is_active ? "res-badge--active" : "res-badge--idle"}`}>
                {r.is_active ? "● Active" : "○ Inactive"}
              </span>

              {/* Actions */}
              <div className="res-row__actions">
                <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                  className="res-action-btn" title="Open file">↗</a>
                <button className="res-action-btn" title="Rename"
                  onClick={() => { setRenamingId(r.id); setRenameVal(r.filename); }}>✎</button>
                {!r.is_active && (
                  <button className="res-action-btn res-action-btn--activate"
                    title="Set as active" onClick={() => handleActivate(r.id)}>
                    ✦ Set Active
                  </button>
                )}
                <button className="res-action-btn res-action-btn--delete"
                  title="Delete" onClick={() => handleDelete(r.id, r.filename)}>✕</button>
              </div>

            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        /* ── Page header ── */
        .res-admin__header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .res-admin__header h1 { font-family:var(--font-display); font-size:2rem; margin:0; }
        .res-admin__header p  { color:var(--color-text-muted); margin:0.25rem 0 0; font-size:0.875rem; }
        .res-admin__preview-btn { align-self:flex-start; font-size:0.8rem; white-space:nowrap; }

        /* ── Banners ── */
        .s-banner { padding:0.75rem 1rem; margin-bottom:1rem; font-size:0.875rem; }
        .s-banner--error { background:rgba(255,80,80,0.08); border:1px solid rgba(255,80,80,0.3); color:#ff5050; }
        .s-banner--ok    { background:rgba(0,255,128,0.08); border:1px solid rgba(0,255,128,0.3); color:#00ff80; }

        /* ── Active card ── */
        .res-active-card {
          display:flex; align-items:flex-start; justify-content:space-between; gap:1rem;
          padding:1rem 1.25rem; margin-bottom:1.25rem;
          border:1px solid var(--color-accent);
          background:var(--color-surface);
          position:relative;
        }
        .res-active-card::after {
          content:'';
          position:absolute;
          inset:-1px;
          background:
            linear-gradient(var(--color-accent),var(--color-accent)) top left / 12px 1.5px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) top left / 1.5px 12px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) bottom right / 12px 1.5px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) bottom right / 1.5px 12px no-repeat;
          pointer-events:none;
        }
        .res-active-card__left { display:flex; flex-direction:column; gap:2px; }
        .res-active-card__label { font-family:var(--font-mono); font-size:0.68rem; letter-spacing:2px; text-transform:uppercase; color:var(--color-accent); }
        .res-active-card__name  { font-size:0.95rem; color:var(--color-text); font-weight:600; }
        .res-active-card__meta  { font-family:var(--font-mono); font-size:0.72rem; color:var(--color-text-muted); }

        /* ── Drop zone ── */
        .res-dropzone {
          position:relative;
          border:1px dashed var(--color-border);
          background:var(--color-surface);
          padding:2.5rem;
          margin-bottom:1.5rem;
          text-align:center;
          cursor:pointer;
          transition:border-color 150ms, background 150ms;
          user-select:none;
        }
        .res-dropzone:hover, .res-dropzone.over {
          border-color:var(--color-accent);
          background:var(--color-bg);
        }
        .res-dropzone.uploading { cursor:wait; opacity:0.7; }
        .res-dropzone__icon { font-size:2rem; color:var(--color-accent); margin-bottom:0.5rem; line-height:1; display:inline-block; }
        .res-dropzone.uploading .res-dropzone__icon { animation:spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .res-dropzone__text { font-size:0.925rem; color:var(--color-text); margin-bottom:0.25rem; }
        .res-dropzone__text strong { color:var(--color-accent); }
        .res-dropzone__hint { font-family:var(--font-mono); font-size:0.72rem; letter-spacing:1px; color:var(--color-text-muted); text-transform:uppercase; }

        /* ── Empty state ── */
        .res-empty { padding:2rem; text-align:center; color:var(--color-text-muted); font-size:0.875rem; font-family:var(--font-mono); border:1px solid var(--color-border); }

        /* ── List ── */
        .res-list { border:1px solid var(--color-border); }
        .res-list__head {
          display:grid;
          grid-template-columns:1fr 110px 110px 210px;
          padding:0.6rem 1rem;
          background:var(--color-bg);
          border-bottom:1px solid var(--color-border);
          font-family:var(--font-mono);
          font-size:0.68rem;
          letter-spacing:1.5px;
          text-transform:uppercase;
          color:var(--color-text-muted);
          gap:1rem;
        }

        /* ── Row ── */
        .res-row {
          display:grid;
          grid-template-columns:1fr 110px 110px 210px;
          align-items:center;
          padding:0.875rem 1rem;
          gap:1rem;
          border-bottom:1px solid var(--color-border);
          transition:background 150ms;
        }
        .res-row:last-child { border-bottom:none; }
        .res-row:hover { background:var(--color-bg); }
        .res-row.active { border-left:2px solid var(--color-accent); padding-left:calc(1rem - 2px); }

        /* ── Row name ── */
        .res-row__name { display:flex; align-items:center; gap:0.6rem; min-width:0; }
        .res-row__ext {
          font-family:var(--font-mono); font-size:0.65rem; letter-spacing:1px;
          padding:2px 5px; border:1px solid var(--color-border);
          color:var(--color-accent); flex-shrink:0; background:var(--color-bg);
        }
        .res-row__filename { font-size:0.875rem; color:var(--color-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .res-row__date { font-family:var(--font-mono); font-size:0.75rem; color:var(--color-text-muted); white-space:nowrap; }

        /* ── Badge ── */
        .res-badge { font-family:var(--font-mono); font-size:0.72rem; letter-spacing:1px; white-space:nowrap; }
        .res-badge--active { color:var(--color-accent); }
        .res-badge--idle   { color:var(--color-text-muted); }

        /* ── Inline rename ── */
        .res-rename { display:flex; align-items:center; gap:0.35rem; flex:1; min-width:0; }
        .res-rename__input {
          flex:1; min-width:0;
          background:var(--color-bg); border:1px solid var(--color-accent);
          padding:0.3rem 0.5rem; color:var(--color-text);
          font-size:0.875rem; outline:none; font-family:var(--font-body);
        }
        .res-rename__save, .res-rename__cancel {
          background:none; border:1px solid var(--color-border); color:var(--color-text-muted);
          cursor:pointer; padding:0.3rem 0.5rem; font-size:0.8rem; flex-shrink:0; transition:all 120ms;
        }
        .res-rename__save:hover   { border-color:var(--color-accent); color:var(--color-accent); }
        .res-rename__cancel:hover { border-color:#ff5050; color:#ff5050; }

        /* ── Action buttons ── */
        .res-row__actions { display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; }
        .res-action-btn {
          background:none; border:1px solid var(--color-border); color:var(--color-text-muted);
          cursor:pointer; padding:0.35rem 0.6rem; font-size:0.8rem;
          font-family:var(--font-mono); text-decoration:none; display:inline-flex;
          align-items:center; gap:0.3rem; white-space:nowrap; transition:all 120ms;
        }
        .res-action-btn:hover { border-color:var(--color-text-muted); color:var(--color-text); }
        .res-action-btn--activate { border-color:var(--color-accent); color:var(--color-accent); font-size:0.72rem; }
        .res-action-btn--activate:hover { background:var(--color-accent); color:var(--color-bg); }
        .res-action-btn--delete:hover { border-color:#ff5050; color:#ff5050; }

        @media (max-width:768px) {
          .res-list__head { display:none; }
          .res-row { grid-template-columns:1fr; gap:0.5rem; }
        }
      `}</style>
    </div>
  );
}
