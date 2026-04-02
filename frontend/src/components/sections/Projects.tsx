"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, Loader2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { projectsApi, Project } from "@/lib/api";
import SectionLabel from "@/components/ui/SectionLabel";
import TabBar, { TabItem } from "@/components/ui/TabBar";
import { BtnPrimary, BtnSecondary } from "@/components/ui/Button";
import { scaleIn } from "@/lib/animations";

const FILTER_TABS: TabItem[] = ["All","Frontend","Backend","Fullstack","Python","JavaScript"].map((label) => ({ label }));

const SHAPES = [
  { cols: 2, rows: 2 }, { cols: 1, rows: 2 }, { cols: 2, rows: 1 },
  { cols: 1, rows: 1 }, { cols: 1, rows: 3 }, { cols: 3, rows: 1 },
];

function getShapeLayout(count: number) {
  return Array.from({ length: count }, () => SHAPES[Math.floor(Math.random() * Math.min(4, SHAPES.length))]);
}

function ProjectCell({ project, shape, onClick, apiBase }: { project: Project; shape: { cols: number; rows: number }; onClick: () => void; apiBase: string }) {
  return (
    <motion.article layout variants={scaleIn} initial="hidden" animate="visible" exit="hidden" transition={{ duration: 0.4 }}
      className="project-cell dframe" onClick={onClick}
      style={{ gridColumn: `span ${shape.cols}`, gridRow: `span ${shape.rows}` }}>
      {project.thumbnail_url && (
        <div className="project-cell__thumb" style={{ backgroundImage: `url(${apiBase}${project.thumbnail_url})` }} aria-hidden />
      )}
      <div className="project-cell__resting">
        <span className="project-cell__num">{String(project.sort_order + 1).padStart(2, "0")}</span>
        <p className="project-cell__title">{project.title}</p>
      </div>
      <div className="project-cell__overlay">
        <div>
          <span className="project-cell__cat">{project.category}</span>
          <p className="project-cell__title-hover">{project.title}</p>
          <p className="project-cell__desc">{project.description}</p>
        </div>
        <div>
          <div className="project-cell__tags">
            {project.stack_tags.slice(0, 4).map((tag) => (
              <span key={tag} className="stack-tag">{tag}</span>
            ))}
          </div>
          <div className="project-cell__actions">
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="btn-secondary" style={{ padding: "6px 14px", fontSize: "11px" }}>
                <span className="btn-tl" aria-hidden /><span className="btn-br" aria-hidden /><span className="btn-inner" aria-hidden />
                <span className="btn-txt" style={{ display: "flex", alignItems: "center", gap: 4 }}><ExternalLink size={11} /> Demo</span>
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="btn-secondary" style={{ padding: "6px 14px", fontSize: "11px" }}>
                <span className="btn-tl" aria-hidden /><span className="btn-br" aria-hidden /><span className="btn-inner" aria-hidden />
                <span className="btn-txt" style={{ display: "flex", alignItems: "center", gap: 4 }}><FaGithub size={11} /> GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ProjectDetail({ project, onClose, apiBase }: { project: Project; onClose: () => void; apiBase: string }) {
  return (
    <motion.aside className="project-detail dframe" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.35 }} aria-label={`${project.title} details`}>
      <button className="project-detail__close" onClick={onClose} aria-label="Close"><X size={16} /></button>
      {project.thumbnail_url && <div className="project-detail__thumb" style={{ backgroundImage: `url(${apiBase}${project.thumbnail_url})` }} />}
      <span className="project-detail__meta">{project.category} · {project.status.replace("_", " ")}</span>
      <h3 className="project-detail__title">{project.title}</h3>
      <p className="project-detail__body">{project.description}</p>
      {project.case_study && (
        <div className="project-detail__section">
          <p className="project-detail__section-label">Case Study</p>
          <p className="project-detail__case-study">{project.case_study}</p>
        </div>
      )}
      <div className="project-detail__section">
        <p className="project-detail__section-label">Tech Stack</p>
        <div className="project-detail__tags">
          {project.stack_tags.map((tag) => <span key={tag} className="stack-tag stack-tag--lg">{tag}</span>)}
        </div>
      </div>
      <div className="project-detail__actions">
        {project.demo_url && <BtnPrimary href={project.demo_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Live Demo</BtnPrimary>}
        {project.github_url && <BtnSecondary href={project.github_url} target="_blank" rel="noopener noreferrer"><FaGithub size={14} /> GitHub</BtnSecondary>}
      </div>
    </motion.aside>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("All");
  const [shapes, setShapes]     = useState<{ cols: number; rows: number }[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const morphTimer = useRef<NodeJS.Timeout | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  useEffect(() => {
    projectsApi.getPublished().then((data) => { setProjects(data); setShapes(getShapeLayout(data.length)); }).catch(() => setProjects([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const schedule = () => { const delay = 5000 + Math.random() * 3000; morphTimer.current = setTimeout(() => { setShapes(getShapeLayout(projects.length)); schedule(); }, delay); };
    if (projects.length > 0) schedule();
    return () => { if (morphTimer.current) clearTimeout(morphTimer.current); };
  }, [projects.length]);

  const filtered = filter === "All" ? projects : projects.filter((p) => p.category.toLowerCase() === filter.toLowerCase() || p.stack_tags.some((t) => t.toLowerCase() === filter.toLowerCase()));

  return (
    <section id="projects" className="section-pad" aria-labelledby="projects-heading" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="site-container">
        <SectionLabel>03 — Projects</SectionLabel>
        <h2 id="projects-heading" className="sr-only">Projects</h2>
        <TabBar tabs={FILTER_TABS} active={filter} onChange={setFilter} />
        {loading ? (
          <div className="projects-state"><Loader2 size={20} className="spin" /> Loading projects...</div>
        ) : filtered.length === 0 ? (
          <p className="projects-state">No projects in this category yet.</p>
        ) : (
          <motion.div className="mosaic-grid" style={{ height:"416px", overflow:"hidden" }}>
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <ProjectCell key={project.id} project={project} shape={shapes[i] ?? { cols: 1, rows: 1 }} onClick={() => setSelected(project)} apiBase={apiBase} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div className="project-detail-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} />
            <ProjectDetail project={selected} onClose={() => setSelected(null)} apiBase={apiBase} />
          </>
        )}
      </AnimatePresence>
      <style>{`
        .project-detail-backdrop { position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:39; }
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
      `}</style>
    </section>
  );
}
