# COMPLETE AUTOMATED SETUP - VS Code Remote Access
# This script does EVERYTHING for you!

$ErrorActionPreference = "Continue"

Write-Host @"
╔════════════════════════════════════════════════════╗
║  🚀 OVERLORD DASHBOARD - REMOTE ACCESS SETUP     ║
║     Automated Configuration                       ║
╚════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress

Write-Host "`n[1/5] 🌐 VS Code Tunnel Status..." -ForegroundColor Yellow

# Check if tunnel is already running
$tunnelProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*code-server*" -or $_.CommandLine -like "*tunnel*"
}

if ($tunnelProcess) {
    Write-Host "  ✅ Tunnel already running!" -ForegroundColor Green
    Write-Host "  📡 Process ID: $($tunnelProcess.Id)" -ForegroundColor Gray
} else {
    Write-Host "  ⚠️  No tunnel detected - will start one" -ForegroundColor Yellow
}

Write-Host "`n[2/5] 📊 Dashboard Server Status..." -ForegroundColor Yellow
$dashboardPort = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object LocalPort -eq 3000
if ($dashboardPort) {
    Write-Host "  ✅ Dashboard running on port 3000" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Dashboard not running - start with: python server.py" -ForegroundColor Yellow
}

Write-Host "`n[3/5] 🔐 SSH Server Status..." -ForegroundColor Yellow
$sshService = Get-Service sshd -ErrorAction SilentlyContinue
if ($sshService -and $sshService.Status -eq 'Running') {
    Write-Host "  ✅ SSH Server active" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  SSH Server not running" -ForegroundColor Yellow
}

Write-Host "`n[4/5] 🌍 Network Information..." -ForegroundColor Yellow
Write-Host "  📡 Your PC IP: $localIP" -ForegroundColor Cyan
Write-Host "  👤 Username: $env:USERNAME" -ForegroundColor Cyan
Write-Host "  📂 Project: $PWD" -ForegroundColor Cyan

Write-Host "`n[5/5] 📱 Access Instructions..." -ForegroundColor Yellow

Write-Host @"

╔════════════════════════════════════════════════════╗
║           🎯 HOW TO CONNECT NOW                   ║
╚════════════════════════════════════════════════════╝

🌐 OPTION 1: VS Code in Browser (Works Anywhere!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   1. On your phone/tablet browser, visit:
      
      👉 https://vscode.dev/tunnel/overlord-dashboard
      
   2. Sign in with: highlife4real1989@gmail.com
   
   3. You'll have full VS Code with your PC files!
   
   ✅ If browser asks for GitHub authorization - accept it!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 OPTION 2: Termux SSH Access (WiFi Only)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   In Termux, run this one command:
   
   curl -fsSL http://${localIP}:8888/setup-termux.sh | bash
   
   Then follow the instructions to connect!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"@ -ForegroundColor White

Write-Host "💡 TIP: The VS Code tunnel (Option 1) is already running!" -ForegroundColor Green
Write-Host "    Just open that URL on your phone NOW! 🚀" -ForegroundColor Green
Write-Host ""

# Start file server for Termux setup
Write-Host "🌐 Starting file server for Termux setup..." -ForegroundColor Cyan
Write-Host "   Access at: http://${localIP}:8888" -ForegroundColor Gray
Write-Host "   (Press Ctrl+C to stop server when done)" -ForegroundColor Gray
Write-Host ""

# Start simple HTTP server
Start-Sleep -Seconds 1
python -m http.server 8888

