# Daily System Maintenance & Cleanup Script
# Run this to keep your "Golden" environment fresh and fast.

Write-Host "🧹 Starting Daily Maintenance..." -ForegroundColor Cyan

# 1. Clean Next.js Caches (Fixes 'stale' UI issues)
Write-Host "   - Cleaning Next.js caches..." -ForegroundColor Gray
if (Test-Path "apps/web/.next") { Remove-Item "apps/web/.next" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "litlabs/.next") { Remove-Item "litlabs/.next" -Recurse -Force -ErrorAction SilentlyContinue }

# 2. Optimize Git (Fixes 'slow' Source Control)
Write-Host "   - Optimizing Git repository..." -ForegroundColor Gray
git gc --prune=now --aggressive | Out-Null
git remote prune origin | Out-Null

# 3. Clean Temp Files
Write-Host "   - Cleaning temp files..." -ForegroundColor Gray
Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Check & Kill Zombie Node Processes (Optional but helpful)
# Write-Host "   - Checking for stuck Node processes..." -ForegroundColor Gray
# Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.StartTime -lt (Get-Date).AddDays(-1) } | Stop-Process -Force

Write-Host "✨ System Cleaned! You are ready to build." -ForegroundColor Green
Write-Host "   (If VS Code still feels slow, press F1 -> 'Reload Window')" -ForegroundColor Yellow
