import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
if (!stripeSecret) throw new Error("STRIPE_SECRET_KEY is not set");
const stripe = new Stripe(stripeSecret);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { priceId, successUrl, cancelUrl, customerEmail } = body;

    if (!priceId || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      metadata: customerEmail ? { email: customerEmail } : undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Stripe error" }, { status: 500 });
  }
}
