# LitLabs AI - Copilot System Prompt

**Use this prompt to help GitHub Copilot and other AI assistants understand your project.**

---

## 🎯 Project Overview

**LitLabs AI** is a comprehensive AI-powered platform designed for content creators, beauty professionals, and small businesses. The platform enables users to:

- Generate AI-powered content (posts, videos, scripts, images, music)
- Deploy content across multiple social media channels
- Build and manage custom bots (WhatsApp, Discord, Teams, Outlook)
- Analyze performance with real-time analytics
- Monetize content through a built-in marketplace
- Manage subscriptions with Stripe and PayPal payments
- Access professional templates and tools for content creation

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16.0.7, React 19.2.1, TypeScript 5.9.3, Tailwind CSS 4.1.17 |
| **Backend** | Node.js, Firebase (Firestore, Auth, Cloud Functions) |
| **AI/ML** | Google Generative AI (@google/generative-ai), OpenAI API |
| **Payments** | Stripe, PayPal |
| **Integrations** | Microsoft 365 (Teams, Outlook, Copilot), TikTok, Instagram, YouTube |
| **Deployment** | Vercel (Frontend), Firebase (Backend), Google Play Store (Android) |
| **Monitoring** | Sentry, Vercel Analytics |

---

## 📁 Project Structure

```
Labs-Ai/
├── app/                           # Next.js App Router
│   ├── api/                       # API routes (37+ endpoints)
│   │   ├── auth/                  # OAuth & authentication
│   │   ├── teams/                 # Microsoft Teams bot
│   │   ├── webhooks/              # Stripe, Microsoft, PayPal webhooks
│   │   ├── copilot/               # Copilot plugin integration
│   │   ├── ai/                    # AI content generation
│   │   ├── payments/              # Payment processing
│   │   └── [other routes]/        # 25+ more endpoints
│   ├── dashboard/                 # User dashboard pages
│   ├── auth/                      # Authentication flows
│   ├── billing/                   # Subscription management
│   ├── admin/                     # Admin interface
│   └── [routes]/                  # 20+ other pages
├── components/                    # React components
│   ├── ui/                        # Reusable UI components
│   ├── dashboard/                 # Dashboard-specific components
│   └── [feature]/                 # Feature-specific components
├── lib/                           # Utility functions
│   ├── firebase.ts                # Firebase client setup
│   ├── firebase-admin.ts          # Firebase admin SDK
│   ├── firebase-server.ts         # Server-side utilities
│   ├── stripe.ts                  # Stripe integration
│   ├── ai.ts                      # AI generation (Google AI, OpenAI)
│   ├── guardian-bot.ts            # Security analysis
│   ├── rateLimiter.ts             # Rate limiting
│   ├── microsoft-graph.ts         # Microsoft Graph API
│   ├── usage-tracker.ts           # Tier-based usage tracking
│   └── [other utils]/             # 15+ other utilities
├── types/                         # TypeScript type definitions
├── context/                       # React Context providers
├── public/                        # Static assets
├── android-app/                   # Android Flutter app
└── scripts/                       # Build & automation scripts
```

---

## 🔐 Security & Authentication

### Authentication Methods
- **Firebase Auth**: Email/password, Google, Apple
- **OAuth 2.0**: Microsoft Entra ID (Azure AD) integration
- **API Key**: Internal API endpoints with rate limiting

### Security Features
- **Firestore Security Rules**: Role-based access control (RBAC)
- **Rate Limiting**: Token bucket implementation (20 req/60s for free users)
- **Guardian Bot**: AI-powered behavioral analysis for fraud detection
- **Webhook Verification**: Stripe and Microsoft signature verification
- **Encryption**: OAuth tokens encrypted and stored in Firebase
- **Admin Controls**: Super admin, admin, user, and demo roles
- **Environment Variables**: All secrets in `.env.local`, never hardcoded
- **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options configured

### Required Environment Variables
```env
# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Microsoft 365
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=...

# AI APIs
NEXT_PUBLIC_GOOGLE_AI_API_KEY=...

# Internal
INTERNAL_WEBHOOK_SECRET=...
```

---

## 📊 Subscription Tiers

The platform has a tiered system controlling feature access and usage limits:

| Tier | Features | Limits |
|------|----------|--------|
| **free** | Demo access, limited generations | 5 posts/month, no bot builder |
| **starter** | Basic AI generation | 50 posts/month, basic analytics |
| **creator** | Full content suite | 500 posts/month, marketplace access |
| **pro** | Advanced features | 2000 posts/month, priority support |
| **agency** | White-label, team management | Unlimited, custom branding |
| **education** | Special academic pricing | Custom limits |

**Key Constraint**: Always check user tier before allowing operations. Use `lib/tier-limits.ts` for limit enforcement.

---

## 🔌 API Endpoints (37+ Total)

### Core Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/callback/microsoft` | GET | OAuth callback handler |
| `/api/teams/bot` | POST | Microsoft Teams bot receiver |
| `/api/copilot` | POST | Copilot plugin function calls |
| `/api/webhooks/microsoft` | POST | Outlook email & calendar events |
| `/api/webhooks/stripe` | POST | Stripe payment notifications |
| `/api/webhooks/stripe-to-teams` | POST | Send Stripe events to Teams |
| `/api/ai/generate` | POST | Generate content (posts, scripts, images) |
| `/api/checkout-session` | POST | Create Stripe checkout session |
| `/api/subscription-status` | GET | Get user subscription info |
| `/api/studio/templates` | GET | Get content templates |

### Additional Endpoints (30+)
- **Analytics**: `/api/analytics`, `/api/monitoring`
- **Admin**: `/api/admin/*`, `/api/verify-admin`
- **Payments**: `/api/payments`, `/api/stripe-*`, `/api/paypal-*`
- **Bots**: `/api/teams/bot`, `/api/whatsapp/*`, `/api/discord/*`
- **Content**: `/api/ai-chat`, `/api/studio/*`, `/api/marketplace/*`
- **Users**: `/api/preferences`, `/api/profile`, `/api/referrals`

---

## 🚀 Development Workflow

### Running the Application
```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm run start

# Code quality checks
npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run build       # Full build test
```

### Build & Deployment
- **Local**: `npm run dev` (http://localhost:3000)
- **Production**: Deployed to Vercel with auto-deployment on `master` branch
- **Docker**: Optional containerization available
- **Firebase**: Backend deployed to Firebase (Cloud Functions, Firestore)

---

## 🎨 UI/UX Components

### Key Pages
- **Dashboard**: `/dashboard` - Main user hub (15+ sub-pages)
- **AI Studio**: `/labstudio` - Content generation interface
- **Marketplace**: `/marketplace` - Buy/sell content and services
- **Admin Panel**: `/admin` - User management and analytics
- **Billing**: `/billing` - Subscription management
- **Authentication**: `/auth` - Login/signup flows

### Component Library
- Reusable UI components in `components/ui/`
- Dashboard layout wrapper: `DashboardLayout`
- Error boundaries: Global and page-level error handling
- Loading states: Built-in loading components

---

## 🔄 Key Patterns & Best Practices

### API Route Pattern (Security Template)
```typescript
import { getUserFromRequest } from '@/lib/auth-helper';
import { canPerformActionServer } from '@/lib/firebase-server';

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // 2. Check tier limits
  const check = await canPerformActionServer(user.uid, 'actionType');
  if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 403 });
  
  // 3. Security analysis (for sensitive ops)
  await Guardian.getInstance().analyzeUserBehavior(user.uid, 'action', { ip });
  
  // 4. Execute operation
  // ... implementation ...
  
  // 5. Track usage
  await incrementUsageServer(user.uid, 'actionType');
}
```

### Firestore Query Pattern
```typescript
import { query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const q = query(
  collection(db, 'collectionName'),
  where('field', '==', value)
);
const snapshot = await getDocs(q);
```

---

## ⚠️ Critical Rules

**DO:**
- ✅ Use TypeScript strict mode (all files)
- ✅ Authenticate all API endpoints
- ✅ Check user tier before paid operations
- ✅ Validate all user input
- ✅ Use Firestore security rules
- ✅ Log errors with Sentry
- ✅ Rate limit public endpoints
- ✅ Never hardcode secrets

**DON'T:**
- ❌ Use `any` type (use `unknown` instead)
- ❌ Skip authentication checks
- ❌ Bypass rate limiting
- ❌ Commit `.env.local`
- ❌ Remove error boundaries
- ❌ Ignore TypeScript errors
- ❌ Trust user input
- ❌ Log sensitive data

---

## 📝 File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `DashboardLayout.tsx` |
| Pages | kebab-case | `page.tsx` in `app/dashboard/page.tsx` |
| Utilities | camelCase | `generateContent.ts` |
| Types | PascalCase | `User.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_REQUESTS_PER_WINDOW` |
| API routes | kebab-case | `app/api/auth/callback/microsoft/route.ts` |

---

## 🧪 Testing & Quality

- **No automated tests yet** - Manual testing required
- **ESLint**: All code must be lint-free
- **TypeScript**: Zero compilation errors required
- **Build**: Must pass `npm run build` without warnings
- **Testing**: Test in browser before submitting PRs

---

## 📚 Important Files Reference

| File | Purpose |
|------|---------|
| `.github/copilot-instructions.md` | Comprehensive dev guidelines |
| `QUICK_DEPLOY.md` | 25-minute deployment guide |
| `AZURE_AD_SETUP.md` | Azure configuration steps |
| `firestore.rules` | Database security rules |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `.env.example` | Environment variables template |

---

## 🎯 When Assigned a Task

1. **Understand Context**: Read relevant documentation
2. **Check Existing Patterns**: Look at similar implementations
3. **Follow Security**: Never compromise on authentication/validation
4. **Test Thoroughly**: Manual testing is required
5. **Update Docs**: Keep documentation in sync
6. **Respect Architecture**: Follow established patterns

---

## 💡 Quick Examples

### Adding a New API Endpoint
```typescript
// app/api/your-feature/route.ts
import { getUserFromRequest } from '@/lib/auth-helper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Your implementation
  return NextResponse.json({ success: true });
}
```

### Adding a Client Component
```typescript
// components/MyComponent.tsx
'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState('');
  
  return <div className="...">Your component</div>;
}
```

### Firestore Query
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';

const userRef = query(
  collection(db, 'users'),
  where('tier', '==', 'pro')
);
const users = await getDocs(userRef);
```

---

## 🔗 Important Links

- **GitHub**: https://github.com/LiTree89/Labs-Ai
- **Firebase Console**: https://console.firebase.google.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Vercel**: https://vercel.com/dashboard
- **Azure Portal**: https://portal.azure.com

---

## 🎓 Summary

**LitLabs AI** is a production-ready, feature-rich platform with:
- Strong security implementation
- Comprehensive API surface (37+ endpoints)
- Real-time analytics and monitoring
- Multi-tier subscription system
- Integration with Microsoft 365, Stripe, Firebase
- Deployed on Vercel (frontend) and Firebase (backend)

When working on this project, prioritize **security, type safety, and user tier validation** above all else.

---

**Last Updated**: December 7, 2025  
**Status**: Production Ready ✅
