<#
.SYNOPSIS
    Overlord Monolith Manager - Pro Version (WSL + Windows)
.DESCRIPTION
    Control Dashboard (8080) and Social Hub (3000) running inside WSL
.PARAMETER Action
    'start-all', 'stop-all', 'dashboard', 'social', 'status', 'logs'
#>

param(
    [ValidateSet('start-all', 'stop-all', 'status', 'dashboard', 'social', 'logs-dash', 'logs-social')]
    [string]$Action = 'status'
)

$ProjectRoot = $PSScriptRoot
$DashboardDir = "$ProjectRoot\modules\dashboard"
$SocialDir = "$ProjectRoot\modules\social"

Write-Host "💀 OVERLORD MONOLITH MANAGER (PRO WSL)" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════`n" -ForegroundColor DarkMagenta

# Helper function to run WSL bash
function Invoke-WSLBash {
    param(
        [string]$Command,
        [string]$WorkDir
    )
    if ($WorkDir) {
        # Convert Windows path to WSL path: C:\Users... -> /mnt/c/Users...
        $WSLPath = $WorkDir.ToLower() -replace '^([a-zA-Z]):', '/mnt/$1' -replace '\\', '/'
        wsl -e bash -c "cd '$WSLPath' && $Command"
    } else {
        wsl -e bash -c $Command
    }
}

switch ($Action) {
    'start-all' {
        Write-Host "🚀 Starting all services..." -ForegroundColor Green
        Write-Host "`n[1/2] Dashboard (Port 8080)..." -ForegroundColor Cyan
        Invoke-WSLBash "./start-dashboard-pro.sh" $DashboardDir
        
        Write-Host "`n[2/2] Social Hub (Port 3000)..." -ForegroundColor Cyan
        Invoke-WSLBash "./start-social-pro.sh" $SocialDir
        
        Write-Host "`n✅ All services started!`n" -ForegroundColor Green
        Write-Host "📱 Phone Access:" -ForegroundColor Yellow
        Write-Host "   Dashboard: http://192.168.0.77:8080" -ForegroundColor Cyan
        Write-Host "   Social:    http://192.168.0.77:3000" -ForegroundColor Cyan
    }
    
    'stop-all' {
        Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
        Write-Host "`n[1/2] Dashboard..." -ForegroundColor Red
        Invoke-WSLBash "./stop-dashboard.sh" $DashboardDir
        
        Write-Host "[2/2] Social Hub..." -ForegroundColor Red
        Invoke-WSLBash "./stop-social.sh" $SocialDir
        
        Write-Host "`n✅ All services stopped!`n" -ForegroundColor Green
    }
    
    'dashboard' {
        Write-Host "🚀 Starting Dashboard (Port 8080)..." -ForegroundColor Cyan
        Invoke-WSLBash "./start-dashboard-pro.sh" $DashboardDir
    }
    
    'social' {
        Write-Host "🚀 Starting Social Hub (Port 3000)..." -ForegroundColor Cyan
        Invoke-WSLBash "./start-social-pro.sh" $SocialDir
    }
    
    'status' {
        Write-Host "📊 Checking service status..." -ForegroundColor Yellow
        Write-Host ""
        
        # Check Dashboard
        Write-Host "Dashboard:" -ForegroundColor Cyan
        $DashStatus = Invoke-WSLBash "if pgrep -f 'server.py' > /dev/null; then echo 'RUNNING'; else echo 'STOPPED'; fi" $DashboardDir
        if ($DashStatus -like "*RUNNING*") {
            Write-Host "  ✅ RUNNING on http://192.168.0.77:8080" -ForegroundColor Green
        } else {
            Write-Host "  ❌ STOPPED" -ForegroundColor Red
        }
        
        # Check Social Hub
        Write-Host "`nSocial Hub:" -ForegroundColor Cyan
        $SocialStatus = Invoke-WSLBash "if pgrep -f 'http.server 3000' > /dev/null; then echo 'RUNNING'; else echo 'STOPPED'; fi" $SocialDir
        if ($SocialStatus -like "*RUNNING*") {
            Write-Host "  ✅ RUNNING on http://192.168.0.77:3000" -ForegroundColor Green
        } else {
            Write-Host "  ❌ STOPPED" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "ℹ️  Need to run Admin port forwarding? See: manage-overlord-pro.ps1 -Help" -ForegroundColor Gray
    }
    
    'logs-dash' {
        Write-Host "📋 Dashboard logs (last 20 lines):`n" -ForegroundColor Cyan
        Invoke-WSLBash "tail -n 20 server.log" $DashboardDir
    }
    
    'logs-social' {
        Write-Host "📋 Social Hub logs (last 20 lines):`n" -ForegroundColor Cyan
        Invoke-WSLBash "tail -n 20 social.log" $SocialDir
    }
}

Write-Host ""
Write-Host "💡 Quick Commands:" -ForegroundColor White
Write-Host "   .\manage-overlord-pro.ps1 start-all      # Start everything" -ForegroundColor DarkGray
Write-Host "   .\manage-overlord-pro.ps1 stop-all       # Stop everything" -ForegroundColor DarkGray
Write-Host "   .\manage-overlord-pro.ps1 status         # Check status" -ForegroundColor DarkGray
Write-Host "   .\manage-overlord-pro.ps1 logs-dash      # Dashboard logs" -ForegroundColor DarkGray
Write-Host "   .\manage-overlord-pro.ps1 logs-social    # Social logs" -ForegroundColor DarkGray
