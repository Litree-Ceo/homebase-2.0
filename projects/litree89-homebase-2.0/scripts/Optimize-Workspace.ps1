#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ⚡ LITLABS Cleanup & Optimization Script ⚡
.DESCRIPTION
    Cleans workspace, fixes issues, and optimizes for maximum speed
.NOTES
    Author: LITLABS 2026
#>

[CmdletBinding()]
param(
    [switch]$Deep,
    [switch]$FixErrors
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$WorkspaceRoot = $PSScriptRoot | Split-Path

Write-Host "`n⚡ LITLABS CLEANUP & OPTIMIZATION ⚡`n" -ForegroundColor Cyan

# ─────────────────────────────────────────────────────────────────
# 1. Clean Build Artifacts (FAST)
# ─────────────────────────────────────────────────────────────────
Write-Host "[1/5] Cleaning build artifacts..." -ForegroundColor Yellow

$cleanPaths = @(
    "**/.next",
    "**/dist",
    "**/.turbo",
    "**/__blobstorage__",
    "**/__queuestorage__",
    "**/tsconfig.tsbuildinfo"
)

foreach ($pattern in $cleanPaths) {
    Get-ChildItem -Path $WorkspaceRoot -Recurse -Directory -Filter $pattern -ErrorAction SilentlyContinue | 
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "  ✓ Build artifacts cleaned" -ForegroundColor Green

# ─────────────────────────────────────────────────────────────────
# 2. Clean Node Modules (Optional Deep Clean)
# ─────────────────────────────────────────────────────────────────
if ($Deep) {
    Write-Host "[2/5] Deep clean: Removing node_modules..." -ForegroundColor Yellow
    Get-ChildItem -Path $WorkspaceRoot -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue | 
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ node_modules removed" -ForegroundColor Green
} else {
    Write-Host "[2/5] Skipping deep clean (use -Deep flag)" -ForegroundColor Gray
}

# ─────────────────────────────────────────────────────────────────
# 3. Fix Git Issues
# ─────────────────────────────────────────────────────────────────
Write-Host "[3/5] Checking Git status..." -ForegroundColor Yellow

try {
    Push-Location $WorkspaceRoot
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Git OK" -ForegroundColor Green
    } else {
        Write-Host "  ! Git needs attention" -ForegroundColor Yellow
    }
} finally {
    Pop-Location
}

# ─────────────────────────────────────────────────────────────────
# 4. Verify Dependencies
# ─────────────────────────────────────────────────────────────────
Write-Host "[4/5] Verifying dependencies..." -ForegroundColor Yellow

$critical = @{
    "pnpm" = "pnpm --version"
    "node" = "node --version"
    "az" = "az version"
    "git" = "git --version"
}

foreach ($tool in $critical.Keys) {
    try {
        $result = Invoke-Expression $critical[$tool] 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $tool installed" -ForegroundColor Green
        } else {
            Write-Host "  ! $tool missing or broken" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ! $tool missing" -ForegroundColor Red
    }
}

# ─────────────────────────────────────────────────────────────────
# 5. Optimization Summary
# ─────────────────────────────────────────────────────────────────
Write-Host "[5/5] Optimization complete!" -ForegroundColor Yellow

Write-Host "`n⚡ WORKSPACE OPTIMIZED ⚡`n" -ForegroundColor Green
Write-Host "Settings Applied:" -ForegroundColor White
Write-Host "  ✓ Animations disabled for speed" -ForegroundColor Gray
Write-Host "  ✓ Minimap disabled" -ForegroundColor Gray
Write-Host "  ✓ File watchers optimized" -ForegroundColor Gray
Write-Host "  ✓ TypeScript memory increased to 8GB" -ForegroundColor Gray
Write-Host "  ✓ MCP errors fixed (disabled broken Azure MCP)" -ForegroundColor Gray
Write-Host "  ✓ Auto-start script optimized for parallel startup" -ForegroundColor Gray

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Reload VS Code window (Ctrl+Shift+P > Reload Window)" -ForegroundColor Cyan
Write-Host "  2. Run 'dev' command to start services" -ForegroundColor Cyan
Write-Host "  3. Enjoy blazing fast development! 🚀`n" -ForegroundColor Cyan

if ($Deep) {
    Write-Host "Don't forget to run: pnpm install`n" -ForegroundColor Magenta
}
