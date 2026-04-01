"use client";

import { useEffect, useState } from "react";
import { Skel } from "@/components/ui/Skeleton";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  stack_tags: string[];
  demo_url: string | null;
  github_url: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  case_study: string | null;
}

const EMPTY_FORM = {
  title: "", description: "", category: "", status: "coming_soon",
  stack_tags: "", demo_url: "", github_url: "", thumbnail_url: "",
  is_featured: false, is_published: false, sort_order: 0, case_study: "",
};

function ProjectsSkeleton() {
  return (
    <div className="projects">
      <div className="projects__header">
        <div className="skel-group" style={{ gap: 8 }}>
          <Skel.Title width="quarter" />
          <Skel.Text width="third" size="sm" />
        </div>
        <Skel.Box height={36} className="skel--w-quarter" />
      </div>

      <div className="projects__table-wrap">
        <table className="projects__table">
          <thead>
            <tr>
              {["Title", "Category", "Status", "Featured", "Published", "Actions"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((i) => (
              <tr key={i}>
                <td><Skel.Text width="3-4" /></td>
                <td><Skel.Text width="half" /></td>
                <td><Skel.Box height={20} className="skel--pill skel--w-half" /></td>
                <td><Skel.Text width="quarter" /></td>
                <td><Skel.Text width="quarter" /></td>
                <td>
                  <div className="row-actions">
                    <Skel.Box height={28} className="skel--w-full" style={{ width: 48 }} />
                    <Skel.Box height={28} className="skel--w-full" style={{ width: 56 }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  async function fetchProjects() {
    try {
      const res  = await fetch("/api/projects/all", { credentials: "include" });
      const data = await res.json();
      setProjects(data);
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProjects(); }, []);

  function openCreate() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }

  function openEdit(p: Project) {
    setForm({
      title: p.title, description: p.description, category: p.category,
      status: p.status, stack_tags: p.stack_tags.join(", "),
      demo_url: p.demo_url ?? "", github_url: p.github_url ?? "",
      thumbnail_url: p.thumbnail_url ?? "", is_featured: p.is_featured,
      is_published: p.is_published, sort_order: p.sort_order,
      case_study: p.case_study ?? "",
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        stack_tags: form.stack_tags.split(",").map((t) => t.trim()).filter(Boolean),
        demo_url:      form.demo_url || null,
        github_url:    form.github_url || null,
        thumbnail_url: form.thumbnail_url || null,
        case_study:    form.case_study || null,
      };
      const url    = editingId ? `/api/projects/${editingId}` : "/api/projects";
      const method = editingId ? "PUT" : "POST";
      const res    = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      await fetchProjects();
      setShowForm(false);
    } catch {
      setError("Failed to save project");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE", credentials: "include" });
      await fetchProjects();
    } catch {
      setError("Failed to delete project");
    }
  }

  if (loading) return <ProjectsSkeleton />;

  return (
    <div className="projects">
      <div className="projects__header">
        <div>
          <h1>Projects</h1>
          <p>{projects.length} total</p>
        </div>
        <button className="admin-btn-primary" onClick={openCreate}>
          <span>+ Add Project</span>
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="projects__form-wrap">
          <div className="projects__form">
            <h2>{editingId ? "Edit Project" : "New Project"}</h2>
            <div className="form-grid">
              <div className="field">
                <label>Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project title" />
              </div>
              <div className="field">
                <label>Category *</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. fullstack, frontend" />
              </div>
              <div className="field field--full">
                <label>Description *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short project description" rows={3} />
              </div>
              <div className="field field--full">
                <label>Case Study</label>
                <textarea value={form.case_study} onChange={(e) => setForm({ ...form, case_study: e.target.value })} placeholder="Detailed case study (optional)" rows={4} />
              </div>
              <div className="field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="field">
                <label>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="field field--full">
                <label>Stack Tags (comma separated)</label>
                <input value={form.stack_tags} onChange={(e) => setForm({ ...form, stack_tags: e.target.value })} placeholder="React, FastAPI, PostgreSQL" />
              </div>
              <div className="field">
                <label>Demo URL</label>
                <input value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="field">
                <label>GitHub URL</label>
                <input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/..." />
              </div>
              <div className="field field--full">
                <label>Thumbnail URL</label>
                <input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://... or /uploads/..." />
              </div>
              <div className="field field--checks">
                <label className="checkbox">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                  Featured
                </label>
                <label className="checkbox">
                  <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                  Published
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
                <span>{saving ? "Saving..." : editingId ? "Update" : "Create"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty">
          <p>No projects yet.</p>
          <button className="admin-btn-primary" onClick={openCreate}><span>Add your first project</span></button>
        </div>
      ) : (
        <div className="projects__table-wrap">
          <table className="projects__table">
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Status</th>
                <th>Featured</th><th>Published</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.category}</td>
                  <td><span className={`badge badge--${p.status}`}>{p.status.replace("_", " ")}</span></td>
                  <td>{p.is_featured ? "✓" : "—"}</td>
                  <td>{p.is_published ? "✓" : "—"}</td>
                  <td>
                    <div className="row-actions">
                      <button className="admin-btn-ghost" onClick={() => openEdit(p)}>Edit</button>
                      <button className="admin-btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .projects__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; }
        .projects__header h1 { font-family: var(--font-display); font-size: 2rem; margin: 0; }
        .projects__header p { color: var(--color-text-muted); margin: 0.25rem 0 0; font-size: 0.875rem; }
        .error-banner { background: rgba(255,80,80,0.1); border: 1px solid rgba(255,80,80,0.3); color: #ff5050; padding: 0.75rem 1rem; border-radius: 0; margin-bottom: 1rem; }
        .projects__form-wrap { margin-bottom: 2rem; }
        .projects__form { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 0; padding: 1.5rem; }
        .projects__form h2 { font-family: var(--font-display); font-size: 1.25rem; margin: 0 0 1.5rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
        .field { display: flex; flex-direction: column; gap: 0.4rem; }
        .field--full { grid-column: 1 / -1; }
        .field--checks { display: flex; flex-direction: row; align-items: center; gap: 1.5rem; grid-column: 1 / -1; }
        .field label { font-size: 0.8rem; color: var(--color-text-muted); font-family: var(--font-mono); }
        .field input, .field textarea, .field select { background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 0; padding: 0.625rem 0.75rem; color: var(--color-text); font-size: 0.9rem; outline: none; font-family: var(--font-body); transition: border-color 0.2s; }
        .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--color-accent); }
        .checkbox { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--color-text); cursor: pointer; }
        .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
        .empty { text-align: center; padding: 3rem; color: var(--color-text-muted); }
        .projects__table-wrap { overflow-x: auto; }
        .projects__table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .projects__table th { text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); font-family: var(--font-mono); font-size: 0.8rem; font-weight: 500; }
        .projects__table td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--color-border); color: var(--color-text); }
        .projects__table tr:hover td { background: var(--color-surface); }
        .row-actions { display: flex; gap: 0.25rem; }
        .badge { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 999px; font-family: var(--font-mono); }
        .badge--completed   { background: rgba(0,255,128,0.1); color: #00ff80; }
        .badge--in_progress { background: rgba(255,200,0,0.1); color: #ffc800; }
        .badge--coming_soon { background: rgba(120,120,120,0.1); color: #aaa; }
        .badge--archived    { background: rgba(255,80,80,0.1);  color: #ff5050; }
      `}</style>
    </div>
  );
}
