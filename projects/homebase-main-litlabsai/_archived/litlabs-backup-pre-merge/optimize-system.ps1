# System Optimization Script for HomeBase 2.0
# Fixes PowerShell profile issues and optimizes performance

Write-Host "Optimizing system for HomeBase 2.0..." -ForegroundColor Green

# 1. Fix PowerShell profile issues
Write-Host "Checking PowerShell profile..." -ForegroundColor Yellow
$profilePath = $PROFILE.CurrentUserAllHosts
$profileDir = Split-Path $profilePath -Parent

# Create profile directory if it doesn't exist
if (!(Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    Write-Host "Created PowerShell profile directory" -ForegroundColor Green
}

# 2. Check and optionally install PSFzf module
Write-Host "Checking PSFzf module..." -ForegroundColor Yellow
if (!(Get-Module -ListAvailable -Name PSFzf)) {
    Write-Host "PSFzf not found. Attempting automatic installation..." -ForegroundColor Yellow
    try {
        # Run the installation script
        & "$PSScriptRoot\install-fzf.ps1"
        Write-Host "PSFzf setup completed" -ForegroundColor Green
    }
    catch {
        Write-Host "Automatic installation failed: $_" -ForegroundColor Red
        Write-Host "You may need to run '.\install-fzf.ps1' manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "PSFzf is already installed" -ForegroundColor Green
}

# 3. Fix npm environment warnings
Write-Host "Cleaning npm environment..." -ForegroundColor Yellow
npm config delete npm-globalconfig --global 2>$null
npm config delete verify-deps-before-run --global 2>$null
npm config delete _jsr-registry --global 2>$null
Write-Host "Removed problematic npm configs" -ForegroundColor Green

# 4. Performance optimizations
Write-Host "Applying performance optimizations..." -ForegroundColor Yellow

# Increase PowerShell process priority
$process = Get-Process -Id $PID
$process.PriorityClass = "AboveNormal"
Write-Host "Increased PowerShell process priority" -ForegroundColor Green

# Clean temporary files
Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Cleaned temporary files" -ForegroundColor Green

Write-Host "`nOptimization complete! System should be more responsive." -ForegroundColor Green
Write-Host "Restart PowerShell for all changes to take effect." -ForegroundColor Yellow
