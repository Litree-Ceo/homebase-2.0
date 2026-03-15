# System Overlord - Bot Framework
## Autonomous Agents for Revenue Generation

---

## 📋 Included Bots

1. **GG.deals Price Monitor** - Track game price drops, send alerts, generate affiliate clicks
2. **Real-Debrid Unlocker** - Automated link unlocking with notifications
3. **OSINT Aggregator** - Threat intelligence from feeds
4. **Revenue Reporter** - Real-time dashboard updates

---

## 🚀 Setup (Termux/Android)

```bash
# Install dependencies
pkg install python3 pip

# In bot directory
pip install -r requirements.txt

# Set Firebase credentials
export FIREBASE_CREDENTIALS="path/to/serviceAccount.json"

# Run all bots
python3 main.py
```

---

## 🔧 Environment Configuration

Create `.env` file:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
GG_DEALS_AFFILIATE_ID=your-gg-deals-id
REAL_DEBRID_API_KEY=your-api-key
DISCORD_WEBHOOK=your-webhook-url
NOTIFICATION_INTERVAL=300  # Check every 5 minutes
```

---

## 💰 Revenue Tracking

All bots automatically log revenue events to Firestore:

```javascript
{
  userId: "bot-system",
  source: "gg_deals", // or "admob", "stripe", etc
  amount: 2.50,
  gameId: "12345",
  gameTitle: "Cyberpunk 2077",
  timestamp: "2024-03-01T12:00:00Z"
}
```

Aggregated in real-time dashboard.

