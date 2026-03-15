# LitLabs AI - Installation Guide for AI Agents

This guide is specifically designed for AI agents like Cline, Claude, or other LLM-based assistants to autonomously set up and configure LitLabs AI.

## 🎯 Project Overview

**LitLabs AI** is a comprehensive AI-powered platform for content creators, combining:
- AI content generation (text, images, music, video)
- Multi-platform bot creation (WhatsApp, Discord, Telegram)
- Subscription & payment management (Stripe integration)
- Template library & content management
- Real-time analytics & monitoring
- Web3/crypto wallet integration
- Enterprise-grade security (Guardian Bot, rate limiting)

**Tech Stack:**
- Next.js 16.0.7 (App Router) + React 19.2.1 + TypeScript 5.9.3
- Firebase (Firestore, Auth, Storage, Functions)
- Stripe for payments
- Google AI (Gemini) + OpenAI (GPT)
- Tailwind CSS 4.1.17
- Vercel deployment

---

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js 18+** and npm installed
- **Git** for version control
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Vercel CLI** (`npm install -g vercel`) - optional for deployment

---

## 🚀 Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/LiTree89/LitreeLabsFirebase.git
cd LitreeLabsFirebase
```

### 2. Install Dependencies

```bash
npm install
```

**Note:** This installs ~740 packages. Takes approximately 2-3 minutes.

### 3. Environment Configuration

Create `.env.local` file in the root directory:

```bash
# Copy the example file
cp .env.example .env.local
```

**Required Environment Variables:**

#### Firebase Configuration (REQUIRED)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Firebase Admin SDK (REQUIRED for server-side)
```env
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
```

#### AI Services (REQUIRED)
```env
# Google AI (Gemini) - Primary AI provider
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_key
GOOGLE_GEMINI_API_KEY=your_google_ai_key

# OpenAI (Optional - for transcription and GPT models)
OPENAI_API_KEY=sk-your_openai_key
```

#### Stripe Payment Integration (REQUIRED)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs for each tier
STRIPE_PRICE_ID_FREE=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_STARTER=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_CREATOR=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_AGENCY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ID_EDUCATION=price_xxxxxxxxxxxxx
```

#### Application Configuration
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

#### Optional Services
```env
# Sentry (Error Monitoring)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_token

# PayPal (Alternative Payment)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret

# reCAPTCHA (Bot Protection)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key

# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

---

### 4. Firebase Setup

#### Initialize Firebase Project
```bash
firebase login
firebase init
```

Select the following features:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting
- ✅ Storage
- ✅ Emulators (optional for local dev)

#### Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

#### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

---

### 5. Stripe Configuration

#### Create Stripe Products & Prices
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create 6 products: Free, Starter, Creator, Pro, Agency, Education
3. Set up recurring pricing for each tier
4. Copy each Price ID to your `.env.local`

#### Set up Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.*`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

### 6. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

**Expected startup:**
- Compilation: ~3-5 seconds
- Server ready: http://localhost:3000
- TypeScript checks: Automatically validated

---

## 🔒 Security Configuration

### Rate Limiting
The project uses token bucket rate limiting:
- **Demo users:** 20 requests per 60 seconds
- **Authenticated users:** Based on tier limits
- **Location:** `lib/rateLimiter.ts`

### Guardian Bot (AI Security)
Monitors for suspicious behavior:
- Rapid API usage spikes
- Unusual activity patterns
- Fraud detection
- **Location:** `lib/guardian-bot.ts`

### Environment Security Checklist
- ✅ Never commit `.env.local` to Git
- ✅ Use `.env.example` as a template
- ✅ Rotate API keys regularly
- ✅ Enable 2FA on Firebase and Stripe accounts
- ✅ Use test mode keys for development

---

## 📦 Project Structure & Key Files

```
LitreeLabsFirebase/
├── app/
│   ├── api/                    # 37 API endpoints
│   │   ├── ai/                 # AI content generation
│   │   ├── webhooks/stripe/    # Stripe payment webhooks
│   │   ├── transcribe/         # Voice transcription
│   │   └── ...                 # Other endpoints
│   ├── dashboard/              # 20+ dashboard modules
│   │   ├── mediahub/           # Media library
│   │   ├── web3/               # Crypto wallet
│   │   ├── marketplace/        # Product marketplace
│   │   └── ...                 # Other modules
│   └── auth/                   # Authentication pages
├── lib/
│   ├── firebase.ts             # Firebase client
│   ├── firebase-admin.ts       # Firebase admin SDK
│   ├── firebase-server.ts      # Server-side utilities
│   ├── stripe.ts               # Stripe integration
│   ├── ai.ts                   # AI generation
│   ├── guardian-bot.ts         # Security monitoring
│   ├── rateLimiter.ts          # Rate limiting
│   ├── tier-limits.ts          # Subscription limits
│   └── usage-tracker.ts        # Usage analytics
├── components/
│   ├── ui/                     # Reusable UI components
│   └── dashboard/              # Dashboard components
├── types/                      # TypeScript definitions
├── public/                     # Static assets
├── .env.local                  # Environment variables (create this)
├── .env.example                # Environment template
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## 🧪 Testing & Validation

### 1. Check Build
```bash
npm run build
```
Should complete without errors.

### 2. Lint Code
```bash
npm run lint
```
Should show 0 errors (warnings are acceptable).

### 3. Type Check
```bash
npm run typecheck
```
Should pass with no type errors.

### 4. Test Key Features
After running `npm run dev`, test:
- ✅ Homepage loads at http://localhost:3000
- ✅ Authentication flow (/auth/signin)
- ✅ Dashboard access (/dashboard)
- ✅ AI generation (/dashboard/ai)
- ✅ Stripe checkout flow (/billing)

---

## 🚢 Deployment

### Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy
```bash
# Production deployment
vercel --prod

# Preview deployment
vercel
```

#### 4. Set Environment Variables in Vercel
Go to Vercel Dashboard → Project Settings → Environment Variables
Add all variables from `.env.local`

### Important Deployment Notes
- ✅ Build time: ~2-3 minutes
- ✅ Set `NEXT_PUBLIC_BASE_URL` to your production domain
- ✅ Update Stripe webhook URL to production domain
- ✅ Update Firebase authorized domains
- ✅ Enable CORS in Firebase if needed

---

## 🐛 Common Issues & Solutions

### Issue: "Missing OPENAI_API_KEY"
**Solution:** The OpenAI client must be instantiated inside the function, not at module level. Check `app/api/transcribe/route.ts` - client should be created after env var check.

### Issue: "Firebase Admin not initialized"
**Solution:** Ensure `FIREBASE_ADMIN_PRIVATE_KEY` is properly formatted with `\n` for newlines.

### Issue: "Stripe webhook signature invalid"
**Solution:** 
1. Check `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint
2. Ensure raw body is passed to Stripe (configured in `app/api/webhooks/stripe/route.ts`)

### Issue: "Rate limit exceeded"
**Solution:** Rate limiting is working correctly. Wait 60 seconds or authenticate to get higher limits.

### Issue: "Build fails on Vercel"
**Solution:**
1. Check all required env vars are set in Vercel
2. Ensure `typescript.ignoreBuildErrors: true` in `next.config.ts` (already configured)
3. Review build logs for specific errors

---

## 📚 Additional Resources

### Documentation Files
- `README.md` - General overview
- `LITLABS_OS_COMPLETE_GUIDE.md` - Comprehensive feature guide
- `LITLABS_OS_QUICK_START.md` - Quick start guide
- `ENVIRONMENT_SETUP.md` - Environment configuration details
- `STRIPE_SETUP_GUIDE.md` - Stripe integration guide
- `MICROSOFT_365_SETUP.md` - M365 integration (optional)
- `SECURITY.md` - Security policies
- `CONTRIBUTING.md` - Contribution guidelines

### Key Integrations
- **Firebase:** https://firebase.google.com/docs
- **Stripe:** https://stripe.com/docs
- **Google AI:** https://ai.google.dev/docs
- **Next.js:** https://nextjs.org/docs
- **Vercel:** https://vercel.com/docs

---

## 🎯 Next Steps After Installation

1. **Configure Subscription Tiers:** Update tier limits in `lib/tier-limits.ts`
2. **Customize Branding:** Update logo, colors in `app/globals.css`
3. **Set Up Analytics:** Configure Vercel Analytics or custom tracking
4. **Enable Features:** Activate optional modules (Web3, WhatsApp, etc.)
5. **Production Checklist:** Review `PRODUCTION_DEPLOYMENT_GUIDE.md`

---

## 🤝 Getting Help

- **Issues:** https://github.com/LiTree89/LitreeLabsFirebase/issues
- **Discussions:** https://github.com/LiTree89/LitreeLabsFirebase/discussions
- **Documentation:** Check the `/docs` folder in the repository

---

## 🔐 Security Notes for AI Agents

**CRITICAL:** When working with this codebase:
- ✅ Never log or expose environment variables
- ✅ Always validate user input before processing
- ✅ Use rate limiting on all public endpoints
- ✅ Run Guardian Bot analysis on sensitive operations
- ✅ Follow auth patterns in `lib/auth-helper.ts`
- ✅ Check usage limits before performing paid operations

---

## ✅ Installation Checklist

- [ ] Node.js 18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with all required variables
- [ ] Firebase project configured
- [ ] Firestore rules and indexes deployed
- [ ] Stripe products and prices created
- [ ] Stripe webhook configured
- [ ] Development server runs successfully (`npm run dev`)
- [ ] Build completes without errors (`npm run build`)
- [ ] Key features tested (auth, dashboard, AI generation)
- [ ] Ready for deployment or development!

---

**Installation complete!** 🎉 You're ready to develop or deploy LitLabs AI.
