# Auto-Maintenance Script - Runs every Sunday 3AM
$Root = "C:\Users\litre\Desktop\Overlord-Pc-Dashboard"

# Clean temp files
Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue

# Restart Overlord services if down
$ports = @(80, 8081, 5000)
$allUp = $true
foreach ($port in $ports) {
    $test = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if (-not $test.TcpTestSucceeded) { $allUp = $false }
}

if (-not $allUp) {
    # Restart everything
    taskkill /f /im python.exe 2>$null
    taskkill /f /im node.exe 2>$null
    taskkill /f /im nginx.exe 2>$null
    Start-Sleep 2
    
    Start-Process -FilePath "$Root\tools\nginx\nginx.exe" -WorkingDirectory "$Root\tools\nginx" -WindowStyle Hidden
    Start-Process -FilePath "$Root\overlord-dashboard\.venv\Scripts\python.exe" -ArgumentList "server.py" -WorkingDirectory "$Root\overlord-dashboard" -WindowStyle Hidden
    Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$Root\grid" -WindowStyle Hidden
    
    # Send notification
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show("Overlord was restarted due to service interruption.", "Overlord Maintenance", "OK", "Information")
}

# Git auto-commit if changes exist
cd $Root
git add . 2>$null
git commit -m "Auto-backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>$null
