#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start ProfitPilot Trading Bot
.DESCRIPTION
    Activates automated trading with ProfitPilot bot
#>

param(
    [switch]$TestMode,
    [switch]$StatusOnly
)

Write-Host @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🤖 ProfitPilot TRADING BOT                          ║
║              Automated Crypto Trading                     ║
╚═══════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$API_URL = "http://localhost:7071"

# Check if status only
if ($StatusOnly) {
    try {
        $response = Invoke-RestMethod -Uri "$API_URL/api/trader/status" -TimeoutSec 5
        Write-Host "`n📊 ProfitPilot Status:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "❌ ProfitPilot API not running. Start with: cd github/api && pnpm start" -ForegroundColor Red
    }
    return
}

# Check API is running
Write-Host "`n🔍 Checking ProfitPilot API..." -ForegroundColor Yellow
try {
    $test = Invoke-RestMethod -Uri "$API_URL/api/trader/status" -TimeoutSec 3
    Write-Host "✅ ProfitPilot API is online" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Starting ProfitPilot API..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd github/api; pnpm start" -WindowStyle Normal
    Write-Host "⏳ Waiting for API to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
}

# Check environment
Write-Host "`n🔐 Checking Binance credentials..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    if ($content -match "BINANCE_API_KEY=your_" -or $content -match "BINANCE_API_KEY=$") {
        Write-Host "⚠️  Binance API keys not configured!" -ForegroundColor Red
        Write-Host "   Run: ./scripts/setup-ProfitPilot-trading.ps1" -ForegroundColor Cyan
        return
    }
    Write-Host "✅ Credentials found" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    return
}

# Start trading
Write-Host "`n🚀 Starting ProfitPilot Trading..." -ForegroundColor Cyan
if ($TestMode) {
    Write-Host "🧪 PAPER TRADING MODE (safe)" -ForegroundColor Green
} else {
    Write-Host "💰 LIVE TRADING MODE" -ForegroundColor Red
    $confirm = Read-Host "Are you sure? This uses real money! [yes/no]"
    if ($confirm -ne "yes") {
        Write-Host "Cancelled. Use -TestMode for paper trading." -ForegroundColor Yellow
        return
    }
}

try {
    $result = Invoke-RestMethod -Uri "$API_URL/api/trader/start" -Method POST -TimeoutSec 30
    
    if ($result.success) {
        Write-Host "`n✅ ProfitPilot is now trading!" -ForegroundColor Green
        Write-Host "   Signals: $($result.stats.signalsGenerated)" -ForegroundColor Cyan
        Write-Host "   Executed: $($result.stats.tradesExecuted)" -ForegroundColor Cyan
        Write-Host "   Time: $($result.stats.timestamp)" -ForegroundColor Gray
        
        Write-Host "`n📊 Monitor at:" -ForegroundColor Yellow
        Write-Host "   $API_URL/api/trader/status" -ForegroundColor Cyan
        Write-Host "   $API_URL/api/trader/history" -ForegroundColor Cyan
        
        Write-Host "`n⏸️  To stop trading:" -ForegroundColor Yellow
        Write-Host "   Invoke-RestMethod -Uri '$API_URL/api/trader/stop' -Method POST" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Failed to start: $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Make sure API is running: cd github/api && pnpm start" -ForegroundColor Yellow
}
