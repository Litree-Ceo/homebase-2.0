/**
 * Paddle Webhook Handler - Process Payments
 * @workspace Handles subscription events from Paddle
 * Revenue flows: Free → Pro ($9.99) → Enterprise ($49.99)
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCosmosClient } from '../shared/cosmos-client';
import crypto from 'node:crypto';

// Paddle webhook signature verification
function verifyPaddleSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const hash = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export async function paddleWebhook(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const signature = request.headers.get('paddle-signature');
    const body = await request.text();

    // Verify webhook signature
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || '';
    if (!verifyPaddleSignature(body, signature || '', webhookSecret)) {
      context.warn('Invalid Paddle signature');
      return { status: 401, body: 'Invalid signature' };
    }

    const event = JSON.parse(body);
    context.log('Paddle event:', event.alert_name);

    const cosmosClient = getCosmosClient();
    const container = cosmosClient.database('litlab').container('subscriptions');

    switch (event.alert_name) {
      case 'subscription_created':
        // New subscription - upgrade user
        await container.items.create({
          id: event.subscription_id,
          userId: event.user_id,
          email: event.email,
          planName: event.subscription_plan_id,
          status: 'active',
          amount: Number.parseFloat(event.unit_price),
          currency: event.currency,
          nextBillDate: event.next_bill_date,
          createdAt: new Date().toISOString(),
          type: 'subscription',
        });
        context.log(`✅ Subscription created: ${event.email}`);
        break;

      case 'subscription_payment_succeeded': {
        // Payment successful - extend subscription
        const { resource: sub } = await container
          .item(event.subscription_id, event.subscription_id)
          .read();
        if (sub) {
          await container.item(event.subscription_id, event.subscription_id).replace({
            ...sub,
            lastPaymentDate: new Date().toISOString(),
            nextBillDate: event.next_bill_date,
            status: 'active',
          });
          context.log(`💰 Payment received: ${event.email} - $${event.amount}`);
        }
        break;
      }

      case 'subscription_cancelled': {
        // Subscription cancelled - downgrade to free
        const { resource: cancelSub } = await container
          .item(event.subscription_id, event.subscription_id)
          .read();
        if (cancelSub) {
          await container.item(event.subscription_id, event.subscription_id).replace({
            ...cancelSub,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
          });
          context.log(`❌ Subscription cancelled: ${event.email}`);
        }
        break;
      }

      case 'subscription_payment_failed':
        // Payment failed - notify user
        context.warn(`⚠️ Payment failed: ${event.email}`);
        break;

      default:
        context.log(`Unknown event: ${event.alert_name}`);
    }

    return {
      status: 200,
      jsonBody: { success: true, message: 'Webhook processed' },
    };
  } catch (error) {
    context.error('Paddle webhook error:', error);
    return {
      status: 500,
      jsonBody: { success: false, error: 'Webhook processing failed' },
    };
  }
}

app.http('paddle-webhook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: paddleWebhook,
});
