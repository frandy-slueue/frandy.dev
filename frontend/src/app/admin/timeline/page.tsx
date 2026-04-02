"use client";

import { useEffect, useRef, useState } from "react";
import { Skel } from "@/components/ui/Skeleton";

interface Entry {
  id: string; sort_order: number; period: string; date_label: string;
  title: string; category: string; description: string; image_url: string | null;
}

const CATEGORIES = ["Education","Work","Milestone","Certifications","Background"];
const EMPTY: Omit<Entry,"id"|"image_url"> = { sort_order:0, period:"", date_label:"", title:"", category:"Education", description:"" };

function Skeleton() {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"2rem" }}>
        <Skel.Title width="quarter" /><Skel.Box height={36} style={{ width:120 }} />
      </div>
      {[0,1,2,3].map(i=><div key={i} style={{ borderBottom:"1px solid #1a1a1a", padding:"12px 0" }}><Skel.Text /></div>)}
    </div>
  );
}

export default function AdminTimeline() {
  const [entries, setEntries]   = useState<Entry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<string|null>(null);
  const [form, setForm]         = useState({ ...EMPTY });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [uploadingId, setUploadingId] = useState<string|null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement|null>>({});

  async function load() {
    try {
      const res = await fetch("/api/timeline", { credentials:"include" });
      setEntries(await res.json());
    } catch { setError("Failed to load timeline"); }
    finally  { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function notify(msg: string) { setError(""); setSuccess(msg); setTimeout(()=>setSuccess(""),3000); }
  function notifyErr(msg: string) { setSuccess(""); setError(msg); }

  function openCreate() {
    const nextOrder = entries.length ? Math.max(...entries.map(e=>e.sort_order))+1 : 0;
    setForm({ ...EMPTY, sort_order: nextOrder });
    setEditId(null); setShowForm(true);
  }

  function openEdit(e: Entry) {
    setForm({ sort_order:e.sort_order, period:e.period, date_label:e.date_label, title:e.title, category:e.category, description:e.description });
    setEditId(e.id); setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.period.trim()) { notifyErr("Period and Title are required"); return; }
    setSaving(true);
    try {
      const url    = editId ? `/api/timeline/${editId}` : "/api/timeline";
      const method = editId ? "PUT" : "POST";
      const res    = await fetch(url, { method, credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (!res.ok) throw new Error();
      await load(); setShowForm(false); notify(editId ? "Entry updated" : "Entry created");
    } catch { notifyErr("Failed to save entry"); }
    finally  { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this timeline entry?")) return;
    try {
      await fetch(`/api/timeline/${id}`, { method:"DELETE", credentials:"include" });
      setEntries(p=>p.filter(e=>e.id!==id)); notify("Entry deleted");
    } catch { notifyErr("Failed to delete entry"); }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, id: string) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingId(id);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`/api/timeline/${id}/image`, { method:"PATCH", credentials:"include", body:fd });
      if (!res.ok) throw new Error();
      await load(); notify("Image uploaded");
    } catch { notifyErr("Failed to upload image"); }
    finally { setUploadingId(null); if(fileRefs.current[id]) fileRefs.current[id]!.value=""; }
  }

  async function handleRemoveImage(id: string) {
    try {
      await fetch(`/api/timeline/${id}/image`, { method:"DELETE", credentials:"include" });
      setEntries(p=>p.map(e=>e.id===id ? { ...e, image_url:null } : e)); notify("Image removed");
    } catch { notifyErr("Failed to remove image"); }
  }

  if (loading) return <Skeleton />;

  return (
    <div className="tl-admin">
      <div className="tl-header">
        <div>
          <h1>Timeline</h1>
          <p>{entries.length} entries</p>
        </div>
        <button className="admin-btn-primary" onClick={openCreate}><span>+ Add Entry</span></button>
      </div>

      {error   && <div className="tl-banner tl-banner--error">{error}</div>}
      {success && <div className="tl-banner tl-banner--ok">{success}</div>}

      {/* Create / Edit form */}
      {showForm && (
        <div className="tl-form-wrap">
          <div className="tl-form">
            <div className="tl-form__head">
              <span>{editId ? "Edit Entry" : "New Entry"}</span>
              <span style={{ fontSize:"10px", color:"var(--color-text-muted)" }}>Press Esc to cancel</span>
            </div>
            <div className="tl-form__grid">
              <div className="f-field">
                <label>Period *</label>
                <input value={form.period} onChange={e=>setForm({...form,period:e.target.value})} placeholder="2024 / Before" />
              </div>
              <div className="f-field">
                <label>Date Label</label>
                <input value={form.date_label} onChange={e=>setForm({...form,date_label:e.target.value})} placeholder="January" />
              </div>
              <div className="f-field">
                <label>Title *</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Atlas School of Tulsa" />
              </div>
              <div className="f-field">
                <label>Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="f-field f-full">
                <label>Description</label>
                <textarea rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What happened, what you learned, why it mattered..." />
              </div>
              <div className="f-field">
                <label>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e=>setForm({...form,sort_order:parseInt(e.target.value)||0})} />
              </div>
            </div>
            <div className="tl-form__actions">
              <button className="admin-btn-secondary" onClick={()=>setShowForm(false)}><span>Cancel</span></button>
              <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
                <span>{saving?"Saving...":editId?"Update":"Create"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry table */}
      {entries.length === 0 ? (
        <div className="tl-empty">
          <p>No entries yet.</p>
          <button className="admin-btn-primary" onClick={openCreate}><span>Add first entry</span></button>
        </div>
      ) : (
        <div className="tl-table-wrap">
          <table className="tl-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Period</th>
                <th>Title</th>
                <th>Category</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td style={{ color:"var(--color-text-muted)", fontSize:"11px" }}>{entry.sort_order}</td>
                  <td style={{ fontFamily:"var(--font-display)", fontSize:"16px", color:"var(--color-accent)", letterSpacing:"1px" }}>{entry.period}</td>
                  <td style={{ color:"var(--color-text)" }}>
                    <div style={{ fontWeight:600, fontSize:"13px" }}>{entry.title}</div>
                    {entry.date_label && <div style={{ fontSize:"10px", color:"var(--color-text-muted)", marginTop:"2px" }}>{entry.date_label}</div>}
                  </td>
                  <td>
                    <span style={{
                      fontSize:"9px", padding:"3px 8px", borderRadius:"999px",
                      background:"rgba(192,192,192,0.08)", color:"var(--color-text-muted)",
                      letterSpacing:"1px", textTransform:"uppercase"
                    }}>{entry.category}</span>
                  </td>
                  <td>
                    <input
                      type="file" accept="image/*"
                      style={{ display:"none" }}
                      ref={el => { fileRefs.current[entry.id] = el; }}
                      onChange={e => handleImageUpload(e, entry.id)}
                    />
                    {entry.image_url ? (
                      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <img src={entry.image_url} alt="" style={{ width:40, height:30, objectFit:"cover", border:"1px solid var(--color-border)" }} />
                        <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                          <button className="admin-btn-secondary" style={{ fontSize:"9px", padding:"3px 10px" }}
                            onClick={()=>fileRefs.current[entry.id]?.click()}>
                            <span>{uploadingId===entry.id?"...":"Change"}</span>
                          </button>
                          <button className="admin-btn-danger" style={{ fontSize:"9px", padding:"3px 10px" }}
                            onClick={()=>handleRemoveImage(entry.id)}>Remove</button>
                        </div>
                      </div>
                    ) : (
                      <button className="admin-btn-secondary" style={{ fontSize:"9px", padding:"4px 12px" }}
                        onClick={()=>fileRefs.current[entry.id]?.click()}>
                        <span>{uploadingId===entry.id?"Uploading...":"+ Image"}</span>
                      </button>
                    )}
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button className="admin-btn-secondary" onClick={()=>openEdit(entry)}><span>Edit</span></button>
                      <button className="admin-btn-primary" onClick={()=>handleDelete(entry.id)}><span>Delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .tl-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:2rem; }
        .tl-header h1 { font-family:var(--font-display); font-size:2rem; margin:0; }
        .tl-header p  { color:var(--color-text-muted); margin:0.25rem 0 0; font-size:0.875rem; }
        .tl-banner { padding:0.75rem 1rem; margin-bottom:1rem; font-size:0.875rem; }
        .tl-banner--error { background:rgba(255,80,80,0.08); border:1px solid rgba(255,80,80,0.3); color:#ff5050; }
        .tl-banner--ok    { background:rgba(0,255,128,0.08); border:1px solid rgba(0,255,128,0.3); color:#00ff80; }

        /* form */
        .tl-form-wrap { margin-bottom:2rem; }
        .tl-form { position:relative; background:var(--color-surface); border:1px solid var(--color-border); }
        .tl-form::before { content:''; position:absolute; inset:4px; border:1px solid rgba(255,255,255,0.04); border-radius:6px; pointer-events:none; }
        .tl-form::after {
          content:''; position:absolute; inset:-1px;
          background:
            linear-gradient(var(--color-accent),var(--color-accent)) top left/14px 1.5px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) top left/1.5px 14px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) bottom right/14px 1.5px no-repeat,
            linear-gradient(var(--color-accent),var(--color-accent)) bottom right/1.5px 14px no-repeat;
          pointer-events:none; z-index:2; transition:opacity 250ms;
        }
        .tl-form:hover::after { opacity:0; }
        .tl-form > * { position:relative; z-index:1; }
        .tl-form__head { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid var(--color-border); font-family:var(--font-display); font-size:1rem; color:var(--color-accent); }
        .tl-form__grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; padding:16px; }
        .tl-form__actions { display:flex; justify-content:flex-end; gap:8px; padding:0 16px 16px; }
        .f-field { display:flex; flex-direction:column; gap:4px; }
        .f-full  { grid-column:1/-1; }
        .f-field label { font-size:9px; color:var(--color-text-muted); font-family:var(--font-mono); letter-spacing:1.5px; text-transform:uppercase; }
        .f-field input,.f-field textarea,.f-field select { background:var(--color-bg); border:1px solid var(--color-border); padding:7px 10px; color:var(--color-text); font-size:12px; outline:none; font-family:var(--font-body); transition:border-color 0.2s; width:100%; }
        .f-field input:focus,.f-field textarea:focus,.f-field select:focus { border-color:var(--color-accent); }

        .tl-empty { text-align:center; padding:3rem; color:var(--color-text-muted); display:flex; flex-direction:column; align-items:center; gap:1rem; }
        .tl-table-wrap { overflow-x:auto; }
        .tl-table { width:100%; border-collapse:collapse; font-size:12px; }
        .tl-table th { text-align:left; padding:8px 12px; border-bottom:1px solid var(--color-border); color:var(--color-text-muted); font-family:var(--font-mono); font-size:9px; letter-spacing:1.5px; text-transform:uppercase; font-weight:normal; }
        .tl-table td { padding:12px; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; }
        .tl-table tr:hover td { background:rgba(255,255,255,0.02); }
      `}</style>
    </div>
  );
}
