# Overlord PC Dashboard - Remote VS Code Setup for Termux Access
# Run this ONCE on your Windows PC to enable remote coding from Android

Write-Host "🚀 Setting up VS Code Remote Access..." -ForegroundColor Cyan

# Configuration
$TUNNEL_NAME = "overlord-dashboard"
$PC_USER = $env:USERNAME
$PC_IP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress

Write-Host "📡 Your PC details:" -ForegroundColor Yellow
Write-Host "   Username: $PC_USER"
Write-Host "   Local IP: $PC_IP"
Write-Host "   Project: $PWD"

# Check if VS Code is installed
$codePath = Get-Command code -ErrorAction SilentlyContinue
if (-not $codePath) {
    Write-Host "❌ VS Code not found in PATH. Please install VS Code first." -ForegroundColor Red
    exit 1
}

Write-Host "`n🔧 Step 1: Installing VS Code Tunnel Service..." -ForegroundColor Green

# Enable VS Code tunnel (this creates a secure tunnel accessible from anywhere)
Write-Host "Starting VS Code tunnel - you'll need to authenticate with GitHub..." -ForegroundColor Yellow
Write-Host "A browser will open. Sign in, then come back here." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; code tunnel --name $TUNNEL_NAME --accept-server-license-terms" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "`n🔧 Step 2: Enabling SSH Server on Windows..." -ForegroundColor Green

# Check if OpenSSH Server is installed
$sshServer = Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'
if ($sshServer.State -ne "Installed") {
    Write-Host "Installing OpenSSH Server..." -ForegroundColor Yellow
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
    Start-Service sshd
    Set-Service -Name sshd -StartupType 'Automatic'
    Write-Host "✅ SSH Server installed and started" -ForegroundColor Green
} else {
    Write-Host "✅ SSH Server already installed" -ForegroundColor Green
    Start-Service sshd -ErrorAction SilentlyContinue
}

# Configure SSH to allow key authentication
$sshdConfigPath = "C:\ProgramData\ssh\sshd_config"
if (Test-Path $sshdConfigPath) {
    $config = Get-Content $sshdConfigPath
    if ($config -notmatch "PubkeyAuthentication yes") {
        Add-Content $sshdConfigPath "`nPubkeyAuthentication yes"
        Restart-Service sshd
        Write-Host "✅ SSH configured for key authentication" -ForegroundColor Green
    }
}

Write-Host "`n📋 NEXT STEPS - Do these in Termux:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "1️⃣  Generate SSH key in Termux:" -ForegroundColor Yellow
Write-Host "    ssh-keygen -t ed25519 -C 'termux-overlord'"
Write-Host "    cat ~/.ssh/id_ed25519.pub"
Write-Host ""
Write-Host "2️⃣  Copy that key, then BACK HERE run:" -ForegroundColor Yellow
Write-Host "    .\add-termux-key.ps1"
Write-Host ""
Write-Host "3️⃣  Test connection from Termux:" -ForegroundColor Yellow
Write-Host "    ssh $PC_USER@$PC_IP"
Write-Host ""
Write-Host "4️⃣  Run the tunnel script in Termux:" -ForegroundColor Yellow
Write-Host "    See termux-tunnel.sh for details"
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Gray

# Create the key addition script
$addKeyScript = @'
# Add Termux SSH Key to Windows
Write-Host "Paste your Termux public key (the output from 'cat ~/.ssh/id_ed25519.pub'):" -ForegroundColor Yellow
$termuxKey = Read-Host

$sshDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir | Out-Null
}

$authorizedKeys = "$sshDir\authorized_keys"
Add-Content -Path $authorizedKeys -Value $termuxKey

Write-Host "✅ Termux key added! Test with: ssh $env:USERNAME@YOUR_PC_IP" -ForegroundColor Green
'@

Set-Content -Path ".\add-termux-key.ps1" -Value $addKeyScript

Write-Host "`n✅ Setup script complete! Follow the steps above." -ForegroundColor Green
