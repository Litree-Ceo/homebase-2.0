'use client';

const phases = [
  {
    title: "Phase 1 · Core",
    items: ["Backend (auth, RBAC, Stripe/Coinbase)", "DB schema for users/subs/marketplace/audits", "OAuth (Apple/Steam/Google/etc.)"],
  },
  {
    title: "Phase 2 · Security",
    items: ["MFA, IP allowlist, WAF/ratelimits", "Audit log ingestion + alerts", "Admin-only panel surface"],
  },
  {
    title: "Phase 3 · Dashboard",
    items: ["Drag/drop widgets, theme builder", "Live mini-preview, immersive mode", "AI assistant core + quick actions"],
  },
  {
    title: "Phase 4 · Advanced",
    items: ["Marketplace (themes/widgets)", "AI premium features", "Cloud sync + offline basics"],
  },
  {
    title: "Phase 5 · Monetize",
    items: ["Tiers + add-ons", "Sponsored widgets, affiliate", "NFT/VIP drops"],
  },
  {
    title: "Phase 6 · Community",
    items: ["Leaderboards, events, chat hub", "Gamification/badges", "Mobile apps (iOS/Android)"],
  },
];

export function LabRoadmap() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Development roadmap</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-200">
          Build order
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3 text-sm text-slate-200">
        {phases.map((phase) => (
          <div key={phase.title} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-slate-100 font-semibold">{phase.title}</p>
            <ul className="mt-2 space-y-1.5">
              {phase.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
