#!/usr/bin/env pwsh
# 🚀 START TRADING TESTNET - ONE COMMAND

Write-Host "🧪 HOMEBASE TESTNET TRADING STARTUP" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
$envFile = "e:\VSCode\HomeBase 2.0\.env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ ERROR: .env.local not found!" -ForegroundColor Red
    Write-Host "Create it first: See GET_TESTNET_KEYS_3MIN.md"
    exit 1
}

# Check if testnet is enabled
$envContent = Get-Content $envFile
if ($envContent -notmatch "BINANCE_TESTNET=true") {
    Write-Host "❌ ERROR: BINANCE_TESTNET not set to true!" -ForegroundColor Red
    Write-Host "Edit .env.local and set: BINANCE_TESTNET=true"
    exit 1
}

# Check if API keys are set
if ($envContent -match "BINANCE_API_KEY=your_testnet" -or -not ($envContent -match "BINANCE_API_KEY=")) {
    Write-Host "❌ ERROR: API keys not configured!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://testnet.binance.vision/"
    Write-Host "2. Sign up (or login with Binance account)"
    Write-Host "3. Go to Account → API Management → Create API Key"
    Write-Host "4. Copy API Key and Secret"
    Write-Host "5. Paste into .env.local"
    Write-Host ""
    Write-Host "See: GET_TESTNET_KEYS_3MIN.md for detailed steps"
    exit 1
}

Write-Host "✅ Configuration check passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting testnet trading bots..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Navigate to api directory
cd 'e:\VSCode\HomeBase 2.0'

# Build if needed
Write-Host "Building API..." -ForegroundColor Yellow
pnpm -C api build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting trading bots..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Trading on TESTNET with fake USDT (zero risk)" -ForegroundColor Green
Write-Host ""

# Start the API
pnpm -C api start
