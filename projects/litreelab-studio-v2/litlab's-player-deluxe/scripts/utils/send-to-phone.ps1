# Transfer termux-tunnel.sh to your phone
# This starts a simple web server - access from your phone's browser

Write-Host "🌐 Starting file transfer server..." -ForegroundColor Cyan
Write-Host ""

$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress
$port = 8888

Write-Host "📱 On your Android phone/Termux:" -ForegroundColor Yellow
Write-Host "   1. Open browser or run in Termux:" -ForegroundColor White
Write-Host "      curl http://${localIP}:${port}/termux-tunnel.sh -o ~/termux-tunnel.sh" -ForegroundColor Green
Write-Host ""
Write-Host "   2. Or visit in browser: http://${localIP}:${port}" -ForegroundColor White
Write-Host ""
Write-Host "   3. Then in Termux:" -ForegroundColor White
Write-Host "      chmod +x ~/termux-tunnel.sh" -ForegroundColor Green
Write-Host "      mkdir -p ~/bin && mv ~/termux-tunnel.sh ~/bin/overlord" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Simple HTTP server using Python (already in your environment)
python -c "import http.server; import socketserver; import os; os.chdir(r'$PWD'); Handler = http.server.SimpleHTTPRequestHandler; httpd = socketserver.TCPServer(('0.0.0.0', $port), Handler); print('Server running at http://${localIP}:${port}'); httpd.serve_forever()"
