"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [ripple, setRipple] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(false), 2500);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleClick() {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Back to top"
        className={`back-to-top ${visible ? "visible" : ""} ${ripple ? "ripple" : ""}`}
      >
        <span className="back-to-top__arrow">
          <ArrowUp size={18} />
        </span>
        <span className="back-to-top__ring" />
      </button>

      <style>{`
        .back-to-top {
          position: fixed;
          bottom: 88px;
          right: 16px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--bg-elevated);
          border: 1px solid var(--accent);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 55;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 350ms ease, transform 350ms ease,
                      background 250ms ease, box-shadow 250ms ease;
          pointer-events: none;
          overflow: visible;
          backdrop-filter: blur(8px);
        }

        .back-to-top.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }

        .back-to-top:hover {
          background: var(--accent);
          color: var(--bg-primary);
          box-shadow: 0 0 20px var(--accent-glow);
        }

        /* Bob animation */
        .back-to-top__arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bob 2s ease-in-out infinite;
        }

        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        /* Ripple ring */
        .back-to-top__ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid var(--accent);
          opacity: 0;
          transform: scale(1);
          pointer-events: none;
        }

        .back-to-top.ripple .back-to-top__ring {
          animation: ripple-out 0.6s ease-out forwards;
        }

        @keyframes ripple-out {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* Glow pulse on visible */
        .back-to-top.visible {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 6px var(--accent-glow); }
          50% { box-shadow: 0 0 18px var(--accent-glow); }
        }

        .back-to-top.visible:hover {
          animation: none;
          box-shadow: 0 0 24px var(--accent-glow);
        }

        /* Desktop positioning */
        @media (min-width: 768px) {
          .back-to-top {
            bottom: 32px;
            right: 32px;
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </>
  );
}
