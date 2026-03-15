# 🤖 LITLABS Autonomous Crypto Bot System

> Intelligent crypto monitoring and analysis bots that run autonomously on Azure Functions.

## 📂 Architecture

```
api/src/bots/
├── index.ts                    # Main entry point
├── types.ts                    # TypeScript interfaces
├── engine.ts                   # Bot orchestrator
├── market-data.ts              # CoinGecko data service + technical indicators
├── utils.ts                    # Helper functions
├── scheduler.ts                # Azure Functions timer triggers
├── api.ts                      # REST API endpoints
└── strategies/
    ├── index.ts                # Strategy exports
    ├── price-alert.ts          # Threshold-based alerts
    ├── opportunity-detector.ts # Sudden move detection
    ├── sma-crossover.ts        # Moving average signals
    └── arbitrage-scanner.ts    # Cross-exchange price comparison
```

## 🚀 Quick Start

### 1. Build and Run

```powershell
# From repo root
pnpm -C api build
pnpm -C api start
```

### 2. Test Endpoints

Open `crypto-api.http` in VS Code with REST Client extension:

```http
### Get market overview
GET http://localhost:7071/api/bots/market

### Run opportunity detector
POST http://localhost:7071/api/bots/run/opportunity
Content-Type: application/json

{ "coins": ["bitcoin", "ethereum", "solana"] }
```

## 📊 Strategies

### Price Alert (`price-alert`)

Monitors coins against price thresholds.

| Config       | Default | Description                   |
| ------------ | ------- | ----------------------------- |
| `condition`  | -       | `above`, `below`, or `change` |
| `threshold`  | -       | Price or percent value        |
| `cooldownMs` | 3600000 | 1 hour between re-alerts      |

**Preset Alerts:**

- BTC > $100,000 🚀
- BTC < $90,000 📉
- ETH > $4,000
- SOL ±10% move

### Opportunity Detector (`opportunity`)

Scans for unusual market activity:

- 24h price changes > 5%
- Volume spikes (2x normal)
- Trending coins with momentum
- RSI oversold/overbought

### SMA Crossover (`sma`)

Classic moving average analysis:

- **Golden Cross**: 7-day SMA crosses above 30-day (bullish)
- **Death Cross**: 7-day SMA crosses below 30-day (bearish)
- Includes EMA confirmation for signal strength

### Arbitrage Scanner (`arbitrage`)

Compares prices across exchanges:

- CoinGecko (baseline)
- Binance
- Coinbase
- Kraken

⚠️ _Real arbitrage requires fast execution and fee consideration_

## ⏰ Scheduled Execution

The bots run automatically via Azure Functions timers:

| Bot                  | Schedule      | Description               |
| -------------------- | ------------- | ------------------------- |
| Price Alerts         | Every minute  | Check price thresholds    |
| Opportunity Detector | Every 5 mins  | Scan for unusual activity |
| SMA Crossover        | Every hour    | Technical analysis        |
| Daily Summary        | 8 AM UTC      | Market digest             |
| Health Check         | Every 15 mins | Bot status monitoring     |

## 🔌 API Endpoints

### Bot Management

| Method | Endpoint                    | Description                 |
| ------ | --------------------------- | --------------------------- |
| GET    | `/api/bots`                 | List all bots and status    |
| GET    | `/api/bots/signals`         | Get recent signals          |
| GET    | `/api/bots/market`          | Market overview             |
| GET    | `/api/bots/analysis/{coin}` | Technical analysis for coin |
| POST   | `/api/bots/run/{strategy}`  | Trigger bot manually        |

### Example Response: Market Overview

```json
{
  "timestamp": "2026-01-04T12:00:00Z",
  "majorCoins": [
    { "coin": "bitcoin", "price": 97500, "priceChange24h": 2.3 }
  ],
  "topGainers": [...],
  "topLosers": [...],
  "trending": ["pepe", "bonk", "moodeng"]
}
```

### Example Response: Signal

```json
{
  "id": "sig_abc123",
  "botId": "opportunity-detector",
  "type": "price-change",
  "coin": "solana",
  "message": "🎯 SOLANA pump: +12.5% in 24h",
  "severity": "warning",
  "data": {
    "currentPrice": 245.5,
    "percentChange": 12.5,
    "volume24h": 5200000000
  }
}
```

## 🛠️ Technical Indicators

The `market-data.ts` service includes:

```typescript
// Simple Moving Average
calculateSMA(prices: number[], period: number): number

// Exponential Moving Average
calculateEMA(prices: number[], period: number): number

// Relative Strength Index
calculateRSI(prices: number[], period: number): number

// Support/Resistance Levels
findSupportResistance(ohlc: OHLCData[], lookback: number)
```

## 🔮 Extending the System

### Add a New Strategy

1. Create `strategies/my-strategy.ts`:

```typescript
import { Signal } from '../types';
import { getMarketData } from '../market-data';
import { generateId } from '../utils';

export class MyStrategy {
  async execute(coins: string[]): Promise<Signal[]> {
    const signals: Signal[] = [];
    const data = await getMarketData(coins);

    for (const market of data) {
      if (/* your condition */) {
        signals.push({
          id: generateId('my'),
          botId: 'my-strategy',
          timestamp: new Date().toISOString(),
          type: 'price-change',
          coin: market.coin,
          message: `📊 ${market.coin} signal!`,
          data: { currentPrice: market.price },
          severity: 'info',
          acknowledged: false,
        });
      }
    }

    return signals;
  }
}
```

2. Export from `strategies/index.ts`
3. Add to `api.ts` switch statement
4. Optionally add timer in `scheduler.ts`

### Add Notification Channels

Extend `handleSignals()` in `scheduler.ts`:

```typescript
// Webhook
await fetch(process.env.WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(signal),
});

// Cosmos DB persistence
const container = await getContainer('signals');
await container.items.create(signal);

// Discord webhook
await fetch(process.env.DISCORD_WEBHOOK, {
  method: 'POST',
  body: JSON.stringify({ content: signal.message }),
});
```

## ⚠️ Important Notes

1. **Rate Limits**: CoinGecko free tier allows 30 calls/min. The system uses caching to respect this.

2. **Not Financial Advice**: These bots are for educational/experimental use. Always DYOR.

3. **Paper Trading First**: Never connect to real exchange APIs without extensive testing.

4. **Costs**: Timer triggers on Azure have minimal cost but can add up. Monitor usage.

## 🔗 Related Files

- [crypto-api.http](../crypto-api.http) - REST Client tests
- [crypto.ts](functions/crypto.ts) - Original price endpoint
- [cosmos.ts](functions/cosmos.ts) - Database operations

## 🚧 Roadmap

- [ ] Cosmos DB signal persistence
- [ ] SignalR real-time UI updates
- [ ] Discord/Telegram notifications
- [ ] ccxt exchange integration
- [ ] Paper trading mode
- [ ] Backtesting framework
- [ ] ML-based signal validation
