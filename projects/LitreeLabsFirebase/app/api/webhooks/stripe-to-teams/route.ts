/**
 * Stripe to Teams Notification Handler
 * Sends payment notifications to Teams channel
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getMicrosoftGraphClient } from '@/lib/microsoft-graph';
import { db } from '@/lib/firebase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

if (!db) {
  throw new Error('Firebase database not initialized');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle payment events
    await handleStripeEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function handleStripeEvent(event: Stripe.Event) {
  const graphClient = getMicrosoftGraphClient();

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await sendPaymentNotification(
        graphClient,
        paymentIntent,
        'succeeded'
      );
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await sendPaymentNotification(
        graphClient,
        paymentIntent,
        'failed'
      );
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await sendSubscriptionNotification(
        graphClient,
        subscription,
        'updated'
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await sendSubscriptionNotification(
        graphClient,
        subscription,
        'cancelled'
      );
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      await sendInvoiceNotification(
        graphClient,
        invoice,
        'paid'
      );
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await sendInvoiceNotification(
        graphClient,
        invoice,
        'failed'
      );
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function sendPaymentNotification(
  graphClient: ReturnType<typeof getMicrosoftGraphClient>,
  paymentIntent: Stripe.PaymentIntent,
  status: string
) {
  try {
    const customerId = paymentIntent.customer as string;

    // Get user by Stripe customer ID
    const userQuery = await (db as any).collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();

    if (userQuery.empty) return;

    const user = userQuery.docs[0];
    const userData = user.data();

    if (!userData.tokens?.access_token) return;

    const message =
      status === 'succeeded'
        ? `✅ Payment of $${(paymentIntent.amount / 100).toFixed(2)} has been successfully processed.`
        : `❌ Payment of $${(paymentIntent.amount / 100).toFixed(2)} has failed. Please try again or contact support.`;

    if (userData.teamsChannelId && userData.teamsTeamId) {
      await graphClient.sendTeamsMessage(
        userData.tokens.access_token,
        userData.teamsTeamId,
        userData.teamsChannelId,
        `<div><strong>Payment Notification</strong><br/>${message}</div>`
      );
    }

    // Also send email
    if (userData.email) {
      await graphClient.sendEmail(
        userData.tokens.access_token,
        [userData.email],
        `Payment ${status === 'succeeded' ? 'Received' : 'Failed'}`,
        `<p>${message}</p><p>Reference: ${paymentIntent.id}</p>`
      );
    }
  } catch (error) {
    console.error('Error sending payment notification:', error);
  }
}

async function sendSubscriptionNotification(
  graphClient: ReturnType<typeof getMicrosoftGraphClient>,
  subscription: Stripe.Subscription,
  status: string
) {
  try {
    const customerId = subscription.customer as string;

    // Get user by Stripe customer ID
    const userQuery = await (db as any).collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();

    if (userQuery.empty) return;

    const user = userQuery.docs[0];
    const userData = user.data();

    if (!userData.tokens?.access_token) return;

    const message =
      status === 'updated'
        ? `📝 Your subscription has been updated to $${(subscription.items.data[0]?.price?.unit_amount || 0) / 100}/month.`
        : `❌ Your subscription has been cancelled. Your current billing period ends on ${new Date((subscription as any).current_period_end * 1000).toLocaleDateString()}.`;

    if (userData.teamsChannelId && userData.teamsTeamId) {
      await graphClient.sendTeamsMessage(
        userData.tokens.access_token,
        userData.teamsTeamId,
        userData.teamsChannelId,
        `<div><strong>Subscription Notification</strong><br/>${message}</div>`
      );
    }

    if (userData.email) {
      await graphClient.sendEmail(
        userData.tokens.access_token,
        [userData.email],
        `Subscription ${status}`,
        `<p>${message}</p><p>Reference: ${subscription.id}</p>`
      );
    }
  } catch (error) {
    console.error('Error sending subscription notification:', error);
  }
}

async function sendInvoiceNotification(
  graphClient: ReturnType<typeof getMicrosoftGraphClient>,
  invoice: Stripe.Invoice,
  status: string
) {
  try {
    const customerId = invoice.customer as string;

    // Get user by Stripe customer ID
    const userQuery = await (db as any).collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();

    if (userQuery.empty) return;

    const user = userQuery.docs[0];
    const userData = user.data();

    if (!userData.tokens?.access_token) return;

    const message =
      status === 'paid'
        ? `✅ Invoice #${invoice.number} for $${(invoice.total || 0) / 100} has been paid.`
        : `⚠️ Invoice #${invoice.number} for $${(invoice.total || 0) / 100} payment failed.`;

    if (userData.teamsChannelId && userData.teamsTeamId) {
      await graphClient.sendTeamsMessage(
        userData.tokens.access_token,
        userData.teamsTeamId,
        userData.teamsChannelId,
        `<div><strong>Invoice Notification</strong><br/>${message}</div>`
      );
    }

    if (userData.email) {
      await graphClient.sendEmail(
        userData.tokens.access_token,
        [userData.email],
        `Invoice ${status === 'paid' ? 'Paid' : 'Payment Failed'}`,
        `<p>${message}</p><p>Reference: ${invoice.id}</p>`
      );
    }
  } catch (error) {
    console.error('Error sending invoice notification:', error);
  }
}
