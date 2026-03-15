# 💰 BINANCE REAL TRADING SETUP

## ⚠️ IMPORTANT: Start Small

**Minimum to deploy bots:** $500 USDT  
**Recommended for safety:** $1000 USDT  
**Test first:** Use Binance Testnet (paper trading)

---

## Step 1: Get Binance API Keys

### 1a. Log into Binance

```
https://www.binance.com/login
```

### 1b. Go to Account Settings

- Click **Profile Icon** (top right)
- Select **Account** or **Wallet Settings**
- Find **API Management** or **Security**

### 1c. Create API Key

- Click **Create API Key** or **Generate API Key**
- Choose: **Spot Trading** (for crypto trading bots)
- Enter label: `HomeBase-Bots-Trading`
- **SAVE** API Key and Secret (you won't see them again)

### 1d. Enable Restrictions

⚠️ **Critical for security:**

```
✅ Spot Trading: ENABLED
✅ IP Whitelist: ADD YOUR IP
  (Optional: helps prevent unauthorized access)
✅ Enable Two-Factor Authentication
❌ Margin Trading: DISABLED (unless you want leverage)
❌ Withdrawals: DISABLED (bots shouldn't withdraw)
❌ Account Transfer: DISABLED
```

---

## Step 2: Fund Your Spot Wallet

### 2a. Get USDT Address

```
Wallet > Spot Wallet > Transfer > Receive > USDT
(Copy deposit address)
```

### 2b. Deposit USDT ($500+ minimum)

**Option 1: From Bank (Fiat)**

```
Wallet > Fiat > Deposit
→ Select your country
→ Choose payment method
→ Enter amount ($500+)
→ Follow bank transfer instructions
```

**Option 2: From Another Crypto Exchange**

```
Wallet > Deposit Crypto
→ Select USDT (Network: Polygon/Arbitrum/BSC for low fees)
→ Copy address from Step 2a
→ Send from other exchange
```

**Option 3: Existing Crypto**

```
Wallet > Convert
→ Sell Bitcoin/Ethereum for USDT
→ USDT appears in Spot Wallet
```

---

## Step 3: Add Keys to HomeBase

### Create `.env.local` in root:

```bash
# Binance Real Trading
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
BINANCE_TESTNET=false  # Set to FALSE for REAL trading

# Azure Services (existing)
COSMOS_ENDPOINT=https://your.documents.azure.com:443/
COSMOS_KEY=your_key_here
NEXT_PUBLIC_API_URL=http://localhost:7071

# Meta OAuth (existing)
NEXT_PUBLIC_META_APP_ID=1989409728353652
META_APP_SECRET=your_secret_here
```

### ⚠️ NEVER commit `.env.local`

```bash
# Already in .gitignore:
.env.local          ✅
.env.*.local        ✅
```

---

## Step 4: Test Trading (Paper Mode First)

### 4a. Switch to Testnet

In `api/src/bots/config.ts`:

```typescript
export const BINANCE_CONFIG = {
  apiKey: process.env.BINANCE_API_KEY!,
  apiSecret: process.env.BINANCE_API_SECRET!,
  testnet: true, // ← Change to FALSE for real trading
  sandbox: true,
};
```

### 4b. Run Bot on Testnet

```bash
pnpm -C api start
# See trades in console (fake USDT, real logic)
```

### 4c. Verify Profits

```bash
curl http://localhost:7071/api/trader/history
# Should show test trades and hypothetical P&L
```

---

## Step 5: Go Live (Real Trading)

### 5a. Switch to Live Mode

```typescript
export const BINANCE_CONFIG = {
  testnet: false, // ← NOW LIVE
  sandbox: false,
};
```

### 5b. Start with Small Amount

- First week: trade $100 (not full $500)
- Monitor 24/7 (set alerts)
- If profitable after 1 week → scale to full balance

### 5c. Deploy to Azure

```bash
git add .
git commit -m "chore: enable real Binance trading"
git push origin main
# GitHub Actions → Deploy to Azure Container Apps
```

---

## Monitoring Real Trades

### View Live Trades

```bash
# Check bot status
curl http://homebase-api.azurewebsites.net/api/trader/status

# Get profit/loss
curl http://homebase-api.azurewebsites.net/api/trader/history?limit=20
```

### Binance Dashboard

```
https://www.binance.com/trade/
→ See all your open orders
→ Check 24h profit
```

### Set Stop-Loss (Safety)

In bot config:

```typescript
{
  strategy: "grid-trading",
  stopLossPercent: 5,      // Sell if down 5%
  takeProfitPercent: 10,   // Sell if up 10%
}
```

---

## ❌ Common Mistakes (AVOID!)

| Mistake                    | Impact                      | Fix                    |
| -------------------------- | --------------------------- | ---------------------- |
| Testnet API on live wallet | No trades execute           | Check testnet flag     |
| IP whitelist wrong IP      | API calls blocked           | Update IP in Binance   |
| Missing 2FA                | Account compromised         | Enable 2FA NOW         |
| Withdrawals enabled        | Bots steal your money       | Disable in Binance API |
| $100 initial funding       | Too small, fees eat profits | Fund $500+             |
| Trading shitcoins          | 99% lose                    | Stick to BTC/ETH/USDT  |

---

## Quick Reference

| Action              | Command                                                                   |
| ------------------- | ------------------------------------------------------------------------- |
| Test API connection | `curl https://api.binance.com/api/v3/ping`                                |
| Check balance       | `curl https://api.binance.com/api/v3/account -H "X-MBX-APIKEY: YOUR_KEY"` |
| View open orders    | Binance.com → Trade                                                       |
| Emergency stop      | `killall node` (stops all bots)                                           |

---

## Support

**🔗 Links:**

- Binance API Docs: https://binance-docs.github.io/apidocs/
- Binance Testnet: https://testnet.binance.vision/
- HomeBase Bots: See `QUICK_START_BOTS_30MIN.md`

**🐛 Troubleshooting:**

- Bot not trading? Check API key format
- Profit negative? Market down, reduce grid size
- Can't withdraw? Withdrawals disabled (by design)
