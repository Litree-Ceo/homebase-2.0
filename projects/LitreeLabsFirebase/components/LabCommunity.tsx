'use client';

export function LabCommunity() {
  const items = [
    { title: "Leaderboards", detail: "Top creators, layouts, retro runs, streaming overlays." },
    { title: "Events", detail: "Tournaments, music parties, limited drops, sponsor activations." },
    { title: "Chat hub", detail: "Channels for games, music, building; mod tools." },
    { title: "Gamification", detail: "Badges for customization, streaks, and event wins." },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Community · social layer</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-200">
          Engagement
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-4 text-sm text-slate-200">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-slate-100 font-semibold">{item.title}</p>
            <p className="mt-2 text-slate-300">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-emerald-200">
        <span className="rounded-full bg-emerald-500/10 px-3 py-1">Invite-only VIP circles</span>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1">Creator payouts</span>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1">Discord/Twitch sync</span>
      </div>
    </section>
  );
}
