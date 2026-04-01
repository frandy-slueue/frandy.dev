/**
 * Skeleton — composable loading placeholders.
 *
 * All visual styling is in globals.css via .skel + modifier classes.
 * These components are thin wrappers that keep JSX readable.
 *
 * Usage:
 *   <Skel.Text />                     — single text line, full width
 *   <Skel.Text width="half" />        — 50% width
 *   <Skel.Heading />                  — larger heading bar
 *   <Skel.Box height={120} />         — arbitrary fixed-height block
 *   <Skel.Circle size={40} />         — circular avatar/icon
 *   <Skel.Row>...</Skel.Row>          — flex row container
 *   <Skel.Group>...</Skel.Group>      — flex column container
 */

type Width = "full" | "3-4" | "half" | "third" | "quarter";

interface TextProps {
  width?: Width;
  size?: "sm" | "base" | "lg";
}

function Text({ width = "full", size = "base" }: TextProps) {
  const sizeClass = size === "sm" ? "skel--text-sm" : size === "lg" ? "skel--text-lg" : "skel--text";
  return <span className={`skel ${sizeClass} skel--w-${width}`} />;
}

function Heading({ width = "half" }: { width?: Width }) {
  return <span className={`skel skel--heading skel--w-${width}`} />;
}

function Title({ width = "3-4" }: { width?: Width }) {
  return <span className={`skel skel--title skel--w-${width}`} />;
}

function Box({ height, className = "", style }: { height: number; className?: string; style?: React.CSSProperties }) {
  return <span className={`skel ${className}`} style={{ height, display: "block", ...style }} />;
}

function Circle({ size }: { size: number }) {
  return <span className="skel skel--circle" style={{ width: size, height: size, flexShrink: 0 }} />;
}

function Row({ children, gap = 12 }: { children: React.ReactNode; gap?: number }) {
  return <div className="skel-row" style={{ gap }}>{children}</div>;
}

function Group({ children, gap = 10 }: { children: React.ReactNode; gap?: number }) {
  return <div className="skel-group" style={{ gap }}>{children}</div>;
}

// Named export so callers write: <Skel.Text /> etc.
export const Skel = { Text, Heading, Title, Box, Circle, Row, Group };
