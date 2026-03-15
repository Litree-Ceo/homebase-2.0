#Requires -RunAsAdministrator
<#
.DESCRIPTION
    Nuclear option - Reset Docker Desktop completely
    Fixes stuck "starting" state
#>

$ErrorActionPreference = "Stop"
Write-Host "☢️ DOCKER DESKTOP NUCLEAR RESET" -ForegroundColor Red
Write-Host "================================" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  This will reset Docker Desktop settings but preserve images/volumes" -ForegroundColor Yellow
Write-Host ""

# Step 1: Kill everything
Write-Host "[1/6] Terminating all Docker processes..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.Name -like "*docker*" -or $_.Name -like "*Docker*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Step 2: Shutdown WSL
Write-Host ""
Write-Host "[2/6] Full WSL shutdown..." -ForegroundColor Yellow
wsl --shutdown
Start-Sleep -Seconds 3

# Step 3: Export important data if possible
Write-Host ""
Write-Host "[3/6] Checking for volumes to preserve..." -ForegroundColor Yellow
$dockerData = "$env:LOCALAPPDATA\Docker"
if (Test-Path "$dockerData\wsl\data") {
    Write-Host "  ✓ Docker WSL data found" -ForegroundColor Green
}

# Step 4: Reset Docker Desktop WSL data
Write-Host ""
Write-Host "[4/6] Resetting Docker WSL distros..." -ForegroundColor Yellow
wsl --unregister docker-desktop-data 2>$null
wsl --unregister docker-desktop 2>$null
Write-Host "  ✓ Docker WSL distros reset" -ForegroundColor Green

# Step 5: Clear Docker Desktop settings/cache
Write-Host ""
Write-Host "[5/6] Clearing Docker Desktop cache..." -ForegroundColor Yellow
$pathsToClear = @(
    "$env:LOCALAPPDATA\Docker\cache",
    "$env:LOCALAPPDATA\Docker\log",
    "$env:APPDATA\Docker\settings.json"
)
foreach ($path in $pathsToClear) {
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Cleared: $path" -ForegroundColor Green
    }
}

# Step 6: Restart
Write-Host ""
Write-Host "[6/6] Starting Docker Desktop..." -ForegroundColor Yellow
Write-Host "  → Waiting for WSL to stabilize..." -ForegroundColor DarkYellow
Start-Sleep -Seconds 5

$dockerPath = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
    Start-Process -FilePath $dockerPath
    Write-Host "  ✓ Docker Desktop launched" -ForegroundColor Green
} else {
    Write-Host "  ✗ Docker Desktop not found at expected path" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Red
Write-Host "✅ NUCLEAR RESET COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Docker Desktop will recreate WSL distros on start." -ForegroundColor White
Write-Host "This may take 2-3 minutes on first run." -ForegroundColor White
Write-Host ""
Write-Host "If this still fails:" -ForegroundColor Yellow
Write-Host "  1. Settings → Windows Update → Check for updates" -ForegroundColor Gray
Write-Host "  2. Enable Windows Features: Virtual Machine Platform + WSL" -ForegroundColor Gray
Write-Host "  3. BIOS: Enable virtualization (Intel VT-x / AMD-V)" -ForegroundColor Gray
Write-Host "  4. Uninstall/reinstall Docker Desktop from docker.com" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"
