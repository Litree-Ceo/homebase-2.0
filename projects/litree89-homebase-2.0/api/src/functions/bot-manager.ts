/**
 * @workspace Bot Management API Endpoints
 *
 * POST /api/bot-api - Start/stop bots, create new bots
 * GET /api/bot-api - List all bots
 * GET /api/bot-signals - Get recent trading signals
 * GET /api/bot-analytics - Get profit metrics & analytics
 */

import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { BotEngine, getBotEngine, createBot, runBot, deleteBot } from '../bots/engine.js';
import { ProfitTracker } from '../bots/profit-tracker.js';

// Singleton instances
let botEngine: BotEngine | null = null;
let profitTracker: ProfitTracker | null = null;

function initializeServices() {
  if (!botEngine) {
    botEngine = getBotEngine();
  }
  if (!profitTracker) {
    profitTracker = new ProfitTracker();
  }
}

/**
 * GET /api/bot-api - List all bots
 * POST /api/bot-api - Create new bot or execute action
 */
export async function botApi(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    initializeServices();

    const url = new URL(request.url);
    const pathId = url.pathname.split('/').filter(Boolean).pop(); // support /api/bot-api/{id}

    // GET: List all bots
    if (request.method === 'GET') {
      const bots = botEngine!.listBots();
      const states = botEngine!.getAllBotStates();

      return {
        status: 200,
        body: JSON.stringify({
          success: true,
          bots: bots.map(bot => ({
            ...bot,
            state: states.get(bot.id),
          })),
        }),
      };
    }

    // POST: Create bot or execute action
    if (request.method === 'POST') {
      const body = (await request.json()) as Record<string, unknown> | null;
      const { action, config, botId } = body || {};
      const targetId = (config as Record<string, unknown> | undefined)?.id || botId || pathId;
      const resolvedAction =
        (action as string | undefined) ||
        ((config as Record<string, unknown> | undefined) && !targetId ? 'create' : undefined);

      // Start/stop action
      if (resolvedAction === 'start' && targetId) {
        botEngine!.setBotEnabled(targetId as string, true);
        return {
          status: 200,
          body: JSON.stringify({ success: true, message: `Bot ${targetId} started` }),
        };
      }

      if (resolvedAction === 'stop' && targetId) {
        botEngine!.setBotEnabled(targetId as string, false);
        return {
          status: 200,
          body: JSON.stringify({ success: true, message: `Bot ${targetId} stopped` }),
        };
      }

      // Create new bot
      if (resolvedAction === 'create' && config) {
        const botConfig = config as Record<string, unknown>;
        const strategy = (botConfig.strategy as string) || 'rsi-oversold';
        const newBot = createBot({
          name: (botConfig.name as string) || 'New Bot',
          strategy: strategy as any,
          coins: (botConfig.coins as string[]) || ['bitcoin'],
          checkIntervalMs: (botConfig.checkIntervalMs as number) || 300000,
          enabled: botConfig.enabled !== false,
          partitionKey: 'bots',
        });

        return {
          status: 201,
          body: JSON.stringify({
            success: true,
            bot: newBot,
            message: `Bot ${newBot.name} created`,
          }),
        };
      }

      return { status: 400, body: JSON.stringify({ error: 'Invalid action' }) };
    }

    return { status: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    context.error(`[Bot API Error] ${error}`);
    return { status: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
}

/**
 * GET /api/bot-signals - Get recent trading signals
 */
export async function botSignals(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    initializeServices();

    const limit = Number(request.query.get('limit')) || 50;
    const botId = request.query.get('botId');
    const severity = request.query.get('severity'); // 'critical', 'warning', 'info'

    // Run all bots to generate fresh signals
    const results = await botEngine!.runAllBots();

    let allSignals = results.flatMap(r => r.signals || []);

    // Filter by botId if specified
    if (botId) {
      allSignals = allSignals.filter(s => s.botId === botId);
    }

    // Filter by severity if specified
    if (severity) {
      allSignals = allSignals.filter(s => s.severity === severity);
    }

    // Sort by timestamp descending and limit
    allSignals = allSignals
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return {
      status: 200,
      body: JSON.stringify({
        success: true,
        signals: allSignals,
        count: allSignals.length,
        generatedAt: new Date().toISOString(),
      }),
    };
  } catch (error) {
    context.error(`[Bot Signals Error] ${error}`);
    return { status: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
}

/**
 * GET /api/bot-analytics - Get profit metrics and strategy performance
 */
export async function botAnalytics(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    initializeServices();

    const period = request.query.get('period') || 'all'; // 'day', 'week', 'month', 'all'
    const botId = request.query.get('botId');

    // Get all bot performance data
    const allPerformance = profitTracker!.getAllPerformance();

    let performance = allPerformance;
    if (botId) {
      performance = allPerformance.filter(p => p.botId === botId);
    }

    // Calculate aggregate metrics
    const totalProfit = performance.reduce((sum, p) => sum + p.netProfit, 0);
    const totalROI =
      performance.length > 0
        ? performance.reduce((sum, p) => sum + p.roi, 0) / performance.length
        : 0;
    const totalTrades = performance.reduce((sum, p) => sum + p.totalTrades, 0);
    const winRate =
      performance.length > 0
        ? performance.reduce((sum, p) => sum + p.winRate, 0) / performance.length
        : 0;

    // Top strategy
    const topStrategy = performance.sort((a, b) => b.roi - a.roi)[0];

    return {
      status: 200,
      body: JSON.stringify({
        success: true,
        metrics: {
          totalBots: performance.length,
          activeBots: botEngine!.listBots().filter(b => b.enabled).length,
          totalProfit,
          totalROI,
          dailyProfit: totalProfit / 30, // Rough estimate
          topStrategy: topStrategy?.strategy || 'None',
        },
        strategies: performance.map(p => ({
          name: p.strategy,
          roi: p.roi,
          winRate: p.winRate,
          trades: p.totalTrades,
          profit: p.netProfit,
        })),
        period,
        generatedAt: new Date().toISOString(),
      }),
    };
  } catch (error) {
    context.error(`[Bot Analytics Error] ${error}`);
    return { status: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
}

/**
 * Scheduled function: Run all bots every 5 minutes
 */
export async function botTimer(timer: string, context: InvocationContext): Promise<void> {
  try {
    initializeServices();

    context.log('[Bot Timer] Running all bots...');

    // Execute all enabled bots
    const results = await botEngine!.runAllBots();

    // Log results
    let successCount = 0;
    let errorCount = 0;

    for (const result of results) {
      if (result.success) {
        successCount++;
        if (result.signals.length > 0) {
          context.log(`[Bot Timer] ${result.botId}: ${result.signals.length} signals generated`);
        }
      } else {
        errorCount++;
        context.log(`[Bot Timer] ${result.botId}: Error - ${result.error}`);
      }
    }

    context.log(`[Bot Timer] Complete: ${successCount} successful, ${errorCount} errors`);
  } catch (error) {
    context.error(`[Bot Timer Error] ${error}`);
  }
}
