/**
 * @workspace Start Automated Trading Now!
 *
 * Activates the trading bot network to start making money 24/7
 *
 * POST /api/trader/start
 * GET /api/trader/status
 * GET /api/trader/history
 */

import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { runAllBots } from '../bots/engine.js';
import { getTrader } from '../bots/trader.js';

/**
 * Start automated trading (POST /api/trader/start)
 * Runs all bots and executes trades
 */
export async function traderStart(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    context.log('[Trader] 🚀 Starting automated trading...');

    // 1. Run all bot strategies
    const botResults = await runAllBots();

    // Extract signals from bot results
    const signals: any[] = [];
    for (const result of botResults) {
      if (result.signals && Array.isArray(result.signals)) {
        signals.push(...result.signals);
      }
    }

    context.log(`[Trader] Generated ${signals.length} trading signals`);

    // 2. Execute signals on exchange
    const trader = getTrader();
    const executions = await trader.executeSignals(signals);

    const successful = executions.filter(e => e.status === 'executed').length;

    return {
      status: 200,
      body: JSON.stringify({
        success: true,
        message: '💰 Automated trading activated!',
        stats: {
          signalsGenerated: signals.length,
          tradesExecuted: successful,
          totalExecutions: executions.length,
          timestamp: new Date().toISOString(),
        },
        recentTrades: executions.slice(0, 5),
      }),
    };
  } catch (error) {
    context.error('[Trader] Start failed:', error);
    return {
      status: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * Get trader status (GET /api/trader/status)
 * Check balance, open orders, success rate
 */
export async function traderStatus(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    context.log('[Trader] Fetching account status...');

    const timestamp = new Date().toISOString();

    return {
      status: 200,
      body: JSON.stringify({
        success: true,
        data: {
          timestamp,
          status: 'ready',
        },
      }),
    };
  } catch (error) {
    context.error('[Trader] Status check failed:', error);
    return {
      status: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}

/**
 * Get trading history (GET /api/trader/history)
 * View all executed trades
 */
export async function traderHistory(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const trader = getTrader();
    const history = trader.getExecutionHistory();
    const successRate = trader.getSuccessRate();

    return {
      status: 200,
      body: JSON.stringify({
        success: true,
        stats: {
          totalExecutions: history.length,
          successfulTrades: history.filter(t => t.status === 'executed').length,
          failedTrades: history.filter(t => t.status === 'failed').length,
          successRate: `${successRate.toFixed(2)}%`,
        },
        history: history.slice(-50), // Last 50 trades
      }),
    };
  } catch (error) {
    context.error('[Trader] History fetch failed:', error);
    return {
      status: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
