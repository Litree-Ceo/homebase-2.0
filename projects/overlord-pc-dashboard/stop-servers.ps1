Write-Host "🛑 STOPPING OVERLORD SERVERS..." -ForegroundColor Yellow

$Ports = @(3000, 8080, 5000)
$PIDsToKill = @()

foreach ($Port in $Ports) {
    # Get connections on the port
    $Conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($Conns) {
        foreach ($Conn in $Conns) {
            $PIDToKill = $Conn.OwningProcess
            if ($PIDToKill -and ($PIDToKill -notin $PIDsToKill)) {
                $PIDsToKill += $PIDToKill
                try {
                    $Proc = Get-Process -Id $PIDToKill -ErrorAction Stop
                    Write-Host "Killing process on Port $Port : $($Proc.ProcessName) (PID: $PIDToKill)" -ForegroundColor Red
                    Stop-Process -Id $PIDToKill -Force -ErrorAction SilentlyContinue
                }
                catch {
                    Write-Host "Could not kill process $PIDToKill on Port $Port. Is it already gone?" -ForegroundColor DarkGray
                }
            }
        }
    } else {
        Write-Host "Port $Port is clear." -ForegroundColor Green
    }
}

# Also try to kill stray python processes started by us if ports were not bound yet or stuck
# This is tricky without knowing command line arguments easily in pure PS without WMI, skipping for safety.

Write-Host "✅ CLEANUP COMPLETE" -ForegroundColor Green
