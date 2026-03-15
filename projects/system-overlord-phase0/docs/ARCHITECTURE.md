# System Overlord Architecture Overview

## High-Level Flow

```
User Browser
    ↓
┌─────────────────────────────────────┐
│  Next.js Web App (Public + Control) │
│  ├─ Game Deals Store (GG.deals)    │
│  ├─ Revenue Dashboard               │
│  ├─ WebRTC Chat                     │
│  └─ User Authentication             │
└──────────┬──────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Firebase Backend                   │
│  ├─ Firestore (Real-time DB)       │
│  ├─ Cloud Functions (APIs)          │
│  ├─ Hosting (Static files)          │
│  ├─ Authentication                  │
│  └─ Analytics                       │
└──────────┬──────────────────────────┘
           ├──────────────────────────────────┐
           ↓                                  ↓
┌──────────────────────────┐   ┌──────────────────────┐
│  External APIs           │   │  Termux Bots         │
│  ├─ GG.deals             │   │  ├─ Price Monitor    │
│  ├─ Real-Debrid          │   │  ├─ Debrider         │
│  ├─ AdMob                │   │  ├─ OSINT            │
│  └─ Stripe               │   │  └─ Reporter         │
└──────────────────────────┘   └──────────────────────┘
```

## Data Flow: Revenue Generation

```
1. User visits site
   ↓
2. Clicks GG.deals affiliate link
   ↓
3. Click logged to Firestore: affiliate_clicks
   ↓
4. User buys game on GG.deals
   ↓
5. GG.deals webhook → Cloud Function
   ↓
6. Revenue logged to Firestore: revenue
   ↓
7. Revenue dashboard shows $$ in real-time
   ↓
8. Monthly payout to bank account
```

## Bot Workflow: Autonomous Automation

```
┌─────────────────────────────────────┐
│  Termux Bot Process                 │
├─────────────────────────────────────┤
│  main.py starts all bots            │
│    ├─ gg_deals_monitor.py           │
│    ├─ real_debrid_bot.py            │
│    ├─ osint_aggregator.py           │
│    └─ revenue_reporter.py           │
└─────────────────────────────────────┘
           ↓ (every 5 min)
┌─────────────────────────────────────┐
│  Fetch Data from APIs               │
│  ├─ GG.deals API → game prices      │
│  ├─ Real-Debrid API → links         │
│  ├─ OSINT feeds → threats           │
│  └─ Firebase → revenue totals       │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Process & Analyze                  │
│  ├─ Detect price drops              │
│  ├─ Find deals matching preferences │
│  ├─ Unlock Real-Debrid links        │
│  ├─ Aggregate revenue               │
│  └─ Update dashboards               │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Write to Firestore                 │
│  ├─ deals collection (new prices)   │
│  ├─ revenue collection (earnings)   │
│  ├─ alerts collection (notifications)
│  └─ bot_logs collection (activity)  │
└─────────────────────────────────────┘
           ↑
           └─── Firebase Triggers Cloud Functions (optional)
                ├─ Send notifications
                ├─ Trigger webhooks
                └─ Update dashboard in real-time
```

## Security Model

```
┌─────────────────────────────────────┐
│  User Authentication                │
├─────────────────────────────────────┤
│  1. Firebase Auth (Email/Google)    │
│  2. ID Token generated              │
│  3. Token sent with every request   │
│  4. Firestore rules verify token    │
│  5. User can only access own data   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Bot Authentication                 │
├─────────────────────────────────────┤
│  1. Service Account credentials     │
│  2. Firebase Admin SDK initialized  │
│  3. Read/write with elevated perms  │
│  4. API tokens stored in .env       │
│  5. Sensitive data never logged     │
└─────────────────────────────────────┘
```

## Scaling Path ($0 → ∞)

### Phase 0: Foundation ($0)
- Firebase Spark tier (free)
- Public WebRTC (no TURN server)
- Firestore Spark limits
- ~100 MAU capacity

### Phase 1: Professional ($3)
- Custom domain ($12/yr)
- Coturn TURN server ($3-5/mo)
- AdMob revenue share enabled
- ~1K MAU capacity

### Phase 2: Growth ($10-50)
- Firebase Blaze (pay-as-you-go)
- CDN for static assets
- Dedicated database replicas
- ~10K MAU capacity

### Phase 3: Enterprise (Self-funded)
- Kubernetes (Agones)
- Global TURN infrastructure
- Multi-region Firestore
- Unlimited MAU

## Cost Breakdown per Phase

| Service | Phase 0 | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|---------|
| Firebase | $0 | $0 | $10-50 | $100+ |
| TURN | $0* | $3-5 | $10-20 | $50+ |
| Domain | $0 | $12 | $12 | $12 |
| CDN | $0 | $0 | $10-30 | $50+ |
| **Total** | **$0** | **$15-17** | **$42-102** | **$212+** |

*Phase 0 uses public STUN only (70% connectivity)

## Database Schema

### Collections

```
users/
  {userId}
    - email: string
    - displayName: string
    - avatar: string
    - role: "user" | "admin"
    - createdAt: timestamp
    - preferences: object

deals/
  {gameId}
    - title: string
    - price: number
    - originalPrice: number
    - discount: number (%)
    - url: string
    - timestamp: timestamp
    - updatedAt: timestamp

affiliate_clicks/
  {automaticId}
    - userId: string
    - gameId: string
    - gameTitle: string
    - url: string
    - timestamp: timestamp
    - ipAddress: string

revenue/
  {automaticId}
    - userId: string
    - source: "gg_deals" | "admob" | "stripe" | "debrid"
    - amount: number
    - gameId: string (optional)
    - timestamp: timestamp
    - status: "pending" | "confirmed" | "paid"

revenue_summary/
  {date}
    - totalRevenue: number
    - date: string (YYYY-MM-DD)
    - period: string
    - timestamp: timestamp

bot_logs/
  {automaticId}
    - botName: string
    - action: string
    - status: "success" | "failure" | "warning"
    - message: string
    - timestamp: timestamp
    - duration: number (ms)
```

---

**This architecture supports your "god mode" mandate:**
- ✅ All components visible in real-time
- ✅ Autonomous revenue generation
- ✅ Seamless scaling from $0 → $∞
- ✅ Multiple income streams flowing to one dashboard
