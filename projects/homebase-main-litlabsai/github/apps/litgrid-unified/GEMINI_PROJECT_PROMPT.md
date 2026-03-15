# LiTree Unified Platform - Complete Project Context for Gemini 3 Flash

## 🎯 PROJECT OVERVIEW

**Project Name:** LiTree Unified  
**Type:** Full-stack social media metaverse platform with AI, Web3, and NFT integration  
**Tech Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS + Firebase + NVIDIA AI  
**Status:** Active Development  
**Node Version:** >=20.0.0  
**Package Manager:** pnpm >=9.0.0

---

## 📊 PROJECT STRUCTURE

```
litree-unified/
├── app/                          # Next.js App Router pages
│   ├── api/cortex/              # AI inference API endpoint
│   ├── auth/                    # Authentication pages
│   ├── blog/                    # Blog pages
│   ├── builder/                 # Visual builder interface
│   ├── cortex/                  # AI Cortex interface
│   ├── dashboard/               # User dashboard
│   ├── flash/                   # Flash features
│   ├── marketplace/             # NFT marketplace
│   ├── media/                   # Media hub
│   ├── metaverse/               # 3D metaverse
│   ├── social/                  # Social networking
│   ├── globals.css              # Global styles
│   ├── layout.jsx               # Root layout
│   └── page.jsx                 # Landing page
│
├── components/                  # React components
│   ├── social/                  # Social features
│   │   ├── BottomNav.jsx
│   │   ├── CreatePost.jsx
│   │   ├── Feed.jsx
│   │   ├── NewsAgent.jsx
│   │   ├── PostCard.jsx
│   │   ├── ProfileHeader.jsx
│   │   ├── RightPanel.jsx
│   │   └── Sidebar.jsx
│   ├── AuthProvider.jsx
│   ├── BuilderRegistry.jsx
│   ├── FlashNav.jsx
│   ├── FlashUIPreview.jsx
│   ├── GodModePanel.tsx         # AI God Mode interface
│   ├── MediaPlayerWidget.jsx
│   └── SecurityProvider.jsx
│
├── lib/                         # Utility libraries & services
│   ├── config/
│   │   └── env.ts              # Environment configuration
│   ├── middleware/
│   │   ├── cors.ts
│   │   └── rateLimit.ts
│   ├── validators/
│   │   └── schemas.ts          # Zod validation schemas
│   ├── activity-logger.ts      # Activity tracking
│   ├── ai.ts                   # AI utilities
│   ├── analytics.ts            # Analytics service
│   ├── auth-gcip.ts            # Google Cloud Identity Platform
│   ├── auth-helper.ts          # Auth utilities
│   ├── bot-builder.ts          # Bot creation
│   ├── demo-data.ts            # Demo/mock data
│   ├── email.ts                # Email service
│   ├── firebase-admin.ts       # Firebase admin SDK
│   ├── firebase-server.ts      # Server-side Firebase
│   ├── firebase-utils.ts       # Firebase utilities
│   ├── firebase.ts             # Client-side Firebase
│   ├── functionsClient.ts      # Cloud Functions client
│   ├── gcip.ts                 # GCIP utilities
│   ├── god-mode.ts             # AI God Mode logic
│   ├── google-cloud-integration.js
│   ├── guardian-bot.ts         # Guardian bot
│   ├── marketplace.ts          # NFT marketplace logic
│   ├── memory.ts               # Memory/context management
│   ├── microsoft-graph.ts      # Microsoft Graph API
│   ├── music-generator.ts      # Music generation
│   ├── nvidia-ai.ts            # NVIDIA NIM API integration
│   ├── rateLimiter.ts          # Rate limiting
│   ├── recaptcha.ts            # reCAPTCHA
│   ├── sentry.ts               # Error tracking
│   ├── serverLogger.ts         # Server logging
│   ├── smart-context.ts        # Smart context management
│   ├── spark-bot.ts            # Spark bot
│   ├── stripe-billing.ts       # Stripe billing
│   ├── stripe-client.ts        # Stripe client
│   ├── stripe.ts               # Stripe utilities
│   ├── subscriptionStore.ts    # Subscription management
│   ├── template-library.ts     # Template system
│   ├── tier-limits.ts          # Subscription tiers
│   ├── url-helper.ts           # URL utilities
│   ├── usage-tracker.ts        # Usage tracking
│   ├── utils.ts                # General utilities
│   ├── validation.ts           # Validation utilities
│   ├── video-generator.ts      # Video generation
│   └── whatsapp-bot.ts         # WhatsApp bot
│
├── functions/                  # Firebase Cloud Functions
│   ├── index.js
│   └── package.json
│
├── scripts/                    # Build/utility scripts
│   ├── generate-model-guide.ts
│   ├── test-nvidia.ts
│   └── verify-glm.ts
│
├── public/                     # Static assets
├── .env.example                # Environment template
├── .env.local                  # Local environment (git ignored)
├── .eslintrc.json              # ESLint config
├── .gitignore
├── DEPLOYMENT.md               # Deployment guide
├── firebase.json               # Firebase config
├── firestore.indexes.json      # Firestore indexes
├── firestore.rules             # Firestore security rules
├── next.config.js              # Next.js config
├── package.json                # Dependencies
├── postcss.config.mjs          # PostCSS config
├── PROJECT-SUMMARY.md          # Project overview
├── README.md                   # Main readme
├── tsconfig.json               # TypeScript config
└── start.ps1                   # Development startup script
```

---

## 🔧 CORE TECHNOLOGIES

### Frontend
- **Framework:** Next.js 16.1.6 (App Router)
- **UI Library:** React 19.2.4
- **Styling:** Tailwind CSS 4.1.18
- **Language:** TypeScript 5.9.3
- **3D Graphics:** Three.js 0.170.0 + React Three Fiber 9.5.0
- **Animations:** Framer Motion 12.23.25
- **UI Components:** Radix UI, Lucide React
- **State Management:** React hooks + Context API

### Backend & Services
- **Backend Framework:** Next.js API Routes
- **Database:** Firebase Firestore + Cosmos DB
- **Authentication:** Firebase Auth + Google Cloud Identity Platform
- **File Storage:** Firebase Storage + IPFS
- **Serverless:** Firebase Cloud Functions + Azure Functions

### AI & ML
- **Primary AI:** NVIDIA NIM (GLM-4, Llama 3 70B, SDXL)
- **Fallback AI:** Google Generative AI (Gemini)
- **OpenAI:** GPT integration
- **Music Generation:** Custom music-generator service
- **Video Generation:** Custom video-generator service

### Payments & Blockchain
- **Payments:** Stripe, PayPal, Coinbase
- **Blockchain:** Ethers.js 6.13.4
- **Web3:** MetaMask integration
- **NFTs:** Smart contract minting

### Monitoring & Security
- **Error Tracking:** Sentry
- **Rate Limiting:** Custom rate limiter
- **Security:** reCAPTCHA, CORS middleware
- **Logging:** Custom server logger

---

## 📦 KEY DEPENDENCIES

```json
{
  "core": {
    "next": "16.1.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "typescript": "5.9.3"
  },
  "ui": {
    "tailwindcss": "4.1.18",
    "framer-motion": "12.23.25",
    "lucide-react": "0.563.0",
    "@radix-ui/react-dialog": "1.1.15",
    "@radix-ui/react-dropdown-menu": "2.1.16"
  },
  "3d": {
    "three": "0.170.0",
    "@react-three/fiber": "9.5.0",
    "@react-three/drei": "10.7.7"
  },
  "backend": {
    "firebase": "12.8.0",
    "firebase-admin": "13.6.0",
    "@sentry/node": "10.28.0"
  },
  "ai": {
    "@google/generative-ai": "0.24.1",
    "openai": "6.10.0"
  },
  "payments": {
    "stripe": "20.0.0",
    "@stripe/react-stripe-js": "5.4.1"
  },
  "web3": {
    "ethers": "6.13.4"
  },
  "validation": {
    "zod": "4.1.13"
  }
}
```

---

## 🎨 DESIGN SYSTEM

### Brand Colors
- **Primary:** #00ff88 (Neon Green)
- **Secondary:** #0088ff (Electric Blue)
- **Accent:** #ff00ff (Magenta)
- **Dark:** #0a0a0a (Near Black)
- **Gold:** #ffd700 (Bright Gold)
- **Purple:** #a855f7 (Vibrant Purple)

### CSS Classes (Tailwind)
- `.flash-card` - Main card component
- `.hc-bright-gold` - Gold accent color
- `.hc-purple` - Purple accent color
- `.backdrop-blur-xl` - Glassmorphism effect
- `.animate-in` - Entrance animations

### Typography
- **Headings:** Font-black, tracking-tight
- **Body:** Font-normal, text-gray-200
- **Code:** Font-mono, text-sm
- **Labels:** Font-bold, uppercase, tracking-widest

---

## 🔌 API ENDPOINTS

### AI & Content Generation
- `POST /api/cortex` - Main AI inference endpoint
  - Supports text generation, image generation
  - Models: GLM-4, Llama 3 70B, SDXL
  - Fallback to Gemini if NVIDIA unavailable

### Authentication
- Firebase Auth endpoints
- Google Cloud Identity Platform
- Custom auth helpers

### Social Features
- Post creation/deletion
- Comments and likes
- User profiles
- Feed generation

### Payments
- Stripe webhook handlers
- Subscription management
- Invoice generation

### Bots
- WhatsApp bot API
- Discord bot API
- Guardian bot
- Spark bot

---

## 🚀 ENVIRONMENT VARIABLES

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_SDK_KEY=

# AI Services
NVIDIA_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
OPENAI_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Web3
ETHEREUM_RPC_URL=
PRIVATE_KEY=

# Security
RECAPTCHA_SECRET_KEY=
SENTRY_DSN=

# Microsoft
MICROSOFT_GRAPH_TOKEN=

# Email
SENDGRID_API_KEY=

# Logging
LOG_LEVEL=info
```

---

## 📋 CURRENT FEATURES

### ✅ Implemented
1. **Landing Page** - Hero section, feature showcase
2. **Authentication** - Login/signup UI (Firebase ready)
3. **Dashboard** - Social feed with posts, likes, comments
4. **Social Networking** - Profiles, followers, feed
5. **Navigation** - Consistent header/sidebar
6. **Responsive Design** - Mobile, tablet, desktop
7. **Dark Theme** - Modern glassmorphism UI
8. **AI Integration** - NVIDIA NIM + Gemini fallback
9. **God Mode Panel** - Advanced AI interface
10. **Media Hub** - Music/video player widget
11. **NFT Marketplace** - UI framework
12. **3D Metaverse** - Three.js preview
13. **Builder Interface** - Visual component builder
14. **Rate Limiting** - API protection
15. **Error Tracking** - Sentry integration

### 🔄 In Progress
1. Real-time chat
2. Video streaming
3. Advanced analytics
4. Bot marketplace
5. Mobile app (React Native)

### 📅 Planned
1. Metaverse expansion
2. Advanced NFT features
3. DAO governance
4. Token staking
5. Enterprise features

---

## 🎯 KEY COMPONENTS

### GodModePanel.tsx
Advanced AI interface for content generation and analysis.
- Supports smart (GLM-4) and fast (Llama 3) modes
- Real-time result streaming
- Copy to clipboard functionality
- Image generation support

### Social Components
- **Feed.jsx** - Main social feed
- **PostCard.jsx** - Individual post display
- **CreatePost.jsx** - Post creation interface
- **ProfileHeader.jsx** - User profile section
- **Sidebar.jsx** - Navigation sidebar
- **RightPanel.jsx** - Trending/recommendations
- **BottomNav.jsx** - Mobile navigation
- **NewsAgent.jsx** - AI news generation

### API Routes
- **cortex/route.js** - Main AI inference endpoint
  - Handles text and image generation
  - Fallback logic for API failures
  - Demo mode for missing credentials

---

## 🔐 SECURITY FEATURES

1. **Rate Limiting** - Prevent abuse
2. **CORS Middleware** - Cross-origin protection
3. **reCAPTCHA** - Bot prevention
4. **Firebase Security Rules** - Database access control
5. **Firestore Rules** - Collection-level security
6. **Environment Variables** - Secrets management
7. **Error Handling** - Secure error messages
8. **Input Validation** - Zod schemas

---

## 📊 LINTING & CODE QUALITY

### ESLint Configuration
- TypeScript support
- React best practices
- Next.js specific rules
- Import organization
- Unused variable detection

### Prettier Configuration
- 2-space indentation
- Single quotes
- Trailing commas
- Line width: 80

### Current Status
- ✅ 0 errors
- ⚠️ 50 warnings (mostly unused variables and `any` types)
- All formatting issues resolved

---

## 🚀 DEVELOPMENT WORKFLOW

### Start Development
```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

### Build for Production
```bash
pnpm build
pnpm start
```

### Linting
```bash
pnpm lint              # Check for issues
pnpm lint --fix        # Auto-fix issues
```

### Deploy
```bash
pnpm run deploy        # Firebase hosting
```

---

## 🎓 ARCHITECTURE PATTERNS

### Component Structure
- Functional components with hooks
- Client-side rendering for interactivity
- Server components for data fetching
- Context API for global state

### API Design
- RESTful endpoints
- JSON request/response
- Error handling with try-catch
- Fallback mechanisms

### State Management
- React hooks (useState, useContext)
- Local component state
- Context for global state
- No external state library (yet)

### Error Handling
- Try-catch blocks
- Graceful fallbacks
- User-friendly error messages
- Sentry error tracking

---

## 📈 PERFORMANCE CONSIDERATIONS

1. **Code Splitting** - Next.js automatic
2. **Image Optimization** - Next.js Image component
3. **CSS Optimization** - Tailwind purging
4. **API Caching** - Firebase caching
5. **Rate Limiting** - Prevent overload
6. **Lazy Loading** - React.lazy for components

---

## 🔗 INTEGRATIONS

### External APIs
- NVIDIA NIM (AI inference)
- Google Generative AI (Fallback)
- OpenAI (GPT)
- Stripe (Payments)
- Firebase (Backend)
- Microsoft Graph (Calendar/Email)
- Ethers.js (Blockchain)

### Internal Services
- Custom rate limiter
- Custom logger
- Custom email service
- Custom analytics
- Custom bot builders

---

## 📝 CODING STANDARDS

### TypeScript
- Strict mode enabled
- Type all function parameters
- Use interfaces for objects
- Avoid `any` type (use `unknown` if needed)

### React
- Functional components only
- Use hooks for state
- Memoize expensive computations
- Avoid inline functions in render

### Naming Conventions
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case (components: PascalCase)

### File Organization
- One component per file
- Related utilities in same folder
- Index files for exports
- Clear folder structure

---

## 🎯 NEXT IMMEDIATE TASKS

1. **Fix Hugging Face API** - Replace deprecated endpoint
2. **Resolve ESLint Warnings** - Remove unused imports
3. **Add Type Safety** - Replace `any` types
4. **Implement Tests** - Add unit/integration tests
5. **Optimize Images** - Use Next.js Image component
6. **Add Error Boundaries** - React error handling
7. **Implement Analytics** - Track user behavior
8. **Add Logging** - Server-side request logging

---

## 💡 USAGE EXAMPLES

### Using God Mode Panel
```tsx
import GodModePanel from '@/components/GodModePanel';

export default function Page() {
  return <GodModePanel />;
}
```

### Calling AI API
```typescript
const response = await fetch('/api/cortex', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Your prompt' }],
    model: { id: 'z-ai/glm4.7' },
    type: 'text',
  }),
});
const data = await response.json();
```

### Firebase Operations
```typescript
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const docRef = await addDoc(collection(db, 'posts'), {
  content: 'Hello World',
  timestamp: new Date(),
});
```

---

## 🎉 PROJECT HIGHLIGHTS

1. **Full-Stack Integration** - Frontend to backend to AI
2. **Multiple AI Models** - NVIDIA + Google + OpenAI
3. **Web3 Ready** - Blockchain and NFT support
4. **Scalable Architecture** - Serverless + Firebase
5. **Modern UI** - Glassmorphism + animations
6. **Type Safe** - Full TypeScript support
7. **Production Ready** - Error handling + monitoring
8. **Developer Friendly** - Clear structure + documentation

---

## 📞 SUPPORT & RESOURCES

- **GitHub:** github.com/litreelabs/litree-unified
- **Documentation:** See PROJECT-SUMMARY.md
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

---

## 🎓 FOR GEMINI 3 FLASH

When analyzing this project, consider:

1. **Architecture** - How components interact
2. **Data Flow** - From UI to API to database
3. **Error Handling** - Fallbacks and recovery
4. **Performance** - Optimization opportunities
5. **Security** - Vulnerabilities and best practices
6. **Scalability** - How to handle growth
7. **Maintainability** - Code organization and clarity
8. **User Experience** - UI/UX improvements

Use this context to provide comprehensive analysis, suggestions, and solutions for any questions about the LiTree Unified platform.

---

**Last Updated:** 2025-02-01  
**Version:** 1.0.0  
**Status:** Active Development
