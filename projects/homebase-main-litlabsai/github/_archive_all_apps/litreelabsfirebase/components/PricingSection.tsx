"use client";

import { useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

function PricingCard({
  plan,
  price,
  features,
  highlight,
  tier,
}: {
  plan: string;
  price: string;
  features: string[];
  highlight?: boolean;
  tier?: "growth" | "godmode";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async (stripeplan: "growth" | "godmode") => {
    setLoading(true);
    setError("");

    try {
      trackEvent("pricing_click", { tier: stripeplan });
      
      // Map tier to actual price ID env var
      let priceIdEnv = "";
      if (stripeplan === "growth" && plan.includes("Starter")) {
        priceIdEnv = "NEXT_PUBLIC_STRIPE_PRICE_STARTER";
      } else if (stripeplan === "godmode" && plan.includes("Pro")) {
        priceIdEnv = "NEXT_PUBLIC_STRIPE_PRICE_PRO";
      } else if (plan.includes("Deluxe")) {
        priceIdEnv = "NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE";
      } else if (plan.includes("Freemium")) {
        priceIdEnv = "NEXT_PUBLIC_STRIPE_PRICE_FREEMIUM";
      }

      // Create checkout session
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceIdEnv }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to start checkout");
      console.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-8 transition ${
        highlight
          ? "border-pink-500/50 bg-gradient-to-b from-pink-500/10 to-transparent shadow-lg shadow-pink-500/20"
          : "border-white/10 bg-white/5"
      }`}
    >
      {highlight && (
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/30 mb-4">
          Most Popular
        </div>
      )}
      <h3 className="text-lg font-bold mb-2">{plan}</h3>
      <p className="text-xs text-white/60 mb-6">Per month, paid yearly</p>
      <p className="text-4xl font-black mb-8">
        {price}
        <span className="text-lg text-white/50">/mo</span>
      </p>
      <ul className="space-y-3 mb-8 text-xs text-white/80">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-pink-400 font-bold mt-0.5">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}
      {tier ? (
        <button
          onClick={() => handleUpgrade(tier)}
          disabled={loading}
          className={`w-full block text-center py-2.5 rounded-full font-semibold text-xs transition disabled:opacity-50 ${
            highlight
              ? "bg-pink-500 hover:bg-pink-400 text-white shadow-lg shadow-pink-500/40"
              : "border border-white/20 hover:border-pink-500/50 text-white/80 hover:text-white"
          }`}
        >
          {loading ? "Processing..." : "Unlock Now"}
        </button>
      ) : (
        <Link
          href="/dashboard"
          className={`w-full block text-center py-2.5 rounded-full font-semibold text-xs transition ${
            highlight
              ? "bg-pink-500 hover:bg-pink-400 text-white shadow-lg shadow-pink-500/40"
              : "border border-white/20 hover:border-pink-500/50 text-white/80 hover:text-white"
          }`}
        >
          Get Started
        </Link>
      )}
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-black">
          💰 Simple plans. Real leverage.
        </h2>
        <p className="text-white/60 text-lg">Pick the plan that scales with you</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-5">
        {/* FREE TIER */}
        <PricingCard
          plan="🎁 Free"
          price="$0"
          features={[
            "50 generations/month",
            "Basic content engine",
            "Email support",
            "Community access",
          ]}
        />

        {/* FREEMIUM TIER */}
        <PricingCard
          plan="⭐ Freemium"
          price="$19"
          features={[
            "300 generations/month",
            "Everything in Free",
            "Priority email support",
            "Content calendar",
          ]}
          tier="growth"
        />

        {/* STARTER */}
        <PricingCard
          plan="🚀 Starter"
          price="$49"
          features={[
            "Daily content engine",
            "DM reply scripts",
            "Promo generator",
            "Fraud checks",
            "Email support",
          ]}
          tier="growth"
        />

        {/* PRO - HIGHLIGHTED */}
        <PricingCard
          highlight
          plan="⚡ Pro"
          price="$99"
          features={[
            "Everything in Starter",
            "7-day content packs",
            "Brand voice training",
            "Client reactivation",
            "Priority support",
          ]}
          tier="godmode"
        />

        {/* DELUXE */}
        <PricingCard
          plan="👑 Deluxe"
          price="$199"
          features={[
            "Everything in Pro",
            "Holiday templates",
            "Growth coaching",
            "1-on-1 onboarding",
            "24/7 VIP support",
          ]}
          tier="godmode"
        />
      </div>

      <p className="text-center text-white/60 text-sm">
        ✨ All plans include 14-day free trial. No card required.
      </p>
    </section>
  );
}
