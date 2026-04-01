"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { fadeLeft, fadeRight, staggerContainer, fadeUp, VIEWPORT, TRANSITION_SLOW } from "@/lib/animations";

const CHIPS = [
  "JavaScript", "Python", "Full Stack", "React",
  "Next.js", "FastAPI", "PostgreSQL", "Docker",
  "Atlas School", "Open to Work",
];

export default function About() {
  return (
    <section id="about" className="section-pad" aria-labelledby="about-heading" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="site-container">
        <SectionLabel>01 — About</SectionLabel>

        <div className="about-grid">
          {/* Photo column — intentionally kept as-is */}
          <motion.div className="about-photo-col" variants={fadeLeft} initial="hidden" whileInView="visible" viewport={VIEWPORT} transition={TRANSITION_SLOW}>
            <div className="about-photo-frame">
              <div className="about-photo-inner-border" />
              {/*
                Replace placeholder with real photo:
                import Image from "next/image";
                <Image src="/photo.jpg" alt="Frandy Slueue" fill style={{ objectFit: "cover" }} />
              */}
              <div className="about-photo-img">
                <span className="about-photo-label">Photo</span>
              </div>
            </div>
            <div className="about-photo-corner" aria-hidden />
          </motion.div>

          {/* Text column */}
          <motion.div className="about-text-col" variants={fadeRight} initial="hidden" whileInView="visible" viewport={VIEWPORT} transition={TRANSITION_SLOW}>
            <h2 id="about-heading" className="about-heading">The Story</h2>

            <div className="about-bio-group">
              <p className="section-prose">
                Before software, there was a drive to understand how things work and a persistent need to build. That instinct led me to Atlas School of Tulsa — an intensive, project-based software engineering program where theory meets real execution from day one.
              </p>
              <p className="section-prose">
                Today I work across the full stack — React and Next.js on the frontend, FastAPI and Django on the backend, PostgreSQL and MongoDB for data, Docker for deployment. I build under the name{" "}
                <span style={{ color: "var(--accent)" }}>CodeBreeder</span>
                {" "}— a personal brand for the work I create and ship.
              </p>
              <p className="section-prose">
                I am actively seeking my first full-time engineering role and available for freelance projects. If you have something worth building, I want to hear about it.
              </p>
            </div>

            {/* Chips — double frame design */}
            <motion.div className="about-chips" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
              {CHIPS.map((chip) => (
                <motion.span key={chip} className="chip" variants={fadeUp} transition={{ duration: 0.4 }}>
                  {chip}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style>{`
        .about-photo-col  { position: relative; }
        .about-photo-frame {
          position: relative;
          padding-bottom: 133%;
          border: 1px solid var(--accent-muted);
        }
        .about-photo-inner-border {
          position: absolute; inset: 6px;
          border: 1px solid var(--border);
          z-index: 1; pointer-events: none;
        }
        .about-photo-img {
          position: absolute; inset: 0;
          background-color: var(--bg-elevated);
          display: flex; align-items: center; justify-content: center;
        }
        .about-photo-label {
          font-family: var(--font-body); font-size: 11px;
          letter-spacing: 3px; text-transform: uppercase; color: var(--border);
        }
        .about-photo-corner {
          position: absolute; bottom: -8px; right: -8px;
          width: 40px; height: 40px;
          border-right: 1px solid var(--accent);
          border-bottom: 1px solid var(--accent);
          pointer-events: none;
        }
        @media (max-width: 900px) {
          .about-photo-frame { padding-bottom: 75%; }
          .about-photo-col { width: min(220px, 70%); margin-inline: auto; }
        }
      `}</style>
    </section>
  );
}
