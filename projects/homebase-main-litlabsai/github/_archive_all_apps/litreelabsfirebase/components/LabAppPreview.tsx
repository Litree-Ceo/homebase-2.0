'use client';

export function LabAppPreview() {
  const widgets = [
    { title: "Game Hub", detail: "Steam · Xbox · PS · Cloud gaming", accent: "bg-emerald-400/30" },
    { title: "Music Universe", detail: "Spotify · Apple · Visualizer", accent: "bg-cyan-400/30" },
    { title: "Photos AI", detail: "AI tagging · Slideshow + music", accent: "bg-blue-400/30" },
    { title: "Marketplace", detail: "Themes · Widgets · NFT drops", accent: "bg-purple-400/30" },
    { title: "AI Assistant", detail: "Voice + chat quick actions", accent: "bg-pink-400/30" },
    { title: "Security", detail: "Admin-only · WAF · MFA · audits", accent: "bg-amber-400/30" },
  ];

  return (
    <section id="preview" className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Live mini-dashboard preview (teaser)</h3>
        <span className="text-xs text-emerald-300 uppercase tracking-[0.2em]">Interactive soon</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {widgets.map((widget) => (
          <div
            key={widget.title}
            className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:border-emerald-300/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-slate-100 font-semibold">{widget.title}</p>
              <span className={`h-2 w-2 rounded-full ${widget.accent}`} />
            </div>
            <p className="mt-2 text-sm text-slate-300">{widget.detail}</p>
            <div className="mt-3 h-1 w-full rounded-full bg-white/10">
              <div className="h-1 w-2/3 rounded-full bg-emerald-400/80 group-hover:w-full group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
