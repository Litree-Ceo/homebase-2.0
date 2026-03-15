// app/billing/page.tsx
"use client";

import { AuthGate } from "@/components/AuthGate";
import DashboardLayout from "@/components/DashboardLayout";

export default function BillingPage() {
  return (
    <main>
      <AuthGate>
        <DashboardLayout>
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-3xl font-bold mb-2">Billing</h1>
              <p className="text-slate-300">
                Manage your LitLabs Business OS™ subscription.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 space-y-4">
              <p className="text-slate-300">
                Choose your plan below to get started or upgrade.
              </p>

              <div className="space-y-3">
                <button
                  onClick={async () => {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      body: JSON.stringify({
                        priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_FREE",
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-500 transition text-left font-semibold"
                >
                  🎁 Free Plan → Start
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      body: JSON.stringify({
                        priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_FREEMIUM",
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-orange-500 transition text-left font-semibold"
                >
                  ⭐ Freemium Plan ($19/mo) → Upgrade
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      body: JSON.stringify({
                        priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500 transition text-left font-semibold"
                >
                  🚀 Starter Plan ($49/mo) → Upgrade
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      body: JSON.stringify({
                        priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_PRO",
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-pink-500/20 border border-pink-500/50 hover:border-pink-500 transition text-left font-semibold text-pink-300"
                >
                  ⚡ Pro Plan ($99/mo) → Upgrade
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      body: JSON.stringify({
                        priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE",
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-purple-500/20 border border-purple-500/50 hover:border-purple-500 transition text-left font-semibold text-purple-300"
                >
                  👑 Deluxe Plan ($199/mo) → Upgrade
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              — Powered by LitLabs Business OS™ 🔥
            </p>
          </div>
        </DashboardLayout>
      </AuthGate>
    </main>
  );
}
