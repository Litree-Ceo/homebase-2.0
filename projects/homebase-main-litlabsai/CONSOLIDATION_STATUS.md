# 🎯 ONE UNIFIED WEBSITE - CONSOLIDATION STATUS

**Date:** 2026-02-06  
**Status:** In Progress  
**Base Project:** `github/apps/web` (31 pages, auth, profiles, routing)

---

## ✅ Completed

1. ✅ Scanned workspace and identified all 12 projects
2. ✅ Restored all archived projects
3. ✅ Updated workspace configuration
4. ✅ Fixed Avatar3D.tsx component (wrapped children in fragment)
5. ✅ Fixed next.config.js (removed deprecated eslint option)
6. ✅ Created consolidation plan
7. ✅ Committed and pushed changes to GitLab

---

## 🚧 Current Issues

### Web Project Build Issues

The `github/apps/web` project has build issues:

1. **Firebase Module Resolution**
   - **Status: ✅ Fixed** (Updated `firebase.ts` and validated `.env.local` credentials)

2. **Next.js Version Conflict**
   - **Status: ✅ Fixed** (Using `pnpm.overrides` and local `pnpm build`)

3. **Payment Integration Blocker**
   - **Status: ⚠️ Pending**
   - Issue: User reported inability to merge due to payment system dependencies.
   - Action: Need to carefully migrate payment logic from `honey-comb-home` or `litmaster1`.

---

## 📋 Consolidation Plan

### Phase 1: Fix Web Project Build (CURRENT)
- [x] Fix Firebase module resolution
- [x] Resolve Next.js version conflict
- [x] Ensure web project builds successfully

### Phase 1.5: Resolve Payment Blocker
- [ ] Audit payment dependencies in `honey-comb-home`
- [ ] Migrate Stripe/Coinbase config to `web`
- [ ] Verify payment flows in isolation

### Phase 2: Add AI Features
- [ ] Copy AI chat from `github/apps/labs-ai`
- [ ] Copy embeddings from `github/apps/genkit-rag`
- [ ] Copy RAG retrieval from `github/apps/genkit-rag`
- [ ] Integrate Genkit
- [ ] Add AI routes/pages

### Phase 3: Add Metaverse Features
- [ ] Copy video player from `github/apps/litreelab-studio-metaverse`
- [ ] Copy social feed from `github/apps/litreelab-studio-metaverse`
- [ ] Copy worlds from `github/apps/litlabs`
- [ ] Copy Cortex AI from `github/apps/litree-unified`
- [ ] Copy Builder tools from `github/apps/litree-unified`
- [ ] Add metaverse routes/pages

### Phase 4: Add Trading Features
- [ ] Copy trading dashboard from `github/apps/litmaster1`
- [ ] Copy charts from `github/apps/litmaster1`
- [ ] Copy real-time data from `github/apps/litreelab-studio-metaverse`
- [ ] Add trading routes/pages

### Phase 5: Add Marketplace
- [ ] Copy marketplace from `github/apps/litlabs`
- [ ] Copy asset browsing from `github/apps/litree-unified`
- [ ] Integrate payments from `github/apps/honey-comb-home`
- [ ] Add marketplace routes/pages

### Phase 6: Add Media & Social
- [ ] Copy media center from `github/apps/litree-unified`
- [ ] Copy social features from `github/apps/litreelab-studio-metaverse`
- [ ] Copy activity tracking
- [ ] Add media/social routes/pages

### Phase 7: Add Admin Panel
- [ ] Copy admin panel from `github/apps/litreelabsfirebase`
- [ ] Copy user management from `github/apps/litreelabsfirebase`
- [ ] Copy content moderation from `github/apps/litreelabsfirebase`
- [ ] Add admin routes/pages

### Phase 8: Add Backend Services
- [ ] Copy Agent Zero API to `github/api`
- [ ] Copy MCP server to `github/api`
- [ ] Set up WebSocket support
- [ ] Integrate Firebase

### Phase 9: Cleanup
- [ ] Remove all other projects (keep only `github/apps/web`)
- [ ] Archive reference code
- [ ] Update documentation
- [ ] Clean up dependencies

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
11. `github/apps/website-project` - Legacy Vite app
12. `github/apps/litreestudio` - Duplicate features

### Keep Only:
- `github/apps/web` - ONE unified website
- `github/api` - Backend API
- `github/packages/core` - Shared utilities

---

## 📊 Progress

| Phase | Status | Progress |
|--------|---------|----------|
| Phase 1: Fix Web Project Build | 🚧 In Progress | 0% |
| Phase 2: Add AI Features | ⏳ Pending | 0% |
| Phase 3: Add Metaverse Features | ⏳ Pending | 0% |
| Phase 4: Add Trading Features | ⏳ Pending | 0% |
| Phase 5: Add Marketplace | ⏳ Pending | 0% |
| Phase 6: Add Media & Social | ⏳ Pending | 0% |
| Phase 7: Add Admin Panel | ⏳ Pending | 0% |
| Phase 8: Add Backend Services | ⏳ Pending | 0% |
| Phase 9: Cleanup | ⏳ Pending | 0% |

**Overall Progress:** 0% complete

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

## 📝 Next Steps

1. **Fix web project build issues**
   - Resolve Firebase module resolution
   - Fix Next.js version conflict

2. **Start consolidation**
   - Begin Phase 2: Add AI Features
   - Proceed systematically through all phases

3. **Test integration**
   - Ensure all features work together
   - Test all routes and pages

4. **Cleanup**
   - Remove unwanted projects
   - Update documentation

---

**Last Updated:** 2026-02-06  
**Status:** 🚧 In Progress - Fixing web project build issues
