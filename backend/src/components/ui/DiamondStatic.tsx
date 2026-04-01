"use client";

import { useEffect, useRef } from "react";

interface DiamondStaticProps {
  size?: number;
}

export default function DiamondStatic({ size = 130 }: DiamondStaticProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const img = new Image();
    img.src = "/fs-bg.jpg";
    img.onload = () => draw(img);

    function draw(source: HTMLImageElement) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // clip to diamond
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(CX, CY - R);
      ctx.lineTo(CX + R, CY);
      ctx.lineTo(CX, CY + R);
      ctx.lineTo(CX - R, CY);
      ctx.closePath();
      ctx.clip();

      // background image — cover fit
      const scale = Math.max(W / source.naturalWidth, H / source.naturalHeight);
      const dw = source.naturalWidth * scale;
      const dh = source.naturalHeight * scale;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;
      ctx.drawImage(source, dx, dy, dw, dh);

      // dark overlay 65%
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, W, H);

      // FS cutthrough
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

      // inner border
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
    }
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
    />
  );
}
