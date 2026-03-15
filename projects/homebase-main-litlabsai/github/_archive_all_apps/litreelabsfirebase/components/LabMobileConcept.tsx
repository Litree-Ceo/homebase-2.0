'use client';

export function LabMobileConcept() {
  const bullets = [
    "Swipe navigation for widgets and tabs",
    "Push alerts: drops, events, fraud notices, subs",
    "Voice-first AI assistant; mic-friendly overlays",
    "Offline basics: saved layouts, media lists",
    "Payment sheet optimized for wallets + biometrics",
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Mobile apps · iOS + Android</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-200">
          Mobile-first
        </span>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <p className="text-slate-100 font-semibold">Layout</p>
          <ul className="mt-2 space-y-1.5">
            <li>Condensed widget grid with swipe carousels</li>
            <li>Bottom nav: Dashboard · Marketplace · Community · Profile</li>
            <li>Floating AI orb; long-press for commands</li>
          </ul>
          <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-emerald-100">
            Same neon/holo aesthetic; adaptive for OLED, haptics on interactions.
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4 text-sm text-slate-200">
          <p className="text-slate-100 font-semibold">Key capabilities</p>
          <ul className="mt-2 space-y-1.5">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
