/**
 * @workspace Bot Scheduler - Timer-triggered autonomous execution
 *
 * Azure Functions timer triggers that run bots on schedule.
 * Each trigger manages a specific bot or bot group.
 */

import { app, InvocationContext, Timer } from '@azure/functions';
import { getBotEngine, initBotEngine } from './engine.js';
import { PriceAlertStrategy, PRESET_ALERTS } from './strategies/price-alert.js';
import { OpportunityDetectorStrategy } from './strategies/opportunity-detector.js';
import { SMACrossoverStrategy } from './strategies/sma-crossover.js';
import { Signal, PriceAlert, StrategyParams } from './types.js';
import { generateId } from './utils.js';

// ─────────────────────────────────────────────────────────────────
// Notification Handler (pluggable)
// ─────────────────────────────────────────────────────────────────
async function handleSignals(signals: Signal[], context: InvocationContext): Promise<void> {
  for (const signal of signals) {
    // Console logging
    context.log(`[${signal.severity.toUpperCase()}] ${signal.message}`);
    context.log(`  Coin: ${signal.coin} | Type: ${signal.type}`);

    // TODO: Persist to Cosmos DB
    // const cosmosClient = getCosmosClient();
    // await cosmosClient.database('litlabs-db').container('signals').items.create(signal);

    // TODO: Send webhook notification
    // await fetch(process.env.WEBHOOK_URL, {
    //   method: 'POST',
    //   body: JSON.stringify(signal),
    // });

    // TODO: SignalR for real-time UI
    // await signalRConnection.send('newSignal', signal);
  }
}

// ─────────────────────────────────────────────────────────────────
// Timer Trigger: Price Alerts (Every minute)
// ─────────────────────────────────────────────────────────────────
let priceAlertStrategy: PriceAlertStrategy | null = null;

async function priceAlertTimer(timer: Timer, context: InvocationContext): Promise<void> {
  context.log('[Bot] Price Alert check triggered');

  // Initialize strategy with preset alerts on first run
  if (!priceAlertStrategy) {
    const alerts: PriceAlert[] = PRESET_ALERTS.map(a => ({
      ...a,
      id: generateId('alert'),
      triggered: false,
      partitionKey: 'alerts',
    }));
    priceAlertStrategy = new PriceAlertStrategy(alerts);
    context.log(`[Bot] Initialized with ${alerts.length} price alerts`);
  }

  try {
    const coins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'dogecoin'];
    const signals = await priceAlertStrategy.execute(coins);

    if (signals.length > 0) {
      context.log(`[Bot] Generated ${signals.length} price alert signals`);
      await handleSignals(signals, context);
    } else {
      context.log('[Bot] No price alerts triggered');
    }
  } catch (error) {
    context.error('[Bot] Price alert error:', error);
  }
}

// Register timer: Every minute
app.timer('bot-price-alerts', {
  schedule: '0 */1 * * * *', // Every minute
  handler: priceAlertTimer,
  runOnStartup: false, // Set true for testing
});

// ─────────────────────────────────────────────────────────────────
// Timer Trigger: Opportunity Detector (Every 5 minutes)
// ─────────────────────────────────────────────────────────────────
let opportunityDetector: OpportunityDetectorStrategy | null = null;

async function opportunityTimer(timer: Timer, context: InvocationContext): Promise<void> {
  context.log('[Bot] Opportunity Detector triggered');

  if (!opportunityDetector) {
    opportunityDetector = new OpportunityDetectorStrategy({
      minChangePercent: 5,
      volumeMultiplier: 2,
      timeframeHours: 24,
    });
  }

  try {
    const watchlist = ['bitcoin', 'ethereum', 'solana', 'cardano', 'avalanche-2', 'polkadot'];
    const signals = await opportunityDetector.execute(watchlist);

    if (signals.length > 0) {
      context.log(`[Bot] Found ${signals.length} opportunities`);
      await handleSignals(signals, context);
    } else {
      context.log('[Bot] No opportunities detected');
    }
  } catch (error) {
    context.error('[Bot] Opportunity detector error:', error);
  }
}

// Register timer: Every 5 minutes
app.timer('bot-opportunity-detector', {
  schedule: '0 */5 * * * *', // Every 5 minutes
  handler: opportunityTimer,
  runOnStartup: false,
});

// ─────────────────────────────────────────────────────────────────
// Timer Trigger: SMA Crossover (Every hour)
// ─────────────────────────────────────────────────────────────────
let smaStrategy: SMACrossoverStrategy | null = null;

async function smaTimer(timer: Timer, context: InvocationContext): Promise<void> {
  context.log('[Bot] SMA Crossover check triggered');

  if (!smaStrategy) {
    smaStrategy = new SMACrossoverStrategy(7, 30);
  }

  try {
    const coins = ['bitcoin', 'ethereum', 'solana'];
    const signals = await smaStrategy.execute(coins);

    if (signals.length > 0) {
      context.log(`[Bot] SMA crossover signals: ${signals.length}`);
      await handleSignals(signals, context);
    } else {
      context.log('[Bot] No SMA crossovers detected');
    }
  } catch (error) {
    context.error('[Bot] SMA crossover error:', error);
  }
}

// Register timer: Every hour
app.timer('bot-sma-crossover', {
  schedule: '0 0 * * * *', // Every hour on the hour
  handler: smaTimer,
  runOnStartup: false,
});

// ─────────────────────────────────────────────────────────────────
// Timer Trigger: Daily Summary (Once daily at 8 AM)
// ─────────────────────────────────────────────────────────────────
async function dailySummaryTimer(timer: Timer, context: InvocationContext): Promise<void> {
  context.log('[Bot] Daily summary triggered');

  try {
    // Gather 24h stats
    const { getTopMovers, getTrendingCoins, getMarketData } = await import('./market-data.js');

    const { gainers, losers } = await getTopMovers(5);
    const trending = await getTrendingCoins();
    const majors = await getMarketData(['bitcoin', 'ethereum', 'solana']);

    const summary = {
      timestamp: new Date().toISOString(),
      majorCoins: majors.map((m: { coin: string; price: number; priceChange24h: number }) => ({
        coin: m.coin,
        price: m.price,
        change24h: m.priceChange24h,
      })),
      topGainers: gainers.slice(0, 3).map((g: { coin: string; priceChange24h: number }) => ({
        coin: g.coin,
        change: g.priceChange24h,
      })),
      topLosers: losers.slice(0, 3).map((l: { coin: string; priceChange24h: number }) => ({
        coin: l.coin,
        change: l.priceChange24h,
      })),
      trending: trending.slice(0, 5),
    };

    context.log('[Bot] Daily Summary:', JSON.stringify(summary, null, 2));

    // TODO: Send daily digest email/notification
    // await sendDailyDigest(summary);
  } catch (error) {
    context.error('[Bot] Daily summary error:', error);
  }
}

// Register timer: Daily at 8 AM UTC
app.timer('bot-daily-summary', {
  schedule: '0 0 8 * * *', // 8:00 AM UTC daily
  handler: dailySummaryTimer,
  runOnStartup: false,
});

// ─────────────────────────────────────────────────────────────────
// Timer Trigger: Health Check (Every 15 minutes)
// ─────────────────────────────────────────────────────────────────
async function botHealthTimer(timer: Timer, context: InvocationContext): Promise<void> {
  const engine = getBotEngine();
  const states = engine.getAllBotStates();

  context.log('[Bot] Health check - Active bots:', states.size);

  for (const [botId, state] of states) {
    if (state.errorCount > 5) {
      context.warn(`[Bot] ${botId} has ${state.errorCount} errors - may need attention`);
    }
  }
}

// Register timer: Every 15 minutes
app.timer('bot-health-check', {
  schedule: '0 */15 * * * *',
  handler: botHealthTimer,
  runOnStartup: false,
});

// ─────────────────────────────────────────────────────────────────
// Exports for testing
// ─────────────────────────────────────────────────────────────────
export { priceAlertTimer, opportunityTimer, smaTimer, dailySummaryTimer, botHealthTimer };
