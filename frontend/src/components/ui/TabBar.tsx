"use client";

import { useEffect, useRef, useState } from "react";

export interface TabItem {
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: TabItem[];
  active: string;
  onChange: (label: string) => void;
}

/**
 * Horizontal tab bar with a smooth sliding indicator.
 * Used in Skills (categories), Projects (filters), and Timeline (filters).
 *
 * Only the indicator position is dynamic — everything else is CSS.
 */
export default function TabBar({ tabs, active, onChange }: TabBarProps) {
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const barRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.label === active);
    const el  = btnRefs.current[idx];
    const bar = barRef.current;
    if (!el || !bar) return;
    const barRect = bar.getBoundingClientRect();
    const elRect  = el.getBoundingClientRect();
    setPill({ left: elRect.left - barRect.left, width: elRect.width });
  }, [active, tabs]);

  return (
    <div className="tab-bar-wrap">
      <div ref={barRef} className="tab-bar">
        {/* Sliding pill indicator — left/width are truly dynamic */}
        <div
          className="tab-bar__indicator"
          style={{ left: pill.left, width: pill.width }}
        />

        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            ref={(el) => { btnRefs.current[i] = el; }}
            className={`tab-btn ${active === tab.label ? "active" : ""}`}
            onClick={() => onChange(tab.label)}
          >
            {tab.icon && (
              <span className="tab-btn__icon" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
