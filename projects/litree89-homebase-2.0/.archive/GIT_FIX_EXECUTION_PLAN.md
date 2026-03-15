# GIT FIX EXECUTION PLAN
# This document outlines all Git fixes that will be applied to HomeBase 2.0

## CURRENT STATE ANALYSIS

### Repository: HomeBase 2.0
- Main branch: `main`
- Remote: `origin` (https://github.com/LiTree89/HomeBase-2.0.git)
- Submodule: EverythingHomebase (https://github.com/LiTree89/EverythingHomebase.git)
- Index lock: **NOT PRESENT** ✓
- Git Config Status:
  - core.autocrlf = input ✓
  - core.safecrlf = false ✓
  - User configured ✓

### Issues Identified in Original Request
1. ❓ LF/CRLF conversion warnings - **ALREADY FIXED** (config is correct)
2. ❓ index.lock error - **NOT PRESENT** (no action needed)
3. ❓ Repository conflicts - **CHECKING**
4. ❓ Submodule tracking issues - **CHECKING**
5. ❓ Commit cleanup - **TO BE DONE**

---

## ACTIONS TO EXECUTE

### STEP 1: Normalize Line Endings Across Repository
```bash
# This ensures all files follow .gitattributes rules
cd "e:\VSCode\HomeBase 2.0"

# Remove index to force re-scan
rm .git/index

# Re-stage all files (Git will apply correct line endings)
git reset --quiet
git add -A

# Check what would be committed
git status

# Commit if changes
git commit -m "fix: normalize line endings per .gitattributes"
```

**Expected Result:** Files with CRLF endings (if any) will be converted to LF as per .gitattributes rules

---

### STEP 2: Verify and Update Submodule
```bash
cd "e:\VSCode\HomeBase 2.0"

# Initialize submodule (idempotent - safe to run again)
git submodule update --init --recursive

# Check submodule status
git submodule status

# Navigate to submodule
cd EverythingHomebase

# Verify current branch
git branch

# Ensure on Main branch (note capital M)
git checkout Main

# Pull latest changes
git pull origin Main

# Return to main repo
cd ..
```

**Expected Result:**
- Submodule is synced to latest Main branch
- Both repos are tracking origin correctly

---

### STEP 3: Clean Up Repository
```bash
cd "e:\VSCode\HomeBase 2.0"

# Remove any dangling objects
git gc --aggressive

# Prune old references
git prune

# Verify filesystem integrity
git fsck --full
```

**Expected Result:** Repository is optimized and clean

---

### STEP 4: Verify Everything Before Push
```bash
cd "e:\VSCode\HomeBase 2.0"

# Full status check
git status

# See unpushed commits
git log origin/main..main

# Check submodule status
git submodule status

# List all remotes
git remote -v
```

**Expected Result:** Clear understanding of what will be pushed

---

### STEP 5: Push to Origin
```bash
cd "e:\VSCode\HomeBase 2.0"

# Push main repository
git push -u origin main

# Push submodule changes
cd EverythingHomebase
git push -u origin Main
cd ..

# Alternative: push with submodule check
git push --recurse-submodules=on-demand
```

**Expected Result:**
- Main repository pushed to origin/main
- Submodule pushed to origin/Main
- GitHub shows latest commits

---

### STEP 6: Verify Successful Push
```bash
cd "e:\VSCode\HomeBase 2.0"

# Check local vs remote
git log --oneline -3
git log --oneline origin/main -3

# Verify submodule push
cd EverythingHomebase
git log --oneline -3
git log --oneline origin/Main -3
cd ..

# Fetch latest to sync
git fetch origin
```

**Expected Result:** Local and remote are in sync

---

## AUTOMATED FIX SCRIPT (PowerShell)

```powershell
# Run this in PowerShell as Administrator

$repoPath = "e:\VSCode\HomeBase 2.0"
Set-Location $repoPath

Write-Host "Starting Git Comprehensive Fix..." -ForegroundColor Cyan

# Step 1: Remove index to normalize line endings
Write-Host "`n[1/6] Normalizing line endings..." -ForegroundColor Yellow
Remove-Item ".git\index" -Force -ErrorAction SilentlyContinue
git reset --quiet
git add -A

# Step 2: Commit if changes exist
Write-Host "[2/6] Checking for changes to commit..." -ForegroundColor Yellow
$status = git status --porcelain
if ($status) {
    git commit -m "fix: normalize line endings"
    Write-Host "✓ Committed line ending changes" -ForegroundColor Green
} else {
    Write-Host "✓ No changes to commit" -ForegroundColor Green
}

# Step 3: Update submodule
Write-Host "`n[3/6] Updating submodule..." -ForegroundColor Yellow
git submodule update --init --recursive
Write-Host "✓ Submodule initialized and updated" -ForegroundColor Green

# Step 4: Sync submodule to remote
Write-Host "`n[4/6] Syncing submodule to latest..." -ForegroundColor Yellow
Push-Location EverythingHomebase
git checkout Main
git pull origin Main
Pop-Location
Write-Host "✓ Submodule synced" -ForegroundColor Green

# Step 5: Clean repository
Write-Host "`n[5/6] Cleaning repository..." -ForegroundColor Yellow
git gc --aggressive
git prune
Write-Host "✓ Repository cleaned" -ForegroundColor Green

# Step 6: Final status
Write-Host "`n[6/6] Final status check..." -ForegroundColor Yellow
git status
Write-Host "`n✓ Fix Complete!" -ForegroundColor Green
Write-Host "`nNext: Push to origin with: git push -u origin main" -ForegroundColor Cyan
```

---

## EXPECTED OUTCOME

After all steps:
- ✓ No index.lock errors
- ✓ All line endings normalized to LF
- ✓ Submodule properly tracked
- ✓ Repository optimized
- ✓ All changes pushed to GitHub
- ✓ Remote is in sync with local

---

## TROUBLESHOOTING

### If "fatal: The following untracked working tree files would be overwritten"
```bash
git clean -fd
git reset --hard
```

### If submodule branch doesn't match
```bash
cd EverythingHomebase
git fetch origin
git checkout -b Main origin/Main
cd ..
git add EverythingHomebase
git commit -m "fix: submodule tracking"
```

### If push is rejected
```bash
# Pull first to get latest
git pull origin main

# Resolve any conflicts if needed
# Then push again
git push -u origin main
```

### If submodule is corrupted
```bash
# Reinitialize submodule
git submodule deinit -f EverythingHomebase
git rm -f EverythingHomebase
git submodule add https://github.com/LiTree89/EverythingHomebase.git EverythingHomebase
git submodule update --init --recursive
```

---

## FILES INVOLVED

- `.git/config` - Git configuration (already optimal)
- `.gitattributes` - Line ending rules (already configured)
- `.gitmodules` - Submodule configuration (already configured)
- `EverythingHomebase/` - Submodule directory
- `.git/modules/EverythingHomebase/` - Submodule tracking info

---

**Status: Ready for Execution**
**Last Updated: 2026-01-02**
