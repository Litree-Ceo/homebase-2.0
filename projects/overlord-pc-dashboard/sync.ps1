#!/usr/bin/env pwsh
# sync.ps1 — Push changes to GitHub and optionally restart Docker
# Usage:
#   .\sync.ps1                        # commit + push (auto-message)
#   .\sync.ps1 "my commit message"    # commit + push with custom message
#   .\sync.ps1 "" -Restart            # commit + push + restart Docker container

param(
    [string]$Message = "",
    [switch]$Restart
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Commit message ────────────────────────────────────────────────────────────
if (-not $Message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $Message   = "overlord: sync $timestamp"
}

# ── Git push ──────────────────────────────────────────────────────────────────
Write-Host "`n[SYNC] Staging all changes..." -ForegroundColor Cyan
git add -A

$status = git status --porcelain
if (-not $status) {
    Write-Host "[SYNC] Nothing to commit — already up to date." -ForegroundColor Green
} else {
    Write-Host "[SYNC] Committing: $Message" -ForegroundColor Cyan
    git commit -m $Message
    Write-Host "[SYNC] Pushing to origin/main..." -ForegroundColor Cyan
    git push origin main
    Write-Host "[SYNC] Done! Changes pushed." -ForegroundColor Green
}

# ── Optional Docker restart ───────────────────────────────────────────────────
if ($Restart) {
    Write-Host "`n[DOCKER] Rebuilding and restarting container..." -ForegroundColor Cyan
    docker compose up -d --build
    Write-Host "[DOCKER] Container restarted." -ForegroundColor Green
}

Write-Host ""
