/**
 * Paddle Payment Integration
 * Handles subscription management, webhooks, and billing
 * Retrieves credentials from Azure Key Vault for security
 */

const crypto = require('crypto');
const axios = require('axios');
const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

const PADDLE_API_URL = process.env.PADDLE_API_URL || 'https://api.paddle.com/v1';

// Azure Key Vault configuration
const KEY_VAULT_URL = process.env.KEY_VAULT_URL;
let keyVaultClient = null;
let cachedCredentials = null;

/**
 * Initialize Key Vault client
 */
function getKeyVaultClient() {
  if (!keyVaultClient && KEY_VAULT_URL) {
    const credential = new DefaultAzureCredential();
    keyVaultClient = new SecretClient(KEY_VAULT_URL, credential);
  }
  return keyVaultClient;
}

/**
 * Retrieve Paddle credentials from Key Vault or environment
 */
async function getPaddleCredentials() {
  // Return cached credentials if available
  if (cachedCredentials) {
    return cachedCredentials;
  }

  let apiKey = process.env.PADDLE_API_KEY;
  let webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  // Try to fetch from Key Vault if configured
  if (KEY_VAULT_URL && !apiKey) {
    try {
      const client = getKeyVaultClient();
      if (client) {
        const apiKeySecret = await client.getSecret('PaddleApiKey');
        const webhookSecret_kv = await client.getSecret('PaddleWebhookSecret');

        apiKey = apiKeySecret.value;
        webhookSecret = webhookSecret_kv.value;

        console.log('✅ Paddle credentials loaded from Key Vault');
      }
    } catch (error) {
      console.warn('⚠️ Failed to retrieve Paddle credentials from Key Vault:', error.message);
      console.warn('Falling back to environment variables');
    }
  }

  if (!apiKey) {
    throw new Error('PADDLE_API_KEY not found in Key Vault or environment variables');
  }

  cachedCredentials = { apiKey, webhookSecret };
  return cachedCredentials;
}

/**
 * Create a customer in Paddle
 */
async function createCustomer(email, name) {
  try {
    const { apiKey } = await getPaddleCredentials();
    const response = await axios.post(
      `${PADDLE_API_URL}/customers`,
      {
        email,
        name,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating Paddle customer:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a subscription for a customer
 */
async function createSubscription(customerId, priceId, billingCycle = 'monthly') {
  try {
    const { apiKey } = await getPaddleCredentials();
    const response = await axios.post(
      `${PADDLE_API_URL}/customers/${customerId}/subscriptions`,
      {
        items: [
          {
            price_id: priceId,
          },
        ],
        billing_cycle: {
          interval: billingCycle === 'annual' ? 'year' : 'month',
          frequency: 1,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating Paddle subscription:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update a subscription
 */
async function updateSubscription(subscriptionId, updates) {
  try {
    const { apiKey } = await getPaddleCredentials();
    const response = await axios.patch(
      `${PADDLE_API_URL}/subscriptions/${subscriptionId}`,
      updates,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating Paddle subscription:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
async function cancelSubscription(subscriptionId, effectiveFrom = 'immediately') {
  try {
    const { apiKey } = await getPaddleCredentials();
    const response = await axios.post(
      `${PADDLE_API_URL}/subscriptions/${subscriptionId}/cancel`,
      {
        effective_from: effectiveFrom,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error('Error canceling Paddle subscription:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get subscription details
 */
async function getSubscription(subscriptionId) {
  try {
    const { apiKey } = await getPaddleCredentials();
    const response = await axios.get(`${PADDLE_API_URL}/subscriptions/${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Paddle subscription:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a transaction (one-time payment)
 */
async function createTransaction(customerId, items, email) {
  try {
    const { apiKey } = await getPaddleCredentials();
    const response = await axios.post(
      `${PADDLE_API_URL}/transactions`,
      {
        items,
        customer_id: customerId,
        customer: {
          email,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating Paddle transaction:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Verify webhook signature
 * Paddle sends X-Paddle-Signature header with HMAC-SHA256
 */
function verifyWebhookSignature(payload, signature) {
  try {
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('PADDLE_WEBHOOK_SECRET not set, skipping verification');
      return true;
    }

    // payload should be a string
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hash = crypto.createHmac('sha256', webhookSecret).update(payloadStr).digest('hex');

    const isValid = hash === signature;
    if (!isValid) {
      console.warn(`Invalid signature. Expected: ${hash}, Got: ${signature}`);
    }
    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error.message);
    return false;
  }
}

/**
 * Handle Paddle webhook events
 */
async function handleWebhook(event) {
  const { type, data } = event;

  switch (type) {
    case 'subscription.created':
      console.log('New subscription created:', data.id);
      // Handle subscription creation
      break;

    case 'subscription.updated':
      console.log('Subscription updated:', data.id);
      // Handle subscription updates
      break;

    case 'subscription.cancelled':
      console.log('Subscription cancelled:', data.id);
      // Handle subscription cancellation
      break;

    case 'transaction.completed':
      console.log('Payment completed:', data.id);
      // Handle successful payment
      break;

    case 'transaction.failed':
      console.log('Payment failed:', data.id);
      // Handle failed payment
      break;

    default:
      console.log('Unhandled webhook event:', type);
  }

  return true;
}

module.exports = {
  createCustomer,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscription,
  createTransaction,
  verifyWebhookSignature,
  handleWebhook,
};
