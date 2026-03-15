# 💰 API Keys Setup - What You Need

## Required Keys (2)

### 1. PADDLE_WEBHOOK_SECRET

**What it's for:** Payment processing webhooks (subscription billing, one-time purchases)

**How to get it:**

1. Sign up at [https://paddle.com](https://paddle.com)
2. Go to Developer Tools → Notifications
3. Create a webhook endpoint
4. Copy the webhook secret key
5. Paste it in `api/local.settings.json`:
   ```json
   "PADDLE_WEBHOOK_SECRET": "your-secret-here"
   ```

**Pricing:** Transaction fees apply (5% + $0.50 per sale)

**When you need it:** When you want to accept payments for your app

---

### 2. EXCHANGE_API_KEY (+ EXCHANGE_SECRET)

**What it's for:** Crypto trading bot - connects to exchanges like Binance/Coinbase

**How to get it:**

1. Choose an exchange (Binance, Coinbase Pro, Kraken, etc.)
2. Create account & complete KYC verification
3. Go to API Management → Create API Key
4. **Enable "Read" + "Trade" permissions** (NOT withdrawal!)
5. Save both the API Key and Secret:
   ```json
   "EXCHANGE_API_KEY": "your-api-key",
   "EXCHANGE_SECRET": "your-secret-key",
   "EXCHANGE_NAME": "binance",
   "EXCHANGE_SANDBOX": "true"
   ```

**Start with SANDBOX mode first!** (Test with fake money)

**When you need it:** When you want the crypto bot to actually trade

---

## Removed Keys

### ~~COINGECKO_API_KEY~~

**REMOVED** - Not needed anymore. The crypto price API works without it.

---

## Summary

**For money-making features:**

- **Payments:** Need Paddle account + webhook secret
- **Crypto Trading:** Need exchange account + API keys

**Both are optional** - the app runs without them, you just can't:

- Accept payments (without Paddle)
- Auto-trade crypto (without exchange API)

**Start making money:**

1. Set up Paddle for payments → collect subscription money 💵
2. Set up exchange API → automate crypto trading 📈

$$$ LET'S GET THIS BAG! $$$
