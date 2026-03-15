# Emergency Intelligence Module - Proactive monitoring and recovery
$script:HealthMetrics = @{}
$script:ErrorLog = @()

function Monitor-ProjectHealth {
    param([int]$IntervalSeconds = 60)
    
    Write-Host "🏥 Starting health monitoring (interval: ${IntervalSeconds}s)..." -ForegroundColor Cyan
    
    while ($true) {
        $health = Get-FullHealthStatus
        
        if ($health.CriticalIssues.Count -gt 0) {
            Write-Host "🚨 CRITICAL ISSUES DETECTED" -ForegroundColor Red
            $health.CriticalIssues | ForEach-Object {
                Write-Host "  ✗ $_" -ForegroundColor Red
            }
            Invoke-AutoRecovery $health.CriticalIssues
        }
        
        if ($health.Warnings.Count -gt 0) {
            Write-Host "⚠️  Warnings:" -ForegroundColor Yellow
            $health.Warnings | ForEach-Object {
                Write-Host "  ⚠ $_" -ForegroundColor Yellow
            }
        }
        
        Start-Sleep -Seconds $IntervalSeconds
    }
}

function Get-FullHealthStatus {
    $health = @{
        CriticalIssues = @()
        Warnings = @()
        Metrics = @{}
    }
    
    # Check disk space
    $disk = Get-Volume | Where-Object { $_.DriveLetter -eq 'C' }
    $diskPercent = [math]::Round(($disk.SizeRemaining / $disk.Size) * 100)
    $health.Metrics.DiskFree = $diskPercent
    
    if ($diskPercent -lt 5) {
        $health.CriticalIssues += "Disk space critical: ${diskPercent}% free"
    } elseif ($diskPercent -lt 15) {
        $health.Warnings += "Low disk space: ${diskPercent}% free"
    }
    
    # Check memory
    $memory = Get-WmiObject Win32_OperatingSystem
    $memPercent = [math]::Round(($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize * 100)
    $health.Metrics.MemoryUsed = $memPercent
    
    if ($memPercent -gt 90) {
        $health.CriticalIssues += "Memory critical: ${memPercent}% used"
    } elseif ($memPercent -gt 75) {
        $health.Warnings += "High memory usage: ${memPercent}% used"
    }
    
    # Check node_modules
    if ((Test-Path "node_modules") -and (Get-ChildItem "node_modules" -ErrorAction SilentlyContinue).Count -eq 0) {
        $health.CriticalIssues += "node_modules exists but is empty"
    }
    
    # Check lock files
    if (-not ((Test-Path "pnpm-lock.yaml") -or (Test-Path "package-lock.json"))) {
        $health.Warnings += "No lock file found"
    }
    
    # Check git status
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus -match '^\?\?') {
        $untracked = ($gitStatus | Where-Object { $_ -match '^\?\?' }).Count
        if ($untracked -gt 20) {
            $health.Warnings += "Many untracked files: $untracked"
        }
    }
    
    return $health
}

function Invoke-AutoRecovery {
    param([string[]]$Issues)
    
    Write-Host "🔧 Attempting automatic recovery..." -ForegroundColor Yellow
    
    foreach ($issue in $Issues) {
        if ($issue -match "node_modules.*empty") {
            Write-Host "  Reinstalling dependencies..." -ForegroundColor Gray
            pnpm install 2>$null
        }
        
        if ($issue -match "No lock file") {
            Write-Host "  Generating lock file..." -ForegroundColor Gray
            pnpm install 2>$null
        }
        
        if ($issue -match "Disk space critical") {
            Write-Host "  Cleaning cache..." -ForegroundColor Gray
            pnpm store prune 2>$null
            npm cache clean --force 2>$null
        }
    }
    
    Write-Host "✓ Recovery attempt complete" -ForegroundColor Green
}

function Diagnose-Issue {
    param([string]$Symptom)
    
    Write-Host "🔍 Diagnosing: $Symptom" -ForegroundColor Cyan
    
    $diagnostics = @{
        "build fails" = @(
            "Check TypeScript config: tsc --noEmit",
            "Check ESLint: pnpm lint",
            "Clear cache: pnpm store prune",
            "Reinstall: pnpm install"
        )
        "slow performance" = @(
            "Check disk space: Get-Volume",
            "Check memory: Get-WmiObject Win32_OperatingSystem",
            "Check node_modules size: (Get-ChildItem node_modules -Recurse | Measure-Object -Sum Length).Sum / 1GB",
            "Clear .next cache: Remove-Item .next -Recurse"
        )
        "git issues" = @(
            "Check status: git status",
            "Check remotes: git remote -v",
            "Verify SSH: ssh -T git@github.com",
            "Check credentials: git config --list"
        )
        "dependency conflicts" = @(
            "Check pnpm: pnpm list --depth=0",
            "Audit: pnpm audit",
            "Update: pnpm update",
            "Dedupe: pnpm dedupe"
        )
    }
    
    if ($diagnostics.ContainsKey($Symptom.ToLower())) {
        Write-Host "  Suggested steps:" -ForegroundColor Yellow
        $diagnostics[$Symptom.ToLower()] | ForEach-Object {
            Write-Host "    • $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "  Unknown symptom. Try: build fails, slow performance, git issues, dependency conflicts" -ForegroundColor Yellow
    }
}

function Clear-AllCaches {
    Write-Host "🧹 Clearing all caches..." -ForegroundColor Cyan
    
    $caches = @(
        @{ Name = "pnpm store"; Cmd = { pnpm store prune 2>$null } },
        @{ Name = "npm cache"; Cmd = { npm cache clean --force 2>$null } },
        @{ Name = ".next"; Cmd = { Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue } },
        @{ Name = ".turbo"; Cmd = { Remove-Item ".turbo" -Recurse -Force -ErrorAction SilentlyContinue } },
        @{ Name = "dist"; Cmd = { Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue } }
    )
    
    $caches | ForEach-Object {
        Write-Host "  Clearing $($_.Name)..." -ForegroundColor Gray
        & $_.Cmd
    }
    
    Write-Host "✓ Caches cleared" -ForegroundColor Green
}

Export-ModuleMember -Function @('Monitor-ProjectHealth', 'Get-FullHealthStatus', 'Invoke-AutoRecovery', 'Diagnose-Issue', 'Clear-AllCaches')
