"use client";

import { useState } from "react";
import Link from "next/link";

interface Playbook {
  id: string;
  title: string;
  desc: string;
  category: "sales" | "content" | "growth" | "engagement";
  difficulty: "easy" | "medium" | "hard";
  timeToImplement: string;
}

export default function PlaybooksPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const playbooks: Playbook[] = [
    {
      id: "1",
      title: "Flash Sale – 24H Booking Surge",
      desc: "A proven 6-message sequence that triggers same-day appointments with time urgency tactics.",
      category: "sales",
      difficulty: "easy",
      timeToImplement: "15 min",
    },
    {
      id: "2",
      title: "Comeback Client Script",
      desc: "Bring old clients back with a DM that converts at 42% and uses nostalgia hooks.",
      category: "sales",
      difficulty: "easy",
      timeToImplement: "10 min",
    },
    {
      id: "3",
      title: "Instagram Growth Blitz",
      desc: "10-day content & DM plan for explosive growth. Post once daily + DM every new follower.",
      category: "growth",
      difficulty: "medium",
      timeToImplement: "30 min",
    },
    {
      id: "4",
      title: "Before/After Content Gold",
      desc: "Transform your portfolio into scroll-stopping before/afters that get 3x+ engagement.",
      category: "content",
      difficulty: "easy",
      timeToImplement: "20 min",
    },
    {
      id: "5",
      title: "Money Play: Upsell Sequence",
      desc: "Convert $49 clients to $299+ packages with a 3-message upsell framework.",
      category: "sales",
      difficulty: "hard",
      timeToImplement: "45 min",
    },
    {
      id: "6",
      title: "Engagement Raid Strategy",
      desc: "Comment on competitor posts, DM engagers, and build genuine relationships (no spam).",
      category: "engagement",
      difficulty: "medium",
      timeToImplement: "25 min",
    },
    {
      id: "7",
      title: "Referral Loop Activation",
      desc: "Build a self-sustaining referral system that brings 5-10 new clients per week.",
      category: "growth",
      difficulty: "hard",
      timeToImplement: "60 min",
    },
    {
      id: "8",
      title: "DM Automation Foundations",
      desc: "Set up smart DM responses for FAQs, pricing, and booking without touching your phone.",
      category: "engagement",
      difficulty: "medium",
      timeToImplement: "35 min",
    },
  ];

  const filtered =
    selectedCategory === "all"
      ? playbooks
      : playbooks.filter((p) => p.category === selectedCategory);

  const difficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const categoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "sales":
        return "bg-red-500/20 text-red-400";
      case "content":
        return "bg-blue-500/20 text-blue-400";
      case "growth":
        return "bg-green-500/20 text-green-400";
      case "engagement":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black mb-2">📚 Playbook Library</h1>
          <p className="text-gray-400">
            Battle-tested strategies from 2,800+ beauty professionals. Copy-paste and start winning today.
          </p>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2">
          {["all", "sales", "content", "growth", "engagement"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                selectedCategory === cat
                  ? "bg-[#ff006e] text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* PLAYBOOKS GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((playbook) => (
            <div
              key={playbook.id}
              className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#ff006e]/30 transition cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${categoryBadgeColor(playbook.category)}`}>
                  {playbook.category.charAt(0).toUpperCase() + playbook.category.slice(1)}
                </span>
                <span className={`text-xs font-bold ${difficultyColor(playbook.difficulty)}`}>
                  {playbook.difficulty.toUpperCase()}
                </span>
              </div>

              <h3 className="font-black text-lg mb-2 group-hover:text-[#ff006e] transition">{playbook.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{playbook.desc}</p>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500">⏱️ {playbook.timeToImplement}</p>
                <button className="px-3 py-1 rounded-full bg-[#ff006e]/20 text-[#ff006e] text-xs font-bold hover:bg-[#ff006e]/40 transition">
                  Use Now →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No playbooks found in this category.</p>
          </div>
        )}

        {/* BACK LINK */}
        <div className="text-center border-t border-white/10 pt-8">
          <Link href="/dashboard" className="text-[#ff006e] hover:text-[#ff006e]/80">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
