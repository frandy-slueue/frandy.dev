"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Briefcase, Award, Star, Clock } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import TabBar, { TabItem } from "@/components/ui/TabBar";

// ── Data ─────────────────────────────────────────────────────────────
const FILTER_TABS: TabItem[] = [
  "All", "Education", "Work", "Milestone", "Certifications",
].map((label) => ({ label }));

type NodeCategory = "Education" | "Work" | "Milestone" | "Certifications" | "Background";

interface TimelineNode {
  id: string;
  period: string;
  title: string;
  category: NodeCategory;
  description: string;
}

const NODES: TimelineNode[] = [
  { id: "foundation",  period: "Before", title: "The Foundation",        category: "Background",     description: "Life before code. A persistent drive to understand how things work and an instinct to build. That mindset was already there — software gave it a direction." },
  { id: "atlas",       period: "2023",   title: "Atlas School of Tulsa", category: "Education",      description: "Enrolled in an intensive, project-based software engineering program. No lectures — just building, breaking, and figuring it out. The hardest and most formative experience of my engineering life." },
  { id: "first-deploy",period: "2023",   title: "First Deployed Project", category: "Milestone",     description: "First working application shipped to the web. Seeing something I built live on a real URL changed how I thought about what was possible." },
  { id: "advanced",    period: "2024",   title: "Advanced Curriculum",   category: "Education",      description: "React, Next.js, Python, Django, FastAPI, PostgreSQL, Docker. The stack expanded fast. Started understanding not just how to use tools but why certain tools exist." },
  { id: "freelance",   period: "2024",   title: "First Freelance Project",category: "Work",          description: "First client project delivered. Real deadline, real feedback, real money. A completely different pressure than school projects — in a good way." },
  { id: "devops",      period: "2024",   title: "DevOps & Docker",       category: "Certifications", description: "Containerisation and deployment workflows. Docker Compose went from intimidating to natural. Started thinking about infrastructure as part of the product." },
  { id: "portfolio",   period: "2025",   title: "Portfolio Launch",      category: "Milestone",      description: "frandy.dev — this portfolio. FastAPI backend, Next.js frontend, five Docker services, four animated themes, a CodeBreeder identity baked into the work layer." },
  { id: "first-role",  period: "2025",   title: "Seeking First Role",    category: "Work",           description: "Open to full-stack engineering roles and freelance projects. If you are reading this and you have something worth building — I want to hear about it." },
];

const FUTURE_NODES = [
  "First Full-Time Role", "Open Source Contribution",
  "CodeBreeder Launch", "Team Lead",
  "Building Something Big", "What Comes Next",
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Education:      <GraduationCap size={14} />,
  Work:           <Briefcase size={14} />,
  Milestone:      <Star size={14} />,
  Certifications: <Award size={14} />,
  Background:     <Clock size={14} />,
};

// Category colors are data-driven — kept as inline style
const CATEGORY_COLORS: Record<string, string> = {
  Education:      "var(--accent)",
  Work:           "#4a9eff",
  Milestone:      "#d4842a",
  Certifications: "#3d9970",
  Background:     "var(--accent-muted)",
};

// ── Main section ─────────────────────────────────────────────────────
export default function Timeline() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [pulseProgress, setPulseProgress] = useState(0);

  // EKG pulse animation
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 3000;
    const animate = (ts: number) => {
      if (!start) start = ts;
      setPulseProgress(((ts - start) % duration) / duration);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const filtered = activeFilter === "All"
    ? NODES
    : NODES.filter((n) => n.category === activeFilter);

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <section
      id="timeline"
      className="section-pad"
      aria-labelledby="timeline-heading"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="site-container">
        <SectionLabel>04 — Timeline</SectionLabel>
        <h2 id="timeline-heading" className="sr-only">Timeline</h2>

        <TabBar
          tabs={FILTER_TABS}
          active={activeFilter}
          onChange={(label) => {
            setActiveFilter(label);
            setExpanded(null);
          }}
        />

        {/* ── Desktop — horizontal ─────────────────────────── */}
        <div className="timeline-desktop">
          {/* EKG spine */}
          <div className="timeline-spine-wrap" aria-hidden>
            <svg width="100%" height="40" style={{ overflow: "visible" }}>
              <line x1="0" y1="20" x2="100%" y2="20" stroke="var(--border)" strokeWidth="1" />
              <polyline
                points="0,20 5%,20 8%,20 9%,5 10%,35 11%,10 12%,20 25%,20 28%,20 29%,5 30%,35 31%,10 32%,20 50%,20 53%,20 54%,5 55%,35 56%,10 57%,20 75%,20 78%,20 79%,5 80%,35 81%,10 82%,20 100%,20"
                fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.3"
              />
              {/* Traveling pulse — cx is truly dynamic (animation progress) */}
              <circle cx={`${pulseProgress * 100}%`} cy="20" r="3" fill="var(--accent)" opacity="0.8" />
              <circle cx={`${pulseProgress * 100}%`} cy="20" r="6" fill="var(--accent)" opacity="0.15" />
            </svg>
          </div>

          <div className="timeline-nodes">
            <AnimatePresence mode="popLayout">
              {filtered.map((node, i) => (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="timeline-node"
                  onClick={() => toggle(node.id)}
                >
                  {/* Dot — bg/shadow color is data-driven */}
                  <div
                    className={`timeline-node__dot ${expanded === node.id ? "is-expanded" : ""}`}
                    style={{
                      backgroundColor: CATEGORY_COLORS[node.category],
                      boxShadow: `0 0 8px ${CATEGORY_COLORS[node.category]}`,
                    }}
                  />

                  <p className="timeline-node__period">{node.period}</p>

                  {/* Badge — color is data-driven */}
                  <div
                    className="timeline-node__badge"
                    style={{ color: CATEGORY_COLORS[node.category] }}
                  >
                    <span aria-hidden>{CATEGORY_ICONS[node.category]}</span>
                    <span className="timeline-node__badge-text">{node.category}</span>
                  </div>

                  <p className="timeline-node__title">{node.title}</p>
                  <span className="timeline-node__toggle">
                    {expanded === node.id ? "— collapse" : "+ expand"}
                  </span>

                  <AnimatePresence>
                    {expanded === node.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <p className="timeline-node__desc">{node.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Future ghost nodes — opacity is computed (data-driven) */}
            {activeFilter === "All" && FUTURE_NODES.map((label, i) => (
              <div
                key={`future-${i}`}
                className="timeline-future"
                style={{ opacity: 0.3 - i * 0.04 }}
              >
                <div className="timeline-future__dot" />
                <p className="timeline-future__period">Future</p>
                <p className="timeline-future__title">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile — vertical ────────────────────────────── */}
        <div className="timeline-mobile">
          <div className="timeline-mobile-list">
            <div className="timeline-mobile-spine" aria-hidden />

            <AnimatePresence mode="popLayout">
              {filtered.map((node, i) => (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="timeline-node-mobile"
                  onClick={() => toggle(node.id)}
                >
                  <div
                    className={`timeline-node-mobile__dot ${expanded === node.id ? "is-expanded" : ""}`}
                    style={{
                      backgroundColor: CATEGORY_COLORS[node.category],
                      boxShadow: `0 0 8px ${CATEGORY_COLORS[node.category]}`,
                    }}
                  />
                  <p className="timeline-node-mobile__period">{node.period}</p>

                  <div
                    className="timeline-node-mobile__badge"
                    style={{ color: CATEGORY_COLORS[node.category] }}
                  >
                    <span aria-hidden>{CATEGORY_ICONS[node.category]}</span>
                    <span className="timeline-node__badge-text">{node.category}</span>
                  </div>

                  <p className="timeline-node-mobile__title">{node.title}</p>
                  <span className="timeline-node-mobile__toggle">
                    {expanded === node.id ? "— collapse" : "+ expand"}
                  </span>

                  <AnimatePresence>
                    {expanded === node.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <p className="timeline-node-mobile__desc">{node.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {activeFilter === "All" && FUTURE_NODES.slice(0, 3).map((label, i) => (
              <div
                key={`future-m-${i}`}
                className="timeline-future-mobile"
                style={{ opacity: 0.25 - i * 0.06 }}
              >
                <div className="timeline-future-mobile__dot" />
                <p className="timeline-future-mobile__period">Future</p>
                <p className="timeline-future-mobile__title">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .sr-only {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
      `}</style>
    </section>
  );
}
