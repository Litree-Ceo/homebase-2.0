import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { getBaseUrl } from '@/lib/url-helper';
import { createCheckoutSession, getTierFromPriceId } from '@/lib/stripe';
import { STRIPE_PRODUCTS } from '@/lib/stripe-client';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const checkoutSchema = z.object({
  priceId: z.string().min(1),
  tier: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { priceId, tier: requestedTier } = validation.data;
    const email = user.email || "";
    
    // Determine tier from price ID or request
    const tier = requestedTier || getTierFromPriceId(priceId);
    
    // Get trial days if applicable
    const product = Object.values(STRIPE_PRODUCTS).find(p => p.priceId === priceId);
    const trialDays = product?.trialDays;

    // Create checkout session with full metadata
    const baseUrl = getBaseUrl();
    const session = await createCheckoutSession(
      user.uid,
      email,
      priceId,
      tier,
      `${baseUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      `${baseUrl}/dashboard/billing?canceled=true`,
      trialDays
    );

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      tier,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
