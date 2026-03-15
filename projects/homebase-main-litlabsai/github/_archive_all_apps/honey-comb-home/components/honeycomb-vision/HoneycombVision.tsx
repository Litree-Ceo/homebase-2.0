'use client';

import { useEffect, useRef } from 'react';

interface HoneycombVisionProps {
  enabled?: boolean;
  intensity?: number;
  colorScheme?: string;
}

export default function HoneycombVision({ 
  enabled = true, 
  intensity = 1,
  colorScheme = 'black-purple-gold-yellow'
}: HoneycombVisionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;
    const hexSize = 30;
    const hexWidth = hexSize * 2;
    const hexHeight = Math.sqrt(3) * hexSize;

    const drawHex = (x: number, y: number, alpha: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + hexSize * Math.cos(angle);
        const hy = y + hexSize * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * intensity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      const cols = Math.ceil(canvas.width / (hexWidth * 0.75)) + 1;
      const rows = Math.ceil(canvas.height / hexHeight) + 1;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * hexWidth * 0.75;
          const y = row * hexHeight + (col % 2) * (hexHeight / 2);
          const alpha = 0.1 + Math.sin(time + col * 0.1 + row * 0.1) * 0.05;
          drawHex(x, y, Math.max(0, alpha));
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [enabled, intensity]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  );
}
