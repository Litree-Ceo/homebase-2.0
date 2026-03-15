# Git Intelligence Module - Smart git operations and automation
$script:GitCache = @{}

function Get-SmartBranch {
    $branch = git rev-parse --abbrev-ref HEAD 2>$null
    return $branch -replace '^HEAD$', 'detached'
}

function Get-GitStatus {
    $status = git status --porcelain 2>$null
    return @{
        Modified = ($status | Where-Object { $_ -match '^ M' }).Count
        Added = ($status | Where-Object { $_ -match '^A' }).Count
        Deleted = ($status | Where-Object { $_ -match '^D' }).Count
        Untracked = ($status | Where-Object { $_ -match '^\?\?' }).Count
    }
}

function Suggest-CommitMessage {
    $diff = git diff --cached 2>$null
    if (-not $diff) {
        Write-Host "No staged changes. Stage files first with: git add ." -ForegroundColor Yellow
        return
    }
    
    $files = git diff --cached --name-only 2>$null
    $types = @{}
    
    $files | ForEach-Object {
        $ext = [System.IO.Path]::GetExtension($_)
        $types[$ext]++
    }
    
    $primary = ($types.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1).Key
    $fileCount = $files.Count
    
    $suggestions = @(
        "feat: Add new functionality to $($files[0] -replace '.*/', '')",
        "fix: Resolve issues in $($files[0] -replace '.*/', '')",
        "refactor: Improve code structure ($fileCount files)",
        "docs: Update documentation",
        "test: Add/update tests"
    )
    
    Write-Host "💡 Suggested commit messages:" -ForegroundColor Cyan
    $suggestions | ForEach-Object { Write-Host "  • $_" -ForegroundColor Gray }
}

function Smart-GitPull {
    $branch = Get-SmartBranch
    Write-Host "📥 Pulling $branch..." -ForegroundColor Cyan
    
    git fetch origin 2>$null
    $status = git status -uno 2>$null
    
    if ($status -match 'behind') {
        git pull origin $branch 2>$null
        Write-Host "✓ Updated" -ForegroundColor Green
    } else {
        Write-Host "✓ Already up to date" -ForegroundColor Green
    }
}

function Smart-GitPush {
    param([string]$Message)
    
    $branch = Get-SmartBranch
    $status = Get-GitStatus
    
    if ($status.Modified -eq 0 -and $status.Added -eq 0 -and $status.Deleted -eq 0) {
        Write-Host "✓ No changes to push" -ForegroundColor Green
        return
    }
    
    if ($status.Untracked -gt 0) {
        Write-Host "⚠️  $($status.Untracked) untracked files. Add them? (y/n)" -ForegroundColor Yellow
        $response = Read-Host
        if ($response -eq 'y') {
            git add .
        }
    }
    
    if (-not $Message) {
        Suggest-CommitMessage
        $Message = Read-Host "Enter commit message"
    }
    
    git commit -m $Message 2>$null
    git push origin $branch 2>$null
    Write-Host "✓ Pushed to $branch" -ForegroundColor Green
}

function Show-GitStatus {
    $branch = Get-SmartBranch
    $status = Get-GitStatus
    
    Write-Host "🌿 Git Status" -ForegroundColor Cyan
    Write-Host "  Branch: $branch" -ForegroundColor Yellow
    Write-Host "  Modified: $($status.Modified)" -ForegroundColor $(if ($status.Modified -gt 0) { "Yellow" } else { "Green" })
    Write-Host "  Added: $($status.Added)" -ForegroundColor $(if ($status.Added -gt 0) { "Green" } else { "Gray" })
    Write-Host "  Deleted: $($status.Deleted)" -ForegroundColor $(if ($status.Deleted -gt 0) { "Red" } else { "Gray" })
    Write-Host "  Untracked: $($status.Untracked)" -ForegroundColor $(if ($status.Untracked -gt 0) { "Yellow" } else { "Gray" })
}

Export-ModuleMember -Function @('Get-SmartBranch', 'Get-GitStatus', 'Suggest-CommitMessage', 'Smart-GitPull', 'Smart-GitPush', 'Show-GitStatus')
