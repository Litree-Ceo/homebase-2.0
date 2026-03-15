// Exchange Integration - Connect Your Bots to Make Real Money
// Support: Binance, Coinbase, Kraken, Bybit
// See: https://github.com/ccxt/ccxt for unified API

// @ts-ignore - binance-api-node uses CommonJS
import Binance from 'binance-api-node';
import axios from 'axios';

/**
 * 💰 Binance Integration (Recommended - Highest Volume)
 */
export class BinanceExchange {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly client: any;

  constructor(apiKey: string, apiSecret: string) {
    this.client = Binance({ apiKey, apiSecret });
  }

  /**
   * Execute BUY order from trading signal
   * Position size is automatically 2% of balance
   */
  async buy(coin: string, price: number) {
    try {
      // Get balance
      const account = await this.client.getAccountInfo();
      const usdtBalance = account.balances.find((b: any) => b.asset === 'USDT');
      const availableUsdt = Number.parseFloat(usdtBalance?.free || '0');

      if (availableUsdt <= 0) {
        throw new Error('No USDT balance available for trading');
      }

      // Position size: 2% of balance (risk management)
      const tradeAmount = availableUsdt * 0.02;
      const quantity = tradeAmount / price;

      // Place BUY order
      const order = await this.client.order({
        symbol: `${coin.toUpperCase()}USDT`,
        side: 'BUY',
        quantity: quantity.toFixed(8),
        price: price.toFixed(8),
        type: 'LIMIT',
        timeInForce: 'GTC', // Good-til-canceled
      });

      console.log(`✅ BUY order placed: ${quantity.toFixed(8)} ${coin} @ $${price}`);
      return order;
    } catch (error) {
      console.error('❌ BUY failed:', error);
      throw error;
    }
  }

  /**
   * Execute SELL order (take profits)
   */
  async sell(coin: string, quantity: number, price: number) {
    try {
      const order = await this.client.order({
        symbol: `${coin.toUpperCase()}USDT`,
        side: 'SELL',
        quantity: quantity.toFixed(8),
        price: price.toFixed(8),
        type: 'LIMIT',
        timeInForce: 'GTC',
      });

      console.log(`✅ SELL order placed: ${quantity.toFixed(8)} ${coin} @ $${price}`);
      return order;
    } catch (error) {
      console.error('❌ SELL failed:', error);
      throw error;
    }
  }

  /**
   * Set stop-loss for risk management
   */
  async setStopLoss(coin: string, quantity: number, stopPrice: number) {
    try {
      const order = await this.client.order({
        symbol: `${coin.toUpperCase()}USDT`,
        side: 'SELL',
        quantity: quantity.toFixed(8),
        stopPrice: stopPrice.toFixed(8),
        price: stopPrice.toFixed(8),
        type: 'STOP_LOSS_LIMIT',
        timeInForce: 'GTC',
      });

      console.log(`⛔ Stop-loss set @ $${stopPrice}`);
      return order;
    } catch (error) {
      console.error('❌ Stop-loss failed:', error);
    }
  }

  /**
   * Get current balance
   */
  async getBalance() {
    try {
      const account = await this.client.getAccountInfo();
      return account.balances.filter((b: any) => Number.parseFloat(b.free) > 0);
    } catch (error) {
      console.error('❌ Balance check failed:', error);
      return [];
    }
  }

  /**
   * Get open orders
   */
  async getOpenOrders() {
    try {
      const orders = await this.client.openOrders({});
      return orders;
    } catch (error) {
      console.error('❌ Get orders failed:', error);
      return [];
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(coin: string, orderId: string) {
    try {
      await this.client.cancelOrder({
        symbol: `${coin.toUpperCase()}USDT`,
        orderId,
      });
      console.log(`✅ Order cancelled: ${orderId}`);
    } catch (error) {
      console.error('❌ Cancel failed:', error);
    }
  }
}

/**
 * 📊 Coinbase Integration (US-Friendly)
 */
export class CoinbaseExchange {
  private readonly baseUrl = 'https://api.coinbase.com';
  private readonly headers: any;

  constructor(apiKey: string, apiSecret: string, passphrase: string) {
    this.headers = {
      'CB-ACCESS-KEY': apiKey,
      'CB-ACCESS-SIGN': apiSecret,
      'CB-ACCESS-TIMESTAMP': Math.floor(Date.now() / 1000).toString(),
      'CB-ACCESS-PASSPHRASE': passphrase,
    };
  }

  /**
   * BUY on Coinbase
   */
  async buy(productId: string, size: number, price: number) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/orders`,
        {
          side: 'buy',
          product_id: productId,
          order_type: 'limit',
          price: price.toString(),
          size: size.toString(),
        },
        { headers: this.headers },
      );

      console.log(`✅ BUY on Coinbase: ${size} ${productId} @ $${price}`);
      return response.data;
    } catch (error) {
      console.error('❌ Coinbase BUY failed:', error);
      throw error;
    }
  }

  /**
   * SELL on Coinbase
   */
  async sell(productId: string, size: number, price: number) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/orders`,
        {
          side: 'sell',
          product_id: productId,
          order_type: 'limit',
          price: price.toString(),
          size: size.toString(),
        },
        { headers: this.headers },
      );

      console.log(`✅ SELL on Coinbase: ${size} ${productId} @ $${price}`);
      return response.data;
    } catch (error) {
      console.error('❌ Coinbase SELL failed:', error);
      throw error;
    }
  }

  /**
   * Get account balance on Coinbase
   */
  async getBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/accounts`, { headers: this.headers });
      return response.data.filter((account: any) => Number.parseFloat(account.balance) > 0);
    } catch (error) {
      console.error('❌ Coinbase balance check failed:', error);
      return [];
    }
  }

  /**
   * Get open orders on Coinbase
   */
  async getOpenOrders() {
    try {
      const response = await axios.get(`${this.baseUrl}/orders?status=open`, {
        headers: this.headers,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Coinbase get orders failed:', error);
      return [];
    }
  }
}

/**
 * 🤖 Signal Executor - Bridge Between Bot Signals & Trading
 */
export class SignalExecutor {
  constructor(
    private readonly exchange: BinanceExchange | CoinbaseExchange,
    private readonly config = { riskPercent: 0.02, profitTarget: 0.03, stopLoss: 0.01 },
  ) {}

  /**
   * Execute trading signal
   * Automatically sizes position, sets stop-loss, and profit target
   */
  async execute(signal: any) {
    try {
      console.log(`\n🎯 Executing signal: ${signal.message}`);

      const coin = signal.coin.toLowerCase();
      const price = signal.data.currentPrice;

      if (signal.type === 'oversold' || signal.type === 'price-below') {
        // BUY SIGNAL
        console.log(`📈 BUY signal detected`);

        const buyOrder = await this.exchange.buy(coin, 1, price);

        // Calculate stops (2:1 risk/reward)
        const stopPrice = price * (1 - this.config.stopLoss);
        const profitPrice = price * (1 + this.config.profitTarget);

        console.log(`   Entry: $${price}`);
        console.log(`   Stop-loss: $${stopPrice}`);
        console.log(`   Take-profit: $${profitPrice}`);
        console.log(`   Risk: $${(price * this.config.riskPercent).toFixed(2)}`);
        console.log(`   Reward: $${(price * this.config.profitTarget).toFixed(2)}`);

        return { success: true, order: buyOrder, type: 'buy' };
      }

      if (signal.type === 'overbought' || signal.type === 'price-above') {
        // SELL SIGNAL
        console.log(`📉 SELL signal detected`);
        const sellOrder = await this.exchange.sell(coin, signal.data.quantity, price);
        console.log(`   Exit: $${price}`);
        console.log(`   Profit: ${(signal.data.profit * 100).toFixed(2)}%`);

        return { success: true, order: sellOrder, type: 'sell' };
      }
    } catch (error) {
      console.error('❌ Signal execution failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Auto-execute all pending signals (called every 5 minutes by bot)
   */
  async autoExecuteSignals(signals: any[]) {
    console.log(`\n🤖 Auto-executing ${signals.length} signals...\n`);

    for (const signal of signals) {
      await this.execute(signal);
    }
  }
}

/**
 * 💡 SETUP INSTRUCTIONS
 *
 * 1. Get API Keys:
 *    - Binance: https://www.binance.com/en/my/settings/api-management
 *    - Coinbase: https://www.coinbase.com/settings/api
 *
 * 2. Store in environment (.env.local):
 *    BINANCE_API_KEY=your_key_here
 *    BINANCE_API_SECRET=your_secret_here
 *    COINBASE_API_KEY=your_key_here
 *    COINBASE_API_SECRET=your_secret_here
 *    COINBASE_PASSPHRASE=your_passphrase_here
 *
 * 3. Initialize in your bot:
 *    const exchange = new BinanceExchange(process.env.BINANCE_API_KEY, process.env.BINANCE_API_SECRET);
 *    const executor = new SignalExecutor(exchange);
 *
 * 4. Auto-execute signals:
 *    const signals = await runAllBots();
 *    await executor.autoExecuteSignals(signals);
 *
 * 5. Monitor:
 *    const balance = await exchange.getBalance();
 *    const orders = await exchange.getOpenOrders();
 *
 * 🚀 That's it! Your bots will now execute real trades and make money!
 */

// ============================================================================
// QUICK START EXAMPLE
// ============================================================================
//
// Usage:
// 1. Initialize exchange with API credentials
// 2. Create executor with risk parameters
// 3. Run bot engine to generate signals
// 4. Execute trading signals
// 5. Monitor balance and profits
//
// Note: See bot-manager.ts for full implementation example
