import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession, createStripeCustomer } from "@/lib/stripe";
import { STRIPE_PRODUCTS } from "@/lib/stripe-client";
import { getAdminDb } from "@/lib/firebase-admin";
import { getUserFromRequest } from "@/lib/auth-helper";
import { getBaseUrl } from "@/lib/url-helper";
import { z } from "zod";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const checkoutSchema = z.object({
  tier: z.enum(["starter", "pro", "enterprise", "creator", "agency", "education"]),
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
    
    const { tier } = validation.data;
    const userId = user.uid; // Use authenticated user ID
    const email = user.email || ""; // Use authenticated user email

    const product = STRIPE_PRODUCTS[tier as keyof typeof STRIPE_PRODUCTS];
    if (!product) {
      return NextResponse.json(
        { error: "Invalid tier" },
        { status: 400 }
      );
    }

    // Create or get Stripe customer
    let stripeCustomerId: string;

    try {
      const customer = await createStripeCustomer(email, email.split("@")[0]);
      stripeCustomerId = customer.id;

      // Store in Firestore
      const dbRef = getAdminDb();
      if (!dbRef) {
        throw new Error("Firestore Admin not initialized");
      }
      await dbRef.collection("users").doc(userId).update({
        stripeCustomerId,
      });
    } catch (err) {
      console.error("Error creating Stripe customer:", err);
      return NextResponse.json(
        { error: "Failed to create customer" },
        { status: 500 }
      );
    }

    // Create checkout session
    // SECURITY: Never use client-provided URLs to prevent open redirect attacks
    const baseUrl = getBaseUrl();
    const trialDays = tier === "pro" ? 14 : undefined;
    const session = await createCheckoutSession(
      userId,
      email,
      product.priceId,
      tier,
      `${baseUrl}/dashboard/billing?success=true`,
      `${baseUrl}/dashboard/billing?cancelled=true`,
      trialDays
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
