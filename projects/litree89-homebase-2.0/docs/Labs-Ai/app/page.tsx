import React from "react";
import LiveDemo from "../components/LiveDemo";
import LiveActivityFeed from "../components/LiveActivityFeed";

// Force the app router to render this page server-side on every request
// This bypasses Vercel edge HTML caching so we can validate the live change immediately
export const dynamic = "force-dynamic";

// Visible build timestamp to verify live deploy / CDN cache
const BUILD_TS = new Date().toISOString();

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10 space-y-16">
        {/* NAVBAR */}
        <header className="flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-slate-900 border border-emerald-500/50 flex items-center justify-center text-xs font-bold tracking-tight animate-glow">
              LL
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">LitLabs OS</p>
              <p className="text-xs text-slate-400">
                Money-making AI for beauty + service bosses.
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300">
            <a
              href="#features"
              className="hover:text-emerald-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-emerald-400 transition-colors"
            >
              Pricing
            </a>
            <a
              href="/marketplace"
              className="hover:text-emerald-400 transition-colors"
            >
              Marketplace
            </a>
            <a
              href="/earn"
              className="hover:text-emerald-400 transition-colors"
            >
              Earn
            </a>
            <a
              href="/leaderboard"
              className="hover:text-emerald-400 transition-colors"
            >
              Leaderboard
            </a>
            <a
              href="#how-it-works"
              className="hover:text-emerald-400 transition-colors"
            >
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:inline-flex flex-col text-right text-[11px]">
              <span className="text-slate-400">Build</span>
              <span className="text-slate-300 font-mono">{BUILD_TS}</span>
            </div>
            <a
              href="/auth"
              className="hidden md:inline-flex rounded-full border border-slate-700 px-4 py-1.5 text-[11px] hover:bg-slate-900 hover:border-emerald-500/50 transition-all"
            >
              Login
            </a>
            <a
              href="/dashboard"
              className="rounded-full bg-emerald-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
            >
              Open Dashboard
            </a>
            <a
              href="/earn"
              className="rounded-full border border-emerald-500/50 px-4 py-1.5 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              Start Earning
            </a>
          </div>
        </header>

        {/* HERO + CHAT PREVIEW */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
          {/* LEFT SIDE: COPY */}
          <div className="space-y-6 animate-slide-in">
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 animate-float">
              🔥 LitLabs OS is live – stop guessing, start stacking.
            </span>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              Your AI <span className="gradient-text">command center</span> that
              books clients, replies to DMs & catches fraud while you live life.
            </h1>

            <p className="max-w-xl text-sm md:text-base text-slate-300">
              LitLabs OS builds daily content, writes DMs that actually close,
              generates promos for slow days, and watches logins + payments from
              one clean dashboard. No tech brain, no problem.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/dashboard/billing"
                className="inline-block rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 transition-all"
              >
                Activate LitLabs →
              </a>
              <a
                href="#how-it-works"
                className="inline-block rounded-xl border border-slate-700 px-5 py-2 text-sm text-slate-100 hover:bg-slate-900 hover:border-emerald-500/50 transition-all"
              >
                Watch 2-min demo
              </a>
            </div>

            <LiveDemo />

            <ul className="grid gap-2 text-xs text-slate-300 md:grid-cols-2">
              <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                ✅ Daily content engine for IG/TikTok
              </li>
              <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                ✅ DM sales flows that sound human
              </li>
              <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                ✅ Promo generator for slow days
              </li>
              <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                ✅ Fraud guard + login watch
              </li>
            </ul>
          </div>

          {/* RIGHT SIDE: FAKE CHAT / DASHBOARD */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-emerald-500/20 glass animate-slide-in hover:shadow-emerald-500/40 transition-all">
            <p className="mb-2 text-xs font-medium text-slate-400">
              Live LitLabs OS preview
            </p>

            <div className="h-[320px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80">
              <div className="flex h-full flex-col">
                {/* header */}
                <div className="border-b border-slate-800 px-4 py-3 text-xs text-slate-300 flex items-center justify-between">
                  <span>Beauty Boss Control Panel</span>
                  <span className="text-[10px] text-emerald-300">
                    ● AI Online
                  </span>
                </div>

                {/* body */}
                <div className="flex-1 grid grid-cols-[1.4fr_1fr]">
                  {/* chat */}
                  <div className="border-r border-slate-800 px-3 py-3 space-y-2 text-[11px] overflow-y-auto">
                    <div className="text-[10px] text-slate-400 mb-1">
                      Chat feed
                    </div>

                    <div className="max-w-[90%] rounded-2xl bg-slate-800 px-3 py-2">
                      <p className="text-slate-200">
                        Yo, I&apos;m LitLabs. Tell me what you do and I&apos;ll
                        build a money plan around it.
                      </p>
                    </div>

                    <div className="ml-auto max-w-[90%] rounded-2xl bg-emerald-500 px-3 py-2">
                      <p className="text-slate-950">
                        I&apos;m a lash tech. I want more high-ticket clients,
                        not cheap walk-ins.
                      </p>
                    </div>

                    <div className="max-w-[90%] rounded-2xl bg-slate-800 px-3 py-2">
                      <p className="text-slate-200">
                        Bet. I&apos;ll write your posts, promos, and DMs, then
                        push your best leads to book this week.
                      </p>
                    </div>

                    <div className="max-w-[90%] rounded-2xl bg-slate-800 px-3 py-2">
                      <p className="text-slate-200">
                        I&apos;ll also flag weird logins + payments so you
                        don&apos;t get played.
                      </p>
                    </div>
                  </div>

                  {/* stats */}
                  <div className="px-3 py-3 space-y-3 border-l border-slate-900/80 bg-slate-950">
                    <div className="text-[10px] text-slate-400">
                      Today&apos;s Numbers
                    </div>
                    <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2">
                      <p className="text-[10px] text-slate-400">Leads</p>
                      <p className="text-lg font-semibold">23</p>
                      <p className="text-[10px] text-emerald-300">
                        +9 vs yesterday
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2">
                      <p className="text-[10px] text-slate-400">Bookings</p>
                      <p className="text-lg font-semibold">11</p>
                      <p className="text-[10px] text-emerald-300">
                        48% conversion
                      </p>
                    </div>
                    <div className="rounded-xl bg-red-950/50 border border-red-500/40 px-3 py-2">
                      <p className="text-[10px] text-red-300">Security</p>
                      <p className="text-xs text-red-100">
                        1 login from new device · 0 failed payments · 0 blocked
                        cards
                      </p>
                    </div>
                  </div>
                </div>

                {/* input */}
                <div className="border-t border-slate-800 px-3 py-2">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-2">
                    <input
                      type="text"
                      aria-label="Chat input"
                      className="h-8 flex-1 bg-transparent text-[11px] text-slate-100 outline-none placeholder:text-slate-500"
                      placeholder="Type what you want LitLabs to build or fix today..."
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-950"
                    >
                      Make me money
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              In the real app, this connects to your leads, bookings, and fraud
              logs inside your private dashboard.
            </p>
          </div>
        </section>
        {/* LIVE ACTIVITY FEED */}
        <section className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              See what's happening right now
            </h2>
            <p className="text-sm text-slate-400">
              Real creators making moves on LitLabs OS
            </p>
          </div>
          <LiveActivityFeed />
        </section>

        {/* FEATURES */}
        <section id="features" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Everything you need to dominate.
          </h2>
          <p className="text-sm text-slate-300">
            6 core superpowers so you don&apos;t need 10 different apps.
          </p>

          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <FeatureCard
              title="Daily Content Engine"
              body="Generate scroll-stopping posts, captions, and hashtags in 1 click so you stay visible without burning out."
            />
            <FeatureCard
              title="DM Sales Machine"
              body='Turn "Hey, how much?" messages into booked appointments with ready-made sales scripts.'
            />
            <FeatureCard
              title="Promo Generator"
              body="Create limited-time offers for slow days: bring-a-friend deals, flash sales, bundles and more."
            />
            <FeatureCard
              title="Fraud Guard"
              body="Watch logins, invoices, and payments. Get safe replies to scammers before they touch your money."
            />
            <FeatureCard
              title="Brand Voice"
              body="Train LitLabs to sound like you: tone, phrases, slang, and boundaries you won't cross."
            />
            <FeatureCard
              title="Live Dashboard"
              body="See leads, bookings, revenue and alerts from one screen instead of chasing screenshots and DMs."
            />
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Simple plans. Real leverage.
          </h2>
          <p className="text-sm text-slate-300">
            Start when you&apos;re ready. Upgrade only when LitLabs is obviously
            paying for itself.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <PricingCard
              label="Starter"
              price="$49/mo"
              highlight={false}
              items={[
                "Daily content engine",
                "DM reply scripts",
                "Promo generator",
                "Basic fraud checks",
                "Email support",
              ]}
            />
            <PricingCard
              label="⚡ Pro"
              price="$99/mo"
              highlight={true}
              items={[
                "Everything in Starter",
                "7-day content packs",
                "Brand voice training",
                "Client reactivation flows",
                "Priority support",
              ]}
            />
            <PricingCard
              label="Deluxe"
              price="$199/mo"
              highlight={false}
              items={[
                "Everything in Pro",
                "Holiday + launch templates",
                "Growth coaching sessions",
                "1-on-1 onboarding",
                "24/7 VIP support",
              ]}
            />
          </div>

          <p className="text-xs text-slate-400">
            ✨ All plans include a 14-day free trial. No contracts. Cancel
            anytime.
          </p>
        </section>

        {/* SOCIAL PROOF STATS */}
        <section className="rounded-3xl border border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 via-purple-900/20 to-pink-900/20 p-8 text-center space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Join Thousands of Creators Earning Daily
          </h2>
          <div className="grid gap-6 md:grid-cols-4 text-center">
            <div className="space-y-1 hover:scale-110 transition-transform">
              <p className="text-4xl font-bold text-emerald-400">12,450+</p>
              <p className="text-xs text-slate-400">Active Creators</p>
            </div>
            <div className="space-y-1 hover:scale-110 transition-transform">
              <p className="text-4xl font-bold text-purple-400">$2.4M+</p>
              <p className="text-xs text-slate-400">Earned This Month</p>
            </div>
            <div className="space-y-1 hover:scale-110 transition-transform">
              <p className="text-4xl font-bold text-cyan-400">890K+</p>
              <p className="text-xs text-slate-400">Content Generated</p>
            </div>
            <div className="space-y-1 hover:scale-110 transition-transform">
              <p className="text-4xl font-bold text-pink-400">4.9★</p>
              <p className="text-xs text-slate-400">Average Rating</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <a
              href="/leaderboard"
              className="text-xs text-emerald-400 hover:text-emerald-300 underline"
            >
              View Leaderboard →
            </a>
            <a
              href="/earn"
              className="text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Start Earning →
            </a>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-center">
            Real Results from Real Creators
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-xl">
                  👑
                </div>
                <div>
                  <p className="text-sm font-semibold">Sarah Chen</p>
                  <p className="text-xs text-slate-400">Nail Tech, LA</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                "Went from 2 clients/day to fully booked in 3 weeks. The DM bot
                handles everything while I focus on art."
              </p>
              <p className="text-xs text-emerald-400 font-semibold">
                +$4,200/month
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-xl">
                  💈
                </div>
                <div>
                  <p className="text-sm font-semibold">Marcus Johnson</p>
                  <p className="text-xs text-slate-400">Barber, Atlanta</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                "The content engine saved me 10 hours/week. Now I just post and
                stack bread. Game changer."
              </p>
              <p className="text-xs text-purple-400 font-semibold">
                +$6,890/month
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-cyan-500/50 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-xl">
                  ✨
                </div>
                <div>
                  <p className="text-sm font-semibold">Priya Patel</p>
                  <p className="text-xs text-slate-400">Lash Artist, Miami</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">
                "My station page brings in referrals on autopilot. I'm making
                money in my sleep now."
              </p>
              <p className="text-xs text-cyan-400 font-semibold">
                +$8,350/month
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            How LitLabs OS fits into your life.
          </h2>

          <div className="grid gap-4 md:grid-cols-3 text-xs text-slate-300">
            <StepCard
              step="1"
              title="Tell us about your world"
              body="Your niche, services, prices, city, and dream clients. LitLabs builds your base brain + playbooks from that."
            />
            <StepCard
              step="2"
              title="Connect your channels"
              body="Hook up your site, IG, or DMs. Drop 1 script and the bot starts handling leads in your tone."
            />
            <StepCard
              step="3"
              title="Watch the dashboard"
              body="See leads, bookings, and alerts in one place. Tweak prompts and offers without touching code."
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-800 pt-6 text-xs text-slate-500 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} LitLabs Business OS.</span>
            <div className="flex gap-4">
              <a href="#features" className="hover:text-slate-300">
                Features
              </a>
              <a href="#pricing" className="hover:text-slate-300">
                Pricing
              </a>
              <a href="#how-it-works" className="hover:text-slate-300">
                How it works
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

type FeatureProps = {
  title: string;
  body: string;
};

function FeatureCard({ title, body }: FeatureProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-emerald-500/50 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all duration-300 cursor-pointer">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="text-xs text-slate-300">{body}</p>
    </div>
  );
}

type PricingProps = {
  label: string;
  price: string;
  items: string[];
  highlight?: boolean;
};

function PricingCard({ label, price, items, highlight }: PricingProps) {
  return (
    <div
      className={`rounded-2xl p-4 space-y-3 transition-all duration-300 hover:scale-105 cursor-pointer ${
        highlight
          ? "border border-emerald-500 bg-slate-900/80 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 animate-glow"
          : "border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20"
      }`}
    >
      <p
        className={`text-xs font-semibold ${
          highlight ? "text-emerald-300" : "text-slate-300"
        }`}
      >
        {label}
      </p>
      <p className="text-2xl font-semibold">{price}</p>
      <ul className="space-y-2 text-xs text-slate-300">
        {items.map((item) => (
          <li key={item} className="hover:text-emerald-400 transition-colors">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type StepProps = {
  step: string;
  title: string;
  body: string;
};

function StepCard({ step, title, body }: StepProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-emerald-500/50 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all duration-300 cursor-pointer group">
      <p className="text-[10px] text-slate-400 mb-1 group-hover:text-emerald-400 transition-colors">
        Step {step}
      </p>
      <p className="text-sm font-semibold group-hover:text-emerald-300 transition-colors">
        {title}
      </p>
      <p className="text-xs text-slate-300">{body}</p>
    </div>
  );
}
