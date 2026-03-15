import { NextResponse } from "next/server";

// Returns the price IDs so the frontend can pick the correct tier.
// Populate these envs with your real Stripe price IDs.
export async function GET() {
  return NextResponse.json({
    stripe: {
      starter: process.env.STRIPE_PRICE_STARTER,
      standard: process.env.STRIPE_PRICE_STANDARD,
      pro: process.env.STRIPE_PRICE_PRO,
      elite: process.env.STRIPE_PRICE_ELITE,
      ultimate: process.env.STRIPE_PRICE_ULTIMATE,
    },
  });
}
