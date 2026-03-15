# 🤖 Bots Integration Guide

> **Integration Status**: ✅ Complete - Bots, Website, Firebase, and Metaverse unified

## 📋 Overview

This system brings together:
- **Trading Bots**: Crypto price monitoring, arbitrage, alerts
- **Metaverse Bots**: Meta/Facebook VR avatars with social commerce
- **Social Bots**: Discord, Twitter, Telegram automation
- **All Connected**: Real-time sync via Firebase, API endpoints, scheduled Azure Functions

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js Web App (apps/web)                                 │
│  ├─ pages/bots.tsx        (Bot Management Dashboard)        │
│  ├─ pages/metaverse.tsx   (Metaverse Interactions)          │
│  └─ lib/firebase.ts       (Real-time Data Sync)             │
│  └─ lib/metaverse-config.ts (Meta/Facebook SDK)             │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌───────▼────────┐
│  Azure Functions│   │   Localhost    │
│  (Cloud)       │   │   Servers      │
│                │   │                │
│ ├─ botApi.ts   │   │ ├─ Port 5001   │
│ │  (Bot Ctrl)  │   │ │ (Bot Manager)│
│ │              │   │ │              │
│ ├─ botTimer.ts │   │ ├─ Port 3001   │
│ │  (Schedule)  │   │ │ (Website)    │
│ │              │   │ │              │
│ └─ crypto.ts   │   │ └─ Port 7071   │
│    (Prices)    │   │    (Dev API)   │
└────────────────┘   └────────────────┘
        │                    │
        └────────┬───────────┘
                 │
         ┌───────▼────────┐
         │  Data Layer    │
         │                │
         │ ├─ Firebase    │
         │ │ (Real-time)  │
         │ │              │
         │ ├─ Cosmos DB   │
         │ │ (Persistent) │
         │ │              │
         │ └─ Meta Graph  │
         │    (Metaverse) │
         └────────────────┘
```

## 🚀 Quick Start

### 1. Set Environment Variables

```bash
# .env.local (root)
NEXT_PUBLIC_META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_PAGE_ACCESS_TOKEN=your_page_token
META_BUSINESS_ACCOUNT_ID=your_business_id
META_WEBHOOK_VERIFY_TOKEN=webhook_verify_token

# Optional: Crypto API
COINGECKO_API_KEY=your_coingecko_key
```

### 2. Start Services

```bash
# Terminal 1: Web App (Next.js)
pnpm -C apps/web dev
# Runs on http://localhost:3000

# Terminal 2: API Backend (Azure Functions)
pnpm -C api start
# Runs on http://localhost:7071/api

# Terminal 3: Bot Manager (Python) - Optional
pnpm bots-manager
# Runs on http://localhost:5001
```

### 3. Navigate to Bot Dashboard

```
http://localhost:3000/bots
```

## 📄 Key Files

### Frontend
- **[apps/web/src/pages/bots.tsx](../apps/web/src/pages/bots.tsx)**
  - Bot management UI
  - Trading bot status display
  - Metaverse bot deployment controls
  - Start/Stop/Pause buttons
  - Real-time updates via Firebase

- **[apps/web/src/lib/firebase.ts](../apps/web/src/lib/firebase.ts)**
  - Firebase client initialization
  - Auth, Firestore setup
  - Used by bots page for real-time sync

- **[apps/web/src/lib/metaverse-config.ts](../apps/web/src/lib/metaverse-config.ts)**
  - Meta/Facebook SDK configuration
  - Graph API endpoints
  - Avatar customization
  - Metaverse commerce setup

### Backend
- **[api/src/functions/botApi.ts](../api/src/functions/botApi.ts)**
  - HTTP endpoint for bot control
  - Handles: list, start, stop, pause, deploy, recall
  - Routes to bot manager or local execution

- **[api/src/functions/botTimer.ts](../api/src/functions/botTimer.ts)**
  - Scheduled function (every 10 minutes)
  - Updates bot statuses
  - Checks crypto prices
  - Syncs metaverse bots

- **[api/src/functions/crypto.ts](../api/src/functions/crypto.ts)**
  - Fetches crypto prices from CoinGecko
  - Used by price alert bots

## 🎮 Bot Types

### Trading Bots
```typescript
{
  id: 'bot-crypto-arbitrage',
  name: 'Crypto Arbitrage Bot',
  type: 'trading',
  status: 'online',
  platform: 'crypto',
  config: {
    apiEndpoint: 'https://api.coingecko.com/api/v3',
    autoStart: true,
    alertsEnabled: true
  }
}
```

### Metaverse Bots
```typescript
{
  id: 'meta-bot-1',
  name: 'Social Commerce Avatar',
  type: 'metaverse',
  status: 'online',
  platform: 'meta',
  metaverseConfig: {
    avatarId: 'avatar-001',
    worldId: 'world-ecommerce',
    interactions: [
      'product-showcase',
      'payment-processing',
      'live-chat'
    ]
  }
}
```

## 🌐 Metaverse Integration

### Meta/Facebook Setup

1. **Create Developer App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create new app
   - Enable Metaverse (Horizon Worlds) products

2. **Get Credentials**
   - App ID
   - App Secret
   - Page Access Token
   - Business Account ID

3. **Configure Webhooks**
   - Set webhook URL: `https://your-domain/api/meta-webhook`
   - Verify token: `META_WEBHOOK_VERIFY_TOKEN`

4. **Set Environment Variables**
   ```bash
   NEXT_PUBLIC_META_APP_ID=123456789
   META_APP_SECRET=your_secret
   META_PAGE_ACCESS_TOKEN=token_here
   META_BUSINESS_ACCOUNT_ID=account_id
   ```

### Create Metaverse Avatar

```typescript
import { configureAvatar } from '@/lib/metaverse-config';

// Deploy bot avatar to metaverse
await configureAvatar('MyBot', '/models/bot-avatar.glb');

// Deploy to world
await deployBotToWorld('bot-1', 'world-ecommerce', {
  appearance: 'humanoid',
  behaviors: ['greet', 'recommend', 'checkout']
});
```

### Commerce in Metaverse

```typescript
import { setupCommerceSpace } from '@/lib/metaverse-config';

// Create virtual store
await setupCommerceSpace('LitLabs Store', 'catalog-123');

// Now users can:
// - See products in VR
// - Use voice commands to buy
// - Crypto payments integrated
// - Real-time inventory sync
```

## 🔌 API Endpoints

### List Bots
```
GET /api/bot-api
```
Returns all trading and metaverse bots with status.

### Start Bot
```
POST /api/bot-api
Content-Type: application/json

{
  "action": "start",
  "botId": "bot-crypto-arbitrage"
}
```

### Deploy Metaverse Bot
```
POST /api/bot-api
Content-Type: application/json

{
  "action": "deploy",
  "botId": "meta-bot-1",
  "config": {
    "worldId": "world-ecommerce",
    "avatarId": "avatar-001"
  }
}
```

## 📊 Real-time Sync with Firebase

### Listen to Bot Status Changes
```typescript
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const unsub = onSnapshot(
  collection(db, 'bots'),
  (snapshot) => {
    const bots = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setBots(bots); // Update UI
  }
);
```

### Update Bot Status
```typescript
import { doc, updateDoc } from 'firebase/firestore';

await updateDoc(doc(db, 'bots', botId), {
  status: 'online',
  lastUpdate: new Date().toISOString()
});
```

## 💰 Payment Integration

Bots can be monetized through:

1. **Subscription Plans**
   - Basic: Free (1 bot)
   - Pro: $9.99/mo (5 bots + advanced features)
   - Enterprise: Custom pricing

2. **Pay-per-Trade**
   - $0.01 per trade
   - Paid via Paddle or crypto

3. **Metaverse Commerce**
   - Virtual goods/services
   - NFT support
   - Crypto payments

Configure in Paddle webhook:
```typescript
// api/src/functions/paddle-webhook.ts
if (body.event_type === 'subscription.created') {
  // Grant bot access
  // Enable premium features
}
```

## 🧪 Testing Bots

### Local Testing
```bash
# Test bot list
curl http://localhost:7071/api/bot-api

# Test start bot
curl -X POST http://localhost:7071/api/bot-api \
  -H "Content-Type: application/json" \
  -d '{"action":"start","botId":"bot-crypto-arbitrage"}'
```

### Monitor Logs
```bash
# Watch Azure Functions logs
func azure functionapp logstream litlabs-api -r homebase-rg

# Or check locally
tail -f api/logs/output.log
```

## 🔐 Security Checklist

- [ ] Store secrets in Key Vault (never in .env)
- [ ] Use HTTPS for all API calls
- [ ] Verify Meta webhook signatures
- [ ] Rate limit bot API endpoints
- [ ] Audit bot actions and trades
- [ ] Encrypt sensitive bot configs
- [ ] Use managed identities for Azure

## 🐛 Troubleshooting

### Bot Not Starting
```bash
# Check API logs
curl http://localhost:7071/api/bot-api

# Verify bot manager is running
lsof -i :5001

# Check Firebase connection
# See firebase.ts for auth errors
```

### Metaverse Bot Not Deploying
```bash
# Verify Meta credentials
echo $NEXT_PUBLIC_META_APP_ID

# Test Graph API
curl -G https://graph.instagram.com/v18.0/me \
  -d access_token=YOUR_TOKEN
```

### Real-time Sync Not Working
```bash
# Check Firebase rules
# In Firebase Console > Firestore > Rules
# Ensure "bots" collection is readable/writable

# Verify network in DevTools Console
// Should show Firebase messages
firebase.* calls being made
```

## 📚 Next Steps

1. **Deploy to Azure**
   ```bash
   pnpm -C api build
   func azure functionapp publish litlabs-api
   ```

2. **Set Up CI/CD**
   - GitHub Actions to deploy on push
   - Test bots automatically
   - Monitor production logs

3. **Advanced Features**
   - Telegram bot integration
   - Discord bot integration
   - Twitter/X automation
   - Custom bot templates

4. **Monetization**
   - Charge for premium bots
   - Take percentage of trades
   - Offer consulting services

## 📞 Support

- **Issues**: Check [GitHub Issues](https://github.com/litlabs/homebase)
- **Docs**: See [api/README.md](../api/README.md)
- **Firebase**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Meta**: [developers.facebook.com](https://developers.facebook.com)

---

**Status**: ✅ All systems operational
**Last Updated**: 2026-01-15
**Maintained By**: LITLABS
