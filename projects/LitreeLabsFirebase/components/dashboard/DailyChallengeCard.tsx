"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Flame, RefreshCw } from "lucide-react";

type Challenge = {
  id: string;
  title: string;
  steps: string[];
};

const CHALLENGES: Challenge[] = [
  {
    id: "dm5",
    title: "DM 5 past clients",
    steps: [
      "Pick 5 old clients or leads from your DMs.",
      "Send them a quick check-in using a comeback script.",
      "Offer a simple 'this week only' incentive.",
    ],
  },
  {
    id: "storyday",
    title: "Post 3 stories today",
    steps: [
      "Story 1: Show your setup or workspace.",
      "Story 2: Share 1 client transformation or testimonial.",
      "Story 3: Drop a simple CTA: 'DM me if you want this.'",
    ],
  },
  {
    id: "offer48",
    title: "48-hour soft promo",
    steps: [
      "Pick 1 service to push for the next 2 days.",
      "Announce a small bonus, not a huge discount.",
      "Post once on feed and twice on stories about it.",
    ],
  },
];

export function DailyChallengeCard() {
  const index = new Date().getDate() % CHALLENGES.length;
  const [challenge, setChallenge] = useState<Challenge>(CHALLENGES[index]);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
            <p className="text-xs text-[#ff0080] flex items-center gap-1 mb-1">
              <Flame size={13} /> Today&apos;s challenge
            </p>
          <h2 className="text-sm font-semibold mb-2">{challenge.title}</h2>
          <ul className="text-[11px] text-gray-200 space-y-1 mb-2 list-disc list-inside">
            {challenge.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="text-[11px] text-gray-400">
            Complete this today to feed your streak & XP.
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#ff0080]/30 to-[#ff8c00]/30 flex items-center justify-center border border-white/20">
            <Flame size={18} className="text-[#ff8c00]" />
          </div>
        </div>
      </div>
      <button
        className="mt-3 text-[11px] text-gray-300 flex items-center gap-1 hover:text-white transition-colors"
        type="button"
        onClick={() => {
          const idx =
            (CHALLENGES.findIndex((c) => c.id === challenge.id) + 1) %
            CHALLENGES.length;
          setChallenge(CHALLENGES[idx]);
        }}
      >
        <RefreshCw size={11} /> Show me another challenge
      </button>
    </Card>
  );
}
