/**
 * Button — rounded-rect buttons matching the reference design.
 *
 * Visual spec (from approved design):
 *   · Outer: 14px border-radius, faint full border
 *   · Inner: 10px border-radius inset box, 4px gap — clip target for fill
 *   · Corner arcs: TL + BR accented at rest, flip to TR + BL on hover
 *
 * Two variants:
 *   BtnPrimary   — inner rect fills from left on hover, arcs switch
 *   BtnSecondary — inner rect glass-fills on hover, arcs switch
 *
 * Works as both <button> and <a> — pass href for link behaviour.
 * All animation/styling lives in globals.css via .btn-primary / .btn-secondary.
 *
 * Required inner structure (generated automatically):
 *   <span class="btn-tl" />   — top-left arc
 *   <span class="btn-br" />   — bottom-right arc
 *   <span class="btn-inner"/> — inner rounded rect (fill clip)
 *   <span class="btn-txt">    — text wrapper (z-index above fill)
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

/** Inner structure required by the CSS animation system */
function BtnStructure({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="btn-tl"    aria-hidden />
      <span className="btn-br"    aria-hidden />
      <span className="btn-inner" aria-hidden />
      <span className="btn-txt">{children}</span>
    </>
  );
}

export function BtnPrimary({
  children, href, className = "", type, disabled, onClick, style, target, rel, "aria-label": ariaLabel,
}: SharedProps) {
  const cls = `btn-primary ${className}`.trim();
  if (href) {
    return (
      <a href={href} className={cls} target={target} rel={rel} style={style} aria-label={ariaLabel}>
        <BtnStructure>{children}</BtnStructure>
      </a>
    );
  }
  return (
    <button className={cls} type={type ?? "button"} disabled={disabled} onClick={onClick} style={style} aria-label={ariaLabel}>
      <BtnStructure>{children}</BtnStructure>
    </button>
  );
}

export function BtnSecondary({
  children, href, className = "", type, disabled, onClick, style, target, rel, "aria-label": ariaLabel,
}: SharedProps) {
  const cls = `btn-secondary ${className}`.trim();
  if (href) {
    return (
      <a href={href} className={cls} target={target} rel={rel} style={style} aria-label={ariaLabel}>
        <BtnStructure>{children}</BtnStructure>
      </a>
    );
  }
  return (
    <button className={cls} type={type ?? "button"} disabled={disabled} onClick={onClick} style={style} aria-label={ariaLabel}>
      <BtnStructure>{children}</BtnStructure>
    </button>
  );
}
