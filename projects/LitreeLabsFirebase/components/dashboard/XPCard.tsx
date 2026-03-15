"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Sparkles } from "lucide-react";

type Props = {
  level?: number;
  xp?: number; // 0–100
  streakDays?: number;
};

export function XPCard({ level = 3, xp = 45, streakDays = 4 }: Props) {
  const [animatedXP, setAnimatedXP] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedXP(xp), 200);
    return () => clearTimeout(timeout);
  }, [xp]);

  const tierLabel =
    level < 2
      ? "Warming up"
      : level < 3
        ? "Taking action"
        : level < 5
          ? "Hustler in motion"
          : "Godmode operator";

  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs text-[#40e0d0] flex items-center gap-1 mb-1">
            <Sparkles size={13} /> LitLabs XP
          </p>
          <h2 className="text-sm font-semibold mb-1">
            Level {level} · {tierLabel}
          </h2>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-1">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] via-[#ff0080] to-[#40e0d0] transition-all duration-700"
              style={{ width: `${animatedXP}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-300">
            {animatedXP}% to next level · {streakDays}-day streak 🔥
          </p>
        </div>
        <div className="relative h-12 w-12 rounded-full overflow-hidden border border-white/20 shadow-[0_0_20px_rgba(158,115,255,0.6)] flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-br from-[#00d4ff]/30 to-[#ff0080]/30 flex items-center justify-center">
            <Sparkles size={20} className="text-[#40e0d0]" />
          </div>
        </div>
      </div>
    </Card>
  );
}
