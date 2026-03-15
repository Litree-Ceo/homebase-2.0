"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function EarnPage() {

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">💰 Earn Money</h1>
          <p className="text-slate-300">Multiple ways to monetize your creativity</p>
        </div>

        {/* Earning Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Referral Program */}
          <div className="rounded-xl border border-emerald-500/50 bg-slate-900/60 p-6">
            <div className="text-4xl mb-3">👥</div>
            <h2 className="text-2xl font-bold mb-2">Referral Program</h2>
            <p className="text-slate-300 mb-4">
              Earn <span className="text-emerald-400 font-bold">$5</span> for every free signup and{" "}
              <span className="text-emerald-400 font-bold">20%</span> recurring commission on paid plans
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-400">✓</span>
                <span>Free signup = $5 instant</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-400">✓</span>
                <span>Starter ($19) = $3.80/month recurring</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-400">✓</span>
                <span>Pro ($49) = $9.80/month recurring</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-400">✓</span>
                <span>Deluxe ($99) = $19.80/month recurring</span>
              </div>
            </div>
            <button className="mt-4 w-full px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold transition">
              Get Your Link
            </button>
          </div>

          {/* Marketplace Seller */}
          <div className="rounded-xl border border-purple-500/50 bg-slate-900/60 p-6">
            <div className="text-4xl mb-3">🛍️</div>
            <h2 className="text-2xl font-bold mb-2">Sell Templates</h2>
            <p className="text-slate-300 mb-4">
              List your templates, bots, and workflows. Keep{" "}
              <span className="text-purple-400 font-bold">70%</span> of every sale
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-400">✓</span>
                <span>Set your own prices ($5-$500)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-400">✓</span>
                <span>Automatic payment processing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-400">✓</span>
                <span>Built-in analytics & reviews</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-400">✓</span>
                <span>Weekly payouts via Stripe</span>
              </div>
            </div>
            <button className="mt-4 w-full px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 font-semibold transition">
              Start Selling
            </button>
          </div>

          {/* Affiliate Marketing */}
          <div className="rounded-xl border border-cyan-500/50 bg-slate-900/60 p-6">
            <div className="text-4xl mb-3">💸</div>
            <h2 className="text-2xl font-bold mb-2">Affiliate Sales</h2>
            <p className="text-slate-300 mb-4">
              Promote marketplace items. Earn{" "}
              <span className="text-cyan-400 font-bold">20%</span> on every sale through your link
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-cyan-400">✓</span>
                <span>Promote any marketplace item</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-cyan-400">✓</span>
                <span>Custom tracking links</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-cyan-400">✓</span>
                <span>Real-time earnings dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-cyan-400">✓</span>
                <span>90-day cookie tracking</span>
              </div>
            </div>
            <button className="mt-4 w-full px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 font-semibold transition">
              Browse Items
            </button>
          </div>

          {/* Premium Services */}
          <div className="rounded-xl border border-pink-500/50 bg-slate-900/60 p-6">
            <div className="text-4xl mb-3">⭐</div>
            <h2 className="text-2xl font-bold mb-2">Premium Services</h2>
            <p className="text-slate-300 mb-4">
              Offer custom work. Set your rate and work on your terms
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-pink-400">✓</span>
                <span>Custom content creation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-pink-400">✓</span>
                <span>Bot setup & consultation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-pink-400">✓</span>
                <span>Social media management</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-pink-400">✓</span>
                <span>White-label solutions</span>
              </div>
            </div>
            <button className="mt-4 w-full px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 font-semibold transition">
              List Services
            </button>
          </div>
        </div>

        {/* Earnings Calculator */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-bold mb-4">💵 Earnings Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="referral-count" className="block text-sm font-medium mb-2">Free Referrals/Month</label>
              <input
                id="referral-count"
                type="number"
                defaultValue={10}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700"
                aria-label="Free referrals per month"
              />
            </div>
            <div>
              <label htmlFor="conversion-rate" className="block text-sm font-medium mb-2">Paid Conversions (20%)</label>
              <input
                id="conversion-rate"
                type="number"
                defaultValue={2}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700"
                aria-label="Paid conversions"
              />
            </div>
            <div>
              <label htmlFor="avg-plan-price" className="block text-sm font-medium mb-2">Avg. Plan ($49)</label>
              <input
                id="avg-plan-price"
                type="number"
                defaultValue={49}
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700"
                aria-label="Average plan price"
              />
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
            <div className="text-center">
              <p className="text-sm text-slate-300 mb-1">Projected Monthly Income</p>
              <p className="text-4xl font-bold text-emerald-400">$69.60</p>
              <p className="text-xs text-slate-400 mt-1">
                ($50 free signups + $19.60 recurring commissions)
              </p>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-6">
          <h2 className="text-2xl font-bold mb-4">🏆 Top Earners This Month</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👑</span>
                <div>
                  <p className="font-semibold">CreatorKing</p>
                  <p className="text-sm text-slate-400">234 referrals</p>
                </div>
              </div>
              <p className="text-xl font-bold text-emerald-400">$12,450</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <p className="font-semibold">DesignQueen</p>
                  <p className="text-sm text-slate-400">189 referrals</p>
                </div>
              </div>
              <p className="text-xl font-bold text-emerald-400">$9,823</p>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="font-semibold">GrowthHacker</p>
                  <p className="text-sm text-slate-400">167 referrals</p>
                </div>
              </div>
              <p className="text-xl font-bold text-emerald-400">$8,901</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
