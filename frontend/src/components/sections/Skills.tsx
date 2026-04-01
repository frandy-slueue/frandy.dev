"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCode, FaPalette, FaServer, FaDatabase, FaTools } from "react-icons/fa";
import SectionLabel from "@/components/ui/SectionLabel";
import TabBar, { TabItem } from "@/components/ui/TabBar";
import { BtnSecondary } from "@/components/ui/Button";
import { VIEWPORT } from "@/lib/animations";

const TABS: TabItem[] = [
  { label: "Languages",      icon: <FaCode size={14} /> },
  { label: "Frontend",       icon: <FaPalette size={14} /> },
  { label: "Backend",        icon: <FaServer size={14} /> },
  { label: "Databases",      icon: <FaDatabase size={14} /> },
  { label: "DevOps & Tools", icon: <FaTools size={14} /> },
];

const SKILLS: Record<string, { name: string }[]> = {
  Languages:        [{ name: "Python" }, { name: "JavaScript" }, { name: "C" }],
  Frontend:         [{ name: "React" }, { name: "Next.js" }, { name: "HTML" }, { name: "CSS" }, { name: "Tailwind CSS" }],
  Backend:          [{ name: "Django" }, { name: "FastAPI" }, { name: "GraphQL" }, { name: "RESTful APIs" }],
  Databases:        [{ name: "PostgreSQL" }, { name: "MongoDB" }, { name: "Redis" }, { name: "SQLAlchemy" }],
  "DevOps & Tools": [{ name: "Docker" }, { name: "Git" }],
};

const SKILL_PROJECTS: Record<string, { title: string; description: string }[]> = {
  Python:     [{ title: "frandy.dev API",  description: "FastAPI backend powering this portfolio" }],
  FastAPI:    [{ title: "frandy.dev API",  description: "Async REST API with PostgreSQL and Docker" }],
  "Next.js":  [{ title: "frandy.dev",      description: "This portfolio — Next.js 16+ with App Router" }],
  PostgreSQL: [{ title: "frandy.dev API",  description: "Primary database for projects, contacts, cache" }],
  Docker:     [{ title: "frandy.dev",      description: "Five-service Docker Compose orchestration" }],
};

// ── Skill card — double frame ─────────────────────────────────────────
function SkillCard({ skill, active, onClick }: { skill: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`skill-card dframe ${active ? "active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <div className="skill-card__badge">
        <span className="skill-card__abbr">{skill.slice(0, 2).toUpperCase()}</span>
      </div>
      <span className="skill-card__name">{skill}</span>
    </button>
  );
}

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState("Languages");
  const [activeSkill, setActiveSkill]       = useState<string | null>(null);

  const currentSkills  = SKILLS[activeCategory] ?? [];
  const activeProjects = activeSkill ? (SKILL_PROJECTS[activeSkill] ?? []) : [];

  function handleCategoryChange(label: string) {
    setActiveCategory(label);
    setActiveSkill(null);
  }

  return (
    <section id="skills" className="section-pad" aria-labelledby="skills-heading" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="site-container">
        <SectionLabel>02 — Skills</SectionLabel>
        <h2 id="skills-heading" className="sr-only">Skills</h2>

        <TabBar tabs={TABS} active={activeCategory} onChange={handleCategoryChange} />

        <motion.div key={activeCategory} className="skill-grid" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {currentSkills.map((skill) => (
            <SkillCard
              key={skill.name}
              skill={skill.name}
              active={activeSkill === skill.name}
              onClick={() => setActiveSkill(activeSkill === skill.name ? null : skill.name)}
            />
          ))}
        </motion.div>

        <AnimatePresence>
          {activeSkill && (
            <motion.div key={activeSkill} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
              <div className="skill-preview dframe">
                <p className="skill-preview__label">Projects using {activeSkill}</p>
                {activeProjects.length > 0 ? (
                  <div className="skill-project-list">
                    {activeProjects.map((project) => (
                      <div key={project.title} className="skill-project dframe">
                        <p className="skill-project__title">{project.title}</p>
                        <p className="skill-project__desc">{project.description}</p>
                        <div className="skill-project__actions">
                          <BtnSecondary>Demo</BtnSecondary>
                          <BtnSecondary>GitHub</BtnSecondary>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="skill-preview__empty">Used as a supporting tool in infrastructure work.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}`}</style>
    </section>
  );
}
