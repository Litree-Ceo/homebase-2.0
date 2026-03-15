#!/usr/bin/env pwsh
# 💰 ONE-CLICK DEPLOYMENT - GET YOUR API LIVE AND MAKE MONEY
# Run this: .\DEPLOY-NOW.ps1

Write-Host "`n💰💰💰 DEPLOYING YOUR MONEY-MAKING API 💰💰💰`n" -ForegroundColor Green

# Build API
Write-Host "🔨 Building API..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\api"
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Deploy to Azure
Write-Host "`n🚀 Deploying to Azure Functions..." -ForegroundColor Cyan
func azure functionapp publish homebase-crypto-api --typescript

# Get URL
Write-Host "`n✅ DEPLOYMENT COMPLETE!`n" -ForegroundColor Green
Write-Host "Your live API: https://homebase-crypto-api.azurewebsites.net/api/crypto" -ForegroundColor Cyan
Write-Host "`nTest it: curl https://homebase-crypto-api.azurewebsites.net/api/crypto`n" -ForegroundColor Yellow
Write-Host "💵 NOW GO MARKET IT AND MAKE THAT MONEY! 💵`n" -ForegroundColor Green
