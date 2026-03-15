#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated GitHub to Azure DevOps Repository Migration Script
    
.DESCRIPTION
    Migrates HomeBase 2.0 repository from GitHub to Azure DevOps
    Handles: repo migration, remote update, push, and verification
    
.PARAMETER AzureOrgName
    Your Azure DevOps organization name (required)
    Example: 'litlab' → https://dev.azure.com/litlab
    
.PARAMETER ProjectName
    Azure DevOps project name (default: 'HomeBase')
    
.PARAMETER RepositoryName
    Repository name in Azure DevOps (default: 'HomeBase')
    
.PARAMETER KeepGitHubBackup
    If true, renames origin to 'github-backup' instead of replacing
    
.EXAMPLE
    .\Migrate-ToAzureDevOps.ps1 -AzureOrgName 'litlab'
    
.EXAMPLE
    .\Migrate-ToAzureDevOps.ps1 -AzureOrgName 'litlab' -KeepGitHubBackup $true
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$AzureOrgName,
    
    [Parameter(Mandatory = $false)]
    [string]$ProjectName = 'HomeBase',
    
    [Parameter(Mandatory = $false)]
    [string]$RepositoryName = 'HomeBase',
    
    [Parameter(Mandatory = $false)]
    [bool]$KeepGitHubBackup = $false
)

$ErrorActionPreference = 'Stop'

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  GitHub → Azure DevOps Repository Migration                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify we're in the right directory
if (-not (Test-Path 'pnpm-workspace.yaml')) {
    Write-Host "❌ Error: Not in HomeBase root directory" -ForegroundColor Red
    Write-Host "   Must be in directory containing pnpm-workspace.yaml" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found HomeBase repository" -ForegroundColor Green
Write-Host ""

# Step 2: Verify Git is available
try {
    $gitVersion = git --version
    Write-Host "✅ Git available: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Install Git and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Check current remote
Write-Host "📋 Current Git remote:" -ForegroundColor Yellow
git remote -v
Write-Host ""

# Step 4: Build Azure DevOps URL
$azureRepoUrl = "https://dev.azure.com/$AzureOrgName/$ProjectName/_git/$RepositoryName"
Write-Host "🔗 Azure DevOps URL:" -ForegroundColor Cyan
Write-Host "   $azureRepoUrl" -ForegroundColor Cyan
Write-Host ""

# Step 5: Confirm with user
Write-Host "⚠️  This will:" -ForegroundColor Yellow
Write-Host "   1. $(if ($KeepGitHubBackup) { 'Rename origin to github-backup' } else { 'Replace origin with Azure DevOps' })"
Write-Host "   2. Push all branches and tags to Azure DevOps"
Write-Host "   3. Update your local git config"
Write-Host ""

$confirm = Read-Host "Continue? (yes/no)"
if ($confirm -ne 'yes') {
    Write-Host "❌ Migration cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# Step 6: Update remote
try {
    if ($KeepGitHubBackup) {
        Write-Host "🔄 Backing up GitHub remote..." -ForegroundColor Cyan
        git remote rename origin github-backup
        Write-Host "   ✅ Renamed origin → github-backup" -ForegroundColor Green
        
        git remote add origin $azureRepoUrl
        Write-Host "   ✅ Added new Azure DevOps remote as origin" -ForegroundColor Green
    } else {
        Write-Host "🔄 Updating remote..." -ForegroundColor Cyan
        git remote set-url origin $azureRepoUrl
        Write-Host "   ✅ Updated origin to Azure DevOps" -ForegroundColor Green
    }
    
    Write-Host ""
} catch {
    Write-Host "❌ Failed to update remote: $_" -ForegroundColor Red
    exit 1
}

# Step 7: Verify remote
Write-Host "📋 Updated Git remotes:" -ForegroundColor Yellow
git remote -v
Write-Host ""

# Step 8: Push all content
Write-Host "📤 Pushing repository to Azure DevOps..." -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "  Pushing main branch..." -ForegroundColor Yellow
    git push -u origin main --force
    Write-Host "  ✅ Main branch pushed" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "  Pushing all branches..." -ForegroundColor Yellow
    git push origin --all
    Write-Host "  ✅ All branches pushed" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "  Pushing all tags..." -ForegroundColor Yellow
    git push origin --tags
    Write-Host "  ✅ All tags pushed" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Push failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify Azure DevOps URL is correct"
    Write-Host "  2. Ensure you have 'Contribute' permission in Azure DevOps"
    Write-Host "  3. Check your credentials: az login"
    Write-Host "  4. Try pushing individual items:"
    Write-Host "     git push -u origin main --force"
    exit 1
}

# Step 9: Success summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Migration Successful!                                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   Repository: $RepositoryName"
Write-Host "   Project: $ProjectName"
Write-Host "   Organization: $AzureOrgName"
Write-Host "   URL: $azureRepoUrl"
Write-Host ""

if ($KeepGitHubBackup) {
    Write-Host "📌 Git Remotes:" -ForegroundColor Cyan
    Write-Host "   origin (primary): Azure DevOps" -ForegroundColor Green
    Write-Host "   github-backup: GitHub" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Go to: https://dev.azure.com/$AzureOrgName/$ProjectName"
Write-Host "   2. Verify your repository appears"
Write-Host "   3. Setup Azure Pipeline:"
Write-Host "      - Pipelines → New Pipeline"
Write-Host "      - Select: Azure Repos Git"
Write-Host "      - Choose: $RepositoryName"
Write-Host "      - YAML file: azure-pipelines.yml"
Write-Host "   4. Add secrets to Variable Groups:"
Write-Host "      - Pipelines → Library → homebase-secrets"
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   See AZURE_DEVOPS_MIGRATION.md for detailed instructions"
Write-Host ""
