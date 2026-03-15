import Stripe from "stripe";
import { NextResponse } from "next/server";
import { upsertSubscription } from "@/lib/subscriptionStore";

const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

if (!stripeSecret) throw new Error("STRIPE_SECRET_KEY not set");
if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not set");

const stripe = new Stripe(stripeSecret);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "customer.subscription.deleted":
      case "customer.subscription.paused": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = (sub.items.data[0]?.price?.id as string | undefined) || undefined;
        const tier = priceId; // map priceId to tier name if desired
        // Prefer customer id as key; fallback to subscription id
        const key = (sub.customer as string | undefined) || sub.id;
        upsertSubscription({
          key,
          status: sub.status,
          tier,
          priceId,
          stripeCustomerId: sub.customer as string | undefined,
          currentPeriodEnd: (sub as any).current_period_end,
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customer = invoice.customer as string | undefined;
        const line = invoice.lines.data[0];
        const priceId = ((line as any)?.price?.id as string | undefined) || undefined;
        const key = customer || invoice.id;
        upsertSubscription({
          key,
          status: "payment_failed",
          priceId,
          stripeCustomerId: customer,
          currentPeriodEnd: invoice.lines.data[0]?.period?.end,
        });
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Webhook handler error" }, { status: 500 });
  }
}
