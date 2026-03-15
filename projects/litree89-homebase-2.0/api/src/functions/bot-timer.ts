/**
 * Bot Timer Trigger - Runs bots automatically every 5 minutes
 * @workspace Azure Function that executes bots on schedule
 *
 * This is what makes the bots AUTONOMOUS - they run 24/7 without you
 */

import { app, InvocationContext, Timer } from '@azure/functions';
import { runAllBots, runBot } from '../bots/engine';

// ─────────────────────────────────────────────────────────────────
// Every 5 Minutes: Quick Opportunity Scan
// ─────────────────────────────────────────────────────────────────
app.timer('botTimer5Min', {
  // Runs at 0, 5, 10, 15... minutes of every hour
  schedule: '0 */5 * * * *',
  handler: async (timer: Timer, context: InvocationContext) => {
    context.log('⏰ [BotTimer] 5-minute scan starting...');

    try {
      const results = await runAllBots();

      const summary = {
        botsRun: results.length,
        successful: results.filter(r => r.success).length,
        signalsGenerated: results.reduce((sum, r) => sum + (r.signals?.length || 0), 0),
        timestamp: new Date().toISOString(),
      };

      context.log('✅ [BotTimer] 5-minute scan complete:', summary);

      // Log high-priority signals
      for (const result of results) {
        if (result.signals?.length) {
          for (const signal of result.signals) {
            if (signal.type === 'flash-crash' || signal.type === 'breakout') {
              context.log(`🚨 [ALERT] ${signal.coin}: ${signal.message}`);
            }
          }
        }
      }
    } catch (error) {
      context.error('❌ [BotTimer] Error:', error);
    }
  },
});

// ─────────────────────────────────────────────────────────────────
// Every Hour: Deep Analysis
// ─────────────────────────────────────────────────────────────────
app.timer('botTimerHourly', {
  // Runs at the top of every hour
  schedule: '0 0 * * * *',
  handler: async (timer: Timer, context: InvocationContext) => {
    context.log('⏰ [BotTimer] Hourly deep analysis starting...');

    try {
      // Run specific strategies that need more data
      const smaResult = await runBot('sma-crossover-bot');
      const arbitrageResult = await runBot('arbitrage-scanner-bot');

      context.log('✅ [BotTimer] Hourly analysis complete:', {
        smaSignals: smaResult.signals?.length || 0,
        arbitrageSignals: arbitrageResult.signals?.length || 0,
      });
    } catch (error) {
      context.error('❌ [BotTimer] Hourly error:', error);
    }
  },
});

// ─────────────────────────────────────────────────────────────────
// Daily at 8 AM UTC: Portfolio Summary
// ─────────────────────────────────────────────────────────────────
app.timer('botTimerDaily', {
  // 8 AM UTC daily
  schedule: '0 0 8 * * *',
  handler: async (timer: Timer, context: InvocationContext) => {
    context.log('📊 [BotTimer] Daily summary starting...');

    try {
      // TODO: Generate and send daily report
      // - Portfolio value
      // - 24h PnL
      // - Best/worst performers
      // - Opportunities missed

      context.log('✅ [BotTimer] Daily summary complete');
    } catch (error) {
      context.error('❌ [BotTimer] Daily error:', error);
    }
  },
});
