# 🏗️ HomeBase 2.0 Architecture - ProfitPilot Integration Map

**Visual guide showing how ProfitPilot (Trading Bot) connects with your entire project**

---

## 🎯 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Web App    │  │  Labs AI     │  │  LitLabs     │         │
│  │ (Next.js)    │  │  Platform    │  │  Website     │         │
│  │ Port 3000    │  │              │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                      │
│                    REST API / JSON                               │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AZURE FUNCTIONS API                           │
│                      (Port 7071)                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              🤖 ProfitPilot TRADING ENGINE                     │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │   Trader     │  │  Strategies  │  │   Profit    │ │    │
│  │  │  Executor    │  │   Engine     │  │   Tracker   │ │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │    │
│  │         │                 │                 │         │    │
│  │         └─────────────────┴─────────────────┘         │    │
│  │                           │                            │    │
│  │                    Signal Generation                   │    │
│  │                           │                            │    │
│  │         ┌─────────────────┴─────────────────┐         │    │
│  │         │                                     │         │    │
│  │  ┌──────▼──────┐  ┌──────────┐  ┌──────────▼──────┐ │    │
│  │  │ Grid Trade  │  │   RSI    │  │   Momentum      │ │    │
│  │  │  Strategy   │  │ Oversold │  │   Scalping      │ │    │
│  │  └─────────────┘  └──────────┘  └─────────────────┘ │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              OTHER API FUNCTIONS                        │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  • Meta/Facebook Integration                           │    │
│  │  • User Authentication                                 │    │
│  │  • Content Management                                  │    │
│  │  • Analytics & Monitoring                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Binance    │  │  Coinbase    │  │ Azure Cosmos │         │
│  │   Exchange   │  │  Exchange    │  │     DB       │         │
│  │              │  │              │  │              │         │
│  │  • Market    │  │  • Market    │  │  • Trades    │         │
│  │    Data      │  │    Data      │  │  • Users     │         │
│  │  • Orders    │  │  • Orders    │  │  • Config    │         │
│  │  • Balance   │  │  • Balance   │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow - Trading Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATED TRADING CYCLE                       │
└─────────────────────────────────────────────────────────────────┘

1. SIGNAL GENERATION (Every 5 minutes)
   ┌─────────────────────────────────────┐
   │  Strategy Engine                     │
   │  • Fetch market data from Binance   │
   │  • Run 4 strategies in parallel     │
   │  • Generate buy/sell signals        │
   └──────────────┬──────────────────────┘
                  │
                  ▼
2. SIGNAL VALIDATION
   ┌─────────────────────────────────────┐
   │  Risk Manager                        │
   │  • Check account balance            │
   │  • Validate position size (2%)      │
   │  • Verify risk limits               │
   └──────────────┬──────────────────────┘
                  │
                  ▼
3. ORDER EXECUTION
   ┌─────────────────────────────────────┐
   │  Trader Executor                     │
   │  • Place order on exchange          │
   │  • Set stop-loss (-1%)              │
   │  • Set take-profit (+3%)            │
   └──────────────┬──────────────────────┘
                  │
                  ▼
4. MONITORING
   ┌─────────────────────────────────────┐
   │  Position Monitor                    │
   │  • Track open positions             │
   │  • Watch for stop/target hits       │
   │  • Update profit tracker            │
   └──────────────┬──────────────────────┘
                  │
                  ▼
5. COMPLETION
   ┌─────────────────────────────────────┐
   │  Trade Logger                        │
   │  • Save to Cosmos DB                │
   │  • Update statistics                │
   │  • Send notifications               │
   └─────────────────────────────────────┘
                  │
                  ▼
              [Repeat]
```

---

## 🌐 Frontend Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEB APP (apps/web)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Dashboard Page (/dashboard)                           │    │
│  │  ┌──────────────────────────────────────────────────┐ │    │
│  │  │  <TradingDashboard />                            │ │    │
│  │  │  • Live status indicator                         │ │    │
│  │  │  • Balance display                               │ │    │
│  │  │  • Start/Stop controls                           │ │    │
│  │  │  • Success rate metrics                          │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Trading Page (/trading)                               │    │
│  │  ┌──────────────────────────────────────────────────┐ │    │
│  │  │  <RecentTradesList />                            │ │    │
│  │  │  • Trade history                                 │ │    │
│  │  │  • Profit/loss per trade                         │ │    │
│  │  │  • Strategy breakdown                            │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  │  ┌──────────────────────────────────────────────────┐ │    │
│  │  │  <ProfitChart />                                 │ │    │
│  │  │  • Cumulative profit graph                       │ │    │
│  │  │  • Daily/weekly/monthly views                    │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Settings Page (/settings/trading)                     │    │
│  │  ┌──────────────────────────────────────────────────┐ │    │
│  │  │  <TradingSettings />                             │ │    │
│  │  │  • Risk percentage slider                        │ │    │
│  │  │  • Profit target input                           │ │    │
│  │  │  • Stop-loss input                               │ │    │
│  │  │  • Strategy toggles                              │ │    │
│  │  └──────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints Map

```
┌─────────────────────────────────────────────────────────────────┐
│              ProfitPilot API ENDPOINTS (Port 7071)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GET  /api/trader/status                                        │
│       └─> Returns: { isActive, balance, openOrders, stats }    │
│                                                                  │
│  POST /api/trader/start                                         │
│       └─> Starts automated trading                             │
│                                                                  │
│  POST /api/trader/stop                                          │
│       └─> Stops automated trading                              │
│                                                                  │
│  GET  /api/trader/history?page=1&limit=10                      │
│       └─> Returns: { trades[], total, page }                   │
│                                                                  │
│  POST /api/trader/execute                                       │
│       └─> Body: { signal }                                     │
│       └─> Executes specific trading signal                     │
│                                                                  │
│  GET  /api/trader/strategies                                    │
│       └─> Returns: List of available strategies                │
│                                                                  │
│  GET  /api/trader/performance                                   │
│       └─> Returns: { roi, winRate, avgProfit, ... }           │
│                                                                  │
│  WS   /api/trader/ws                                            │
│       └─> WebSocket for real-time updates                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure Map

```
homebase-2.0/
│
├── github/                              # Main workspace
│   │
│   ├── api/                             # Backend API
│   │   ├── src/
│   │   │   ├── bots/                    # 🤖 ProfitPilot CORE
│   │   │   │   ├── trader.ts            # Main executor
│   │   │   │   ├── paper-trading.ts     # Test mode
│   │   │   │   ├── profit-tracker.ts    # P&L tracking
│   │   │   │   ├── types.ts             # Type definitions
│   │   │   │   ├── exchanges/
│   │   │   │   │   └── exchange-integration.ts
│   │   │   │   └── strategies/          # Trading strategies
│   │   │   │       ├── grid-trading.ts
│   │   │   │       ├── rsi-oversold.ts
│   │   │   │       ├── momentum-scalp.ts
│   │   │   │       ├── sma-crossover.ts
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── functions/               # API endpoints
│   │   │   │   ├── trader-api.ts        # ProfitPilot endpoints
│   │   │   │   ├── meta-api.ts
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── lib/                     # Utilities
│   │   │       ├── cosmos.ts
│   │   │       ├── auth.ts
│   │   │       └── ...
│   │   │
│   │   └── package.json
│   │
│   ├── apps/                            # Frontend apps
│   │   ├── web/                         # Main web app
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx     # Add <TradingDashboard />
│   │   │   │   │   ├── trading/
│   │   │   │   │   │   └── page.tsx     # Trading page
│   │   │   │   │   └── ...
│   │   │   │   │
│   │   │   │   ├── components/
│   │   │   │   │   ├── TradingDashboard.tsx    # Create this
│   │   │   │   │   ├── RecentTradesList.tsx    # Create this
│   │   │   │   │   ├── ProfitChart.tsx         # Create this
│   │   │   │   │   └── ...
│   │   │   │   │
│   │   │   │   └── lib/
│   │   │   │       ├── trae-client.ts          # Create this
│   │   │   │       ├── trae-websocket.ts       # Create this
│   │   │   │       └── ...
│   │   │   │
│   │   │   └── package.json
│   │   │
│   │   ├── labs-ai/                     # Labs AI platform
│   │   ├── litlabs-web/                 # LitLabs website
│   │   └── ...
│   │
│   ├── packages/                        # Shared packages
│   │   └── core/
│   │       └── src/
│   │           ├── types/
│   │           │   └── trading.ts       # Shared trading types
│   │           └── utils/
│   │               └── trading.ts       # Shared trading utils
│   │
│   ├── scripts/                         # Automation
│   │   ├── Start-Trading.ps1            # Start ProfitPilot
│   │   ├── Start-TestnetTrading.ps1     # Test mode
│   │   └── ...
│   │
│   └── docs/                            # Documentation
│       ├── TRADING_SETUP_GUIDE.md
│       └── ...
│
├── PROJECT_OVERVIEW_WITH_ProfitPilot.md        # 📄 This overview
├── ProfitPilot_INTEGRATION_GUIDE.md            # 📄 Integration guide
└── ProfitPilot_ARCHITECTURE.md                 # 📄 This file
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Frontend Security                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • No API keys in client code                            │  │
│  │  • Authentication tokens only                            │  │
│  │  • HTTPS only in production                              │  │
│  │  • Rate limiting on requests                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  Layer 2: API Gateway                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • JWT token validation                                  │  │
│  │  • Request throttling                                    │  │
│  │  • IP whitelisting (optional)                            │  │
│  │  • CORS configuration                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  Layer 3: API Security                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Environment variables for secrets                     │  │
│  │  • Azure Key Vault integration                           │  │
│  │  • Encrypted database connections                        │  │
│  │  • Audit logging                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  Layer 4: Exchange Security                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • API keys with trading-only permissions                │  │
│  │  • No withdrawal permissions                             │  │
│  │  • IP whitelist on exchange                              │  │
│  │  • 2FA enabled on account                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              AZURE CLOUD                                │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  Azure Container Apps                            │  │    │
│  │  │  ┌────────────────┐  ┌────────────────┐         │  │    │
│  │  │  │  Web Frontend  │  │  API Backend   │         │  │    │
│  │  │  │  (Next.js)     │  │  (Functions)   │         │  │    │
│  │  │  │                │  │  + ProfitPilot Bot    │         │  │    │
│  │  │  └────────────────┘  └────────────────┘         │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  Azure Cosmos DB                                 │  │    │
│  │  │  • Global distribution                           │  │    │
│  │  │  • Low latency reads                             │  │    │
│  │  │  • Automatic scaling                             │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  Azure Key Vault                                 │  │    │
│  │  │  • Binance API keys                              │  │    │
│  │  │  • Database credentials                          │  │    │
│  │  │  • OAuth secrets                                 │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              GOOGLE CLOUD (Secondary)                   │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  Cloud Run                                       │  │    │
│  │  │  • Backup deployment                             │  │    │
│  │  │  • Multi-region failover                         │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING STACK                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Application Insights (Azure)                          │    │
│  │  • API request tracking                                │    │
│  │  • Error logging                                       │    │
│  │  • Performance metrics                                 │    │
│  │  • Custom events (trades, signals)                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Trading Metrics Dashboard                             │    │
│  │  • Total trades executed                               │    │
│  │  • Success rate                                        │    │
│  │  • Profit/loss tracking                                │    │
│  │  • Strategy performance                                │    │
│  │  • Exchange API health                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Alerts & Notifications                                │    │
│  │  • Trade execution failures                            │    │
│  │  • Large losses detected                               │    │
│  │  • API rate limits hit                                 │    │
│  │  • System errors                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Development Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEV → STAGING → PRODUCTION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOCAL DEVELOPMENT                                           │
│     ┌──────────────────────────────────────────────────────┐   │
│     │  • Run API locally (port 7071)                       │   │
│     │  • Run web app locally (port 3000)                   │   │
│     │  • Use paper trading mode                            │   │
│     │  • Test with mock data                               │   │
│     └──────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  2. COMMIT & PUSH                                               │
│     ┌──────────────────────────────────────────────────────┐   │
│     │  • Git commit with conventional commits              │   │
│     │  • Push to feature branch                            │   │
│     │  • CI runs tests & linting                           │   │
│     └──────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  3. PULL REQUEST                                                │
│     ┌──────────────────────────────────────────────────────┐   │
│     │  • Code review                                       │   │
│     │  • Automated tests pass                              │   │
│     │  • Security scan clean                               │   │
│     └──────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  4. MERGE TO MAIN                                               │
│     ┌──────────────────────────────────────────────────────┐   │
│     │  • Automatic deployment to staging                   │   │
│     │  • Integration tests run                             │   │
│     │  • Smoke tests pass                                  │   │
│     └──────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  5. PRODUCTION DEPLOYMENT                                       │
│     ┌──────────────────────────────────────────────────────┐   │
│     │  • Manual approval (optional)                        │   │
│     │  • Deploy to Azure Container Apps                    │   │
│     │  • Health checks pass                                │   │
│     │  • Monitor for issues                                │   │
│     └──────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Reference

### Start Everything Locally

```bash
# Terminal 1: Start API (includes ProfitPilot)
cd github/api
pnpm start

# Terminal 2: Start Web App
cd github/apps/web
pnpm dev

# Terminal 3: Start Trading (optional)
cd github
.\Start-Trading.ps1
```

### Access Points

- **Web App:** http://localhost:3000
- **API:** http://localhost:7071
- **ProfitPilot Status:** http://localhost:7071/api/trader/status
- **API Docs:** http://localhost:7071/api/docs

### Key Files to Edit

```
Frontend Integration:
  apps/web/src/lib/trae-client.ts          # Create API client
  apps/web/src/components/TradingDashboard.tsx  # Create dashboard
  apps/web/src/app/dashboard/page.tsx      # Add to page

Backend Configuration:
  api/src/bots/trader.ts                   # Main trader logic
  api/src/bots/strategies/                 # Trading strategies
  api/src/functions/trader-api.ts          # API endpoints

Environment:
  .env.local                               # Local config
  github/api/.env.local                    # API config
  github/apps/web/.env.local               # Web config
```

---

## 📚 Documentation Links

- **Project Overview:** `PROJECT_OVERVIEW_WITH_ProfitPilot.md`
- **Integration Guide:** `ProfitPilot_INTEGRATION_GUIDE.md`
- **Trading Setup:** `github/TRADING_SETUP_GUIDE.md`
- **API Reference:** `github/docs/reference/`
- **Deployment Guide:** `github/docs/deployment/`

---

**Status:** ✅ Architecture Documented  
**Last Updated:** ${new Date().toISOString().split('T')[0]}

**Your complete HomeBase 2.0 architecture with ProfitPilot integration! 🏗️🤖💰**
