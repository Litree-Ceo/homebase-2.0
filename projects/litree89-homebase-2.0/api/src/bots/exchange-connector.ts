/**
 * Exchange Connector - CCXT integration for real trading
 * @workspace Connect to exchanges when you're ready for real money
 *
 * IMPORTANT: This is for LIVE trading. Paper trade first!
 *
 * Supported exchanges (via ccxt):
 * - Coinbase Pro
 * - Binance
 * - Kraken
 * - And 100+ more
 *
 * Setup:
 * 1. Get API keys from your exchange
 * 2. Store in Azure Key Vault (NEVER in code!)
 * 3. Set env vars: EXCHANGE_API_KEY, EXCHANGE_SECRET
 */

// Note: ccxt needs to be installed: pnpm add ccxt
// import ccxt from 'ccxt';

export interface ExchangeConfig {
  name: 'coinbase' | 'binance' | 'kraken' | 'kucoin';
  apiKey: string;
  secret: string;
  sandbox?: boolean; // Use testnet/sandbox mode
}

export interface OrderParams {
  symbol: string; // e.g., 'BTC/USD'
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: number;
  price?: number; // Required for limit orders
}

export interface OrderResult {
  orderId: string;
  status: 'open' | 'closed' | 'canceled';
  filled: number;
  remaining: number;
  price: number;
  cost: number;
  fee: number;
}

export class ExchangeConnector {
  private exchange: unknown = null;
  private config: ExchangeConfig | null = null;
  private isInitialized = false;

  async initialize(config: ExchangeConfig): Promise<boolean> {
    // Check for ccxt - dynamic import since it's an optional dependency
    let ccxt: Record<string, unknown>;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ccxt = (await import('ccxt' as string)) as Record<string, unknown>;
    } catch {
      console.error('[Exchange] ccxt not installed. Run: pnpm add ccxt');
      return false;
    }

    try {
      const ExchangeClass = ccxt[config.name] as new (params: {
        apiKey: string;
        secret: string;
        sandbox?: boolean;
      }) => unknown;

      if (!ExchangeClass) {
        throw new Error(`Exchange not supported: ${config.name}`);
      }

      this.exchange = new ExchangeClass({
        apiKey: config.apiKey,
        secret: config.secret,
        sandbox: config.sandbox ?? true, // Default to sandbox!
      });

      this.config = config;
      this.isInitialized = true;

      console.log(`[Exchange] Connected to ${config.name} (sandbox: ${config.sandbox ?? true})`);
      return true;
    } catch (error) {
      console.error('[Exchange] Failed to initialize:', error);
      return false;
    }
  }

  async getBalance(): Promise<Record<string, number>> {
    if (!this.isInitialized || !this.exchange) {
      throw new Error('Exchange not initialized');
    }

    try {
      const exchange = this.exchange as {
        fetchBalance: () => Promise<{ total: Record<string, number> }>;
      };
      const balance = await exchange.fetchBalance();
      return balance.total;
    } catch (error) {
      console.error('[Exchange] Failed to get balance:', error);
      throw error;
    }
  }

  async placeOrder(params: OrderParams): Promise<OrderResult> {
    if (!this.isInitialized || !this.exchange) {
      throw new Error('Exchange not initialized');
    }

    console.log(
      `[Exchange] Placing ${params.type} ${params.side} order: ${params.amount} ${params.symbol}`,
    );

    try {
      const exchange = this.exchange as {
        createMarketBuyOrder: (symbol: string, amount: number) => Promise<Record<string, unknown>>;
        createMarketSellOrder: (symbol: string, amount: number) => Promise<Record<string, unknown>>;
        createLimitBuyOrder: (
          symbol: string,
          amount: number,
          price: number,
        ) => Promise<Record<string, unknown>>;
        createLimitSellOrder: (
          symbol: string,
          amount: number,
          price: number,
        ) => Promise<Record<string, unknown>>;
      };

      let order: Record<string, unknown>;

      if (params.type === 'market') {
        order =
          params.side === 'buy'
            ? await exchange.createMarketBuyOrder(params.symbol, params.amount)
            : await exchange.createMarketSellOrder(params.symbol, params.amount);
      } else {
        if (!params.price) throw new Error('Price required for limit order');
        order =
          params.side === 'buy'
            ? await exchange.createLimitBuyOrder(params.symbol, params.amount, params.price)
            : await exchange.createLimitSellOrder(params.symbol, params.amount, params.price);
      }

      return {
        orderId: order.id as string,
        status: order.status as 'open' | 'closed' | 'canceled',
        filled: (order.filled as number) || 0,
        remaining: (order.remaining as number) || 0,
        price: (order.price as number) || 0,
        cost: (order.cost as number) || 0,
        fee: (order.fee as { cost: number })?.cost || 0,
      };
    } catch (error) {
      console.error('[Exchange] Order failed:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    if (!this.isInitialized || !this.exchange) {
      throw new Error('Exchange not initialized');
    }

    try {
      const exchange = this.exchange as {
        cancelOrder: (id: string, symbol: string) => Promise<void>;
      };
      await exchange.cancelOrder(orderId, symbol);
      return true;
    } catch (error) {
      console.error('[Exchange] Cancel failed:', error);
      return false;
    }
  }

  async getOpenOrders(symbol?: string): Promise<OrderResult[]> {
    if (!this.isInitialized || !this.exchange) {
      throw new Error('Exchange not initialized');
    }

    try {
      const exchange = this.exchange as {
        fetchOpenOrders: (symbol?: string) => Promise<Array<Record<string, unknown>>>;
      };
      const orders = await exchange.fetchOpenOrders(symbol);
      return orders.map(order => ({
        orderId: order.id as string,
        status: order.status as 'open' | 'closed' | 'canceled',
        filled: (order.filled as number) || 0,
        remaining: (order.remaining as number) || 0,
        price: (order.price as number) || 0,
        cost: (order.cost as number) || 0,
        fee: (order.fee as { cost: number })?.cost || 0,
      }));
    } catch (error) {
      console.error('[Exchange] Failed to get orders:', error);
      throw error;
    }
  }
}

// Factory function to create exchange from env vars
export async function createExchangeFromEnv(): Promise<ExchangeConnector | null> {
  const name = process.env.EXCHANGE_NAME as ExchangeConfig['name'];
  const apiKey = process.env.EXCHANGE_API_KEY;
  const secret = process.env.EXCHANGE_SECRET;
  const sandbox = process.env.EXCHANGE_SANDBOX !== 'false'; // Default true

  if (!name || !apiKey || !secret) {
    console.log('[Exchange] Missing credentials in env. Paper trading only.');
    return null;
  }

  const connector = new ExchangeConnector();
  const success = await connector.initialize({ name, apiKey, secret, sandbox });

  return success ? connector : null;
}
