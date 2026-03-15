# Start Automated Trading - One Click to Profit
# Run: pwsh Start-Trading.ps1

Write-Host "
╔════════════════════════════════════════════════════════════════╗
║          💰 AUTOMATED TRADING ACTIVATION                        ║
║     Your bots are ready. Let's make money 24/7!                ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Resolve repo root (directory of this script)
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $repoRoot

# Check if .env.local exists and has API keys
$envPath = Join-Path $repoRoot '.env.local'

if (-not (Test-Path $envPath)) {
    Write-Host "
⚠️  .env.local not found!

Please create it with your Binance API keys:

📝 Edit or create: .env.local
────────────────────────────────────
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_secret_key_here
RISK_PERCENT=0.02
PROFIT_TARGET=0.03
STOP_LOSS=0.01
────────────────────────────────────

📖 Guide: https://github.com/LiTree89/HomeBase-2.0/TRADING_SETUP_GUIDE.md

🔗 Get API keys: https://www.binance.com/en/my/settings/api-management
" -ForegroundColor Yellow
    exit 1
}

# Verify API keys are set
$content = Get-Content $envPath
if (-not ($content -match 'BINANCE_API_KEY') -or -not ($content -match 'BINANCE_API_SECRET')) {
    Write-Host "❌ API keys not found in .env.local" -ForegroundColor Red
    Write-Host "Add BINANCE_API_KEY and BINANCE_API_SECRET to continue" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ API keys configured" -ForegroundColor Green
Write-Host ""

# Start API if not running
Write-Host "🚀 Starting Azure Functions API..." -ForegroundColor Cyan
$apiProcess = Get-Process | Where-Object { $_.Name -like "*node*" -and $_.CommandLine -like "*functions*" }
if (-not $apiProcess) {
    Start-Job -ScriptBlock {
        param($root)
        Push-Location $root
        pnpm -C api start
    } -ArgumentList $repoRoot | Out-Null
    # Wait for port to come up (max ~12s)
    $ready = $false
    for ($i = 0; $i -lt 12; $i++) {
        Start-Sleep -Seconds 1
        try {
            $ping = Invoke-RestMethod -Uri "http://localhost:7071/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
            if ($ping) { $ready = $true; break }
        } catch { }
    }
    if (-not $ready) {
        Write-Host "❌ API did not start on port 7071. Try running: pnpm -C api start" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ API started (port 7071)" -ForegroundColor Green
Write-Host ""

# Get account status
Write-Host "📊 Checking Binance connection..." -ForegroundColor Cyan
$statusResponse = Invoke-RestMethod -Uri "http://localhost:7071/api/trader/status" -Method Get -ErrorAction SilentlyContinue

if ($statusResponse.success) {
    Write-Host "✅ Connected to Binance" -ForegroundColor Green
    Write-Host "💰 Account Status:" -ForegroundColor Cyan
    Write-Host "   Open Orders: $($statusResponse.data.openOrders)" -ForegroundColor White
    Write-Host "   Total Trades: $($statusResponse.data.totalTrades)" -ForegroundColor White
    Write-Host "   Success Rate: $($statusResponse.data.successRate)" -ForegroundColor White
} else {
    Write-Host "❌ Failed to connect: $($statusResponse.error)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Start trading
Write-Host "🎯 Activating automated trading..." -ForegroundColor Cyan
$tradeResponse = Invoke-RestMethod -Uri "http://localhost:7071/api/trader/start" -Method Post -ErrorAction SilentlyContinue

if ($tradeResponse.success) {
    Write-Host "✅ Trading activated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📈 Execution Summary:" -ForegroundColor Cyan
    Write-Host "   Signals Generated: $($tradeResponse.stats.signalsGenerated)" -ForegroundColor White
    Write-Host "   Trades Executed: $($tradeResponse.stats.tradesExecuted)" -ForegroundColor White
    Write-Host "   Total Executions: $($tradeResponse.stats.totalExecutions)" -ForegroundColor White
    Write-Host "   Timestamp: $($tradeResponse.stats.timestamp)" -ForegroundColor Gray
    
    if ($tradeResponse.recentTrades) {
        Write-Host ""
        Write-Host "🔄 Recent Trades:" -ForegroundColor Cyan
        $tradeResponse.recentTrades | ForEach-Object {
            $icon = if ($_.status -eq 'executed') { '✅' } else { '❌' }
            Write-Host "   $icon $($_.signal)" -ForegroundColor White
        }
    }
} else {
    Write-Host "❌ Failed to start trading: $($tradeResponse.error)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "
╔════════════════════════════════════════════════════════════════╗
║                    🎉 ALL SET!                                 ║
║                                                                 ║
║ Your bots are now trading 24/7 on Binance!                     ║
║                                                                 ║
║ Monitor live at:                                               ║
║  📊 Status: http://localhost:7071/api/trader/status            ║
║  📈 History: http://localhost:7071/api/trader/history          ║
║                                                                 ║
║ Stop trading anytime by killing the API process.               ║
║                                                                 ║
║ 💰 Enjoy your passive income!                                  ║
╚════════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Keep running
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Read-Host "Hit Enter to open trading status in browser..."
Start-Process "http://localhost:7071/api/trader/status"
