"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<
    "general" | "pricing" | "technical" | "support"
  >("general");

  const faqs = {
    general: [
      {
        q: "What is LitLabs?",
        a: "LitLabs is an AI business automation OS for beauty professionals, e-commerce, and agencies. It automates DMs, generates content, manages emails, and handles customer support—all in one dashboard.",
      },
      {
        q: "Who should use LitLabs?",
        a: "Lash techs, nail artists, hair stylists, makeup artists, estheticians, solopreneurs, and agencies. Basically anyone with customers on Instagram, TikTok, WhatsApp, or email.",
      },
      {
        q: "How much time can I save?",
        a: "Most users save 10-20 hours per week. You spend 5 hours setting up automation, then the bot works 24/7 forever.",
      },
      {
        q: "Can I really automate customer service?",
        a: "Yes. The bot learns your voice and handles 80-90% of common questions automatically. Urgent issues escalate to you.",
      },
      {
        q: "Will it feel like spam to my customers?",
        a: "No. The bot&apos;s replies are personalized and feel natural. Customers often don&apos;t even realize it&apos;s automated.",
      },
      {
        q: "What if something goes wrong?",
        a: "The bot has safeguards. It won't send inappropriate replies, damage your brand, or upset customers. Plus you can edit/approve replies before sending.",
      },
    ],
    pricing: [
      {
        q: "How much does it cost?",
        a: "Free ($0), Freemium ($19/mo), Starter ($49/mo), Pro ($99/mo), and Deluxe ($199/mo). Pick what you need.",
      },
      {
        q: "What's included in each tier?",
        a: "Free: 50 AI generations/month. Freemium: 300/month. Starter: Unlimited + basic automation. Pro: Everything + advanced features. Deluxe: Everything + 1-on-1 coaching.",
      },
      {
        q: "Is there a setup fee?",
        a: "Nope. No setup fees, no hidden charges, no contracts. Just pay for the plan.",
      },
      {
        q: "Can I upgrade or downgrade anytime?",
        a: "Yes. Change your plan whenever you want. Downgrade, upgrade, cancel—all instant.",
      },
      {
        q: "Do you offer annual discounts?",
        a: "Yes. Pay yearly and get 20% off. So Pro ($99/mo) becomes $79/mo when paid annually.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes. 14 days free. No card required. Upgrade anytime if you love it.",
      },
      {
        q: "What if I don&apos;t like it?",
        a: "30-day money-back guarantee. No questions asked. We want you to succeed, not force you.",
      },
    ],
    technical: [
      {
        q: "How do I connect my Instagram/TikTok?",
        a: "Through our secure OAuth integration. Click &apos;Connect,&apos; authorize LitLabs, and you&apos;re done. Your login stays private.",
      },
      {
        q: "Is my data secure?",
        a: "Yes. We use enterprise-grade encryption, Firestore security rules, and comply with GDPR/CCPA. Your data never leaves our servers.",
      },
      {
        q: "Can I export my data?",
        a: "Yes. You can export conversations, analytics, and content at any time. Your data is yours.",
      },
      {
        q: "What languages does LitLabs support?",
        a: "English primary, with Spanish, French, and German support. More coming soon.",
      },
      {
        q: "Does it work on mobile?",
        a: "Yes. Full mobile app experience. Check your DMs, respond, view analytics—all on your phone.",
      },
      {
        q: "Can I use it on multiple accounts?",
        a: "Yes. Connect as many accounts as you want (Instagram, TikTok, Pinterest, etc.).",
      },
      {
        q: "How many automations can I create?",
        a: "Unlimited on Pro & Deluxe. Starter gets 50. Freemium gets 20. Free gets 5.",
      },
    ],
    support: [
      {
        q: "How do I get help?",
        a: "Email us anytime. Free/Freemium: 24-hr response. Starter: 12-hr. Pro: 4-hr. Deluxe: 1-hr priority.",
      },
      {
        q: "Do you offer onboarding?",
        a: "Free tier: Self-serve guide. Pro: Group onboarding. Deluxe: 1-on-1 setup with a specialist.",
      },
      {
        q: "Can you create custom automations for me?",
        a: "Yes. On Pro & Deluxe tiers. We'll build exactly what you need.",
      },
      {
        q: "Is there a community?",
        a: "Yes. Join 2k+ beauty pros in our Slack community. Share ideas, ask questions, get tips.",
      },
      {
        q: "Can I get a refund?",
        a: "Yes. 30-day money-back guarantee if unused. 7-day for monthly, 14-day for annual plans.",
      },
      {
        q: "What if I have a feature request?",
        a: "Tell us! We build based on user feedback. Fill out a feature request in your dashboard.",
      },
    ],
  };

  const categories = {
    general: "General",
    pricing: "Pricing & Billing",
    technical: "Technical",
    support: "Support & Onboarding",
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute -top-40 -left-40 h-80 w-80 bg-pink-600/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 bg-cyan-600/40 rounded-full blur-3xl animate-pulse" />
      </div>

      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-24 relative z-10">
        {/* HERO */}
        <section className="text-center space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Questions?
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
              We&apos;ve got answers.
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Everything you need to know about LitLabs
          </p>
        </section>

        {/* CATEGORY TABS */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {(["general", "pricing", "technical", "support"] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  activeCategory === cat
                    ? "bg-pink-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {categories[cat]}
              </button>
            )
          )}
        </div>

        {/* FAQ LIST */}
        <div className="space-y-4 mb-20">
          {faqs[activeCategory].map((item, i) => (
            <div
              key={i}
              className="border border-white/10 rounded-2xl p-6 hover:border-pink-500/50 hover:bg-white/5 transition group"
            >
              <p className="font-bold text-lg mb-3 group-hover:text-pink-400 transition">
                {item.q}
              </p>
              <p className="text-white/70 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        {/* CONTACT SECTION */}
        <section className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-600/30 to-purple-600/30 rounded-2xl blur-2xl opacity-40" />
          <div className="relative border-2 border-white/20 rounded-2xl bg-gradient-to-b from-slate-950/80 to-black/80 backdrop-blur p-12 space-y-6 text-center">
            <h2 className="text-2xl font-black">Still have questions?</h2>
            <p className="text-white/70 text-lg">
              We&apos;re here to help. Reach out anytime.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:hello@litlabs.io"
                className="px-6 py-3 rounded-full bg-pink-500 hover:bg-pink-400 text-white font-bold transition"
              >
                📧 Email Us
              </a>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-full border border-white/30 hover:border-white/60 text-white font-bold transition"
              >
                💬 Start Chat
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 mt-20">
          <h2 className="text-3xl font-black">Ready to automate?</h2>
          <Link
            href="/dashboard"
            className="inline-flex px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition active:scale-95"
          >
            🚀 Start Free Trial
          </Link>
        </section>
      </main>
    </div>
  );
}
