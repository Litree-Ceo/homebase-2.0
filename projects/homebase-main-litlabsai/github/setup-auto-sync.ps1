<<<<<<< HEAD
# PowerShell Scheduled Git Sync Task
# This script sets up a scheduled task to run git-sync daily at 6pm

$Action = New-ScheduledTaskAction -Execute 'pwsh.exe' -Argument '-NoProfile -ExecutionPolicy Bypass -File "g:\My Drive\EverythingHomebase\git-helper.ps1"; git-sync "Auto daily sync"'
$Trigger = New-ScheduledTaskTrigger -Daily -At 18:00
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive
Register-ScheduledTask -TaskName "EverythingHomebaseGitSync" -Action $Action -Trigger $Trigger -Principal $Principal -Description "Auto daily git sync for EverythingHomebase repo"

Write-Host "Scheduled task 'EverythingHomebaseGitSync' created. Your repo will auto-sync daily at 6pm."
=======
# SMART AUTO-SYNC SETUP
# Auto-commits, pushes, and deploys on file changes

Write-Host "Setting up SMART AUTO-SYNC..." -ForegroundColor Cyan

$root = "e:\VSCode\HomeBase 2.0"
cd $root

Write-Host "Installing Husky for git hooks..." -ForegroundColor Yellow
pnpm add -D husky 2>&1 | Out-Null
npx husky install 2>&1 | Out-Null

Write-Host "Setting up pre-commit hook..." -ForegroundColor Yellow
$preCommitHook = ".husky/pre-commit"
New-Item -Path $preCommitHook -Force -ItemType File | Out-Null
Set-Content -Path $preCommitHook -Value @'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
pnpm lint --fix 2>/dev/null || true
'@

Write-Host "Creating file watcher..." -ForegroundColor Yellow
$watcherScript = "$root\Watch-Changes.ps1"
Set-Content -Path $watcherScript -Value @'
param([int]$IntervalSeconds = 5)

$root = "e:\VSCode\HomeBase 2.0"
$debounceMs = 2000
$lastCommitTime = Get-Date

cd $root

Write-Host "Watching for changes (Ctrl+C to stop)..." -ForegroundColor Cyan

$changedFiles = @()

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $root
$watcher.Filter = "*"
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite

$scriptBlock = {
    param($object, $event)
    $changedFile = $event.SourceEventArgs.FullPath
    
    if ($changedFile -notmatch "(node_modules|\.next|dist|\.git|pnpm-lock|package-lock)" ) {
        if (-not ($changedFiles -contains $changedFile)) {
            $changedFiles += $changedFile
            Write-Host "Changed: $(Split-Path -Leaf $changedFile)" -ForegroundColor Gray
        }
    }
}

$changeEvent = Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $scriptBlock

try {
    while ($true) {
        Start-Sleep -Milliseconds $debounceMs
        
        if ($changedFiles.Count -gt 0) {
            $timeSinceLastCommit = (Get-Date) - $lastCommitTime
            
            if ($timeSinceLastCommit.TotalSeconds -gt $IntervalSeconds) {
                Write-Host "`nDetected changes in $($changedFiles.Count) files" -ForegroundColor Yellow
                
                git add .
                $msg = "Auto-sync: changes at $(Get-Date -Format 'HH:mm:ss')"
                
                git commit -m $msg --no-verify 2>&1 | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "Committed: $msg" -ForegroundColor Green
                    git push origin main 2>&1 | Out-Null
                }
                
                $lastCommitTime = Get-Date
                $changedFiles = @()
            }
        }
    }
}
finally {
    Unregister-Event -SourceIdentifier $changeEvent.Name
    $watcher.Dispose()
}
'@

Write-Host "Creating startup script..." -ForegroundColor Yellow
$startupScript = "$root\Start-AutoSync.ps1"
Set-Content -Path $startupScript -Value @'
$root = "e:\VSCode\HomeBase 2.0"

Write-Host "Starting SMART AUTO-SYNC..." -ForegroundColor Cyan

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process func -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 1

Write-Host "Starting file watcher..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; & '.\Watch-Changes.ps1'" -WindowStyle Normal

Start-Sleep -Seconds 2
cd $root
Write-Host "Starting dev environment..." -ForegroundColor Yellow
pnpm dev

Write-Host "`nAuto-Sync Active! Changes will auto-commit every 5 seconds." -ForegroundColor Green
'@

Write-Host "`nAUTO-SYNC SETUP COMPLETE!" -ForegroundColor Green
Write-Host "Start with: .\Start-AutoSync.ps1" -ForegroundColor Yellow
>>>>>>> 80d4a58b8a10d837a0d55619405529a6ed92b24f
