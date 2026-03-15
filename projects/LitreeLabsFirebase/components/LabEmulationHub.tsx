'use client';

export function LabEmulationHub() {
  const items = [
    { title: "Retro library", detail: "NES / SNES / PS1 / N64 covers with holo glow." },
    { title: "Cloud saves", detail: "State sync across devices; premium storage tiers." },
    { title: "Streaming overlay", detail: "One-click Twitch/YouTube overlay with neon UI." },
    { title: "Challenges", detail: "Leaderboards + badges for retro runs; paid events." },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Emulation hub · gaming core</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-200">
          Retro + stream
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
        <span className="rounded-full bg-emerald-500/10 px-3 py-1">Premium emulation packs</span>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1">Streaming boost add-on</span>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1">Voice: “Launch X”</span>
      </div>
    </section>
  );
}
