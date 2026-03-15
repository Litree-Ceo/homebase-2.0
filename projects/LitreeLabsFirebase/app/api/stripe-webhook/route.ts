import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  sendUpgradeConfirmationEmail,
  sendPaymentFailedEmail,
  sendCancellationConfirmationEmail,
} from "@/lib/email";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      console.error("Missing webhook signature or secret");
      return NextResponse.json(
        { error: "Missing Stripe webhook configuration" },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    const stripe = getStripe();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      const error = err as Error;
      console.error("Webhook signature verification failed:", error.message);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    // Helper function to determine tier from price ID
    const getTierFromPriceId = (priceId: string): string => {
      if (priceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID) return "basic";
      if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return "pro";
      if (priceId === process.env.NEXT_PUBLIC_STRIPE_DELUXE_PRICE_ID) return "deluxe";
      return "free";
    };

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Checkout completed:", session.id);

        if (session.client_reference_id && session.subscription) {
          const userId = session.client_reference_id;
          const subscriptionId = session.subscription as string;
          const userEmail = session.customer_email || "";

          try {
            // Fetch subscription details to get price ID
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0].price.id;
            const tier = getTierFromPriceId(priceId);
            const amount = subscription.items.data[0].price.unit_amount || 0;

            // Update Firestore with subscription details
            const dbRef = getAdminDb();
            if (!dbRef) {
              console.error('Firestore Admin not initialized');
              return;
            }
            const subData = subscription as unknown as Record<string, number>;
            await dbRef
              .collection('users')
              .doc(userId)
              .update({
                tier,
                subscription: {
                  id: subscriptionId,
                  status: subscription.status,
                  priceId,
                  currentPeriodStart: new Date(subData.current_period_start * 1000),
                  currentPeriodEnd: new Date(subData.current_period_end * 1000),
                  createdAt: new Date(),
                },
                updatedAt: new Date(),
              });

            // Send confirmation email
            if (userEmail) {
              await sendUpgradeConfirmationEmail(
                userEmail,
                session.client_reference_id,
                tier as "basic" | "pro" | "deluxe",
                amount
              );
            }

            console.log(`✅ User ${userId} upgraded to ${tier}`);
          } catch (error) {
            const err = error as Error;
            console.error("Error updating user subscription:", err.message);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("📝 Subscription updated:", subscription.id);

        try {
          // Find user by subscription ID and update
          const priceId = subscription.items.data[0].price.id;
          const tier = getTierFromPriceId(priceId);

          // Note: In production, you'd query users by subscription ID
          // For now, we log the event and assume webhook is called with user context
          console.log(`Updated subscription to tier: ${tier}`);
        } catch (error: Error | unknown) {
          const err = error as Error;
          console.error("Error updating subscription:", err.message);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("❌ Subscription deleted:", subscription.id);

        try {
          // Get customer email to send cancellation email
          const customer = await stripe.customers.retrieve(
            subscription.customer as string
          );
          const customerData = customer as unknown as Record<string, unknown>;
          const customerEmail = (customerData.email as string) || "";

          if (customerEmail) {
            await sendCancellationConfirmationEmail(customerEmail, customerEmail);
          }

          console.log(`Subscription ${subscription.id} canceled`);
        } catch (error) {
          const err = error as Error;
          console.error("Error handling subscription deletion:", err.message);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("⚠️ Payment failed:", invoice.id);

        try {
          // Get customer email and send payment failed notification
          const customer = await stripe.customers.retrieve(invoice.customer as string);
          const customerData = customer as unknown as Record<string, unknown>;
          const customerEmail = (customerData.email as string) || "";

          if (customerEmail) {
            await sendPaymentFailedEmail(customerEmail, customerEmail);
          }

          console.log(`Payment failed notification sent for invoice: ${invoice.id}`);
        } catch (error) {
          const err = error as Error;
          console.error("Error handling payment failure:", err.message);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("✅ Payment succeeded:", invoice.id);

        try {
          const invoiceData = invoice as unknown as Record<string, unknown>;
          if (invoiceData.subscription) {
            console.log(`Payment succeeded for subscription: ${invoiceData.subscription}`);
            // Log transaction in Firestore (optional)
          }
        } catch (error) {
          const err = error as Error;
          console.error("Error handling payment success:", err.message);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
