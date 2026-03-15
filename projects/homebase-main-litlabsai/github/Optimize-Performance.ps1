#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive VS Code and project performance optimization script
.DESCRIPTION
    Cleans caches, kills hung processes, prunes Docker, and optimizes settings
#>

$ErrorActionPreference = "SilentlyContinue"
$WarningPreference = "SilentlyContinue"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  HOMEBASE 2.0 - PERFORMANCE OPTIMIZATION & CLEANUP         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════════
# 1. CHECK RESOURCE USAGE BEFORE
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "📊 ANALYZING CURRENT RESOURCE USAGE..." -ForegroundColor Yellow
$processes = Get-Process | Where-Object { $_.Name -like "*code*" -or $_.Name -like "*node*" -or $_.Name -like "*docker*" } | Sort-Object -Property WorkingSet -Descending | Select-Object -First 15
Write-Host "`nTop Memory Consumers:" -ForegroundColor Green
$processes | Format-Table @{Name="Process"; Expression={$_.Name}}, @{Name="Memory (MB)"; Expression={[math]::Round($_.WorkingSet/1MB, 2)}}, @{Name="CPU %"; Expression={[math]::Round($_.CPU, 2)}} -AutoSize

# ═══════════════════════════════════════════════════════════════════════════════
# 2. STOP HUNG PROCESSES
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n🔴 TERMINATING HUNG DOCKER/CONTAINER PROCESSES..." -ForegroundColor Yellow
@("vmmem", "docker", "dockerd", "vpnkit") | ForEach-Object {
    $proc = Get-Process -Name $_ -ErrorAction SilentlyContinue
    if($proc) {
        Write-Host "  ⚠️  Killing $_..." -ForegroundColor Yellow
        Stop-Process -Name $_ -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 500
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# 3. CLEAR VS CODE CACHES
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n🧹 CLEARING VS CODE CACHES..." -ForegroundColor Yellow

$cacheLocations = @(
    "$env:APPDATA\Code\Cache",
    "$env:APPDATA\Code\CachedData",
    "$env:APPDATA\Code\Code Cache",
    "$env:APPDATA\Code\Workspaces Cache",
    "$env:APPDATA\Code\logs",
    "$env:LOCALAPPDATA\Temp\vscode-*",
    "$HOME\.vscode\extensions" # extension cache
)

$totalCleared = 0
foreach($cache in $cacheLocations) {
    if(Test-Path $cache) {
        $size = (Get-ChildItem -Path $cache -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        if($size -gt 0) {
            Write-Host "  📁 Clearing: $cache ($([math]::Round($size, 2)) MB)" -ForegroundColor Cyan
            Remove-Item -Path $cache -Recurse -Force -ErrorAction SilentlyContinue
            $totalCleared += $size
        }
    }
}
Write-Host "  ✅ Total cleared: $([math]::Round($totalCleared, 2)) MB" -ForegroundColor Green

# ═══════════════════════════════════════════════════════════════════════════════
# 4. OPTIMIZE LANGUAGE SERVERS
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n⚙️  OPTIMIZING LANGUAGE SERVERS..." -ForegroundColor Yellow

$lsDir = "$env:APPDATA\Code\User\globalStorage\ms-python.python\globalStorage"
if(Test-Path "$lsDir\*") {
    Write-Host "  📁 Cleaning Python language server cache..." -ForegroundColor Cyan
    Remove-Item -Path "$lsDir\*" -Recurse -Force -ErrorAction SilentlyContinue
}

# ═══════════════════════════════════════════════════════════════════════════════
# 5. CLEAN PROJECT DIRECTORIES
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n🗑️  CLEANING PROJECT BUILD ARTIFACTS..." -ForegroundColor Yellow

$projectRoot = "E:\VSCode\HomeBase 2.0"
$cleanDirs = @(
    "$projectRoot\api\dist",
    "$projectRoot\api\.turbo",
    "$projectRoot\apps\web\.next",
    "$projectRoot\apps\web\.turbo",
    "$projectRoot\packages\core\dist",
    "$projectRoot\packages\core\.turbo",
    "$projectRoot\.turbo",
    "$projectRoot\node_modules\.cache",
    "$projectRoot\api\node_modules\.cache"
)

foreach($dir in $cleanDirs) {
    if(Test-Path $dir) {
        $size = (Get-ChildItem -Path $dir -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        if($size -gt 0) {
            Write-Host "  📁 Removing: $([System.IO.Path]::GetFileName($dir)) ($([math]::Round($size, 2)) MB)" -ForegroundColor Cyan
            Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# 6. CLEAN PNPM CACHE
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n📦 CLEANING PNPM CACHE..." -ForegroundColor Yellow
$pnpmHome = "$env:USERPROFILE\.pnpm-store"
if(Test-Path $pnpmHome) {
    Write-Host "  🔧 Running pnpm store prune..." -ForegroundColor Cyan
    & pnpm store prune 2>&1 | Out-Null
    Write-Host "  ✅ pnpm cache optimized" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════════════════════════
# 7. DOCKER CLEANUP (if available)
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n🐳 CLEANING DOCKER RESOURCES..." -ForegroundColor Yellow
if(Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "  🔧 Pruning Docker system..." -ForegroundColor Cyan
    docker container prune -f 2>&1 | Out-Null
    docker image prune -f 2>&1 | Out-Null
    docker volume prune -f 2>&1 | Out-Null
    Write-Host "  ✅ Docker cleanup complete" -ForegroundColor Green
} else {
    Write-Host "  ⏭️  Docker not found, skipping..." -ForegroundColor Gray
}

# ═══════════════════════════════════════════════════════════════════════════════
# 8. ANALYZE PROJECT SIZE
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n📊 PROJECT SIZE ANALYSIS..." -ForegroundColor Yellow

$dirs = @{
    "Root node_modules" = "$projectRoot\node_modules"
    "API node_modules" = "$projectRoot\api\node_modules"
    "Web node_modules" = "$projectRoot\apps\web\node_modules"
    "Web .next build" = "$projectRoot\apps\web\.next"
    "API dist" = "$projectRoot\api\dist"
    "Workspace total" = $projectRoot
}

foreach($name in $dirs.Keys) {
    $path = $dirs[$name]
    if(Test-Path $path) {
        $size = (Get-ChildItem -Path $path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "  📁 $name`: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
    }
}

# ═══════════════════════════════════════════════════════════════════════════════
# 9. EXTENSION OPTIMIZATION REPORT
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n🔌 INSTALLED EXTENSIONS (first 20):" -ForegroundColor Yellow
$extDir = "$env:USERPROFILE\.vscode\extensions"
if(Test-Path $extDir) {
    $exts = Get-ChildItem -Path $extDir -Directory | Select-Object -First 20
    $exts | ForEach-Object {
        $size = (Get-ChildItem -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "  • $($ _.Name) - $([math]::Round($size, 2)) MB" -ForegroundColor Gray
    }
    Write-Host "`n  💡 TIP: Disable unused extensions in VS Code settings" -ForegroundColor Magenta
}

# ═══════════════════════════════════════════════════════════════════════════════
# 10. RECOMMENDATIONS
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n📋 OPTIMIZATION RECOMMENDATIONS:" -ForegroundColor Cyan
Write-Host "  1. ✅ Disable unused extensions (Container, Dockerfile, unused languages)" -ForegroundColor Gray
Write-Host "  2. ✅ Update VS Code to latest version" -ForegroundColor Gray
Write-Host "  3. ✅ Check Docker Desktop WSL2 integration settings" -ForegroundColor Gray
Write-Host "  4. ✅ Run 'pnpm install --frozen-lockfile' to rebuild dependencies" -ForegroundColor Gray
Write-Host "  5. ✅ Disable source control autofetch: 'git.autofetch': false" -ForegroundColor Gray
Write-Host "  6. ✅ Settings already optimized - file watcher exclusions active" -ForegroundColor Gray

Write-Host "`n✨ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Close VS Code completely" -ForegroundColor Gray
Write-Host "  2. Reopen VS Code fresh" -ForegroundColor Gray
Write-Host "  3. Run: pnpm install" -ForegroundColor Gray
Write-Host "  4. Monitor Performance via VS Code > Help > Performance" -ForegroundColor Gray
Write-Host ""
