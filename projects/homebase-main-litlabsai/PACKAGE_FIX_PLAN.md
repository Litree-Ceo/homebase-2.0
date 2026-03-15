# 📦 Package.json Configuration Fix Plan

**Date:** 2026-02-06  
**Status:** Analysis Complete  
**Target:** Resolve dependency conflicts across all projects

---

## 🎯 Issues Identified

### 1. React Version Mismatch
**Current State:**
- Root: React 18.3.1
- Web App: React 18.3.1 (✅ Good)
- Litlabs: React 18.3.1 (✅ Good)

### 2. TypeScript Version Mismatch
**Current State:**
- Root: TypeScript 5
- Web App: TypeScript 5.9.3
- Litlabs: TypeScript 5

### 3. React Three Versions Mismatch
**Current State:**
- Root: @react-three/drei 10.7.7
- Web App: @react-three/drei 9.103.0
- Litlabs: @react-three/drei 9.122.0

### 4. Next.js Version Mismatch
**Current State:**
- All projects: Next.js 14.2.16 (✅ Good)

---

## 📋 Fix Plan

### Phase 1: Standardize Core Dependencies

#### 1.1 Fix TypeScript Version
**Action:** Update all projects to use TypeScript 5.9.3

**Files to Modify:**
- Root `package.json` - Update TypeScript to 5.9.3
- `github/apps/web/package.json` - Already 5.9.3 (✅ Good)
- `litlabs/package.json` - Update TypeScript to 5.9.3

#### 1.2 Fix React Three Versions
**Action:** Standardize @react-three/drei to latest compatible version

**Target Version:** @react-three/drei 10.7.7 (latest)

**Files to Modify:**
- `github/apps/web/package.json` - Update @react-three/drei to 10.7.7
- `litlabs/package.json` - Update @react-three/drei to 10.7.7

### Phase 2: Optimize Dependencies

#### 2.1 Remove Duplicate Dependencies
**Action:** Remove duplicate dependencies from root package.json

**Current Root Dependencies:**
- @react-three/drei: 10.7.7
- @react-three/fiber: 9.5.0

**Action:** Remove these from root since they're project-specific

#### 2.2 Add Workspace Dependencies
**Action:** Add workspace dependencies to root package.json

**Dependencies to Add:**
- @homebase/web (workspace dependency)
- litlabs (workspace dependency)

### Phase 3: Update Workspace Configuration

#### 3.1 Fix pnpm-workspace.yaml
**Action:** Remove non-existent packages and add missing ones

**Current Issues:**
- `website-project` doesn't exist in expected location
- Missing `github/apps/agent-zero`

**Fix:**
```yaml
packages:
  - 'github'
  - 'litlabs'
  - 'github/api'
  - 'github/apps/*'
  - 'github/packages/*'
```

---

## 📊 Expected Outcomes

### After Phase 1:
- ✅ Consistent TypeScript version (5.9.3) across all projects
- ✅ Consistent React Three versions (10.7.7)
- ✅ No dependency conflicts

### After Phase 2:
- ✅ Optimized root dependencies
- ✅ Proper workspace dependency management
- ✅ Clean package.json structure

### After Phase 3:
- ✅ Working workspace configuration
- ✅ All projects properly linked
- ✅ No broken references

---

## ⚠️ Risks & Mitigations

### Risk 1: Breaking Changes
**Mitigation:** Test builds after each change, use version ranges

### Risk 2: Dependency Conflicts
**Mitigation:** Use pnpm's resolution features, test thoroughly

### Risk 3: Build Failures
**Mitigation:** Test builds incrementally, rollback if needed

---

## 🚀 Implementation Steps

### Step 1: Update TypeScript Versions
1. Update root package.json TypeScript to 5.9.3
2. Update litlabs package.json TypeScript to 5.9.3

### Step 2: Standardize React Three Versions
1. Update github/apps/web @react-three/drei to 10.7.7
2. Update litlabs @react-three/drei to 10.7.7

### Step 3: Optimize Root Dependencies
1. Remove project-specific dependencies from root
2. Add workspace dependencies

### Step 4: Fix Workspace Configuration
1. Update pnpm-workspace.yaml
2. Verify all paths exist

---

## 📈 Success Metrics

### Technical Metrics:
- ✅ All builds pass without errors
- ✅ No dependency conflicts
- ✅ Consistent dependency versions
- ✅ Working workspace configuration

### Developer Experience:
- ✅ Clean package.json structure
- ✅ Proper dependency management
- ✅ Optimized workspace setup

---

**Plan Generated:** 2026-02-06  
**Next Review:** After implementation  
**Implementation Ready:** Yes