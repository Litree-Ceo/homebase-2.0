/**
 * @workspace Opportunity Detector Strategy - Find sudden moves & volume spikes
 *
 * Scans market for unusual activity that could indicate opportunities.
 * Looks for rapid price changes, volume anomalies, and trending coins.
 */

import { Signal, MarketData } from '../types.js';
import {
  getMarketData,
  getTopMovers,
  getTrendingCoins,
  getHistoricalPrices,
  calculateRSI,
} from '../market-data.js';
import { generateId, formatCurrency, formatPercent } from '../utils.js';

interface OpportunityParams {
  minChangePercent: number;
  volumeMultiplier: number;
  timeframeHours: number;
}

export class OpportunityDetectorStrategy {
  private params: OpportunityParams;
  private previousData: Map<string, MarketData> = new Map();

  constructor(params: OpportunityParams) {
    this.params = params;
  }

  /**
   * Execute opportunity detection
   */
  async execute(watchlist: string[]): Promise<Signal[]> {
    const signals: Signal[] = [];

    // 1. Check watchlist for sudden moves
    const watchlistSignals = await this.checkWatchlist(watchlist);
    signals.push(...watchlistSignals);

    // 2. Scan top movers market-wide
    const moverSignals = await this.checkTopMovers();
    signals.push(...moverSignals);

    // 3. Check trending coins for momentum
    const trendingSignals = await this.checkTrending();
    signals.push(...trendingSignals);

    return signals;
  }

  /**
   * Check watchlist coins for opportunities
   */
  private async checkWatchlist(coins: string[]): Promise<Signal[]> {
    const signals: Signal[] = [];
    const currentData = await getMarketData(coins);

    for (const market of currentData) {
      const previous = this.previousData.get(market.coin);

      // Check for significant price change
      if (Math.abs(market.priceChange24h) >= this.params.minChangePercent) {
        const direction = market.priceChange24h > 0 ? 'pump' : 'dump';

        signals.push({
          id: generateId('opp'),
          botId: 'opportunity-detector',
          timestamp: new Date().toISOString(),
          type: 'price-change',
          coin: market.coin,
          message: `🎯 ${market.coin.toUpperCase()} ${direction}: ${formatPercent(
            market.priceChange24h,
          )} in 24h`,
          data: {
            currentPrice: market.price,
            percentChange: market.priceChange24h,
            volume24h: market.volume24h,
            marketCap: market.marketCap,
          },
          severity: Math.abs(market.priceChange24h) > 15 ? 'critical' : 'warning',
          acknowledged: false,
        });
      }

      // Check for volume spike (comparing to previous check)
      if (previous && market.volume24h > previous.volume24h * this.params.volumeMultiplier) {
        signals.push({
          id: generateId('vol'),
          botId: 'opportunity-detector',
          timestamp: new Date().toISOString(),
          type: 'volume-spike',
          coin: market.coin,
          message: `📊 ${market.coin.toUpperCase()} volume spike! ${formatCurrency(
            market.volume24h,
          )} (${((market.volume24h / previous.volume24h) * 100 - 100).toFixed(0)}% increase)`,
          data: {
            currentVolume: market.volume24h,
            previousVolume: previous.volume24h,
            currentPrice: market.price,
            multiplier: market.volume24h / previous.volume24h,
          },
          severity: 'warning',
          acknowledged: false,
        });
      }

      // Update previous data for next run
      this.previousData.set(market.coin, market);
    }

    return signals;
  }

  /**
   * Check market-wide top movers
   */
  private async checkTopMovers(): Promise<Signal[]> {
    const signals: Signal[] = [];

    try {
      const { gainers, losers } = await getTopMovers(5);

      // Top gainer signal
      if (gainers.length > 0) {
        const top = gainers[0];
        if (top.priceChange24h >= this.params.minChangePercent * 2) {
          signals.push({
            id: generateId('gainer'),
            botId: 'opportunity-detector',
            timestamp: new Date().toISOString(),
            type: 'price-change',
            coin: top.coin,
            message: `🏆 Top Gainer: ${top.coin.toUpperCase()} +${top.priceChange24h.toFixed(2)}%`,
            data: {
              currentPrice: top.price,
              percentChange: top.priceChange24h,
              marketCap: top.marketCap,
              rank: 1,
            },
            severity: 'info',
            acknowledged: false,
          });
        }
      }

      // Top loser signal (potential buying opportunity)
      if (losers.length > 0) {
        const bottom = losers[0];
        if (Math.abs(bottom.priceChange24h) >= this.params.minChangePercent * 2) {
          signals.push({
            id: generateId('loser'),
            botId: 'opportunity-detector',
            timestamp: new Date().toISOString(),
            type: 'price-change',
            coin: bottom.coin,
            message: `🔻 Top Loser: ${bottom.coin.toUpperCase()} ${bottom.priceChange24h.toFixed(
              2,
            )}% - Potential buy zone?`,
            data: {
              currentPrice: bottom.price,
              percentChange: bottom.priceChange24h,
              marketCap: bottom.marketCap,
              rank: 1,
            },
            severity: 'info',
            acknowledged: false,
          });
        }
      }
    } catch (error) {
      console.error('[OpportunityDetector] Error fetching top movers:', error);
    }

    return signals;
  }

  /**
   * Check trending coins for momentum plays
   */
  private async checkTrending(): Promise<Signal[]> {
    const signals: Signal[] = [];

    try {
      const trending = await getTrendingCoins();

      if (trending.length > 0) {
        // Get market data for trending coins
        const trendingData = await getMarketData(trending.slice(0, 5));

        for (const market of trendingData) {
          // Only signal if trending AND moving significantly
          if (Math.abs(market.priceChange24h) >= this.params.minChangePercent) {
            signals.push({
              id: generateId('trend'),
              botId: 'opportunity-detector',
              timestamp: new Date().toISOString(),
              type: market.priceChange24h > 0 ? 'bullish-crossover' : 'bearish-crossover',
              coin: market.coin,
              message: `🔥 Trending: ${market.coin.toUpperCase()} is trending + ${formatPercent(
                market.priceChange24h,
              )}`,
              data: {
                currentPrice: market.price,
                percentChange: market.priceChange24h,
                volume24h: market.volume24h,
                isTrending: true,
              },
              severity: 'info',
              acknowledged: false,
            });
          }
        }
      }
    } catch (error) {
      console.error('[OpportunityDetector] Error checking trending:', error);
    }

    return signals;
  }

  /**
   * Check RSI for oversold/overbought conditions
   */
  async checkRSI(coinId: string): Promise<Signal | null> {
    try {
      const prices = await getHistoricalPrices(coinId, 14);
      const priceArray = prices.map(p => p.price);
      const rsi = calculateRSI(priceArray, 14);

      if (rsi <= 30) {
        const market = (await getMarketData([coinId]))[0];
        return {
          id: generateId('rsi'),
          botId: 'opportunity-detector',
          timestamp: new Date().toISOString(),
          type: 'trend-reversal',
          coin: coinId,
          message: `📉 ${coinId.toUpperCase()} RSI oversold (${rsi.toFixed(
            1,
          )}) - Potential reversal`,
          data: {
            currentPrice: market?.price ?? 0,
            rsi,
            condition: 'oversold',
          },
          severity: 'warning',
          acknowledged: false,
        };
      }

      if (rsi >= 70) {
        const market = (await getMarketData([coinId]))[0];
        return {
          id: generateId('rsi'),
          botId: 'opportunity-detector',
          timestamp: new Date().toISOString(),
          type: 'trend-reversal',
          coin: coinId,
          message: `📈 ${coinId.toUpperCase()} RSI overbought (${rsi.toFixed(
            1,
          )}) - Potential pullback`,
          data: {
            currentPrice: market?.price ?? 0,
            rsi,
            condition: 'overbought',
          },
          severity: 'warning',
          acknowledged: false,
        };
      }
    } catch (error) {
      console.error(`[OpportunityDetector] RSI check failed for ${coinId}:`, error);
    }

    return null;
  }
}
