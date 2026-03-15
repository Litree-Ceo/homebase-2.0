# 🏗️ Workspace Enhancement Plan

## 📊 Current State Analysis

### Root Directory Clutter
Your root directory has **15+ PowerShell scripts** and multiple documentation files that should be organized.

### Projects Identified

| Project | Location | Status | Priority |
|---------|----------|--------|----------|
| **Main Web App** | `github/apps/web` | ✅ Building | HIGH |
| **Litlabs** | `litlabs/` | ✅ Building | HIGH |
| **Litlabs Web** | `github/apps/litlabs-web` | ✅ Building | MEDIUM |
| **Litree Unified** | `github/apps/litree-unified` | ✅ Building | MEDIUM |
| **Labs AI** | `github/apps/labs-ai` | ✅ Building | MEDIUM |
| **Litree Firebase** | `github/apps/litreelabsfirebase` | ✅ Building | LOW |
| **Litree Studio** | `github/apps/litreestudio` | ✅ Building | LOW |
| **Genkit RAG** | `github/apps/genkit-rag` | ⚠️ Has issues | LOW |
| **Honeycomb Home** | `github/apps/honey-comb-home` | ✅ Building | LOW |
| **Honeycomb Blueprint** | `github/apps/honeycomb-blueprint` | ✅ Building | LOW |
| **Agent Zero** | `github/apps/agent-zero` | ✅ Web API Ready | MEDIUM |
| **Litmaster1** | `github/apps/litmaster1` | ❓ Unknown | LOW |

### Issues Found

1. **Root Clutter**: 15+ .ps1 files, multiple logs, duplicate backups
2. **Documentation Sprawl**: 10+ MD files in root
3. **Duplicate Backups**: `_duplicates_backup_*` folders (2+ GB likely)
4. **Orphaned Scripts**: Many setup scripts for tools not actively used

---

## 🎯 Enhancement Plan

### Phase 1: Root Directory Cleanup

#### Move to `scripts/` Directory:
```
Current Root → scripts/
- cleanup-and-optimize.ps1
- cleanup.ps1
- consolidate_repo.ps1
- find-duplicates.ps1
- new_profile.ps1
- run.ps1
- set-openclaw-token.ps1
- setup-firebase-mcp.ps1
- setup-openclaw-telegram.ps1
- setup.ps1
- start-chrome-debug.ps1
- start-dev.ps1
- test-setup-openclaw.ps1
```

#### Move to `docs/` Directory:
```
Current Root → docs/
- COMPLETE_FIXES_REPORT.md
- FIXES-SUMMARY.md
- GIT-SYNC-README.md
- OPENCLAW_SETUP.md
- PROJECT_BLUEPRINT.md
- PROJECT_OVERVIEW_WITH_TRAE.md
- QUICK_START.md
- REPO-CONSOLIDATION-SUMMARY.md
- SECURITY_HARDENING_CHANGES.md
- START_HERE_TRAE.md
- SYSTEM_DIAGNOSIS.md
- TRAE_ARCHITECTURE.md
- TRAE_FIXES_COMPLETE.md
- TRAE_INTEGRATION_GUIDE.md
- TRAE_QUICK_FIX.md
```

#### Delete:
- `duplicate_scan_log_*.txt` (old scan results)
- `_duplicates_backup_*` (cleanup after verification)
- `v0.86.1` (empty file)

### Phase 2: Consolidate Documentation

Create **ONE** master README that links to everything:

```markdown
# HomeBase 2.0 - Master Index

## Quick Start
- [Setup Guide](docs/QUICK_START.md)
- [Architecture](docs/TRAE_ARCHITECTURE.md)

## Development
- [Main Web App](github/apps/web/README.md)
- [Litlabs](litlabs/README.md)
- [API](github/api/README.md)

## Tools
- [Git Sync](scripts/Unified-Git-Sync.ps1)
- [Agent Zero](github/apps/agent-zero/AGENT_ZERO_SETUP.md)
- [OpenClaw](docs/OPENCLAW_SETUP.md)
```

### Phase 3: Optimize Build System

#### Create `package.json` scripts at root:
```json
{
  "scripts": {
    "dev:web": "cd github && pnpm dev",
    "dev:litlabs": "cd litlabs && pnpm dev",
    "dev:all": "concurrently \"pnpm dev:web\" \"pnpm dev:litlabs\"",
    "build:all": "cd github && pnpm build && cd ../litlabs && pnpm build",
    "start:agent-zero": "cd github/apps/agent-zero && docker-compose up -d",
    "start:openclaw": "openclaw start",
    "sync:git": "./Unified-Git-Sync.ps1 -Push",
    "cleanup": "./scripts/cleanup.ps1"
  }
}
```

### Phase 4: Create Master Control Script

Create `start-all.ps1`:
```powershell
# Start all development servers
Start-Process powershell -ArgumentList "cd github; pnpm dev" -WindowStyle Normal
Start-Process powershell -ArgumentList "cd litlabs; pnpm dev" -WindowStyle Normal
Start-Process powershell -ArgumentList "cd github/apps/agent-zero; docker-compose up -d" -WindowStyle Normal
```

---

## 🚀 Immediate Actions Needed

### 1. Fix Root Package.json
Create proper root package.json with workspace scripts.

### 2. Clean Up Backups
Verify and remove old duplicate backups.

### 3. Consolidate READMEs
Merge redundant documentation.

### 4. Fix Genkit-RAG Build
Has dependency issues with `@genkit-ai/flow`.

---

## 📈 Website Build Strategy

### To Build Everything:

```powershell
# 1. Build main monorepo
cd github
pnpm build

# 2. Build litlabs separately
cd ../litlabs
pnpm build

# 3. Build Agent Zero Docker image
cd ../github/apps/agent-zero
docker-compose build
```

### Outputs:
- `github/apps/web/.next/` - Main web (31 pages)
- `github/apps/litlabs-web/.next/` - Litlabs web (15 pages)
- `litlabs/.next/` - Litlabs standalone (12 pages)
- `github/api/dist/` - Azure Functions
- `github/apps/agent-zero/` - Docker image

---

## 🔧 Files Needing Rewrite

### High Priority:
1. **README.md** - Consolidate all docs
2. **package.json** (root) - Add proper scripts
3. **setup.ps1** - Modernize for current structure
4. **genkit-rag/package.json** - Fix missing deps

### Medium Priority:
5. **All app READMEs** - Standardize format
6. **docker-compose.yml** (agent-zero) - Remove obsolete version attr
7. **.env files** - Consolidate and document

### Low Priority:
8. **Legacy scripts** - Archive or delete
9. **Old docs** - Archive outdated guides

---

## 📂 Recommended New Structure

```
homebase-2.0/
├── README.md                    ← Master index
├── package.json                 ← Root scripts
├── start-all.ps1               ← Master launcher
├── .env                        ← Global env
│
├── github/                     ← Main monorepo
│   ├── apps/
│   │   ├── web/               ← Main web app ⭐
│   │   ├── litlabs-web/       ← Web platform
│   │   ├── litree-unified/    ← Unified app
│   │   ├── labs-ai/           ← AI platform
│   │   └── agent-zero/        ← AI agent 🤖
│   ├── api/                   ← Azure Functions
│   └── packages/              ← Shared packages
│
├── litlabs/                   ← Standalone Next.js ⭐
│
├── docs/                      ← All documentation
│   ├── setup/
│   ├── architecture/
│   └── guides/
│
├── scripts/                   ← All PowerShell scripts
│   ├── setup/
│   ├── build/
│   └── utils/
│
└── website-project/           ← Legacy (archive?)
```

---

## ⚡ Quick Wins

1. **Move 15 .ps1 files → scripts/** (5 min)
2. **Move 15 .md files → docs/** (5 min)
3. **Create root package.json** (10 min)
4. **Delete old logs** (2 min)
5. **Create master README** (20 min)

**Total time: ~45 minutes for major cleanup**

---

## 🎨 Website Full Build Commands

```powershell
# Build EVERYTHING

# Main projects
cd github && pnpm build
cd ../litlabs && pnpm build

# Agent Zero Docker
cd ../github/apps/agent-zero
docker-compose build

# All builds complete!
```

---

*Analysis Date: 2026-02-03*
*Next Step: Execute Phase 1 cleanup*
