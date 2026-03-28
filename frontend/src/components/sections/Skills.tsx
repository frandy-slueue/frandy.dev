"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "Languages",
  "Frontend",
  "Backend",
  "Databases",
  "DevOps & Tools",
];

const SKILLS: Record<string, { name: string; note?: string }[]> = {
  Languages: [
    { name: "Python" },
    { name: "JavaScript" },
    { name: "C" },
  ],
  Frontend: [
    { name: "React" },
    { name: "Next.js" },
    { name: "HTML" },
    { name: "CSS" },
    { name: "Tailwind CSS" },
  ],
  Backend: [
    { name: "Django" },
    { name: "FastAPI" },
    { name: "GraphQL" },
    { name: "RESTful APIs" },
  ],
  Databases: [
    { name: "PostgreSQL" },
    { name: "MongoDB" },
    { name: "Redis" },
    { name: "SQLAlchemy" },
  ],
  "DevOps & Tools": [
    { name: "Docker" },
    { name: "Git" },
  ],
};

// Placeholder project associations — will be replaced with real CMS data
const SKILL_PROJECTS: Record<string, { title: string; description: string }[]> = {
  Python: [
    { title: "frandy.dev API", description: "FastAPI backend powering this portfolio" },
  ],
  FastAPI: [
    { title: "frandy.dev API", description: "Async REST API with PostgreSQL and Docker" },
  ],
  "Next.js": [
    { title: "frandy.dev", description: "This portfolio — Next.js 16+ with App Router" },
  ],
  PostgreSQL: [
    { title: "frandy.dev API", description: "Primary database for projects, contacts, cache" },
  ],
  Docker: [
    { title: "frandy.dev", description: "Five-service Docker Compose orchestration" },
  ],
};

function SkillCard({
  skill,
  active,
  onClick,
}: {
  skill: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "90px",
        height: "90px",
        border: active
          ? "1px solid var(--accent)"
          : "1px solid var(--border)",
        backgroundColor: active
          ? "var(--bg-elevated)"
          : "var(--bg-secondary)",
        cursor: "pointer",
        transition: "border-color 250ms ease, background-color 250ms ease, box-shadow 250ms ease",
        boxShadow: active ? "0 0 16px var(--accent-glow)" : "none",
        padding: "8px",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-muted)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 10px var(--accent-glow)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          backgroundColor: "var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: active ? "var(--accent)" : "var(--text-muted)",
            transition: "color 250ms ease",
          }}
        >
          {skill.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: active ? "var(--accent)" : "var(--text-muted)",
          textAlign: "center",
          lineHeight: 1.2,
          transition: "color 250ms ease",
        }}
      >
        {skill}
      </span>
    </button>
  );
}

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState("Languages");
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const idx = CATEGORIES.indexOf(activeCategory);
    const el = tabRefs.current[idx];
    const bar = tabBarRef.current;
    if (!el || !bar) return;
    const barRect = bar.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setPillStyle({ left: elRect.left - barRect.left, width: elRect.width });
  }, [activeCategory]);

  const currentSkills = SKILLS[activeCategory] ?? [];
  const activeProjects = activeSkill ? (SKILL_PROJECTS[activeSkill] ?? []) : [];

  return (
    <section
      id="skills"
      className="section-pad"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="site-container">

        {/* Section label */}
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
          02 — Skills
        </motion.p>

        {/* Tab bar */}
        <div
          style={{
            position: "relative",
            marginBottom: "40px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          <div
            ref={tabBarRef}
            style={{
              position: "relative",
              display: "inline-flex",
              gap: "0",
              border: "1px solid var(--border)",
              padding: "4px",
              whiteSpace: "nowrap",
            }}
          >
            {/* Sliding pill */}
            <div
              style={{
                position: "absolute",
                top: "4px",
                bottom: "4px",
                left: pillStyle.left,
                width: pillStyle.width,
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--accent-muted)",
                transition:
                  "left 500ms cubic-bezier(0.22,1,0.36,1), width 500ms cubic-bezier(0.22,1,0.36,1)",
                pointerEvents: "none",
              }}
            />

            {CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                ref={(el) => { tabRefs.current[i] = el; }}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveSkill(null);
                }}
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
                  color:
                    activeCategory === cat
                      ? "var(--accent)"
                      : "var(--text-muted)",
                  transition: "color 300ms ease",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Icon grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="skills-grid"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          {currentSkills.map((skill) => (
            <SkillCard
              key={skill.name}
              skill={skill.name}
              active={activeSkill === skill.name}
              onClick={() =>
                setActiveSkill(
                  activeSkill === skill.name ? null : skill.name
                )
              }
            />
          ))}
        </motion.div>

        {/* Preview panel */}
        <AnimatePresence>
          {activeSkill && (
            <motion.div
              key={activeSkill}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg-elevated)",
                  padding: "24px",
                  marginBottom: "8px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "var(--accent-muted)",
                    marginBottom: "16px",
                  }}
                >
                  Projects using {activeSkill}
                </p>

                {activeProjects.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    {activeProjects.map((project) => (
                      <div
                        key={project.title}
                        style={{
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--bg-secondary)",
                          padding: "16px 20px",
                          minWidth: "200px",
                          flex: "1",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "20px",
                            color: "var(--text-primary)",
                            marginBottom: "6px",
                            letterSpacing: "1px",
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
                            marginBottom: "12px",
                          }}
                        >
                          {project.description}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          <button className="btn-ghost"
                            style={{ padding: "6px 14px", fontSize: "11px" }}
                          >
                            Demo
                          </button>
                          <button className="btn-ghost"
                            style={{ padding: "6px 14px", fontSize: "11px" }}
                          >
                            GitHub
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                    }}
                  >
                    Used as a supporting tool in infrastructure work.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
