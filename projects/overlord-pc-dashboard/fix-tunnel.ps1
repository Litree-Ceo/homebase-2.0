# Fix VS Code Tunnel - Link to Your GitHub Account
# Run this to properly authenticate with highlife4real1989@gmail.com

Write-Host "🔧 Fixing VS Code Tunnel Authentication..." -ForegroundColor Cyan
Write-Host ""

# Kill any existing tunnel processes
Write-Host "🛑 Stopping existing tunnels..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*code-server*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "✅ Stopped old tunnels" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting NEW tunnel..." -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow -NoNewline
Write-Host " When browser opens, sign in with:" -ForegroundColor White
Write-Host "   📧 highlife4real1989@gmail.com" -ForegroundColor Green
Write-Host ""
Write-Host "Press ENTER to continue..." -ForegroundColor Gray
Read-Host

# Start tunnel in THIS window so you can see the authentication
code tunnel --name overlord-dashboard --accept-server-license-terms

Write-Host ""
Write-Host "⚠️  Keep this window open!" -ForegroundColor Red
