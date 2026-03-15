# Auto-Git Watcher - Commits changes every 30 minutes
$Root = "C:\Users\litre\Desktop\Overlord-Pc-Dashboard"
cd $Root

while ($true) {
    Start-Sleep -Seconds 1800  # 30 minutes
    
    $status = git status --porcelain 2>$null
    if ($status) {
        git add . 2>$null
        git commit -m "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>$null
        git push origin main 2>$null
        # Log it
        "$(Get-Date): Auto-committed changes" | Out-File "$Root\logs\git-sync.log" -Append
    }
}
