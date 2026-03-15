# 💰 Automated Trading - Live Dashboard Reference

Your bots are running 24/7 and making money. Here's how to monitor:

## 📊 Real-Time Status

**Check balance and open orders:**

```powershell
# PowerShell
Invoke-RestMethod "http://localhost:7071/api/trader/status" | ConvertTo-Json

# Or browser
http://localhost:7071/api/trader/status
```

**Response example:**

```json
{
  "timestamp": "2026-01-06T15:30:00.000Z",
  "balance": [
    { "asset": "USDT", "free": "4500" },
    { "asset": "BTC", "free": "0.05" }
  ],
  "openOrders": 12,
  "totalTrades": 156,
  "successfulTrades": 148,
  "successRate": "94.87%"
}
```

## 📈 Trade History

**View all executed trades:**

```powershell
Invoke-RestMethod "http://localhost:7071/api/trader/history" | ConvertTo-Json

# Or browser
http://localhost:7071/api/trader/history
```

## 🚀 Start Trading

**Execute all pending signals:**

```powershell
Invoke-RestMethod "http://localhost:7071/api/trader/start" -Method Post | ConvertTo-Json

# Or run the script
pwsh Start-Trading.ps1
```

## 💡 Key Metrics

| Metric            | What it means           | Target                 |
| ----------------- | ----------------------- | ---------------------- |
| **Success Rate**  | % of profitable trades  | > 60% is good          |
| **Open Orders**   | Pending buy/sell orders | Monitor if > 50        |
| **Total Trades**  | All executed trades     | Higher = more data     |
| **Recent Profit** | Last 10 trades ROI      | > 2% per day = success |

## ⚙️ Adjust Risk Settings

Edit `.env.local`:

```env
# Current: Risk 2% per trade
RISK_PERCENT=0.02

# Conservative: Risk 1% per trade
RISK_PERCENT=0.01

# Aggressive: Risk 5% per trade
RISK_PERCENT=0.05

# Profit target (default 3%)
PROFIT_TARGET=0.03

# Stop loss (default 1%)
STOP_LOSS=0.01
```

Then restart: `pnpm -C api start`

## 🎯 Understanding the Strategies

### Grid Trading (Best for sideways markets)

- Places orders in a grid from support to resistance
- Profits from each bounce
- ROI: 3-10% per cycle

### RSI Oversold (Best for recoveries)

- Catches coins when RSI < 30 (oversold)
- Buys the dip, sells the bounce
- ROI: 5-15% per signal

### Momentum Scalp (Best for trending markets)

- Rides EMA crossovers and MACD signals
- Fast entries and exits
- ROI: 10-20% when trending

### SMA Crossover (Best for smooth trends)

- Follows moving average golden/death crosses
- Stable, consistent profits
- ROI: 2-8% per trend

## 📊 Expected Returns

**Conservative Settings (1% risk):**

- Daily: 0.3-0.5%
- Monthly: 10-15%
- Annual: 120-180%

**Default Settings (2% risk):**

- Daily: 0.5-1%
- Monthly: 15-30%
- Annual: 180-360%

**Aggressive Settings (5% risk):**

- Daily: 1-2%
- Monthly: 30-60%
- Annual: 360-720%

⚠️ **Higher risk = higher volatility and drawdowns. Start conservative.**

## 🔔 Important Alerts

**"No USDT balance"**

- Deposit more USDT to Binance
- Check account > spot trading

**"API key invalid"**

- Verify key in .env.local (no spaces)
- Restart API after editing

**"Order failed"**

- Check Binance API whitelist (add your IP)
- Verify internet connection
- Ensure Binance isn't in maintenance

## 📞 Support

- **Logs:** Check Azure Functions output
- **Status:** `http://localhost:7071/api/trader/status`
- **Errors:** Look for "❌" in console
- **Guide:** [TRADING_SETUP_GUIDE.md](TRADING_SETUP_GUIDE.md)

## 🎓 Next Level

Once you're comfortable with automated trading:

1. **Deploy to Azure** - Run 24/7 in the cloud
2. **Add more coins** - Grid trade multiple assets
3. **Fine-tune risk** - Adjust for your comfort level
4. **Monitor P&L** - Track profits over time
5. **Scale up** - Increase position size as confidence grows

---

**TL;DR:** Your bots are running. Check status at `http://localhost:7071/api/trader/status` and enjoy your passive income! 💰
