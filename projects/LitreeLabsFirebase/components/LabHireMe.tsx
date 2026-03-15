'use client';

export function LabHireMe() {
  const googleBusinessUrl = process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_URL || "#";
  const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL || "#";
  const emailLink = process.env.NEXT_PUBLIC_CONTACT_EMAIL
    ? `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`
    : "#";

  return (
    <section id="hire-me" className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Work with me</p>
          <h3 className="text-xl font-semibold text-white">Google Business + direct booking</h3>
          <p className="text-sm text-slate-300 max-w-2xl">
            Need custom builds, overlays, or integrations? Tap a contact route—email, call, or schedule.
            Availability updates in real time; AI assistant can route the request.
          </p>
        </div>
        <div className="grid gap-2 text-right text-sm">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-200">
            Available now
          </span>
          <span className="text-slate-200">Detroit, MI · Remote worldwide</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-slate-200">
        <a
          href={googleBusinessUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:-translate-y-1 hover:border-emerald-300/60 hover:bg-emerald-500/10"
        >
          <p className="text-slate-100">View Google Business</p>
          <p className="text-xs text-emerald-300">Open profile</p>
        </a>
        <a
          href={calendarUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:-translate-y-1 hover:border-emerald-300/60 hover:bg-emerald-500/10"
        >
          <p className="text-slate-100">Schedule a call</p>
          <p className="text-xs text-emerald-300">Calendar</p>
        </a>
        <a
          href={emailLink}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:-translate-y-1 hover:border-emerald-300/60 hover:bg-emerald-500/10"
        >
          <p className="text-slate-100">Direct email</p>
          <p className="text-xs text-emerald-300">Send</p>
        </a>
      </div>

      <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        AI shortcut: “Reach out to the owner” → auto-opens contact form or schedules a call.
      </div>
    </section>
  );
}
