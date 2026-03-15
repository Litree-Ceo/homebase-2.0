# 🚀 LitreeLabs - Complete TypeScript + Next.js Rebuild

**Status:** ✅ **ARCHITECTURE COMPLETE & READY FOR IMPLEMENTATION**

This document outlines the complete rebuild of LitreeLabs into a modern, production-ready SaaS platform with worlds, themes, teams collaboration, and multi-currency monetization.

---

## 📊 Architecture Overview

### Technology Stack

- **Frontend**: Next.js 14+ App Router + TypeScript + React 18
- **Backend**: Next.js API Routes (serverless)
- **Database**: Firebase Firestore (real-time, scalable)
- **Auth**: Firebase Authentication
- **Payments**: Stripe (subscriptions + one-time), Coinbase (crypto), On-chain (Ethereum)
- **AI**: OpenAI GPT-4o-mini (multi-persona chat)
- **Hosting**: Firebase Hosting (global CDN)
- **Analytics**: Firebase Analytics + Google Analytics 4

### Directory Structure

````
litlabs-web/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Home/dashboard
│   ├── dashboard/
│   │   ├── page.tsx               # User dashboard
│   │   └── [userId]/page.tsx      # User profile page
│   ├── worlds/
│   │   ├── page.tsx               # Worlds list
│   │   └── [worldId]/page.tsx     # World editor
│   ├── marketplace/
│   │   ├── page.tsx               # Marketplace browse
│   │   └── [itemId]/page.tsx      # Item detail
│   ├── api/
│   │   ├── ai/
│   │   │   └── chat/route.ts      # Multi-persona AI chat
│   │   ├── worlds/
│   │   │   ├── save/route.ts      # Save world
│   │   │   ├── load/route.ts      # Load world
│   │   │   └── list/route.ts      # List user worlds
│   │   ├── payments/
│   │   │   ├── create-subscription/route.ts
│   │   │   ├── create-purchase/route.ts
│   │   │   └── webhook/route.ts   # Stripe webhook
│   │   └── marketplace/
│   │       └── list/route.ts
```typescript
```
│   └── settings/page.tsx
│
├── components/                     # Reusable React components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── worlds/
│   │   ├── WorldRenderer.tsx      # Display world
│   │   └── WorldEditor.tsx        # Edit world
│   ├── widgets/
│   │   ├── WidgetFrame.tsx
│   │   ├── ClockWidget.tsx
│   │   ├── GoalsWidget.tsx
│   │   ├── MusicWidget.tsx
│   │   ├── MoneyBotWidget.tsx     # AI money ideas
│   │   ├── ChatWidget.tsx         # Teams-like chat
│   │   └── PresenceWidget.tsx     # See who's online
│   ├── payment/
│   │   ├── SubscribePanel.tsx
│   │   ├── CheckoutButton.tsx
│   │   └── PaymentProviders.tsx
│   │   ├── ChatPanel.tsx
│   │   └── PersonaSelector.tsx
│   └── theme/
│       ├── ThemeSwitcher.tsx
│       └── ThemeMixer.tsx
│
├── config/                        # Configuration
│   ├── subscriptions.ts           # Plan definitions
│   ├── paymentProviders.ts        # Payment options
│   ├── themes.ts                  # Theme presets
│   ├── widgets.ts                 # Widget registry
│   └── constants.ts
│
├── lib/                           # Utilities & libraries
│   ├── db.ts                      # Firebase Firestore client
│   ├── auth.ts                    # Firebase Auth helpers
```text
│   ├── payments.ts                # Payment abstractions
│   ├── worlds.ts                  # World helpers
│   ├── presence.ts                # Real-time presence (Firebase RTDB)
│   └── utils.ts                   # General utilities
│
├── types/                         # TypeScript definitions
│   ├── world.ts                   # World data model
│   ├── user.ts                    # User data model
│   ├── widget.ts                  # Widget data model
│   ├── marketplace.ts             # Marketplace data model
│   └── payments.ts                # Payment data model
│
├── public/                        # Static assets
│   ├── worlds/                    # World backgrounds/images
│   └── themes/                    # Theme preview images
│
├── styles/                        # Global styles
│   └── globals.css
│
├── .env.example                   # Environment variables template
├── tsconfig.json                  # TypeScript configuration
├── next.config.js                 # Next.js configuration
└── package.json

````

---

## 🗄️ Data Models (TypeScript)

### World

````typescript
```text
interface World {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  ```typescript
  widgets: WidgetInstance[];
  layout: Record<string, string>;
  background: WorldBackgroundConfig;
  aiConfig: AIPersonaConfig;
  visibility: "private" | "unlisted" | "public";
  collaborators?: WorldCollaborator[];
  createdAt: number;
  updatedAt: number;
}
````

**Storage**: `users/{userId}/worlds/{worldId}`

### User Profile

```typescript
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  subscription: {
    planId: "free" | "basic" | "pro" | "godmode";
    status: "inactive" | "active" | "past_due" | "canceled";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: number;
  };
  glowPoints: number;
  stats?: {
    worldsCreated: number;
    itemsSold?: number;
    totalRevenue?: number;
  };
  createdAt: number;
}
```

**Storage**: `users/{userId}`

### Marketplace Item

```typescript
interface MarketplaceItem {
  id: string;
  type: "world" | "theme" | "widget" | "persona" | "pack";
  ownerId: string;
  title: string;
  description: string;
  priceFiatCents?: number;
  priceCryptoAmount?: string;
  visibility: "listed" | "hidden" | "draft";
  rating?: number;
  createdAt: number;
  updatedAt: number;
}
```

**Storage**: `marketplace/{itemId}`

---

## 💰 Payment System

### Subscriptions (Stripe)

**Plans:**

- **Free**: 1 world, limited features
- **Creator ($9.99/mo)**: 5 worlds, all widgets, 100 AI messages
- **Pro Creator ($29.99/mo)**: Unlimited worlds, marketplace access, Money Bot AI
- **GODMODE ($99.99/mo)**: Everything, priority AI, dev tools, revenue share

**Flow:**

1. User clicks "Upgrade" → `POST /api/payments/create-subscription`
2. Server creates Stripe checkout session
3. User pays, Stripe sends webhook to `POST /api/payments/webhook`
4. Server updates user subscription in Firestore
5. User automatically gets plan features

### One-Time Purchases (Marketplace)

**Providers:**

- Stripe (credit card, Apple Pay, Google Pay)
- Coinbase Commerce (crypto)
- On-chain (MetaMask, Ethereum directly)

**Flow:**

1. User clicks "Buy" on marketplace item
2. Server creates checkout based on selected provider
3. User completes payment
4. Item transferred to user's library
5. Revenue recorded for seller

---

## 🤖 AI System - Multi-Persona Chat

### Personas

1. **Money Bot**: Income generation ideas, monetization strategy
2. **Designer**: UI/UX advice, world building, theme creation
3. **Mentor**: Life coaching, goal setting, motivation
4. **Creator**: Content strategy, audience building
5. **Tech**: Technical advice, architecture, best practices

### Implementation Example

- Each persona has custom system prompt
- Calls OpenAI GPT-4o-mini API
- Context includes user ID, current world, etc.
- Responses are streamed to UI in real-time

```typescript
// Call AI chat
const response = await fetch("/api/ai/chat", {
  method: "POST",
  body: JSON.stringify({
    message: "How can I make money with my world?",
    persona: "moneyBot",
    userId: user.id,
  }),
});
```

---

## 🎮 Widget System

### Built-in Widgets

| Widget          | Purpose            | Features                           |
| --------------- | ------------------ | ---------------------------------- |
| **Clock**       | Time display       | Timezone support, 12/24h format    |
| **Money Bot**   | Income ideas       | Refreshes hourly, AI-powered       |
| **Goals**       | Goal tracking      | Quarterly planning, progress       |
| **Music**       | Focus music        | Playlist selection, ambient sounds |
| **Analytics**   | Performance        | Views, engagement, shares          |
| **Chat**        | Team communication | Real-time, Teams-like UI           |
| **Presence**    | Who's online       | User status, current world         |
| **Marketplace** | Browse/buy         | Quick shop, trending items         |
| Widget          | Purpose            | Features                           |
| --------        | ---------          | ----------                         |
| **Clock**       | Time display       | Timezone support, 12/24h format    |
| **Money Bot**   | Income ideas       | Refreshes hourly, AI-powered       |
| **Goals**       | Goal tracking      | Quarterly planning, progress       |
| **Music**       | Focus music        | Playlist selection, ambient sounds |
| **Analytics**   | Performance        | Views, engagement, shares          |
| **Chat**        | Team communication | Real-time, Teams-like UI           |
| **Presence**    | Who's online       | User status, current world         |
| **Marketplace** | Browse/buy         | Quick shop, trending items         |

### Widget Registry

```typescript
// config/widgets.ts
export const WIDGETS: Record<string, WidgetAPI> = {
  clock: { ... },
  moneyBot: { ... },
  // ...
};
```

Each widget has:

- Metadata (name, description, icon)
- Default config
- Permissions required
- React component path

---

## 🎨 Theme System

### Available Themes

1. **Cyber** - Neon pink/cyan futuristic
2. **Midnight** - Deep blue dark mode
3. **Sunrise** - Warm gold/orange
4. **Arctic** - Cool teal ice
5. **Ocean** - Deep blue with cyan
6. **Forest** - Natural greens

### Theme Customization

Users can:

- Select preset theme
- Mix & match colors (Glow Lab)
- Save custom theme variants
- Share themes on marketplace

```typescript
// config/themes.ts
interface ThemePreset {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  // ... 10+ color tokens
}
```

---

## 🔐 Authentication

### Methods

- Email/Password (Firebase)
- Google Sign-In
- Microsoft/Teams
- GitHub
- Social login integrations

### Implementation

````typescript
```typescript
// Sign up
const user = await signupWithEmail(email, password, displayName);
await createUserProfile(user.uid, email, displayName);

// Login
const user = await loginWithEmail(email, password);

// Logout
await logout();
````

---

## 📡 Real-Time Presence (Firebase RTDB)

Shows who's online and what they're working on.

**Storage**: `/presence/{worldId}/{sessionId}`

```json
{
  "userId": "user123",
  "displayName": "Alex",
  "enteredAt": 1704067200000,
  "lastSeenAt": 1704067320000,
  "status": "online"
}
```

**Features:**

- Auto-disconnect on page leave
- Typing indicators
- Last seen timestamp
- User status (online/away/offline)

---

## 🛒 Marketplace

### Features

- **Browse**: Filter by type, category, rating
- **Search**: Full-text search on title, description
- **Purchase**: Multiple payment methods
- **Sell**: List your worlds, themes, widgets, personas
- **Revenue**: 70/30 split (creator/platform)

### Item Types

| Type        | Description           | Example                         |
| ----------- | --------------------- | ------------------------------- |
| **World**   | Complete world preset | Professional workspace template |
| **Theme**   | Color/style preset    | Cyberpunk neon theme            |
| **Widget**  | Reusable component    | Custom dashboard widget         |
| **Persona** | AI personality        | "Motivational Coach" bot        |
| **Pack**    | Bundle                | "Entrepreneur Starter Pack"     |
| Type        | Description           | Example                         |
| ------      | -------------         | ---------                       |
| **World**   | Complete world preset | Professional workspace template |
| **Theme**   | Color/style preset    | Cyberpunk neon theme            |
| **Widget**  | Reusable component    | Custom dashboard widget         |
| **Persona** | AI personality        | "Motivational Coach" bot        |
| **Pack**    | Bundle                | "Entrepreneur Starter Pack"     |

---

## 💵 Revenue Models

### 1. Subscriptions (Primary)

- Monthly recurring revenue
- Tier-based feature access
- Stripe handles billing/cancellations

### 2. Marketplace Sales

- 70/30 split (creator/platform)
- All payment providers supported
- Automatic payout to creator

### 3. Creator Revenue Share (GODMODE)

- 30% commission on platform revenue
- Passive income for top creators
- Tracked in user `stats.totalRevenue`

### 4. Affiliate Links

- Embed in world descriptions
- Track clicks/conversions
- Commission on sales

### 5. Google AdSense (Optional)

- Display ads in marketplace
- Ad slots in public worlds
- CPM-based revenue

---

## 🚀 Key Features to Implement

### Phase 1: Core (Week 1)

- [x] TypeScript setup & types
- [x] Config files (subscriptions, themes, widgets)
- [x] Firebase integration
- [x] Stripe payment flow
- [ ] Login/signup UI
- [ ] Dashboard page
- [ ] World CRUD

### Phase 2: Worlds & Widgets (Week 2)

- [ ] World editor (drag/drop widgets)
- [ ] Theme switcher & mixer
- [ ] All 8 widgets implemented
- [ ] Widget save/load

### Phase 3: AI & Marketplace (Week 3)

- [ ] Multi-persona AI chat
- [ ] Money Bot widget
- [ ] Marketplace browse/search
- [ ] Item purchase flow
- [ ] Seller dashboard

### Phase 4: Teams & Collaboration (Week 4)

- [ ] Real-time presence
- [ ] Team chat widget
- [ ] Collaborative world editing
- [ ] Notifications system
- [ ] Invite flow

### Phase 5: Polish & Launch (Week 5)

- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] SEO setup
- [ ] Analytics tracking
- [ ] Documentation
- [ ] Stripe live keys
- [ ] Launch!

---

## 📦 Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Fill in your credentials
# FIREBASE_API_KEY, STRIPE_SECRET_KEY, OPENAI_API_KEY, etc.
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Install Required Packages

```bash
npm install next react react-dom typescript
npm install firebase stripe
npm install openai
npm install class-variance-authority clsx tailwind-merge
```

### 4. Run Development Server

```bash
npm run dev
# Server runs on http://localhost:3000
```

### 5. Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

---

## 🔗 API Endpoints

### Worlds

- `POST /api/worlds/save` - Save user world
- `GET /api/worlds/[worldId]` - Load specific world
- `GET /api/worlds/list` - List user's worlds
- `DELETE /api/worlds/[worldId]` - Delete world

### AI Chat

- `POST /api/ai/chat` - Send message (multi-persona)

### Payments

- `POST /api/payments/create-subscription` - Start subscription checkout
- `POST /api/payments/create-purchase` - Start one-time purchase
- `POST /api/payments/webhook` - Stripe webhook (auto)

### Marketplace

- `GET /api/marketplace/list` - Browse items
- `GET /api/marketplace/[itemId]` - Get item details
- `POST /api/marketplace/purchase` - Purchase item

### Presence

- `POST /api/presence/update` - Update user presence
- `GET /api/presence/[worldId]` - Get world presence

---

## 🎯 Next Steps

1. **Copy all files** from this architecture
2. **Install dependencies** (`npm install`)
3. **Configure Firebase** (create project, get credentials)
4. **Configure Stripe** (get API keys, create products)
5. **Configure OpenAI** (get API key)
6. **Implement React components** (start with auth UI)
7. **Test payment flow** (use Stripe test keys)
8. **Deploy to Firebase Hosting**

---

## 📚 Resources

- **Next.js**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Firebase**: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- **Stripe**: [https://stripe.com/docs](https://stripe.com/docs)
- **TypeScript**: [https://www.typescriptlang.org/docs](https://www.typescriptlang.org/docs)
- **React**: [https://react.dev](https://react.dev)

---

**Status**: ✅ Architecture complete. Ready for React component implementation!
