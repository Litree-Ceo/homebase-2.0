/**
 * @workspace Arbitrage Scanner Strategy - Cross-exchange price comparison
 *
 * Monitors price differences across exchanges to identify arbitrage opportunities.
 * Note: Real arbitrage requires fast execution and accounting for fees/slippage.
 */

import { Signal, ArbitrageOpportunity } from '../types.js';
import { generateId, formatCurrency, formatPercent } from '../utils.js';

interface ArbitrageParams {
  minSpreadPercent: number;
  exchanges: string[];
  minProfitUsd: number;
}

// Exchange API endpoints (simplified - production would use ccxt)
const EXCHANGE_ENDPOINTS: Record<string, string> = {
  coingecko: 'https://api.coingecko.com/api/v3',
  binance: 'https://api.binance.com/api/v3',
  coinbase: 'https://api.coinbase.com/v2',
  kraken: 'https://api.kraken.com/0/public',
};

// Coin symbol mappings per exchange
const SYMBOL_MAP: Record<string, Record<string, string>> = {
  binance: {
    bitcoin: 'BTCUSDT',
    ethereum: 'ETHUSDT',
    solana: 'SOLUSDT',
    cardano: 'ADAUSDT',
    dogecoin: 'DOGEUSDT',
  },
  coinbase: {
    bitcoin: 'BTC-USD',
    ethereum: 'ETH-USD',
    solana: 'SOL-USD',
    cardano: 'ADA-USD',
    dogecoin: 'DOGE-USD',
  },
  kraken: {
    bitcoin: 'XXBTZUSD',
    ethereum: 'XETHZUSD',
    solana: 'SOLUSD',
    cardano: 'ADAUSD',
    dogecoin: 'XDGUSD',
  },
};

export class ArbitrageScannerStrategy {
  private params: ArbitrageParams;
  private lastOpportunities: Map<string, ArbitrageOpportunity> = new Map();

  constructor(params: ArbitrageParams) {
    this.params = params;
  }

  /**
   * Execute arbitrage scan across exchanges
   */
  async execute(coins: string[]): Promise<Signal[]> {
    const signals: Signal[] = [];
    const opportunities: ArbitrageOpportunity[] = [];

    for (const coin of coins) {
      const prices = await this.fetchPricesFromExchanges(coin);

      if (Object.keys(prices).length < 2) {
        continue; // Need at least 2 exchanges
      }

      // Find best buy and sell prices
      const opp = this.findBestOpportunity(coin, prices);

      if (opp && opp.spreadPercent >= this.params.minSpreadPercent) {
        opportunities.push(opp);

        const signal = this.createSignal(opp);
        signals.push(signal);
      }
    }

    // Store opportunities for reference
    for (const opp of opportunities) {
      this.lastOpportunities.set(opp.coin, opp);
    }

    return signals;
  }

  /**
   * Fetch prices from configured exchanges
   */
  private async fetchPricesFromExchanges(coinId: string): Promise<Record<string, number>> {
    const prices: Record<string, number> = {};

    // Always use CoinGecko as baseline
    try {
      const cgPrice = await this.fetchCoinGeckoPrice(coinId);
      if (cgPrice > 0) {
        prices['coingecko'] = cgPrice;
      }
    } catch (error) {
      console.error(`[Arbitrage] CoinGecko fetch failed for ${coinId}`);
    }

    // Fetch from other exchanges in parallel
    const fetchPromises = this.params.exchanges
      .filter(ex => ex !== 'coingecko')
      .map(async exchange => {
        try {
          const price = await this.fetchExchangePrice(exchange, coinId);
          if (price > 0) {
            prices[exchange] = price;
          }
        } catch (error) {
          console.error(`[Arbitrage] ${exchange} fetch failed for ${coinId}`);
        }
      });

    await Promise.allSettled(fetchPromises);
    return prices;
  }

  /**
   * Fetch price from CoinGecko
   */
  private async fetchCoinGeckoPrice(coinId: string): Promise<number> {
    const url = `${EXCHANGE_ENDPOINTS.coingecko}/simple/price?ids=${coinId}&vs_currencies=usd`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);

    const data = (await response.json()) as Record<string, { usd: number }>;
    return data[coinId]?.usd ?? 0;
  }

  /**
   * Fetch price from specific exchange
   */
  private async fetchExchangePrice(exchange: string, coinId: string): Promise<number> {
    const symbol = SYMBOL_MAP[exchange]?.[coinId];
    if (!symbol) return 0;

    switch (exchange) {
      case 'binance':
        return this.fetchBinancePrice(symbol);
      case 'coinbase':
        return this.fetchCoinbasePrice(symbol);
      case 'kraken':
        return this.fetchKrakenPrice(symbol);
      default:
        return 0;
    }
  }

  /**
   * Binance price fetch
   */
  private async fetchBinancePrice(symbol: string): Promise<number> {
    const url = `${EXCHANGE_ENDPOINTS.binance}/ticker/price?symbol=${symbol}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Binance error: ${response.status}`);

    const data = (await response.json()) as { price: string };
    return parseFloat(data.price);
  }

  /**
   * Coinbase price fetch
   */
  private async fetchCoinbasePrice(symbol: string): Promise<number> {
    const url = `${EXCHANGE_ENDPOINTS.coinbase}/prices/${symbol}/spot`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Coinbase error: ${response.status}`);

    const data = (await response.json()) as { data: { amount: string } };
    return parseFloat(data.data.amount);
  }

  /**
   * Kraken price fetch
   */
  private async fetchKrakenPrice(symbol: string): Promise<number> {
    const url = `${EXCHANGE_ENDPOINTS.kraken}/Ticker?pair=${symbol}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Kraken error: ${response.status}`);

    interface KrakenResponse {
      result: Record<string, { c: [string, string] }>;
    }

    const data = (await response.json()) as KrakenResponse;
    const pair = Object.values(data.result)[0];
    return pair ? parseFloat(pair.c[0]) : 0;
  }

  /**
   * Find best arbitrage opportunity from prices
   */
  private findBestOpportunity(
    coin: string,
    prices: Record<string, number>,
  ): ArbitrageOpportunity | null {
    const exchanges = Object.keys(prices);
    if (exchanges.length < 2) return null;

    let bestOpp: ArbitrageOpportunity | null = null;
    let bestSpread = 0;

    // Compare all pairs
    for (let i = 0; i < exchanges.length; i++) {
      for (let j = i + 1; j < exchanges.length; j++) {
        const ex1 = exchanges[i];
        const ex2 = exchanges[j];
        const price1 = prices[ex1];
        const price2 = prices[ex2];

        // Determine buy/sell direction
        const buyExchange = price1 < price2 ? ex1 : ex2;
        const sellExchange = price1 < price2 ? ex2 : ex1;
        const buyPrice = Math.min(price1, price2);
        const sellPrice = Math.max(price1, price2);

        const spread = ((sellPrice - buyPrice) / buyPrice) * 100;

        if (spread > bestSpread) {
          bestSpread = spread;
          bestOpp = {
            id: generateId('arb'),
            coin,
            buyExchange,
            sellExchange,
            buyPrice,
            sellPrice,
            spreadPercent: spread,
            potentialProfit: sellPrice - buyPrice, // Per coin
            timestamp: new Date().toISOString(),
            valid: spread >= this.params.minSpreadPercent,
          };
        }
      }
    }

    return bestOpp;
  }

  /**
   * Create signal from opportunity
   */
  private createSignal(opp: ArbitrageOpportunity): Signal {
    return {
      id: generateId('arb-sig'),
      botId: 'arbitrage-scanner',
      timestamp: new Date().toISOString(),
      type: 'arbitrage-opportunity',
      coin: opp.coin,
      message: `💰 ARBITRAGE: Buy ${opp.coin.toUpperCase()} on ${opp.buyExchange} (${formatCurrency(
        opp.buyPrice,
      )}), Sell on ${opp.sellExchange} (${formatCurrency(opp.sellPrice)}) = ${formatPercent(
        opp.spreadPercent,
      )} spread`,
      data: {
        buyExchange: opp.buyExchange,
        sellExchange: opp.sellExchange,
        buyPrice: opp.buyPrice,
        sellPrice: opp.sellPrice,
        spreadPercent: opp.spreadPercent,
        potentialProfit: opp.potentialProfit,
      },
      severity: opp.spreadPercent >= 2 ? 'critical' : 'warning',
      acknowledged: false,
    };
  }

  /**
   * Get last found opportunities
   */
  getLastOpportunities(): ArbitrageOpportunity[] {
    return Array.from(this.lastOpportunities.values());
  }
}

// ─────────────────────────────────────────────────────────────────
// Quick arbitrage check (standalone function)
// ─────────────────────────────────────────────────────────────────
export async function quickArbitrageCheck(coinId: string): Promise<ArbitrageOpportunity | null> {
  const scanner = new ArbitrageScannerStrategy({
    minSpreadPercent: 0.5,
    exchanges: ['coingecko', 'binance', 'coinbase'],
    minProfitUsd: 1,
  });

  const signals = await scanner.execute([coinId]);
  const opportunities = scanner.getLastOpportunities();

  return opportunities[0] ?? null;
}
