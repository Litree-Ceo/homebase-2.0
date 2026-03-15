"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface LeaderEntry {
  rank: number;
  name: string;
  avatar: string;
  earnings: number;
  referrals: number;
  contentCount: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [category, setCategory] = useState<"earnings" | "referrals" | "content">("earnings");

  useEffect(() => {
    loadLeaderboard();
  }, [category]);

  async function loadLeaderboard() {
    // Mock data - replace with real API call
    const mockData: LeaderEntry[] = [
      { rank: 1, name: "CreatorKing", avatar: "👑", earnings: 12450, referrals: 234, contentCount: 1890 },
      { rank: 2, name: "DesignQueen", avatar: "👸", earnings: 9823, referrals: 189, contentCount: 1456 },
      { rank: 3, name: "AIWizard", avatar: "🧙", earnings: 8901, referrals: 167, contentCount: 1234 },
      { rank: 4, name: "SocialGuru", avatar: "🚀", earnings: 7234, referrals: 145, contentCount: 1089 },
      { rank: 5, name: "ContentBoss", avatar: "💼", earnings: 6567, referrals: 123, contentCount: 987 },
      { rank: 6, name: "MarketingPro", avatar: "📈", earnings: 5890, referrals: 109, contentCount: 876 },
      { rank: 7, name: "VideoMaster", avatar: "🎬", earnings: 5234, referrals: 98, contentCount: 765 },
      { rank: 8, name: "MusicMogul", avatar: "🎵", earnings: 4789, referrals: 87, contentCount: 654 },
      { rank: 9, name: "BrandBuilder", avatar: "🏗️", earnings: 4123, referrals: 76, contentCount: 543 },
      { rank: 10, name: "InfluencerX", avatar: "⚡", earnings: 3890, referrals: 65, contentCount: 432 },
    ];
    setLeaderboard(mockData);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">🏆 Leaderboard</h1>
          <p className="text-slate-300">Top creators earning with LitLabs OS</p>
        </div>

        {/* Category Selector */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setCategory("earnings")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              category === "earnings"
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            💰 Top Earners
          </button>
          <button
            onClick={() => setCategory("referrals")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              category === "referrals"
                ? "bg-purple-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            👥 Top Referrers
          </button>
          <button
            onClick={() => setCategory("content")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              category === "content"
                ? "bg-cyan-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            ✨ Top Creators
          </button>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          {leaderboard.slice(0, 3).map((entry, idx) => (
            <div
              key={entry.rank}
              className={`rounded-xl border p-6 text-center ${
                idx === 0
                  ? "border-yellow-500 bg-yellow-900/20 transform scale-110"
                  : idx === 1
                  ? "border-slate-400 bg-slate-800/60"
                  : "border-orange-600 bg-orange-900/20"
              }`}
            >
              <div className="text-6xl mb-2">{entry.avatar}</div>
              <div className="text-3xl font-bold mb-1">#{entry.rank}</div>
              <div className="font-semibold mb-2">{entry.name}</div>
              <div className="text-2xl font-bold text-emerald-400">
                ${entry.earnings.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400 mt-1">
                {entry.referrals} referrals • {entry.contentCount} content
              </div>
            </div>
          ))}
        </div>

        {/* Rest of Leaderboard */}
        <div className="max-w-4xl mx-auto space-y-2">
          {leaderboard.slice(3).map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-500/50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-slate-400 w-8">#{entry.rank}</div>
                <div className="text-3xl">{entry.avatar}</div>
                <div>
                  <div className="font-semibold">{entry.name}</div>
                  <div className="text-sm text-slate-400">
                    {entry.referrals} referrals • {entry.contentCount} content
                  </div>
                </div>
              </div>
              <div className="text-xl font-bold text-emerald-400">
                ${entry.earnings.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Your Rank CTA */}
        <div className="max-w-4xl mx-auto rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Want to see your name here?</h2>
          <p className="text-slate-300 mb-4">
            Start creating content, refer friends, and climb the ranks
          </p>
          <button className="px-8 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 font-semibold transition text-lg">
            View My Stats →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
