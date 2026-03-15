# Windows-Native VS Code Tunnel Setup
# Much simpler than code-server - VS Code does it all!

Write-Host "🚀 Setting up VS Code Tunnel (Windows Native)..." -ForegroundColor Cyan
Write-Host ""

# Check if VS Code is available
if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Host "❌ VS Code not found in PATH" -ForegroundColor Red
    Write-Host "   Please install VS Code first: https://code.visualstudio.com/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ VS Code found!" -ForegroundColor Green
Write-Host ""

$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           TWO OPTIONS - PICK ONE:               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 OPTION 1: VS Code Tunnel (Access from ANYWHERE)" -ForegroundColor Yellow
Write-Host "   ✅ Works over internet (not just WiFi)" -ForegroundColor Green
Write-Host "   ✅ Fully managed by Microsoft" -ForegroundColor Green
Write-Host "   ✅ Free with GitHub account" -ForegroundColor Green
Write-Host "   ⚠️  Requires GitHub sign-in" -ForegroundColor Gray
Write-Host ""
Write-Host "   Run: " -NoNewline -ForegroundColor White
Write-Host "code tunnel --name overlord-dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Then in Termux visit: https://vscode.dev/tunnel/overlord-dashboard" -ForegroundColor White
Write-Host ""

Write-Host "───────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

Write-Host "🏠 OPTION 2: SSH Only (WiFi-Local, Simpler)" -ForegroundColor Yellow
Write-Host "   ✅ No GitHub account needed" -ForegroundColor Green
Write-Host "   ✅ Direct file access via SSH/SSHFS" -ForegroundColor Green
Write-Host "   ✅ Works with termux-tunnel.sh script" -ForegroundColor Green
Write-Host "   ⚠️  Only works on same WiFi network" -ForegroundColor Gray
Write-Host ""
Write-Host "   Your IP: $localIP" -ForegroundColor Cyan
Write-Host "   Already configured in termux-tunnel.sh!" -ForegroundColor White
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Which option? [1 for Tunnel / 2 for SSH only]"
$choice = $choice.Trim() -replace '[^12]', ''  # Extract just the number

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "🌐 Starting VS Code Tunnel..." -ForegroundColor Cyan
    Write-Host "   A browser will open - sign in with GitHub" -ForegroundColor Yellow
    Write-Host "   After signing in, the tunnel will stay active" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📱 From Termux, visit: https://vscode.dev/tunnel/overlord-dashboard" -ForegroundColor Green
    Write-Host ""
    
    # Start tunnel in new window so it keeps running
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; code tunnel --name overlord-dashboard --accept-server-license-terms"
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "🏠 SSH Mode Selected" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ SSH Server already running" -ForegroundColor Green
    Write-Host "✅ termux-tunnel.sh already configured" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Next steps in Termux:" -ForegroundColor Yellow
    Write-Host "   1. Generate key: ssh-keygen -t ed25519 -C 'termux'" -ForegroundColor White
    Write-Host "   2. Copy key: cat ~/.ssh/id_ed25519.pub" -ForegroundColor White
    Write-Host "   3. Back here run: .\add-termux-key.ps1" -ForegroundColor White
    Write-Host "   4. Transfer script: .\send-to-phone.ps1" -ForegroundColor White
    Write-Host "   5. In Termux run: overlord" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Invalid choice. Run script again." -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 TIP: Both methods work great! Tunnel = internet access, SSH = local only" -ForegroundColor Gray
