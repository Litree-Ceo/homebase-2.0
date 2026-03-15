'use client';

export function LabArchitecture() {
  const rows = [
    { title: "Auth", detail: "OAuth (Apple/Steam/Google/Spotify/etc.), email+MFA, RBAC (admin/mod/user)" },
    { title: "Payments", detail: "Stripe (cards, Apple/Google Pay), PayPal, Coinbase Commerce (BTC/ETH), webhooks → subs" },
    { title: "Data", detail: "Users, roles, sessions, subscriptions, marketplace listings, audits, bans, events" },
    { title: "Security", detail: "WAF/ratelimits, bot/captcha on risk, IP allowlist for admin, encryption at rest/in transit, audits" },
    { title: "AI", detail: "Assistant service (chat/voice), quick actions, premium tier, admin-only commands" },
    { title: "Media & Gaming", detail: "Integrations: Steam/Xbox/PS/Epic, Spotify/Apple Music, emulation endpoints, cloud gaming links" },
    { title: "Delivery", detail: "CDN, edge caching, animation intensity toggle, disable-animations fallback, global POPs" },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Architecture blueprint</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-slate-200">
          Backend + infra
        </span>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2 text-sm text-slate-200">
        {rows.map((row) => (
          <div key={row.title} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-slate-100 font-semibold">{row.title}</p>
            <p className="mt-2 text-slate-300">{row.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
