"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { settingsApi } from "@/lib/api";
import { fadeUp } from "@/lib/animations";

export default function Hero() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    settingsApi.getResume().then((d) => setResumeUrl(d.resume_url)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-grid-bg" aria-hidden />
      <div className="hero-bloom" aria-hidden />

      <div className="site-container hero-content">
        <motion.p
          className="hero-eyebrow"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Portfolio — 2025
        </motion.p>

        <motion.h1
          className="hero-name"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Frandy{" "}
          <span className="hero-name__accent">Slueue</span>
        </motion.h1>

        <motion.p
          className="hero-title"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Full Stack Software Engineer
        </motion.p>

        <motion.p
          className="hero-subtitle"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          I build clean, efficient software — from idea to deployment.
        </motion.p>

        <motion.div
          className="hero-ctas"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <a href="#projects" className="btn-primary">
            <span>View My Work</span>
          </a>
          {resumeUrl ? (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Download Resume
            </a>
          ) : (
            <a href="#contact" className="btn-ghost">Get In Touch</a>
          )}
        </motion.div>
      </div>

      {/* Scroll hint — hidden on portrait mobile via CSS */}
      <motion.div
        className="hero-scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.5, delay: scrolled ? 0 : 1.5 }}
        aria-hidden
      >
        <div className="hero-scroll-line" />
        <span className="hero-scroll-label">Scroll</span>
      </motion.div>
    </section>
  );
}
