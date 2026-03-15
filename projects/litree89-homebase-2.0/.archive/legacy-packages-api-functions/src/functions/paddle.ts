/**
 * LITLABS API - Paddle Webhook Handler
 * Receives Paddle webhook events for subscription lifecycle updates.
 */
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { registerEpipeHandler } from '../shared/epipe';

registerEpipeHandler();

export async function paddleWebhook(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const rawBody = await request.text();
  let payload: any = null;

  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = null;
  }

  const eventType =
    payload?.event_type || payload?.alert_name || payload?.event || payload?.type || 'unknown';

  context.log(`Paddle webhook received: ${eventType}`);

  // Verify Paddle webhook signature
  const signature = request.headers.get('paddle-signature') || '';
  const secret = process.env.PADDLE_WEBHOOK_SECRET || '';

  if (secret && signature) {
    const crypto = require('node:crypto');
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (hash !== signature) {
      context.warn('Invalid Paddle webhook signature');
      return {
        status: 401,
        jsonBody: { error: 'Unauthorized' },
      };
    }
  }

  // Handle subscription events
  if (
    payload?.event_type === 'subscription.created' ||
    payload?.event_type === 'subscription.updated'
  ) {
    context.log(`Subscription event: ${payload.event_type}`);
    // Subscription data logged for future Cosmos DB integration
    context.log(`Subscription ID: ${payload?.data?.id || 'unknown'}`);
  }

  return {
    status: 200,
    jsonBody: { received: true },
  };
}

app.http('paddle-webhook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'paddle/webhook',
  handler: paddleWebhook,
});
