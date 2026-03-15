/**
 * @workspace Bot Engine - Core Orchestrator for Autonomous Trading Bots
 *
 * The brain of the system. Manages bot lifecycle, executes strategies,
 * and coordinates signal generation and notifications.
 */

import { BotConfig, BotState, BotResult, Signal, StrategyParams, MarketData } from './types.js';
import { PriceAlertStrategy } from './strategies/price-alert.js';
import { OpportunityDetectorStrategy } from './strategies/opportunity-detector.js';
import { SMACrossoverStrategy } from './strategies/sma-crossover.js';
import { RSIOversoldStrategy } from './strategies/rsi-oversold.js';
import { MomentumScalpStrategy } from './strategies/momentum-scalp.js';
import { GridTradingStrategy } from './strategies/grid-trading.js';
import { generateId } from './utils.js';

// ─────────────────────────────────────────────────────────────────
// Utility: Fetch prices from CoinGecko
// ─────────────────────────────────────────────────────────────────
export async function fetchPrices(coinIds: string[]): Promise<Map<string, MarketData>> {
  const prices = new Map<string, MarketData>();

  try {
    const ids = coinIds.join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;

    interface CoinGeckoData {
      usd?: number;
      usd_24h_change?: number;
      usd_market_cap?: number;
      usd_24h_vol?: number;
    }

    const response = await fetch(url);
    const data = (await response.json()) as Record<string, CoinGeckoData>;

    for (const coinId of coinIds) {
      if (data[coinId]) {
        prices.set(coinId, {
          coin: coinId,
          price: data[coinId].usd ?? 0,
          priceChange24h: data[coinId].usd_24h_change ?? 0,
          marketCap: data[coinId].usd_market_cap ?? 0,
          volume24h: data[coinId].usd_24h_vol ?? 0,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('[fetchPrices] Failed:', error);
  }

  return prices;
}

// ─────────────────────────────────────────────────────────────────
// Bot Registry & State Management
// ─────────────────────────────────────────────────────────────────
const activeBots = new Map<string, BotConfig>();
const botStates = new Map<string, BotState>();

// ─────────────────────────────────────────────────────────────────
// Strategy Executor Factory
// ─────────────────────────────────────────────────────────────────
type StrategyExecutor = (config: BotConfig, params?: StrategyParams) => Promise<Signal[]>;

const strategies: Record<string, StrategyExecutor> = {
  'price-alert': async (config, params) => {
    const alerts = params?.priceAlert?.alerts ?? [];
    const strategy = new PriceAlertStrategy(alerts);
    return strategy.execute(config.coins);
  },

  'opportunity-detector': async (config, params) => {
    const p = params?.opportunityDetector ?? {
      minChangePercent: 5,
      volumeMultiplier: 2,
      timeframeHours: 24,
    };
    const strategy = new OpportunityDetectorStrategy(p);
    return strategy.execute(config.coins);
  },

  'sma-crossover': async (config, params) => {
    const p = params?.smaCrossover ?? { shortPeriod: 7, longPeriod: 30 };
    const strategy = new SMACrossoverStrategy(p.shortPeriod, p.longPeriod);
    return strategy.execute(config.coins);
  },

  'rsi-oversold': async (config, params) => {
    const p = (params?.rsiOversold as any) ?? {
      rsiPeriod: 14,
      oversoldThreshold: 30,
      overboughtThreshold: 70,
      requireConfirmation: true,
    };
    const strategy = new RSIOversoldStrategy(
      p.rsiPeriod,
      p.oversoldThreshold,
      p.overboughtThreshold,
      p.requireConfirmation,
    );
    return strategy.execute(config.coins);
  },

  'momentum-scalp': async (config, _params) => {
    // TODO: Implement momentum scalp
    return [];
  },

  'grid-trading': async (config, _params) => {
    // TODO: Implement grid trading
    return [];
  },

  'arbitrage-scanner': async (config, _params) => {
    // Placeholder - requires multiple exchange APIs
    console.log('[Bot] Arbitrage scanner not yet implemented');
    return [];
  },

  'volume-spike': async (config, _params) => {
    // TODO: Implement volume spike detection
    return [];
  },
};

// ─────────────────────────────────────────────────────────────────
// Bot Engine Class
// ─────────────────────────────────────────────────────────────────
export class BotEngine {
  private readonly cosmosClient?: unknown; // Injected for persistence

  constructor(options?: { cosmosClient?: unknown }) {
    this.cosmosClient = options?.cosmosClient;
  }

  /**
   * Register a new bot
   */
  registerBot(config: Omit<BotConfig, 'id' | 'createdAt' | 'updatedAt'>): BotConfig {
    const bot: BotConfig = {
      ...config,
      id: generateId('bot'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      partitionKey: 'bots',
    };

    activeBots.set(bot.id, bot);
    botStates.set(bot.id, {
      botId: bot.id,
      lastRun: '',
      lastSignal: null,
      runCount: 0,
      successCount: 0,
      errorCount: 0,
      isRunning: false,
    });

    console.log(`[BotEngine] Registered bot: ${bot.name} (${bot.id})`);
    return bot;
  }

  /**
   * Execute a single bot
   */
  async runBot(botId: string, params?: StrategyParams): Promise<BotResult> {
    const startTime = Date.now();
    const config = activeBots.get(botId);

    if (!config) {
      return {
        botId,
        success: false,
        signals: [],
        executionTimeMs: 0,
        error: `Bot not found: ${botId}`,
        timestamp: new Date().toISOString(),
      };
    }

    if (!config.enabled) {
      return {
        botId,
        success: false,
        signals: [],
        executionTimeMs: 0,
        error: 'Bot is disabled',
        timestamp: new Date().toISOString(),
      };
    }

    const state = botStates.get(botId)!;
    state.isRunning = true;

    try {
      const executor = strategies[config.strategy];
      if (!executor) {
        throw new Error(`Unknown strategy: ${config.strategy}`);
      }

      const signals = await executor(config, params);

      // Update state
      state.lastRun = new Date().toISOString();
      state.runCount++;
      state.successCount++;
      if (signals.length > 0) {
        state.lastSignal = signals.at(-1) || null;
      }

      const result: BotResult = {
        botId,
        success: true,
        signals,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };

      // Handle signals (notify, persist, etc.)
      for (const signal of signals) {
        await this.handleSignal(signal);
      }

      return result;
    } catch (error) {
      state.errorCount++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        botId,
        success: false,
        signals: [],
        executionTimeMs: Date.now() - startTime,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    } finally {
      state.isRunning = false;
    }
  }

  /**
   * Run all enabled bots
   */
  async runAllBots(params?: StrategyParams): Promise<BotResult[]> {
    const results: BotResult[] = [];

    for (const [botId, config] of activeBots) {
      if (config.enabled) {
        const result = await this.runBot(botId, params);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Handle generated signals
   */
  private async handleSignal(signal: Signal): Promise<void> {
    // Log to console
    console.log(`[Signal] ${signal.severity.toUpperCase()}: ${signal.message}`);
    console.log(`  Coin: ${signal.coin} | Type: ${signal.type}`);
    console.log(`  Data:`, JSON.stringify(signal.data, null, 2));

    // NOTE: Signal persistence, webhooks, and real-time updates
    // can be implemented by integrating with:
    // - Cosmos DB for persistence (via cosmosClient)
    // - Azure Functions for webhook notifications
    // - SignalR for real-time UI updates via Azure SignalR Service
  }

  /**
   * Get bot status
   */
  getBotState(botId: string): BotState | undefined {
    return botStates.get(botId);
  }

  /**
   * Get all bot states
   */
  getAllBotStates(): Map<string, BotState> {
    return new Map(botStates);
  }

  /**
   * Enable/disable bot
   */
  setBotEnabled(botId: string, enabled: boolean): boolean {
    const config = activeBots.get(botId);
    if (!config) return false;

    config.enabled = enabled;
    config.updatedAt = new Date().toISOString();
    return true;
  }

  /**
   * Remove a bot
   */
  removeBot(botId: string): boolean {
    const removed = activeBots.delete(botId);
    botStates.delete(botId);
    return removed;
  }

  /**
   * List all registered bots
   */
  listBots(): BotConfig[] {
    return Array.from(activeBots.values());
  }
}

// ─────────────────────────────────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────────────────────────────────
let engineInstance: BotEngine | null = null;

export function getBotEngine(): BotEngine {
  engineInstance ??= new BotEngine();
  return engineInstance;
}

export function initBotEngine(options?: { cosmosClient?: unknown }): BotEngine {
  engineInstance = new BotEngine(options);
  return engineInstance;
}

// ─────────────────────────────────────────────────────────────────
// Convenience exports for use in functions
// ─────────────────────────────────────────────────────────────────
export async function runBot(botId: string, params?: StrategyParams): Promise<BotResult> {
  return getBotEngine().runBot(botId, params);
}

export async function runAllBots(params?: StrategyParams): Promise<BotResult[]> {
  return getBotEngine().runAllBots(params);
}

export function getBotState(botId: string): BotState | undefined {
  return getBotEngine().getBotState(botId);
}

export function createBot(config: Omit<BotConfig, 'id' | 'createdAt' | 'updatedAt'>): BotConfig {
  return getBotEngine().registerBot(config);
}

export function updateBot(botId: string, enabled: boolean): boolean {
  return getBotEngine().setBotEnabled(botId, enabled);
}

export function deleteBot(botId: string): boolean {
  return getBotEngine().removeBot(botId);
}
