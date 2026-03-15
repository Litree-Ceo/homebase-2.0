#!/usr/bin/env pwsh
# 📊 MONITOR TESTNET TRADING STATUS

Write-Host ""
Write-Host "📊 HOMEBASE TESTNET TRADING STATUS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "http://localhost:7071/api"

# Check if API is running
Write-Host "Checking if API is running..." -ForegroundColor Yellow

try {
    $healthCheck = Invoke-WebRequest -Uri "$apiUrl/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ API Status: RUNNING" -ForegroundColor Green
} catch {
    Write-Host "❌ API Status: OFFLINE" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start the API, run:" -ForegroundColor Yellow
    Write-Host "  .\Start-TestnetTrading.ps1" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "📈 Trading Bot Status" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────"

# Try to get trader status
try {
    $status = Invoke-RestMethod -Uri "$apiUrl/trader/status" -TimeoutSec 5 -ErrorAction Stop
    
    Write-Host "Last Run: $($status.lastRun)" -ForegroundColor Cyan
    Write-Host "Active Trades: $($status.activeTrades)" -ForegroundColor Cyan
    Write-Host "Total P&L: $($status.totalPnL) USDT" -ForegroundColor $(if([double]$status.totalPnL -gt 0) { 'Green' } else { 'Red' })
    Write-Host "Win Rate: $($status.winRate)%" -ForegroundColor Cyan
    
} catch {
    Write-Host "Status endpoint not available (API just started?)" -ForegroundColor Yellow
    Write-Host "Refresh in 30 seconds..."
}

Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "───────────────────────────────────────────────────── "
Write-Host "1. Bots are trading with 10,000 USDT (fake)" -ForegroundColor Gray
Write-Host "2. Check back in 1 hour to see first profits" -ForegroundColor Gray
Write-Host "3. Monitor daily P&L: Run this script again tomorrow" -ForegroundColor Gray
Write-Host "4. Testnet runs 24/7 - don't need to restart" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 See TESTNET_QUICK_START.md for detailed monitoring" -ForegroundColor Yellow
Write-Host ""
