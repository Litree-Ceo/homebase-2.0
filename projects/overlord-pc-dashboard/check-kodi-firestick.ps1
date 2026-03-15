# Check Kodi on Firestick
$ip = "192.168.0.232"

Write-Host "Checking Kodi Firestick at $ip..." -ForegroundColor Cyan

# Try common Kodi ports
$ports = @(8080, 8081, 9090, 80, 443)

foreach ($port in $ports) {
    $result = Test-NetConnection -ComputerName $ip -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Host "[OPEN] $ip`:$port" -ForegroundColor Green
        
        # Try to get HTTP response
        try {
            $response = Invoke-WebRequest -Uri "http://$ip`:$port/jsonrpc" -Method GET -TimeoutSec 3 -ErrorAction SilentlyContinue
            if ($response) {
                Write-Host "     Kodi JSON-RPC detected!" -ForegroundColor Magenta
                Write-Host "     Status: $($response.StatusCode)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "     HTTP response: $($_.Exception.Message)" -ForegroundColor Gray
        }
    }
}

# Also ping the device
Write-Host "`nPing test:" -ForegroundColor Cyan
$ping = Test-Connection -ComputerName $ip -Count 1 -ErrorAction SilentlyContinue
if ($ping) {
    Write-Host "  Device is ONLINE - Latency: $($ping.ResponseTime)ms" -ForegroundColor Green
} else {
    Write-Host "  Device is OFFLINE or blocking ICMP" -ForegroundColor Red
}

# Show device info from ARP
Write-Host "`nDevice info from ARP cache:" -ForegroundColor Cyan
$arp = arp -a | Select-String $ip
if ($arp) {
    Write-Host "  $arp" -ForegroundColor Yellow
}
