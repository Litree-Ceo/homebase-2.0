#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fresh dev server - Clear all caches and restart
#>

Write-Host "🧹 Cleaning ALL caches..." -ForegroundColor Cyan

# Kill processes on common ports
Write-Host "Killing processes on ports 3000, 3001, 7071..." -ForegroundColor Yellow
npx kill-port 3000 3001 7071 2>$null

# Clean Next.js caches
Write-Host "Cleaning .next folders..." -ForegroundColor Yellow
Remove-Item -Recurse -Force github/apps/web/.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force litlabs/.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force github/apps/litlabs-web/.next -ErrorAction SilentlyContinue

# Clean Turborepo cache
Write-Host "Cleaning Turbo cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force github/.turbo -ErrorAction SilentlyContinue

# Clean node_modules/.cache
Write-Host "Cleaning module caches..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force github/node_modules/.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force litlabs/node_modules/.cache -ErrorAction SilentlyContinue

# Clear npm/pnpm cache
Write-Host "Clearing package manager cache..." -ForegroundColor Yellow
pnpm store prune 2>$null

Write-Host "`n✅ All caches cleared!" -ForegroundColor Green
Write-Host "`n🚀 Starting fresh dev servers..." -ForegroundColor Cyan

# Start main web app
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd github/apps/web; pnpm dev" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 3

# Start litlabs
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd litlabs; pnpm dev" -WindowStyle Normal

Write-Host "`n📊 Access your apps:" -ForegroundColor Green
Write-Host "   Main Web:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "   LitLabs:   http://localhost:3001" -ForegroundColor Cyan
Write-Host "`n📝 Hard refresh browser: CTRL+SHIFT+R (or CMD+SHIFT+R on Mac)" -ForegroundColor Yellow
