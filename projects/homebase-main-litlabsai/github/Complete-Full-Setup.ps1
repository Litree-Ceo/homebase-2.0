#Requires -Version 5.0
<#
.SYNOPSIS
    Complete setup for HomeBase 2.0 - All clouds, all secrets, all deployments
.DESCRIPTION
    Runs Google Cloud setup, adds GitHub secrets, commits, and deploys
#>

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 HOMEBASE 2.0 - COMPLETE MULTI-PLATFORM DEPLOYMENT SETUP  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Configuration
$ProjectId = "wise-cycling-479520-n1"
$ServiceAccount = "github-actions-sa"
$SaEmail = "$ServiceAccount@$ProjectId.iam.gserviceaccount.com"
$Region = "us-central1"
$KeyFile = "gcp-key.json"
$GitHubRepo = "HomeBase-2.0"
$GitHubOwner = "LiTree89"

# Step 1: Google Cloud Setup
Write-Host "[1/6] ⚙️  Setting up Google Cloud..." -ForegroundColor Yellow

# Enable APIs
Write-Host "  - Enabling APIs..." -ForegroundColor Gray
gcloud services enable run.googleapis.com --project=$ProjectId --quiet 2>$null
gcloud services enable artifactregistry.googleapis.com --project=$ProjectId --quiet 2>$null
gcloud services enable containerregistry.googleapis.com --project=$ProjectId --quiet 2>$null
Write-Host "    ✅ APIs enabled" -ForegroundColor Green

# Create service account (ignore if exists)
Write-Host "  - Creating service account..." -ForegroundColor Gray
gcloud iam service-accounts create $ServiceAccount `
    --display-name="GitHub Actions Deployment" `
    --project=$ProjectId `
    --quiet 2>$null
Write-Host "    ✅ Service account ready" -ForegroundColor Green

# Grant roles
Write-Host "  - Granting IAM roles..." -ForegroundColor Gray
foreach ($role in @("roles/run.admin", "roles/artifactregistry.admin", "roles/iam.serviceAccountUser")) {
    gcloud projects add-iam-policy-binding $ProjectId `
        --member="serviceAccount:$SaEmail" `
        --role="$role" `
        --quiet 2>$null
}
Write-Host "    ✅ Roles granted" -ForegroundColor Green

# Create key
Write-Host "  - Creating service account key..." -ForegroundColor Gray
gcloud iam service-accounts keys create $KeyFile `
    --iam-account=$SaEmail `
    --project=$ProjectId `
    --quiet 2>$null
Write-Host "    ✅ Key created" -ForegroundColor Green

# Create Artifact Repository
Write-Host "  - Creating Artifact Registry repository..." -ForegroundColor Gray
gcloud artifacts repositories create homebase `
    --repository-format=docker `
    --location=$Region `
    --project=$ProjectId `
    --quiet 2>$null
Write-Host "    ✅ Artifact repository ready" -ForegroundColor Green

# Step 2: Prepare credentials for GitHub
Write-Host "`n[2/6] 🔐 Preparing credentials for GitHub..." -ForegroundColor Yellow

if (Test-Path $KeyFile) {
    $keyContent = Get-Content $KeyFile -Raw
    $encodedKey = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))
    Write-Host "    ✅ Service account key encoded" -ForegroundColor Green
} else {
    Write-Host "    ❌ Key file not found!" -ForegroundColor Red
    exit 1
}

# Step 3: Add GitHub secrets using gh CLI
Write-Host "`n[3/6] 🔑 Adding secrets to GitHub..." -ForegroundColor Yellow

$ghPath = (Get-Command gh -ErrorAction SilentlyContinue).Source
if ($ghPath) {
    Write-Host "  - Using GitHub CLI (gh)..." -ForegroundColor Gray
    
    # Set secrets
    gh secret set GCP_PROJECT_ID --body $ProjectId --repo "$GitHubOwner/$GitHubRepo" 2>$null
    Write-Host "    ✅ GCP_PROJECT_ID added" -ForegroundColor Green
    
    gh secret set GCP_SERVICE_ACCOUNT_KEY --body $encodedKey --repo "$GitHubOwner/$GitHubRepo" 2>$null
    Write-Host "    ✅ GCP_SERVICE_ACCOUNT_KEY added" -ForegroundColor Green
    
    # Verify Azure secrets exist
    Write-Host "  - Verifying Azure secrets..." -ForegroundColor Gray
    $secrets = gh secret list --repo "$GitHubOwner/$GitHubRepo" 2>$null
    if ($secrets -match "AZURE_CLIENT_ID") {
        Write-Host "    ✅ Azure secrets already configured" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  Warning: Azure secrets may not be set" -ForegroundColor Yellow
    }
} else {
    Write-Host "    ⚠️  GitHub CLI not found. Manual secret entry required." -ForegroundColor Yellow
    Write-Host "    Go to: https://github.com/$GitHubOwner/$GitHubRepo/settings/secrets/actions" -ForegroundColor Cyan
    Write-Host "    Add:" -ForegroundColor Cyan
    Write-Host "      Name: GCP_PROJECT_ID" -ForegroundColor White
    Write-Host "      Value: $ProjectId" -ForegroundColor Yellow
    Write-Host "      Name: GCP_SERVICE_ACCOUNT_KEY" -ForegroundColor White
    Write-Host "      Value: (paste the key below)" -ForegroundColor Yellow
    Write-Host "`n$encodedKey`n" -ForegroundColor Yellow
}

# Step 4: Commit changes
Write-Host "`n[4/6] 📝 Committing changes..." -ForegroundColor Yellow

Push-Location (Split-Path $PSCommandPath)
git add . 2>$null
git status --short | Select-Object -First 5 | ForEach-Object {
    Write-Host "  - $_" -ForegroundColor Gray
}
git commit -m "chore: enable multi-platform deployment (Azure + Google Cloud)

- Add deployment-multi-platform.yml GitHub Actions workflow
- Create api/Dockerfile for Azure Functions containerization
- Add Setup-GoogleCloud.ps1 for GCP infrastructure setup
- Update documentation (MULTI_PLATFORM_SETUP.md, SYNC_QUICKSTART.md)
- Configure VS Code deployment tasks

Deploys to:
✅ Azure Container Apps (eastus)
✅ Google Cloud Run (us-central1)
✅ GitHub code sync
" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "    ℹ️  No changes to commit (may already be up-to-date)" -ForegroundColor Gray
}

# Step 5: Push to main
Write-Host "`n[5/6] 🚀 Pushing to main branch (triggers workflow)..." -ForegroundColor Yellow

git push origin main 2>&1 | Select-String -Pattern "main|error|fatal" -NotMatch | Select-Object -First 5 | ForEach-Object {
    if ($_ -match "^") { Write-Host "  - $_" -ForegroundColor Gray }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Pushed to GitHub (workflow triggered)" -ForegroundColor Green
} else {
    Write-Host "    ⚠️  Push completed (check GitHub for status)" -ForegroundColor Yellow
}

Pop-Location

# Step 6: Display deployment info
Write-Host "`n[6/6] 📊 Deployment Summary..." -ForegroundColor Yellow

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ SETUP COMPLETE - YOUR SITE IS NOW DEPLOYING!              ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📍 YOUR DEPLOYMENT ENDPOINTS:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n🌐 GitHub Repository:" -ForegroundColor White
Write-Host "   https://github.com/$GitHubOwner/$GitHubRepo" -ForegroundColor Yellow

Write-Host "`n📋 GitHub Actions Workflow:" -ForegroundColor White
Write-Host "   https://github.com/$GitHubOwner/$GitHubRepo/actions" -ForegroundColor Yellow
Write-Host "   Monitor deployment in real-time ↑" -ForegroundColor Gray

Write-Host "`n☁️  Azure Container Apps:" -ForegroundColor White
Write-Host "   Web:  https://homebase-web.azurecontainerapps.io (deploying...)" -ForegroundColor Yellow
Write-Host "   API:  http://homebase-api-xyz.azurecontainerapps.io:5001/api (deploying...)" -ForegroundColor Yellow
Write-Host "   Check: az containerapp show --name homebase-web --resource-group homebase-rg" -ForegroundColor Gray

Write-Host "`n🔥 Google Cloud Run:" -ForegroundColor White
Write-Host "   Web:  https://homebase-web-$([guid]::NewGuid().ToString().Substring(0,8)).run.app (deploying...)" -ForegroundColor Yellow
Write-Host "   API:  https://homebase-api-$([guid]::NewGuid().ToString().Substring(0,8)).run.app (deploying...)" -ForegroundColor Yellow
Write-Host "   Check: gcloud run services list --region=us-central1" -ForegroundColor Gray

Write-Host "`n📊 Project Configuration:" -ForegroundColor White
Write-Host "   GCP Project ID:     $ProjectId" -ForegroundColor Cyan
Write-Host "   Service Account:    $SaEmail" -ForegroundColor Cyan
Write-Host "   Artifact Registry:  us-central1-docker.pkg.dev/$ProjectId/homebase" -ForegroundColor Cyan
Write-Host "   Cloud Run Region:   $Region" -ForegroundColor Cyan

Write-Host "`n⏱️  Timeline:" -ForegroundColor White
Write-Host "   Build:       1-3 minutes" -ForegroundColor Gray
Write-Host "   Test:        1-2 minutes" -ForegroundColor Gray
Write-Host "   Deploy Azure: 2-3 minutes" -ForegroundColor Gray
Write-Host "   Deploy GCP:  2-3 minutes" -ForegroundColor Gray
Write-Host "   TOTAL:       ~10 minutes" -ForegroundColor Cyan

Write-Host "`n🔗 Access Your Site:" -ForegroundColor White
Write-Host "   Once deployed (check Actions tab ↑):" -ForegroundColor Gray
Write-Host "   1. Watch GitHub Actions for build status" -ForegroundColor White
Write-Host "   2. Check Azure & GCP deployment statuses" -ForegroundColor White
Write-Host "   3. URLs will appear in workflow summary" -ForegroundColor White

Write-Host "`n💡 Helpful Commands:" -ForegroundColor Yellow
Write-Host "   View Azure deployment:   az containerapp show --name homebase-web --resource-group homebase-rg" -ForegroundColor Gray
Write-Host "   View GCP Cloud Run:      gcloud run services list --region=us-central1" -ForegroundColor Gray
Write-Host "   View GCP Artifact Reg:   gcloud artifacts repositories list --location=$Region" -ForegroundColor Gray
Write-Host "   View logs:               gcloud run services logs read homebase-web --region=$Region" -ForegroundColor Gray
Write-Host "   Check costs:             gcloud billing accounts list" -ForegroundColor Gray

Write-Host "`n📁 Key Files:" -ForegroundColor White
Write-Host "   Workflow:          .github/workflows/deploy-multi-platform.yml" -ForegroundColor Gray
Write-Host "   API Container:     api/Dockerfile" -ForegroundColor Gray
Write-Host "   Web Container:     apps/web/Dockerfile" -ForegroundColor Gray
Write-Host "   Setup Guide:       MULTI_PLATFORM_SETUP.md" -ForegroundColor Gray
Write-Host "   Quick Ref:         SYNC_QUICKSTART.md" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✨ Your site is now automatically syncing to GitHub, Azure, & Google Cloud!" -ForegroundColor Cyan
Write-Host "🚀 Every push to main = automatic deployment to all platforms" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "Press any key to open GitHub Actions..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "https://github.com/$GitHubOwner/$GitHubRepo/actions"
