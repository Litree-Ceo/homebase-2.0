/**
 * @workspace Price Alert Strategy - Autonomous threshold monitoring
 *
 * Monitors coin prices and generates signals when thresholds are crossed.
 * Supports cooldown periods to prevent alert fatigue.
 */

import { Signal, PriceAlert, SignalType } from '../types.js';
import { getCoinPrice, getMarketData } from '../market-data.js';
import { generateId, formatCurrency, formatPercent } from '../utils.js';

export class PriceAlertStrategy {
  private alerts: Map<string, PriceAlert>;
  private lastTriggered: Map<string, number> = new Map();

  constructor(alerts: PriceAlert[]) {
    this.alerts = new Map(alerts.map(a => [a.id, a]));
  }

  /**
   * Execute price alert checks for all configured alerts
   */
  async execute(coins: string[]): Promise<Signal[]> {
    const signals: Signal[] = [];
    const marketData = await getMarketData(coins);
    const priceMap = new Map(marketData.map(m => [m.coin, m]));

    for (const alert of this.alerts.values()) {
      if (!alert.enabled) continue;
      if (!coins.includes(alert.coin)) continue;

      // Check cooldown
      const lastTrigger = this.lastTriggered.get(alert.id) ?? 0;
      if (Date.now() - lastTrigger < alert.cooldownMs) {
        continue;
      }

      const market = priceMap.get(alert.coin);
      if (!market) continue;

      const signal = this.checkAlert(alert, market.price, market.priceChange24h);
      if (signal) {
        signals.push(signal);
        this.lastTriggered.set(alert.id, Date.now());
        alert.lastTriggered = new Date().toISOString();
        alert.triggered = true;
      }
    }

    return signals;
  }

  /**
   * Check a single alert against current price
   */
  private checkAlert(
    alert: PriceAlert,
    currentPrice: number,
    priceChange24h: number,
  ): Signal | null {
    let triggered = false;
    let signalType: SignalType;
    let message: string;

    switch (alert.condition) {
      case 'above':
        if (currentPrice > alert.threshold) {
          triggered = true;
          signalType = 'price-above';
          message = `🚀 ${alert.coin.toUpperCase()} broke above ${formatCurrency(
            alert.threshold,
          )}! Current: ${formatCurrency(currentPrice)}`;
        }
        break;

      case 'below':
        if (currentPrice < alert.threshold) {
          triggered = true;
          signalType = 'price-below';
          message = `📉 ${alert.coin.toUpperCase()} dropped below ${formatCurrency(
            alert.threshold,
          )}! Current: ${formatCurrency(currentPrice)}`;
        }
        break;

      case 'change':
        if (Math.abs(priceChange24h) >= alert.threshold) {
          triggered = true;
          signalType = 'price-change';
          const direction = priceChange24h > 0 ? '📈' : '📉';
          message = `${direction} ${alert.coin.toUpperCase()} moved ${formatPercent(
            priceChange24h,
          )} in 24h! Current: ${formatCurrency(currentPrice)}`;
        }
        break;

      default:
        return null;
    }

    if (!triggered) return null;

    return {
      id: generateId('sig'),
      botId: 'price-alert',
      timestamp: new Date().toISOString(),
      type: signalType!,
      coin: alert.coin,
      message: message!,
      data: {
        currentPrice,
        threshold: alert.threshold,
        percentChange: priceChange24h,
        alertId: alert.id,
        condition: alert.condition,
      },
      severity: this.determineSeverity(alert, currentPrice, priceChange24h),
      acknowledged: false,
    };
  }

  /**
   * Determine signal severity based on deviation
   */
  private determineSeverity(
    alert: PriceAlert,
    currentPrice: number,
    priceChange24h: number,
  ): 'info' | 'warning' | 'critical' {
    const deviation = Math.abs(
      alert.condition === 'change'
        ? priceChange24h - alert.threshold
        : ((currentPrice - alert.threshold) / alert.threshold) * 100,
    );

    if (deviation > 10) return 'critical';
    if (deviation > 5) return 'warning';
    return 'info';
  }

  /**
   * Add a new alert
   */
  addAlert(alert: Omit<PriceAlert, 'id' | 'triggered' | 'partitionKey'>): PriceAlert {
    const newAlert: PriceAlert = {
      ...alert,
      id: generateId('alert'),
      triggered: false,
      partitionKey: 'alerts',
    };
    this.alerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  /**
   * Remove an alert
   */
  removeAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  /**
   * Get all alerts
   */
  getAlerts(): PriceAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Reset triggered state for all alerts
   */
  resetAlerts(): void {
    for (const alert of this.alerts.values()) {
      alert.triggered = false;
    }
    this.lastTriggered.clear();
  }
}

// ─────────────────────────────────────────────────────────────────
// Preset Alert Templates
// ─────────────────────────────────────────────────────────────────
export const PRESET_ALERTS: Omit<PriceAlert, 'id' | 'triggered' | 'partitionKey'>[] = [
  {
    coin: 'bitcoin',
    condition: 'above',
    threshold: 100000,
    enabled: true,
    cooldownMs: 3600000, // 1 hour
    notifyChannels: [{ type: 'console' }],
  },
  {
    coin: 'bitcoin',
    condition: 'below',
    threshold: 90000,
    enabled: true,
    cooldownMs: 3600000,
    notifyChannels: [{ type: 'console' }],
  },
  {
    coin: 'ethereum',
    condition: 'above',
    threshold: 4000,
    enabled: true,
    cooldownMs: 3600000,
    notifyChannels: [{ type: 'console' }],
  },
  {
    coin: 'solana',
    condition: 'change',
    threshold: 10, // 10% move
    enabled: true,
    cooldownMs: 7200000, // 2 hours
    notifyChannels: [{ type: 'console' }],
  },
];
