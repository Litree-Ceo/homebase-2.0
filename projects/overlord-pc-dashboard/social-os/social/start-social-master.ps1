# ════════════════════════════════════════════════════════════════
# OVERLORD SOCIAL HUB - UNIVERSAL MASTER LAUNCHER (PowerShell)
# Cross-platform: Windows PowerShell / WSL / Git Bash
# Auto-detects PM2, falls back to Start-Process if needed
# ════════════════════════════════════════════════════════════════

param(
    [switch]$NoWait = $false,
    [switch]$Monitor = $false
)

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectDir

$PORT = 3000
$NAME = "overlord-social"
$PidFile = "$ProjectDir\social.pid"
$LogFile = "$ProjectDir\social.log"
$ErrorLog = "$ProjectDir\social_error.log"

# ════════════════════════════════════════════════════════════════
# Header
# ════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "┌──────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│   OVERLORD SOCIAL HUB - MASTER LAUNCHER      │" -ForegroundColor Cyan
Write-Host "└──────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

# ════════════════════════════════════════════════════════════════
# Auto-detect IP
# ════════════════════════════════════════════════════════════════
try {
    $IP = (
        Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object {
            $_.InterfaceAlias -match "(Ethernet|WiFi|WLAN)" -and
            $_.IPAddress -notmatch "^127\." -and
            $_.IPAddress -notmatch "^169\."
        } |
        Select-Object -ExpandProperty IPAddress -First 1
    )
} catch { }

if (-not $IP) {
    $IP = "192.168.0.77"
}

Write-Host "🌐 Detected IP     : $IP" -ForegroundColor Green
Write-Host "📱 Phone access    : http://$IP`:$PORT" -ForegroundColor Green
Write-Host "🖥️  Local access    : http://localhost`:$PORT" -ForegroundColor Green
Write-Host ""

# ════════════════════════════════════════════════════════════════
# Kill old processes
# ════════════════════════════════════════════════════════════════
Write-Host "⏹️  Cleaning up old processes..." -ForegroundColor Yellow
Get-Process -Name "node", "npm" -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -like "*Overlord*" } |
    Stop-Process -Force -ErrorAction SilentlyContinue

if (Test-Path $PidFile) {
    try {
        $OldPid = Get-Content $PidFile
        Stop-Process -Id $OldPid -ErrorAction SilentlyContinue -Force
        Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    } catch { }
}

Start-Sleep -Seconds 1

# ════════════════════════════════════════════════════════════════
# Check for PM2
# ════════════════════════════════════════════════════════════════
$HasPM2 = $false
try {
    $PM2Version = pm2 --version 2>$null
    if ($PM2Version) {
        $HasPM2 = $true
    }
} catch { }

if ($HasPM2) {
    Write-Host "🟢 PM2 detected — launching pro mode" -ForegroundColor Green
    Write-Host ""
    
    # Delete old instance
    pm2 delete $NAME 2>$null
    Start-Sleep -Seconds 1
    
    Write-Host "🚀 Starting Social Hub via PM2..." -ForegroundColor Cyan
    pm2 start npm --name $NAME -- start
    pm2 save
    
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "✅ Launched via PM2" -ForegroundColor Green
    Write-Host ""
    pm2 list 2>$null
    
    Write-Host ""
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "PM2 Commands (same everywhere):" -ForegroundColor Cyan
    Write-Host "   pm2 list                    → Status"
    Write-Host "   pm2 logs $NAME              → Live logs"
    Write-Host "   pm2 monit                   → Dashboard"
    Write-Host "   pm2 restart $NAME           → Restart"
    Write-Host "   pm2 stop $NAME              → Stop"
    Write-Host "   pm2 delete $NAME            → Remove"
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
    
} else {
    Write-Host "🟡 PM2 not found — using Start-Process fallback" -ForegroundColor Yellow
    Write-Host "   (Install: npm install -g pm2)"
    Write-Host ""
    
    Write-Host "🚀 Starting Social Hub via npm..." -ForegroundColor Cyan
    $npmCmd = if (Get-Command npm.cmd -ErrorAction SilentlyContinue) { "npm.cmd" } else { "npm" }
    
    try {
        $Process = Start-Process -FilePath $npmCmd -ArgumentList "start" `
            -WorkingDirectory $ProjectDir `
            -NoNewWindow `
            -RedirectStandardOutput $LogFile `
            -RedirectStandardError $ErrorLog `
            -PassThru
        
        $Process.Id | Out-File $PidFile -Force
        Write-Host "✅ Started (PID: $($Process.Id))" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Failed to start: $_" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Fallback Commands (Start-Process):" -ForegroundColor Cyan
    Write-Host "   Get-Content social.log -Tail 20 -Wait → Live logs"
    Write-Host "   Get-Process -Id (cat social.pid)     → Check status"
    Write-Host "   Stop-Process -Id (cat social.pid)    → Stop"
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
}

# ════════════════════════════════════════════════════════════════
# Verify startup
# ════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "⏳ Verifying server startup (waiting 5 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

$ServerUp = $false
try {
    $Response = Invoke-WebRequest -Uri "http://localhost:$PORT" -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($Response.StatusCode -ge 200 -and $Response.StatusCode -lt 500) {
        $ServerUp = $true
    }
} catch { }

if ($ServerUp) {
    Write-Host "✅ Server is LIVE on http://localhost:$PORT" -ForegroundColor Green
    Write-Host ""
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "📱 Open on phone: http://$IP`:$PORT" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
} else {
    Write-Host "⚠️  Server not responding — checking logs:" -ForegroundColor Red
    Write-Host ""
    if (Test-Path $LogFile) {
        Write-Host "Recent log entries:" -ForegroundColor Yellow
        Get-Content $LogFile -Tail 20
    } elseif ($HasPM2) {
        pm2 logs $NAME -n 20
    }
}

Write-Host ""

if ($Monitor) {
    Write-Host "📊 Starting monitor mode (Ctrl+C to exit)..." -ForegroundColor Yellow
    while ($true) {
        if ($HasPM2) {
            pm2 monit
        } else {
            Start-Sleep -Seconds 2
            if (Test-Path $PidFile) {
                $Proc = Get-Process -Id (Get-Content $PidFile -ErrorAction SilentlyContinue) -ErrorAction SilentlyContinue
                if ($Proc) {
                    $Mem = [math]::Round($Proc.WorkingSet / 1MB, 2)
                    Write-Host "Memory: $Mem MB | Status: Running" -ForegroundColor Green
                }
            }
        }
    }
}
