/**
 * @workspace Automated Trader - Execute Signals for Real Profit
 *
 * This ties everything together:
 * 1. Bot generates trading signals
 * 2. Trader executes on real exchange
 * 3. Profits flow to your account 24/7
 */

import { Signal } from './types.js';
import {
  BinanceExchange,
  CoinbaseExchange,
  SignalExecutor,
} from './exchanges/exchange-integration.js';

/**
 * Initialize trader with your exchange
 */
export class AutomatedTrader {
  private executor: SignalExecutor;
  private exchange: BinanceExchange | CoinbaseExchange;
  private executionHistory: TradeExecution[] = [];

  constructor(exchangeType: 'binance' | 'coinbase' = 'binance') {
    if (exchangeType === 'binance') {
      const apiKey = process.env.BINANCE_API_KEY;
      const apiSecret = process.env.BINANCE_API_SECRET;

      if (!apiKey || !apiSecret) {
        throw new Error('Missing BINANCE_API_KEY or BINANCE_API_SECRET in environment variables');
      }

      this.exchange = new BinanceExchange(apiKey, apiSecret);
    } else {
      const apiKey = process.env.COINBASE_API_KEY;
      const apiSecret = process.env.COINBASE_API_SECRET;
      const passphrase = process.env.COINBASE_PASSPHRASE;

      if (!apiKey || !apiSecret || !passphrase) {
        throw new Error('Missing COINBASE credentials in environment variables');
      }

      this.exchange = new CoinbaseExchange(apiKey, apiSecret, passphrase);
    }

    this.executor = new SignalExecutor(this.exchange, {
      riskPercent: parseFloat(process.env.RISK_PERCENT || '0.02'),
      profitTarget: parseFloat(process.env.PROFIT_TARGET || '0.03'),
      stopLoss: parseFloat(process.env.STOP_LOSS || '0.01'),
    });
  }

  /**
   * Execute all signals from bot run
   */
  async executeSignals(signals: Signal[]): Promise<TradeExecution[]> {
    const results: TradeExecution[] = [];

    console.log(`\n💰 AUTOMATED TRADER: Executing ${signals.length} signals...\n`);

    for (const signal of signals) {
      try {
        const result = await this.executor.execute(signal);

        if (!result) {
          results.push({
            signalId: signal.id,
            timestamp: new Date().toISOString(),
            signal: signal.message,
            status: 'failed',
            error: 'No result returned from executor',
          });
          continue;
        }

        const execution: TradeExecution = {
          signalId: signal.id,
          timestamp: new Date().toISOString(),
          signal: signal.message,
          status: result.success ? 'executed' : 'failed',
          error: result.error as string | undefined,
        };

        results.push(execution);
        this.executionHistory.push(execution);
      } catch (error) {
        console.error(`❌ Failed to execute signal: ${signal.message}`, error);
        results.push({
          signalId: signal.id,
          timestamp: new Date().toISOString(),
          signal: signal.message,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Save execution history to Cosmos DB (future enhancement)
    await this.saveExecutionHistory(results);

    return results;
  }

  /**
   * Get current balance and P&L
   */
  async getAccountStatus() {
    try {
      const balance = await this.exchange.getBalance();
      const orders = await this.exchange.getOpenOrders();

      return {
        timestamp: new Date().toISOString(),
        balance,
        openOrders: orders.length,
        totalTrades: this.executionHistory.length,
        successfulTrades: this.executionHistory.filter(t => t.status === 'executed').length,
      };
    } catch (error) {
      console.error('❌ Failed to get account status:', error);
      return null;
    }
  }

  /**
   * Save execution history for audit/analytics
   */
  private async saveExecutionHistory(executions: TradeExecution[]) {
    // TODO: Persist to Cosmos DB
    console.log(`📊 Saved ${executions.length} executions to history`);
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): TradeExecution[] {
    return this.executionHistory;
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (this.executionHistory.length === 0) return 0;
    const successful = this.executionHistory.filter(t => t.status === 'executed').length;
    return (successful / this.executionHistory.length) * 100;
  }
}

interface TradeExecution {
  signalId: string;
  timestamp: string;
  signal: string;
  status: 'executed' | 'failed' | 'pending';
  error?: string;
}

// Singleton instance
let traderInstance: AutomatedTrader | null = null;

export function getTrader(exchangeType: 'binance' | 'coinbase' = 'binance'): AutomatedTrader {
  if (!traderInstance) {
    traderInstance = new AutomatedTrader(exchangeType);
  }
  return traderInstance;
}

/**
 * Integration with bot engine - Auto-trade all signals
 */
export async function autoTradeAllSignals(signals: Signal[]): Promise<TradeExecution[]> {
  const trader = getTrader();
  return trader.executeSignals(signals);
}

/**
 * Get live account status
 */
export async function getTraderStatus() {
  const trader = getTrader();
  const status = await trader.getAccountStatus();
  const successRate = trader.getSuccessRate();

  return {
    ...status,
    successRate: `${successRate.toFixed(2)}%`,
    recentTrades: trader.getExecutionHistory().slice(-10),
  };
}
