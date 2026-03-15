# Auto Git Sync Script for EverythingHomebase
# This script will pull, add, commit, and push changes automatically


param(
    [string]$CommitMsg = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

$LogFile = Join-Path $PSScriptRoot "auto-git-sync.log"

function Log {
    param([string]$msg)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $entry = "[$timestamp] $msg"
    Write-Host $entry
    Add-Content -Path $LogFile -Value $entry
}

while ($true) {
    try {
        Log "Pulling latest changes..."
        git pull 2>&1 | Tee-Object -Variable pullOut | ForEach-Object { Log $_ }

        Log "Adding all changes..."
        git add -A 2>&1 | ForEach-Object { Log $_ }

        Log "Committing..."
        $commitResult = git commit -m "$CommitMsg" 2>&1
        if ($commitResult -notmatch 'nothing to commit') {
            Log $commitResult
            Log "Pushing to remote..."
            git push 2>&1 | ForEach-Object { Log $_ }
        } else {
            Log "Nothing to commit."
        }
    } catch {
        Log "ERROR: $_"
    }
    Log "Sleeping for 5 minutes before next sync..."
    Start-Sleep -Seconds 300
}
