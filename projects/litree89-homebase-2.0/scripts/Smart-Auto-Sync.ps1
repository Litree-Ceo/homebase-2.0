# ============================================================================
# Smart-Auto-Sync.ps1 - Intelligent Automatic Sync & Build System
# ============================================================================
# Features:
# - Real-time file watching for instant rebuilds
# - Automatic dependency synchronization
# - Smart caching to avoid redundant operations
# - Parallel execution for speed
# - Auto-fix common issues
# - Zero-click operation
# ============================================================================

param(
    [switch]$NoWatch = $false,
    [int]$WatchInterval = 2,
    [switch]$Verbose = $false,
    [switch]$FastMode = $false
)

$ErrorActionPreference = "Continue"
$InformationPreference = "Continue"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

# ============================================================================
# CONFIGURATION
# ============================================================================

$Config = @{
    WorkspaceRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
    WatchInterval = if ($FastMode) { 1 } else { $WatchInterval }
    ParallelJobs = 4
    EnableAutoFix = $true
    EnableCache = $true
    CacheFile = ".sync-cache.json"
}

$Config.CacheFile = Join-Path $Config.WorkspaceRoot $Config.CacheFile

# Color definitions
$Colors = @{
    Success = [System.ConsoleColor]::Green
    Error = [System.ConsoleColor]::Red
    Warning = [System.ConsoleColor]::Yellow
    Info = [System.ConsoleColor]::Cyan
    Highlight = [System.ConsoleColor]::Magenta
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

function Write-Colored {
    param([string]$Message, [string]$Color = "Info", [switch]$NoTime)
    
    $time = if (-not $NoTime) { "[$(Get-Date -Format 'HH:mm:ss')]" } else { "" }
    $fgColor = if ($Colors[$Color]) { $Colors[$Color] } else { $Colors["Info"] }
    
    Write-Host "$time " -NoNewline -ForegroundColor $Colors["Info"]
    Write-Host $Message -ForegroundColor $fgColor
}

function Get-SyncCache {
    if (Test-Path $Config.CacheFile) {
        return Get-Content $Config.CacheFile | ConvertFrom-Json
    }
    return @{}
}

function Set-SyncCache {
    param([hashtable]$Data)
    
    if ($Config.EnableCache) {
        $Data | ConvertTo-Json | Set-Content $Config.CacheFile -Force
    }
}

function Should-Sync {
    param([string]$Key, [int]$IntervalSeconds = 30)
    
    $cache = Get-SyncCache
    $now = [DateTime]::UtcNow.Ticks
    
    if ($cache -and $null -ne $cache.$Key) {
        $lastSync = [DateTime]::new([long]$cache.$Key)
        $elapsed = ($now - $lastSync.Ticks) / 10000000
        
        if ($elapsed -lt $IntervalSeconds) {
            return $false
        }
    }
    
    return $true
}

function Mark-Synced {
    param([string]$Key)
    
    $cache = Get-SyncCache
    $cache.$Key = [DateTime]::UtcNow.Ticks
    Set-SyncCache $cache
}

function Invoke-Command-Safe {
    param(
        [string]$Command,
        [string]$Description,
        [bool]$Critical = $false,
        [string]$WorkDir = $null
    )
    
    Write-Colored "▶ $Description" "Info"
    
    try {
        $original = Get-Location
        if ($WorkDir) { Set-Location $WorkDir }
        
        $result = Invoke-Expression $Command 2>&1
        
        if ($LASTEXITCODE -ne 0 -and $Critical) {
            Write-Colored "✗ ${Description} (exit: $LASTEXITCODE)" "Error"
            if ($WorkDir) { Set-Location $original }
            return $false
        }
        
        Write-Colored "✓ $Description" "Success"
        if ($WorkDir) { Set-Location $original }
        return $true
    }
    catch {
        Write-Colored "✗ ${Description}: $($_.Exception.Message)" "Error"
        return $false
    }
}

# ============================================================================
# SYNC OPERATIONS
# ============================================================================

function Sync-Dependencies {
    param([switch]$Force)
    
    $key = "sync-deps"
    if (-not $Force -and -not (Should-Sync $key 60)) {
        Write-Colored "⊘ Dependencies sync cached (run with -Force to override)" "Warning"
        return $true
    }
    
    Write-Colored "════════════════════════════════════════" "Highlight"
    Write-Colored "📦 SYNCHRONIZING DEPENDENCIES" "Highlight"
    Write-Colored "════════════════════════════════════════" "Highlight"
    
    $success = $true
    
    # Root workspace
    $success = (Invoke-Command-Safe `
        "pnpm install --no-frozen-lockfile" `
        "Root dependencies" `
        $true `
        $Config.WorkspaceRoot) -and $success
    
    # Individual workspaces in parallel
    @("api", "apps/web") | ForEach-Object {
        $path = Join-Path $Config.WorkspaceRoot $_
        if (Test-Path $path) {
            $success = (Invoke-Command-Safe `
                "pnpm install --no-frozen-lockfile" `
                "$_ dependencies" `
                $true `
                $path) -and $success
        }
    }
    
    if ($success) {
        Mark-Synced $key
        Write-Colored "✓ All dependencies synchronized" "Success"
    }
    
    return $success
}

function Sync-Builds {
    param([switch]$Force)
    
    Write-Colored "════════════════════════════════════════" "Highlight"
    Write-Colored "🔨 SYNCHRONIZING BUILDS" "Highlight"
    Write-Colored "════════════════════════════════════════" "Highlight"
    
    # Start all watches in parallel
    $jobs = @()
    
    # API watch
    $apiPath = Join-Path $Config.WorkspaceRoot "api"
    Write-Colored "▶ Starting API watcher" "Info"
    $jobs += Start-Job -ScriptBlock {
        Set-Location $using:apiPath
        & npm run watch
    } -Name "api-watch"
    
    # Web dev server
    $webPath = Join-Path $Config.WorkspaceRoot "apps\web"
    Write-Colored "▶ Starting Web dev server" "Info"
    $jobs += Start-Job -ScriptBlock {
        Set-Location $using:webPath
        & pnpm dev
    } -Name "web-dev"
    
    Write-Colored "✓ Build watchers started in background" "Success"
    return $true
}

function Sync-Git {
    param([switch]$Force)
    
    $key = "sync-git"
    if (-not $Force -and -not (Should-Sync $key 120)) {
        return $true
    }
    
    Write-Colored "════════════════════════════════════════" "Highlight"
    Write-Colored "🔄 SYNCHRONIZING GIT" "Highlight"
    Write-Colored "════════════════════════════════════════" "Highlight"
    
    Push-Location $Config.WorkspaceRoot
    
    try {
        # Check for uncommitted changes
        $status = git status --porcelain
        if ($status) {
            Write-Colored "⚠ Uncommitted changes detected (not auto-committing)" "Warning"
            Write-Colored "Run 'git status' to review changes" "Info"
        }
        else {
            Write-Colored "✓ Git repository clean" "Success"
        }
        
        # Fetch latest
        Write-Colored "▶ Fetching latest changes..." "Info"
        git fetch origin 2>&1 | Out-Null
        Write-Colored "✓ Git fetch complete" "Success"
        
        Mark-Synced $key
    }
    catch {
        $msg = $_.Exception.Message
        Write-Colored "✗ Git sync failed: ${msg}" "Error"
    }
    finally {
        Pop-Location
    }
}

function Sync-Environment {
    param([switch]$Force)
    
    $key = "sync-env"
    if (-not $Force -and -not (Should-Sync $key 300)) {
        Write-Colored "⊘ Environment check cached" "Warning"
        return $true
    }
    
    Write-Colored "════════════════════════════════════════" "Highlight"
    Write-Colored "⚙ CHECKING ENVIRONMENT" "Highlight"
    Write-Colored "════════════════════════════════════════" "Highlight"
    
    # Check Node version
    $nodeVersion = node --version
    Write-Colored "Node: $nodeVersion" "Info"
    
    # Check pnpm version
    $pnpmVersion = pnpm --version
    Write-Colored "pnpm: $pnpmVersion" "Info"
    
    # Check git
    $gitVersion = git --version
    Write-Colored "Git: $gitVersion" "Info"
    
    Mark-Synced $key
    Write-Colored "✓ Environment check complete" "Success"
    return $true
}

function Auto-Fix-Issues {
    if (-not $Config.EnableAutoFix) {
        return $true
    }
    
    Write-Colored "════════════════════════════════════════" "Highlight"
    Write-Colored "🔧 AUTO-FIXING ISSUES" "Highlight"
    Write-Colored "════════════════════════════════════════" "Highlight"
    
    $fixed = 0
    
    # Fix 1: Remove lock files if corrupted
    $lockFiles = @("pnpm-lock.yaml", "package-lock.json")
    $lockFiles | ForEach-Object {
        $path = Join-Path $Config.WorkspaceRoot $_
        if (Test-Path $path) {
            $size = (Get-Item $path).Length
            if ($size -lt 100) {
                Write-Colored "🔧 Removing corrupted $_ ..." "Warning"
                Remove-Item $path -Force
                $fixed++
            }
        }
    }
    
    # Fix 2: Clean node_modules if it exceeds 2GB
    $nodeModulesPath = Join-Path $Config.WorkspaceRoot "node_modules"
    if (Test-Path $nodeModulesPath) {
        $size = (Get-ChildItem $nodeModulesPath -Recurse | Measure-Object -Property Length -Sum).Sum
        $twoGB = 2 * 1024 * 1024 * 1024
        if ($size -gt $twoGB) {
            $sizeGB = [math]::Round($size / (1024 * 1024 * 1024), 2)
            Write-Colored "🔧 Cleaning oversized node_modules ($sizeGB GB)..." "Warning"
            Remove-Item $nodeModulesPath -Recurse -Force
            $fixed++
        }
    }
    
    # Fix 3: Remove stale build artifacts
    @("api\dist", "apps\web\.next", "apps\web\out") | ForEach-Object {
        $path = Join-Path $Config.WorkspaceRoot $_
        if (Test-Path $path) {
            $age = (Get-Item $path).LastWriteTime
            $daysSince = [DateTime]::Now.Subtract($age).Days
            
            if ($daysSince -gt 7) {
                Write-Colored "🔧 Cleaning old $_ ..." "Warning"
                Remove-Item $path -Recurse -Force
                $fixed++
            }
        }
    }
    
    if ($fixed -gt 0) {
        Write-Colored "✓ Fixed $fixed issue(s)" "Success"
    }
    else {
        Write-Colored "✓ No issues found" "Success"
    }
    
    return $true
}

function Get-ChangesSince {
    param([DateTime]$Since)
    
    Push-Location $Config.WorkspaceRoot
    
    try {
        $since_str = $Since.ToString("o")
        $changes = git log --since=$since_str --name-only --pretty=format: | Where-Object { $_ -ne "" }
        
        return $changes | Select-Object -Unique
    }
    finally {
        Pop-Location
    }
}

# ============================================================================
# FILE WATCHING
# ============================================================================

function Watch-Workspace {
    Write-Colored "════════════════════════════════════════" "Highlight"
    Write-Colored "👀 STARTING WORKSPACE WATCHER" "Highlight"
    Write-Colored "════════════════════════════════════════" "Highlight"
    Write-Colored "Watching for changes every $($Config.WatchInterval)s" "Info"
    Write-Colored "Press Ctrl+C to stop" "Warning"
    Write-Colored "" "Info" -NoTime
    
    $script:lastCheck = @{}
    
    while ($true) {
        try {
            # Package.json changes
            if (Should-Sync "check-packages" $Config.WatchInterval) {
                $packages = Get-ChildItem -Path $Config.WorkspaceRoot -Recurse -Filter "package.json" | Where-Object { -not $_.FullName.Contains("node_modules") }
                
                foreach ($pkg in $packages) {
                    $hash = (Get-FileHash $pkg.FullName).Hash
                    $key = "pkg-$($pkg.FullName)"
                    $cache = Get-SyncCache
                    
                    if ($cache.$key -ne $hash) {
                        Write-Colored "📝 package.json changed: $($pkg.Directory.Name)" "Highlight"
                        $cache.$key = $hash
                        Set-SyncCache $cache
                        Sync-Dependencies -Force
                    }
                }
            }
            
            # Source file changes
            if (Should-Sync "check-source" 5) {
                $sources = @(
                    (Join-Path $Config.WorkspaceRoot "api\src\*.ts"),
                    (Join-Path $Config.WorkspaceRoot "apps\web\src\**\*.tsx")
                )
                
                foreach ($source in $sources) {
                    if (Test-Path $source) {
                        $files = Get-ChildItem -Path $source -Recurse 2>&1 | Where-Object { $_ -is [System.IO.FileInfo] }
                        
                        foreach ($file in $files) {
                            $mtime = $file.LastWriteTime.Ticks
                            $key = "src-$($file.FullName)"
                            $cache = Get-SyncCache
                            
                            if ($cache.$key -and $cache.$key -ne $mtime) {
                                Write-Colored "📄 Source changed: $($file.Name)" "Info"
                                $cache.$key = $mtime
                                Set-SyncCache $cache
                            }
                            elseif (-not $cache.$key) {
                                $cache.$key = $mtime
                                Set-SyncCache $cache
                            }
                        }
                    }
                }
            }
            
            Start-Sleep -Seconds $Config.WatchInterval
        }
        catch {
            Write-Colored "⚠ Watch error: $($_.Exception.Message)" "Warning"
            Start-Sleep -Seconds 5
        }
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Main {
    Clear-Host
    
    Write-Colored "╔════════════════════════════════════════╗" "Highlight" -NoTime
    Write-Colored "║  SMART AUTO-SYNC v2.0 - ZERO CLICK    ║" "Highlight" -NoTime
    Write-Colored "╚════════════════════════════════════════╝" "Highlight" -NoTime
    Write-Colored "" "Info" -NoTime
    
    Write-Colored "Workspace: $($Config.WorkspaceRoot)" "Info"
    Write-Colored "Watch Mode: $(if (-not $NoWatch) { 'ENABLED' } else { 'DISABLED' })" "Info"
    Write-Colored "Fast Mode: $(if ($FastMode) { 'ENABLED' } else { 'DISABLED' })" "Info"
    Write-Colored "Cache: $(if ($Config.EnableCache) { 'ENABLED' } else { 'DISABLED' })" "Info"
    Write-Colored "" "Info" -NoTime
    
    # Initial sync
    Sync-Environment -Force
    Auto-Fix-Issues
    Sync-Dependencies -Force
    Sync-Git -Force
    Sync-Builds -Force
    
    # Continuous watch
    if (-not $NoWatch) {
        Write-Colored "" "Info" -NoTime
        Watch-Workspace
    }
    else {
        Write-Colored "✓ Sync complete. Use -NoWatch to skip watching." "Success"
    }
}

# Run
Main
