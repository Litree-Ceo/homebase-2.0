/**
 * @workspace Market Data Service - Centralized crypto data fetching
 *
 * Provides unified access to market data with caching and rate limit handling.
 */

import { MarketData, HistoricalPrice, OHLCData } from './types';

// ─────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CACHE_TTL_MS = 30_000; // 30 seconds

// In-memory cache (consider Redis for production)
const cache = new Map<string, { data: unknown; expires: number }>();

// ─────────────────────────────────────────────────────────────────
// Core Fetch with Caching
// ─────────────────────────────────────────────────────────────────
async function fetchWithCache<T>(
  url: string,
  cacheKey: string,
  ttl: number = CACHE_TTL_MS,
): Promise<T> {
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data as T;
  }

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 429) {
      // Rate limited - return stale cache if available
      if (cached) return cached.data as T;
      throw new Error('Rate limited and no cached data available');
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = (await response.json()) as T;
  cache.set(cacheKey, { data, expires: Date.now() + ttl });
  return data;
}

// ─────────────────────────────────────────────────────────────────
// Market Data Functions
// ─────────────────────────────────────────────────────────────────

/**
 * Get current price and market data for multiple coins
 */
export async function getMarketData(coinIds: string[]): Promise<MarketData[]> {
  const ids = coinIds.join(',');
  const url = `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true&include_24hr_vol=true`;

  interface CoinGeckoResponse {
    [coinId: string]: {
      usd: number;
      usd_24h_change?: number;
      usd_market_cap?: number;
      usd_24h_vol?: number;
    };
  }

  const data = await fetchWithCache<CoinGeckoResponse>(url, `market-${ids}`);

  return coinIds.map(coin => ({
    coin,
    price: data[coin]?.usd ?? 0,
    priceChange24h: data[coin]?.usd_24h_change ?? 0,
    marketCap: data[coin]?.usd_market_cap ?? 0,
    volume24h: data[coin]?.usd_24h_vol ?? 0,
    timestamp: new Date().toISOString(),
  }));
}

/**
 * Get single coin price (optimized for alerts)
 */
export async function getCoinPrice(coinId: string): Promise<number> {
  const data = await getMarketData([coinId]);
  return data[0]?.price ?? 0;
}

/**
 * Get historical prices for technical analysis
 */
export async function getHistoricalPrices(
  coinId: string,
  days: number = 7,
): Promise<HistoricalPrice[]> {
  const url = `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;

  interface ChartResponse {
    prices: [number, number][];
  }

  const data = await fetchWithCache<ChartResponse>(
    url,
    `history-${coinId}-${days}`,
    60_000, // 1 minute cache for historical
  );

  return data.prices.map(([timestamp, price]) => ({ timestamp, price }));
}

/**
 * Get OHLC candlestick data
 */
export async function getOHLCData(coinId: string, days: number = 7): Promise<OHLCData[]> {
  const url = `${COINGECKO_API}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;

  type OHLCResponse = [number, number, number, number, number][];

  const data = await fetchWithCache<OHLCResponse>(url, `ohlc-${coinId}-${days}`, 60_000);

  return data.map(([timestamp, open, high, low, close]) => ({
    timestamp,
    open,
    high,
    low,
    close,
  }));
}

/**
 * Get trending coins (for opportunity detection)
 */
export async function getTrendingCoins(): Promise<string[]> {
  const url = `${COINGECKO_API}/search/trending`;

  interface TrendingResponse {
    coins: Array<{ item: { id: string } }>;
  }

  const data = await fetchWithCache<TrendingResponse>(url, 'trending', 300_000); // 5 min cache
  return data.coins.map(c => c.item.id);
}

/**
 * Get top gainers and losers
 */
export async function getTopMovers(limit: number = 10): Promise<{
  gainers: MarketData[];
  losers: MarketData[];
}> {
  const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`;

  interface MarketListItem {
    id: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    total_volume: number;
  }

  const data = await fetchWithCache<MarketListItem[]>(url, 'markets', 60_000);

  const mapped: MarketData[] = data.map(coin => ({
    coin: coin.id,
    price: coin.current_price,
    priceChange24h: coin.price_change_percentage_24h ?? 0,
    marketCap: coin.market_cap,
    volume24h: coin.total_volume,
    timestamp: new Date().toISOString(),
  }));

  const sorted = [...mapped].sort((a, b) => b.priceChange24h - a.priceChange24h);

  return {
    gainers: sorted.slice(0, limit),
    losers: sorted.slice(-limit).reverse(),
  };
}

// ─────────────────────────────────────────────────────────────────
// Technical Indicators
// ─────────────────────────────────────────────────────────────────

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  return slice.reduce((sum, p) => sum + p, 0) / period;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Neutral if not enough data

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const gains = changes.map(c => (c > 0 ? c : 0));
  const losses = changes.map(c => (c < 0 ? Math.abs(c) : 0));

  const avgGain = gains.slice(-period).reduce((s, g) => s + g, 0) / period;
  const avgLoss = losses.slice(-period).reduce((s, l) => s + l, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
): { macd: number; signal: number; histogram: number } {
  const fastEMA = calculateEMA(prices.slice(-slowPeriod), fastPeriod);
  const slowEMA = calculateEMA(prices.slice(-slowPeriod), slowPeriod);
  const macd = fastEMA - slowEMA;

  // Signal line is EMA of MACD
  const macdHistory: number[] = [];
  for (let i = slowPeriod - 1; i < prices.length; i++) {
    const fast = calculateEMA(prices.slice(0, i + 1).slice(-fastPeriod), fastPeriod);
    const slow = calculateEMA(prices.slice(0, i + 1).slice(-slowPeriod), slowPeriod);
    macdHistory.push(fast - slow);
  }

  const signal = macdHistory.length > 0 ? calculateEMA(macdHistory, signalPeriod) : 0;
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

/**
 * Calculate standard deviation for volatility
export function calculateStandardDeviation(prices: number[], period?: number): number {
  const subset = period ? prices.slice(-period) : prices;
  if (subset.length === 0) return 0;
  const avg = subset.reduce((a, b) => a + b, 0) / subset.length;
  const squaredDiffs = subset.map(p => Math.pow(p - avg, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / subset.length;
  return Math.sqrt(variance);
}

/**
 * Detect support/resistance levels
 */
export function findSupportResistance(
  ohlc: OHLCData[],
  lookback: number = 20,
): { support: number; resistance: number } {
  const recent = ohlc.slice(-lookback);
  const lows = recent.map(c => c.low);
  const highs = recent.map(c => c.high);

  return {
    support: Math.min(...lows),
    resistance: Math.max(...highs),
  };
}

// ─────────────────────────────────────────────────────────────────
// Cache Management
// ─────────────────────────────────────────────────────────────────
export function clearCache(): void {
  cache.clear();
}

export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
