# Daily Backup Script
$Root = "C:\Users\litre\Desktop\Overlord-Pc-Dashboard"
$date = Get-Date -Format "yyyy-MM-dd"
$backupName = "Overlord-Backup-$date.zip"
$destinations = @(
    "$env:USERPROFILE\OneDrive\Backups",
    "$env:USERPROFILE\Dropbox\Backups"
)

# Create backup
$tempZip = "$env:TEMP\$backupName"
Compress-Archive -Path "$Root\*" -DestinationPath $tempZip -Force

# Copy to destinations
foreach ($dest in $destinations) {
    if (Test-Path $dest) {
        Copy-Item $tempZip $dest -Force
        "$(Get-Date): Backed up to $dest" | Out-File "$Root\logs\backup.log" -Append
    }
}

# Clean old backups (keep 7 days)
Get-ChildItem $env:TEMP -Filter "Overlord-Backup-*.zip" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force

# Clean old logs
Get-ChildItem "$Root\logs" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | Remove-Item -Force
