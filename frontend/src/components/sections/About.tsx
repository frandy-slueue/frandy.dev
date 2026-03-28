"use client";

import { motion } from "framer-motion";

const CHIPS = [
  "JavaScript",
  "Python",
  "Full Stack",
  "React",
  "Next.js",
  "FastAPI",
  "PostgreSQL",
  "Docker",
  "Atlas School",
  "Open to Work",
];

export default function About() {
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="about"
      className="section-pad"
      style={{ backgroundColor: "var(--bg-secondary)" }}
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
          01 — About
        </motion.p>

        {/* Two-column grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "60px",
            alignItems: "start",
          }}
          className="about-grid"
        >

          {/* Photo column */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ position: "relative" }}
          >
            {/* Outer border frame */}
            <div
              style={{
                position: "relative",
                paddingBottom: "133%",
                border: "1px solid var(--accent-muted)",
              }}
            >
              {/* Inner offset border */}
              <div
                style={{
                  position: "absolute",
                  inset: "6px",
                  border: "1px solid var(--border)",
                  zIndex: 1,
                  pointerEvents: "none",
                }}
              />
              {/* Photo placeholder — replace src with real photo */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "var(--bg-elevated)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "11px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "var(--border)",
                  }}
                >
                  Photo
                </span>
              </div>
            </div>

            {/* Accent corner — bottom right */}
            <div
              style={{
                position: "absolute",
                bottom: "-8px",
                right: "-8px",
                width: "40px",
                height: "40px",
                borderRight: "1px solid var(--accent)",
                borderBottom: "1px solid var(--accent)",
                pointerEvents: "none",
              }}
            />
          </motion.div>

          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Heading */}
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                color: "var(--text-primary)",
                lineHeight: 1,
                letterSpacing: "2px",
              }}
            >
              The Story
            </h2>

            {/* Bio paragraphs */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  color: "var(--text-muted)",
                  lineHeight: 1.8,
                }}
              >
                Before software, there was a drive to understand how things
                work and a persistent need to build. That instinct led me to
                Atlas School of Tulsa — an intensive, project-based software
                engineering program where theory meets real execution from day
                one.
              </p>

              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  color: "var(--text-muted)",
                  lineHeight: 1.8,
                }}
              >
                Today I work across the full stack — React and Next.js on the
                frontend, FastAPI and Django on the backend, PostgreSQL and
                MongoDB for data, Docker for deployment. I build under the
                name{" "}
                <span style={{ color: "var(--accent)" }}>CodeBreeder</span>
                {" "}— a personal brand for the work I create and ship.
              </p>

              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  color: "var(--text-muted)",
                  lineHeight: 1.8,
                }}
              >
                I am actively seeking my first full-time engineering role and
                available for freelance projects. If you have something worth
                building, I want to hear about it.
              </p>
            </div>

            {/* Chips */}
            <motion.div
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05 } },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              {CHIPS.map((chip) => (
                <motion.span
                  key={chip}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    padding: "6px 14px",
                    backgroundColor: "var(--bg-elevated)",
                  }}
                >
                  {chip}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
