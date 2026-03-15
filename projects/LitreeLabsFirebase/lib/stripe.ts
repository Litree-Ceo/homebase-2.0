// lib/stripe.ts
import Stripe from "stripe";
import { getAdminDb } from "./firebase-admin";
import { STRIPE_PRODUCTS } from "./stripe-client";

let stripe: Stripe;

export function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

// Re-export for server-side use
export { STRIPE_PRODUCTS };

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  tier: string,
  successUrl: string,
  cancelUrl: string,
  trialDays?: number
) {
  const stripe = getStripe();
  
  // Create or get customer
  const customers = await stripe.customers.list({ email, limit: 1 });
  let customerId = customers.data[0]?.id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { firebaseUid: userId },
    });
    customerId = customer.id;
    
    // Store Stripe customer ID in Firebase
    const db = getAdminDb();
    if (db) {
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customerId,
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      tier,
      email,
    },
    subscription_data: trialDays
      ? {
          trial_period_days: trialDays,
          metadata: {
            userId,
            tier,
          },
        }
      : {
          metadata: {
            userId,
            tier,
          },
        },
  });

  return session;
}

export async function getSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId);
}

export async function createStripeCustomer(email: string, userId: string, name?: string) {
  const customer = await getStripe().customers.create({
    email,
    name,
    metadata: { firebaseUid: userId },
  });
  
  // Store Stripe customer ID in Firebase
  const db = getAdminDb();
  if (db) {
    await db.collection('users').doc(userId).update({
      stripeCustomerId: customer.id,
    });
  }
  
  return customer;
}

/**
 * Get tier from Stripe price ID
 */
export function getTierFromPriceId(priceId: string): string {
  for (const [tier, product] of Object.entries(STRIPE_PRODUCTS)) {
    if (product.priceId === priceId) {
      return product.tier || tier;
    }
  }
  return 'free';
}

/**
 * Update user subscription in Firebase
 */
export async function updateUserSubscription(
  userId: string,
  subscriptionData: {
    subscriptionId: string;
    customerId: string;
    tier: string;
    status: string;
    currentPeriodEnd?: number;
    cancelAtPeriodEnd?: boolean;
  }
) {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore Admin not initialized');

  await db.collection('users').doc(userId).update({
    tier: subscriptionData.tier,
    stripeCustomerId: subscriptionData.customerId,
    stripeSubscriptionId: subscriptionData.subscriptionId,
    subscription: {
      plan: subscriptionData.tier,
      status: subscriptionData.status,
      currentPeriodEnd: subscriptionData.currentPeriodEnd 
        ? new Date(subscriptionData.currentPeriodEnd * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
      updatedAt: new Date().toISOString(),
    },
  });
}

// Default export for backwards compatibility
export { getStripe as default };
