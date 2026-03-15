<#
.SYNOPSIS
    Project Overlord Master Control Script v2.0
.DESCRIPTION
    Unified management for all Overlord services with real-time monitoring
#>

param(
    [Parameter()]
    [ValidateSet("start", "stop", "restart", "status", "logs", "update", "monitor", "failover")]
    [string]$Command = "status",
    
    [string]$Service = "all"
)

$Services = @{
    Dashboard = @{ Port = 8080; NssmName = "Overlord-Dashboard"; Path = "C:\Overlord\dashboard" }
    SocialHub = @{ Port = 3000; NssmName = "Overlord-SocialHub"; Path = "C:\Overlord\social" }
    Grid      = @{ Port = 5000; NssmName = "Overlord-Grid"; Path = "C:\Overlord\grid" }
    Watchdog  = @{ Port = 0; NssmName = "Overlord-Watchdog"; Path = "C:\Overlord\watchdog" }
}

$FirebaseUrl = "https://your-firebase-project.firebaseio.com/overlord/status.json"

function Show-Status {
    Clear-Host
    Write-Host "=== PROJECT OVERLORD SYSTEM STATUS ===" -ForegroundColor Cyan
    Write-Host ""
    
    # Fetch from Firebase
    try {
        $status = Invoke-RestMethod -Uri $FirebaseUrl -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host "Host: " -NoNewline -ForegroundColor Gray
        Write-Host "$($status.host) ($($status.ip))" -ForegroundColor White
        Write-Host "Last Update: " -NoNewline -ForegroundColor Gray
        Write-Host "$($status.timestamp)" -ForegroundColor White
        Write-Host "Overall Health: " -NoNewline -ForegroundColor Gray
        
        switch ($status.overallHealth) {
            "healthy" { Write-Host "HEALTHY ✓" -ForegroundColor Green }
            "degraded" { Write-Host "DEGRADED ⚠" -ForegroundColor Yellow }
            "critical" { Write-Host "CRITICAL ✖" -ForegroundColor Red }
            "failover" { Write-Host "FAILOVER MODE ⚡" -ForegroundColor Magenta }
            default { Write-Host "UNKNOWN ?" -ForegroundColor Gray }
        }
        Write-Host ""
        
        # Services table
        Write-Host "SERVICES:" -ForegroundColor Cyan
        $status.services | ForEach-Object {
            $color = if ($_.Status -eq "healthy") { "Green" } else { "Red" }
            $icon = if ($_.Status -eq "healthy") { "●" } else { "○" }
            Write-Host "  $icon " -NoNewline -ForegroundColor $color
            Write-Host "$($_.Name.PadRight(12)) " -NoNewline
            Write-Host "$($_.Status.PadRight(10)) " -NoNewline -ForegroundColor $color
            
            if ($_.Status -eq "healthy") {
                $uptime = [math]::Round($_.Uptime / 60, 1)
                Write-Host "Uptime: ${uptime}m" -ForegroundColor Gray
            } else {
                Write-Host "ERROR: $($_.Error)" -ForegroundColor Red
            }
        }
        
        # Alerts
        if ($status.alerts -and $status.alerts.Count -gt 0) {
            Write-Host ""
            Write-Host "ACTIVE ALERTS:" -ForegroundColor Red
            $status.alerts | ForEach-Object {
                Write-Host "  [!] $($_.message)" -ForegroundColor Yellow
            }
        }
        
        # System metrics
        Write-Host ""
        Write-Host "SYSTEM:" -ForegroundColor Cyan
        Write-Host "  CPU: $($status.system.cpu.ToString('F1'))%" -ForegroundColor Gray
        Write-Host "  Memory: $($status.system.memoryFree)MB free / $($status.system.memoryTotal)GB total" -ForegroundColor Gray
        Write-Host "  OS Uptime: $($status.system.uptime.Days)d $($status.system.uptime.Hours)h" -ForegroundColor Gray
        
    } catch {
        Write-Host "ERROR: Cannot fetch status from Firebase" -ForegroundColor Red
        Write-Host $_ -ForegroundColor DarkRed
        
        # Fallback to local service check
        Write-Host ""
        Write-Host "FALLBACK: Checking local services..." -ForegroundColor Yellow
        $Services.Keys | Where-Object { $_ -ne "Watchdog" } | ForEach-Object {
            $svc = $Services[$_]
            $running = (Get-Service -Name $svc.NssmName -ErrorAction SilentlyContinue).Status -eq "Running"
            $color = if ($running) { "Green" } else { "Red" }
            $status = if ($running) { "Running (Service)" } else { "Stopped" }
            Write-Host "  ● $_.PadRight(12) $status" -ForegroundColor $color
        }
    }
    
    Write-Host ""
    Write-Host "Commands: control.ps1 -Command [start|stop|restart|status|logs|monitor]" -ForegroundColor DarkGray
}

function Control-Service {
    param($Action, $ServiceName)
    
    if ($ServiceName -eq "all") {
        $targets = $Services.Keys
    } else {
        $targets = @($ServiceName)
    }
    
    foreach ($name in $targets) {
        if (-not $Services.ContainsKey($name)) {
            Write-Host "Unknown service: $name" -ForegroundColor Red
            continue
        }
        
        $svc = $Services[$name]
        Write-Host "$Action $name..." -NoNewline -ForegroundColor Yellow
        
        try {
            switch ($Action) {
                "start" { Start-Service -Name $svc.NssmName -ErrorAction Stop; Write-Host " DONE" -ForegroundColor Green }
                "stop" { Stop-Service -Name $svc.NssmName -Force -ErrorAction Stop; Write-Host " DONE" -ForegroundColor Green }
                "restart" { Restart-Service -Name $svc.NssmName -Force -ErrorAction Stop; Write-Host " DONE" -ForegroundColor Green }
            }
        } catch {
            Write-Host " FAILED" -ForegroundColor Red
            Write-Host "  Error: $_" -ForegroundColor DarkRed
        }
    }
}

function Show-Logs {
    param($ServiceName)
    $logPaths = @(
        "C:\Overlord\logs\watchdog.log",
        "C:\Overlord\logs\watchdog.err.log",
        "C:\Overlord\dashboard\logs\app.log",
        "C:\Overlord\social\logs\app.log",
        "C:\Overlord\grid\logs\app.log"
    )
    
    if ($ServiceName -ne "all" -and $Services.ContainsKey($ServiceName)) {
        $path = "C:\Overlord\$($ServiceName.ToLower())\logs\app.log"
        if (Test-Path $path) {
            Get-Content $path -Tail 50 -Wait
        }
    } else {
        # Show all recent logs
        $logPaths | ForEach-Object {
            if (Test-Path $_) {
                Write-Host "`n=== $_ ===" -ForegroundColor Cyan
                Get-Content $_ -Tail 20
            }
        }
    }
}

function Enter-MonitorMode {
    Write-Host "Entering real-time monitor mode (Ctrl+C to exit)..." -ForegroundColor Cyan
    while ($true) {
        Show-Status
        Start-Sleep -Seconds 5
    }
}

# Main execution
switch ($Command) {
    "status" { Show-Status }
    "start" { Control-Service -Action "start" -ServiceName $Service }
    "stop" { Control-Service -Action "stop" -ServiceName $Service }
    "restart" { Control-Service -Action "restart" -ServiceName $Service }
    "logs" { Show-Logs -ServiceName $Service }
    "monitor" { Enter-MonitorMode }
    "failover" { 
        Write-Host "Triggering manual failover..." -ForegroundColor Yellow
        # Stop all services to simulate failure
        Control-Service -Action "stop" -ServiceName "all"
    }
}
