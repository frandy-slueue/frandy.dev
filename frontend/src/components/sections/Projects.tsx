"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, Loader2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { projectsApi, Project } from "@/lib/api";

const FILTERS = ["All", "Frontend", "Backend", "Fullstack", "Python", "JavaScript"];

const SHAPES = [
  { cols: 2, rows: 2 },
  { cols: 1, rows: 2 },
  { cols: 2, rows: 1 },
  { cols: 1, rows: 1 },
  { cols: 1, rows: 3 },
  { cols: 3, rows: 1 },
];

function getShapeLayout(count: number) {
  const layouts: { cols: number; rows: number }[] = [];
  let remaining = count;
  const pool = [...SHAPES];

  while (remaining > 0) {
    const shape = pool[Math.floor(Math.random() * Math.min(4, pool.length))];
    layouts.push(shape);
    remaining--;
  }
  return layouts;
}

function ProjectCell({
  project,
  shape,
  onClick,
  apiBase,
}: {
  project: Project;
  shape: { cols: number; rows: number };
  onClick: () => void;
  apiBase: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: `span ${shape.cols}`,
        gridRow: `span ${shape.rows}`,
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        border: "1px solid var(--border)",
        minHeight: "160px",
        backgroundColor: "var(--bg-elevated)",
        transition: "border-color 300ms ease, box-shadow 300ms ease",
        boxShadow: hovered ? "0 0 24px var(--accent-glow)" : "none",
        borderColor: hovered ? "var(--accent-muted)" : "var(--border)",
      }}
    >
      {/* Thumbnail */}
      {project.thumbnail_url && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${apiBase}${project.thumbnail_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: hovered ? 0.15 : 0.35,
            transition: "opacity 300ms ease",
          }}
        />
      )}

      {/* Resting state */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          opacity: hovered ? 0 : 1,
          transition: "opacity 200ms ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--border)",
            letterSpacing: "1px",
          }}
        >
          {String(project.sort_order + 1).padStart(2, "0")}
        </span>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(18px, 2.5vw, 28px)",
            color: "var(--text-primary)",
            letterSpacing: "1px",
            lineHeight: 1,
          }}
        >
          {project.title}
        </p>
      </div>

      {/* Hover overlay */}
      <motion.div
        initial={false}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(8,8,8,0.92)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "10px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--accent)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {project.category}
          </span>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(16px, 2vw, 24px)",
              color: "var(--text-primary)",
              letterSpacing: "1px",
              marginBottom: "8px",
              lineHeight: 1,
            }}
          >
            {project.title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.description}
          </p>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            {project.stack_tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "1px",
                  color: "var(--accent-muted)",
                  border: "1px solid var(--border)",
                  padding: "2px 6px",
                  textTransform: "uppercase",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn-ghost"
                style={{ padding: "6px 12px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <ExternalLink size={12} /> Demo
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn-ghost"
                style={{ padding: "6px 12px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <FaGithub size={12} /> GitHub
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProjectDetail({
  project,
  onClose,
  apiBase,
}: {
  project: Project;
  onClose: () => void;
  apiBase: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: "52px",
        right: 0,
        bottom: 0,
        width: "min(480px, 100vw)",
        backgroundColor: "var(--bg-elevated)",
        borderLeft: "1px solid var(--border)",
        zIndex: 40,
        overflowY: "auto",
        padding: "32px 28px",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "none",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
          cursor: "pointer",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={16} />
      </button>

      {project.thumbnail_url && (
        <div
          style={{
            height: "200px",
            backgroundImage: `url(${apiBase}${project.thumbnail_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            marginBottom: "24px",
            border: "1px solid var(--border)",
          }}
        />
      )}

      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "10px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "var(--accent)",
          display: "block",
          marginBottom: "8px",
        }}
      >
        {project.category} · {project.status.replace("_", " ")}
      </span>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 4vw, 40px)",
          color: "var(--text-primary)",
          letterSpacing: "2px",
          marginBottom: "16px",
          lineHeight: 1,
        }}
      >
        {project.title}
      </h3>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "15px",
          color: "var(--text-muted)",
          lineHeight: 1.8,
          marginBottom: "24px",
        }}
      >
        {project.description}
      </p>

      {project.case_study && (
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "var(--accent-muted)",
              marginBottom: "12px",
            }}
          >
            Case Study
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-muted)",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
            }}
          >
            {project.case_study}
          </p>
        </div>
      )}

      <div style={{ marginBottom: "24px" }}>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "var(--accent-muted)",
            marginBottom: "12px",
          }}
        >
          Tech Stack
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {project.stack_tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                letterSpacing: "1px",
                color: "var(--accent-muted)",
                border: "1px solid var(--border)",
                padding: "4px 10px",
                textTransform: "uppercase",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {project.demo_url && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <ExternalLink size={14} /> Live Demo
            </span>
          </a>
        )}
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FaGithub size={14} /> GitHub
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [shapes, setShapes] = useState<{ cols: number; rows: number }[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [filterPill, setFilterPill] = useState({ left: 0, width: 0 });
  const filterRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const morphTimer = useRef<NodeJS.Timeout | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  useEffect(() => {
    projectsApi
      .getPublished()
      .then((data) => {
        setProjects(data);
        setShapes(getShapeLayout(data.length));
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  // Morph shapes every 5-8 seconds
  useEffect(() => {
    const schedule = () => {
      const delay = 5000 + Math.random() * 3000;
      morphTimer.current = setTimeout(() => {
        setShapes(getShapeLayout(projects.length));
        schedule();
      }, delay);
    };
    if (projects.length > 0) schedule();
    return () => { if (morphTimer.current) clearTimeout(morphTimer.current); };
  }, [projects.length]);

  // Filter pill position
  useEffect(() => {
    const idx = FILTERS.indexOf(filter);
    const el = filterRefs.current[idx];
    const bar = filterBarRef.current;
    if (!el || !bar) return;
    const barRect = bar.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setFilterPill({ left: elRect.left - barRect.left, width: elRect.width });
  }, [filter]);

  const filtered = filter === "All"
    ? projects
    : projects.filter((p) =>
        p.category.toLowerCase() === filter.toLowerCase() ||
        p.stack_tags.some((t) => t.toLowerCase() === filter.toLowerCase())
      );

  return (
    <section
      id="projects"
      className="section-pad"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="site-container">

        <motion.p
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "var(--accent-muted)",
            marginBottom: "48px",
          }}
        >
          03 — Projects
        </motion.p>

        {/* Filter bar */}
        <div style={{ position: "relative", marginBottom: "40px", overflowX: "auto", paddingBottom: "4px" }}>
          <div
            ref={filterBarRef}
            style={{
              position: "relative",
              display: "inline-flex",
              border: "1px solid var(--border)",
              padding: "4px",
              whiteSpace: "nowrap",
              borderRadius: "0",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "4px",
                bottom: "4px",
                left: filterPill.left,
                width: filterPill.width,
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--accent-muted)",
                borderRadius: "0",
                transition: "left 500ms cubic-bezier(0.22,1,0.36,1), width 500ms cubic-bezier(0.22,1,0.36,1)",
                pointerEvents: "none",
              }}
            />
            {FILTERS.map((f, i) => (
              <button
                key={f}
                ref={(el) => { filterRefs.current[i] = el; }}
                onClick={() => setFilter(f)}
                style={{
                  position: "relative",
                  zIndex: 1,
                  padding: "10px 20px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: filter === f ? "var(--accent)" : "var(--text-muted)",
                  transition: "color 300ms ease",
                  whiteSpace: "nowrap",
                  borderRadius: "0",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Mosaic grid */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-muted)", padding: "80px 0" }}>
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase" }}>
              Loading projects...
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-muted)", padding: "80px 0", letterSpacing: "2px", textTransform: "uppercase" }}>
            No projects in this category yet.
          </p>
        ) : (
          <motion.div
            layout
            className="mosaic-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridAutoRows: "200px",
              gap: "8px",
            }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <ProjectCell
                  key={project.id}
                  project={project}
                  shape={shapes[i] ?? { cols: 1, rows: 1 }}
                  onClick={() => setSelected(project)}
                  apiBase={apiBase}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Project detail panel */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                zIndex: 39,
              }}
            />
            <ProjectDetail
              project={selected}
              onClose={() => setSelected(null)}
              apiBase={apiBase}
            />
          </>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .mosaic-grid { grid-template-columns: 1fr !important; grid-auto-rows: 180px !important; }
        }
        @media (max-width: 1024px) and (min-width: 769px) {
          .mosaic-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}