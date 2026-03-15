<#
.SYNOPSIS
    Start all Overlord Grid servers
.DESCRIPTION
    Launches PC Dashboard (8080), L1T_GRID (5000), and Overlord Social (3000) in background
#>

Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 STARTING OVERLORD GRID SERVERS" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

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

# Stop any existing servers (by port)
Write-Host "🛑 Stopping existing servers..." -ForegroundColor Yellow
$RepoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$StopScript = Join-Path $RepoRoot 'stop-servers.ps1'
if (Test-Path $StopScript) {
    & $StopScript
    Start-Sleep -Seconds 1
    Write-Host "   ✓ Ports cleared`n" -ForegroundColor Green
}
else {
    Write-Host "   ⚠ stop-servers.ps1 not found; skipping cleanup`n" -ForegroundColor Yellow
}

# Start Overlord PC Dashboard (Port 8080)
Write-Host "📊 Starting PC Dashboard (Port 8080)..." -ForegroundColor Cyan
$DashboardPath = $PSScriptRoot
$DashboardPython = if (Test-Path (Join-Path $DashboardPath '.venv\Scripts\python.exe')) { Join-Path $DashboardPath '.venv\Scripts\python.exe' } else { 'python' }
Start-Process -FilePath $DashboardPython -ArgumentList "server.py" -WorkingDirectory $DashboardPath -WindowStyle Hidden
Start-Sleep -Seconds 3

# Start L1T_GRID (Port 5000)
Write-Host "🎬 Starting L1T_GRID Torrent Streamer (Port 5000)..." -ForegroundColor Cyan
$GridPath = Join-Path (Split-Path $PSScriptRoot -Parent) "grid"
$GridPython = if (Test-Path (Join-Path $GridPath '.venv\Scripts\python.exe')) { Join-Path $GridPath '.venv\Scripts\python.exe' } else { 'python' }
Start-Process -FilePath $GridPython -ArgumentList "server.py" -WorkingDirectory $GridPath -WindowStyle Hidden
Start-Sleep -Seconds 2

# Start Overlord Social (Port 3000)
Write-Host "🌐 Starting Overlord Social (Port 3000)..." -ForegroundColor Cyan
$SocialPath = Join-Path (Split-Path $PSScriptRoot -Parent) "social"
$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $NodePath) {
    Write-Host "   ✗ node not found on PATH; cannot start Social" -ForegroundColor Red
}
else {
    $ServeEntry = Join-Path $SocialPath 'node_modules\serve\build\main.js'
    if (-not (Test-Path $ServeEntry)) {
        Write-Host "   ✗ serve not installed (missing node_modules). Run: cd modules\\social; npm install" -ForegroundColor Red
    }
    else {
        $SocialOut = Join-Path $SocialPath 'Social.out.log'
        $SocialErr = Join-Path $SocialPath 'Social.err.log'
        Start-Process -FilePath $NodePath -ArgumentList @($ServeEntry, '-s', '.', '-l', '3000') -WorkingDirectory $SocialPath -WindowStyle Hidden -RedirectStandardOutput $SocialOut -RedirectStandardError $SocialErr
    }
}
Start-Sleep -Seconds 2

Write-Host "`n⏳ Waiting for servers to initialize..." -ForegroundColor Yellow
foreach ($port in @(8080, 5000, 3000)) {
    [void](Wait-ForPort -Port $port -TimeoutSec 20)
}

# Verify all servers are running
Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📡 SERVER STATUS CHECK" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$ports = @(8080, 5000, 3000)
$services = @('PC Dashboard', 'L1T_GRID', 'Overlord Social')
$allRunning = $true

for ($i = 0; $i -lt $ports.Length; $i++) {
    $port = $ports[$i]
    $service = $services[$i]
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction Stop
        Write-Host "   ✓ $service - Running on port $port" -ForegroundColor Green
    }
    catch {
        Write-Host "   ✗ $service - NOT RUNNING on port $port" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""

if ($allRunning) {
    Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ✅ ALL SERVERS OPERATIONAL" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    Write-Host "📊 PC Dashboard:       " -NoNewline -ForegroundColor Yellow
    Write-Host "http://localhost:8080" -ForegroundColor Cyan
    Write-Host "   Features: System monitoring, RAM optimizer, GPU stats`n" -ForegroundColor Gray
    
    Write-Host "🎬 L1T_GRID:           " -NoNewline -ForegroundColor Yellow
    Write-Host "http://localhost:5000" -ForegroundColor Cyan
    Write-Host "   Features: Torrent streaming with Real-Debrid`n" -ForegroundColor Gray
    
    Write-Host "🌐 Overlord Social:    " -NoNewline -ForegroundColor Yellow
    Write-Host "http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   Features: App launcher, Quick Launch All`n" -ForegroundColor Gray
    
    Write-Host "💡 To stop all servers: " -NoNewline -ForegroundColor Yellow
    Write-Host "..\\..\\stop-servers.ps1`n" -ForegroundColor White
}
else {
    Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ⚠️  SOME SERVERS FAILED TO START" -ForegroundColor Red
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    Write-Host "💡 Check logs in each project directory for errors" -ForegroundColor Yellow
    Write-Host "💡 Verify Python is installed: python --version" -ForegroundColor Yellow
    Write-Host "💡 Check for port conflicts: Get-NetTCPConnection -LocalPort 3000,5000,8080`n" -ForegroundColor Yellow
}
