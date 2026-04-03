"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTop({ visible }: { visible: boolean }) {
  return (
    <>
      <button
        onClick={() => window.scrollTo({ top:0, behavior:"smooth" })}
        aria-label="Back to top"
        className={`back-to-top dframe ${visible ? "visible" : ""}`}
      >
        <ArrowUp size={16} strokeWidth={1.5} />
      </button>

      <style>{`
        .back-to-top {
          position: fixed;
          bottom: 24px;
          right: 16px;
          width: 40px;
          height: 40px;
          background: var(--bg-elevated);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 55;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 300ms ease, transform 300ms ease,
                      background 200ms ease, color 200ms ease;
          pointer-events: none;
        }
        .back-to-top.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .back-to-top:hover {
          background: var(--accent);
          color: var(--bg-primary);
          animation: none;
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 4px var(--accent-glow); }
          50%       { box-shadow: 0 0 12px var(--accent-glow); }
        }
        @media (min-width: 768px) {
          .back-to-top { bottom: 32px; right: max(32px, calc((100vw - 1100px) / 2 + 20px)); }
        }
        @media (max-width: 767px) and (orientation: portrait) {
          .back-to-top { bottom: 90px; }
        }
      `}</style>
    </>
  );
}
