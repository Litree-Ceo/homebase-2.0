<![CDATA[<#
.SYNOPSIS
    VS Code Cleanup and Optimization Script
    
.DESCRIPTION
    Removes unnecessary extensions, cleans up workspace files, 
    and optimizes VS Code performance settings.
    
.PARAMETER DryRun
    Show what would be removed without actually removing anything
    
.EXAMPLE
    .\cleanup-vscode.ps1 -DryRun
    .\cleanup-vscode.ps1
#>

param(
    [switch]$DryRun
)

$ErrorActionPreference = 'Continue'

Write-Host "🧹 VS Code Cleanup & Optimization" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# 1. REMOVE DUPLICATE/UNUSED EXTENSIONS
# ============================================================================

Write-Host "📦 Analyzing Extensions..." -ForegroundColor Green

$extensionsToRemove = @(
    # Duplicate AI Assistants (keep GitHub Copilot, remove others)
    'fittentech.fitten-code',          # Fitten Code AI
    'marscode.marscode-extension',     # MarsCode AI
    'rooveterinaryinc.roo-cline',      # Roo Cline AI
    'saoudrizwan.claude-dev',          # Claude Dev (redundant with Copilot)
    
    # Duplicate Live Servers (keep ms-vscode.live-server, remove others)
    'ritwickdey.liveserver',           # Live Server (duplicate)
    'jasonlhy.vscode-browser-sync',    # Browser Sync (duplicate)
    'shellomo.modern-live-server',     # Modern Live Server (duplicate)
    'yandeu.five-server',              # Five Server (duplicate)
    
    # Rarely Used Extensions
    'vscodevim.vim',                   # Vim mode (heavy, ask if needed)
    'wakatime.vscode-wakatime',        # Time tracking (optional)
    'ms-vscode.wordcount',             # Word count (niche)
    'ms-kubernetes-tools.vscode-kubernetes-tools'  # K8s tools (if not using)
)

$extensionsToCheck = @(
    @{Name='vscodevim.vim'; Reason='Vim mode can be heavy - do you use it?'},
    @{Name='eamodio.gitlens'; Reason='GitLens is powerful but heavy - do you need all features?'},
    @{Name='wakatime.vscode-wakatime'; Reason='Time tracking - still needed?'}
)

foreach ($ext in $extensionsToRemove) {
    $extName = ($ext -split '\.')[-1]
    if ($DryRun) {
        Write-Host "  Would remove: $ext" -ForegroundColor DarkGray
    } else {
        Write-Host "  Removing: $extName..." -ForegroundColor Yellow
        & code --uninstall-extension $ext 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ Removed" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "💡 Extensions you might want to review:" -ForegroundColor Cyan
foreach ($ext in $extensionsToCheck) {
    Write-Host "  • $($ext.Name) - $($ext.Reason)" -ForegroundColor DarkGray
}

# ============================================================================
# 2. CLEAN UP WORKSPACE FILES
# ============================================================================

Write-Host ""
Write-Host "🗑️  Cleaning Workspace Files..." -ForegroundColor Green

$foldersToRemove = @(
    '.amazonq',      # Amazon Q AI assistant config
    '.qodo',         # Qodo AI assistant config
    '__pycache__',   # Python cache
    '.pytest_cache'  # Pytest cache
)

$bytesFreed = 0

foreach ($folder in $foldersToRemove) {
    $path = Join-Path $PSScriptRoot $folder
    if (Test-Path $path) {
        $size = (Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($size / 1MB, 2)
        $bytesFreed += $size
        
        if ($DryRun) {
            Write-Host "  Would remove: $folder ($sizeMB MB)" -ForegroundColor DarkGray
        } else {
            Write-Host "  Removing: $folder ($sizeMB MB)..." -ForegroundColor Yellow
            Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "    ✓ Removed" -ForegroundColor Green
        }
    }
}

# Clean overlord.log if it's large
$logPath = Join-Path $PSScriptRoot "overlord.log"
if (Test-Path $logPath) {
    $logSize = (Get-Item $logPath).Length
    if ($logSize -gt 10MB) {
        $logSizeMB = [math]::Round($logSize / 1MB, 2)
        if ($DryRun) {
            Write-Host "  Would truncate: overlord.log ($logSizeMB MB)" -ForegroundColor DarkGray
        } else {
            Write-Host "  Truncating: overlord.log ($logSizeMB MB)..." -ForegroundColor Yellow
            Clear-Content $logPath
            Write-Host "    ✓ Truncated" -ForegroundColor Green
            $bytesFreed += $logSize
        }
    }
}

$freedMB = [math]::Round($bytesFreed / 1MB, 2)
Write-Host ""
Write-Host "💾 Space that will be freed: $freedMB MB" -ForegroundColor Cyan

# ============================================================================
# 3. CLEAN VS CODE CACHE
# ============================================================================

Write-Host ""
Write-Host "🧼 Cleaning VS Code Cache..." -ForegroundColor Green

$cacheLocations = @(
    "$env:APPDATA\Code\Cache",
    "$env:APPDATA\Code\CachedData",
    "$env:APPDATA\Code\CachedExtensions",
    "$env:APPDATA\Code\CachedExtensionVSIXs",
    "$env:APPDATA\Code\logs"
)

foreach ($cache in $cacheLocations) {
    if (Test-Path $cache) {
        $size = (Get-ChildItem $cache -Recurse -File -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum).Sum
        if ($size -gt 0) {
            $sizeMB = [math]::Round($size / 1MB, 2)
            if ($DryRun) {
                Write-Host "  Would clean: $(Split-Path $cache -Leaf) ($sizeMB MB)" -ForegroundColor DarkGray
            } else {
                Write-Host "  Cleaning: $(Split-Path $cache -Leaf) ($sizeMB MB)..." -ForegroundColor Yellow
                Remove-Item "$cache\*" -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "    ✓ Cleaned" -ForegroundColor Green
            }
        }
    }
}

# ============================================================================
# 4. OPTIMIZE SETTINGS
# ============================================================================

Write-Host ""
Write-Host "⚙️  Performance Optimization Recommendations:" -ForegroundColor Green
Write-Host ""
Write-Host "  Add these to your VS Code settings.json:" -ForegroundColor Cyan
Write-Host @"
  
  {
    // Reduce file watcher overhead
    "files.watcherExclude": {
      "**/.git/objects/**": true,
      "**/.git/subtree-cache/**": true,
      "**/node_modules/**": true,
      "**/.venv/**": true,
      "**/__pycache__/**": true
    },
    
    // Disable telemetry
    "telemetry.telemetryLevel": "off",
    
    // Reduce search overhead
    "search.exclude": {
      "**/node_modules": true,
      "**/venv": true,
      "**/.venv": true,
      "**/__pycache__": true
    },
    
    // Optimize GitLens (if keeping it)
    "gitlens.codeLens.enabled": false,
    "gitlens.currentLine.enabled": false,
    "gitlens.hovers.currentLine.over": "line",
    
    // Disable heavy features
    "editor.minimap.enabled": false,
    "editor.suggest.preview": false,
    "extensions.autoUpdate": false,
    
    // Python optimizations
    "python.languageServer": "Pylance",
    "python.analysis.indexing": false,
    "python.analysis.autoImportCompletions": false
  }
  
"@ -ForegroundColor DarkGray

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host ""
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Current VS Code Memory Usage:" -ForegroundColor Cyan
$vscodeMemory = Get-Process code -ErrorAction SilentlyContinue | 
                Measure-Object WorkingSet64 -Sum | 
                Select-Object @{Name='MB';Expression={[math]::Round($_.Sum / 1MB, 2)}}
Write-Host "   $($vscodeMemory.MB) MB" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Restart VS Code to apply all changes" -ForegroundColor White
Write-Host "   2. Review the recommended settings above" -ForegroundColor White
Write-Host "   3. Run: Get-Process code | Measure-Object WorkingSet64 -Sum" -ForegroundColor White
Write-Host "      (to verify memory improvement)" -ForegroundColor DarkGray
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 This was a DRY RUN. Run without -DryRun to apply changes." -ForegroundColor Yellow
}
]]>