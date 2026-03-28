"use client";

import { useEffect, useRef } from "react";

interface CodeBreederDiamondProps {
  size?: number;
  animated?: boolean;
}

const TOTAL = 100;
const NUM_COLS = 18;

export default function CodeBreederDiamond({
  size = 130,
  animated = false,
}: CodeBreederDiamondProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null; inside: boolean }>({
    x: null, y: null, inside: false,
  });
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = size;
    const H = size;
    const CX = W / 2;
    const CY = H / 2;
    const R = W * 0.46;

    // Generate stable bit array
    const colBits: string[] = Array.from({ length: TOTAL }, () =>
      Math.random() > 0.5 ? "1" : "0"
    );
    const colOffsets: number[] = Array.from({ length: NUM_COLS }, () =>
      Math.random() * TOTAL
    );
    const colSpeeds: number[] = Array.from(
      { length: NUM_COLS },
      () => 0.18 + Math.random() * 0.12
    );

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

    if (animated) {
      canvas.style.cursor = "none";
      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        mouseRef.current.x = (e.clientX - rect.left) * scaleX;
        mouseRef.current.y = (e.clientY - rect.top) * scaleY;
        mouseRef.current.inside = inDiamond(
          mouseRef.current.x!,
          mouseRef.current.y!
        );
        canvas.style.cursor = mouseRef.current.inside ? "none" : "default";
      });
      canvas.addEventListener("mouseleave", () => {
        mouseRef.current = { x: null, y: null, inside: false };
        canvas.style.cursor = "default";
      });
    }

    const fontSize = Math.max(7, W * 0.085);
    const cellW = fontSize * 1.05;
    const cellH = fontSize * 1.25;
    const COLS = Math.ceil(W / cellW) + 2;
    const ROWS = Math.ceil(H / cellH) + 4;

    let last = 0;

    function draw(ts: number) {
      if (!ctx) return;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;

      if (animated) {
        for (let c = 0; c < NUM_COLS; c++) {
          colOffsets[c] = (colOffsets[c] + colSpeeds[c] * dt) % TOTAL;
        }
      }

      ctx.clearRect(0, 0, W, H);

      for (let c = 0; c < COLS; c++) {
        const scroll = animated ? colOffsets[c % NUM_COLS] : c * 0.3;
        for (let r = -1; r < ROWS + 3; r++) {
          const srcIdx =
            ((Math.floor(r + scroll)) % TOTAL + TOTAL) % TOTAL;
          const bit = colBits[(c * 13 + srcIdx) % TOTAL];
          const px = c * cellW + cellW * 0.35;
          let py = r * cellH + cellH * 0.5 - (scroll % 1) * cellH;

          if (!inDiamond(px, py)) continue;
          let alpha = radialAlpha(px, py);
          if (alpha < 0.04) continue;

          let fSize = fontSize;
          let drawX = px;
          let drawY = py;

          if (
            animated &&
            mouseRef.current.x !== null &&
            mouseRef.current.inside
          ) {
            const dx = px - mouseRef.current.x!;
            const dy = py - mouseRef.current.y!;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const reach = R * 0.52;
            const infl = Math.max(0, 1 - dist / reach);
            const pull = infl * infl * infl;
            alpha = Math.min(1, alpha + pull * 0.85);
            fSize = fontSize * (1 + pull * 0.9);
            const pushDist = pull * 14;
            drawX = px + (dx / (dist + 0.001)) * -pushDist;
            drawY = py + (dy / (dist + 0.001)) * -pushDist;
          }

          ctx.globalAlpha = alpha;
          ctx.fillStyle = bit === "1" ? "#00ee55" : "#00ddff";
          ctx.font = `900 ${fSize.toFixed(1)}px monospace`;
          ctx.fillText(bit, drawX - fSize * 0.28, drawY + fSize * 0.36);
        }
      }

      ctx.globalAlpha = 1;

      // outer border
      ctx.beginPath();
      ctx.moveTo(CX, CY - (R - 1));
      ctx.lineTo(CX + (R - 1), CY);
      ctx.lineTo(CX, CY + (R - 1));
      ctx.lineTo(CX - (R - 1), CY);
      ctx.closePath();
      ctx.strokeStyle = "rgba(220,220,220,0.85)";
      ctx.lineWidth = W > 80 ? 2.5 : W > 30 ? 1.5 : 1;
      ctx.stroke();

      // inner border
      const i2 = W > 80 ? 7 : W > 30 ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(CX, CY - (R - i2));
      ctx.lineTo(CX + (R - i2), CY);
      ctx.lineTo(CX, CY + (R - i2));
      ctx.lineTo(CX - (R - i2), CY);
      ctx.closePath();
      ctx.strokeStyle = "rgba(200,200,200,0.3)";
      ctx.lineWidth = W > 80 ? 0.8 : 0.5;
      ctx.stroke();

      // dot cursor
      if (
        animated &&
        mouseRef.current.inside &&
        mouseRef.current.x !== null
      ) {
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x!, mouseRef.current.y!, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (animated) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    if (animated) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      draw(0);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [size, animated]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
    />
  );
}
