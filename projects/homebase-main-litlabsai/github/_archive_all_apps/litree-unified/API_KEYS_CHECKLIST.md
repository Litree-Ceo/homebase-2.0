# LiTree Unified - API Keys & Environment Variables Checklist

## 📋 Complete Setup Guide

All environment variables are stored in `.env.local` (git-ignored for security).

---

## ✅ FIREBASE (REQUIRED)

### Status: ✅ CONFIGURED

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDvRoWoEBdqdS85YJApVdKG5KcPOYzOg6k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-6082148059-d1fec.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-6082148059-d1fec
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-6082148059-d1fec.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=144415804580
NEXT_PUBLIC_FIREBASE_APP_ID=1:144415804580:web:7e6465f633e54e8e186a31
FIREBASE_ADMIN_SDK_KEY=
```

**Get from:** [Firebase Console](https://console.firebase.google.com)

**What it does:**
- Authentication (login/signup)
- Firestore database
- Cloud Storage
- Cloud Functions

---

## 🤖 AI SERVICES

### NVIDIA NIM (RECOMMENDED)

```env
NVIDIA_API_KEY=
```

**Status:** ⚠️ NEEDS KEY

**Get from:** [NVIDIA Build](https://build.nvidia.com)

**What it does:**
- GLM-4 (smart AI)
- Llama 3 70B (fast AI)
- SDXL (image generation)

**Setup:**
1. Go to https://build.nvidia.com
2. Sign up/login
3. Create API key
4. Copy and paste into `.env.local`

---

### Google Generative AI (FALLBACK)

```env
NEXT_PUBLIC_GOOGLE_AI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
```

**Status:** ⚠️ NEEDS KEY

**Get from:** [Google AI Studio](https://aistudio.google.com/app/apikey)

**What it does:**
- Fallback when NVIDIA is unavailable
- Gemini models for text generation

**Setup:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into `.env.local`

---

### OpenAI (OPTIONAL)

```env
OPENAI_API_KEY=
```

**Status:** ⚠️ OPTIONAL

**Get from:** [OpenAI API Keys](https://platform.openai.com/api-keys)

**What it does:**
- GPT-4 integration
- Advanced text generation

---

## 💳 PAYMENTS

### Stripe (REQUIRED FOR PAYMENTS)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_
STRIPE_SECRET_KEY=sk_test_
STRIPE_WEBHOOK_SECRET=whsec_
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_GODMODE_PRICE_ID=
STRIPE_CACHEGRAM_PRICE_ID=
STRIPE_SOCIAL_BOOSTER_PRICE_ID=
STRIPE_MEDIA_PREMIUM_PRICE_ID=
STRIPE_WEB3_PACK_PRICE_ID=
STRIPE_MARKETPLACE_PLUS_PRICE_ID=
STRIPE_AI_UNLIMITED_PRICE_ID=
```

**Status:** ⚠️ NEEDS KEYS

**Get from:** [Stripe Dashboard](https://dashboard.stripe.com)

**What it does:**
- Subscription management
- Payment processing
- Billing

**Setup:**
1. Create Stripe account
2. Go to API Keys section
3. Copy Publishable and Secret keys
4. Create price IDs for each tier
5. Add webhook endpoint

---

### PayPal (OPTIONAL)

```env
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

**Status:** ⚠️ OPTIONAL

**Get from:** [PayPal Developer](https://developer.paypal.com)

---

### Coinbase (OPTIONAL)

```env
COINBASE_API_KEY=
```

**Status:** ⚠️ OPTIONAL

**Get from:** [Coinbase Commerce](https://commerce.coinbase.com)

---

## 🔗 WEB3 & BLOCKCHAIN

### Ethereum RPC (OPTIONAL)

```env
ETHEREUM_RPC_URL=
PRIVATE_KEY=
NEXT_PUBLIC_INFURA_ID=
NEXT_PUBLIC_ALCHEMY_KEY=
```

**Status:** ⚠️ OPTIONAL

**Get from:**
- [Infura](https://infura.io)
- [Alchemy](https://www.alchemy.com)

**What it does:**
- NFT minting
- Wallet integration
- Smart contracts

---

## ☁️ AZURE (OPTIONAL)

```env
AZURE_COSMOS_ENDPOINT=
AZURE_COSMOS_KEY=
AZURE_STORAGE_CONNECTION_STRING=
```

**Status:** ⚠️ OPTIONAL

**Get from:** [Azure Portal](https://portal.azure.com)

---

## 📌 IPFS (OPTIONAL)

```env
PINATA_API_KEY=
PINATA_SECRET_KEY=
```

**Status:** ⚠️ OPTIONAL

**Get from:** [Pinata](https://www.pinata.cloud)

**What it does:**
- Decentralized file storage
- NFT metadata storage

---

## 🔒 SECURITY

### reCAPTCHA

```env
RECAPTCHA_SECRET_KEY=
```

**Status:** ⚠️ OPTIONAL

**Get from:** [Google reCAPTCHA](https://www.google.com/recaptcha/admin)

---

### Sentry (ERROR TRACKING)

```env
SENTRY_DSN=
```

**Status:** ⚠️ OPTIONAL

**Get from:** [Sentry](https://sentry.io)

**What it does:**
- Error tracking
- Performance monitoring

---

## 📧 EMAIL & COMMUNICATION

### SendGrid (OPTIONAL)

```env
SENDGRID_API_KEY=
```

**Status:** ⚠️ OPTIONAL

**Get from:** [SendGrid](https://sendgrid.com)

---

### Microsoft Graph (OPTIONAL)

```env
MICROSOFT_GRAPH_TOKEN=
```

**Status:** ⚠️ OPTIONAL

**Get from:** [Microsoft Azure](https://portal.azure.com)

---

## 🔐 VERSION CONTROL

### GitLab (OPTIONAL)

```env
GITLAB_PERSONAL_ACCESS_TOKEN=
```

**Status:** ⚠️ OPTIONAL

**Get from:** [GitLab Settings](https://gitlab.com/-/profile/personal_access_tokens)

**What it does:**
- GitLab CLI integration
- Repository management

---

## 🛠️ APP CONFIGURATION

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
LOG_LEVEL=info
```

**Status:** ✅ CONFIGURED

---

## 📊 PRIORITY SETUP ORDER

### Phase 1: ESSENTIAL (Required to run)
1. ✅ Firebase (already configured)
2. ⚠️ NVIDIA API Key OR Google AI Key

### Phase 2: PAYMENTS (For monetization)
3. ⚠️ Stripe keys and price IDs

### Phase 3: ADVANCED (Optional features)
4. ⚠️ Web3 keys
5. ⚠️ Azure keys
6. ⚠️ IPFS keys
7. ⚠️ Security keys

---

## 🚀 QUICK START

### Minimum Setup (to run locally)

```bash
# 1. Get NVIDIA API Key
# Go to https://build.nvidia.com and create key

# 2. Update .env.local
NVIDIA_API_KEY=your_key_here

# 3. Install dependencies
pnpm install

# 4. Run development server
pnpm dev

# 5. Open http://localhost:3000
```

---

## ✨ FULL SETUP (All features)

```bash
# 1. Firebase - Already configured ✅

# 2. AI Services
# - NVIDIA: https://build.nvidia.com
# - Google AI: https://aistudio.google.com/app/apikey

# 3. Payments
# - Stripe: https://dashboard.stripe.com

# 4. Web3 (Optional)
# - Infura: https://infura.io
# - Alchemy: https://www.alchemy.com

# 5. Update all keys in .env.local

# 6. Run
pnpm install
pnpm dev
```

---

## 🔍 VERIFICATION

### Check which services are configured:

```bash
# Run this to see what's missing
pnpm run check-env
```

### Test API connections:

```bash
# Test NVIDIA
pnpm run test-nvidia

# Test Firebase
pnpm run test-firebase

# Test Stripe
pnpm run test-stripe
```

---

## ⚠️ SECURITY NOTES

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use `NEXT_PUBLIC_` prefix only for client-side vars** - Others are server-only
3. **Rotate keys regularly** - Especially if exposed
4. **Use different keys for dev/prod** - Never use prod keys locally
5. **Keep backups** - Store keys securely

---

## 🆘 TROUBLESHOOTING

### "NVIDIA_API_KEY is not configured"
- Get key from https://build.nvidia.com
- Add to `.env.local`
- Restart dev server

### "Firebase not initialized"
- Check Firebase keys are correct
- Verify project ID matches
- Check firestore.rules are deployed

### "Stripe webhook failed"
- Verify webhook secret in `.env.local`
- Check webhook endpoint in Stripe dashboard
- Ensure secret matches exactly

### "Google AI fallback not working"
- Get key from https://aistudio.google.com/app/apikey
- Add both `NEXT_PUBLIC_GOOGLE_AI_API_KEY` and `GOOGLE_GENERATIVE_AI_API_KEY`
- Restart dev server

---

## 📞 SUPPORT

- **Firebase Issues:** [Firebase Docs](https://firebase.google.com/docs)
- **NVIDIA Issues:** [NVIDIA Build Docs](https://build.nvidia.com/docs)
- **Stripe Issues:** [Stripe Docs](https://stripe.com/docs)
- **Project Issues:** GitHub Issues

---

## 📝 CHECKLIST

- [ ] Firebase configured ✅
- [ ] NVIDIA API key added
- [ ] Google AI key added (fallback)
- [ ] Stripe keys added
- [ ] PayPal keys added (optional)
- [ ] Web3 keys added (optional)
- [ ] Azure keys added (optional)
- [ ] IPFS keys added (optional)
- [ ] Security keys added (optional)
- [ ] All keys tested
- [ ] `.env.local` backed up securely
- [ ] Ready for development

---

**Last Updated:** 2025-02-01  
**Status:** All critical services documented
