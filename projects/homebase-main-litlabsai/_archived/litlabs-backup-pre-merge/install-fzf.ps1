<![CDATA[
# FZF Installation Script for HomeBase 2.0
# Dedicated script to install fzf for PowerShell environment

Write-Host "Installing fzf for HomeBase development..." -ForegroundColor Green

# Check if fzf is already installed
$fzfAvailable = Get-Command fzf -ErrorAction SilentlyContinue

if ($fzfAvailable) {
    Write-Host "fzf is already installed at $(Get-Command fzf | Select-Object -ExpandProperty Source)" -ForegroundColor Green
    exit 0
}

# Installation process
try {
    Write-Host "Downloading fzf..." -ForegroundColor Yellow
    
    # Download latest stable release
    $url = "https://github.com/junegunn/fzf/releases/download/0.43.0/fzf-0.43.0-windows_amd64.zip"
    $tempPath = "$env:TEMP\fzf.zip"
    $installPath = "C:\tools\fzf"
    
    # Create tools directory if needed
    if (!(Test-Path "C:\tools")) {
        New-Item -ItemType Directory -Path "C:\tools" -Force | Out-Null
    }
    
    Invoke-WebRequest -Uri $url -OutFile $tempPath -UseBasicParsing
    Expand-Archive -Path $tempPath -DestinationPath $installPath -Force
    Remove-Item $tempPath -Force
    
    # Add to user PATH
    [Environment]::SetEnvironmentVariable(
        "Path",
        [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User) + ";$installPath",
        [EnvironmentVariableTarget]::User
    )
    
    Write-Host "fzf installed successfully at $installPath" -ForegroundColor Green
    Write-Host "Note: You may need to restart your terminal/PowerShell for changes to take effect" -ForegroundColor Yellow
}
catch {
    Write-Host "Error installing fzf: $_" -ForegroundColor Red
    Write-Host "You may need to download manually from: https://github.com/junegunn/fzf/releases" -ForegroundColor Red
    exit 1
}

# Verify PSFzf module availability
Write-Host "Checking PSFzf module..." -ForegroundColor Yellow
if (!(Get-Module -ListAvailable -Name PSFzf)) {
    try {
        Install-Module -Name PSFzf -Force -Scope CurrentUser -AllowClobber -ErrorAction Stop
        Write-Host "PSFzf module installed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to install PSFzf module. You can install manually after fzf is working:" -ForegroundColor Red
        Write-Host "Install-Module -Name PSFzf -Force -Scope CurrentUser" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "PSFzf module is already installed" -ForegroundColor Green
}

Write-Host "FZF setup completed successfully!" -ForegroundColor Green
]]>
