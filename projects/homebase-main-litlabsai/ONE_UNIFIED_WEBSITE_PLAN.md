# 🎯 ONE UNIFIED WEBSITE PLAN

**Date:** 2026-02-06  
**Goal:** Consolidate ALL projects into ONE single website

---

## 📊 Current Situation

### ❌ Problem: Multiple Separate Websites

You currently have **12 separate projects/websites** in your workspace:

| # | Project | Type | Pages | Status |
|---|---------|------|-------|--------|
| 1 | `github/apps/web` | Next.js | 31 | ✅ Active |
| 2 | `github/apps/labs-ai` | Next.js | ~20 | ✅ Active |
| 3 | `github/apps/litlabs` | Next.js | 12 | ✅ Active |
| 4 | `github/apps/agent-zero` | API | - | ✅ Active |
| 5 | `github/apps/litreelab-studio-metaverse` | Next.js | - | ✅ Active |
| 6 | `github/apps/litree-unified` | Next.js | 22 | ✅ Active |
| 7 | `github/apps/litmaster1` | Next.js | - | ✅ Active |
| 8 | `github/apps/litreelabsfirebase` | Next.js | 70 | ✅ Active |
| 9 | `github/apps/honey-comb-home` | Next.js | - | ✅ Active |
| 10 | `github/apps/genkit-rag` | Next.js | - | ✅ Active |
| 11 | `github/apps/honeycomb-blueprint` | Next.js | - | ✅ Active |
| 12 | `github/apps/website-project` | Vite | - | ✅ Active |

**Total:** 12 separate projects/websites

---

## ✅ Solution: ONE Unified Website

### 🎯 Goal

Create **ONE single website** that includes ALL features from ALL projects.

### 🏗️ Architecture

```
ONE WEBSITE: github/apps/web (Main)
├── All features from all 12 projects merged into this ONE website
├── Single domain/URL
├── Single build/deploy
└── Single codebase
```

---

## 📋 Which Project Should Be the Base?

### Option 1: Use `github/apps/web` as Base (RECOMMENDED)

**Why:**
- ✅ Already has 31 pages
- ✅ Most complete routing structure
- ✅ Already has authentication
- ✅ Already has user profiles
- ✅ Already has navigation
- ✅ Already has layout system

**Features to Add:**
- AI features (from labs-ai, genkit-rag)
- Metaverse features (from litreelab-studio-metaverse, litree-unified)
- Trading features (from litmaster1)
- Marketplace (from litlabs, litree-unified)
- Media center (from litree-unified)
- Social features (from litreelab-studio-metaverse, litree-unified)
- Admin panel (from litreelabsfirebase)
- Payment integration (from honey-comb-home, litreelabsfirebase)

### Option 2: Use `github/apps/litreelabsfirebase` as Base

**Why:**
- ✅ Has 70 pages (most complete)
- ✅ Already has Firebase integration
- ✅ Already has payment system
- ✅ Already has admin panel
- ✅ Already has MCP server

**Features to Add:**
- AI features (from labs-ai, genkit-rag)
- Metaverse features (from litreelab-studio-metaverse, litree-unified)
- Trading features (from litmaster1)
- Marketplace (from litlabs, litree-unified)

### Option 3: Use `github/apps/litree-unified` as Base

**Why:**
- ✅ Has 22 pages
- ✅ Already has unified dashboard
- ✅ Already has Cortex AI
- ✅ Already has Builder tools
- ✅ Already has Flash features

**Features to Add:**
- AI features (from labs-ai, genkit-rag)
- Metaverse features (from litreelab-studio-metaverse)
- Trading features (from litmaster1)
- Payment integration (from honey-comb-home, litreelabsfirebase)
- Admin panel (from litreelabsfirebase)

---

## 🚀 Recommended Approach: Option 1 (github/apps/web)

### Why This is Best:

1. **Already has the most complete structure**
   - 31 pages already built
   - Complete routing system
   - Authentication system
   - User profiles
   - Navigation
   - Layout system

2. **Easiest to extend**
   - Just add new routes/pages
   - Just add new components
   - Just add new features

3. **Cleanest codebase**
   - Already well-organized
   - Already has good structure
   - Already has good documentation

---

## 📝 Consolidation Steps

### Phase 1: Prepare Base Website
1. ✅ Use `github/apps/web` as the base
2. ✅ Ensure it builds successfully
3. ✅ Fix any build errors

### Phase 2: Add AI Features
1. Copy AI chat components from `github/apps/labs-ai`
2. Copy embeddings functions from `github/apps/genkit-rag`
3. Copy RAG retrieval from `github/apps/genkit-rag`
4. Integrate Genkit
5. Add AI routes/pages

### Phase 3: Add Metaverse Features
1. Copy video player from `github/apps/litreelab-studio-metaverse`
2. Copy social feed from `github/apps/litreelab-studio-metaverse`
3. Copy worlds from `github/apps/litlabs`
4. Copy Cortex AI from `github/apps/litree-unified`
5. Copy Builder tools from `github/apps/litree-unified`
6. Add metaverse routes/pages

### Phase 4: Add Trading Features
1. Copy trading dashboard from `github/apps/litmaster1`
2. Copy charts from `github/apps/litmaster1`
3. Copy real-time data from `github/apps/litreelab-studio-metaverse`
4. Add trading routes/pages

### Phase 5: Add Marketplace
1. Copy marketplace from `github/apps/litlabs`
2. Copy asset browsing from `github/apps/litree-unified`
3. Integrate payments from `github/apps/honey-comb-home`
4. Add marketplace routes/pages

### Phase 6: Add Media & Social
1. Copy media center from `github/apps/litree-unified`
2. Copy social features from `github/apps/litreelab-studio-metaverse`
3. Copy activity tracking
4. Add media/social routes/pages

### Phase 7: Add Admin Panel
1. Copy admin panel from `github/apps/litreelabsfirebase`
2. Copy user management from `github/apps/litreelabsfirebase`
3. Copy content moderation from `github/apps/litreelabsfirebase`
4. Add admin routes/pages

### Phase 8: Add Backend Services
1. Copy Agent Zero API to `github/api`
2. Copy MCP server to `github/api`
3. Set up WebSocket support
4. Integrate Firebase

### Phase 9: Cleanup
1. Remove all other projects (keep only `github/apps/web`)
2. Archive reference code
3. Update documentation
4. Clean up dependencies

---

## 🗑️ Projects to Remove

### Remove Completely (after consolidation):
1. `github/apps/labs-ai` - Features merged into web
2. `github/apps/litlabs` - Features merged into web
3. `github/apps/agent-zero` - API merged into github/api
4. `github/apps/litreelab-studio-metaverse` - Features merged into web
5. `github/apps/litree-unified` - Features merged into web
6. `github/apps/litmaster1` - Features merged into web
7. `github/apps/litreelabsfirebase` - Features merged into web
8. `github/apps/honey-comb-home` - Features merged into web
9. `github/apps/genkit-rag` - Features merged into web
10. `github/apps/honeycomb-blueprint` - Documentation only
11. `github/apps/website-project` - Legacy
12. `github/apps/litreestudio` - Duplicate features

### Keep Only:
- `github/apps/web` - ONE unified website
- `github/api` - Backend API
- `github/packages/core` - Shared utilities

---

## 🎯 Final Structure

```
homebase-2.0/
├── github/
│   ├── apps/
│   │   └── web/                    # ONE UNIFIED WEBSITE
│   │       ├── app/
│   │       │   ├── (auth)/         # Authentication
│   │       │   ├── (dashboard)/     # Main dashboard
│   │       │   ├── (ai)/            # AI features
│   │       │   ├── (metaverse)/     # Metaverse features
│   │       │   ├── (trading)/      # Trading features
│   │       │   ├── (marketplace)/   # Marketplace
│   │       │   ├── (media)/         # Media center
│   │       │   ├── (social)/        # Social features
│   │       │   └── (admin)/         # Admin panel
│   │       ├── components/
│   │       │   ├── shared/          # Shared UI components
│   │       │   ├── ai/              # AI components
│   │       │   ├── metaverse/       # Metaverse components
│   │       │   ├── trading/         # Trading components
│   │       │   └── 3D/              # 3D components
│   │       └── lib/
│   │           ├── firebase/        # Firebase config
│   │           ├── api/             # API client
│   │           └── utils/           # Utilities
│   ├── api/                         # Backend API
│   │   ├── agent-zero/              # AI Agent API
│   │   ├── mcp-server/              # MCP server
│   │   └── functions/               # Azure Functions
│   └── packages/
│       └── core/                    # Shared utilities
└── litlabs/                         # Remove (features merged)
```

---

## ❓ Questions for You

1. **Which project should be the base for the ONE unified website?**
   - Option 1: `github/apps/web` (RECOMMENDED)
   - Option 2: `github/apps/litreelabsfirebase`
   - Option 3: `github/apps/litree-unified`

2. **Do you want me to proceed with consolidation?**
   - Yes: I'll start consolidating all projects into ONE website
   - No: I'll wait for your decision

3. **Should I remove all other projects after consolidation?**
   - Yes: Keep only ONE website
   - No: Keep them archived for reference

---

## 🚀 Next Steps

1. **Choose base project** (I recommend `github/apps/web`)
2. **Confirm consolidation approach**
3. **Start merging features**
4. **Test integration**
5. **Remove unwanted projects**
6. **Update documentation**

---

**Last Updated:** 2026-02-06  
**Status:** ⏳ Awaiting your decision
