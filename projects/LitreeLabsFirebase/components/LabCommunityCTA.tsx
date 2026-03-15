'use client';

export function LabCommunityCTA() {
  const discordLink = process.env.NEXT_PUBLIC_DISCORD_INVITE || "#";
  const twitchLink = process.env.NEXT_PUBLIC_TWITCH_CHANNEL || "#";
  const youtubeLink = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL || "#";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Join the hub</p>
          <h3 className="text-xl font-semibold text-white">Discord / Twitch / YouTube</h3>
          <p className="text-sm text-slate-300">
            Show live invites and hero clips. Add your real invite URLs when ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <a
            href={discordLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-emerald-200 transition hover:border-emerald-300/70 hover:bg-emerald-500/20"
          >
            Discord
          </a>
          <a
            href={twitchLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-emerald-200 transition hover:border-emerald-300/70 hover:bg-emerald-500/20"
          >
            Twitch
          </a>
          <a
            href={youtubeLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-emerald-200 transition hover:border-emerald-300/70 hover:bg-emerald-500/20"
          >
            YouTube
          </a>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-slate-200">
        {[
          "Show invite-only VIP circles",
          "Surface top creator clips on landing",
          "Promote events/tournaments with countdown",
        ].map((item) => (
          <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
