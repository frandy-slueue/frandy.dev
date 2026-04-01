import type { Variants } from "framer-motion";

// ── Directional fade variants ────────────────────────────────────────
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
};

export const fadeRight: Variants = {
  hidden:  { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0 },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

// ── Container variant — staggers children ────────────────────────────
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05 } },
};

// ── Shared transition presets ────────────────────────────────────────
export const TRANSITION_BASE = { duration: 0.5 };
export const TRANSITION_FAST = { duration: 0.35 };
export const TRANSITION_SLOW = { duration: 0.6 };

// ── Shared viewport config ───────────────────────────────────────────
export const VIEWPORT = { once: true } as const;
