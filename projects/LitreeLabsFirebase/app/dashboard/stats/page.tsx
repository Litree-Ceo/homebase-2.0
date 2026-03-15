"use client";

import DashboardLayout from "../../../components/DashboardLayout";
import { AuthGate } from "../../../components/AuthGate";

function StatsInner() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <section className="space-y-2">
          <p className="text-xs text-white/50">Stats (sample)</p>
          <h1 className="text-xl sm:text-2xl font-semibold">
            See what LitLabs is doing for you.
          </h1>
          <p className="text-xs sm:text-sm text-white/70 max-w-xl">
            This page is ready for real data later. For now, treat it as your
            analytics cockpit: posts, promos, DMs, fraud checks, and growth
            patterns over time.
          </p>
        </section>

        {/* Top row: counters */}
        <section className="grid gap-4 md:grid-cols-4 text-xs sm:text-sm">
          <StatCardBig
            label="Total posts generated"
            value="184"
            sub="+32 this week"
          />
          <StatCardBig
            label="Total DM replies"
            value="96"
            sub="+19 this week"
          />
          <StatCardBig
            label="Promos created"
            value="41"
            sub="6 in last 7 days"
          />
          <StatCardBig
            label="Fraud checks run"
            value="12"
            sub="2 flagged as risky"
          />
        </section>

        {/* Middle row: fake graphs */}
        <section className="grid gap-4 lg:grid-cols-2 text-xs sm:text-sm">
          {/* Activity graph placeholder */}
          <div className="rounded-3xl border border-white/15 bg-black/80 p-4 sm:p-5 backdrop-blur space-y-3">
            <p className="text-xs font-semibold text-white/75 mb-1">
              Weekly activity (sample)
            </p>
            <p className="text-[11px] text-white/60">
              Later, you can wire this to Firestore usage data. For now, this is a
              visual placeholder showing posts + DMs + promos across the week.
            </p>
            <div className="mt-3 h-40 rounded-2xl border border-white/15 bg-[radial-gradient(circle_at_top,_#22c55e33,_transparent_55%),linear-gradient(90deg,#ffffff11_1px,transparent_1px),linear-gradient(180deg,#ffffff11_1px,transparent_1px)] bg-[size:100%_100%,40px_40px,40px_40px] relative overflow-hidden">
              <div className="absolute bottom-0 left-4 right-4 flex items-end gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, idx) => (
                    <div
                      key={day}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-4 rounded-t-full bg-gradient-to-t from-pink-500 to-sky-400"
                        style={{ height: `${40 + idx * 8}px` }}
                      />
                      <span className="text-[10px] text-white/60">{day}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Command split */}
          <div className="rounded-3xl border border-white/15 bg-black/80 p-4 sm:p-5 backdrop-blur space-y-3">
            <p className="text-xs font-semibold text-white/75 mb-1">
              Command usage breakdown (sample)
            </p>
            <p className="text-[11px] text-white/60">
              Which tools are carrying your growth? This shows a sample split.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
              <UsageRow label="/daily_post" percent={52} />
              <UsageRow label="/dm_reply" percent={23} />
              <UsageRow label="/promo" percent={17} />
              <UsageRow label="/fraud_check" percent={8} />
            </div>
            <p className="text-[11px] text-white/45 pt-1">
              Later, this can read real counts and calculate percentages.
            </p>
          </div>
        </section>

        {/* Bottom row: insights + next moves */}
        <section className="grid gap-4 lg:grid-cols-2 text-xs sm:text-sm">
          <div className="rounded-3xl border border-white/15 bg-black/80 p-4 sm:p-5 backdrop-blur space-y-3">
            <p className="text-xs font-semibold text-white/75 mb-1">
              Insights (example)
            </p>
            <ul className="space-y-2 text-[11px] text-white/75">
              <li>
                • Your <span className="font-mono">/daily_post</span> usage is
                strong — you&apos;re consistent. Keep that as your anchor.
              </li>
              <li>
                • <span className="font-mono">/promo</span> is underused
                compared to slow days. Try running it anytime your calendar
                looks light.
              </li>
              <li>
                • You&apos;re using <span className="font-mono">/fraud_check</span>{" "}
                a healthy amount — better safe than sorry with weird offers.
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-pink-500/70 bg-pink-500/10 p-4 sm:p-5 backdrop-blur space-y-3">
            <p className="text-xs font-semibold text-white/85 mb-1">
              Next steps for this week
            </p>
            <ul className="space-y-2 text-[11px] text-white/85">
              <li>
                • Commit to at least{" "}
                <span className="font-semibold">1 LitLabs-powered post per day</span>.
              </li>
              <li>
                • On any slow day by noon, run{" "}
                <span className="font-mono">/promo</span> and post the offer.
              </li>
              <li>
                • Use <span className="font-mono">/dm_reply</span> for every new
                &quot;how much?&quot; or &quot;are you available?&quot; DM.
              </li>
              <li>
                • Keep scanning anything that feels weird with{" "}
                <span className="font-mono">/fraud_check</span>.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default function StatsPage() {
  return (
    <AuthGate>
      <StatsInner />
    </AuthGate>
  );
}

/* Helper components */

function StatCardBig({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-black/80 p-4 backdrop-blur">
      <p className="text-[11px] text-white/55 mb-1">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-emerald-300 mt-1">{sub}</p>
    </div>
  );
}

function UsageRow({
  label,
  percent,
}: {
  label: string;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-white/80">{label}</span>
        <span className="text-white/60">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-sky-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
