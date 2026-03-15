import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { getAdminDb } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';
import { info } from '@/lib/serverLogger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST - Cancel subscription for the current user
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data from Firebase
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const stripeSubscriptionId = userData?.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel subscription in Stripe (at period end)
    const stripe = getStripe();
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Get full subscription details to get period end
    const subscriptionResponse = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const periodEnd = (subscriptionResponse as any).current_period_end || Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
    const cancelAtDate = new Date(periodEnd * 1000).toISOString();

    // Update Firebase
    await db.collection('users').doc(user.uid).update({
      'subscription.cancelAtPeriodEnd': true,
      'subscription.cancelAt': cancelAtDate,
      'subscription.updatedAt': new Date().toISOString(),
    });

    // Log cancellation
    await db.collection('activity_log').add({
      userId: user.uid,
      action: 'subscription_canceled',
      details: {
        subscriptionId: stripeSubscriptionId,
        cancelAt: cancelAtDate,
      },
      timestamp: new Date(),
    });

    info(`✅ Subscription canceled: ${user.email} - ends ${cancelAtDate}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      cancelAt: cancelAtDate,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Immediately cancel subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data from Firebase
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const stripeSubscriptionId = userData?.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel subscription immediately in Stripe
    const stripe = getStripe();
    await stripe.subscriptions.cancel(stripeSubscriptionId);

    // Update Firebase - downgrade to free
    await db.collection('users').doc(user.uid).update({
      tier: 'free',
      stripeSubscriptionId: null,
      subscription: {
        plan: 'free',
        status: 'canceled',
        canceledAt: new Date().toISOString(),
      },
    });

    // Log cancellation
    await db.collection('activity_log').add({
      userId: user.uid,
      action: 'subscription_canceled_immediately',
      details: {
        subscriptionId: stripeSubscriptionId,
      },
      timestamp: new Date(),
    });

    info(`✅ Subscription canceled immediately: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled immediately',
      tier: 'free',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
