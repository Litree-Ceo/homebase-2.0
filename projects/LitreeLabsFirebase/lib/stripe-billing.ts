// Stripe Subscription Management
// Handles tier system, add-ons, and payment processing

import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebase-admin';
import type { FieldValue } from 'firebase-admin/firestore';

const getDb = () => {
  const database = getAdminDb();
  if (!database) throw new Error('Firebase admin database not initialized');
  return database;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover' as any,
});

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    features: [
      'Basic dashboard',
      '5 widgets',
      '1GB storage',
      '10 API calls/month',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Full dashboard',
      'Unlimited widgets',
      '100GB storage',
      '1000 API calls/month',
      'Priority support',
    ],
  },
  GODMODE: {
    id: 'godmode',
    name: 'GodMode',
    price: 99.99,
    stripePriceId: process.env.STRIPE_GODMODE_PRICE_ID || '',
    features: [
      'Everything in Pro',
      'Custom branding',
      'Advanced analytics',
      'Unlimited API calls',
      '1TB storage',
      'White-label support',
      'Dedicated account manager',
    ],
  },
};

// Add-ons
export const ADDONS = {
  CACHEGRAM_PRO: {
    id: 'cachegram_pro',
    name: 'CacheGram Pro',
    price: 9.99,
    stripePriceId: process.env.STRIPE_CACHEGRAM_PRICE_ID || '',
    description: 'Advanced content creation tools',
  },
  SOCIAL_BOOSTER: {
    id: 'social_booster',
    name: 'Social Booster',
    price: 14.99,
    stripePriceId: process.env.STRIPE_SOCIAL_BOOSTER_PRICE_ID || '',
    description: 'Enhanced social media integration',
  },
  MEDIA_PREMIUM: {
    id: 'media_premium',
    name: 'MediaHub Premium',
    price: 12.99,
    stripePriceId: process.env.STRIPE_MEDIA_PREMIUM_PRICE_ID || '',
    description: '4K streaming + all sources',
  },
  WEB3_PACK: {
    id: 'web3_pack',
    name: 'Web3 Power Pack',
    price: 19.99,
    stripePriceId: process.env.STRIPE_WEB3_PACK_PRICE_ID || '',
    description: 'Advanced crypto/NFT features',
  },
  MARKETPLACE_PLUS: {
    id: 'marketplace_plus',
    name: 'Marketplace Plus',
    price: 9.99,
    stripePriceId: process.env.STRIPE_MARKETPLACE_PLUS_PRICE_ID || '',
    description: 'Seller tools + analytics',
  },
  AI_UNLIMITED: {
    id: 'ai_unlimited',
    name: 'AI Unlimited',
    price: 29.99,
    stripePriceId: process.env.STRIPE_AI_UNLIMITED_PRICE_ID || '',
    description: 'Unlimited AI assistant usage',
  },
};

// Create subscription
export async function createSubscription(
  userId: string,
  tierId: keyof typeof SUBSCRIPTION_TIERS,
  customerEmail: string
): Promise<Stripe.Subscription> {
  const tier = SUBSCRIPTION_TIERS[tierId];

  // Get or create Stripe customer
  const customers = await stripe.customers.list({
    email: customerEmail,
    limit: 1,
  });

  let customerId: string;
  if (customers.data.length > 0) {
    customerId = customers.data[0].id;
  } else {
    const customer = await stripe.customers.create({
      email: customerEmail,
      metadata: { userId },
    });
    customerId = customer.id;
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: tier.stripePriceId }],
    metadata: {
      userId,
      coreTier: tierId,
    },
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  // Save to Firestore
  await getDb().collection('subscriptions').doc(userId).set(
    {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      coreTier: tierId,
      addOns: [],
      status: subscription.status,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      validUntil: new Date((subscription as any).current_period_end * 1000),
      updatedAt: new Date(),
    },
    { merge: true }
  );

  return subscription;
}

// Add addon to subscription
export async function addAddon(
  userId: string,
  addonId: keyof typeof ADDONS
): Promise<Stripe.Subscription> {
  const addon = ADDONS[addonId];
  const subDoc = await getDb().collection('subscriptions').doc(userId).get();

  if (!subDoc.exists) {
    throw new Error('No subscription found');
  }

  const { stripeSubscriptionId } = subDoc.data() as any;

  // Add item to subscription
  const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
    items: [
      {
        price: addon.stripePriceId,
      },
    ],
  });

  // Update Firestore
  await getDb().collection('subscriptions').doc(userId).update({
    addOns: (await getDb().collection('subscriptions').doc(userId).get()).data()?.addOns || [],
    [`addons.${addonId}`]: true,
  });

  return subscription;
}

// Cancel addon
export async function removeAddon(
  userId: string,
  addonId: keyof typeof ADDONS
): Promise<void> {
  const subDoc = await getDb().collection('subscriptions').doc(userId).get();

  if (!subDoc.exists) {
    throw new Error('No subscription found');
  }

  const { stripeSubscriptionId } = subDoc.data() as any;
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  // Find and remove the addon item
  const addonItem = subscription.items.data.find(
    (item) => item.price.metadata?.addonId === addonId
  );

  if (addonItem) {
    await stripe.subscriptionItems.del(addonItem.id);
  }

  // Update Firestore
  await getDb().collection('subscriptions').doc(userId).update({
    [`addons.${addonId}`]: false,
  });
}

// Get user subscription
export async function getUserSubscription(userId: string) {
  const doc = await getDb().collection('subscriptions').doc(userId).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
}

// Handle webhook events
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await getDb().collection('subscriptions').doc(userId).update({
          status: subscription.status,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          validUntil: new Date((subscription as any).current_period_end * 1000),
          updatedAt: new Date(),
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await getDb().collection('subscriptions').doc(userId).update({
          status: 'canceled',
          validUntil: new Date(),
          updatedAt: new Date(),
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Find user by customer ID and update billing info
      const subs = await getDb()
        .collection('subscriptions')
        .where('stripeCustomerId', '==', customerId)
        .get();

      subs.forEach(async (doc: any) => {
        await doc.ref.update({
          lastPaymentDate: new Date(),
          paymentStatus: 'succeeded',
        });
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const subs = await getDb()
        .collection('subscriptions')
        .where('stripeCustomerId', '==', customerId)
        .get();

      subs.forEach((doc: any) => {
        doc.ref.update({
          paymentStatus: 'failed',
          paymentFailedDate: new Date(),
        }).catch(() => {});
      });
      break;
    }
  }
}

// Check if user has addon
export async function hasAddon(userId: string, addonId: keyof typeof ADDONS): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  if (!sub) return false;

  return sub.addons?.[addonId] === true;
}

// Check tier level
export async function getUserTierLevel(userId: string): Promise<string> {
  const sub = await getUserSubscription(userId);
  return sub?.coreTier || 'free';
}
