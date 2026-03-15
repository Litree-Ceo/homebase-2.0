/**
 * @workspace SMA Crossover Strategy - Classic moving average signals
 *
 * Generates buy/sell signals based on short-term vs long-term moving average crossovers.
 * Golden Cross (bullish) = Short SMA crosses above Long SMA
 * Death Cross (bearish) = Short SMA crosses below Long SMA
 */

import { Signal } from '../types.js';
import { getHistoricalPrices, calculateSMA, calculateEMA } from '../market-data.js';
import { generateId, formatCurrency, formatPercent } from '../utils.js';

export class SMACrossoverStrategy {
  private shortPeriod: number;
  private longPeriod: number;
  private previousCrossState: Map<string, 'bullish' | 'bearish' | null> = new Map();

  constructor(shortPeriod: number = 7, longPeriod: number = 30) {
    this.shortPeriod = shortPeriod;
    this.longPeriod = longPeriod;
  }

  /**
   * Execute SMA crossover analysis
   */
  async execute(coins: string[]): Promise<Signal[]> {
    const signals: Signal[] = [];

    for (const coin of coins) {
      try {
        const signal = await this.analyzeCoin(coin);
        if (signal) {
          signals.push(signal);
        }
      } catch (error) {
        console.error(`[SMACrossover] Error analyzing ${coin}:`, error);
      }
    }

    return signals;
  }

  /**
   * Analyze a single coin for crossover
   */
  private async analyzeCoin(coinId: string): Promise<Signal | null> {
    // Need enough data for long period
    const days = Math.ceil(this.longPeriod * 1.5);
    const prices = await getHistoricalPrices(coinId, days);

    if (prices.length < this.longPeriod) {
      console.log(`[SMACrossover] Not enough data for ${coinId}`);
      return null;
    }

    const priceArray = prices.map(p => p.price);
    const currentPrice = priceArray[priceArray.length - 1];

    // Calculate SMAs
    const shortSMA = calculateSMA(priceArray, this.shortPeriod);
    const longSMA = calculateSMA(priceArray, this.longPeriod);

    // Also calculate EMAs for confirmation
    const shortEMA = calculateEMA(priceArray, this.shortPeriod);
    const longEMA = calculateEMA(priceArray, this.longPeriod);

    // Determine current state
    const currentState: 'bullish' | 'bearish' = shortSMA > longSMA ? 'bullish' : 'bearish';
    const previousState = this.previousCrossState.get(coinId);

    // Check for crossover (state change)
    if (previousState && previousState !== currentState) {
      const isBullish = currentState === 'bullish';

      const signal: Signal = {
        id: generateId('sma'),
        botId: 'sma-crossover',
        timestamp: new Date().toISOString(),
        type: isBullish ? 'bullish-crossover' : 'bearish-crossover',
        coin: coinId,
        message: isBullish
          ? `🌅 GOLDEN CROSS: ${coinId.toUpperCase()} ${this.shortPeriod}-day SMA crossed above ${
              this.longPeriod
            }-day SMA`
          : `🌑 DEATH CROSS: ${coinId.toUpperCase()} ${this.shortPeriod}-day SMA crossed below ${
              this.longPeriod
            }-day SMA`,
        data: {
          currentPrice,
          shortSMA,
          longSMA,
          shortEMA,
          longEMA,
          shortPeriod: this.shortPeriod,
          longPeriod: this.longPeriod,
          priceAboveShortSMA: currentPrice > shortSMA,
          priceAboveLongSMA: currentPrice > longSMA,
          strength: this.calculateSignalStrength(shortSMA, longSMA, shortEMA, longEMA),
        },
        severity: 'warning',
        acknowledged: false,
      };

      this.previousCrossState.set(coinId, currentState);
      return signal;
    }

    // Update state for next run
    this.previousCrossState.set(coinId, currentState);
    return null;
  }

  /**
   * Calculate signal strength based on MA alignment
   */
  private calculateSignalStrength(
    shortSMA: number,
    longSMA: number,
    shortEMA: number,
    longEMA: number,
  ): 'strong' | 'moderate' | 'weak' {
    // Strong if both SMA and EMA agree
    const smaSignal = shortSMA > longSMA;
    const emaSignal = shortEMA > longEMA;

    if (smaSignal === emaSignal) {
      // Check magnitude of difference
      const diff = Math.abs((shortSMA - longSMA) / longSMA) * 100;
      return diff > 3 ? 'strong' : 'moderate';
    }

    return 'weak';
  }

  /**
   * Get current analysis without requiring crossover
   */
  async getCurrentAnalysis(coinId: string): Promise<{
    coin: string;
    currentPrice: number;
    shortSMA: number;
    longSMA: number;
    trend: 'bullish' | 'bearish';
    strength: 'strong' | 'moderate' | 'weak';
  } | null> {
    try {
      const days = Math.ceil(this.longPeriod * 1.5);
      const prices = await getHistoricalPrices(coinId, days);

      if (prices.length < this.longPeriod) return null;

      const priceArray = prices.map(p => p.price);
      const currentPrice = priceArray[priceArray.length - 1];
      const shortSMA = calculateSMA(priceArray, this.shortPeriod);
      const longSMA = calculateSMA(priceArray, this.longPeriod);
      const shortEMA = calculateEMA(priceArray, this.shortPeriod);
      const longEMA = calculateEMA(priceArray, this.longPeriod);

      return {
        coin: coinId,
        currentPrice,
        shortSMA,
        longSMA,
        trend: shortSMA > longSMA ? 'bullish' : 'bearish',
        strength: this.calculateSignalStrength(shortSMA, longSMA, shortEMA, longEMA),
      };
    } catch {
      return null;
    }
  }
}
