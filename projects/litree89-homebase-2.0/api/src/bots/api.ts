/**
 * @workspace Bot HTTP API - REST endpoints for bot management
 *
 * Provides HTTP endpoints to:
 * - View bot status
 * - Trigger bot runs manually
 * - Configure alerts
 * - View signals
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getBotEngine } from './engine.js';
import {
  PriceAlertStrategy,
  OpportunityDetectorStrategy,
  SMACrossoverStrategy,
  quickArbitrageCheck,
  PRESET_ALERTS,
} from './strategies/index.js';
import { getMarketData, getTopMovers, getTrendingCoins } from './market-data.js';
import { PriceAlert, Signal } from './types.js';
import { generateId } from './utils.js';

// Store signals in memory (use Cosmos DB in production)
const signalHistory: Signal[] = [];
const MAX_SIGNAL_HISTORY = 100;

function addSignals(signals: Signal[]): void {
  signalHistory.unshift(...signals);
  if (signalHistory.length > MAX_SIGNAL_HISTORY) {
    signalHistory.length = MAX_SIGNAL_HISTORY;
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/bots - List all bots and their status
// ─────────────────────────────────────────────────────────────────
async function listBots(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const engine = getBotEngine();
  const bots = engine.listBots();
  const states = engine.getAllBotStates();

  return {
    status: 200,
    jsonBody: {
      bots: bots.map(b => ({
        ...b,
        state: states.get(b.id) ?? null,
      })),
      count: bots.length,
    },
  };
}

app.http('bots-list', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bots',
  handler: listBots,
});

// ─────────────────────────────────────────────────────────────────
// POST /api/bots/run/{strategy} - Trigger a bot run manually
// ─────────────────────────────────────────────────────────────────
async function runBot(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const strategy = request.params.strategy;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const coins = (body.coins as string[]) ?? ['bitcoin', 'ethereum', 'solana'];

  context.log(`[Bot API] Manual run requested: ${strategy}`);

  let signals: Signal[] = [];

  try {
    switch (strategy) {
      case 'price-alert': {
        const alerts: PriceAlert[] = PRESET_ALERTS.map(a => ({
          ...a,
          id: generateId('alert'),
          triggered: false,
          partitionKey: 'alerts',
        }));
        const strat = new PriceAlertStrategy(alerts);
        signals = await strat.execute(coins);
        break;
      }

      case 'opportunity': {
        const strat = new OpportunityDetectorStrategy({
          minChangePercent: 5,
          volumeMultiplier: 2,
          timeframeHours: 24,
        });
        signals = await strat.execute(coins);
        break;
      }

      case 'sma': {
        const strat = new SMACrossoverStrategy(7, 30);
        signals = await strat.execute(coins);
        break;
      }

      case 'arbitrage': {
        const coinId = coins[0] || 'bitcoin';
        const opp = await quickArbitrageCheck(coinId);
        if (opp) {
          signals.push({
            id: generateId('arb'),
            botId: 'arbitrage-scanner',
            timestamp: new Date().toISOString(),
            type: 'arbitrage-opportunity',
            coin: opp.coin,
            message: `Arbitrage: ${opp.spreadPercent.toFixed(2)}% spread`,
            data: { ...opp } as Record<string, unknown>,
            severity: 'info',
            acknowledged: false,
          });
        }
        break;
      }

      default:
        return {
          status: 400,
          jsonBody: {
            error: `Unknown strategy: ${strategy}`,
            available: ['price-alert', 'opportunity', 'sma', 'arbitrage'],
          },
        };
    }

    addSignals(signals);

    return {
      status: 200,
      jsonBody: {
        strategy,
        coins,
        signalsGenerated: signals.length,
        signals,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 500,
      jsonBody: { error: message },
    };
  }
}

app.http('bots-run', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'bots/run/{strategy}',
  handler: runBot,
});

// ─────────────────────────────────────────────────────────────────
// GET /api/bots/signals - Get recent signals
// ─────────────────────────────────────────────────────────────────
async function getSignals(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const limit = parseInt(request.query.get('limit') ?? '20');
  const coin = request.query.get('coin');
  const severity = request.query.get('severity');

  let filtered = signalHistory;

  if (coin) {
    filtered = filtered.filter(s => s.coin === coin);
  }
  if (severity) {
    filtered = filtered.filter(s => s.severity === severity);
  }

  return {
    status: 200,
    jsonBody: {
      signals: filtered.slice(0, limit),
      total: filtered.length,
    },
  };
}

app.http('bots-signals', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bots/signals',
  handler: getSignals,
});

// ─────────────────────────────────────────────────────────────────
// GET /api/bots/market - Get market overview
// ─────────────────────────────────────────────────────────────────
async function marketOverview(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const [majors, movers, trending] = await Promise.all([
      getMarketData(['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot']),
      getTopMovers(5),
      getTrendingCoins(),
    ]);

    return {
      status: 200,
      jsonBody: {
        timestamp: new Date().toISOString(),
        majorCoins: majors,
        topGainers: movers.gainers,
        topLosers: movers.losers,
        trending: trending.slice(0, 10),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 500,
      jsonBody: { error: message },
    };
  }
}

app.http('bots-market', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bots/market',
  handler: marketOverview,
});

// ─────────────────────────────────────────────────────────────────
// GET /api/bots/analysis/{coin} - Get technical analysis for a coin
// ─────────────────────────────────────────────────────────────────
async function coinAnalysis(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const coinId = request.params.coin;

  if (!coinId) {
    return {
      status: 400,
      jsonBody: { error: 'Coin ID required' },
    };
  }

  try {
    const smaStrat = new SMACrossoverStrategy(7, 30);
    const oppStrat = new OpportunityDetectorStrategy({
      minChangePercent: 5,
      volumeMultiplier: 2,
      timeframeHours: 24,
    });

    const [marketData, smaAnalysis, rsiSignal] = await Promise.all([
      getMarketData([coinId]),
      smaStrat.getCurrentAnalysis(coinId),
      oppStrat.checkRSI(coinId),
    ]);

    const market = marketData[0];

    return {
      status: 200,
      jsonBody: {
        coin: coinId,
        timestamp: new Date().toISOString(),
        price: market?.price ?? 0,
        change24h: market?.priceChange24h ?? 0,
        volume24h: market?.volume24h ?? 0,
        marketCap: market?.marketCap ?? 0,
        technicalAnalysis: {
          sma: smaAnalysis,
          rsi: rsiSignal?.data ?? null,
        },
        signals: rsiSignal ? [rsiSignal] : [],
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 500,
      jsonBody: { error: message },
    };
  }
}

app.http('bots-analysis', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'bots/analysis/{coin}',
  handler: coinAnalysis,
});
