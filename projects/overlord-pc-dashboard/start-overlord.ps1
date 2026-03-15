<#!
.SYNOPSIS
    Start Overlord Monolith Systems
.DESCRIPTION
    Restarts Dashboard (8080) and Social Hub (3000) with new configurations.
#>

$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$ModulesRoot = Join-Path $Root 'modules'
$DashboardDir = Join-Path $ModulesRoot 'dashboard'
$SocialDir = Join-Path $ModulesRoot 'social'

$DashboardPython = if (Test-Path (Join-Path $DashboardDir '.venv\Scripts\python.exe')) {
    Join-Path $DashboardDir '.venv\Scripts\python.exe'
} else {
    'python'
}

$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source

function Wait-ForPort {
    param(
        [Parameter(Mandatory = $true)][int]$Port,
        [int]$TimeoutSec = 20
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
            return $true
        }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

Write-Host "`n💀 KALI OVERLORD MONOLITH STARTUP 💀" -ForegroundColor Green
Write-Host "════════════════════════════════════`n" -ForegroundColor DarkGreen

# 1. Stop existing servers by port
Write-Host "[*] Stopping old servers (by port)..." -ForegroundColor Yellow
$StopScript = Join-Path $Root 'stop-servers.ps1'
if (Test-Path $StopScript) {
    & $StopScript
} else {
    Write-Host "    [WARN] stop-servers.ps1 not found; skipping port cleanup" -ForegroundColor Yellow
}
Start-Sleep -Seconds 1

# 2. Start Dashboard (Port 8081)
Write-Host "[*] Starting Dashboard Core (Port 8081)..." -ForegroundColor Cyan
$DashboardJob = Start-Process -FilePath $DashboardPython -ArgumentList "server.py" -WorkingDirectory $DashboardDir -PassThru -WindowStyle Hidden
Write-Host "    [+] PID: $($DashboardJob.Id)" -ForegroundColor Green

# 3. Start Social Hub (Port 3000)
Write-Host "[*] Starting Social Hub (Port 3000)..." -ForegroundColor Cyan
if (-not $NodePath) {
    throw "node not found on PATH. Install Node.js to start the Social Hub."
}
$ServeEntry = Join-Path $SocialDir 'node_modules\serve\build\main.js'
if (-not (Test-Path $ServeEntry)) {
    throw "serve not installed (missing node_modules). Run: cd modules\\social; npm install"
}
$SocialOut = Join-Path $SocialDir 'Social.out.log'
$SocialErr = Join-Path $SocialDir 'Social.err.log'
$SocialJob = Start-Process -FilePath $NodePath -ArgumentList @($ServeEntry, '-s', '.', '-l', '3000') -WorkingDirectory $SocialDir -PassThru -WindowStyle Hidden -RedirectStandardOutput $SocialOut -RedirectStandardError $SocialErr
Write-Host "    [+] PID: $($SocialJob.Id)" -ForegroundColor Green

# 4. Verification
foreach ($port in @(8081, 3000)) {
    [void](Wait-ForPort -Port $port -TimeoutSec 20)
}
Write-Host "`n[*] Verifying Ports..." -ForegroundColor Yellow

$Port8081 = Get-NetTCPConnection -LocalPort 8081 -State Listen
$Port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen

if ($Port8081) { Write-Host "    [SUCCESS] Dashboard listening on :8081" -ForegroundColor Green }
else { Write-Host "    [FAIL] Dashboard 8081 not listening" -ForegroundColor Red }

if ($Port3000) { Write-Host "    [SUCCESS] Social Hub listening on :3000" -ForegroundColor Green }
else { Write-Host "    [FAIL] Social Hub 3000 not listening" -ForegroundColor Red }

Write-Host "`n[!] ACCESS YOUR SYSTEM:" -ForegroundColor White
Write-Host "    Dashboard: http://localhost:8081" -ForegroundColor Cyan
Write-Host "    Social:    http://localhost:3000" -ForegroundColor Cyan
Write-Host "`n[+] SYSTEM OPTIMIZED. KALI THEME ACTIVE." -ForegroundColor Green
