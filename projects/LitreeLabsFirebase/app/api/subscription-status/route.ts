import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { getAdminDb } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET subscription status for the current user
 */
export async function GET(request: NextRequest) {
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
    const tier = userData?.tier || 'free';
    const subscription = userData?.subscription || null;
    const stripeSubscriptionId = userData?.stripeSubscriptionId;
    const stripeCustomerId = userData?.stripeCustomerId;

    // If has active Stripe subscription, fetch latest data
    if (stripeSubscriptionId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = getStripe();
        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const sub = stripeSubscription as any;

        return NextResponse.json({
          tier,
          subscription: {
            ...subscription,
            status: sub.status,
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            cancelAt: sub.cancel_at 
              ? new Date(sub.cancel_at * 1000).toISOString()
              : null,
          },
          stripeCustomerId,
          stripeSubscriptionId,
          canManage: true,
        });
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
        // Fall back to Firebase data
      }
    }

    // Return Firebase data
    return NextResponse.json({
      tier,
      subscription,
      stripeCustomerId,
      stripeSubscriptionId,
      canManage: !!stripeSubscriptionId,
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
