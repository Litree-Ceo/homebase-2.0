# Auto-Update Checker
$Root = "C:\Users\litre\Desktop\Overlord-Pc-Dashboard"
cd $Root

# Check for updates
git fetch origin main
$behind = git rev-list HEAD..origin/main --count

if ($behind -gt 0) {
    # Backup first
    $backupName = "pre-update-backup-$(Get-Date -Format 'yyyyMMdd-HHmm')"
    git branch $backupName
    
    # Pull updates
    git pull origin main
    
    # Restart services
    taskkill /f /im python.exe 2>$null
    taskkill /f /im node.exe 2>$null
    Start-Sleep 2
    
    Start-Process -FilePath "$Root\tools\nginx\nginx.exe" -WorkingDirectory "$Root\tools\nginx" -WindowStyle Hidden
    Start-Process -FilePath "$Root\overlord-dashboard\.venv\Scripts\python.exe" -ArgumentList "server.py" -WorkingDirectory "$Root\overlord-dashboard" -WindowStyle Hidden
    Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$Root\grid" -WindowStyle Hidden
    
    # Notify
    . "$PSScriptRoot\discord-alerts.ps1"
    Send-DiscordAlert -Message "✅ Overlord updated to latest version and restarted!" -Color "65280"
}
