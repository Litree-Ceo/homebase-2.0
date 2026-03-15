# 🔗 ProfitPilot Integration Guide - Link Trading Bot to Your Apps

**Quick Reference:** How to integrate ProfitPilot (Trading Bot) with your HomeBase 2.0 applications

---

## 🎯 What is ProfitPilot?

**ProfitPilot** = Your automated crypto **Tra**ding **E**ngine

- **Location:** `github/api/src/bots/trader.ts`
- **Purpose:** Execute crypto trades 24/7 automatically
- **Status:** ✅ Fully functional, ready to integrate

---

## 🚀 Quick Integration (5 Minutes)

### Step 1: Start ProfitPilot API

```bash
cd github/api
pnpm start
```

API runs on: `http://localhost:7071`

### Step 2: Test ProfitPilot Endpoints

```bash
# Check if ProfitPilot is alive
curl http://localhost:7071/api/trader/status

# Start trading
curl -X POST http://localhost:7071/api/trader/start

# Get trade history
curl http://localhost:7071/api/trader/history
```

### Step 3: Add to Your Frontend

```typescript
// In apps/web/src/lib/trae-client.ts
export class ProfitPilotClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071';

  async getStatus() {
    const res = await fetch(`${this.baseUrl}/api/trader/status`);
    return res.json();
  }

  async startTrading() {
    const res = await fetch(`${this.baseUrl}/api/trader/start`, {
      method: 'POST'
    });
    return res.json();
  }

  async stopTrading() {
    const res = await fetch(`${this.baseUrl}/api/trader/stop`, {
      method: 'POST'
    });
    return res.json();
  }

  async getHistory() {
    const res = await fetch(`${this.baseUrl}/api/trader/history`);
    return res.json();
  }
}

export const trae = new ProfitPilotClient();
```

### Step 4: Create Trading Dashboard Component

```tsx
// In apps/web/src/components/TradingDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { trae } from '@/lib/trae-client';

export function TradingDashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    try {
      const data = await trae.getStatus();
      setStatus(data);
    } catch (error) {
      console.error('Failed to load status:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    await trae.startTrading();
    await loadStatus();
  }

  async function handleStop() {
    await trae.stopTrading();
    await loadStatus();
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">ProfitPilot Trading Bot</h2>
      
      {/* Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            status?.isActive ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="font-semibold">
            {status?.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Balance</div>
          <div className="text-xl font-bold">${status?.balance?.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Open Orders</div>
          <div className="text-xl font-bold">{status?.openOrders || 0}</div>
        </div>
        <div className="p-4 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-xl font-bold">{status?.successRate || '0%'}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={status?.isActive}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Start Trading
        </button>
        <button
          onClick={handleStop}
          disabled={!status?.isActive}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Stop Trading
        </button>
      </div>
    </div>
  );
}
```

### Step 5: Add to Your Page

```tsx
// In apps/web/src/app/dashboard/page.tsx
import { TradingDashboard } from '@/components/TradingDashboard';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <TradingDashboard />
    </div>
  );
}
```

---

## 📡 ProfitPilot API Reference

### Endpoints

#### GET /api/trader/status
Get current trading status

**Response:**
```json
{
  "timestamp": "2026-01-07T12:00:00Z",
  "isActive": true,
  "balance": 1234.56,
  "openOrders": 3,
  "totalTrades": 45,
  "successfulTrades": 32,
  "successRate": "71.11%",
  "recentTrades": [...]
}
```

#### POST /api/trader/start
Start automated trading

**Response:**
```json
{
  "success": true,
  "message": "Trading started",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

#### POST /api/trader/stop
Stop automated trading

**Response:**
```json
{
  "success": true,
  "message": "Trading stopped",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

#### GET /api/trader/history
Get trade history

**Response:**
```json
{
  "trades": [
    {
      "id": "trade-123",
      "timestamp": "2026-01-07T11:30:00Z",
      "symbol": "BTCUSDT",
      "side": "BUY",
      "price": 45000,
      "quantity": 0.01,
      "profit": 15.50,
      "status": "executed"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 10
}
```

#### POST /api/trader/execute
Execute specific trading signal

**Request:**
```json
{
  "signal": {
    "symbol": "BTCUSDT",
    "action": "BUY",
    "price": 45000,
    "strategy": "rsi-oversold"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order-456",
  "executedPrice": 45000,
  "quantity": 0.01
}
```

---

## 🎨 Pre-built Components

### 1. Trading Status Badge

```tsx
// components/TradeStatusBadge.tsx
export function TradeStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`px-2 py-1 rounded text-sm font-semibold ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {isActive ? '🟢 Trading Active' : '⚫ Trading Paused'}
    </span>
  );
}
```

### 2. Recent Trades List

```tsx
// components/RecentTradesList.tsx
export function RecentTradesList({ trades }: { trades: any[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold mb-2">Recent Trades</h3>
      {trades.map(trade => (
        <div key={trade.id} className="p-3 bg-gray-50 rounded flex justify-between">
          <div>
            <div className="font-medium">{trade.symbol}</div>
            <div className="text-sm text-gray-600">{trade.timestamp}</div>
          </div>
          <div className={`font-bold ${
            trade.profit > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 3. Profit Chart

```tsx
// components/ProfitChart.tsx
'use client';

import { Line } from 'react-chartjs-2';

export function ProfitChart({ data }: { data: any[] }) {
  const chartData = {
    labels: data.map(d => d.timestamp),
    datasets: [{
      label: 'Cumulative Profit',
      data: data.map(d => d.cumulativeProfit),
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
    }]
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold mb-4">Profit Over Time</h3>
      <Line data={chartData} />
    </div>
  );
}
```

---

## 🔔 Real-time Updates with WebSockets

```typescript
// lib/trae-websocket.ts
export class ProfitPilotWebSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    this.ws = new WebSocket('ws://localhost:7071/api/trader/ws');
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit(data.type, data.payload);
    };
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  disconnect() {
    this.ws?.close();
  }
}

// Usage in component
const ws = new ProfitPilotWebSocket();
ws.connect();
ws.on('trade.executed', (trade) => {
  console.log('New trade:', trade);
  // Update UI
});
```

---

## 🔐 Security Best Practices

### 1. Protect API Keys

```typescript
// Never expose in frontend
// ❌ BAD
const apiKey = 'my-binance-key';

// ✅ GOOD - Use environment variables
const apiKey = process.env.BINANCE_API_KEY;
```

### 2. Add Authentication

```typescript
// lib/trae-client.ts
export class ProfitPilotClient {
  private async request(endpoint: string, options?: RequestInit) {
    const token = await getAuthToken(); // Your auth system
    
    return fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${token}`,
      }
    });
  }
}
```

### 3. Rate Limiting

```typescript
// Prevent abuse
let lastRequest = 0;
const MIN_INTERVAL = 1000; // 1 second

async function rateLimitedRequest() {
  const now = Date.now();
  if (now - lastRequest < MIN_INTERVAL) {
    throw new Error('Too many requests');
  }
  lastRequest = now;
  // Make request
}
```

---

## 📱 Mobile Integration

### React Native Example

```typescript
// mobile/src/screens/TradingScreen.tsx
import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';

export function TradingScreen() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    const res = await fetch('http://localhost:7071/api/trader/status');
    const data = await res.json();
    setStatus(data);
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        ProfitPilot Trading Bot
      </Text>
      <Text>Status: {status?.isActive ? 'Active' : 'Inactive'}</Text>
      <Text>Balance: ${status?.balance}</Text>
      <Button title="Start Trading" onPress={handleStart} />
    </View>
  );
}
```

---

## 🧪 Testing Integration

```typescript
// __tests__/trae-integration.test.ts
import { trae } from '@/lib/trae-client';

describe('ProfitPilot Integration', () => {
  it('should get status', async () => {
    const status = await trae.getStatus();
    expect(status).toHaveProperty('balance');
    expect(status).toHaveProperty('isActive');
  });

  it('should start trading', async () => {
    const result = await trae.startTrading();
    expect(result.success).toBe(true);
  });

  it('should get trade history', async () => {
    const history = await trae.getHistory();
    expect(Array.isArray(history.trades)).toBe(true);
  });
});
```

---

## 🎯 Integration Checklist

- [ ] ProfitPilot API running on port 7071
- [ ] Environment variables configured
- [ ] ProfitPilotClient created in frontend
- [ ] TradingDashboard component added
- [ ] API endpoints tested
- [ ] Real-time updates working
- [ ] Error handling implemented
- [ ] Authentication added
- [ ] Rate limiting configured
- [ ] Mobile app integrated (if applicable)
- [ ] Tests passing

---

## 🚀 Next Steps

1. **Basic Integration** (30 min)
   - Create ProfitPilotClient
   - Add TradingDashboard component
   - Test endpoints

2. **Enhanced Features** (2 hours)
   - Add real-time WebSocket updates
   - Create profit charts
   - Build trade history view

3. **Production Ready** (1 day)
   - Add authentication
   - Implement error handling
   - Add monitoring & alerts
   - Deploy to production

---

## 📚 Additional Resources

- **ProfitPilot Source Code:** `github/api/src/bots/trader.ts`
- **Trading Strategies:** `github/api/src/bots/strategies/`
- **Setup Guide:** `github/TRADING_SETUP_GUIDE.md`
- **API Documentation:** `github/docs/reference/`

---

## 💡 Pro Tips

1. **Start with Paper Trading** - Test with fake money first
2. **Monitor Closely** - Watch the first few trades carefully
3. **Start Small** - Use low risk percentage initially
4. **Set Alerts** - Get notified of important events
5. **Review Regularly** - Check performance weekly

---

**Status:** ✅ Ready to Integrate  
**Difficulty:** ⭐⭐ (Intermediate)  
**Time Required:** 30 minutes - 2 hours

**Let's connect ProfitPilot to your apps and start trading! 🚀💰**
