"use client";

import { Card } from "@/components/ui/Card";
import { Gamepad2, ArrowRight } from "lucide-react";
import Link from "next/link";

export function FunArcadeBanner() {
  return (
    <Card className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-xs text-[#40e0d0] flex items-center gap-1 mb-1">
          <Gamepad2 size={13} /> LitLabs Arcade
        </p>
        <h2 className="text-lg font-semibold mb-2">
          Make your business feel like a game you&apos;re winning.
        </h2>
        <p className="text-xs text-gray-300 max-w-md mb-3">
          XP, streaks, daily challenges, money plays and future maps. Godmode
          isn&apos;t just a price tier – it&apos;s how you run your whole
          operation.
        </p>
        <Link
          href="/dashboard/learn"
          className="inline-flex items-center gap-2 text-[11px] text-[#40e0d0] hover:text-[#ff0080] transition-colors font-semibold"
        >
          See how to use it <ArrowRight size={12} />
        </Link>
      </div>

      <div className="relative w-40 h-24 md:w-52 md:h-32 rounded-2xl overflow-hidden border border-white/15 flex-shrink-0">
        <div className="w-full h-full bg-gradient-to-br from-[#00d4ff]/20 via-[#ff0080]/10 to-[#ff8c00]/20 flex items-center justify-center">
          <Gamepad2 size={48} className="text-[#40e0d0]/40" />
        </div>
      </div>
    </Card>
  );
}
