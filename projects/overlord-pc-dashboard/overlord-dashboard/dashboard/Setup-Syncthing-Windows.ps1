#Requires -RunAsAdministrator
# 🔄 Setup Syncthing on Windows PC for Real-Time Sync with Termux
# Syncthing = Dropbox-like automatic syncing between devices

[CmdletBinding()]
param(
    [switch]$AutoStart
)

Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        SYNCTHING SETUP FOR WINDOWS           ║" -ForegroundColor Cyan
Write-Host "║        Real-Time Sync PC ↔ Phone             ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Syncthing is already installed
$SyncthingPath = "$env:LOCALAPPDATA\Syncthing\syncthing.exe"

if (Test-Path $SyncthingPath) {
    Write-Host "✓ Syncthing already installed!" -ForegroundColor Green
} else {
    Write-Host "📦 Installing Syncthing..." -ForegroundColor Yellow
    
    # Check if winget is available
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install --id=Syncthing.Syncthing -e --silent
    } else {
        # Download manually
        $DownloadUrl = "https://github.com/syncthing/syncthing/releases/latest/download/syncthing-windows-amd64.zip"
        $ZipPath = "$env:TEMP\syncthing.zip"
        $ExtractPath = "$env:LOCALAPPDATA\Syncthing"
        
        Write-Host "Downloading Syncthing..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath
        
        Write-Host "Extracting..." -ForegroundColor Yellow
        Expand-Archive -Path $ZipPath -DestinationPath $env:TEMP -Force
        
        # Move to permanent location
        New-Item -ItemType Directory -Path $ExtractPath -Force | Out-Null
        $ExtractedFolder = Get-ChildItem "$env:TEMP\syncthing-windows-amd64-*" | Select-Object -First 1
        Move-Item -Path "$($ExtractedFolder.FullName)\*" -Destination $ExtractPath -Force
        
        # Clean up
        Remove-Item $ZipPath -Force
        Remove-Item $ExtractedFolder.FullName -Recurse -Force
    }
    
    Write-Host "✓ Syncthing installed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Configuring Syncthing..." -ForegroundColor Yellow

# Add to PATH
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$env:LOCALAPPDATA\Syncthing*") {
    [Environment]::SetEnvironmentVariable(
        "Path",
        "$UserPath;$env:LOCALAPPDATA\Syncthing",
        "User"
    )
    Write-Host "✓ Added to PATH" -ForegroundColor Green
}

# Create projects folder if it doesn't exist
$ProjectsPath = "C:\projects"
if (-not (Test-Path $ProjectsPath)) {
    New-Item -ItemType Directory -Path $ProjectsPath -Force | Out-Null
    Write-Host "✓ Created C:\projects directory" -ForegroundColor Green
}

# Start Syncthing
Write-Host ""
Write-Host "🚀 Starting Syncthing..." -ForegroundColor Yellow
Start-Process -FilePath $SyncthingPath -WindowStyle Hidden

# Wait for initialization
Start-Sleep -Seconds 5

# Get Device ID
$DeviceId = & $SyncthingPath --device-id 2>$null | Select-Object -First 1

# Open web UI
Write-Host ""
Write-Host "🌐 Opening Syncthing Web UI..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://127.0.0.1:8384"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           SETUP INSTRUCTIONS                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "💻 Your PC Device ID:" -ForegroundColor Cyan
Write-Host "   $DeviceId" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Web Interface opened in browser (http://127.0.0.1:8384)" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Connect to Termux:" -ForegroundColor Cyan
Write-Host "   1. On Termux, run: bash ~/projects/setup-syncthing-termux.sh" -ForegroundColor White
Write-Host "   2. Get Termux Device ID from the output" -ForegroundColor White
Write-Host "   3. In PC web UI, click '+ Add Remote Device'" -ForegroundColor White
Write-Host "   4. Paste Termux Device ID and save" -ForegroundColor White
Write-Host ""
Write-Host "📁 Add Sync Folder:" -ForegroundColor Cyan
Write-Host "   1. In web UI, click '+ Add Folder'" -ForegroundColor White
Write-Host "   2. Folder Label: 'Overlord Projects'" -ForegroundColor White
Write-Host "   3. Folder Path: C:\projects" -ForegroundColor White
Write-Host "   4. Click 'Sharing' tab → Select Termux device" -ForegroundColor White
Write-Host "   5. Save" -ForegroundColor White
Write-Host ""

if ($AutoStart) {
    Write-Host "⚡ Setting up auto-start..." -ForegroundColor Yellow
    
    $StartupPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\Syncthing.bat"
    $BatchContent = "@echo off`nstart `"Syncthing`" `"$SyncthingPath`" -no-console"
    Set-Content -Path $StartupPath -Value $BatchContent
    
    Write-Host "✓ Syncthing will start automatically on boot" -ForegroundColor Green
} else {
    Write-Host "💡 To enable auto-start, run:" -ForegroundColor Yellow
    Write-Host "   .\Setup-Syncthing-Windows.ps1 -AutoStart" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
Write-Host "   Check status: Get-Process syncthing" -ForegroundColor White
Write-Host "   Stop:         Stop-Process -Name syncthing" -ForegroundColor White
Write-Host "   Restart:      Restart-Computer (if auto-start enabled)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Complete the setup in the web UI that just opened!" -ForegroundColor Yellow
Write-Host ""
