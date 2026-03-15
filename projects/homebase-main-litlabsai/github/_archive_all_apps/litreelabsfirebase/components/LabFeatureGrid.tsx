'use client';

const featureGroups = [
  {
    title: "Customization & UX",
    items: [
      "Drag/drop widgets · resize · transparency · rotation",
      "Animated themes: neon grids, galaxy, cyberpunk city",
      "Immersive mode with particles and sound cues",
      "Save/share layouts; marketplace-ready templates",
    ],
  },
  {
    title: "Gaming & Streaming",
    items: [
      "Steam/Xbox/PlayStation/Epic connections",
      "Cloud gaming entrypoints (GeForce NOW / Xbox Cloud)",
      "Emulation hub for retro titles with cloud save states",
      "Twitch/YouTube overlays + live activity feed",
    ],
  },
  {
    title: "Music & Media",
    items: [
      "Spotify/Apple Music playlists with AI recommendations",
      "Visualizer + mood-based mixes",
      "Photo gallery with AI tagging & slideshow + music sync",
      "Media locker with cloud storage upgrades",
    ],
  },
  {
    title: "AI & Automation",
    items: [
      "AI assistant orb (voice/chat) with quick actions",
      "Premium AI: voice personalization, advanced commands",
      "AI layout suggestions and smart presets",
      "Bot manager to enforce subs, fraud rules, and alerts",
    ],
  },
  {
    title: "Security & Admin",
    items: [
      "Admin-only panel · MFA · IP allowlist · WAF · rate limits",
      "Audit logs, ban/kick, force logout, session monitor",
      "Hidden security dashboard with real-time alerts",
      "Encryption at rest + in transit; bot/captcha on risk",
    ],
  },
  {
    title: "Monetization",
    items: [
      "Subs ($5→$200), add-ons, marketplace commissions",
      "Sponsored widgets (crypto/news/fitness) + affiliate gaming",
      "NFT/VIP holographic themes; paid AI upgrades",
      "VIP events, premium overlays, streaming boost",
    ],
  },
];

export function LabFeatureGrid() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Maxed-out feature stack</h2>
        <span className="text-xs text-emerald-300 uppercase tracking-[0.2em]">Built to flex</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {featureGroups.map((group) => (
          <div
            key={group.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_0_30px_rgba(16,185,129,0.08)]"
          >
            <p className="text-sm uppercase tracking-[0.18em] text-emerald-300">{group.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2">
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
