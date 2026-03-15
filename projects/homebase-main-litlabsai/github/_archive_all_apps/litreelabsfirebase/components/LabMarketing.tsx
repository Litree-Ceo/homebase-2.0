'use client';

export function LabMarketing() {
  const channels = [
    { title: "Social + Creators", detail: "TikTok/IG Reels hero motion clips; Twitch/YouTube partners; Discord hub." },
    { title: "Campaigns", detail: "Waitlist + invite codes; design-to-earn contest; NFT/skin drops; VIP events." },
    { title: "Ads + Retarget", detail: "Short vertical ads showing drag/drop + AI orb + payment glow; retarget to Ultimate." },
    { title: "SEO + Content", detail: "Pages for custom gaming dashboard, AI streaming overlay, emulation hub; schema + FAQs." },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Marketing + launch plan</h3>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-emerald-200">
          Go-to-market
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-4 text-sm text-slate-200">
        {channels.map((ch) => (
          <div key={ch.title} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-slate-100 font-semibold">{ch.title}</p>
            <p className="mt-2 text-slate-300">{ch.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        Add live mini-dashboard on landing; CTA to join Discord; showcase top layouts + testimonials for social proof.
      </div>
    </section>
  );
}
