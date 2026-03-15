'use client';

export function LabAIAssistantUI() {
  const actions = [
    "Change theme to neon grid",
    "Recommend tonight's games + playlists",
    "Upgrade plan to Pro via voice",
    "Start stream with overlay",
    "Suspend suspicious session (admin)",
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">AI assistant interface</h3>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-emerald-200">
          Voice + chat
        </span>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <p className="text-slate-100 font-semibold">Orb UI</p>
          <p className="mt-2 text-sm text-slate-300">
            Pulsating neon orb with waveform, quick action chips, and premium voice personalization.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {actions.map((action) => (
              <div
                key={action}
                className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100"
              >
                {action}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <p className="text-slate-100 font-semibold">Assistant tiers</p>
          <ul className="mt-2 space-y-1.5">
            <li>Core: chat + voice trigger, navigation, basic recs.</li>
            <li>Premium: voice personalization, advanced commands, payments via voice.</li>
            <li>Admin link: hidden commands for bans, session control, fraud alerts.</li>
          </ul>
          <div className="mt-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-emerald-100">
            Landing teaser: floating orb with “Ask me anything” and autoplay animation.
          </div>
        </div>
      </div>
    </section>
  );
}
