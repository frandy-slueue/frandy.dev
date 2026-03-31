"use client";

import { useEffect, useState, useRef } from "react";

export default function FloatingHomeBtn() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 200) {
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

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <button
        className={`floating-home ${visible ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      <style>{`
        .floating-home {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 49;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 300ms ease, transform 300ms ease, 
                      color 200ms ease, border-color 200ms ease;
          pointer-events: none;
        }

        .floating-home.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }

        .floating-home:hover {
          color: var(--accent);
          border-color: var(--accent);
        }

        @media (min-width: 768px) {
          .floating-home {
            bottom: 24px;
          }
        }
      `}</style>
    </>
  );
}
