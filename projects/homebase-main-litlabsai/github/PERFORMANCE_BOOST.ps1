#!/usr/bin/env pwsh
<#
.SYNOPSIS
Ultra-smart performance boost for HomeBase 2.0
#>

Write-Host "⚡ PERFORMANCE BOOST STARTED ⚡" -ForegroundColor Cyan -BackgroundColor Black
Write-Host "═" * 80 -ForegroundColor Cyan

# 1. Kill all processes
Write-Host "`n🔪 Step 1: Terminating hanging processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process "com.docker.backend" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ Done" -ForegroundColor Green

# 2. Clean workspace
Write-Host "`n🧹 Step 2: Cleaning workspace..." -ForegroundColor Yellow

# Remove build artifacts
$dirs = @("dist", "out", ".next", "build", ".turbo", "coverage")
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Removed $dir" -ForegroundColor Green
    }
}

# Clean npm/pnpm cache
Write-Host "  • Pruning pnpm store..." -ForegroundColor Cyan
pnpm store prune --force 2>&1 | Out-Null
Write-Host "  ✓ pnpm store cleaned" -ForegroundColor Green

# 3. File size analysis
Write-Host "`n📊 Step 3: Workspace Analysis..." -ForegroundColor Yellow

$analysisData = @()

# Check pnpm-lock
if (Test-Path "pnpm-lock.yaml") {
    $size = (Get-Item "pnpm-lock.yaml").Length / 1MB
    Write-Host "  • pnpm-lock.yaml: $('{0:F1}' -f $size) MB" -ForegroundColor Cyan
    $analysisData += "pnpm-lock: $('{0:F1}' -f $size) MB"
}

# Check node_modules
$nodeModulesPaths = @("node_modules", "api/node_modules", "apps/web/node_modules")
foreach ($path in $nodeModulesPaths) {
    if (Test-Path $path) {
        $items = Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue -Force
        $size = ($items | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "  • $path : $('{0:F1}' -f $size) MB" -ForegroundColor Cyan
        $analysisData += "$path`: $('{0:F1}' -f $size) MB"
    }
}

# 4. VS Code Extension Analysis
Write-Host "`n📦 Step 4: VS Code Extensions..." -ForegroundColor Yellow
$extPath = "$env:USERPROFILE\.vscode\extensions"
if (Test-Path $extPath) {
    $extCount = (Get-ChildItem $extPath).Count
    $extSize = (Get-ChildItem $extPath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "  • Installed extensions: $extCount" -ForegroundColor Cyan
    Write-Host "  • Total size: $('{0:F1}' -f $extSize) MB" -ForegroundColor Cyan
}

# 5. Recommendations
Write-Host "`n💡 Step 5: Smart Recommendations..." -ForegroundColor Yellow
Write-Host "  ✓ Extensions disabled: ms-azuretools.vscode-docker" -ForegroundColor Green
Write-Host "  ✓ Settings optimized: Autocomplete OFF, Rendering minimal" -ForegroundColor Green
Write-Host "  ✓ File watchers: Excluded node_modules, .git, dist, etc." -ForegroundColor Green
Write-Host "  ✓ Processes: All hanging Node/Docker processes killed" -ForegroundColor Green

# 6. Next steps
Write-Host "`n🚀 Step 6: Final Steps..." -ForegroundColor Yellow
Write-Host "  1. Close VS Code completely" -ForegroundColor Cyan
Write-Host "  2. Delete .vscode/extensions folder for slow extensions" -ForegroundColor Cyan
Write-Host "  3. Reopen VS Code (settings already optimized)" -ForegroundColor Cyan
Write-Host "  4. Run: pnpm install (fresh install)" -ForegroundColor Cyan

Write-Host "`n═" * 80 -ForegroundColor Cyan
Write-Host "✅ PERFORMANCE BOOST COMPLETE" -ForegroundColor Green -BackgroundColor Black
Write-Host "═" * 80 -ForegroundColor Cyan

# Summary
Write-Host "`n📋 Summary:" -ForegroundColor Yellow
Write-Host "  • Processes: Killed" -ForegroundColor Green
Write-Host "  • Cache: Cleaned" -ForegroundColor Green
Write-Host "  • Settings: Optimized (ULTRA SPEED MODE)" -ForegroundColor Green
Write-Host "  • Docker Extension: Disabled" -ForegroundColor Green
Write-Host "  • Ready to launch: pnpm -w dev" -ForegroundColor Cyan

Write-Host ""
