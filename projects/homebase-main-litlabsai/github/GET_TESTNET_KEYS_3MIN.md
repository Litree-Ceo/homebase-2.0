# 🚀 GET TESTNET KEYS IN 3 MINUTES

## Step 1️⃣: Open Binance Testnet

```bash
https://testnet.binance.vision/
```bash

### You'll see a page that looks like Binance but says "Binance Testnet"

---

## Step 2️⃣: Sign Up (or Login)

### If you don't have a testnet account:

- Click **"Sign up"** (top right)
- Email: Use any email (or your real Binance email)
- Password: Create one
- Verify email
- ✅ You now have a testnet account with unlimited fake USDT!

### If you already have Binance account:

- Click **"Login"**
- Use your real Binance credentials
- ✅ You're logged into testnet

---

## Step 3️⃣: Create API Key

Once logged in, follow these exact steps:

1. **Click your Profile Icon** (top right corner)

2. **Select "Account"** or click gear icon ⚙️

3. **Look for "API Management"** or **"API Keys"**

4. **Click "Create API Key"**

5. **Give it a name:**
```bash
   HomeBase-Testnet-Trading
```bash

6. **Click "Create"**

7. **You'll see two things:**
```bash
   API Key:    vmjq1234567890abcdefghijk...
   Secret Key: abcdef1234567890qwertyuiopasdfgh...
```bash

8. **⚠️ COPY BOTH - You won't see them again!**

---

## Step 4️⃣: Paste Keys into .env.local

**File:** `e:\VSCode\HomeBase 2.0\.env.local`

Find these lines:
```bash
BINANCE_API_KEY=your_testnet_api_key_here
BINANCE_API_SECRET=your_testnet_api_secret_here
```bash

Replace with your actual keys:
```bash
BINANCE_API_KEY=vmjq1234567890abcdefghijk...
BINANCE_API_SECRET=abcdef1234567890qwertyuiopasdfgh...
```bash

**Make sure:** `BINANCE_TESTNET=true` (it should already be true)

---

## ✅ Verify Keys Work

Open terminal:

```bash
cd 'e:\VSCode\HomeBase 2.0'
pnpm -C api test:binance
```bash

**You should see:**
```bash
✅ Testnet API connection successful!
✅ Account balance: 10000.00 USDT (fake)
✅ Ready to trade!
```bash

If errors:

- Check API key format (no spaces)
- Verify BINANCE_TESTNET=true
- Make sure you used testnet.binance.vision (not real Binance)

---

## 🎯 Next: Start Trading

Once verified, run:

```bash
pnpm -C api start
```bash

**You'll see:**
```bash
[BotEngine] Initialized with testnet
[BotEngine] Registered: Grid Trading Bot
[BotEngine] Registered: RSI Strategy Bot
[Signal] BUY: BTC/USDT at $45,320
[Signal] SELL: BTC/USDT at $46,320 (+$1,000 profit!)
```bash

**Trades execute automatically with fake USDT** ✅

---

## 💡 Remember

- ✅ This is **TESTNET** (fake money)
- ✅ You have **unlimited USDT** to trade
- ✅ **ZERO risk** - no real money involved
- ✅ Real trading logic - see how strategies work
- ❌ DO NOT use your real Binance keys here

---

## 🆘 Stuck?

| Problem                   | Solution                                                 |
| ------------------------- | -------------------------------------------------------- |
| Can't find API Management | Click profile → Account → Security → API Management      |
| Testnet won't load        | Clear browser cache, try incognito mode                  |
| Keys don't work           | Verify no extra spaces, copy from testnet.binance.vision |
| Still getting errors      | Check logs: `pnpm -C api start` should show exact error  |

---

## ✨ Once Keys Are Working

→ Go to [TESTNET_QUICK_START.md](./TESTNET_QUICK_START.md)

→ See how to monitor your trades

→ Start your 1-2 week test period!


