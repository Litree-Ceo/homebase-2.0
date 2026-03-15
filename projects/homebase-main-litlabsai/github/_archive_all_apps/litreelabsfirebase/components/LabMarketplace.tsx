'use client';

export function LabMarketplace() {
  const cards = [
    { title: "Themes & Widgets", desc: "Sell/buy animated dashboards, overlays, widgets. Commission on every sale." },
    { title: "NFT Holographic Drops", desc: "Limited skins with proof-of-ownership; unlocks VIP visuals and badges." },
    { title: "Creator Tools", desc: "Package layouts, set pricing, offer bundles; auto-handle payouts." },
    { title: "Sponsored Slots", desc: "Featured placements for brands or partner widgets (crypto, news, fitness)." },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Marketplace (themes · widgets · NFTs)</h3>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-emerald-200">
          Revenue engine
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-4 text-sm text-slate-200">
        {cards.map((card) => (
          <div key={card.title} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-slate-100 font-semibold">{card.title}</p>
            <p className="mt-2 text-slate-300">{card.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        Commission model: marketplace % + upsells (featured placement, sponsor skins). AI assistant can suggest pricing.
      </div>
    </section>
  );
}
