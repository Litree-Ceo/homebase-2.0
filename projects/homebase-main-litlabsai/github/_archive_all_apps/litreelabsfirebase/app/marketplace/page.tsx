"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

const templates = [
  {
    id: 1,
    name: "Viral Hook Generator",
    description: "Generate attention-grabbing hooks that stop the scroll",
    price: 9.99,
    creator: "LitLabs",
    sales: 1247,
    rating: 4.9,
    category: "Content",
  },
  {
    id: 2,
    name: "Instagram Carousel Pack",
    description: "10 proven carousel templates for max engagement",
    price: 19.99,
    creator: "DesignPro",
    sales: 892,
    rating: 4.8,
    category: "Design",
  },
  {
    id: 3,
    name: "Email Sequence: Launch",
    description: "7-day product launch sequence with 40% avg conversion",
    price: 29.99,
    creator: "CopyMaster",
    sales: 623,
    rating: 5.0,
    category: "Marketing",
  },
  {
    id: 4,
    name: "Music Promo Bot",
    description: "Automate Spotify, YouTube, and SoundCloud promotion",
    price: 39.99,
    creator: "AudioKing",
    sales: 445,
    rating: 4.7,
    category: "Music",
  },
  {
    id: 5,
    name: "Thumbnail AI Pack",
    description: "Generate high-CTR YouTube thumbnails in seconds",
    price: 14.99,
    creator: "VideoGenius",
    sales: 1089,
    rating: 4.9,
    category: "Design",
  },
  {
    id: 6,
    name: "TikTok Growth Script",
    description: "Automated engagement + hashtag research for TikTok",
    price: 24.99,
    creator: "SocialHacker",
    sales: 756,
    rating: 4.6,
    category: "Social",
  },
];

export default function MarketplacePage() {
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Content", "Design", "Marketing", "Music", "Social"];
  const filtered = filter === "All" ? templates : templates.filter(t => t.category === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-slate-300">Buy templates, bots, and workflows created by the community</p>
        </div>

        {/* Sell Your Own CTA */}
        <div className="rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">💰 Become a Seller</h2>
              <p className="text-slate-300">
                List your templates, bots, and workflows. Earn 70% on every sale.
              </p>
            </div>
            <button className="px-6 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 font-semibold transition whitespace-nowrap">
              Start Selling →
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === cat
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 hover:border-emerald-500/50 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  {template.category}
                </div>
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  ⭐ {template.rating}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{template.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold">${template.price}</p>
                  <p className="text-xs text-slate-400">{template.sales} sales</p>
                </div>
                <p className="text-sm text-slate-400">by {template.creator}</p>
              </div>
              <button className="w-full px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 font-semibold transition">
                Purchase
              </button>
            </div>
          ))}
        </div>

        {/* Affiliate Program Promo */}
        <div className="rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 p-6">
          <h2 className="text-xl font-semibold mb-2">💸 Affiliate Program</h2>
          <p className="text-slate-300 mb-4">
            Promote marketplace items and earn 20% commission on every sale through your link.
          </p>
          <button className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 font-semibold transition">
            Get Affiliate Link
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
