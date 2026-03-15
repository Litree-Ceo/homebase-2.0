import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAYPAL_API = 'https://api-m.paypal.com';
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

const checkoutSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
});

async function getPayPalToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  const data = (await response.json()) as { access_token?: string };
  return data.access_token;
}

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

    const body = await request.json();
    
    // Validate input
    const validation = checkoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const { amount, currency } = validation.data;
    const email = user.email || "";

    const token = await getPayPalToken();

    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toString(),
            },
          },
        ],
        payer: { email_address: email },
        redirect_urls: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?paypal_success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing?paypal_cancel=true`,
        },
      }),
    });

    const orderData = (await orderResponse.json()) as {
      id?: string;
      links?: Array<{ rel: string; href: string }>;
    };
    if (!orderData.id) throw new Error('No order ID returned');

    const approveLink = orderData.links?.find((l) => l.rel === 'approve')?.href;

    return NextResponse.json({
      orderId: orderData.id,
      approveUrl: approveLink,
    });
  } catch (error) {
    console.error('PayPal checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
