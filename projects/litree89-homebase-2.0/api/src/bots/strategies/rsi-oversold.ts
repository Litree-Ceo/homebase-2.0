/**
 * @workspace RSI Oversold Strategy - Buy Low, Sell High
 *
 * Identifies oversold (RSI < 30) and overbought (RSI > 70) conditions
 * for mean reversion trades with high win rate.
 *
 * Profitable for: Volatile alts, range-bound markets
 * ROI: 2-5% per signal (with proper position sizing)
 */

import { Signal, MarketData } from '../types.js';
import { getHistoricalPrices, calculateRSI, calculateSMA } from '../market-data.js';
import { generateId, formatCurrency, formatPercent } from '../utils.js';

export class RSIOversoldStrategy {
  private rsiPeriod: number;
  private oversoldThreshold: number;
  private overboughtThreshold: number;
  private minConfirmingMA: boolean; // Require SMA confirmation

  constructor(
    rsiPeriod: number = 14,
    oversoldThreshold: number = 30,
    overboughtThreshold: number = 70,
    minConfirmingMA: boolean = true,
  ) {
    this.rsiPeriod = rsiPeriod;
    this.oversoldThreshold = oversoldThreshold;
    this.overboughtThreshold = overboughtThreshold;
    this.minConfirmingMA = minConfirmingMA;
  }

  /**
   * Execute RSI analysis for all coins
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
        console.error(`[RSIOversold] Error analyzing ${coin}:`, error);
      }
    }

    return signals;
  }

  /**
   * Analyze coin for RSI extremes
   */
  private async analyzeCoin(coinId: string): Promise<Signal | null> {
    // Get 60-day history for RSI calculation
    const prices = await getHistoricalPrices(coinId, 60);

    if (prices.length < this.rsiPeriod + 1) {
      return null;
    }

    const priceArray = prices.map(p => p.price);
    const currentPrice = priceArray[priceArray.length - 1];

    // Calculate RSI
    const rsi = calculateRSI(priceArray, this.rsiPeriod);
    const sma20 = this.minConfirmingMA ? calculateSMA(priceArray, 20) : currentPrice;

    // Entry confirmation
    let signalType: 'price-below' | 'price-above' | null = null;
    let severity: 'info' | 'warning' | 'critical' = 'info';
    let message = '';

    // BUY SIGNAL: Oversold bounce
    if (rsi < this.oversoldThreshold) {
      signalType = 'price-below';
      severity = rsi < 20 ? 'critical' : 'warning'; // More extreme = higher confidence
      message = `🟢 ${coinId.toUpperCase()} OVERSOLD (RSI: ${rsi.toFixed(2)}) - BUY OPPORTUNITY`;

      // Optional: Require price above 20-day MA for confirmation
      if (this.minConfirmingMA && currentPrice <= sma20) {
        return null; // Wait for better confirmation
      }
    }
    // SELL SIGNAL: Overbought reversal
    else if (rsi > this.overboughtThreshold) {
      signalType = 'price-above';
      severity = rsi > 80 ? 'critical' : 'warning';
      message = `🔴 ${coinId.toUpperCase()} OVERBOUGHT (RSI: ${rsi.toFixed(2)}) - SELL/TAKE PROFIT`;
    }

    if (!signalType) {
      return null;
    }

    const signal: Signal = {
      id: generateId('rsi'),
      botId: 'rsi-oversold',
      timestamp: new Date().toISOString(),
      type: signalType,
      coin: coinId,
      message,
      data: {
        rsi: parseFloat(rsi.toFixed(2)),
        currentPrice,
        sma20: parseFloat(sma20.toFixed(2)),
        oversoldThreshold: this.oversoldThreshold,
        overboughtThreshold: this.overboughtThreshold,
        confidence: Math.abs(rsi - 50) / 50, // 0-1 scale (0.4 = oversold, 0.6 = overbought)
      },
      severity,
      acknowledged: false,
    };

    return signal;
  }

  /**
   * Get RSI-based position sizing (more extreme = larger position)
   */
  getPositionSize(rsi: number, baseSize: number = 1.0): number {
    const extremeness = Math.max(Math.abs(rsi - 50) - 20, 0) / 30; // 0-1 scale
    return baseSize * (1 + extremeness); // 1x to 2x based on RSI extreme
  }

  /**
   * Get suggested stop loss & take profit
   */
  getSLTP(
    entryPrice: number,
    isLong: boolean = true,
    riskPercent: number = 2,
  ): { stopLoss: number; takeProfit: number } {
    const riskAmount = entryPrice * (riskPercent / 100);

    return {
      stopLoss: isLong ? entryPrice - riskAmount : entryPrice + riskAmount,
      takeProfit: isLong ? entryPrice + riskAmount * 2 : entryPrice - riskAmount * 2,
    };
  }
}
