# Quick Start - Overlord Remote Access
# Run this after following REMOTE-ACCESS-GUIDE.md

Write-Host @"
╔═══════════════════════════════════════════════════╗
║  🚀 OVERLORD DASHBOARD - REMOTE ACCESS STATUS   ║
╚═══════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check SSH Server
Write-Host "`n[1/4] Checking SSH Server..." -ForegroundColor Yellow
$sshService = Get-Service sshd -ErrorAction SilentlyContinue
if ($sshService.Status -eq 'Running') {
    Write-Host "  ✅ SSH Server is running" -ForegroundColor Green
} else {
    Write-Host "  ❌ SSH Server not running - Starting..." -ForegroundColor Red
    Start-Service sshd
    Write-Host "  ✅ Started SSH Server" -ForegroundColor Green
}

# Check VS Code
Write-Host "`n[2/4] Checking VS Code..." -ForegroundColor Yellow
if (Get-Command code -ErrorAction SilentlyContinue) {
    Write-Host "  ✅ VS Code found" -ForegroundColor Green
} else {
    Write-Host "  ❌ VS Code not in PATH" -ForegroundColor Red
}

# Check Python Server
Write-Host "`n[3/4] Checking Dashboard Server..." -ForegroundColor Yellow
$pythonProcess = Get-Process python -ErrorAction SilentlyContinue | Where-Object {
    (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object LocalPort -eq 3000)
}
if ($pythonProcess) {
    Write-Host "  ✅ Dashboard running on port 3000" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Dashboard not running" -ForegroundColor Yellow
    Write-Host "     Start with: python server.py" -ForegroundColor Gray
}

# Get PC Info
Write-Host "`n[4/4] Your PC Connection Info..." -ForegroundColor Yellow
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress
Write-Host "  📡 Username: $env:USERNAME" -ForegroundColor Cyan
Write-Host "  📡 Local IP: $localIP" -ForegroundColor Cyan
Write-Host "  📂 Project:  $PWD" -ForegroundColor Cyan

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Gray

Write-Host "`n📱 TERMUX SETUP:" -ForegroundColor Yellow
Write-Host @"
1. ssh-keygen -t ed25519 -C "termux"
2. cat ~/.ssh/id_ed25519.pub
3. Copy that key, then run: .\add-termux-key.ps1
4. Edit termux-tunnel.sh:
   - PC_USER="$env:USERNAME"
   - PC_IP="$localIP"
5. Copy termux-tunnel.sh to your phone
6. Run: chmod +x termux-tunnel.sh && ./termux-tunnel.sh
"@ -ForegroundColor White

Write-Host "`n💡 TIP: View full guide in REMOTE-ACCESS-GUIDE.md`n" -ForegroundColor Gray
