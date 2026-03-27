"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { settingsApi } from "@/lib/api";

export default function Hero() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    settingsApi
      .getResume()
      .then((data) => setResumeUrl(data.resume_url))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Grid background */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Radial bloom */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 70% at 0% 50%, var(--accent-glow), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div className="site-container" style={{ position: "relative", zIndex: 1 }}>

        {/* Eyebrow */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "16px",
          }}
        >
          Portfolio — 2025
        </motion.p>

        {/* Name */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3.5rem, 10vw, 7.5rem)",
            lineHeight: 1,
            letterSpacing: "2px",
            color: "var(--text-primary)",
            marginBottom: "16px",
          }}
        >
          Frandy{" "}
          <span style={{ color: "var(--accent)" }}>Slueue</span>
        </motion.h1>

        {/* Title */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(13px, 2vw, 18px)",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            marginBottom: "16px",
          }}
        >
          Full Stack Software Engineer
        </motion.p>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            color: "var(--text-muted)",
            maxWidth: "480px",
            lineHeight: 1.7,
            marginBottom: "40px",
          }}
        >
          I build clean, efficient software — from idea to deployment.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <a href="#projects" className="btn-primary">
            <span>View My Work</span>
          </a>
          
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Download Resume
            </a>
          ) : (
            <a href="#contact" className="btn-ghost">
              Get In Touch
            </a>
          )}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.5, delay: scrolled ? 0 : 1.5 }}
        aria-hidden
        style={{
          position: "absolute",
          bottom: "32px",
          left: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "1px",
            height: "40px",
            background: "linear-gradient(to bottom, var(--accent), transparent)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Scroll
        </span>
      </motion.div>
    </section>
  );
}