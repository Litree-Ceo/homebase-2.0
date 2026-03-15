/**
 * Premium Crypto API - Enhanced Features for Paid Users
 * @workspace Advanced crypto data with price alerts, historical data, predictions
 * 💰 This is what you SELL to users!
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getCosmosClient } from '../shared/cosmos-client';

interface PriceAlert {
  id: string;
  userId: string;
  coin: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  triggered: boolean;
  createdAt: string;
}

export async function cryptoPremium(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const startTime = Date.now();
  
  try {
    const userId = request.headers.get('x-user-id');
    const feature = request.query.get('feature'); // alerts, history, predictions
    
    if (!userId) {
      return {
        status: 401,
        jsonBody: { error: 'Authentication required. Upgrade to Pro: $9.99/mo' }
      };
    }

    // Check subscription status
    const subscriptionResponse = await fetch(
      `http://localhost:7071/api/subscription-status?userId=${userId}`
    );
    const subscription = (await subscriptionResponse.json()) as {
      plan: 'free' | 'pro' | 'enterprise';
    };

    if (subscription.plan === 'free') {
      return {
        status: 403,
        jsonBody: {
          error: 'Premium feature requires Pro or Enterprise plan',
          upgrade: {
            pro: {
              price: '$9.99/month',
              features: ['10,000 API calls/day', '50 crypto coins', 'Price alerts', 'Historical data'],
              checkoutUrl: `https://checkout.paddle.com/checkout/custom/${process.env.PADDLE_PRO_PRODUCT_ID}`
            },
            enterprise: {
              price: '$49.99/month',
              features: ['1M API calls/day', '1000 coins', 'Priority support', 'Custom webhooks'],
              checkoutUrl: `https://checkout.paddle.com/checkout/custom/${process.env.PADDLE_ENTERPRISE_PRODUCT_ID}`
            }
          }
        }
      };
    }

    const cosmosClient = getCosmosClient();

    // FEATURE: Price Alerts
    if (feature === 'alerts') {
      const container = cosmosClient.database('litlab').container('priceAlerts');
      
      if (request.method === 'POST') {
        // Create new alert
        const body: any = await request.json();
        const alert: PriceAlert = {
          id: `alert-${Date.now()}-${userId}`,
          userId,
          coin: body.coin,
          condition: body.condition,
          targetPrice: body.targetPrice,
          currentPrice: body.currentPrice,
          triggered: false,
          createdAt: new Date().toISOString()
        };
        
        await container.items.create(alert);
        
        return {
          status: 201,
          jsonBody: { success: true, alert }
        };
      }
      
      // Get user's alerts
      const { resources: alerts } = await container.items
        .query({
          query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
          parameters: [{ name: '@userId', value: userId }]
        })
        .fetchAll();
      
      return {
        status: 200,
        jsonBody: { alerts }
      };
    }

    // FEATURE: Historical Data
    if (feature === 'history') {
      const coin = request.query.get('coin') || 'bitcoin';
      const days = Number.parseInt(request.query.get('days') || '30');
      
      // Fetch from CoinGecko
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`
      );
      const data = (await response.json()) as {
        prices: [number, number][];
        total_volumes: [number, number][];
        market_caps: [number, number][];
      };
      
      return {
        status: 200,
        jsonBody: {
          coin,
          days,
          prices: data.prices,
          volumes: data.total_volumes,
          marketCaps: data.market_caps
        }
      };
    }

    // FEATURE: AI Predictions (coming soon)
    if (feature === 'predictions') {
      return {
        status: 501,
        jsonBody: {
          message: 'AI predictions coming soon',
          teaser: 'Upgrade to Enterprise for early access'
        }
      };
    }

    return {
      status: 400,
      jsonBody: {
        error: 'Invalid feature',
        available: ['alerts', 'history', 'predictions']
      }
    };

  } catch (error) {
    context.error('Premium API error:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  } finally {
    context.log(`⏱️ Premium API: ${Date.now() - startTime}ms`);
  }
}

app.http('crypto-premium', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: cryptoPremium
});
