#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup ProfitPilot Trading Bot - Configure Binance and start trading
.DESCRIPTION
    Interactive setup for ProfitPilot trading bot with Binance API keys
#>

Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🤖 ProfitPilot TRADING BOT SETUP                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if .env.local exists
$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item ".env" $envFile -ErrorAction SilentlyContinue
}

Write-Host "`n📋 STEP 1: Get Your Binance API Keys" -ForegroundColor Green
Write-Host "   1. Go to: https://www.binance.com/en/my/settings/api-management"
Write-Host "   2. Create new API key (Enable SPOT trading only!)"
Write-Host "   3. Restrict to your IP address for security"
Write-Host "   4. ⚠️  NEVER enable withdrawals on this key!`n"

# Get API Key
$apiKey = Read-Host "Enter your Binance API Key"
if ($apiKey) {
    (Get-Content $envFile) -replace "BINANCE_API_KEY=.*", "BINANCE_API_KEY=$apiKey" | Set-Content $envFile
    Write-Host "✅ API Key saved" -ForegroundColor Green
}

# Get API Secret
$apiSecret = Read-Host "Enter your Binance API Secret" -AsSecureString
if ($apiSecret) {
    $plainSecret = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiSecret))
    (Get-Content $envFile) -replace "BINANCE_API_SECRET=.*", "BINANCE_API_SECRET=$plainSecret" | Set-Content $envFile
    Write-Host "✅ API Secret saved" -ForegroundColor Green
}

Write-Host "`n📋 STEP 2: Trading Configuration" -ForegroundColor Green

# Paper Trading
$paper = Read-Host "Enable paper trading mode? (recommended for testing) [Y/n]"
if ($paper -eq 'n' -or $paper -eq 'N') {
    (Get-Content $envFile) -replace "PAPER_TRADING=true", "PAPER_TRADING=false" | Set-Content $envFile
    Write-Host "⚠️  LIVE TRADING ENABLED - Real money at risk!" -ForegroundColor Red
} else {
    Write-Host "✅ Paper trading mode enabled (safe for testing)" -ForegroundColor Green
}

# Risk Settings
$risk = Read-Host "Risk percent per trade (default: 2%)"
if ($risk) {
    (Get-Content $envFile) -replace "RISK_PERCENT=0.02", "RISK_PERCENT=$($risk/100)" | Set-Content $envFile
}

Write-Host "`n📋 STEP 3: Start Trading Bot" -ForegroundColor Green
Write-Host "`nChoose an option:" -ForegroundColor Yellow
Write-Host "   1) Start ProfitPilot bot (API mode)"
Write-Host "   2) Test connection only"
Write-Host "   3) Skip for now"

$choice = Read-Host "`nEnter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 Starting ProfitPilot Trading Bot..." -ForegroundColor Cyan
        
        # Check if API is running
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:7071/api/trader/status" -TimeoutSec 5
            Write-Host "✅ API is running" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  API not running. Starting..." -ForegroundColor Yellow
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd github/api; pnpm start" -WindowStyle Normal
            Start-Sleep -Seconds 5
        }
        
        # Start trading
        try {
            $result = Invoke-RestMethod -Uri "http://localhost:7071/api/trader/start" -Method POST
            Write-Host "`n✅ Trading bot started successfully!" -ForegroundColor Green
            Write-Host "   Signals generated: $($result.stats.signalsGenerated)" -ForegroundColor Cyan
            Write-Host "   Trades executed: $($result.stats.tradesExecuted)" -ForegroundColor Cyan
            Write-Host "`n📊 Monitor at: http://localhost:7071/api/trader/status" -ForegroundColor Yellow
        } catch {
            Write-Host "❌ Failed to start trading: $_" -ForegroundColor Red
        }
    }
    "2" {
        Write-Host "`n🧪 Testing connection..." -ForegroundColor Cyan
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:7071/api/trader/status" -TimeoutSec 10
            Write-Host "✅ Connection successful!" -ForegroundColor Green
            Write-Host "   Status: $($response.data.status)" -ForegroundColor Cyan
        } catch {
            Write-Host "❌ Connection failed. Make sure API is running on port 7071" -ForegroundColor Red
            Write-Host "   Run: cd github/api && pnpm start" -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "`n⏸️ Setup complete. Start trading later with:" -ForegroundColor Yellow
        Write-Host "   ./scripts/Start-ProfitPilot-Trading.ps1" -ForegroundColor Cyan
    }
}

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Setup complete! Check your .env.local file for configuration." -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
