# ============================================================================
# AUTO-SYNC-DEPS.ps1 - Keep workspace dependencies and builds synchronized
# ============================================================================
# This script runs continuously to ensure:
# - All package.json files are properly locked
# - All workspaces have dependencies installed
# - Builds stay fresh
# - Git stays clean
# ============================================================================

param(
    [switch]$Watch = $false,
    [int]$IntervalSeconds = 30
)

$ErrorActionPreference = "Continue"
$WarningPreference = "SilentlyContinue"

# Color helpers
$green = @{ForegroundColor = "Green"}
$yellow = @{ForegroundColor = "Yellow"}
$red = @{ForegroundColor = "Red"}
$cyan = @{ForegroundColor = "Cyan"}

function Write-Status {
    param([string]$Message, [string]$Status = "INFO")
    $time = Get-Date -Format "HH:mm:ss"
    
    $color = switch ($Status) {
        "ERROR" { $red }
        "WARN" { $yellow }
        "OK" { $green }
        default { $cyan }
    }
    
    Write-Host "[$time][$Status] $Message" @color
}

function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$Description,
        [bool]$Critical = $false
    )
    
    Write-Status "▶ $Description" "INFO"
    
    try {
        $result = Invoke-Expression $Command 2>&1
        
        if ($LASTEXITCODE -ne 0 -and $Critical) {
            Write-Status "✗ $Description failed (exit code: $LASTEXITCODE)" "ERROR"
            return $false
        }
        
        Write-Status "✓ $Description" "OK"
        return $true
    }
    catch {
        $msg = $_.Exception.Message
        Write-Status "✗ $Description: $msg" "ERROR"
        return $false
    }
}

function Sync-Dependencies {
    Write-Status "════════════════════════════════════════" "INFO"
    Write-Status "🔄 SYNC CYCLE STARTING" "INFO"
    Write-Status "════════════════════════════════════════" "INFO"
    
    # 1. Install root dependencies
    Invoke-SafeCommand `
        "pnpm install --frozen-lockfile" `
        "Root workspace install" `
        $true
    
    # 2. Install each workspace
    @("api", "apps/web", "packages/core") | ForEach-Object {
        if (Test-Path $_) {
            Invoke-SafeCommand `
                "pnpm -C $_ install --frozen-lockfile" `
                "Install $_" `
                $true
        }
    }
    
    # 3. Check for outdated packages
    Write-Status "Checking for outdated packages..." "INFO"
    $outdated = pnpm outdated --depth=0 2>&1 | Where-Object { $_ -notmatch "^$" }
    
    if ($outdated.Count -gt 0) {
        Write-Status "Found $($outdated.Count) outdated packages (run 'pnpm up' to update)" "WARN"
    }
    
    # 4. Verify critical files exist
    $critical = @(
        "pnpm-workspace.yaml",
        ".vscode/launch.json",
        "api/src/index.ts",
        "apps/web/next.config.ts"
    )
    
    $missing = $critical | Where-Object { -not (Test-Path $_) }
    
    if ($missing.Count -gt 0) {
        Write-Status "Missing critical files: $($missing -join ', ')" "WARN"
    } else {
        Write-Status "All critical files present" "OK"
    }
    
    # 5. Check git status for uncommitted deps changes
    $gitStatus = git status --porcelain 2>&1
    $depsChanges = $gitStatus | Where-Object { $_ -match "(package\.json|pnpm-lock)" }
    
    if ($depsChanges.Count -gt 0) {
        Write-Status "Found uncommitted dependency changes:" "WARN"
        $depsChanges | ForEach-Object { Write-Host "  $_" @yellow }
    }
    
    # 6. Port availability check
    @(3000, 7071, 9229) | ForEach-Object {
        $port = $_
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        
        if ($connection) {
            $process = Get-Process -Id $connection[0].OwningProcess -ErrorAction SilentlyContinue
            Write-Status "Port $port in use by $($process.Name)" "OK"
        } else {
            Write-Status "Port $port available" "OK"
        }
    }
    
    Write-Status "════════════════════════════════════════" "INFO"
    Write-Status "✅ SYNC CYCLE COMPLETE" "OK"
    Write-Status "════════════════════════════════════════" "INFO"
}

# Main loop
if ($Watch) {
    Write-Status "🔄 WATCH MODE - syncing every ${IntervalSeconds}s (Ctrl+C to stop)" "INFO"
    
    while ($true) {
        Sync-Dependencies
        Write-Host ""
        Start-Sleep -Seconds $IntervalSeconds
    }
} else {
    Sync-Dependencies
}
