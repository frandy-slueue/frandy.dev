"use client";

import { motion } from "framer-motion";
import { fadeLeft, VIEWPORT, TRANSITION_BASE } from "@/lib/animations";

interface SectionLabelProps {
  children: React.ReactNode;
}

/**
 * Animated section eyebrow — "01 — About", "02 — Skills", etc.
 * Used at the top of every main section.
 */
export default function SectionLabel({ children }: SectionLabelProps) {
  return (
    <motion.p
      className="section-label"
      variants={fadeLeft}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      transition={TRANSITION_BASE}
    >
      {children}
    </motion.p>
  );
}
