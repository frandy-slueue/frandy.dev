"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FaGithub,
  FaLinkedin,
  FaXTwitter,
  FaFacebook,
  FaMedium,
} from "react-icons/fa6";

interface SocialLinks {
  social_github: string | null;
  social_linkedin: string | null;
  social_x: string | null;
  social_facebook: string | null;
  social_medium: string | null;
}

const TOTAL = 100;
const colBits: string[] = [];
for (let i = 0; i < TOTAL; i++)
  colBits.push(Math.random() > 0.5 ? "1" : "0");

const NUM_COLS = 18;
const colOffsets: number[] = [];
const colSpeeds: number[] = [];
for (let c = 0; c < NUM_COLS; c++) {
  colOffsets.push(Math.random() * TOTAL);
  colSpeeds.push(0.18 + Math.random() * 0.12);
}

function drawMark(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const CX = W / 2, CY = H / 2, R = W * 0.46;
  ctx.clearRect(0, 0, W, H);

  const fontSize = Math.max(7, W * 0.085);
  const cellW = fontSize * 1.05;
  const cellH = fontSize * 1.25;
  const COLS = Math.ceil(W / cellW) + 2;
  const ROWS = Math.ceil(H / cellH) + 4;

  function inDiamond(px: number, py: number) {
    return Math.abs(px - CX) / R + Math.abs(py - CY) / R <= 1;
  }
  function radialAlpha(px: number, py: number) {
    const d = Math.abs(px - CX) / R + Math.abs(py - CY) / R;
    if (d >= 1) return 0;
    if (d < 0.22) return 1;
    if (d < 0.58) return 1 - ((d - 0.22) / 0.36) * 0.42;
    return 0.58 - ((d - 0.58) / 0.42) * 0.58;
  }

  for (let c = 0; c < COLS; c++) {
    const scroll = colOffsets[c % NUM_COLS] || 0;
    for (let r = -1; r < ROWS + 3; r++) {
      const srcIdx = ((Math.floor(r + scroll)) % TOTAL + TOTAL) % TOTAL;
      const bit = colBits[(c * 13 + srcIdx) % TOTAL];
      const px = c * cellW + cellW * 0.35;
      const py = r * cellH + cellH * 0.5 - (scroll % 1) * cellH;
      if (!inDiamond(px, py)) continue;
      const alpha = radialAlpha(px, py);
      if (alpha < 0.04) continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = bit === "1" ? "#00ee55" : "#00ddff";
      ctx.font = `900 ${fontSize.toFixed(1)}px monospace`;
      ctx.fillText(bit, px - fontSize * 0.28, py + fontSize * 0.36);
    }
  }

  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(CX, CY - (R - 1));
  ctx.lineTo(CX + (R - 1), CY);
  ctx.lineTo(CX, CY + (R - 1));
  ctx.lineTo(CX - (R - 1), CY);
  ctx.closePath();
  ctx.strokeStyle = "rgba(220,220,220,0.85)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(CX, CY - (R - 7));
  ctx.lineTo(CX + (R - 7), CY);
  ctx.lineTo(CX, CY + (R - 7));
  ctx.lineTo(CX - (R - 7), CY);
  ctx.closePath();
  ctx.strokeStyle = "rgba(200,200,200,0.3)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

function CBDiamond({ size = 36 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawMark(ctx, size, size);
  }, [size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
}

export default function Footer() {
  const [social, setSocial] = useState<SocialLinks>({
    social_github: null,
    social_linkedin: null,
    social_x: null,
    social_facebook: null,
    social_medium: null,
  });

  useEffect(() => {
    fetch("/api/settings/social")
      .then((r) => r.json())
      .then((data) => setSocial(data))
      .catch(() => {});
  }, []);

  const socialLinks = [
    { key: "social_github", icon: <FaGithub size={18} />, label: "GitHub" },
    { key: "social_linkedin", icon: <FaLinkedin size={18} />, label: "LinkedIn" },
    { key: "social_x", icon: <FaXTwitter size={18} />, label: "X" },
    { key: "social_facebook", icon: <FaFacebook size={18} />, label: "Facebook" },
    { key: "social_medium", icon: <FaMedium size={18} />, label: "Medium" },
  ];

  return (
    <>
      <footer className="site-footer">
        <div className="site-footer__inner site-container">

          {/* Left — Frandy.dev logo */}
          <Link href="/" className="site-footer__brand">
            <div className="site-footer__fs-diamond">
              <div className="site-footer__fs-inner">
                <div className="site-footer__fs-border" />
                <span className="site-footer__fs-text">FS</span>
              </div>
            </div>
            <div className="site-footer__brand-text">
              <span className="site-footer__name">FRANDY</span>
              <span className="site-footer__sub">· dev</span>
            </div>
          </Link>

          {/* Center — Social icons */}
          <div className="site-footer__social">
            {socialLinks.map(({ key, icon, label }) => {
              const url = social[key as keyof SocialLinks];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__social-link"
                  aria-label={label}
                >
                  {icon}
                </a>
              );
            })}
          </div>

          {/* Right — Copyright + CodeBreeder */}
          <div className="site-footer__right">
            <span className="site-footer__copy">
              © {new Date().getFullYear()} Frandy Slueue · All rights reserved
            </span>
            <div className="site-footer__cb">
              <CBDiamond size={28} />
              <span className="site-footer__cb-text">
                Built with precision by{" "}
                <span className="site-footer__cb-name">CodeBreeder</span>
              </span>
            </div>
          </div>

        </div>
      </footer>

      <style>{`
        .site-footer {
          display: none;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
          padding: 1.25rem 0;
        }

        @media (min-width: 768px) {
          .site-footer {
            display: block;
          }
        }

        .site-footer__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .site-footer__brand {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .site-footer__fs-diamond {
          width: 28px;
          height: 28px;
          transform: rotate(45deg);
          border: 1.5px solid var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
        }

        .site-footer__fs-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .site-footer__fs-border {
          position: absolute;
          inset: 3px;
          border: 0.5px solid rgba(192,192,192,0.2);
        }

        .site-footer__fs-text {
          transform: rotate(-45deg);
          font-family: var(--font-display);
          font-size: 10px;
          color: var(--accent);
          letter-spacing: 1px;
          line-height: 1;
          position: relative;
          z-index: 1;
        }

        .site-footer__brand-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .site-footer__name {
          font-family: var(--font-display);
          font-size: 16px;
          color: var(--text-primary);
          letter-spacing: 3px;
          line-height: 1;
        }

        .site-footer__sub {
          font-family: var(--font-body);
          font-size: 9px;
          letter-spacing: 3px;
          color: var(--accent-muted);
          text-transform: uppercase;
          line-height: 1;
        }

        .site-footer__social {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .site-footer__social-link {
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
        }

        .site-footer__social-link:hover {
          color: var(--accent);
          transform: translateY(-2px);
        }

        .site-footer__right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex-shrink: 0;
        }

        .site-footer__copy {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .site-footer__cb {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .site-footer__cb-text {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .site-footer__cb-name {
          color: var(--accent);
          letter-spacing: 1px;
        }
      `}</style>
    </>
  );
}
