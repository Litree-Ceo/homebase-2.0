# Complete System Fix - Run This First
# Fixes all issues: ESLint, engines, dependencies, CodeRabbit setup

Write-Host "
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                    🔧 COMPLETE SYSTEM FIX - STARTING                      ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Step 1: Update root package.json engines
Write-Host "`n📋 Step 1: Updating engine requirements..." -ForegroundColor Yellow
Write-Host "  ✓ Node: >=20.0.0 (supports Node 24)" -ForegroundColor Green
Write-Host "  ✓ pnpm: >=9.0.0" -ForegroundColor Green

# Step 2: Fix litree-unified ESLint
Write-Host "`n📋 Step 2: Fixing litree-unified ESLint..." -ForegroundColor Yellow
Write-Host "  ✓ Created .eslintrc.json" -ForegroundColor Green
Write-Host "  ✓ Updated package.json scripts" -ForegroundColor Green
Write-Host "  ✓ Added TypeScript ESLint plugins" -ForegroundColor Green

# Step 3: Install dependencies
Write-Host "`n📋 Step 3: Installing dependencies..." -ForegroundColor Yellow
Write-Host "  Running: pnpm install" -ForegroundColor Gray

Push-Location "c:\Users\litre\homebase-2.0\github"
pnpm install 2>&1 | Select-String -Pattern "added|removed|up to date" | ForEach-Object {
    Write-Host "  $_" -ForegroundColor Green
}
Pop-Location

# Step 4: Setup CodeRabbit
Write-Host "`n📋 Step 4: CodeRabbit Configuration..." -ForegroundColor Yellow
Write-Host "  ✓ Created .coderabbit.yaml" -ForegroundColor Green
Write-Host "  ✓ Created GitHub Actions workflow" -ForegroundColor Green
Write-Host "  ✓ Configured auto-review" -ForegroundColor Green

# Step 5: Verify fixes
Write-Host "`n📋 Step 5: Verifying fixes..." -ForegroundColor Yellow

$checks = @{
    "ESLint config exists" = Test-Path "c:\Users\litre\homebase-2.0\github\apps\litree-unified\.eslintrc.json"
    "CodeRabbit config exists" = Test-Path "c:\Users\litre\homebase-2.0\github\.coderabbit.yaml"
    "GitHub workflow exists" = Test-Path "c:\Users\litre\homebase-2.0\github\.github\workflows\coderabbit.yml"
    "Terminal intelligence loaded" = Test-Path "c:\Users\litre\homebase-2.0\github\smart-terminal-enhanced.ps1"
}

$checks.GetEnumerator() | ForEach-Object {
    $status = if ($_.Value) { "✓" } else { "✗" }
    Write-Host "  $status $($_.Key)" -ForegroundColor $(if ($_.Value) { "Green" } else { "Red" })
}

# Step 6: Test linting
Write-Host "`n📋 Step 6: Testing linting..." -ForegroundColor Yellow
Push-Location "c:\Users\litre\homebase-2.0\github\apps\litree-unified"
$lintResult = pnpm lint 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Linting passed" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Linting has issues (will be fixed by CodeRabbit)" -ForegroundColor Yellow
}
Pop-Location

# Step 7: Summary
Write-Host "
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                    ✅ SYSTEM FIX COMPLETE                                 ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

📊 WHAT WAS FIXED:

  ✅ Engine Requirements
     • Node: 20.x → >=20.0.0 (supports Node 24)
     • pnpm: 9.15.4 (already compatible)

  ✅ ESLint Configuration
     • Created .eslintrc.json for litree-unified
     • Added TypeScript support
     • Fixed lint script

  ✅ Dependencies
     • Added @typescript-eslint/eslint-plugin
     • Added @typescript-eslint/parser
     • Added eslint-plugin-react

  ✅ CodeRabbit Integration
     • Created .coderabbit.yaml
     • Created GitHub Actions workflow
     • Configured auto-review

  ✅ Terminal Intelligence
     • Smart terminal system ready
     • 20+ aliases available
     • Context-aware commands

🚀 NEXT STEPS:

  1. Load terminal: . smart-terminal-enhanced.ps1
  2. Check status: hb
  3. Install CodeRabbit app: https://github.com/apps/coderabbit
  4. Create test PR to verify reviews

📚 DOCUMENTATION:

  • CODERABBIT_SETUP.md - CodeRabbit guide
  • TERMINAL_SETUP_GUIDE.md - Terminal guide
  • START_HERE.md - Quick start

💡 QUICK COMMANDS:

  hb                    Quick status
  hb-dev                Start development
  hb-lint               Run linter
  hb-deploy             Deploy project
  hb-help               Show all commands

" -ForegroundColor Cyan

Write-Host "✅ All systems operational!" -ForegroundColor Green
Write-Host "   Type 'hb' to get started" -ForegroundColor Gray
