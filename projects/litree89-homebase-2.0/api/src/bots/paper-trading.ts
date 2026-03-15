/**
 * Paper Trading Module
 * @workspace Simulates trades without real money
 *
 * Use this to:
 * 1. Test strategies before going live
 * 2. Track performance over time
 * 3. Build confidence in your bots
 */

import { CosmosClient } from '@azure/cosmos';
import { Trade, Portfolio, MarketData } from './types.js';
import { fetchPrices } from './engine.js';

export class PaperTrader {
  private cosmosClient: CosmosClient | null = null;
  private portfolio: Portfolio;

  constructor(initialBalanceUsd: number = 10000) {
    this.portfolio = {
      id: 'paper_portfolio',
      mode: 'paper',
      balances: { usd: initialBalanceUsd },
      totalValueUsd: initialBalanceUsd,
      pnl: 0,
      pnlPercent: 0,
      lastUpdated: new Date().toISOString(),
    };

    this.initCosmos();
    this.loadPortfolio();
  }

  private initCosmos(): void {
    const endpoint = process.env.COSMOS_ENDPOINT;
    const key = process.env.COSMOS_KEY;

    if (endpoint && key) {
      this.cosmosClient = new CosmosClient({ endpoint, key });
    }
  }

  private async loadPortfolio(): Promise<void> {
    if (!this.cosmosClient) return;

    try {
      const container = this.cosmosClient.database('homebase').container('portfolios');

      const { resource } = await container.item('paper_portfolio', 'paper').read<Portfolio>();
      if (resource) {
        this.portfolio = resource;
      }
    } catch {
      // Use default portfolio
    }
  }

  private async savePortfolio(): Promise<void> {
    if (!this.cosmosClient) return;

    try {
      const container = this.cosmosClient.database('homebase').container('portfolios');

      await container.items.upsert({
        ...this.portfolio,
        partitionKey: 'paper',
      });
    } catch (error) {
      console.error('[PaperTrader] Failed to save portfolio:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Trading Operations
  // ─────────────────────────────────────────────────────────────────

  async buy(coinId: string, amountUsd: number): Promise<Trade | null> {
    // Check balance
    const usdBalance = this.portfolio.balances.usd || 0;
    if (amountUsd > usdBalance) {
      console.error(`[PaperTrader] Insufficient balance: $${usdBalance} < $${amountUsd}`);
      return null;
    }

    // Get current price
    const prices = await fetchPrices([coinId]);
    const priceData = prices.get(coinId);
    if (!priceData) {
      console.error(`[PaperTrader] Could not get price for ${coinId}`);
      return null;
    }

    const price = priceData.price;
    const coinAmount = amountUsd / price;
    const fee = amountUsd * 0.001; // 0.1% fee

    // Execute trade
    this.portfolio.balances.usd = usdBalance - amountUsd;
    this.portfolio.balances[coinId] = (this.portfolio.balances[coinId] || 0) + coinAmount;
    this.portfolio.lastUpdated = new Date().toISOString();

    // Create trade record
    const trade: Trade = {
      id: `paper_buy_${Date.now()}`,
      botId: 'paper_trader',
      mode: 'paper',
      side: 'buy',
      coin: coinId,
      coinId: coinId,
      symbol: coinId.toUpperCase(),
      amount: coinAmount,
      price,
      total: amountUsd,
      fee,
      status: 'filled',
      executedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await this.savePortfolio();
    await this.saveTrade(trade);

    console.log(
      `[PaperTrader] 📈 BUY ${coinAmount.toFixed(
        6,
      )} ${coinId.toUpperCase()} @ $${price.toLocaleString()} = $${amountUsd}`,
    );

    return trade;
  }

  async sell(coinId: string, amount?: number): Promise<Trade | null> {
    const coinBalance = this.portfolio.balances[coinId] || 0;
    const sellAmount = amount || coinBalance; // Sell all if not specified

    if (sellAmount > coinBalance) {
      console.error(`[PaperTrader] Insufficient ${coinId}: ${coinBalance} < ${sellAmount}`);
      return null;
    }

    // Get current price
    const prices = await fetchPrices([coinId]);
    const priceData = prices.get(coinId);
    if (!priceData) {
      console.error(`[PaperTrader] Could not get price for ${coinId}`);
      return null;
    }

    const price = priceData.price;
    const usdValue = sellAmount * price;
    const fee = usdValue * 0.001; // 0.1% fee

    // Execute trade
    this.portfolio.balances[coinId] = coinBalance - sellAmount;
    this.portfolio.balances.usd = (this.portfolio.balances.usd || 0) + usdValue - fee;
    this.portfolio.lastUpdated = new Date().toISOString();

    // Create trade record
    const trade: Trade = {
      id: `paper_sell_${Date.now()}`,
      botId: 'paper_trader',
      mode: 'paper',
      side: 'sell',
      coin: coinId,
      coinId: coinId,
      symbol: coinId.toUpperCase(),
      amount: sellAmount,
      price,
      total: usdValue,
      fee,
      status: 'filled',
      executedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await this.savePortfolio();
    await this.saveTrade(trade);

    console.log(
      `[PaperTrader] 📉 SELL ${sellAmount.toFixed(
        6,
      )} ${coinId.toUpperCase()} @ $${price.toLocaleString()} = $${usdValue.toFixed(2)}`,
    );

    return trade;
  }

  // ─────────────────────────────────────────────────────────────────
  // Portfolio Management
  // ─────────────────────────────────────────────────────────────────

  async getPortfolioValue(): Promise<Portfolio> {
    // Get current prices for all holdings
    const coinIds = Object.keys(this.portfolio.balances).filter(k => k !== 'usd');
    const prices = await fetchPrices(coinIds);

    let totalValue = this.portfolio.balances.usd || 0;

    for (const coinId of coinIds) {
      const balance = this.portfolio.balances[coinId] || 0;
      const priceData = prices.get(coinId);
      if (priceData && balance > 0) {
        totalValue += balance * priceData.price;
      }
    }

    // Calculate PnL (assuming $10k start)
    const startingValue = 10000;
    const pnl = totalValue - startingValue;
    const pnlPercent = (pnl / startingValue) * 100;

    this.portfolio.totalValueUsd = totalValue;
    this.portfolio.pnl = pnl;
    this.portfolio.pnlPercent = pnlPercent;
    this.portfolio.lastUpdated = new Date().toISOString();

    await this.savePortfolio();

    return this.portfolio;
  }

  getBalances(): Record<string, number> {
    return { ...this.portfolio.balances };
  }

  async resetPortfolio(initialBalance: number = 10000): Promise<void> {
    this.portfolio = {
      id: 'paper_portfolio',
      mode: 'paper',
      balances: { usd: initialBalance },
      totalValueUsd: initialBalance,
      pnl: 0,
      pnlPercent: 0,
      lastUpdated: new Date().toISOString(),
    };
    await this.savePortfolio();
    console.log(`[PaperTrader] Portfolio reset to $${initialBalance}`);
  }

  // ─────────────────────────────────────────────────────────────────
  // Trade History
  // ─────────────────────────────────────────────────────────────────

  private async saveTrade(trade: Trade): Promise<void> {
    if (!this.cosmosClient) {
      console.log('[PaperTrader] Trade recorded (local):', trade.id);
      return;
    }

    try {
      const container = this.cosmosClient.database('homebase').container('trades');

      await container.items.create({
        ...trade,
        partitionKey: trade.coin,
      });
    } catch (error) {
      console.error('[PaperTrader] Failed to save trade:', error);
    }
  }

  async getTradeHistory(limit: number = 50): Promise<Trade[]> {
    if (!this.cosmosClient) return [];

    try {
      const container = this.cosmosClient.database('homebase').container('trades');

      const { resources } = await container.items
        .query<Trade>({
          query:
            "SELECT * FROM c WHERE c.mode = 'paper' ORDER BY c.createdAt DESC OFFSET 0 LIMIT @limit",
          parameters: [{ name: '@limit', value: limit }],
        })
        .fetchAll();

      return resources;
    } catch {
      return [];
    }
  }
}

// Singleton
export const paperTrader = new PaperTrader();
