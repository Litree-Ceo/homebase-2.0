// lib/stripe-client.ts
// Client-side Stripe configuration (no server dependencies)

export interface StripeProduct {
  priceId: string;
  name: string;
  tier: string;
  price: number;
  features: string[];
  trialDays?: number;
}

export const STRIPE_PRODUCTS: Record<string, StripeProduct> = {
  free: {
    priceId: "",
    name: "Free",
    tier: "free",
    price: 0,
    features: ["Limited AI content", "Basic features", "Community support"],
  },
  starter: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "",
    name: "Starter",
    tier: "starter",
    price: 19,
    features: ["AI content gen", "Basic DM replies", "1 playbook"],
  },
  creator: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR || "",
    name: "Creator",
    tier: "creator",
    price: 39,
    features: ["More AI generations", "Advanced DM replies", "5 playbooks"],
  },
  pro: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
    name: "Pro",
    tier: "pro",
    price: 79,
    trialDays: 14,
    features: [
      "Unlimited AI generations",
      "Unlimited playbooks",
      "Advanced money plays",
      "Priority support",
    ],
  },
  agency: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY || "",
    name: "Agency",
    tier: "agency",
    price: 199,
    features: [
      "Everything in Pro",
      "White-label solution",
      "Client management",
      "API access",
    ],
  },
  enterprise: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "",
    name: "Enterprise",
    tier: "enterprise",
    price: 499,
    features: [
      "Everything in Agency",
      "Custom integrations",
      "Dedicated manager",
      "SLA support",
    ],
  },
};

