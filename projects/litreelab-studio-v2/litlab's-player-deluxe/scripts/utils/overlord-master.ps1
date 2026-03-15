<#
.SYNOPSIS
    Overlord Master Control - Universal launcher for all services
.DESCRIPTION
    Cross-platform launcher that works on Windows PC
    Can start, stop, sync, and manage all Overlord services
    Network-accessible from any device on your LAN
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet('start', 'stop', 'status', 'sync', 'urls', 'help')]
    [string]$Action = 'help',
    
    [Parameter(Position = 1)]
    [ValidateSet('all', 'dashboard', 'social', 'grid', 'web')]
    [string]$Service = 'all'
)

# ══════════════════════════════════════════════════════════════
#  CONFIGURATION
# ══════════════════════════════════════════════════════════════

function Resolve-FirstExistingPath {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Candidates
    )

    foreach ($candidate in $Candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    # Fall back to the first candidate so downstream code can show a clear "Path not found" warning.
    return $Candidates[0]
}

$MonolithRoot = Join-Path $PSScriptRoot 'Overlord-Monolith'
$ModulesRoot = Join-Path $MonolithRoot 'modules'

$DashboardPath = Resolve-FirstExistingPath @(
    (Join-Path $ModulesRoot 'dashboard'),
    (Join-Path $PSScriptRoot 'Overlord-Pc-Dashboard')
)

$SocialPath = Resolve-FirstExistingPath @(
    (Join-Path $ModulesRoot 'social'),
    (Join-Path $PSScriptRoot 'Overlord-Social')
)

$GridPath = Resolve-FirstExistingPath @(
    (Join-Path $ModulesRoot 'grid'),
    (Join-Path $PSScriptRoot 'L1T_GRID')
)

$Projects = @{
    'dashboard' = @{
        Name = 'PC Dashboard'
        Path = $DashboardPath
        Port = 8080
        Command = 'python'
        Args = 'server.py'
        Icon = '📊'
        Features = 'System monitoring, RAM optimizer, GPU stats'
    }
    'social' = @{
        Name = 'Overlord Social'
        Path = $SocialPath
        Port = 3000
        Command = 'python'
        Args = '-m http.server 3000 --bind 0.0.0.0'
        Icon = '🌐'
        Features = 'App launcher, Quick Launch All'
    }
    'grid' = @{
        Name = 'L1T_GRID'
        Path = $GridPath
        Port = 5000
        Command = 'python'
        Args = 'server.py'
        Icon = '🎬'
        Features = 'Torrent streaming with Real-Debrid'
    }
}

# Get local IP for LAN access
function Get-LocalIP {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | 
           Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' } |
           Select-Object -First 1).IPAddress
    if ($ip) { return $ip } else { return 'localhost' }
}

$LocalIP = Get-LocalIP

# ══════════════════════════════════════════════════════════════
#  ACTIONS
# ══════════════════════════════════════════════════════════════

function Start-OverlordServices {
    param([string]$Target)
    
    Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  🚀 STARTING OVERLORD SERVICES" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    # Stop existing processes
    Write-Host "🛑 Stopping existing Python servers..." -ForegroundColor Yellow
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "   ✓ Clean slate`n" -ForegroundColor Green
    
    # Start services
    $servicesToStart = if ($Target -eq 'all') { $Projects.Keys } else { @($Target) }
    
    foreach ($key in $servicesToStart) {
        $proj = $Projects[$key]
        Write-Host "$($proj.Icon) Starting $($proj.Name) (Port $($proj.Port))..." -ForegroundColor Cyan
        
        if (Test-Path $proj.Path) {
            Start-Process -FilePath $proj.Command `
                         -ArgumentList $proj.Args `
                         -WorkingDirectory $proj.Path `
                         -WindowStyle Hidden
            Start-Sleep -Seconds 2
        } else {
            Write-Host "   ⚠️  Path not found: $($proj.Path)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n⏳ Initializing servers..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    Show-ServiceStatus
}

function Stop-OverlordServices {
    Write-Host "`n🛑 Stopping all Overlord services..." -ForegroundColor Red
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✓ All services stopped`n" -ForegroundColor Green
}

function Show-ServiceStatus {
    Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  📡 SERVICE STATUS" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    $allRunning = $true
    
    foreach ($key in $Projects.Keys) {
        $proj = $Projects[$key]
        try {
            $connection = Get-NetTCPConnection -LocalPort $proj.Port -State Listen -ErrorAction Stop
            Write-Host "   ✓ $($proj.Icon) $($proj.Name) - Running on port $($proj.Port)" -ForegroundColor Green
        } catch {
            Write-Host "   ✗ $($proj.Icon) $($proj.Name) - NOT RUNNING" -ForegroundColor Red
            $allRunning = $false
        }
    }
    
    Write-Host ""
    
    if ($allRunning) {
        Show-AccessURLs
    } else {
        Write-Host "⚠️  Some services failed. Check logs or run: Get-Process python" -ForegroundColor Yellow
    }
}

function Show-AccessURLs {
    Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ✅ ALL SYSTEMS OPERATIONAL" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    Write-Host "🏠 LOCAL ACCESS (This PC):" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────" -ForegroundColor DarkGray
    foreach ($key in $Projects.Keys) {
        $proj = $Projects[$key]
        Write-Host "   $($proj.Icon) $($proj.Name):" -NoNewline
        Write-Host " http://localhost:$($proj.Port)" -ForegroundColor Cyan
    }
    
    Write-Host "`n📱 NETWORK ACCESS (From Phone/Other Devices):" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────" -ForegroundColor DarkGray
    foreach ($key in $Projects.Keys) {
        $proj = $Projects[$key]
        Write-Host "   $($proj.Icon) $($proj.Name):" -NoNewline
        Write-Host " http://${LocalIP}:$($proj.Port)" -ForegroundColor Magenta
    }
    
    Write-Host "`n💡 Network IP: " -NoNewline -ForegroundColor Yellow
    Write-Host $LocalIP -ForegroundColor White
    Write-Host "💡 Share these URLs with your phone's browser" -ForegroundColor Gray
    Write-Host "💡 To stop: " -NoNewline -ForegroundColor Yellow
    Write-Host ".\overlord-master.ps1 stop`n" -ForegroundColor White
}

function Sync-WithGitHub {
    Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  🔄 SYNCING WITH GITHUB" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    foreach ($key in $Projects.Keys) {
        $proj = $Projects[$key]
        if (Test-Path "$($proj.Path)\.git") {
            Write-Host "$($proj.Icon) Syncing $($proj.Name)..." -ForegroundColor Cyan
            Push-Location $proj.Path
            
            # Pull latest
            git pull origin main 2>&1 | Out-Null
            
            # Check for changes
            $status = git status --porcelain
            if ($status) {
                Write-Host "   📝 Changes detected, committing..." -ForegroundColor Yellow
                git add .
                git commit -m "Auto-sync $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
                git push origin main
                Write-Host "   ✓ Pushed to GitHub" -ForegroundColor Green
            } else {
                Write-Host "   ✓ Up to date" -ForegroundColor Green
            }
            
            Pop-Location
        } else {
            Write-Host "$($proj.Icon) $($proj.Name) - Not a git repo (skipped)" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n✅ GitHub sync complete`n" -ForegroundColor Green
}

function Show-Help {
    Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  🎮 OVERLORD MASTER CONTROL" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\overlord-master.ps1 [action] [service]`n" -ForegroundColor White
    
    Write-Host "ACTIONS:" -ForegroundColor Yellow
    Write-Host "  start [service]  - Start services (default: all)" -ForegroundColor White
    Write-Host "  stop             - Stop all services" -ForegroundColor White
    Write-Host "  status           - Show running status" -ForegroundColor White
    Write-Host "  sync             - Sync all repos with GitHub" -ForegroundColor White
    Write-Host "  urls             - Show access URLs" -ForegroundColor White
    Write-Host "  help             - Show this help`n" -ForegroundColor White
    
    Write-Host "SERVICES:" -ForegroundColor Yellow
    Write-Host "  all              - All services (default)" -ForegroundColor White
    Write-Host "  dashboard        - PC Dashboard (8080)" -ForegroundColor White
    Write-Host "  social           - Overlord Social (3000)" -ForegroundColor White
    Write-Host "  grid             - L1T_GRID (5000)`n" -ForegroundColor White
    
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\overlord-master.ps1 start" -ForegroundColor Cyan
    Write-Host "  .\overlord-master.ps1 start dashboard" -ForegroundColor Cyan
    Write-Host "  .\overlord-master.ps1 sync" -ForegroundColor Cyan
    Write-Host "  .\overlord-master.ps1 stop`n" -ForegroundColor Cyan
}

# ══════════════════════════════════════════════════════════════
#  MAIN EXECUTION
# ══════════════════════════════════════════════════════════════

switch ($Action) {
    'start'  { Start-OverlordServices -Target $Service }
    'stop'   { Stop-OverlordServices }
    'status' { Show-ServiceStatus }
    'sync'   { Sync-WithGitHub }
    'urls'   { Show-AccessURLs }
    'help'   { Show-Help }
    default  { Show-Help }
}
