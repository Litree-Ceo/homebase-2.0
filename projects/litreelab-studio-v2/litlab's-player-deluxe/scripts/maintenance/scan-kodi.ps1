# Scan network for Kodi devices
# Kodi default ports: 8080 (HTTP), 9090 (JSON-RPC)

$ports = @(8080, 9090)
$ips = @("192.168.0.105", "192.168.0.121", "192.168.0.232", "192.168.0.233")

Write-Host "Scanning for Kodi services..." -ForegroundColor Cyan

foreach ($ip in $ips) {
    Write-Host "`nChecking $ip..." -ForegroundColor Yellow
    foreach ($port in $ports) {
        $result = Test-NetConnection -ComputerName $ip -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($result.TcpTestSucceeded) {
            Write-Host "  [OPEN] $ip`:$port" -ForegroundColor Green
            # Try to get HTTP header
            try {
                $response = Invoke-WebRequest -Uri "http://$ip`:$port/jsonrpc" -Method GET -TimeoutSec 3 -ErrorAction SilentlyContinue
                Write-Host "       Kodi JSON-RPC detected!" -ForegroundColor Magenta
            } catch {
                Write-Host "       Port open but not Kodi" -ForegroundColor Gray
            }
        } else {
            Write-Host "  [CLOSED] $ip`:$port" -ForegroundColor Gray
        }
    }
}

# Also check localhost for Kodi
Write-Host "`nChecking localhost for Kodi..." -ForegroundColor Cyan
foreach ($port in $ports) {
    $result = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Host "  [OPEN] localhost`:$port" -ForegroundColor Green
    }
}

# Check for Kodi processes
Write-Host "`nChecking for Kodi processes..." -ForegroundColor Cyan
$kodi = Get-Process | Where-Object { $_.ProcessName -like "*kodi*" }
if ($kodi) {
    $kodi | Format-Table Name, Id, CPU, WorkingSet -AutoSize
} else {
    Write-Host "  No Kodi processes running" -ForegroundColor Gray
}
