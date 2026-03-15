/**
 * Bot Management API - HTTP endpoints for controlling bots
 * @workspace REST API for bot CRUD and execution
 *
 * Endpoints:
 * - GET /api/bots - List all bots
 * - GET /api/bots/:id - Get bot details
 * - POST /api/bots - Create new bot
 * - PUT /api/bots/:id - Update bot
 * - DELETE /api/bots/:id - Delete bot
 * - POST /api/bots/:id/run - Manually run a bot
 * - GET /api/bots/signals - Get recent signals
 * - GET /api/bots/portfolio - Get paper trading portfolio
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CosmosClient } from '@azure/cosmos';
import { BotConfig, Signal } from '../bots/types';
import { runBot, runAllBots, createBot, updateBot, deleteBot, getBotState } from '../bots/engine';

let cosmosClient: CosmosClient | null = null;

function getCosmosClient(): CosmosClient | null {
  if (!cosmosClient) {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;
    if (endpoint && key) {
      cosmosClient = new CosmosClient({ endpoint, key });
    }
  }
  return cosmosClient;
}

// ─────────────────────────────────────────────────────────────────
// GET /api/bots - List all bots
// ─────────────────────────────────────────────────────────────────
app.http('listBots', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bots',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const client = getCosmosClient();
      if (!client) {
        // Return demo bots for testing
        return {
          status: 200,
          jsonBody: {
            bots: [
              {
                id: 'demo-price-alert',
                name: 'BTC Price Alert',
                enabled: true,
                strategy: 'price-alert',
                coins: ['bitcoin'],
                checkIntervalMs: 300000,
              },
              {
                id: 'demo-opportunity',
                name: 'Opportunity Detector',
                enabled: true,
                strategy: 'opportunity-detector',
                coins: ['bitcoin', 'ethereum', 'solana'],
                checkIntervalMs: 300000,
              },
            ],
          },
        };
      }

      const container = client.database('homebase').container('bots');
      const { resources } = await container.items
        .query<BotConfig>('SELECT * FROM c ORDER BY c.createdAt DESC')
        .fetchAll();

      return {
        status: 200,
        jsonBody: { bots: resources },
      };
    } catch (error) {
      context.error('Error listing bots:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to list bots' },
      };
    }
  },
});

// ─────────────────────────────────────────────────────────────────
// POST /api/bots/:id/run - Manually trigger a bot
// ─────────────────────────────────────────────────────────────────
app.http('runBot', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'bots/{id}/run',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const botId = request.params.id;

    if (!botId) {
      return { status: 400, jsonBody: { error: 'Bot ID required' } };
    }

    try {
      context.log(`🤖 Manually running bot: ${botId}`);
      const result = await runBot(botId);

      return {
        status: 200,
        jsonBody: {
          success: result.success,
          botId,
          signals: result.signals || [],
          error: result.error,
          runAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      context.error(`Error running bot ${botId}:`, error);
      return {
        status: 500,
        jsonBody: { error: `Failed to run bot: ${botId}` },
      };
    }
  },
});

// ─────────────────────────────────────────────────────────────────
// POST /api/bots/run-all - Run all enabled bots
// ─────────────────────────────────────────────────────────────────
app.http('runAllBots', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'bots/run-all',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      context.log('🤖 Running all bots manually...');
      const results = await runAllBots();

      const summary = {
        totalBots: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        totalSignals: results.reduce((sum, r) => sum + (r.signals?.length || 0), 0),
        results: results.map(r => ({
          botId: r.botId,
          success: r.success,
          signalCount: r.signals?.length || 0,
        })),
        runAt: new Date().toISOString(),
      };

      return {
        status: 200,
        jsonBody: summary,
      };
    } catch (error) {
      context.error('Error running all bots:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to run bots' },
      };
    }
  },
});

// ─────────────────────────────────────────────────────────────────
// GET /api/bots/signals - Get recent signals
// ─────────────────────────────────────────────────────────────────
app.http('getSignals', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bots/signals',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const limit = parseInt(request.query.get('limit') || '50');
      const client = getCosmosClient();

      if (!client) {
        // Demo signals for testing
        return {
          status: 200,
          jsonBody: {
            signals: [
              {
                id: 'demo-1',
                botId: 'demo-price-alert',
                timestamp: new Date().toISOString(),
                type: 'price-target-hit',
                coin: 'bitcoin',
                message: 'BTC crossed $100,000!',
                data: { price: 100500, target: 100000 },
              },
            ],
          },
        };
      }

      const container = client.database('homebase').container('signals');
      const { resources } = await container.items
        .query<Signal>({
          query: 'SELECT * FROM c ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit',
          parameters: [{ name: '@limit', value: limit }],
        })
        .fetchAll();

      return {
        status: 200,
        jsonBody: { signals: resources },
      };
    } catch (error) {
      context.error('Error getting signals:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to get signals' },
      };
    }
  },
});

// ─────────────────────────────────────────────────────────────────
// GET /api/bots/portfolio - Get paper trading portfolio
// ─────────────────────────────────────────────────────────────────
app.http('getPortfolio', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bots/portfolio',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const client = getCosmosClient();

      if (!client) {
        // Demo portfolio
        return {
          status: 200,
          jsonBody: {
            portfolio: {
              mode: 'paper',
              balances: {
                usd: 10000,
                bitcoin: 0.05,
                ethereum: 0.5,
              },
              totalValueUsd: 15234.56,
              pnl: 5234.56,
              pnlPercent: 52.35,
            },
          },
        };
      }

      const container = client.database('homebase').container('portfolios');
      const { resource } = await container.item('paper_portfolio', 'paper').read();

      return {
        status: 200,
        jsonBody: { portfolio: resource },
      };
    } catch (error) {
      context.error('Error getting portfolio:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to get portfolio' },
      };
    }
  },
});

// ─────────────────────────────────────────────────────────────────
// POST /api/bots/portfolio/trade - Execute paper trade
// ─────────────────────────────────────────────────────────────────
app.http('executeTrade', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'bots/portfolio/trade',
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const body = (await request.json()) as {
        side: 'buy' | 'sell';
        coinId: string;
        amountUsd?: number;
        coinAmount?: number;
      };

      if (!body.side || !body.coinId) {
        return { status: 400, jsonBody: { error: 'side and coinId required' } };
      }

      // Import paper trader
      const { paperTrader } = await import('../bots/paper-trading.js');

      let trade;
      if (body.side === 'buy') {
        const amount = body.amountUsd || 100;
        trade = await paperTrader.buy(body.coinId, amount);
      } else {
        trade = await paperTrader.sell(body.coinId, body.coinAmount);
      }

      if (!trade) {
        return { status: 400, jsonBody: { error: 'Trade failed - check balance' } };
      }

      const portfolio = await paperTrader.getPortfolioValue();

      return {
        status: 200,
        jsonBody: {
          trade,
          portfolio,
        },
      };
    } catch (error) {
      context.error('Error executing trade:', error);
      return {
        status: 500,
        jsonBody: { error: 'Failed to execute trade' },
      };
    }
  },
});
