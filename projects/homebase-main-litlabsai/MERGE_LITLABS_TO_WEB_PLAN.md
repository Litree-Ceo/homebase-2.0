# Merge Plan: LitLabs → Main Web App

## Overview
Consolidate `litlabs/` (root) into `github/apps/web/` to create a unified platform.

## Current State

### Main Web App (github/apps/web/)
- **Port**: 3000
- **Framework**: Next.js 16.1.6 + React 19.2.4
- **Features**:
  - Social Feed, Friends, Messages
  - Metaverse (3D Avatar)
  - AI Chat
  - Studio
  - Profile, Settings, Pricing
- **Auth**: Azure MSAL + Custom

### LitLabs (litlabs/)
- **Port**: 3001  
- **Framework**: Next.js 16.1.6 + React 19.2.4
- **Features**:
  - Dashboard
  - Calendar
  - Tasks
  - Notes
  - Files
  - Lab
  - Drops
  - Studio (separate from main)
- **Auth**: Firebase Auth

## Merge Strategy

### Phase 1: Move Files
```
litlabs/src/app/(dashboard)/   → github/apps/web/src/app/(dashboard)/
litlabs/src/app/calendar/      → github/apps/web/src/app/(dashboard)/calendar/
litlabs/src/app/tasks/         → github/apps/web/src/app/(dashboard)/tasks/
litlabs/src/app/notes/         → github/apps/web/src/app/(dashboard)/notes/
litlabs/src/app/files/         → github/apps/web/src/app/(dashboard)/files/
litlabs/src/app/lab/           → github/apps/web/src/app/lab/
litlabs/src/app/drops/         → github/apps/web/src/app/drops/
litlabs/src/components/        → github/apps/web/src/components/dashboard/
litlabs/src/hooks/             → github/apps/web/src/hooks/
litlabs/src/lib/firebase.ts    → github/apps/web/src/lib/firebase.ts
litlabs/src/styles/            → github/apps/web/src/styles/dashboard/
```

### Phase 2: Update Imports
- Update all relative imports to use `@/` aliases
- Merge Firebase config with existing auth
- Update layout.tsx files

### Phase 3: Navigation Integration
Add dashboard link to main navbar:
```tsx
// In github/apps/web/src/components/Navbar.tsx
{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
{ name: 'Lab', href: '/lab', icon: FlaskConical },
{ name: 'Drops', href: '/drops', icon: Package },
```

### Phase 4: Auth Unification
- Migrate LitLabs Firebase auth to use main app's auth system
- OR add Firebase auth as alternative provider
- Update protected routes

### Phase 5: Shared Components
Merge duplicate components:
- Sidebar → Use main app navigation
- MiniCalendar → Keep as dashboard component
- RecentNotes → Keep as dashboard component

## Post-Merge Structure

```
github/apps/web/src/app/
├── (dashboard)/              # New: Dashboard layout + pages
│   ├── layout.tsx
│   ├── page.tsx              # Dashboard home
│   ├── calendar/
│   ├── tasks/
│   ├── notes/
│   └── files/
├── (social)/                 # Existing social features
│   ├── page.tsx              # Home/Feed
│   ├── friends/
│   ├── messages/
│   └── profile/[username]/
├── lab/                      # Merged from litlabs
├── drops/                    # Merged from litlabs
├── ai-chat/                  # Existing
├── metaverse/                # Existing
├── studio/                   # Existing
└── api/                      # All API routes
```

## Checklist

- [ ] Move all litlabs source files
- [ ] Update import paths
- [ ] Merge package.json dependencies
- [ ] Update tsconfig.json paths if needed
- [ ] Integrate navigation
- [ ] Unify auth system
- [ ] Test all dashboard features
- [ ] Test all social features
- [ ] Build and verify
- [ ] Remove litlabs/ root folder
- [ ] Update root package.json scripts

## Commands to Execute

```bash
# Step 1: Copy files
cp -r litlabs/src/app/(dashboard) github/apps/web/src/app/
cp -r litlabs/src/app/calendar github/apps/web/src/app/(dashboard)/
cp -r litlabs/src/app/tasks github/apps/web/src/app/(dashboard)/
cp -r litlabs/src/app/notes github/apps/web/src/app/(dashboard)/
cp -r litlabs/src/app/files github/apps/web/src/app/(dashboard)/
cp -r litlabs/src/app/lab github/apps/web/src/app/
cp -r litlabs/src/app/drops github/apps/web/src/app/
cp -r litlabs/src/components github/apps/web/src/components/dashboard/
cp -r litlabs/src/hooks github/apps/web/src/hooks/
cp -r litlabs/src/lib/* github/apps/web/src/lib/
cp -r litlabs/src/styles github/apps/web/src/styles/dashboard/

# Step 2: Update imports (manual or automated)
# Find: "../components/ → "@/components/dashboard/
# Find: "../lib/ → "@/lib/

# Step 3: Install dependencies
cd github/apps/web
pnpm add firebase firebase-admin firebase-functions

# Step 4: Build and test
pnpm build
```

## Risk Mitigation

1. **Auth Conflict**: Keep both auth systems initially, unify later
2. **Styling Conflict**: LitLabs uses different globals.css - merge carefully
3. **Route Conflicts**: Check for overlapping routes
4. **State Management**: LitLabs may use different state patterns

## After Merge

- Single unified app at port 3000
- All features accessible from one navigation
- Simplified deployment
- Consistent user experience
- Can archive/remove `litlabs/` root folder
