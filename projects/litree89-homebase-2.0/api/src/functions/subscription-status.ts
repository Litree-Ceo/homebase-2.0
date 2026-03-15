/**
 * Subscription Status API - Check User's Plan
 * @workspace Returns current subscription tier and features
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCosmosClient } from '../shared/cosmos-client';

interface SubscriptionStatus {
  userId: string;
  plan: 'free' | 'pro' | 'enterprise';
  features: {
    apiCallsPerDay: number;
    cryptoCoins: number;
    priceAlerts: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
  };
  billingInfo?: {
    amount: number;
    currency: string;
    nextBillDate: string;
  };
}

const PLAN_FEATURES = {
  free: {
    apiCallsPerDay: 100,
    cryptoCoins: 3, // BTC, ETH, SOL
    priceAlerts: false,
    advancedAnalytics: false,
    prioritySupport: false,
  },
  pro: {
    apiCallsPerDay: 10000,
    cryptoCoins: 50,
    priceAlerts: true,
    advancedAnalytics: true,
    prioritySupport: false,
  },
  enterprise: {
    apiCallsPerDay: 1000000,
    cryptoCoins: 1000,
    priceAlerts: true,
    advancedAnalytics: true,
    prioritySupport: true,
  },
};

export async function subscriptionStatus(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const userId = request.query.get('userId') || request.headers.get('x-user-id');

    if (!userId) {
      return {
        status: 400,
        jsonBody: { error: 'userId required' },
      };
    }

    const cosmosClient = getCosmosClient();
    const container = cosmosClient.database('litlab').container('subscriptions');

    // Query for active subscription
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.userId = @userId AND c.status = @status',
        parameters: [
          { name: '@userId', value: userId },
          { name: '@status', value: 'active' },
        ],
      })
      .fetchAll();

    let plan: 'free' | 'pro' | 'enterprise' = 'free';
    let billingInfo;

    if (resources.length > 0) {
      const sub = resources[0];
      // Determine plan based on amount
      if (sub.amount >= 49.99) {
        plan = 'enterprise';
      } else if (sub.amount >= 9.99) {
        plan = 'pro';
      }

      billingInfo = {
        amount: sub.amount,
        currency: sub.currency,
        nextBillDate: sub.nextBillDate,
      };
    }

    const status: SubscriptionStatus = {
      userId,
      plan,
      features: PLAN_FEATURES[plan],
      billingInfo,
    };

    return {
      status: 200,
      jsonBody: status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
      },
    };
  } catch (error) {
    context.error('Subscription status error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Failed to fetch subscription status' },
    };
  }
}

app.http('subscription-status', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: subscriptionStatus,
});
