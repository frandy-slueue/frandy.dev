"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCode, FaPalette, FaServer, FaDatabase, FaTools, FaShieldAlt,
} from "react-icons/fa";
import {
  SiPython, SiJavascript, SiTypescript, SiReact, SiNextdotjs, SiHtml5, SiCss,
  SiTailwindcss, SiDjango, SiFastapi, SiGraphql, SiPostgresql, SiExpo,
  SiMongodb, SiRedis, SiDocker, SiGit, SiGithubactions, SiLinux,
  SiFigma, SiNodedotjs,
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
  { label: "Security & IT",  icon: <FaShieldAlt size={13} /> },
];

// Brand icon + color per skill
const SKILL_META: Record<string, { icon: React.ReactNode; color: string }> = {
  // Languages
  "Python":           { icon: <SiPython size={28} />,        color: "#3776AB" },
  "JavaScript":       { icon: <SiJavascript size={28} />,    color: "#F7DF1E" },
  "TypeScript":       { icon: <SiTypescript size={28} />,    color: "#3178C6" },
  "C":                { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:22, fontWeight:700 }}>C</span>, color: "var(--accent)" },
  "Bash":             { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:16, fontWeight:700 }}>#!</span>, color: "#4EAA25" },

  // Frontend
  "React":            { icon: <SiReact size={28} />,          color: "#61DAFB" },
  "Next.js":          { icon: <SiNextdotjs size={28} />,      color: "#ffffff" },
  "React Native":     { icon: <SiReact size={28} />,          color: "#61DAFB" },
  "Expo":             { icon: <SiExpo size={28} />,           color: "#ffffff" },
  "HTML":             { icon: <SiHtml5 size={28} />,          color: "#E34F26" },
  "CSS":              { icon: <SiCss size={28} />,            color: "#1572B6" },
  "Tailwind CSS":     { icon: <SiTailwindcss size={28} />,    color: "#06B6D4" },
  "Figma":            { icon: <SiFigma size={28} />,          color: "#F24E1E" },

  // Backend
  "Node.js":          { icon: <SiNodedotjs size={28} />,      color: "#339933" },
  "Django":           { icon: <SiDjango size={28} />,         color: "#092E20" },
  "FastAPI":          { icon: <SiFastapi size={28} />,        color: "#009688" },
  "GraphQL":          { icon: <SiGraphql size={28} />,        color: "#E10098" },
  "RESTful APIs":     { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:700 }}>REST</span>, color: "var(--accent)" },

  // Databases
  "PostgreSQL":       { icon: <SiPostgresql size={28} />,     color: "#4169E1" },
  "MongoDB":          { icon: <SiMongodb size={28} />,        color: "#47A248" },
  "Redis":            { icon: <SiRedis size={28} />,          color: "#DC382D" },
  "SQLAlchemy":       { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:11, fontWeight:700 }}>SA</span>, color: "var(--accent)" },

  // DevOps & Tools
  "Docker":           { icon: <SiDocker size={28} />,         color: "#2496ED" },
  "Git":              { icon: <SiGit size={28} />,            color: "#F05032" },
  "GitHub Actions":   { icon: <SiGithubactions size={28} />,  color: "#2088FF" },
  "Linux":            { icon: <SiLinux size={28} />,          color: "#FCC624" },
  "ServiceNow":       { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:11, fontWeight:700 }}>SN</span>, color: "#62D84E" },
  "Microsoft Intune": { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:11, fontWeight:700 }}>IN</span>, color: "#0078D4" },

  // Security & IT
  "Vulnerability Analysis":   { icon: <FaShieldAlt size={24} />,  color: "#ef4444" },
  "VLAN Architecture":        { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:11, fontWeight:700 }}>VL</span>, color: "#8b5cf6" },
  "DHCP / DNS / TCP-IP":      { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700 }}>NET</span>, color: "#3b82f6" },
  "VPN Management":           { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:11, fontWeight:700 }}>VPN</span>, color: "#10b981" },
  "Active Directory":         { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:11, fontWeight:700 }}>AD</span>, color: "#0078D4" },
  "Cisco SecureCRT":          { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700 }}>CS</span>, color: "#1BA0D7" },
  "AIS Security Planning":    { icon: <FaShieldAlt size={24} />,  color: "#f59e0b" },
  "Compliance Auditing":      { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700 }}>COM</span>, color: "#6366f1" },
  "Cisco AnyConnect VPN":     { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:10, fontWeight:700 }}>AC</span>, color: "#1BA0D7" },
  "Two-Factor Auth":          { icon: <span style={{ fontFamily:"var(--font-mono)", fontSize:11, fontWeight:700 }}>2FA</span>, color: "#10b981" },
};

const SKILLS: Record<string, string[]> = {
  "Languages":      ["Python", "JavaScript", "TypeScript", "Bash", "C"],
  "Frontend":       ["React", "Next.js", "React Native", "Expo", "HTML", "CSS", "Tailwind CSS", "Figma"],
  "Backend":        ["Node.js", "Django", "FastAPI", "GraphQL", "RESTful APIs"],
  "Databases":      ["PostgreSQL", "MongoDB", "Redis", "SQLAlchemy"],
  "DevOps & Tools": ["Docker", "Git", "GitHub Actions", "Linux", "ServiceNow", "Microsoft Intune"],
  "Security & IT":  [
    "Vulnerability Analysis", "VLAN Architecture", "DHCP / DNS / TCP-IP",
    "VPN Management", "Active Directory", "Cisco SecureCRT",
    "AIS Security Planning", "Compliance Auditing", "Cisco AnyConnect VPN", "Two-Factor Auth",
  ],
};

const SKILL_PROJECTS: Record<string, { title: string; description: string }[]> = {
  // Languages
  "Python":         [
    { title: "frandy.dev API",       description: "FastAPI backend — async REST API with JWT auth, PostgreSQL, Docker, and admin dashboard" },
    { title: "HBS Events Studio",    description: "Django 5+ main backend and FastAPI AI microservice — Python throughout" },
  ],
  "JavaScript":     [
    { title: "frandy.dev",           description: "Next.js 16+ frontend — all client-side interactivity and animations" },
    { title: "HBS Events Studio",    description: "Next.js 15+ frontend with Apollo Client, Framer Motion, and Stripe.js" },
  ],
  "TypeScript":     [
    { title: "Lumigram",             description: "React Native / Expo photo-sharing app — strict TypeScript throughout" },
    { title: "HBS Events Studio",    description: "Next.js 15+ in strict TypeScript mode with Zod validation" },
    { title: "frandy.dev",           description: "Full Next.js frontend typed with TypeScript" },
  ],
  "Bash":           [
    { title: "frandy.dev",           description: "Deployment scripts, server automation, Docker management, and CI/CD pipeline tasks on DigitalOcean" },
  ],
  "C":              [],

  // Frontend
  "React":          [
    { title: "frandy.dev",           description: "Portfolio frontend — four animated themes, section snapping, Framer Motion" },
    { title: "File Renamer",         description: "Batch file renaming utility — React/Vite with live color-coded diff preview" },
    { title: "HBS Events Studio",    description: "Next.js 15+ / React — theme gallery, color studio, quote form, admin dashboard" },
  ],
  "Next.js":        [
    { title: "frandy.dev",           description: "Next.js 16+ App Router with SSR, Tailwind v4, Framer Motion, and four themes" },
    { title: "HBS Events Studio",    description: "Next.js 15+ with App Router, SSR/ISR/CSR per page, Apollo Client, Stripe.js" },
  ],
  "React Native":   [
    { title: "Lumigram",             description: "Expo / React Native photo-sharing app — Firebase backend, React Navigation, Image Picker, TypeScript" },
    { title: "Atlas Music Player",   description: "Cross-platform music player built with Expo and React Native" },
  ],
  "Expo":           [
    { title: "Lumigram",             description: "Expo SDK 54 — routing via Expo Router, Expo Image, Expo Haptics, Expo Blur" },
    { title: "Atlas Music Player",   description: "Expo-based cross-platform audio player built during Atlas curriculum" },
  ],
  "HTML":           [
    { title: "frandy.dev",           description: "Semantic HTML structure across all portfolio sections and admin views" },
  ],
  "CSS":            [
    { title: "frandy.dev",           description: "Custom CSS with four-theme variable system, animations, and responsive layouts" },
  ],
  "Tailwind CSS":   [
    { title: "frandy.dev",           description: "Tailwind v4 with @theme directive — custom CSS variables for four animated themes" },
    { title: "HBS Events Studio",    description: "Tailwind CSS v3 with CSS Modules for component-specific styles" },
  ],
  "Figma":          [
    { title: "frandy.dev",           description: "Full site wireframes and design system before writing a single line of code" },
    { title: "HBS Events Studio",    description: "Brand identity, color system, page wireframes, and component design in Figma" },
  ],

  // Backend
  "Node.js":        [
    { title: "HBS Events Studio",    description: "Next.js 15+ runs on Node.js 20 LTS — pnpm, API routes, middleware, server components" },
  ],
  "Django":         [
    { title: "HBS Events Studio",    description: "Django 5+ main backend — ORM, DRF, Graphene-Django GraphQL, Celery, admin, JWT auth" },
  ],
  "FastAPI":        [
    { title: "frandy.dev API",       description: "Async REST API — JWT auth, PostgreSQL via SQLAlchemy, Docker, resume endpoints" },
    { title: "HBS Events Studio",    description: "FastAPI AI microservice — Claude API + OpenAI fallback, structured JSON quote generation" },
  ],
  "GraphQL":        [
    { title: "HBS Events Studio",    description: "Graphene-Django server + Apollo Client — all data queries, mutations, and admin ops" },
  ],
  "RESTful APIs":   [
    { title: "frandy.dev API",       description: "Full REST API for portfolio — projects, contacts, settings, resume, timeline, admin" },
    { title: "HBS Events Studio",    description: "REST webhook endpoints for Stripe, Square, Cloudinary, and DocuSign integrations" },
  ],

  // Databases
  "PostgreSQL":     [
    { title: "frandy.dev API",       description: "Primary database — projects, contacts, site settings, admin users, resume, timeline" },
    { title: "HBS Events Studio",    description: "Full business database — leads, bookings, payments, themes, portfolio, community designs" },
  ],
  "MongoDB":        [
    { title: "Atlas Curriculum",     description: "Used in Atlas backend projects for document-based data storage and NoSQL patterns" },
  ],
  "Redis":          [
    { title: "HBS Events Studio",    description: "Session management, pop-up timing logic, AI quote caching, and rate limiting" },
  ],
  "SQLAlchemy":     [
    { title: "frandy.dev API",       description: "Async SQLAlchemy 2.x with asyncpg — all database models and migrations" },
    { title: "HBS Events Studio",    description: "SQLAlchemy 2.x async in FastAPI microservice for reading pricing config from PostgreSQL" },
  ],

  // DevOps & Tools
  "Docker":         [
    { title: "frandy.dev",           description: "Five-service Docker Compose on DigitalOcean — FastAPI, Next.js, PostgreSQL, Redis, Nginx" },
    { title: "HBS Events Studio",    description: "Six-container Docker Compose — Django, FastAPI, Next.js, PostgreSQL, Redis, Celery worker" },
  ],
  "Git":            [
    { title: "frandy.dev",           description: "Git version control — feature branches, pull requests, and protected main branch" },
    { title: "HBS Events Studio",    description: "Monorepo Git strategy — feature/*, develop, and main branches with PR-gated deployments" },
  ],
  "GitHub Actions": [
    { title: "frandy.dev",           description: "CI/CD pipeline — auto-deploy to DigitalOcean on push to main, Docker build and restart" },
    { title: "HBS Events Studio",    description: "CI/CD pipeline — pytest + Jest on every PR, auto-deploy to Vercel and Railway on merge" },
  ],
  "Linux":          [
    { title: "frandy.dev",           description: "DigitalOcean Ubuntu droplet — server management, Docker, Nginx reverse proxy, SSL/TLS" },
  ],
  "ServiceNow":     [
    { title: "VA IT Operations",     description: "Tier 2/3 ticket management, BioMed activations, and escalation routing for 400+ staff" },
  ],
  "Microsoft Intune": [
    { title: "VA IT Operations",     description: "MDM deployment — 300+ laptop and 600+ monitor refresh across VISN16 for COVID-19 and Cerner EHR" },
  ],

  // Security & IT
  "Vulnerability Analysis":   [{ title: "VA DevSecOps",      description: "Risk assessments and AIS security plans across VA information systems per NIST standards" }],
  "Active Directory":         [{ title: "VA IT Operations",   description: "User account setup, permissions management, and PIV card access for 400+ staff" }],
  "VLAN Architecture":        [{ title: "VA IT Operations",   description: "Multi-site VLAN management with Cisco switches across the VA Muskogee network" }],
  "VPN Management":           [{ title: "VA IT Operations",   description: "Cisco AnyConnect VPN configuration and remote access security enforcement" }],
  "Compliance Auditing":      [{ title: "VA DevSecOps",       description: "AIS security contingency plans and disaster recovery procedures for VA federal compliance" }],
  "AIS Security Planning":    [{ title: "VA DevSecOps",       description: "Developed AIS security plans ensuring compliance with VA federal statutes and NIST-aligned standards" }],
  "Cisco SecureCRT":          [{ title: "VA IT Operations",   description: "Cisco switch administration via SecureCRT, PUTTY, and TelNet across multi-site VA network" }],
  "Cisco AnyConnect VPN":     [{ title: "VA IT Operations",   description: "VPN configuration, enforcement, and two-factor authentication policy management" }],
  "DHCP / DNS / TCP-IP":      [{ title: "VA IT Operations",   description: "Network protocol management across VA multi-site infrastructure — DNS, DHCP, RDP, SSL/TLS" }],
  "Two-Factor Auth":          [{ title: "VA IT Operations",   description: "Enforced 2FA and PIV card policies for all remote access and privileged accounts" }],
};

// Shapes
const CLIP_SHAPES = [
  "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  "inset(0% 0% 0% 0% round 4px)",
  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  "inset(15% 0% 15% 0% round 3px)",
  "circle(50% at 50% 50%)",
] as const;

const MORPH_INTERVAL_MS = 4000;

function SkillCard({ skill, active, onClick, clipIndex }: {
  skill: string; active: boolean; onClick: () => void; clipIndex: number;
}) {
  const meta     = SKILL_META[skill] ?? { icon: null, color: "var(--accent)" };
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="skill-preview__empty">Used as a supporting tool across multiple projects.</p>
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
