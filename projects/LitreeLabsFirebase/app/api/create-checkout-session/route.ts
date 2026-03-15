import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getUserFromRequest } from "@/lib/auth-helper";
import { getBaseUrl } from "@/lib/url-helper";
import { z } from "zod";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const checkoutSchema = z.object({
  priceIdEnv: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate input
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { priceIdEnv } = validation.data;

    if (!priceIdEnv) {
      return NextResponse.json(
        { error: "Missing priceIdEnv parameter" },
        { status: 400 }
      );
    }

    // Get the price ID from environment variables
    const priceId = process.env[priceIdEnv as keyof typeof process.env];

    if (!priceId) {
      return NextResponse.json(
        {
          error: `Price ID not configured for ${priceIdEnv}. Check your environment variables.`,
        },
        { status: 400 }
      );
    }

    const origin = getBaseUrl();
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/billing?canceled=true`,
      billing_address_collection: "auto",
      client_reference_id: user.uid, // Link session to authenticated user
      customer_email: user.email || undefined, // Use authenticated user's email with null check
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
