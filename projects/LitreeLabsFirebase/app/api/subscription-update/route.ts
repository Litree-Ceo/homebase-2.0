import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { info, error } from '@/lib/serverLogger';
import { z } from 'zod';
import * as crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SUBSCRIPTION MANAGER - WEBHOOK ONLY
 * Handles payment confirmations and subscription updates
 * Called ONLY by verified webhook processors when payments complete
 * 
 * SECURITY: This endpoint should ONLY be called by webhooks (Stripe, PayPal)
 * Direct client calls are FORBIDDEN to prevent unauthorized tier upgrades
 */

const subscriptionSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  tier: z.enum(['free', 'starter', 'creator', 'pro', 'enterprise', 'agency', 'education']),
  paymentMethod: z.enum(['stripe', 'paypal']),
  transactionId: z.string().min(1),
  amount: z.number().positive(),
  status: z.string().default('completed'),
});

export async function POST(request: NextRequest) {
  try {
    // Verify this request comes from a webhook (internal call only)
    // Check for internal webhook secret header using constant-time comparison
    const webhookSecret = request.headers.get('x-internal-webhook-secret');
    const expectedSecret = process.env.INTERNAL_WEBHOOK_SECRET;
    
    // Use crypto.timingSafeEqual for constant-time comparison to prevent timing attacks
    if (!expectedSecret || !webhookSecret) {
      error('❌ Unauthorized subscription-update attempt - missing webhook secret');
      return NextResponse.json(
        { error: 'Forbidden - This endpoint is for internal webhook use only' },
        { status: 403 }
      );
    }
    
    // Convert to Buffer for timing-safe comparison
    const receivedBuffer = Buffer.from(webhookSecret);
    const expectedBuffer = Buffer.from(expectedSecret);
    
    // Check lengths match before comparing (prevents timing attack on length)
    if (receivedBuffer.length !== expectedBuffer.length) {
      error('❌ Unauthorized subscription-update attempt - invalid webhook secret length');
      return NextResponse.json(
        { error: 'Forbidden - This endpoint is for internal webhook use only' },
        { status: 403 }
      );
    }
    
    // Timing-safe comparison
    if (!crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
      error('❌ Unauthorized subscription-update attempt - webhook verification failed');
      return NextResponse.json(
        { error: 'Forbidden - This endpoint is for internal webhook use only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = subscriptionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    // Use validated data directly
    const data = validation.data;

    // Update user tier
    const dbRef = getAdminDb();
    if (!dbRef) {
      return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
    }
    await dbRef
      .collection('users')
      .doc(data.userId)
      .update({
        tier: data.tier,
        subscription: {
          plan: data.tier,
          status: 'active',
          startDate: new Date().toISOString(),
          autoRenew: true,
        },
        lastUpgradeDate: new Date().toISOString(),
      });

    // Record transaction
    await dbRef.collection('transactions').add({
      userId: data.userId,
      email: data.email,
      tier: data.tier,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      status: data.status || 'completed',
      createdAt: new Date(),
      type: 'subscription_upgrade',
    });

    // Log activity
    await dbRef.collection('activity_log').add({
      userId: data.userId,
      action: `upgraded_to_${data.tier}`,
      details: { paymentMethod: data.paymentMethod, amount: data.amount },
      timestamp: new Date(),
    });

    info(`✅ Subscription updated: ${data.email} → ${data.tier}`);

    return NextResponse.json(
      {
        success: true,
        message: `Subscription updated to ${data.tier}`,
        user: { userId: data.userId, email: data.email, tier: data.tier },
      },
      { status: 200 }
    );
  } catch (err) {
    error('Subscription manager error:', err);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
