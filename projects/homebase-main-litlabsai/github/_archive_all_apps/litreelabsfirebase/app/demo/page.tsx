"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<"dm" | "email" | "content">("dm");

  const demoData = {
    dm: {
      title: "🤖 DM Automation",
      description: "Watch your bot handle customer questions automatically",
      trigger: "Customer: Do you have sizes available?",
      response:
        "Yes! We carry XS, S, M, L, XL, XXL. Which size interests you? 👀",
      stats: "Handles 1,000+ DMs/month",
      color: "from-cyan-500 to-blue-500",
    },
    email: {
      title: "📧 Email Sequences",
      description: "Auto-triggered emails that build relationships",
      trigger: "Customer just upgraded to Pro",
      response:
        "🎉 Welcome to Pro! Here&apos;s your onboarding guide: [link]. Questions? Reply anytime!",
      stats: "68% open rate average",
      color: "from-pink-500 to-purple-500",
    },
    content: {
      title: "📱 Content Generation",
      description: "Generate daily posts in seconds, not hours",
      trigger: "Monday morning, posting time",
      response:
        '"Your Monday mood: 💪 Ready to crush it. Here&apos;s 3 ways to level up today..." [Generates 3 tips] #Goals #Monday',
      stats: "300+ variations/month",
      color: "from-orange-500 to-yellow-500",
    },
  };

  const demo = demoData[activeDemo];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute -top-40 -left-40 h-80 w-80 bg-pink-600/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 bg-cyan-600/40 rounded-full blur-3xl animate-pulse" />
      </div>

      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-24 relative z-10">
        {/* HERO */}
        <section className="text-center space-y-6 mb-20">
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            See the bot in action
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
              Live demos
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            3 minutes to see exactly how LitLabs automates your business
          </p>
        </section>

        {/* DEMO SELECTOR */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {(["dm", "email", "content"] as const).map((demo_type) => (
            <button
              key={demo_type}
              onClick={() => setActiveDemo(demo_type)}
              className={`p-4 rounded-xl border-2 transition text-left font-bold ${
                activeDemo === demo_type
                  ? "border-pink-500 bg-pink-500/10 text-white"
                  : "border-white/20 bg-white/5 text-white/60 hover:border-white/40"
              }`}
            >
              {demo_type === "dm" && "💬 DM Automation"}
              {demo_type === "email" && "📧 Email Sequences"}
              {demo_type === "content" && "📱 Content Generator"}
            </button>
          ))}
        </div>

        {/* LIVE DEMO */}
        <div className="space-y-6 mb-16">
          <div className="relative">
            <div className={`absolute -inset-4 bg-gradient-to-r ${demo.color} rounded-2xl blur-2xl opacity-40`} />
            <div className="relative border-2 border-white/20 rounded-2xl bg-gradient-to-b from-slate-950/80 to-black/80 backdrop-blur p-10 space-y-8">
              {/* Demo Title */}
              <div className="space-y-2">
                <h2 className="text-3xl font-black">{demo.title}</h2>
                <p className="text-white/70 text-lg">{demo.description}</p>
              </div>

              {/* Chat Bubble */}
              <div className="space-y-4">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-xs bg-blue-600 text-white rounded-3xl rounded-tr-md p-4">
                    <p className="text-sm">{demo.trigger}</p>
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex justify-start">
                  <div className="max-w-xs bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/50 text-white rounded-3xl rounded-tl-md p-4">
                    <p className="text-sm leading-relaxed">{demo.response}</p>
                    <p className="text-xs text-white/60 mt-2">⚡ Sent instantly</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="border-t border-white/10 pt-6">
                <p className="text-center text-white/60 text-sm">
                  <span className="text-pink-400 font-bold">{demo.stats}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE BREAKDOWN */}
        <section className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="space-y-6">
            <h3 className="text-2xl font-black">What This Saves You</h3>
            <ul className="space-y-4">
              {[
                "🕐 20+ hours/week of manual work",
                "💬 1,000+ manual DM responses",
                "📧 100+ email sequences",
                "📱 50+ content ideas & posts",
                "💰 Earn while you sleep",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">{item.split(" ")[0]}</span>
                  {item.split(" ").slice(1).join(" ")}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-black">Who&apos;s Using This</h3>
            <ul className="space-y-4">
              {[
                "💅 Lash technicians (3x more bookings)",
                "💇 Hair stylists (boost repeat clients)",
                "💄 Makeup artists (sell online)",
                "👗 E-commerce owners (increase AOV)",
                "🏢 Agencies (scale client services)",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg">
                  <span className="text-2xl">{item.split(" ")[0]}</span>
                  {item.split(" ").slice(1).join(" ")}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* VIDEO SECTION (Placeholder) */}
        <section className="mb-20 space-y-6">
          <h3 className="text-2xl font-black text-center">Watch the 60-Second Demo</h3>
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative border-2 border-white/20 rounded-2xl bg-gradient-to-b from-slate-950/80 to-black/80 backdrop-blur overflow-hidden h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎬</div>
                <p className="text-white/70">60-second demo video coming soon</p>
                <p className="text-sm text-white/50">Share this with your team</p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="mb-20 space-y-6">
          <h3 className="text-2xl font-black text-center">Before vs After</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-red-500/30 rounded-2xl bg-red-500/5 p-8 space-y-4">
              <p className="text-red-400 font-bold text-lg">❌ Without LitLabs</p>
              <ul className="space-y-2 text-sm">
                <li>⏰ Spend 5 hours daily on admin tasks</li>
                <li>😫 Respond to DMs manually (slow, exhausting)</li>
                <li>📝 Write the same emails over and over</li>
                <li>📉 Miss growth opportunities</li>
                <li>💸 Stuck at $5k-$10k/month</li>
              </ul>
            </div>

            <div className="border-2 border-green-500/30 rounded-2xl bg-green-500/5 p-8 space-y-4">
              <p className="text-green-400 font-bold text-lg">✅ With LitLabs</p>
              <ul className="space-y-2 text-sm">
                <li>⚡ Automate everything in minutes</li>
                <li>🤖 Bot replies to 100% of inquiries</li>
                <li>📧 Sequences nurture automatically</li>
                <li>📈 Scale to 10-50+ customers/week</li>
                <li>💰 Hit $5k-$15k/month in 90 days</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-20 space-y-6">
          <h3 className="text-2xl font-black text-center">Common Questions</h3>
          <div className="space-y-4">
            {[
              {
                q: "Is this hard to set up?",
                a: "No. Takes 15 minutes. We have 1-on-1 onboarding.",
              },
              {
                q: "Will customers know it&apos;s automated?",
                a: "No. The bot replies feel natural and human. But you can add a signature.",
              },
              {
                q: "What if I need custom templates?",
                a: "Included on Pro & Deluxe tiers. Plus, we have 100+ pre-made ones.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yep. No contracts. Cancel anytime. We&apos;ll miss you though! 😭",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="border border-white/10 rounded-lg p-6 hover:border-pink-500/50 transition"
              >
                <p className="font-bold text-lg mb-2">{item.q}</p>
                <p className="text-white/70">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 mb-12">
          <h2 className="text-3xl md:text-4xl font-black">
            Ready to automate like this?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition active:scale-95"
            >
              🚀 Start Free Trial
            </Link>
            <Link
              href="/#pricing"
              className="px-8 py-4 rounded-full border border-white/30 hover:border-white/60 text-white font-bold text-lg transition"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
