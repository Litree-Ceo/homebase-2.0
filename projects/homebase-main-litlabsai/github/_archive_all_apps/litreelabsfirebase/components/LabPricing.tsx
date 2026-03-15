'use client';

const tiers = [
  {
    name: "Starter",
    price: "$5",
    desc: "Basic access, ads on, games+music widgets, 1GB storage.",
    perks: ["Drag/drop basics", "Live preview", "Ads allowed", "Email support"],
    glow: "from-emerald-500/20 to-cyan-500/20",
  },
  {
    name: "Standard",
    price: "$15",
    desc: "Full dashboard (games/music/photos), no ads, 10GB storage.",
    perks: ["Theme builder", "AI assistant (core)", "No ads", "Priority queue"],
    glow: "from-cyan-500/20 to-blue-500/20",
  },
  {
    name: "Pro",
    price: "$50",
    desc: "Animated backgrounds, unlimited integrations, AI recs, 100GB.",
    perks: ["Animated themes", "AI premium commands", "Overlays", "100GB storage"],
    glow: "from-blue-500/25 to-purple-500/25",
  },
  {
    name: "Elite",
    price: "$100",
    desc: "VIP themes, early access, sync everywhere, VIP support.",
    perks: ["Exclusive holo themes", "Early feature access", "VIP support", "Multi-device sync"],
    glow: "from-purple-500/25 to-pink-500/25",
  },
  {
    name: "Ultimate Creator",
    price: "$200",
    desc: "Everything unlocked + monetize your own layouts and themes.",
    perks: ["Sell themes/widgets", "Streaming boost", "AI concierge", "Unlimited storage"],
    glow: "from-pink-500/25 to-amber-500/25",
    badge: "Most power",
  },
];

export function LabPricing() {
  return (
    <section id="pricing" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Pricing built to scale you</h2>
        <span className="text-xs text-emerald-300 uppercase tracking-[0.2em]">Monthly · Yearly</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="relative rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(16,185,129,0.12)]"
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tier.glow} opacity-20 pointer-events-none`} />
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-white">{tier.name}</p>
                {tier.badge && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-200">
                    {tier.badge}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-emerald-300">{tier.price}</p>
              <p className="text-sm text-slate-300">{tier.desc}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-slate-100">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/80 hover:bg-emerald-500/20">
                Choose {tier.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
