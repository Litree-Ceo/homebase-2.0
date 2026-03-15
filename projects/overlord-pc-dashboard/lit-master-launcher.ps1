#!/usr/bin/env powershell
# ============================================================
# LiTreeLabStudio Master Launcher
# Starts entire ecosystem: Dashboard + L1T_GRID + Social
# ============================================================

param(
    [switch]$Dashboard,
    [switch]$Grid,
    [switch]$Social,
    [switch]$All,
    [switch]$Stop,
    [switch]$Status
)

# Colors
$Green = "`e[32m"
$Cyan = "`e[36m"
$Magenta = "`e[35m"
$Yellow = "`e[33m"
$Reset = "`e[0m"

# Configuration
$ProjectRoot = $PSScriptRoot
$Ports = @{
    Dashboard = 8080
    Grid = 5000
    Social = 3000
}

Write-Host @"
$Green
╔══════════════════════════════════════════════════════════╗
║              ⚡ LiTreeLabStudio Ecosystem ⚡              ║
║         Dashboard • L1T_GRID Stream • THE GRID Social    ║
╚══════════════════════════════════════════════════════════╝
$Reset
"@

function Get-ServiceStatus($port) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conn) {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            return @{ Running = $true; PID = $conn.OwningProcess; Process = $proc.ProcessName }
        }
    } catch {}
    return @{ Running = $false }
}

function Stop-ServiceOnPort($port) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conn) {
            Stop-Process -Id $conn.OwningProcess -Force
            Write-Host "  ✓ Stopped process on port $port" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✗ Nothing running on port $port" -ForegroundColor Gray
    }
}

function Start-Dashboard() {
    Write-Host "`n🛡️  Starting Overlord Dashboard..." -ForegroundColor Cyan
    $status = Get-ServiceStatus $Ports.Dashboard
    if ($status.Running) {
        Write-Host "  Already running (PID: $($status.PID))" -ForegroundColor Yellow
        return
    }
    
    $job = Start-Job -ScriptBlock {
        Set-Location $using:ProjectRoot
        python server.py
    } -Name "Dashboard"
    
    Start-Sleep 3
    Write-Host "  ✓ Dashboard running at http://localhost:$($Ports.Dashboard)" -ForegroundColor Green
}

function Start-Grid() {
    Write-Host "`n🎬 Starting L1T_GRID Stream Engine..." -ForegroundColor Magenta
    $status = Get-ServiceStatus $Ports.Grid
    if ($status.Running) {
        Write-Host "  Already running (PID: $($status.PID))" -ForegroundColor Yellow
        return
    }
    
    $job = Start-Job -ScriptBlock {
        Set-Location "$using:ProjectRoot\L1T_GRID"
        python server.py
    } -Name "Grid"
    
    Start-Sleep 2
    Write-Host "  ✓ L1T_GRID running at http://localhost:$($Ports.Grid)" -ForegroundColor Green
}

function Start-Social() {
    Write-Host "`n⚡ Starting THE GRID Social..." -ForegroundColor Green
    $status = Get-ServiceStatus $Ports.Social
    if ($status.Running) {
        Write-Host "  Already running (PID: $($status.PID))" -ForegroundColor Yellow
        return
    }
    
    $job = Start-Job -ScriptBlock {
        Set-Location "$using:ProjectRoot\modules\social"
        python -m http.server $using:Ports.Social
    } -Name "Social"
    
    Start-Sleep 2
    Write-Host "  ✓ Social running at http://localhost:$($Ports.Social)" -ForegroundColor Green
}

function Show-Status() {
    Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────"
    
    $services = @(
        @{ Name = "Dashboard"; Port = $Ports.Dashboard; Icon = "🛡️" },
        @{ Name = "L1T_GRID"; Port = $Ports.Grid; Icon = "🎬" },
        @{ Name = "Social"; Port = $Ports.Social; Icon = "⚡" }
    )
    
    foreach ($svc in $services) {
        $status = Get-ServiceStatus $svc.Port
        $icon = if ($status.Running) { "✅" } else { "❌" }
        $color = if ($status.Running) { "Green" } else { "Red" }
        Write-Host "$icon $($svc.Icon) $($svc.Name.PadRight(12)) Port: $($svc.Port) " -NoNewline
        if ($status.Running) {
            Write-Host "[RUNNING] PID: $($status.PID)" -ForegroundColor $color
        } else {
            Write-Host "[STOPPED]" -ForegroundColor $color
        }
    }
    Write-Host "─────────────────────────────────────────"
}

# Main execution
if ($Status) {
    Show-Status
    exit
}

if ($Stop) {
    Write-Host "`n🛑 Stopping all services..." -ForegroundColor Yellow
    Stop-ServiceOnPort $Ports.Dashboard
    Stop-ServiceOnPort $Ports.Grid
    Stop-ServiceOnPort $Ports.Social
    Write-Host "`n✓ All services stopped" -ForegroundColor Green
    exit
}

if ($All -or (!$Dashboard -and !$Grid -and !$Social)) {
    Start-Dashboard
    Start-Grid
    Start-Social
} else {
    if ($Dashboard) { Start-Dashboard }
    if ($Grid) { Start-Grid }
    if ($Social) { Start-Social }
}

Write-Host @"
`n$Cyan╔══════════════════════════════════════════════════════════╗
║                    🚀 Ecosystem Ready!                     ║
╠══════════════════════════════════════════════════════════╣
║  🛡️  Dashboard:  http://localhost:$($Ports.Dashboard)                     ║
║  🎬 L1T_GRID:    http://localhost:$($Ports.Grid)                     ║
║  ⚡ Social:      http://localhost:$($Ports.Social)                     ║
╚══════════════════════════════════════════════════════════╝

Commands:
  .\lit-master-launcher.ps1 -Status    # Check status
  .\lit-master-launcher.ps1 -Stop      # Stop all
  Get-Job | Remove-Job                 # Cleanup jobs
$Reset
"@

Show-Status
