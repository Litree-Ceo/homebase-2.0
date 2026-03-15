# ========================================
# OVERLORD SOCIAL HUB - WINDOWS LAUNCHER
# PM2-equivalent experience on Windows PS1
# ========================================

param(
    [switch]$MonitorMode = $false
)

$ProjectDir = $PSScriptRoot
$Port = 3000
$PidFile = Join-Path $ProjectDir 'social.pid'
$LogFile = Join-Path $ProjectDir 'social.log'

Set-Location $ProjectDir

# Get IP address
try {
    $IP = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object { $_.InterfaceAlias -match "Ethernet|WiFi" -and $_.TypedAddress -notmatch "^127\." } |
        Select-Object -ExpandProperty IPAddress -First 1)
} catch { }

if (-not $IP) {
    $IP = "192.168.0.77"
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Magenta
Write-Host "🚀 OVERLORD SOCIAL HUB PRO LAUNCHER" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "📍 Project Dir: $ProjectDir" -ForegroundColor Cyan
Write-Host "🌐 Windows IP : $IP" -ForegroundColor Cyan
Write-Host "📱 Phone URL  : http://$IP`:$Port" -ForegroundColor Green
Write-Host "🖥️  Local URL  : http://localhost:$Port" -ForegroundColor Green
Write-Host ""

# Kill old instances (by pid/port only; do NOT kill all node processes)
Write-Host "⏹️  Cleaning up old processes..." -ForegroundColor Yellow

try {
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        Write-Host "   🛑 Killing listener on port $Port (PID: $($conn.OwningProcess))" -ForegroundColor Yellow
        Stop-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue -Force
    }
} catch { }

if (Test-Path $PidFile) {
    try {
        $OldPid = Get-Content $PidFile
        Stop-Process -Id $OldPid -ErrorAction SilentlyContinue -Force
        Remove-Item $PidFile -Force
        Write-Host "   ✅ Old process killed (PID: $OldPid)" -ForegroundColor Gray
    }
    catch { }
}

Start-Sleep -Seconds 1

# Start Social Hub
Write-Host "🚀 Starting Social Hub..." -ForegroundColor Green
$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $NodePath) {
    throw "node not found on PATH. Install Node.js to start Social Hub."
}

$ServeEntry = Join-Path $ProjectDir 'node_modules\serve\build\main.js'
if (-not (Test-Path $ServeEntry)) {
    throw "serve not installed (missing node_modules). Run: npm install"
}

$process = Start-Process -FilePath $NodePath -ArgumentList @($ServeEntry, '-s', '.', '-l', "$Port") `
    -WorkingDirectory $ProjectDir `
    -NoNewWindow `
    -RedirectStandardOutput $LogFile `
    -RedirectStandardError ($LogFile -replace ".log", ".err.log") `
    -PassThru -ErrorAction Stop

$process.Id | Out-File $PidFile -Force
Write-Host "   ✅ Process started (PID: $($process.Id))" -ForegroundColor Gray

# Wait for server to be ready
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
$MaxRetries = 15
$RetryCount = 0

while ($RetryCount -lt $MaxRetries) {
    Start-Sleep -Seconds 1
    try {
        $Response = Invoke-WebRequest -Uri "http://localhost:$Port" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($Response.StatusCode -ge 200 -and $Response.StatusCode -lt 500) {
            Write-Host "✅ Social Hub is LIVE and responding!" -ForegroundColor Green
            Write-Host ""
            Write-Host "═══════════════════════════════════════" -ForegroundColor Magenta
            Write-Host "Commands:" -ForegroundColor Cyan
            Write-Host "   ./stop-social.sh              → Stop" -ForegroundColor Gray
            Write-Host "   tail -f social.log            → Live logs (PowerShell)" -ForegroundColor Gray
            Write-Host "   Get-Content social.log -Tail 20 -Wait → Follow logs" -ForegroundColor Gray
            Write-Host "   Get-Process -Id (cat social.pid)  → Check status" -ForegroundColor Gray
            Write-Host "═══════════════════════════════════════" -ForegroundColor Magenta
            Write-Host ""
            
            if ($MonitorMode) {
                Write-Host "📊 Starting monitor mode (Ctrl+C to exit)..." -ForegroundColor Yellow
                while ($true) {
                    $Proc = Get-Process -Id (Get-Content $PidFile -ErrorAction SilentlyContinue) -ErrorAction SilentlyContinue
                    if ($Proc) {
                        $Mem = [math]::Round($Proc.WorkingSet / 1MB, 2)
                        Write-Host "♻️  Memory: $Mem MB | PID: $($Proc.Id) | Name: npm" -ForegroundColor Green
                    }
                    else {
                        Write-Host "⚠️  Process stopped!" -ForegroundColor Red
                        break
                    }
                    Start-Sleep -Seconds 2
                }
            }
            exit 0
        }
    }
    catch { }
    
    Write-Host "   ⏳ Attempt $($RetryCount + 1)/$MaxRetries..." -ForegroundColor Gray
    $RetryCount++
}

Write-Host ""
Write-Host "⚠️  Server didn't respond in time. Check logs:" -ForegroundColor Yellow
Write-Host "   Get-Content $LogFile -Tail 20" -ForegroundColor Gray
Write-Host ""

# Show recent logs
if (Test-Path $LogFile) {
    Write-Host "Recent logs:" -ForegroundColor Cyan
    Get-Content $LogFile -Tail 10 | foreach { Write-Host "  $_" -ForegroundColor Gray }
}
