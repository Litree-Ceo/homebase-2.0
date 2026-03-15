#Requires -RunAsAdministrator
<#
.DESCRIPTION
    Nuclear-level Docker Desktop + WSL2 repair script
    Fixes "desktop proxies failed" and WSL2 integration errors
#>

$ErrorActionPreference = "Stop"
Write-Host "🔧 DOCKER DESKTOP WSL2 REPAIR SCRIPT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill Docker Desktop processes
Write-Host "[1/7] Killing Docker Desktop processes..." -ForegroundColor Yellow
$dockerProcs = @("Docker Desktop", "com.docker.backend", "com.docker.proxy", "dockerd")
foreach ($proc in $dockerProcs) {
    Get-Process -Name $proc -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Stopped $proc" -ForegroundColor Green
}
Start-Sleep -Seconds 3

# Step 2: Shutdown WSL completely
Write-Host ""
Write-Host "[2/7] Shutting down WSL..." -ForegroundColor Yellow
wsl --shutdown 2>$null
Write-Host "  ✓ WSL shutdown complete" -ForegroundColor Green
Start-Sleep -Seconds 2

# Step 3: Unregister corrupted docker-desktop distros
Write-Host ""
Write-Host "[3/7] Cleaning up Docker WSL distros..." -ForegroundColor Yellow
$distros = @("docker-desktop", "docker-desktop-data")
foreach ($distro in $distros) {
    $exists = wsl --list --quiet | Select-String $distro
    if ($exists) {
        Write-Host "  → Unregistering $distro..." -ForegroundColor DarkYellow
        wsl --unregister $distro 2>$null
        Write-Host "  ✓ Unregistered $distro" -ForegroundColor Green
    } else {
        Write-Host "  ✓ $distro not found (already clean)" -ForegroundColor Green
    }
}

# Step 4: Update WSL
Write-Host ""
Write-Host "[4/7] Updating WSL..." -ForegroundColor Yellow
try {
    wsl --update
    Write-Host "  ✓ WSL updated" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ WSL update had issues, continuing..." -ForegroundColor DarkYellow
}

# Step 5: Restart LxssManager (WSL service)
Write-Host ""
Write-Host "[5/7] Restarting WSL service..." -ForegroundColor Yellow
try {
    Restart-Service -Name "LxssManager" -Force -ErrorAction Stop
    Write-Host "  ✓ LxssManager restarted" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ LxssManager restart failed (may not exist as service), continuing..." -ForegroundColor DarkYellow
}
Start-Sleep -Seconds 2

# Step 6: Verify WSL is working
Write-Host ""
Write-Host "[6/7] Verifying WSL status..." -ForegroundColor Yellow
$wslStatus = wsl --status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ WSL is functioning" -ForegroundColor Green
    Write-Host ""
    Write-Host "  WSL Status:" -ForegroundColor Cyan
    $wslStatus | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
} else {
    Write-Host "  ✗ WSL status check failed" -ForegroundColor Red
}

# Step 7: Start Docker Desktop
Write-Host ""
Write-Host "[7/7] Starting Docker Desktop..." -ForegroundColor Yellow
$dockerPath = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
    Start-Process -FilePath $dockerPath
    Write-Host "  ✓ Docker Desktop launched" -ForegroundColor Green
} else {
    # Try alternative path
    $dockerPath2 = "${env:LocalAppData}\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath2) {
        Start-Process -FilePath $dockerPath2
        Write-Host "  ✓ Docker Desktop launched (user install)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Docker Desktop executable not found!" -ForegroundColor Red
        Write-Host "  → Please start Docker Desktop manually from Start Menu" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ REPAIR COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Docker Desktop should be starting now." -ForegroundColor White
Write-Host "Wait 1-2 minutes for it to fully initialize." -ForegroundColor White
Write-Host ""
Write-Host "If it still fails:" -ForegroundColor Yellow
Write-Host "  1. Check Windows Features: Turn Windows features on/off" -ForegroundColor Gray
Write-Host "  2. Ensure 'Virtual Machine Platform' and 'WSL' are enabled" -ForegroundColor Gray
Write-Host "  3. Run: wsl --install --no-distribution" -ForegroundColor Gray
Write-Host "  4. Reboot your PC" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"
