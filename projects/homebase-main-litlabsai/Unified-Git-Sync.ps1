# ============================================================================
# Unified-Git-Sync.ps1 - Multi-Platform Git Repository Manager
# ============================================================================
# Manages sync across GitHub, GitLab, Azure DevOps, and GitKraken
# Usage: .\Unified-Git-Sync.ps1 [-Push] [-Pull] [-Status]
# ============================================================================

param(
    [switch]$Push,
    [switch]$Pull,
    [switch]$Status,
    [switch]$Setup,
    [switch]$Force,
    [string]$Message = "Auto-sync update"
)

# Color definitions
$Colors = @{
    GitHub    = "Cyan"
    GitLab    = "Yellow" 
    Azure     = "Blue"
    Success   = "Green"
    Error     = "Red"
    Warning   = "Yellow"
    Info      = "White"
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "===============================================================" -ForegroundColor Magenta
    Write-Host "  $Title" -ForegroundColor Magenta
    Write-Host "===============================================================" -ForegroundColor Magenta
    Write-Host ""
}

# ============================================================================
# CONFIGURATION - Update these URLs with your actual repository URLs
# ============================================================================

$Config = @{
    # Primary workspace
    RootPath = "C:\Users\litre\homebase-2.0"
    
    # Remote configurations
    Remotes = @{
        GitLab = @{
            Name = "gitlab"
            Url  = "https://gitlab.com/dyingbreed243/homebase-2.0.git"
            Icon = "GL"
        }
        GitHub = @{
            Name = "github"
            Url  = "https://github.com/LiTree89/HomeBase-2.0.git"
            Icon = "GH"
        }
    }
    
    # Sync settings
    MainBranch = "main"
    BackupBranch = "backup/main"
}

# ============================================================================
# SETUP FUNCTIONS
# ============================================================================

function Initialize-GitRemotes {
    Write-Header "CONFIGURING GIT REMOTES"
    
    Set-Location $Config.RootPath
    
    foreach ($remote in $Config.Remotes.GetEnumerator()) {
        $name = $remote.Value.Name
        $url = $remote.Value.Url
        $icon = $remote.Value.Icon
        $key = $remote.Key
        
        # Check if remote exists
        $existing = git remote get-url $name 2>$null
        
        if ($existing) {
            if ($existing -ne $url) {
                Write-Host "[$icon] Updating remote '$name' URL..." -ForegroundColor Yellow
                git remote set-url $name $url
                Write-Host "[$icon] $key URL updated" -ForegroundColor Green
            } else {
                Write-Host "[$icon] $key Already configured" -ForegroundColor Green
            }
        } else {
            Write-Host "[$icon] Adding remote '$name'..." -ForegroundColor Cyan
            git remote add $name $url
            Write-Host "[$icon] $key Added successfully" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "Current remotes:" -ForegroundColor Cyan
    git remote -v | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
}

# ============================================================================
# SYNC FUNCTIONS
# ============================================================================

function Sync-Pull {
    Write-Header "PULLING FROM ALL REMOTES"
    
    Set-Location $Config.RootPath
    
    # Fetch from all remotes
    foreach ($remote in $Config.Remotes.GetEnumerator()) {
        $name = $remote.Value.Name
        $icon = $remote.Value.Icon
        $key = $remote.Key
        
        Write-Host "[$icon] Fetching from $key..." -ForegroundColor Cyan -NoNewline
        $result = git fetch $name 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " OK" -ForegroundColor Green
        } else {
            Write-Host " FAILED" -ForegroundColor Red
            Write-Host "   $result" -ForegroundColor Red
        }
    }
    
    # Show status
    Write-Host ""
    Write-Host "Local branch status:" -ForegroundColor Cyan
    git status --short
    
    Write-Host ""
    Write-Host "Branch comparison:" -ForegroundColor Cyan
    foreach ($remote in $Config.Remotes.GetEnumerator()) {
        $name = $remote.Value.Name
        $icon = $remote.Value.Icon
        $key = $remote.Key
        
        $ahead = 0
        $behind = 0
        
        try {
            $ahead = git rev-list --count HEAD..$name/$($Config.MainBranch) 2>$null
            $behind = git rev-list --count $name/$($Config.MainBranch)..HEAD 2>$null
        } catch {}
        
        if ($ahead -or $behind) {
            Write-Host "[$icon] $key`: " -NoNewline
            if ($behind -gt 0) { Write-Host "+$behind ahead " -ForegroundColor Green -NoNewline }
            if ($ahead -gt 0) { Write-Host "-$ahead behind " -ForegroundColor Yellow -NoNewline }
            Write-Host ""
        } else {
            Write-Host "[$icon] $key`: In sync" -ForegroundColor Green
        }
    }
}

function Sync-Push {
    param([string]$CommitMessage)
    
    Write-Header "PUSHING TO ALL REMOTES"
    
    Set-Location $Config.RootPath
    
    # Check for changes
    $status = git status --porcelain
    if ($status) {
        Write-Host "Uncommitted changes detected:" -ForegroundColor Yellow
        git status --short | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        
        if (-not $Force) {
            Write-Host ""
            $response = Read-Host "Auto-commit changes with message '$CommitMessage'? (y/n)"
            if ($response -ne 'y') {
                Write-Host "Push cancelled. Commit manually first." -ForegroundColor Red
                return
            }
        }
        
        Write-Host ""
        Write-Host "Committing changes..." -ForegroundColor Cyan
        git add -A
        git commit -m "$CommitMessage"
    } else {
        Write-Host "No uncommitted changes." -ForegroundColor Green
    }
    
    # Push to all remotes
    Write-Host ""
    Write-Host "Pushing to all platforms..." -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($remote in $Config.Remotes.GetEnumerator()) {
        $name = $remote.Value.Name
        $icon = $remote.Value.Icon
        $key = $remote.Key
        
        Write-Host "[$icon] Pushing to $key..." -ForegroundColor Cyan -NoNewline
        
        $result = git push $name $Config.MainBranch 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Host " Success" -ForegroundColor Green
        } elseif ($result -match "up-to-date" -or $result -match "everything up-to-date") {
            Write-Host " Already up to date" -ForegroundColor Green
        } else {
            Write-Host " Failed" -ForegroundColor Red
            Write-Host "   $result" -ForegroundColor Red
        }
    }
}

function Get-SyncStatus {
    Write-Header "REPOSITORY STATUS"
    
    Set-Location $Config.RootPath
    
    # Git status
    Write-Host "Working Directory:" -ForegroundColor Cyan
    $status = git status --short
    if ($status) {
        $status | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    } else {
        Write-Host "  Clean" -ForegroundColor Green
    }
    
    # Branch info
    Write-Host ""
    Write-Host "Current Branch:" -ForegroundColor Cyan
    $branch = git branch --show-current
    Write-Host "  $branch" -ForegroundColor White
    
    # Remote sync status
    Write-Host ""
    Write-Host "Remote Sync Status:" -ForegroundColor Cyan
    
    foreach ($remote in $Config.Remotes.GetEnumerator()) {
        $name = $remote.Value.Name
        $icon = $remote.Value.Icon
        $key = $remote.Key
        
        $localCommit = ""
        $remoteCommit = ""
        
        try {
            $localCommit = git rev-parse HEAD 2>$null
            $remoteCommit = git rev-parse $name/$($Config.MainBranch) 2>$null
        } catch {}
        
        if ($localCommit -eq $remoteCommit) {
            Write-Host "[$icon] $key`: In sync" -ForegroundColor Green
        } else {
            $ahead = 0
            $behind = 0
            
            try {
                $ahead = git rev-list --count $name/$($Config.MainBranch)..HEAD 2>$null
                $behind = git rev-list --count HEAD..$name/$($Config.MainBranch) 2>$null
            } catch {}
            
            Write-Host "[$icon] $key`: " -NoNewline
            if ($behind -gt 0) { Write-Host "+$behind ahead " -ForegroundColor Green -NoNewline }
            if ($ahead -gt 0) { Write-Host "-$ahead behind " -ForegroundColor Yellow -NoNewline }
            Write-Host ""
        }
    }
    
    # Last commit info
    Write-Host ""
    Write-Host "Last Commit:" -ForegroundColor Cyan
    git log -1 --format="  %h - %s (%ar)" | ForEach-Object { Write-Host $_ }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Show-Help {
    Write-Header "UNIFIED GIT SYNC - Multi-Platform Manager"
    
    Write-Host "USAGE:" -ForegroundColor Cyan
    Write-Host "  .\Unified-Git-Sync.ps1 [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Cyan
    Write-Host "  -Setup              Configure all remotes (run first)" -ForegroundColor White
    Write-Host "  -Status             Show sync status across all platforms" -ForegroundColor White
    Write-Host "  -Pull               Fetch from all remotes" -ForegroundColor White
    Write-Host "  -Push               Push to all remotes (auto-commits if needed)" -ForegroundColor White
    Write-Host "  -Message text       Custom commit message (use with -Push)" -ForegroundColor White
    Write-Host "  -Force              Skip confirmation prompts" -ForegroundColor White
    Write-Host ""
    Write-Host "PLATFORMS CONFIGURED:" -ForegroundColor Cyan
    foreach ($remote in $Config.Remotes.GetEnumerator()) {
        $icon = $remote.Value.Icon
        $name = $remote.Key
        $url = $remote.Value.Url
        Write-Host "  [$icon] $name`: $url" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Cyan
    Write-Host "  .\Unified-Git-Sync.ps1 -Setup" -ForegroundColor DarkGray
    Write-Host "  .\Unified-Git-Sync.ps1 -Status" -ForegroundColor DarkGray
    Write-Host "  .\Unified-Git-Sync.ps1 -Push -Message 'Feature update'" -ForegroundColor DarkGray
    Write-Host ""
}

# Main
if ($Setup) {
    Initialize-GitRemotes
    Get-SyncStatus
}
elseif ($Status) {
    Get-SyncStatus
}
elseif ($Pull) {
    Sync-Pull
}
elseif ($Push) {
    Sync-Push -CommitMessage $Message
}
else {
    Show-Help
    Get-SyncStatus
}
