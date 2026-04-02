"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCode, FaPalette, FaServer, FaDatabase, FaTools,
} from "react-icons/fa";
import {
  SiPython, SiJavascript, SiReact, SiNextdotjs, SiHtml5, SiCss,
  SiTailwindcss, SiDjango, SiFastapi, SiGraphql, SiPostgresql,
  SiMongodb, SiRedis, SiDocker, SiGit,
} from "react-icons/si";
import SectionLabel from "@/components/ui/SectionLabel";
import TabBar, { TabItem } from "@/components/ui/TabBar";
import { BtnSecondary } from "@/components/ui/Button";
import { VIEWPORT } from "@/lib/animations";

const TABS: TabItem[] = [
  { label: "Languages",      icon: <FaCode size={13} /> },
  { label: "Frontend",       icon: <FaPalette size={13} /> },
  { label: "Backend",        icon: <FaServer size={13} /> },
  { label: "Databases",      icon: <FaDatabase size={13} /> },
  { label: "DevOps & Tools", icon: <FaTools size={13} /> },
];

// Brand icon + color per skill
const SKILL_META: Record<string, { icon: React.ReactNode; color: string }> = {
  "Python":       { icon: <SiPython size={28} />,      color: "#3776AB" },
  "JavaScript":   { icon: <SiJavascript size={28} />,  color: "#F7DF1E" },
  "C":            { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:22, fontWeight:700 }}>C</span>, color: "var(--accent)" },
  "React":        { icon: <SiReact size={28} />,        color: "#61DAFB" },
  "Next.js":      { icon: <SiNextdotjs size={28} />,    color: "#ffffff" },
  "HTML":         { icon: <SiHtml5 size={28} />,        color: "#E34F26" },
  "CSS":          { icon: <SiCss size={28} />,         color: "#1572B6" },
  "Tailwind CSS": { icon: <SiTailwindcss size={28} />,  color: "#06B6D4" },
  "Django":       { icon: <SiDjango size={28} />,       color: "#092E20" },
  "FastAPI":      { icon: <SiFastapi size={28} />,      color: "#009688" },
  "GraphQL":      { icon: <SiGraphql size={28} />,      color: "#E10098" },
  "RESTful APIs": { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:700 }}>REST</span>, color: "var(--accent)" },
  "PostgreSQL":   { icon: <SiPostgresql size={28} />,   color: "#4169E1" },
  "MongoDB":      { icon: <SiMongodb size={28} />,      color: "#47A248" },
  "Redis":        { icon: <SiRedis size={28} />,        color: "#DC382D" },
  "SQLAlchemy":   { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:11, fontWeight:700 }}>SA</span>, color: "var(--accent)" },
  "Docker":       { icon: <SiDocker size={28} />,       color: "#2496ED" },
  "Git":          { icon: <SiGit size={28} />,          color: "#F05032" },
};

const SKILLS: Record<string, string[]> = {
  "Languages":        ["Python", "JavaScript", "C"],
  "Frontend":         ["React", "Next.js", "HTML", "CSS", "Tailwind CSS"],
  "Backend":          ["Django", "FastAPI", "GraphQL", "RESTful APIs"],
  "Databases":        ["PostgreSQL", "MongoDB", "Redis", "SQLAlchemy"],
  "DevOps & Tools":   ["Docker", "Git"],
};

const SKILL_PROJECTS: Record<string, { title: string; description: string }[]> = {
  "Python":     [{ title: "frandy.dev API",  description: "FastAPI backend powering this portfolio" }],
  "FastAPI":    [{ title: "frandy.dev API",  description: "Async REST API with PostgreSQL and Docker" }],
  "Next.js":    [{ title: "frandy.dev",      description: "This portfolio — Next.js 16+ with App Router" }],
  "PostgreSQL": [{ title: "frandy.dev API",  description: "Primary database for projects, contacts, cache" }],
  "Docker":     [{ title: "frandy.dev",      description: "Five-service Docker Compose orchestration" }],
};

// Shapes — only zero-gap-compatible clip-paths
const CLIP_SHAPES = [
  "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",                               // diamond
  "inset(0% 0% 0% 0% round 4px)",                                               // square
  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",             // hexagon
  "inset(15% 0% 15% 0% round 3px)",                                             // tall rect
  "circle(50% at 50% 50%)",                                                     // circle
] as const;

const MORPH_INTERVAL_MS = 4000;

// ── Skill card ────────────────────────────────────────────────────────
function SkillCard({ skill, active, onClick, clipIndex }: {
  skill: string; active: boolean; onClick: () => void; clipIndex: number;
}) {
  const meta    = SKILL_META[skill] ?? { icon: null, color: "var(--accent)" };
  const clipPath = CLIP_SHAPES[clipIndex % CLIP_SHAPES.length];

  return (
    <button className={`skill-card dframe ${active ? "active" : ""}`} onClick={onClick} aria-pressed={active}>
      <div
        className="skill-card__badge"
        style={{
          color: meta.color,
          clipPath,
          transition: "clip-path 0.75s cubic-bezier(0.4,0,0.2,1)",
          willChange: "clip-path",
        }}
      >
        {meta.icon}
      </div>
      <span className="skill-card__name">{skill}</span>
    </button>
  );
}

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState("Languages");
  const [activeSkill, setActiveSkill]       = useState<string | null>(null);
  const [tick, setTick]                     = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => { tickRef.current += 1; setTick(tickRef.current); }, MORPH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const currentSkills  = SKILLS[activeCategory] ?? [];
  const activeProjects = activeSkill ? (SKILL_PROJECTS[activeSkill] ?? []) : [];

  function handleCategoryChange(label: string) { setActiveCategory(label); setActiveSkill(null); }

  return (
    <section id="skills" className="section-pad" aria-labelledby="skills-heading" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="site-container">
        <SectionLabel>02 — Skills</SectionLabel>
        <h2 id="skills-heading" className="sr-only">Skills</h2>

        <TabBar tabs={TABS} active={activeCategory} onChange={handleCategoryChange} />

        <motion.div key={activeCategory} className="skill-grid" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
          {currentSkills.map((skill, i) => (
            <SkillCard
              key={skill}
              skill={skill}
              active={activeSkill === skill}
              onClick={() => setActiveSkill(activeSkill === skill ? null : skill)}
              clipIndex={(tick + i) % CLIP_SHAPES.length}
            />
          ))}
        </motion.div>

        <AnimatePresence>
          {activeSkill && (
            <motion.div key={activeSkill} initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} transition={{ duration:0.35, ease:"easeInOut" }} style={{ overflow:"hidden" }}>
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
