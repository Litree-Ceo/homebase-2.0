/**
 * @workspace Crypto Price API - Azure Functions HTTP Trigger
 *
 * Fetches real-time cryptocurrency prices from CoinGecko API.
 * Supports multiple coins, caching, and error handling for production use.
 *
 * @example GET /api/crypto?ids=bitcoin,ethereum&vs_currencies=usd
 * @example GET /api/crypto/bitcoin (single coin shorthand)
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

// ─────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────
interface CoinData {
  usd?: number;
  eur?: number;
  gbp?: number;
  usd_24h_change?: number;
  usd_market_cap?: number;
}

interface CoinGeckoPrice {
  [coinId: string]: CoinData;
}

interface CryptoResponse {
  success: boolean;
  timestamp: string;
  data: CoinGeckoPrice | null;
  error?: string;
  cached?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Simple In-Memory Cache (for serverless, consider Azure Redis)
// ─────────────────────────────────────────────────────────────────
const priceCache: Map<string, { data: CoinGeckoPrice; expires: number }> = new Map();
const CACHE_TTL_MS = 60_000; // 60 seconds - CoinGecko free tier rate limit friendly

// ─────────────────────────────────────────────────────────────────
// CoinGecko API Configuration
// ─────────────────────────────────────────────────────────────────
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const DEFAULT_COINS = 'bitcoin,ethereum,solana';
const DEFAULT_CURRENCY = 'usd';

/**
 * Fetches crypto prices from CoinGecko with caching
 */
async function fetchCryptoPrices(
  ids: string,
  vsCurrencies: string,
  includeMarketCap = true,
  include24hChange = true,
): Promise<{ data: CoinGeckoPrice | null; cached: boolean; error?: string }> {
  const cacheKey = `${ids}-${vsCurrencies}`;
  const cached = priceCache.get(cacheKey);

  // Return cached data if valid
  if (cached && cached.expires > Date.now()) {
    return { data: cached.data, cached: true };
  }

  // Build query params
  const params = new URLSearchParams({
    ids,
    vs_currencies: vsCurrencies,
    include_market_cap: includeMarketCap.toString(),
    include_24hr_change: include24hChange.toString(),
  });

  try {
    const response = await fetch(`${COINGECKO_API_BASE}/simple/price?${params}`, {
      headers: {
        Accept: 'application/json',
        // Add API key header if using Pro tier:
        // "x-cg-pro-api-key": process.env.COINGECKO_API_KEY || ""
      },
    });

    if (!response.ok) {
      // Handle rate limiting specifically
      if (response.status === 429) {
        // Return stale cache if available during rate limit
        if (cached) {
          return { data: cached.data, cached: true, error: 'Rate limited, serving stale cache' };
        }
        return { data: null, cached: false, error: 'Rate limit exceeded. Try again in 60s.' };
      }
      return { data: null, cached: false, error: `CoinGecko API error: ${response.status}` };
    }

    const data = (await response.json()) as CoinGeckoPrice;

    // Update cache
    priceCache.set(cacheKey, {
      data,
      expires: Date.now() + CACHE_TTL_MS,
    });

    return { data, cached: false };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown fetch error';
    // Return stale cache on network errors
    if (cached) {
      return {
        data: cached.data,
        cached: true,
        error: `Network error, serving stale: ${errorMessage}`,
      };
    }
    return { data: null, cached: false, error: errorMessage };
  }
}

/**
 * HTTP Trigger: GET /api/crypto
 *
 * Query Parameters:
 * - ids: Comma-separated coin IDs (default: bitcoin,ethereum,solana)
 * - vs_currencies: Comma-separated currencies (default: usd)
 * - include_market_cap: Include market cap data (default: true)
 * - include_24hr_change: Include 24h change % (default: true)
 */
async function cryptoHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Crypto price request: ${request.url}`);

  // Parse query parameters
  const ids = request.query.get('ids') || DEFAULT_COINS;
  const vsCurrencies = request.query.get('vs_currencies') || DEFAULT_CURRENCY;
  const includeMarketCap = request.query.get('include_market_cap') !== 'false';
  const include24hChange = request.query.get('include_24hr_change') !== 'false';

  // Validate coin IDs (basic sanitization)
  const sanitizedIds = ids
    .toLowerCase()
    .replace(/[^a-z0-9,-]/g, '')
    .split(',')
    .slice(0, 50) // Max 50 coins per request
    .join(',');

  if (!sanitizedIds) {
    const errorResponse: CryptoResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      data: null,
      error: 'Invalid coin IDs provided',
    };
    return { status: 400, jsonBody: errorResponse };
  }

  // Fetch prices
  const { data, cached, error } = await fetchCryptoPrices(
    sanitizedIds,
    vsCurrencies,
    includeMarketCap,
    include24hChange,
  );

  if (!data) {
    const errorResponse: CryptoResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      data: null,
      error: error || 'Failed to fetch crypto prices',
    };
    return { status: 503, jsonBody: errorResponse };
  }

  const response: CryptoResponse = {
    success: true,
    timestamp: new Date().toISOString(),
    data,
    cached,
    ...(error && { error }), // Include warning if serving stale cache
  };

  return {
    status: 200,
    jsonBody: response,
    headers: {
      'Cache-Control': 'public, max-age=30',
      'X-Cache-Hit': cached ? 'true' : 'false',
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// Register Azure Function
// ─────────────────────────────────────────────────────────────────
app.http('crypto', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'crypto',
  handler: cryptoHandler,
});

export { cryptoHandler };
