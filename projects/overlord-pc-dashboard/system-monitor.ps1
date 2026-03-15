# Real-time System Monitor for Overlord
$Root = "C:\Users\litre\Desktop\Overlord-Pc-Dashboard"

while ($true) {
    Start-Sleep -Seconds 60
    
    # Check CPU
    $cpu = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
    if ($cpu -gt 90) {
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.MessageBox]::Show("CPU usage is at $([math]::Round($cpu))%! Close some apps.", "Overlord Alert", "OK", "Warning")
    }
    
    # Check RAM
    $ram = Get-CimInstance Win32_OperatingSystem
    $ramPercent = ($ram.TotalVisibleMemorySize - $ram.FreePhysicalMemory) / $ram.TotalVisibleMemorySize * 100
    if ($ramPercent -gt 90) {
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.MessageBox]::Show("RAM usage is at $([math]::Round($ramPercent))%! Consider restarting.", "Overlord Alert", "OK", "Warning")
    }
    
    # Check if Overlord ports are down
    $ports = @(80, 8081, 5000)
    $down = @()
    foreach ($port in $ports) {
        $test = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if (-not $test.TcpTestSucceeded) { $down += $port }
    }
    
    if ($down.Count -gt 0) {
        # Try to restart
        taskkill /f /im python.exe 2>$null
        taskkill /f /im node.exe 2>$null
        Start-Sleep 2
        Start-Process -FilePath "$Root\tools\nginx\nginx.exe" -WorkingDirectory "$Root\tools\nginx" -WindowStyle Hidden
        Start-Process -FilePath "$Root\overlord-dashboard\.venv\Scripts\python.exe" -ArgumentList "server.py" -WorkingDirectory "$Root\overlord-dashboard" -WindowStyle Hidden
        Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$Root\grid" -WindowStyle Hidden
        
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.MessageBox]::Show("Overlord services were restarted due to downtime.", "Overlord Auto-Recovery", "OK", "Information")
    }
}
