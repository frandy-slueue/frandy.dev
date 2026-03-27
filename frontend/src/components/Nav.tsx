"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Timeline", href: "#timeline" },
  { label: "Contact", href: "#contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-13 z-50 border-b backdrop-blur-md transition-colors duration-300
      ${scrolled ? "bg-[rgba(8,8,8,0.95)]" : "bg-[rgba(8,8,8,0.80)]"}
      border-(--border)`}
    >
      <div className="site-container flex h-full items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-[22px] tracking-[2px] text-(--accent)"
          style={{ fontFamily: "var(--font-display)" }}
        >
          FS
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-semibold tracking-[2px] uppercase text-(--accent-muted) transition-colors duration-200 hover:text-(--accent)"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          className="flex flex-col gap-1.25 p-2 md:hidden"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block w-5.5 h-px bg-(--accent) transition-all duration-300
                ${
                  menuOpen && i === 0
                    ? "translate-y-1.5 rotate-45"
                    : menuOpen && i === 2
                    ? "-translate-y-1.5 -rotate-45"
                    : ""
                }
                ${menuOpen && i === 1 ? "opacity-0" : "opacity-100"}
              `}
            />
          ))}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-13 left-0 right-0 border-b backdrop-blur-md overflow-hidden transition-all duration-300
        bg-[rgba(8,8,8,0.98)] border-(--border)
        ${menuOpen ? "max-h-75 py-6 px-8" : "max-h-0 px-8 py-0"}`}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="block py-3 text-[14px] font-semibold tracking-[2px] uppercase text-(--accent-muted) border-b border-(--border-subtle) transition-colors duration-200 hover:text-(--accent)"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}