# SAFE BACKUP & RECOVERY PLAN
# Protects your changes before running any optimization

Write-Host "
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║              🛡️  SAFE BACKUP & RECOVERY PROCEDURE                         ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Step 1: Check for uncommitted changes
Write-Host "`n📋 Step 1: Checking for uncommitted changes..." -ForegroundColor Yellow

$status = git status --porcelain
if ($status) {
    Write-Host "  ⚠️  Found uncommitted changes:" -ForegroundColor Yellow
    $status | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    
    Write-Host "`n  DO NOT RUN OPTIMIZATION YET!" -ForegroundColor Red
    Write-Host "  Follow these steps first:" -ForegroundColor Yellow
    Write-Host "
  1. COMMIT YOUR CHANGES:
     git add .
     git commit -m 'Your commit message'
     
  2. OR STASH YOUR CHANGES:
     git stash
     
  3. THEN RUN OPTIMIZATION:
     .\SYSTEM_OPTIMIZATION.ps1
     
  4. IF NEEDED, RESTORE CHANGES:
     git stash pop
" -ForegroundColor Cyan
    exit 1
}

Write-Host "  ✓ No uncommitted changes found" -ForegroundColor Green

# Step 2: Create backup branch
Write-Host "`n📦 Step 2: Creating backup branch..." -ForegroundColor Yellow

$branch = git rev-parse --abbrev-ref HEAD
$backupBranch = "backup/pre-optimization-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"

git branch $backupBranch
Write-Host "  ✓ Created backup branch: $backupBranch" -ForegroundColor Green

# Step 3: Show recovery commands
Write-Host "
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                    🔄 RECOVERY COMMANDS (IF NEEDED)                       ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

If something goes wrong, use these commands:

  # View all backup branches
  git branch -a | grep backup

  # Switch to backup branch
  git checkout $backupBranch

  # Reset to backup
  git reset --hard $backupBranch

  # Delete backup branch (when safe)
  git branch -d $backupBranch

" -ForegroundColor Cyan

# Step 4: Ready to proceed
Write-Host "
✅ BACKUP COMPLETE - SAFE TO PROCEED

Your changes are protected. You can now safely run:

  .\SYSTEM_OPTIMIZATION.ps1

If anything goes wrong, you can recover with:

  git checkout $backupBranch

" -ForegroundColor Green
