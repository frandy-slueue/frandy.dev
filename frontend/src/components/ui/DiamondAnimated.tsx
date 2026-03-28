"use client";

import { useEffect, useRef, useState } from "react";

interface DiamondAnimatedProps {
  size?: number;
  interactive?: boolean;
}

export default function DiamondAnimated({
  size = 130,
  interactive = false,
}: DiamondAnimatedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

    // Set up video
    const video = document.createElement("video");
    video.src = "/fs-bg.mp4";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.play().catch(() => {});
    videoRef.current = video;

    function inDiamond(px: number, py: number) {
      return Math.abs(px - CX) / R + Math.abs(py - CY) / R <= 1;
    }

    if (interactive) {
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

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CX, CY - R);
      ctx.lineTo(CX + R, CY);
      ctx.lineTo(CX, CY + R);
      ctx.lineTo(CX - R, CY);
      ctx.closePath();
      ctx.clip();

      if (video.readyState >= 2) {
        const scale = Math.max(W / (video.videoWidth || 426), H / (video.videoHeight || 240));
        const dw = (video.videoWidth || 426) * scale;
        const dh = (video.videoHeight || 240) * scale;
        const dx = (W - dw) / 2;
        const dy = (H - dh) / 2;
        ctx.drawImage(video, dx, dy, dw, dh);
      } else {
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, W, H);
      }

      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "destination-out";
      const fontSize = W * 0.38;
      ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillText("FS", CX + W * 0.02, CY + H * 0.04);
      ctx.globalCompositeOperation = "source-over";

      ctx.restore();

      // outer border
      ctx.beginPath();
      ctx.moveTo(CX, CY - R);
      ctx.lineTo(CX + R, CY);
      ctx.lineTo(CX, CY + R);
      ctx.lineTo(CX - R, CY);
      ctx.closePath();
      ctx.strokeStyle = "rgba(220,220,220,0.85)";
      ctx.lineWidth = W > 80 ? 2 : 1.5;
      ctx.stroke();

      const i2 = W > 80 ? 6 : 4;
      ctx.beginPath();
      ctx.moveTo(CX, CY - (R - i2));
      ctx.lineTo(CX + (R - i2), CY);
      ctx.lineTo(CX, CY + (R - i2));
      ctx.lineTo(CX - (R - i2), CY);
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // dot cursor
      if (interactive && mouseRef.current.inside && mouseRef.current.x !== null) {
        ctx.beginPath();
        ctx.arc(mouseRef.current.x!, mouseRef.current.y!, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      video.pause();
    };
  }, [size, interactive]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
    />
  );
}
