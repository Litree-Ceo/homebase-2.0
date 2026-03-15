/**
 * Billing Routes - Paddle Payment Integration
 */

const express = require('express');
const router = express.Router();
const paddle = require('../paddle');

/**
 * POST /api/billing/checkout
 * Create a checkout session or transaction
 */
router.post('/checkout', async (req, res) => {
  try {
    const { customerId, priceId, email, name, billingCycle } = req.body;

    if (!customerId || !priceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create or update customer
    let customer = { id: customerId };
    if (!customerId || customerId === 'new') {
      customer = await paddle.createCustomer(email, name);
    }

    // Create subscription
    const subscription = await paddle.createSubscription(
      customer.id,
      priceId,
      billingCycle || 'monthly',
    );

    res.json({
      success: true,
      subscription,
      customerId: customer.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed', details: error.message });
  }
});

/**
 * GET /api/billing/subscription/:subscriptionId
 * Get subscription details
 */
router.get('/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = await paddle.getSubscription(subscriptionId);
    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

/**
 * PATCH /api/billing/subscription/:subscriptionId
 * Update subscription (pause, resume, change plan)
 */
router.patch('/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { action, priceId } = req.body;

    let updates = {};

    if (action === 'pause') {
      updates.paused = true;
    } else if (action === 'resume') {
      updates.paused = false;
    } else if (action === 'upgrade' || action === 'downgrade') {
      updates.items = [{ price_id: priceId }];
    }

    const subscription = await paddle.updateSubscription(subscriptionId, updates);
    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

/**
 * DELETE /api/billing/subscription/:subscriptionId
 * Cancel subscription
 */
router.delete('/subscription/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { effectiveFrom } = req.body;

    const subscription = await paddle.cancelSubscription(
      subscriptionId,
      effectiveFrom || 'immediately',
    );

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * POST /api/billing/webhook
 * Handle Paddle webhook events
 * Paddle sends webhooks as JSON with X-Paddle-Signature header
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-paddle-signature'];
    const rawPayload = req.body.toString('utf8');

    // Verify webhook signature
    if (!paddle.verifyWebhookSignature(rawPayload, signature)) {
      console.warn('❌ Invalid webhook signature - rejecting webhook');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse and handle the event
    const event = JSON.parse(rawPayload);
    console.log(`📬 Paddle webhook received: ${event.type}`);

    await paddle.handleWebhook(event);
    console.log(`✅ Webhook processed successfully: ${event.type}`);

    res.json({ success: true, eventId: event.data?.id });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    // Return 200 to acknowledge receipt (Paddle expects this)
    // Log the error for debugging
    res.status(200).json({ success: false, error: error.message });
  }
});

module.exports = router;
