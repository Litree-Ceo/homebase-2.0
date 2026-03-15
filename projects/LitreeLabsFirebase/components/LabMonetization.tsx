'use client';

const streams = [
  { name: "Subscriptions", items: ["$5→$200 tiers", "Yearly toggle", "Auto-downgrade on fail"] },
  { name: "Marketplace", items: ["Sell themes/widgets", "Commission on sales", "NFT drops"] },
  { name: "Add-ons", items: ["Storage boosts", "Streaming boost", "Premium AI commands"] },
  { name: "Sponsored", items: ["Widgets: crypto, news, fitness", "Branded themes", "Event takeovers"] },
  { name: "Affiliate", items: ["Gaming store links", "Hardware partners", "Overlay packs"] },
  { name: "VIP Events", items: ["Paid tournaments", "Listening parties", "Creator collabs"] },
];

export function LabMonetization() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Monetization grid (cash grab mode)</h3>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-emerald-200">
          Multi-stream
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3 text-sm text-slate-200">
        {streams.map((stream) => (
          <div key={stream.name} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-slate-100 font-semibold">{stream.name}</p>
            <ul className="mt-2 space-y-1.5">
              {stream.items.map((item) => (
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
