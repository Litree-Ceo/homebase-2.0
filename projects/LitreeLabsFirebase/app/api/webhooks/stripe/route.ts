import { NextRequest, NextResponse } from 'next/server';
import { info, warn, error } from '@/lib/serverLogger';
import { getAdminDb } from '@/lib/firebase-admin';
import { getTierFromPriceId, updateUserSubscription } from '@/lib/stripe';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Stripe client
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * STRIPE WEBHOOK HANDLER
 * Processes Stripe payment events and updates user subscriptions in Firebase
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      error('[Stripe Webhook] Missing signature or webhook secret');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (!stripe) {
      error('[Stripe Webhook] Stripe client not initialized');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const { type, data } = event;

    info(`[Stripe Webhook] Event: ${type}`);

    switch (type) {
      case 'checkout.session.completed': {
        const session = data.object as Stripe.Checkout.Session;
        const { customer, subscription, metadata } = session;
        const { userId, tier, email } = metadata || {};

        if (!userId || !email) {
          warn('[Stripe Webhook] Missing userId or email in checkout session metadata');
          return NextResponse.json({ received: true });
        }

        if (typeof subscription !== 'string' || typeof customer !== 'string') {
          warn('[Stripe Webhook] Invalid subscription or customer ID');
          return NextResponse.json({ received: true });
        }

        // Get subscription details
        const subResponse = await stripe.subscriptions.retrieve(subscription);
        const sub = subResponse as any;
        const priceId = sub.items?.data?.[0]?.price?.id;
        const determinedTier = tier || getTierFromPriceId(priceId);

        // Update user subscription in Firebase
        await updateUserSubscription(userId, {
          subscriptionId: subscription,
          customerId: customer,
          tier: determinedTier,
          status: sub.status,
          currentPeriodEnd: sub.current_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        });

        // Log transaction
        const db = getAdminDb();
        if (db) {
          await db.collection('transactions').add({
            userId,
            email,
            tier: determinedTier,
            amount: (session.amount_total || 0) / 100,
            paymentMethod: 'stripe',
            transactionId: session.id,
            subscriptionId: subscription,
            status: 'completed',
            createdAt: new Date(),
            type: 'subscription_created',
          });
        }

        info(`✅ Stripe: ${email} subscribed to ${determinedTier} - Subscription ${subscription}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscriptionObj = data.object as any;
        const { customer, items, status, current_period_end, cancel_at_period_end, metadata, id: subscriptionId } = subscriptionObj;
        const priceId = items?.data?.[0]?.price?.id;
        
        const userId = metadata?.userId;
        const tier = metadata?.tier || getTierFromPriceId(priceId);

        if (!userId) {
          // Try to find user by Stripe customer ID
          const db = getAdminDb();
          if (db) {
            const usersSnap = await db
              .collection('users')
              .where('stripeCustomerId', '==', customer)
              .limit(1)
              .get();

            if (!usersSnap.empty) {
              const userDoc = usersSnap.docs[0];
              await updateUserSubscription(userDoc.id, {
                subscriptionId,
                customerId: customer as string,
                tier,
                status,
                currentPeriodEnd: current_period_end,
                cancelAtPeriodEnd: cancel_at_period_end,
              });

              info(`✅ Stripe: Subscription updated - ${userDoc.data().email} → ${tier} (${status})`);
            }
          }
        } else {
          await updateUserSubscription(userId, {
            subscriptionId,
            customerId: customer as string,
            tier,
            status,
            currentPeriodEnd: current_period_end,
            cancelAtPeriodEnd: cancel_at_period_end,
          });

          info(`✅ Stripe: Subscription updated - User ${userId} → ${tier} (${status})`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionObj = data.object as any;
        const { customer, metadata } = subscriptionObj;
        const userId = metadata?.userId;

        // Downgrade user to free tier
        const db = getAdminDb();
        if (db) {
          if (userId) {
            await db.collection('users').doc(userId).update({
              tier: 'free',
              stripeSubscriptionId: null,
              subscription: {
                plan: 'free',
                status: 'canceled',
                canceledAt: new Date().toISOString(),
              },
            });
            info(`✅ Stripe: Subscription canceled - User ${userId} downgraded to free`);
          } else {
            // Find by customer ID
            const usersSnap = await db
              .collection('users')
              .where('stripeCustomerId', '==', customer)
              .limit(1)
              .get();

            if (!usersSnap.empty) {
              const userDoc = usersSnap.docs[0];
              await db.collection('users').doc(userDoc.id).update({
                tier: 'free',
                stripeSubscriptionId: null,
                subscription: {
                  plan: 'free',
                  status: 'canceled',
                  canceledAt: new Date().toISOString(),
                },
              });
              info(`✅ Stripe: Subscription canceled - ${userDoc.data().email} downgraded to free`);
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoiceObj = data.object as any;
        const { customer, customer_email, subscription } = invoiceObj;

        const db = getAdminDb();
        if (db) {
          const usersSnap = await db
            .collection('users')
            .where('stripeCustomerId', '==', customer)
            .limit(1)
            .get();

          if (!usersSnap.empty) {
            const userDoc = usersSnap.docs[0];

            // Log failed payment
            await db.collection('transactions').add({
              userId: userDoc.id,
              email: customer_email || userDoc.data().email,
              status: 'failed',
              type: 'payment_failed',
              subscriptionId: subscription,
              createdAt: new Date(),
              retryable: true,
            });

            // Update subscription status
            await db.collection('users').doc(userDoc.id).update({
              'subscription.status': 'past_due',
              'subscription.lastPaymentFailed': new Date().toISOString(),
            });

            warn(`⚠️ Stripe: Payment failed for ${userDoc.data().email}`);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoiceObj = data.object as any;
        const { customer, customer_email, subscription, amount_paid } = invoiceObj;

        const db = getAdminDb();
        if (db) {
          const usersSnap = await db
            .collection('users')
            .where('stripeCustomerId', '==', customer)
            .limit(1)
            .get();

          if (!usersSnap.empty) {
            const userDoc = usersSnap.docs[0];

            // Log successful payment
            await db.collection('transactions').add({
              userId: userDoc.id,
              email: customer_email || userDoc.data().email,
              amount: amount_paid / 100,
              status: 'completed',
              type: 'subscription_payment',
              subscriptionId: subscription,
              transactionId: invoiceObj.id,
              paymentMethod: 'stripe',
              createdAt: new Date(),
            });

            // Update subscription status to active
            await db.collection('users').doc(userDoc.id).update({
              'subscription.status': 'active',
              'subscription.lastPaymentSuccess': new Date().toISOString(),
            });

            info(`✅ Stripe: Payment succeeded for ${userDoc.data().email} - $${amount_paid / 100}`);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    error('Stripe webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
