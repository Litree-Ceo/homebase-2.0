# Phase 0 Deployment Guide

## Prerequisites Checklist

Before you start, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.9+ installed (`python3 --version`)
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] GitHub account active
- [ ] Firebase project created at console.firebase.google.com
- [ ] GG.deals API access (free registration at gg.deals)
- [ ] Stripe account for subscriptions (optional, Phase 1)

---

## Step-by-Step Deployment

### 0. Clone & Initialize

```bash
cd ~/Desktop/System-Overlord-Phase0

# Initialize Firebase project (interactive)
firebase init hosting functions firestore

# Select your Firebase project
# Choose your options when prompted
```

### 1. Deploy Web App

```bash
cd web

# Install dependencies
npm install

# Build Next.js
npm run build

# Deploy to Firebase Hosting
cd ..
firebase deploy --only hosting
```

**Your site is now live at:** `https://your-project.web.app`

### 2. Deploy Cloud Functions

```bash
cd functions

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Deploy all functions
firebase deploy --only functions
```

**Functions available at:** `https://region-your-project.cloudfunctions.net`

Check function logs:
```bash
firebase functions:log
```

### 3. Enable Monetization

#### AdMob Setup
1. Go to Google AdMob console
2. Create a new app
3. Add banner, interstitial, and rewarded ad units
4. Copy ad unit IDs to your `.env`

#### Stripe Setup
1. Create Stripe account
2. Get API keys
3. Set up webhook for subscription events

### 4. GG.deals Affiliate Registration

1. Visit https://www.gg.deals/
2. Create account
3. Register as affiliate
4. Get your affiliate ID
5. Add to environment: `GG_DEALS_AFFILIATE_ID=your_id`

### 5. Start Termux Bots

On Android/Termux:

```bash
cd ~/System-Overlord-Phase0/bots

# Install Python dependencies
pip install -r requirements.txt

# Copy Firebase credentials (if using service account)
cp ~/firebase-key.json .

# Set environment variables
export FIREBASE_PROJECT_ID="your-project-id"
export GG_DEALS_AFFILIATE_ID="your-id"

# Start all bots
python3 main.py

# Or run individual bots
python3 gg_deals_monitor.py
```

---

## 🎯 Verification Checklist

After deployment, verify everything works:

- [ ] Web app loads at `https://your-project.web.app`
- [ ] Firebase console shows Firestore data
- [ ] Cloud Functions show in Firebase console with no errors
- [ ] GG.deals deals load on homepage
- [ ] WebRTC signaling function responds: `curl https://region-your-project.cloudfunctions.net/webrtcSignal`
- [ ] Bot logs appear in Firestore `deals` collection
- [ ] Revenue tracking appears in `revenue` collection

### Test Direct Links

```bash
# Test WebRTC signaling
curl -X POST https://region-project.cloudfunctions.net/webrtcSignal \
  -H "Content-Type: application/json" \
  -d '{"callerId":"test","calleeId":"test2"}'

# Check bot logs
firebase firestore:read deals
```

---

## 📊 Real-Time Monitoring

### Firebase Console Dashboard

1. Go to Firebase Console
2. Select your project
3. Watch Firestore in real-time:
   - `deals` - Active game deals
   - `affiliate_clicks` - User clicks
   - `revenue` - All revenue events
   - `revenue_summary` - Daily totals

### Local Development

Run with emulators:

```bash
firebase emulators:start
```

This gives you a local Firebase environment for testing before production deployment.

---

## 🔐 Security Configuration

### Enable Security Rules

Update `firestore.rules` with your Firestore rules, then deploy:

```bash
firebase deploy --only firestore:rules
```

### Set Environment Variables

Create `.env.local` in web directory:

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

---

## 📈 First 24 Hours Checklist

- [ ] **Hour 1:** Confirm web app is live
- [ ] **Hour 2:** Get first GG.deals affiliate click
- [ ] **Hour 4:** First bot execution logged
- [ ] **Hour 8:** Check Cloud Functions logs for errors
- [ ] **Hour 12:** Verify AdMob impressions
- [ ] **Hour 24:** Calculate daily revenue

---

## 🆘 Troubleshooting

**Firebase Auth Error?**
```bash
firebase login
firebase init
```

**Cloud Functions not deploying?**
```bash
# Check Node version
node --version  # Should be 18+

# Clear and redeploy
rm -rf functions/lib
firebase deploy --only functions --debug
```

**Bots not connecting to Firebase?**
```bash
# Verify credentials
python3 -c "import firebase_admin; print('✓ Firebase OK')"

# Check environment variables
echo $FIREBASE_PROJECT_ID
```

**GG.deals API returning 403?**
- Verify affiliate ID is correct
- Check rate limits (usually 100 req/min)
- Add user-agent header to requests

---

## 📈 Next Phase Preparation

Once Phase 0 is stable:
- Monitor daily revenue
- Optimize GG.deals placement
- Add more bots
- Launch WebRTC features
- Implement premium tiers

**Status: Ready for go-live** 🚀
