'use client';

import Link from "next/link";

export function LabHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 shadow-emerald-500/30 shadow-2xl">
      <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -right-16 top-12 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_20%_40%,rgba(34,211,238,0.18),transparent_40%)]" />

      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
        <div className="space-y-5">
          <p className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            Litree LabStudio · Full-spectrum control
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-white">
            Your holographic command center for games, music, media, AI, and cashflow.
          </h1>
          <p className="text-slate-300 max-w-3xl">
            Drag-and-drop everything. Launch cloud gaming, stream with neon overlays, sell themes,
            run AI assistants, and get paid—across web, iOS, and Android. Security stays admin-only,
            users just see the glow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#pricing"
              className="inline-flex items-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition hover:scale-[1.02] hover:bg-emerald-400"
            >
              Explore plans
            </Link>
            <Link
              href="#preview"
              className="inline-flex items-center rounded-xl border border-emerald-400/40 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/80 hover:bg-emerald-500/10"
            >
              Live mini preview
            </Link>
            <Link
              href="#hire-me"
              className="inline-flex items-center rounded-xl border border-cyan-400/40 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/80 hover:bg-cyan-500/10"
            >
              Hire me
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm text-slate-200">
            {[
              ["Any login", "Apple · Steam · Xbox · PlayStation · Google · Discord · Twitch"],
              ["Any payment", "Cards · Apple/Google Pay · PayPal · Crypto (BTC/ETH)"],
              ["Security", "Admin-only panel · MFA · IP allowlist · WAF · audits"],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.15em] text-emerald-300">{title}</p>
                <p className="mt-1 text-slate-300 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-full">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-black/60 p-4 shadow-[0_0_60px_rgba(16,185,129,0.25)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <p className="text-sm font-semibold text-white">Immersive preview</p>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                Autoplay + on-scroll
              </span>
            </div>
            <div className="mt-3 space-y-3 text-sm text-slate-200">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span>Drag & drop widgets</span>
                <span className="text-emerald-300">Live</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span>Theme builder (neon, holo, galaxy)</span>
                <span className="text-emerald-300">Live</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span>AI assistant orb (voice + chat)</span>
                <span className="text-emerald-300">Live</span>
              </div>
              <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-emerald-100">
                <p className="text-xs uppercase tracking-[0.2em]">Monetize everything</p>
                <p className="mt-1">Subs · marketplace commissions · add-ons · sponsored widgets · NFTs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
