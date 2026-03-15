param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "status", "restart")]
    [string]$Action = "status"
)

# --- CONFIGURATION ---
$RootDir = $PSScriptRoot
$VenvPython = Join-Path $RootDir "modules\dashboard\.venv\Scripts\python.exe"

# Fallback checking
if (-not (Test-Path $VenvPython)) {
    Write-Warning "Virtual Environment python not found at $VenvPython. Will try 'python' command."
    $VenvPython = "python"
}

$Services = @(
    @{
        Name = "Dashboard"
        Port = 8080
        Path = "app.py"
        Dir  = "modules\dashboard"
        Exe  = $VenvPython
        Args = @("app.py")
    }
)

# --- FUNCTIONS ---

function Get-NetStat {
    param($Port)
    # Filter out TimeWait to avoid false positives on restart
    Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object {$_.State -eq 'Listen'} | Select-Object -First 1
}

function Stop-Svc {
    param($Svc)
    $net = Get-NetStat -Port $Svc.Port
    if ($net) {
        $pidKill = $net.OwningProcess
        Write-Host "🛑 Killing $($Svc.Name) (PID: $pidKill)..." -ForegroundColor Yellow
        Stop-Process -Id $pidKill -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "⚪ $($Svc.Name) checked (Port $($Svc.Port) free)." -ForegroundColor DarkGray
    }
}

function Start-Svc {
    param($Svc)
    $net = Get-NetStat -Port $Svc.Port
    if ($net) {
        Write-Host "⚠️ $($Svc.Name) is already running on Port $($Svc.Port)." -ForegroundColor Yellow
        return
    }

    $WorkDir = Join-Path $RootDir $Svc.Dir
    $LogOut = Join-Path $WorkDir "$($Svc.Name).out.log"
    $LogErr = Join-Path $WorkDir "$($Svc.Name).err.log"
    
    Write-Host "🚀 Starting $($Svc.Name) in background..." -ForegroundColor Cyan

    if (-not $Svc.Exe) {
        Write-Host "❌ Cannot start $($Svc.Name): executable not available." -ForegroundColor Red
        return
    }

    Start-Process -FilePath $Svc.Exe -ArgumentList $Svc.Args -WorkingDirectory $WorkDir -WindowStyle Hidden -RedirectStandardOutput $LogOut -RedirectStandardError $LogErr
    
    Start-Sleep -Seconds 2
}

function Show-Status {
    Write-Host "`n📊 OVERLORD DASHBOARD STATUS" -ForegroundColor Magenta
    Write-Host "===========================" -ForegroundColor Gray
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.InterfaceAlias -notlike "*vEthernet*" -and $_.InterfaceAlias -notlike "*WSL*" -and $_.IPAddress -notlike "169.254.*" }).IPAddress | Select-Object -First 1
    
    if (-not $ip) { $ip = "localhost" }

    Write-Host "`n🔗 ACCESS URLs:" -ForegroundColor Cyan
    Write-Host "  - Main Dashboard: http://localhost (redirects to https)" -ForegroundColor Cyan
    Write-Host "  - Secure Dashboard: https://localhost" -ForegroundColor Cyan
    Write-Host "  - Direct API Access: http://localhost:8080" -ForegroundColor DarkGray

    Write-Host "`n🔧 SERVICES:" -ForegroundColor Gray
    foreach ($Svc in $Services) {
        $net = Get-NetStat -Port $Svc.Port
        if ($net) {
            Write-Host "  ✅ $($Svc.Name.PadRight(10)) : ONLINE  (PID: $($net.OwningProcess))" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $($Svc.Name.PadRight(10)) : OFFLINE" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# --- EXECUTION ---

if ($Action -eq "stop" -or $Action -eq "restart") {
    foreach ($Svc in $Services) { Stop-Svc -Svc $Svc }
    Start-Sleep -Seconds 1
}

if ($Action -eq "start" -or $Action -eq "restart") {
    foreach ($Svc in $Services) { Start-Svc -Svc $Svc }
    # Wait a moment for listeners to come up
    Start-Sleep -Seconds 5
}

Show-Status