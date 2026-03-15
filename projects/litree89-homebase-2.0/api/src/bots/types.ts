/**
 * @workspace LITLABS Autonomous Bot System - Type Definitions
 *
 * Core types for the crypto bot engine that enables autonomous decision-making.
 */

// ─────────────────────────────────────────────────────────────────
// Bot Configuration & State
// ─────────────────────────────────────────────────────────────────
export interface BotConfig {
  id: string;
  name: string;
  enabled: boolean;
  strategy: BotStrategy;
  coins: string[];
  checkIntervalMs: number;
  createdAt: string;
  updatedAt: string;
  partitionKey: string; // For Cosmos DB
  settings?: Record<string, unknown>; // Strategy-specific settings
}

export type BotStrategy =
  | 'price-alert'
  | 'opportunity-detector'
  | 'arbitrage-scanner'
  | 'sma-crossover'
  | 'rsi-oversold'
  | 'volume-spike';

export interface BotState {
  botId: string;
  lastRun: string;
  lastSignal: Signal | null;
  runCount: number;
  successCount: number;
  errorCount: number;
  isRunning: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Signals & Actions
// ─────────────────────────────────────────────────────────────────
export interface Signal {
  id: string;
  botId: string;
  timestamp: string;
  type: SignalType;
  coin: string;
  message: string;
  data: SignalData;
  severity: 'info' | 'warning' | 'critical';
  acknowledged: boolean;
}

export type SignalType =
  | 'price-above'
  | 'price-below'
  | 'price-change'
  | 'arbitrage-opportunity'
  | 'volume-spike'
  | 'trend-reversal'
  | 'bullish-crossover'
  | 'bearish-crossover'
  | 'flash-crash'
  | 'breakout';

export interface SignalData {
  volume24h?: number;
  sma7?: number;
  sma30?: number;
  rsi?: number;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────────────
// Price Alert Configuration
// ─────────────────────────────────────────────────────────────────
export interface PriceAlert {
  id: string;
  coin: string;
  condition: 'above' | 'below' | 'change';
  threshold: number;
  enabled: boolean;
  triggered: boolean;
  lastTriggered?: string;
  cooldownMs: number;
  notifyChannels: NotifyChannel[];
  partitionKey: string;
}

export type NotifyChannel =
  | { type: 'console' }
  | { type: 'webhook'; url: string }
  | { type: 'cosmos'; container: string }
  | { type: 'signalr'; hub: string };

// ─────────────────────────────────────────────────────────────────
// Market Data
// ─────────────────────────────────────────────────────────────────
export interface MarketData {
  coin: string;
  price: number;
  priceChange24h: number;
  /** @alias priceChange24h */
  change24h?: number;
  marketCap: number;
  volume24h: number;
  timestamp: string;
}

export interface HistoricalPrice {
  timestamp: number;
  price: number;
  volume?: number; // Optional volume data for momentum analysis
}

export interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// ─────────────────────────────────────────────────────────────────
// Arbitrage
// ─────────────────────────────────────────────────────────────────
export interface ArbitrageOpportunity {
  id: string;
  coin: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spreadPercent: number;
  potentialProfit: number;
  timestamp: string;
  valid: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Bot Execution Results
// ─────────────────────────────────────────────────────────────────
export interface BotResult {
  botId: string;
  success: boolean;
  signals: Signal[];
  executionTimeMs: number;
  error?: string;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────
// Paper Trading Types
// ─────────────────────────────────────────────────────────────────
export interface Trade {
  id: string;
  botId: string;
  mode: 'paper' | 'live';
  side: 'buy' | 'sell';
  coin: string;
  /** @alias coin - backwards compatibility */
  coinId?: string;
  symbol?: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
  status: 'pending' | 'filled' | 'cancelled' | 'failed';
  executedAt?: string;
  createdAt: string;
}

export interface Portfolio {
  id: string;
  mode: 'paper' | 'live';
  balances: Record<string, number>;
  totalValueUsd: number;
  pnl: number;
  pnlPercent: number;
  lastUpdated: string;
}

// ─────────────────────────────────────────────────────────────────
// Alert System
// ─────────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  botId: string;
  type: 'price-target' | 'opportunity' | 'trade-executed' | 'trade-failed' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  data: Record<string, unknown>;
  sent: boolean;
  sentAt?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────
// Strategy Parameters
// ─────────────────────────────────────────────────────────────────
export interface StrategyParams {
  priceAlert?: {
    alerts: PriceAlert[];
  };
  opportunityDetector?: {
    minChangePercent: number;
    volumeMultiplier: number;
    timeframeHours: number;
  };
  arbitrage?: {
    minSpreadPercent: number;
    exchanges: string[];
    minProfitUsd: number;
  };
  smaCrossover?: {
    shortPeriod: number;
    longPeriod: number;
  };
  rsiOversold?: {
    period: number;
    oversoldLevel: number;
    overboughtLevel: number;
  };
}

// ─────────────────────────────────────────────────────────────────
// Strategy Context & Configs (for strategies/)
// ─────────────────────────────────────────────────────────────────
export interface BotContext {
  config: BotConfig;
  marketData: Map<string, MarketData>;
  portfolio?: Portfolio;
}

export interface DipBuyerConfig {
  dipThresholdPercent: number;
  buyAmountUsd: number;
  maxPositions: number;
  cooldownMinutes: number;
}

export interface PriceAlertConfig {
  coin: string;
  targetPrice: number;
  condition: 'above' | 'below';
  enabled: boolean;
}

export interface Opportunity {
  coin: string;
  type: 'dip' | 'breakout' | 'volume-spike' | 'arbitrage';
  score: number;
  data: Record<string, unknown>;
  timestamp: string;
  expiresAt?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';
