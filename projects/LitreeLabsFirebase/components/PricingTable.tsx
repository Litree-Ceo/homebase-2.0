"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Starter",
    price: 9.99,
    priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
    description: "Perfect to start",
    emoji: "🚀",
    tier: "starter",
    bullets: [
      "50 AI generations/month",
      "20 DM replies/month",
      "5 money plays/month",
      "10 AI images/month",
      "All templates",
      "No watermark",
      "Email support",
    ],
  },
  {
    name: "Creator",
    price: 29,
    priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_CREATOR",
    description: "For serious creators",
    emoji: "🎨",
    tier: "creator",
    featured: true,
    bullets: [
      "500 AI generations/month",
      "100 DM replies/month",
      "Unlimited money plays",
      "50 AI images/month",
      "Smart context (AI remembers you)",
      "Template library",
      "Analytics dashboard",
      "Basic scheduling",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: 59,
    priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_PRO",
    description: "Unlimited everything",
    emoji: "💎",
    tier: "pro",
    bullets: [
      "UNLIMITED AI generations",
      "UNLIMITED DM replies",
      "UNLIMITED money plays",
      "UNLIMITED AI images",
      "Advanced analytics",
      "Smart scheduling",
      "Multi-platform export",
      "Voice input",
      "Custom templates",
      "Priority support",
    ],
  },
  {
    name: "Agency",
    price: 149,
    priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_AGENCY",
    description: "For teams & agencies",
    emoji: "🏢",
    tier: "agency",
    bullets: [
      "Everything in Pro",
      "5 team accounts",
      "White-label branding",
      "Client management",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced security",
    ],
  },
  {
    name: "Education",
    price: 41.58,
    yearly: 499,
    priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_EDUCATION",
    description: "For schools & programs",
    emoji: "🎓",
    tier: "education",
    bullets: [
      "50 student accounts",
      "Teacher dashboard",
      "Content moderation",
      "Assignment templates",
      "Progress tracking",
      "Bulk management",
      "Training included",
      "Education discount",
    ],
  },
];

export default function PricingTable() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSelectPlan = async (plan: (typeof plans)[number]) => {
    setLoading(plan.name);
    setError("");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceIdEnv: plan.priceIdEnv,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(null);
        return;
      }

      if (data.url) {
        router.push(data.url);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create checkout session";
      setError(errorMessage);
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          Pricing That Makes Sense
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Start with $9.99/month impulse buy. Scale as you grow. Cancel anytime, no contracts.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 px-6 py-4 rounded max-w-2xl mx-auto">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 flex flex-col justify-between transition-all hover:scale-105 ${
              plan.featured
                ? "border-2 border-pink-500 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 shadow-2xl relative"
                : "border border-white/10 bg-white/5"
            }`}
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                  🔥 MOST POPULAR
                </span>
              </div>
            )}

            <div>
              <div className="text-5xl mb-3">{plan.emoji}</div>
              <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-black">${plan.price}</span>
                <span className="text-gray-400 ml-2">/month</span>
                {plan.yearly && (
                  <div className="text-xs text-green-400 mt-1">
                    ${plan.yearly}/year (save 17%)
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm">
                    <span className="text-pink-400 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-gray-300">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={loading === plan.name}
              className={`w-full px-4 py-3 rounded-lg font-bold text-sm transition ${
                plan.featured
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              } ${loading === plan.name ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading === plan.name ? "Loading..." : `Get ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center pt-8 space-y-4">
        <p className="text-gray-400 text-sm">
          💳 All plans include 7-day free trial • 💯 30-day money-back guarantee • 🔒 Cancel anytime
        </p>
        <div className="flex justify-center gap-8 text-xs text-gray-500">
          <span>✓ No hidden fees</span>
          <span>✓ Instant access</span>
          <span>✓ Secure checkout</span>
        </div>
      </div>
    </section>
  );
}
