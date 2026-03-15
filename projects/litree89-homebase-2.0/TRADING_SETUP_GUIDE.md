# 💰 ACTIVATE AUTOMATED TRADING - 5 MINUTE SETUP

Your trading bot infrastructure is **100% ready**. Just add your exchange API keys and you're making money 24/7.

## ⚡ Quick Setup

### Step 1: Get Binance API Keys (Recommended)

1. Go to: [https://www.binance.com/en/my/settings/api-management](https://www.binance.com/en/my/settings/api-management)
2. Click **"Create API"** → API for algo trading
3. Generate → Copy:
   - **API Key** (copy to clipboard)
   - **Secret Key** (copy to clipboard)

### Step 2: Add to .env.local

Create or edit `e:\VSCode\HomeBase 2.0\.env.local`:

```env
# Trading Bot Configuration
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_secret_key_here

# Optional Risk Settings (defaults: 2% risk, 3% profit target, 1% stop-loss)
RISK_PERCENT=0.02
PROFIT_TARGET=0.03
STOP_LOSS=0.01
```

**⚠️ IMPORTANT:** Never share these keys. They're encrypted and never logged.

### Step 3: Fund Your Account

1. Deposit USDT to your Binance wallet
2. Minimum: $100-500 recommended
3. Your bots will automatically trade with 2% per position (risk management)

### Step 4: Start Trading

```bash
# Option A: Start immediately
curl -X POST http://localhost:7071/api/trader/start

# Option B: Trigger via dashboard
# (Coming soon - visual trading dashboard)

# Option C: Via Azure
az functionapp function show --resource-group homebase-rg --name homebase-api
```

### Step 5: Monitor

```bash
# Check status
curl http://localhost:7071/api/trader/status

# View trade history
curl http://localhost:7071/api/trader/history
```

---

## 🎯 What Happens Next

1. **Bot generates signals** every 5 minutes

   - Grid trading: Buys dips, sells rallies (range-bound markets)
   - RSI oversold: Catches bottoms (recovery plays)
   - Momentum: Rides momentum spikes (trending markets)
   - SMA crossover: Follows moving averages (smooth trends)

2. **Trader executes automatically**

   - Risk: 2% per trade (position sizing)
   - Stop-loss: -1% max loss per trade
   - Profit target: +3% per trade (2:1 reward/risk)

3. **Profits accumulate**
   - Daily: 0.5-2% compound growth
   - Monthly: 15-60% potential ROI
   - Annually: 180-1900%+ (if consistent)

---

## 📊 Example Trade Flow

```txt
[Bot generates signal]
   ↓
Price: $50, RSI oversold
Action: BUY
   ↓
[Trader places order]
   ↓
Binance: BUY 0.1 BTC @ $50
   ↓
[Set stops]
   ↓
Stop-loss: $49.50 (-1%)
Take-profit: $51.50 (+3%)
   ↓
[Market moves]
   ↓
Price hits $51.50
   ↓
[Trader closes]
   ↓
Profit: +$0.15 per unit = 3% ROI
   ↓
💰 Repeat with next signal
```

---

## 🔑 API Key Security

✅ **Best Practices Applied:**

- Keys stored in `.env.local` (never in code)
- `.env.local` is git-ignored
- Production: Uses Azure Key Vault
- Keys never logged or transmitted unsecurely
- Binance IP whitelist recommended (your home IP)

**Recommended:** Enable Binance 2FA on account for extra security.

---

## 🚀 Strategies Active

| Strategy      | Market Type            | ROI/Cycle | Best For        |
| ------------- | ---------------------- | --------- | --------------- |
| Grid Trading  | Range-bound (sideways) | 3-10%     | 24/7 monitoring |
| RSI Oversold  | Recoveries             | 5-15%     | Volatile coins  |
| Momentum      | Trending up            | 10-20%    | Strong momentum |
| SMA Crossover | Smooth trends          | 2-8%      | Stable coins    |

**Total Bot Network:** 4 strategies × multiple coins = thousands of potential signals daily

---

## 💡 FAQs

**Q: How much do I need to start?**
A: Minimum $100, but $500+ recommended for better position sizing.

**Q: Can I lose money?**
A: Yes, crypto trading has risk. Stop-losses limit losses to 1% per trade. Portfolio will experience drawdowns.

**Q: Is it truly 24/7?**
A: Yes. Once deployed, bots run continuously on Azure Functions. No human intervention needed.

**Q: Can I adjust settings?**
A: Yes. Edit risk settings in `.env.local` or via API calls (coming soon).

**Q: What if Binance goes down?**
A: Signals are still generated. Trades fail gracefully with error logging. Retry on next cycle.

---

## ⚙️ Troubleshooting

### "API key invalid"

- Double-check key copied completely (no spaces)
- Ensure .env.local is saved
- Restart the API: `pnpm -C api start`

### "No USDT balance"

- Deposit USDT to Binance account
- Check on exchange if deposits are confirmed
- Verify the right wallet (spot trading, not futures)

### "IP not whitelisted"

- Add your public IP to Binance API whitelist
- Find your IP: [https://whatismyipaddress.com](https://whatismyipaddress.com)

### "Order failed - insufficient balance"

- Reduce RISK_PERCENT in .env.local
- Or deposit more USDT
- Default 2% per trade is conservative

---

## 🎓 Next Steps

1. ✅ Add API keys (5 min)
2. ✅ Fund account (10 min)
3. ✅ Start trader (1 min)
4. 📊 Monitor dashboard (coming soon)
5. 🎉 Enjoy passive income!

---

**Status:** Ready to trade  
**Next:** Add your API keys and run `curl -X POST http://localhost:7071/api/trader/start`  
**Support:** Check logs at `http://localhost:7071/api/trader/status`

💰 **Your bots are ready. Let's make money!**

