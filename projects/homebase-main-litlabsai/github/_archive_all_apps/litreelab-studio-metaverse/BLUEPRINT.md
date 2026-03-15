# LiTreeLab Studio™ Project Blueprint

## 1. Executive Summary
**LiTreeLab Studio** is a next-generation "Creator Operating System" that unifies three pillars:
1.  **Studio**: Content creation, file management, and drops.
2.  **Metaverse**: 3D social hubs, virtual events, and NFT galleries.
3.  **ProfitPilot**: Automated crypto trading and financial growth tools.

The platform is built on **Next.js 16 (App Router)**, **Tailwind CSS v4**, **Three.js (Fiber/Drei)** for 3D, and **Firebase** for backend/auth/hosting.

---

## 2. Core Architecture

### Tech Stack
*   **Framework**: Next.js 16.1.6 (Turbopack enabled)
*   **Language**: TypeScript 5+
*   **Styling**: Tailwind CSS v4 (CSS-first configuration)
*   **3D Engine**: Three.js + React Three Fiber + Drei
*   **Backend**: Firebase (Auth, Firestore, Storage, Hosting)
*   **State Management**: React Context + Hooks (Zustand for 3D state if needed)
*   **Icons**: Lucide React

### Directory Structure
```
src/
├── app/                  # App Router Pages
│   ├── (ai)/chat/        # AI Chat Interface
│   ├── (metaverse)/hub/  # 3D World Entry
│   ├── (studio)/         # Dashboard & Creator Tools
│   ├── login/            # Authentication Entry
│   └── globals.css       # Tailwind v4 Theme & Variables
├── components/           # Shared UI Components
│   ├── ui/               # Primitives (Button, Card, Input)
│   ├── AgentZeroAvatar   # 3D AI Assistant
│   └── Metaverse*        # 3D World Components
└── lib/                  # Utilities & Config
    └── firebase.tsx      # Firebase Context
```

---

## 3. Features & Modules

### 🤖 Agent Zero (AI Companion)
*   **Role**: Personal assistant for navigation, trading insights, and creation.
*   **Implementation**: 3D interactive avatar (floating widget).
*   **Location**: Persistently available in the bottom-right corner.
*   **Settings**: Toggleable via User Settings.

### � Metaverse Hub
*   **Engine**: Canvas-based WebGL rendering.
*   **Features**:
    *   Multiplayer presence (planned).
    *   Interactive rooms (Creator Spaces, NFT Galleries).
    *   "Scroll-to-explore" landing experience.

### � ProfitPilot
*   **Role**: Automated trading bot integration.
*   **UI**: Live status indicators in Navbar and Dashboard.
*   **Data**: Real-time chart simulations and profit tracking.

### 🔐 Security & Auth
*   **Provider**: Google OAuth via Firebase.
*   **Protection**: `AuthGuard` wrapper for protected routes (`/dashboard`, `/hub`).

---

## 4. Development Roadmap

### Phase 1: Foundation (Completed) ✅
*   [x] Next.js 16 upgrade.
*   [x] Tailwind v4 migration.
*   [x] 3D dependency stabilization.
*   [x] Google Auth integration.

### Phase 2: User Experience (In Progress) 🚧
*   [ ] **Agent Zero Widget**: Move to bottom-right corner.
*   [ ] **Settings Menu**: Add toggle for AI visibility.
*   [ ] **Dashboard Polish**: enhance data visualization.

### Phase 3: Deployment (Pending) ⏳
*   [ ] `firebase deploy`: Push to production.
*   [ ] Domain verification.
*   [ ] Performance optimization (Lazy loading 3D assets).

---

## 5. Deployment Guide
1.  **Build**: `pnpm build` (Generates `.next` output).
2.  **Deploy**: `pnpm deploy` (triggers `firebase deploy`).
3.  **Verify**: Check Firebase Console for hosting URL.
