/**
 * Checkout Routes - Paddle Integration
 * Handles payment processing and order management
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

const PADDLE_API_URL = process.env.PADDLE_API_URL || 'https://api.paddle.com/v1';
const PADDLE_API_KEY = process.env.PADDLE_API_KEY;

/**
 * GET /api/checkout/prices
 * Get available pricing options
 */
router.get('/prices', async (req, res) => {
  try {
    const response = await axios.get(`${PADDLE_API_URL}/prices`, {
      headers: {
        Authorization: `Bearer ${PADDLE_API_KEY}`,
      },
    });

    res.json({
      success: true,
      prices: response.data.data,
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

/**
 * POST /api/checkout/initialize
 * Initialize a checkout session
 */
router.post('/initialize', async (req, res) => {
  try {
    const { email, customerId, items } = req.body;

    if (!email || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid checkout data' });
    }

    // For Paddle Billing API, we prepare the transaction data
    const checkoutSession = {
      email,
      customerId: customerId || null,
      items,
      status: 'initialized',
      createdAt: new Date().toISOString(),
    };

    // Store session (in production, use database)
    // For now, return the session to the client
    res.json({
      success: true,
      checkoutSession,
      redirectUrl: `${
        process.env.FRONTEND_URL || 'http://localhost:3000'
      }/checkout?session=${Buffer.from(JSON.stringify(checkoutSession)).toString('base64')}`,
    });
  } catch (error) {
    console.error('Checkout initialization error:', error);
    res.status(500).json({ error: 'Checkout initialization failed' });
  }
});

/**
 * POST /api/checkout/process
 * Process a payment using Paddle
 */
router.post('/process', async (req, res) => {
  try {
    const { customerId, email, items, billingDetails } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' });
    }

    // Create transaction with Paddle
    const transactionData = {
      items: items.map(item => ({
        price_id: item.priceId,
        quantity: item.quantity || 1,
      })),
      billing_details: billingDetails,
    };

    if (customerId) {
      transactionData.customer_id = customerId;
    } else {
      transactionData.customer = { email };
    }

    const response = await axios.post(`${PADDLE_API_URL}/transactions`, transactionData, {
      headers: {
        Authorization: `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const transaction = response.data.data;

    res.json({
      success: true,
      transaction,
      paymentUrl: transaction.hosted_checkout_url,
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * GET /api/checkout/transaction/:transactionId
 * Get transaction status
 */
router.get('/transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    const response = await axios.get(`${PADDLE_API_URL}/transactions/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${PADDLE_API_KEY}`,
      },
    });

    res.json({
      success: true,
      transaction: response.data.data,
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

module.exports = router;
