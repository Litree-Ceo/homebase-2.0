# LiTreeLabStudio™ - Phase 1: MVP Implementation

## 🚀 Overview

Welcome to **LiTreeLabStudio™** - An AI-powered platform where creators, gamers, and explorers build worlds, share experiences, and grow together. This is the **Phase 1 (MVP)** implementation of the full blueprint.

**Phase 1 Focus**: Authentication, Onboarding, Homebase Dashboard, Copilot v1, Tiers & Pricing

---

## 📋 What's Implemented

### ✅ Phase 1 Core Features

#### 1. **Authentication System**
- User signup with interests & goals capture
- Email/password login with session management
- JWT-ready architecture for scaling
- Tier-based access (Free, Freemium, God Mode)
- Local storage for persistent sessions

**Files:**
- `app/src/contexts/AuthContext.jsx` - Auth state management
- `app/src/hooks/useAuth.js` - Auth hook for components
- `app/src/pages/Signup.jsx` - Signup form
- `app/src/pages/Login.jsx` - Login form
- `api/auth-signup.js` - Azure Function endpoint
- `api/auth-login.js` - Azure Function endpoint

#### 2. **Landing Page**
- Hero section with value proposition
- Feature cards (AI Copilot, Worlds, Gamification, Economy, Community, Studio)
- Pricing tier comparison
- CTAs for signup/login/guest browse

**File:**
- `app/src/pages/Landing.jsx`
- `app/src/styles/Auth.css` (includes landing styles)

#### 3. **Onboarding Wizard**
- 3-step onboarding flow:
  - Step 1: Configure Copilot AI personality
  - Step 2: Select primary modes (Creative, Social, Gaming, Learning, Trading)
  - Step 3: Summary & confirmation
- Progress bar tracking
- Leads to Homebase after completion

**File:**
- `app/src/pages/Onboarding.jsx`
- `app/src/styles/Onboarding.css`

#### 4. **Homebase Dashboard**
- Today's Plan (AI-curated tasks)
- Quick Actions (shortcuts to main features)
- Friends Activity feed
- Streak tracking, wallet peek, tier display
- Upsell prompts for free tier users

**File:**
- `app/src/pages/Homebase.jsx`
- `app/src/styles/Homebase.css`

#### 5. **Copilot v1 (AI Assistant)**
- Floating dock (bottom-right) with reactive assistance
- Accepts text prompts
- Smart responses based on keywords (create, earn, explore)
- Tier-based limits (free users: 5 prompts/day, premium: unlimited)
- Ready for Grok API integration in Phase 5

**File:**
- `app/src/components/CopilotDock.jsx`
- `app/src/styles/Copilot.css`
- `api/copilot-prompt.js` - Azure Function endpoint

#### 6. **Global Navigation**
- Sticky top nav with logo, tabs, search, notifications, profile
- Dynamic active state based on current route
- Profile dropdown with Settings/Upgrade/Logout
- Responsive design (hides tab labels on mobile)
- Quick access to all main features

**Files:**
- `app/src/components/Navigation.jsx`
- `app/src/styles/Navigation.css`

#### 7. **Explore Page**
- Tab-based filtering (Trending, Worlds, Media, Creators, Missions, Guilds)
- Responsive card grid
- Mock data (seeds for real data later)
- Hover effects and interactive UI

**Files:**
- `app/src/pages/Explore.jsx`
- `app/src/styles/Explore.css`

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Vite** - Build tool (lightning-fast)
- **CSS3** - Custom styling (gradients, animations, responsive)
- **Web APIs**: localStorage, Fetch API

### Backend
- **Node.js** - Runtime
- **Azure Functions** - Serverless compute
- **@azure/functions** - Function SDK

### Architecture (Ready for Scaling)
- **Auth:** JWT tokens (client-side storage in Phase 1, ready for server-side in production)
- **API:** RESTful endpoints following Azure Functions conventions
- **State Management:** React Context API (upgrade to Zustand/Redux if needed)
- **Database:** Ready for PostgreSQL integration (models defined in blueprint)

---

## 📁 Project Structure

```
LiTreeStudio/
├── app/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Public landing page
│   │   │   ├── Signup.jsx           # User registration
│   │   │   ├── Login.jsx            # User login
│   │   │   ├── Onboarding.jsx       # 3-step wizard
│   │   │   ├── Homebase.jsx         # Main dashboard
│   │   │   ├── Explore.jsx          # Discovery feed
│   │   │   └── [Placeholder pages for future phases]
│   │   ├── components/
│   │   │   ├── Navigation.jsx       # Top nav bar
│   │   │   ├── CopilotDock.jsx      # AI assistant dock
│   │   │   ├── Layout.jsx           # [Old - mark for removal]
│   │   │   ├── Header.jsx           # [Old - mark for removal]
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx      # Auth state & logic
│   │   ├── hooks/
│   │   │   └── useAuth.js           # Auth hook
│   │   ├── services/
│   │   │   └── [API service layer - ready for implementation]
│   │   ├── styles/
│   │   │   ├── Auth.css             # Auth & Landing styles
│   │   │   ├── Onboarding.css       # Onboarding styles
│   │   │   ├── Homebase.css         # Dashboard styles
│   │   │   ├── Navigation.css       # Nav styles
│   │   │   ├── Copilot.css          # Copilot styles
│   │   │   ├── Explore.css          # Explore styles
│   │   │   └── [Global styles]
│   │   ├── utils/
│   │   │   └── [Utility functions]
│   │   ├── App.jsx                  # Main app routing
│   │   ├── App.css                  # Global styles
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global CSS
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── api/
│   ├── auth-signup.js               # Signup endpoint
│   ├── auth-login.js                # Login endpoint
│   ├── copilot-prompt.js            # Copilot endpoint
│   ├── hello.js                     # Demo endpoint
│   ├── users.js                     # Demo endpoint
│   ├── host.json
│   └── package.json
├── server.js                        # Local dev server
├── package.json                     # Root config
└── [Config files]
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Azure Functions Core Tools (for testing locally)

### Installation

```bash
# Install all dependencies
npm run install:all

# Or manually:
npm install
cd app && npm install && cd ../api && npm install && cd ..
```

### Running Locally

#### Development Mode (Recommended)
```bash
# Build frontend
cd app
npm run build
cd ..

# Start Node.js server
node server.js

# Then open http://localhost:4280
```

#### With Azure Functions
```bash
# Terminal 1: Frontend dev server
cd app
npm run dev

# Terminal 2: Azure Functions
cd api
npm start

# Frontend will be on http://localhost:3000 (proxied to /api)
```

#### With SWA CLI (Static Web Apps simulation)
```bash
npx swa start dist --api-location api
```

---

## 📊 User Flows (Phase 1)

### 1. New User Flow
```
Landing Page 
  → "Start Your Plan" CTA
  → Signup Form (email, password, interests, goals)
  → Onboarding Wizard (3 steps)
  → Homebase Dashboard
```

### 2. Login Flow
```
Landing Page 
  → "Log In" CTA
  → Login Form (email, password)
  → Homebase Dashboard
```

### 3. Copilot Interaction Flow
```
User clicks 🤖 floating dock
  → Copilot panel opens
  → User types prompt (e.g., "How do I create?")
  → Copilot v1 returns mock response
  → [Phase 5: Integrate Grok API for real responses]
```

### 4. Exploration Flow
```
Homebase 
  → Click "Explore" in nav or quick actions
  → Browse trending/worlds/creators
  → [Phase 5: Full search, filtering, recommendations]
```

---

## 🔑 Key Configuration

### Environment Variables (Ready for .env)
```env
# Frontend
VITE_API_URL=http://localhost:7071
VITE_APP_NAME=LiTreeLabStudio

# Backend
GROK_API_KEY=sk-xxx-yyy-zzz  # [For Phase 5]
DATABASE_URL=postgresql://...  # [For Phase 3]
STRIPE_KEY=sk_test_xxx  # [For Phase 4]
JWT_SECRET=your-secret-key  # [For production auth]
```

### Vite Config
- Frontend dev server: `http://localhost:3000`
- API proxy: `/api/` → `http://localhost:7071`
- Build output: `../dist` (served by Node.js server)

---

## 📝 API Endpoints (Phase 1)

### Authentication
```
POST /api/auth/signup
  Body: { email, password, interests, goals }
  Response: { user, sessionId, message }

POST /api/auth/login
  Body: { email, password }
  Response: { user, tier, sessionId, message }
```

### Copilot
```
POST /api/copilot/prompt
  Body: { prompt, userId, tier, userContext }
  Response: { response, tokens_used, tier_remaining }
```

### Demo (Existing)
```
GET /api/hello?name=World
  Response: { message, timestamp, ... }

GET /api/users
  Response: { users, count, timestamp }
```

---

## 🎨 Design System

### Colors
- Primary: `#667eea` (Purple-blue)
- Secondary: `#764ba2` (Dark purple)
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Success: `#2e7d32` (Green)
- Warning: `#e65100` (Orange)
- Text: `#333` (Dark), `#666` (Gray), `#999` (Light gray)

### Typography
- Headings: Bold, 24-56px
- Body: Regular, 14-16px
- Buttons: Bold, 14-16px

### Spacing
- Base unit: 8px
- Padding: 12px, 20px, 30px, 40px
- Margin: 10px, 15px, 20px, 30px, 40px
- Gap: 10px, 15px, 20px, 30px

### Responsive Breakpoints
- Mobile: < 768px (adjust layout, hide labels, stack grids)
- Tablet: 768px - 1024px
- Desktop: > 1024px (full layout)

---

## 🔄 Phase Roadmap

### Phase 1: MVP (Current ✅)
- [x] Auth system
- [x] Onboarding
- [x] Homebase dashboard
- [x] Copilot v1 (mock responses)
- [x] Basic navigation
- [x] Pricing info
- **Status:** Ready for user testing

### Phase 2: Community (Coming Soon)
- [ ] Guilds & forums
- [ ] Posts & feed algorithm
- [ ] Missions & gamification (streaks, badges, leaderboards)
- [ ] Chat & voice rooms
- [ ] Creator studio (basic)

### Phase 3: Immersion (Post-Phase 2)
- [ ] WebXR/Three.js worlds
- [ ] Media player with fallbacks
- [ ] LITBIT wallet
- [ ] Streaming integration

### Phase 4: Economy (Post-Phase 3)
- [ ] Marketplace (buy/sell/bid)
- [ ] DAO & governance
- [ ] Staking & advanced wallet

### Phase 5: Expansion (Post-Phase 4)
- [ ] Grok API integration for Copilot v2/v3
- [ ] Developer API & SDK
- [ ] Plugin ecosystem
- [ ] Advanced automation

---

## 🧪 Testing Phase 1

### Manual Testing Checklist
- [ ] Sign up as new user (check onboarding flow)
- [ ] Log in with existing email
- [ ] Navigate between pages (check nav active state)
- [ ] Use Copilot dock (try "create", "earn", "explore" keywords)
- [ ] Check responsive design (mobile, tablet, desktop)
- [ ] Upgrade tier prompt visibility (free tier only)
- [ ] Session persistence (refresh page, should stay logged in)

### Mock Data
- Auth: Any email/password combo works (demo mode)
- Copilot: Responds to keywords (create, earn, explore)
- Explore: Shows 6 mock cards (real data in Phase 2)

---

## 🚨 Known Limitations & TODOs

### Auth (Phase 1)
- [ ] Password hashing (use bcrypt in production)
- [ ] Real database integration (currently in-memory mock)
- [ ] Email verification
- [ ] Password reset flow
- [ ] OAuth/Social login (Discord, GitHub, etc.)

### Copilot (Phase 1)
- [ ] Grok API integration (Phase 5)
- [ ] Memory/context persistence across sessions
- [ ] Autonomous workflows
- [ ] Multi-modal (voice, images, 3D)
- [ ] Plugin chaining

### Features (Future Phases)
- [ ] Worlds/XR (Phase 3)
- [ ] Media streaming (Phase 3)
- [ ] Marketplace (Phase 4)
- [ ] DAO/Governance (Phase 4)
- [ ] Developer ecosystem (Phase 5)

---

## 📚 Code Examples

### Using Auth in Components
```jsx
import { useAuth } from '../hooks/useAuth'

function MyComponent() {
  const { user, tier, logout } = useAuth()

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <p>Tier: {tier}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Adding a New Page
```jsx
// 1. Create page file
// app/src/pages/MyPage.jsx

import React from 'react'
import { useAuth } from '../hooks/useAuth'
import '../styles/MyPage.css'

export default function MyPage() {
  const { user } = useAuth()
  return <div>...</div>
}

// 2. Import and add route in App.jsx
import MyPage from './pages/MyPage'

// In Routes:
<Route path="/mypage" element={<MyPage />} />

// 3. Add navigation link (optional)
// In components/Navigation.jsx navItems array
{ label: 'My Page', path: '/mypage', icon: '📄' }
```

### Calling an API Endpoint
```jsx
const response = await fetch('/api/copilot/prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'How do I create?',
    userId: user.id,
    tier: 'free'
  })
})
const data = await response.json()
console.log(data.response)
```

---

## 📞 Support & Next Steps

### For Developers
1. **Clone/Fork:** Get the repo, install dependencies
2. **Review Blueprint:** See `README.md` root directory for full PRD
3. **Start Phase 2:** Focus on community features (guilds, missions, posts)
4. **Feedback:** Report issues, suggest improvements

### For Users (Beta Testers)
1. **Sign up** at the landing page
2. **Complete onboarding** to set Copilot preferences
3. **Explore features:** Homebase, Explore, Copilot
4. **Report feedback:** What works? What's missing?

---

## 🎉 Thank You!

You're now running **LiTreeLabStudio™ Phase 1**. This is just the beginning. The blueprint includes 5 full phases, reaching from MVP to a complete AI-powered ecosystem for creators, gamers, and communities.

**Next milestone:** Phase 2 (Community features) + user testing feedback.

---

**Last Updated:** December 21, 2025  
**Phase:** 1 (MVP)  
**Status:** 🚀 Ready for Testing
