#!/usr/bin/env pwsh
# =============================================================================
# FINAL BUILD VERIFICATION - Clean Run Check
# =============================================================================
# This script verifies everything is ready and clean for fresh development
# =============================================================================

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🔍 LITREELABS BUILD VERIFICATION" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$success = @()

# =============================================================================
# 1. VERIFY CORE FILES EXIST
# =============================================================================
Write-Host "📋 Checking Core Files..." -ForegroundColor Yellow

$coreFiles = @(
    "tsconfig.json",
    ".env.example",
    "package.json",
    "firebase.json"
)

foreach ($file in $coreFiles) {
    if (Test-Path $file) {
        $success += "✓ $file"
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        $errors += "✗ Missing: $file"
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
    }
}

Write-Host ""

# =============================================================================
# 2. VERIFY TYPE FILES
# =============================================================================
Write-Host "🔤 Checking Type Definitions..." -ForegroundColor Yellow

$typeFiles = @(
    "types/world.ts",
    "types/user.ts",
    "types/payments.ts",
    "types/marketplace.ts",
    "types/widget.ts"
)

foreach ($file in $typeFiles) {
    if (Test-Path $file) {
        $success += "✓ $file"
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        $errors += "✗ Missing: $file"
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
    }
}

Write-Host ""

# =============================================================================
# 3. VERIFY CONFIG FILES
# =============================================================================
Write-Host "⚙️  Checking Configuration Files..." -ForegroundColor Yellow

$configFiles = @(
    "config/subscriptions.ts",
    "config/paymentProviders.ts",
    "config/themes.ts",
    "config/widgets.ts"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $success += "✓ $file"
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        $errors += "✗ Missing: $file"
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
    }
}

Write-Host ""

# =============================================================================
# 4. VERIFY LIBRARY FILES
# =============================================================================
Write-Host "📚 Checking Library Files..." -ForegroundColor Yellow

$libFiles = @(
    "lib/db.ts",
    "lib/payments.ts"
)

foreach ($file in $libFiles) {
    if (Test-Path $file) {
        $success += "✓ $file"
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        $errors += "✗ Missing: $file"
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
    }
}

Write-Host ""

# =============================================================================
# 5. VERIFY API ROUTES
# =============================================================================
Write-Host "🛣️  Checking API Routes..." -ForegroundColor Yellow

$apiRoutes = @(
    "app/api/worlds/save/route.ts",
    "app/api/ai/chat/route.ts",
    "app/api/payments/create-subscription/route.ts",
    "app/api/payments/webhook/route.ts"
)

foreach ($file in $apiRoutes) {
    if (Test-Path $file) {
        $success += "✓ $file"
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        $errors += "✗ Missing: $file"
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
    }
}

Write-Host ""

# =============================================================================
# 6. VERIFY DOCUMENTATION
# =============================================================================
Write-Host "📖 Checking Documentation..." -ForegroundColor Yellow

$docFiles = @(
    "ARCHITECTURE_TYPESCRIPT_NEXTJS.md",
    "IMPLEMENTATION_CHECKLIST.md",
    "JUMP_IN_GUIDE.md",
    "README_REBUILD.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        $success += "✓ $file"
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        $warnings += "⚠ Missing: $file"
        Write-Host "  ⚠ Missing: $file" -ForegroundColor Yellow
    }
}

Write-Host ""

# =============================================================================
# 7. VERIFY DIRECTORIES
# =============================================================================
Write-Host "📁 Checking Directories..." -ForegroundColor Yellow

$dirs = @(
    "types",
    "config",
    "lib",
    "app",
    "public"
)

foreach ($dir in $dirs) {
    if (Test-Path $dir -PathType Container) {
        $success += "✓ $dir/"
        Write-Host "  ✓ $dir/" -ForegroundColor Green
    } else {
        $errors += "✗ Missing: $dir/"
        Write-Host "  ✗ Missing: $dir/" -ForegroundColor Red
    }
}

Write-Host ""

# =============================================================================
# 8. CHECK NODE MODULES
# =============================================================================
Write-Host "📦 Checking Dependencies..." -ForegroundColor Yellow

if (Test-Path "node_modules" -PathType Container) {
    $moduleCount = (Get-ChildItem node_modules -Directory | Measure-Object).Count
    Write-Host "  ✓ node_modules exists ($moduleCount packages)" -ForegroundColor Green
    $success += "✓ node_modules ($moduleCount packages)"
} else {
    $warnings += "⚠ node_modules not installed - run: npm install"
    Write-Host "  ⚠ node_modules not installed" -ForegroundColor Yellow
    Write-Host "    Run: npm install" -ForegroundColor Yellow
}

Write-Host ""

# =============================================================================
# 9. CHECK FILE SIZES (Code Quality)
# =============================================================================
Write-Host "📊 Checking Code Sizes..." -ForegroundColor Yellow

$codeFiles = Get-ChildItem -Recurse -Include "*.ts" -Exclude "node_modules" | 
    Where-Object { $_.FullName -notmatch "node_modules" }

$totalLines = 0
foreach ($file in $codeFiles) {
    $lines = (Get-Content $file.FullName | Measure-Object -Line).Lines
    $totalLines += $lines
}

Write-Host "  ✓ Total TypeScript lines: $totalLines" -ForegroundColor Green
$success += "✓ TypeScript code: $totalLines lines"

Write-Host ""

# =============================================================================
# 10. FINAL SUMMARY
# =============================================================================
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "✅ VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your project is clean and ready to go." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Read:  JUMP_IN_GUIDE.md" -ForegroundColor Green
    Write-Host "  2. Run:   npm run dev" -ForegroundColor Green
    Write-Host "  3. Build: components/auth/LoginForm.tsx" -ForegroundColor Green
    Write-Host "  4. Test:  http://localhost:3000/auth/login" -ForegroundColor Green
    Write-Host ""
    exit 0
} elseif ($errors.Count -eq 0) {
    Write-Host "⚠️  WARNINGS ($($warnings.Count))" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "Ready to proceed (with warnings)." -ForegroundColor Yellow
    Write-Host ""
    exit 0
} else {
    Write-Host "❌ ERRORS FOUND ($($errors.Count))" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Please fix the errors above before continuing." -ForegroundColor Red
    Write-Host ""
    exit 1
}
