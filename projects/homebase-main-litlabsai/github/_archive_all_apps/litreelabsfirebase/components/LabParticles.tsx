'use client';

import { useEffect, useMemo, useRef } from "react";
import { usePreferencesOptional } from "./PreferenceProvider";

interface Props {
  enabled?: boolean; // optional override
  intensity?: "low" | "medium" | "ultra"; // optional override
}

// Lightweight canvas particles respecting preference context when available
export function LabParticles({ enabled, intensity }: Props) {
  const prefs = usePreferencesOptional();
  const effectiveEnabled = enabled ?? prefs?.particles ?? true;
  const effectiveIntensity = intensity ?? prefs?.intensity ?? "medium";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const config = useMemo(() => {
    const level = effectiveIntensity;
    switch (level) {
      case "low":
        return { count: 20, speed: 0.2, size: 1.5 };
      case "ultra":
        return { count: 80, speed: 0.7, size: 2.5 };
      default:
        return { count: 40, speed: 0.4, size: 2 };
    }
  }, [effectiveIntensity]);

  useEffect(() => {
    if (!effectiveEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;
    const particles: Array<{ x: number; y: number; vx: number; vy: number; s: number }> = [];

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < config.count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        s: config.size * (0.5 + Math.random()),
      });
    }

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(16, 185, 129, 0.45)";
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fill();
      });
      animationId = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [config, effectiveEnabled]);

  if (!effectiveEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen opacity-60"
      aria-hidden
    />
  );
}
