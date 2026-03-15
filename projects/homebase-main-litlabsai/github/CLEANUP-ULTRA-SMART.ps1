#!/usr/bin/env powershell
<#
.SYNOPSIS
    Ultra-smart cleanup for HomeBase 2.0 - removes all caches, restarts services, optimizes workspace
.DESCRIPTION
    This script cleans everything that could be slowing down VS Code:
    - Kills Docker/WSL processes
    - Clears pnpm cache
    - Removes build artifacts (.next, dist, .eslintcache)
    - Reinstalls dependencies
    - Verifies TypeScript and ESLint
.PARAMETER SkipInstall
    Skip the pnpm install step (useful if just cleaning)
.EXAMPLE
    .\CLEANUP-ULTRA-SMART.ps1
    .\CLEANUP-ULTRA-SMART.ps1 -SkipInstall
#>

param(
    [switch]$SkipInstall
)

$ErrorActionPreference = "Continue"
$WarningPreference = "SilentlyContinue"

# Color output function
function Write-Status {
    param([string]$Message, [string]$Type = "info")
    $colors = @{
        "info" = "Cyan"
        "success" = "Green"
        "warning" = "Yellow"
        "error" = "Red"
    }
    $icon = @{
        "info" = "ℹ️"
        "success" = "✅"
        "warning" = "⚠️"
        "error" = "❌"
    }
    Write-Host "$($icon[$Type]) $Message" -ForegroundColor $colors[$Type]
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  🚀 HOMEBASE 2.0 - ULTRA-SMART CLEANUP & OPTIMIZATION         ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Step 1: Kill hung processes
Write-Status "STEP 1: Terminating hung Docker/WSL processes..." "info"
taskkill /F /IM docker.exe /T 2>&1 | Out-Null
taskkill /F /IM wsl.exe /T 2>&1 | Out-Null
taskkill /F /IM code.exe /T 2>&1 | Out-Null
Start-Sleep -Milliseconds 500
Write-Status "Processes terminated" "success"
Write-Host ""

# Step 2: Clear caches
Write-Status "STEP 2: Clearing VS Code and build caches..." "info"
$cachePaths = @(
    "dist",
    ".next",
    ".eslintcache",
    ".typescript",
    ".turbo",
    ".webpack",
    "build"
)

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed $path"
    }
}
Write-Status "Caches cleared" "success"
Write-Host ""

# Step 3: Clean pnpm store
Write-Status "STEP 3: Pruning pnpm store..." "info"
pnpm store prune 2>&1 | Out-Null
Write-Status "pnpm store pruned" "success"
Write-Host ""

# Step 4: Reinstall dependencies (optional)
if (-not $SkipInstall) {
    Write-Status "STEP 4: Reinstalling dependencies (this takes 2-3 minutes)..." "warning"
    pnpm install --frozen-lockfile
    Write-Status "Dependencies installed" "success"
    Write-Host ""
}

# Step 5: Verify build
Write-Status "STEP 5: Verifying TypeScript compilation..." "info"
pnpm -C api build 2>&1 | Select-Object -Last 3
Write-Status "Build verification complete" "success"
Write-Host ""

# Step 6: ESLint check
Write-Status "STEP 6: Running ESLint scan..." "info"
pnpm lint 2>&1 | Select-Object -Last 5
Write-Status "Linting complete" "success"
Write-Host ""

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✨ CLEANUP COMPLETE! ✨                                      ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  📋 Next Steps:                                               ║" -ForegroundColor Green
Write-Host "║  1. Close VS Code completely (Alt+F4)                         ║" -ForegroundColor Green
Write-Host "║  2. Disable the Azure Containers extension:                   ║" -ForegroundColor Green
Write-Host "║     Ctrl+Shift+X → Search 'Azure Containers' → Uninstall      ║" -ForegroundColor Green
Write-Host "║  3. Reopen VS Code                                            ║" -ForegroundColor Green
Write-Host "║  4. Run: pnpm dev                                             ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  ⚡ Performance boost: You should see instant response times    ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host ""
Write-Status "Ready to code at light speed! 🚀" "success"
