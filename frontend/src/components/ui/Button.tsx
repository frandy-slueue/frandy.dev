/**
 * Button — reusable pill buttons with corner arc design system.
 *
 * Two variants:
 *   BtnPrimary  — corner arcs switch + inner pill fills from left on hover
 *   BtnSecondary — corner arcs switch + inner glass fill on hover
 *
 * Works as both <button> and <a> — pass href for link behaviour.
 *
 * All styling lives in globals.css via .btn-primary / .btn-secondary.
 * The four inner spans are required for the animation to work:
 *   .btn-tl  — top-left arc accent
 *   .btn-br  — bottom-right arc accent
 *   .btn-inner — inner pill container (clip target for fill)
 *   .btn-txt — text wrapper (z-index above fill)
 */

import React from "react";

type SharedProps = {
  children: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
};

function Arcs() {
  return (
    <>
      <span className="btn-tl" aria-hidden />
      <span className="btn-br" aria-hidden />
      <span className="btn-inner" aria-hidden />
    </>
  );
}

export function BtnPrimary({ children, href, className = "", ...props }: SharedProps) {
  const cls = `btn-primary ${className}`.trim();
  if (href) {
    return (
      <a href={href} className={cls} target={props.target} rel={props.rel} style={props.style}>
        <Arcs />
        <span className="btn-txt">{children}</span>
      </a>
    );
  }
  return (
    <button className={cls} type={props.type ?? "button"} disabled={props.disabled}
      onClick={props.onClick} style={props.style} aria-label={props["aria-label"]}>
      <Arcs />
      <span className="btn-txt">{children}</span>
    </button>
  );
}

export function BtnSecondary({ children, href, className = "", ...props }: SharedProps) {
  const cls = `btn-secondary ${className}`.trim();
  if (href) {
    return (
      <a href={href} className={cls} target={props.target} rel={props.rel} style={props.style}>
        <Arcs />
        <span className="btn-txt">{children}</span>
      </a>
    );
  }
  return (
    <button className={cls} type={props.type ?? "button"} disabled={props.disabled}
      onClick={props.onClick} style={props.style} aria-label={props["aria-label"]}>
      <Arcs />
      <span className="btn-txt">{children}</span>
    </button>
  );
}
