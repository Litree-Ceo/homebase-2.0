# Overlord Dashboard - Complete Startup Script
# Starts both the Python server and Cloudflare tunnel

param(
    [int]$Port = 8080,
    [string]$TunnelUrl = "http://localhost:8080"
)

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║     OVERLORD DASHBOARD - Complete Startup                      ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$apiKey = "yCOqaXuaUquExPqNB82uX3ruA8k1sEfGLjHshplOghQ"

# Function to check if server is running
function Test-Server {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/api/health" -TimeoutSec 3 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Check if server is already running
Write-Host "🔍 Checking if server is running..." -ForegroundColor Cyan
if (Test-Server) {
    Write-Host "✅ Server is already running on port $Port" -ForegroundColor Green
} else {
    Write-Host "🚀 Starting Overlord server..." -ForegroundColor Yellow
    Start-Process -FilePath "python" -ArgumentList "server.py" -WindowStyle Hidden
    
    # Wait for server to start
    $tries = 0
    while (-not (Test-Server) -and $tries -lt 10) {
        Start-Sleep -Seconds 1
        $tries++
        Write-Host "   Waiting for server... ($tries/10)" -ForegroundColor Gray
    }
    
    if (Test-Server) {
        Write-Host "✅ Server started successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Server failed to start" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📊 Local Access:" -ForegroundColor Cyan
Write-Host "   Dashboard: http://localhost:$Port" -ForegroundColor White
Write-Host "   API:       http://localhost:$Port/api/stats" -ForegroundColor White
Write-Host ""

# Start Cloudflare tunnel
Write-Host "🌐 Starting Cloudflare tunnel..." -ForegroundColor Yellow
Write-Host "   (This will create a public URL)" -ForegroundColor Gray
Write-Host ""

# Create a temporary script for the tunnel
$tunnelScript = @"
`$host.ui.RawUI.WindowTitle = "Cloudflare Tunnel - Overlord Dashboard"
cd "$PWD"
.\cloudflared.exe tunnel --url $TunnelUrl
"@

$tunnelPath = "$env:TEMP\overlord-tunnel.ps1"
$tunnelScript | Out-File -FilePath $tunnelPath -Encoding UTF8

# Start tunnel in new window
Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy Bypass -File `"$tunnelPath`"" -WindowStyle Normal

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║  ✅ SERVER STARTED SUCCESSFULLY                                ║
╠════════════════════════════════════════════════════════════════╣
║  Local:  http://localhost:$Port                                ║
║  API Key: $apiKey                                              ║
╠════════════════════════════════════════════════════════════════╣
║  🌐 Cloudflare tunnel starting in separate window...           ║
║     (Look for the https://xxxx.trycloudflare.com URL)          ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green

Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Login with the API key shown above" -ForegroundColor White
Write-Host "   - The tunnel URL changes each time you restart" -ForegroundColor White
Write-Host "   - For a permanent URL, use: .\setup-cloudflare-tunnel.ps1" -ForegroundColor White
Write-Host ""

# Keep this window open
Write-Host "Press any key to close this window (server will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
