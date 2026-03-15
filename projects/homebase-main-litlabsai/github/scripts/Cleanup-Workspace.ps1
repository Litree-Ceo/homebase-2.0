<#
.SYNOPSIS
    Consolidates HomeBase 2.0 workspace - removes duplicates, archives legacy folders

.DESCRIPTION
    This script cleans up the workspace by:
    1. Archiving duplicate packages/api folder
    2. Properly handling the workspace submodule
    3. Cleaning up legacy functions folder
    4. Committing the consolidated structure

.EXAMPLE
    .\scripts\Cleanup-Workspace.ps1
#>

param(
    [switch]$DryRun,
    [switch]$SkipGitCommit
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "`n🏠 HomeBase 2.0 Workspace Cleanup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made`n" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────────────
# 1. Archive duplicate packages/api
# ─────────────────────────────────────────────────────────────────
$packagesApi = Join-Path $Root "packages\api"
$archiveDir = Join-Path $Root ".archive"
$archiveDest = Join-Path $archiveDir "legacy-packages-api-functions"

if (Test-Path $packagesApi) {
    Write-Host "📦 Found duplicate: packages/api" -ForegroundColor Yellow
    
    if (-not $DryRun) {
        if (-not (Test-Path $archiveDir)) {
            New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
        }
        
        if (Test-Path $archiveDest) {
            Remove-Item -Recurse -Force $archiveDest
        }
        
        Move-Item $packagesApi $archiveDest -Force
        Write-Host "   ✅ Moved to .archive/legacy-packages-api-functions" -ForegroundColor Green
    } else {
        Write-Host "   Would move to .archive/legacy-packages-api-functions" -ForegroundColor DarkGray
    }
} else {
    Write-Host "✅ packages/api already cleaned up" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────
# 2. Handle workspace submodule (EverythingHomebase)
# ─────────────────────────────────────────────────────────────────
$workspaceDir = Join-Path $Root "workspace"
$gitmodules = Join-Path $Root ".gitmodules"

if (Test-Path $workspaceDir) {
    Write-Host "`n📁 Found workspace/ submodule (EverythingHomebase)" -ForegroundColor Yellow
    Write-Host "   This is a separate git repo - keeping but marking as archived reference" -ForegroundColor DarkGray
    
    # Create a README in workspace to clarify its purpose
    $workspaceReadme = @"
# ⚠️ Legacy Submodule - Do Not Modify

This folder is the `EverythingHomebase` git submodule.

**Do NOT:**
- Edit files here directly
- Commit changes to this folder
- Duplicate work between here and root

**The active project is in the root `HomeBase 2.0` folder.**

If you need to update this submodule:
```powershell
git submodule update --remote workspace
```
"@
    
    if (-not $DryRun) {
        $workspaceReadme | Set-Content (Join-Path $workspaceDir "README_SUBMODULE.md") -Force
        Write-Host "   ✅ Added README_SUBMODULE.md clarification" -ForegroundColor Green
    }
}

# ─────────────────────────────────────────────────────────────────
# 3. Check for legacy functions/ folder
# ─────────────────────────────────────────────────────────────────
$functionsDir = Join-Path $Root "functions"
$functionsArchive = Join-Path $archiveDir "legacy-functions-js"

if (Test-Path $functionsDir) {
    Write-Host "`n📁 Found legacy functions/ folder (JavaScript)" -ForegroundColor Yellow
    
    # Check if it has unique content not in api/
    $functionsFiles = Get-ChildItem $functionsDir -Recurse -File | Where-Object { $_.Extension -in ".js", ".ts" }
    
    if ($functionsFiles.Count -gt 0) {
        Write-Host "   Contains $($functionsFiles.Count) JS/TS files" -ForegroundColor DarkGray
        Write-Host "   Note: Grok integration lives here - consider migrating to api/" -ForegroundColor DarkGray
        
        # Don't auto-archive - it has Grok integration that may be needed
        Write-Host "   ⚠️ Keeping for now - contains GrokChat integration" -ForegroundColor Yellow
    }
}

# ─────────────────────────────────────────────────────────────────
# 4. Verify pnpm-workspace.yaml is correct
# ─────────────────────────────────────────────────────────────────
$pnpmWorkspace = Join-Path $Root "pnpm-workspace.yaml"
$expectedContent = @"
# HomeBase 2.0 - Unified Workspace
# Primary API: api/ (Azure Functions v4 TypeScript)
# Frontend: apps/web/ (Next.js)
# Shared: packages/core/ (utilities)

packages:
  - 'api'
  - 'apps/*'
  - 'packages/core'
"@

Write-Host "`n📄 Checking pnpm-workspace.yaml..." -ForegroundColor Cyan
$currentContent = Get-Content $pnpmWorkspace -Raw -ErrorAction SilentlyContinue

if ($currentContent -match "packages/\*") {
    Write-Host "   ⚠️ Contains packages/* - updating..." -ForegroundColor Yellow
    if (-not $DryRun) {
        $expectedContent | Set-Content $pnpmWorkspace -Force
        Write-Host "   ✅ Updated to exclude duplicate packages/api" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ Already configured correctly" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────
# 5. Update .gitignore to include archive
# ─────────────────────────────────────────────────────────────────
$gitignore = Join-Path $Root ".gitignore"
$gitignoreContent = Get-Content $gitignore -Raw -ErrorAction SilentlyContinue

$archiveIgnoreEntry = ".archive/legacy-packages-api-functions/"

if ($gitignoreContent -notmatch [regex]::Escape($archiveIgnoreEntry)) {
    Write-Host "`n📄 Updating .gitignore..." -ForegroundColor Cyan
    if (-not $DryRun) {
        Add-Content $gitignore "`n# Archived duplicate folders`n$archiveIgnoreEntry"
        Write-Host "   ✅ Added archive exclusion" -ForegroundColor Green
    }
} else {
    Write-Host "`n✅ .gitignore already excludes archived folders" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────
# 6. Summary
# ─────────────────────────────────────────────────────────────────
Write-Host "`n" + "═" * 50 -ForegroundColor Cyan
Write-Host "📋 WORKSPACE STRUCTURE (After Cleanup)" -ForegroundColor Cyan
Write-Host "═" * 50 -ForegroundColor Cyan

$structure = @"

HomeBase 2.0/
├── api/                    ← PRIMARY API (Azure Functions v4 TS)
│   └── src/
│       ├── functions/      ← HTTP endpoints
│       ├── bots/           ← Autonomous bot system
│       └── shared/         ← Shared utilities
├── apps/
│   ├── web/                ← Next.js frontend
│   ├── mobile/             ← React Native (placeholder)
│   └── desktop/            ← Electron (placeholder)
├── packages/
│   └── core/               ← Shared utilities
├── functions/              ← Legacy Grok (to migrate)
├── docs/                   ← Documentation
├── scripts/                ← Automation scripts
├── infra/                  ← Azure Bicep/IaC
├── workspace/              ← Git submodule (IGNORE)
└── .archive/               ← Archived duplicates

"@

Write-Host $structure -ForegroundColor White

# ─────────────────────────────────────────────────────────────────
# 7. Git commit (if not dry run and not skipped)
# ─────────────────────────────────────────────────────────────────
if (-not $DryRun -and -not $SkipGitCommit) {
    Write-Host "`n🔄 Committing changes..." -ForegroundColor Cyan
    
    Push-Location $Root
    try {
        git add .gitignore
        git add pnpm-workspace.yaml
        git add HomeBase.code-workspace
        git add workspace/README_SUBMODULE.md -f 2>$null
        git add scripts/Cleanup-Workspace.ps1
        
        $commitMsg = "chore: consolidate workspace - archive duplicates, single project structure"
        git commit -m $commitMsg 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Changes committed" -ForegroundColor Green
        } else {
            Write-Host "   ℹ️ No changes to commit or commit skipped" -ForegroundColor DarkGray
        }
    } finally {
        Pop-Location
    }
}

Write-Host "`n✨ Cleanup complete!" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`nRun without -DryRun to apply changes:" -ForegroundColor Yellow
    Write-Host "  .\scripts\Cleanup-Workspace.ps1" -ForegroundColor White
}
