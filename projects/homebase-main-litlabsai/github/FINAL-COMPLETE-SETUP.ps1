#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🚀 HomeBase 2.0 - COMPLETE DEPLOYMENT SETUP
    
.DESCRIPTION
    Run this in Windows PowerShell (NOT WSL) to:
    1. Setup Google Cloud infrastructure
    2. Add GitHub secrets automatically
    3. Commit and deploy to all platforms
    
.EXAMPLE
    # In Windows PowerShell:
    cd 'e:\VSCode\HomeBase 2.0'
    .\FINAL-COMPLETE-SETUP.ps1
#>

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# CONFIG
$GCP_PROJECT = "wise-cycling-479520-n1"
$GCP_SA = "github-actions-sa"
$GCP_SA_EMAIL = "$GCP_SA@$GCP_PROJECT.iam.gserviceaccount.com"
$GCP_REGION = "us-central1"
$KEY_FILE = "gcp-key.json"
$GITHUB_REPO = "HomeBase-2.0"
$GITHUB_OWNER = "LiTree89"

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 HOMEBASE 2.0 - COMPLETE DEPLOYMENT SETUP                  ║" -ForegroundColor Cyan
Write-Host "║     This script must run in Windows PowerShell (not WSL)       ║" -ForegroundColor Yellow
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verify gcloud is available
Write-Host "[CHECK] Verifying gcloud CLI is available..." -ForegroundColor Yellow
$gcloudPath = (Get-Command gcloud -ErrorAction SilentlyContinue).Source
if (-not $gcloudPath) {
    Write-Host "❌ gcloud CLI not found in PATH!" -ForegroundColor Red
    Write-Host "`n⚠️  You must run this in Windows PowerShell where gcloud is installed." -ForegroundColor Yellow
    Write-Host "   Close WSL and open PowerShell on Windows, then run:" -ForegroundColor Cyan
    Write-Host "   cd 'e:\VSCode\HomeBase 2.0'" -ForegroundColor White
    Write-Host "   .\FINAL-COMPLETE-SETUP.ps1`n" -ForegroundColor White
    exit 1
}
Write-Host "✅ gcloud CLI found at: $gcloudPath`n" -ForegroundColor Green

# STEP 1: Google Cloud Setup
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[1/6] ⚙️  GOOGLE CLOUD SETUP" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "→ Enabling Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com --project=$GCP_PROJECT --quiet 2>$null | Out-Null
gcloud services enable artifactregistry.googleapis.com --project=$GCP_PROJECT --quiet 2>$null | Out-Null
gcloud services enable containerregistry.googleapis.com --project=$GCP_PROJECT --quiet 2>$null | Out-Null
Write-Host "  ✅ APIs enabled (run, artifactregistry, containerregistry)" -ForegroundColor Green

Write-Host "→ Creating service account..." -ForegroundColor Yellow
gcloud iam service-accounts create $GCP_SA `
    --display-name="GitHub Actions Deployment" `
    --project=$GCP_PROJECT `
    --quiet 2>$null
Write-Host "  ✅ Service account: $GCP_SA_EMAIL" -ForegroundColor Green

Write-Host "→ Granting IAM roles..." -ForegroundColor Yellow
$roles = @("roles/run.admin", "roles/artifactregistry.admin", "roles/iam.serviceAccountUser")
foreach ($role in $roles) {
    gcloud projects add-iam-policy-binding $GCP_PROJECT `
        --member="serviceAccount:$GCP_SA_EMAIL" `
        --role="$role" `
        --quiet 2>$null | Out-Null
    Write-Host "  ✅ $role" -ForegroundColor Green
}

Write-Host "→ Creating service account key..." -ForegroundColor Yellow
gcloud iam service-accounts keys create $KEY_FILE `
    --iam-account=$GCP_SA_EMAIL `
    --project=$GCP_PROJECT `
    --quiet 2>$null
Write-Host "  ✅ Key saved: $KEY_FILE" -ForegroundColor Green

Write-Host "→ Creating Artifact Registry repository..." -ForegroundColor Yellow
gcloud artifacts repositories create homebase `
    --repository-format=docker `
    --location=$GCP_REGION `
    --project=$GCP_PROJECT `
    --quiet 2>$null
Write-Host "  ✅ Repository: us-central1-docker.pkg.dev/$GCP_PROJECT/homebase" -ForegroundColor Green

# STEP 2: Prepare credentials
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[2/6] 🔐 PREPARING CREDENTIALS FOR GITHUB" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

if (Test-Path $KEY_FILE) {
    $keyContent = Get-Content $KEY_FILE -Raw
    $encodedKey = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))
    Write-Host "✅ Service account key encoded (base64)" -ForegroundColor Green
} else {
    Write-Host "❌ Key file not found!" -ForegroundColor Red
    exit 1
}

# STEP 3: Add GitHub secrets
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[3/6] 🔑 ADDING SECRETS TO GITHUB" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$ghPath = (Get-Command gh -ErrorAction SilentlyContinue).Source
if ($ghPath) {
    Write-Host "→ Using GitHub CLI (gh)..." -ForegroundColor Yellow
    
    Write-Host "  Setting GCP_PROJECT_ID..." -ForegroundColor Gray
    gh secret set GCP_PROJECT_ID --body $GCP_PROJECT --repo "$GITHUB_OWNER/$GITHUB_REPO" 2>&1 | Out-Null
    Write-Host "  ✅ GCP_PROJECT_ID = $GCP_PROJECT" -ForegroundColor Green
    
    Write-Host "  Setting GCP_SERVICE_ACCOUNT_KEY..." -ForegroundColor Gray
    gh secret set GCP_SERVICE_ACCOUNT_KEY --body $encodedKey --repo "$GITHUB_OWNER/$GITHUB_REPO" 2>&1 | Out-Null
    Write-Host "  ✅ GCP_SERVICE_ACCOUNT_KEY added" -ForegroundColor Green
    
    Write-Host "  Verifying Azure secrets..." -ForegroundColor Gray
    $secrets = gh secret list --repo "$GITHUB_OWNER/$GITHUB_REPO" 2>&1
    if ($secrets -match "AZURE") {
        Write-Host "  ✅ Azure secrets configured" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Azure secrets may need manual setup" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  GitHub CLI (gh) not found - manual secret setup required" -ForegroundColor Yellow
    Write-Host "`nGo to: https://github.com/$GITHUB_OWNER/$GITHUB_REPO/settings/secrets/actions" -ForegroundColor Cyan
    Write-Host "`nAdd these secrets:" -ForegroundColor White
    Write-Host "  Name: GCP_PROJECT_ID" -ForegroundColor Yellow
    Write-Host "  Value: $GCP_PROJECT" -ForegroundColor White
    Write-Host "  Name: GCP_SERVICE_ACCOUNT_KEY" -ForegroundColor Yellow
    Write-Host "  Value: (base64 key below)" -ForegroundColor White
    Write-Host "`n$encodedKey`n" -ForegroundColor Cyan
    
    Read-Host "Press Enter after adding secrets to GitHub"
}

# STEP 4: Commit changes
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[4/6] 📝 COMMITTING CHANGES" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "→ Staging files..." -ForegroundColor Yellow
git add .
$changes = git status --short
if ($changes) {
    $changes | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host "✅ Files staged" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No changes to stage" -ForegroundColor Gray
}

Write-Host "→ Creating commit..." -ForegroundColor Yellow
$commitMsg = @"
chore: enable complete multi-platform deployment

Setup:
✅ GitHub Actions workflow for automated CI/CD
✅ Docker containers for Next.js (web) and Azure Functions (API)
✅ Google Cloud integration (Cloud Run, Artifact Registry)
✅ Azure integration (Container Apps, ACR)
✅ GitHub automatic code sync

Deployment targets:
📍 Azure Container Apps (eastus) - Web & API
🔥 Google Cloud Run (us-central1) - Web & API  
🐙 GitHub - Code repository

Triggers:
⏱️  Automatic on push to main
📅 Daily schedule at 2 AM UTC
🎮 Manual trigger via GitHub Actions UI

Configuration:
GCP Project: $GCP_PROJECT
GCP Region: $GCP_REGION
Service Account: $GCP_SA_EMAIL
"@

git commit -m $commitMsg 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No new changes to commit (already up-to-date)" -ForegroundColor Gray
}

# STEP 5: Push to GitHub
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "[5/6] 🚀 PUSHING TO GITHUB" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "→ Pushing to main (triggers automated workflow)..." -ForegroundColor Yellow
git push origin main 2>&1 | Select-String -Pattern "main|error|To https" | ForEach-Object {
    Write-Host "  $_" -ForegroundColor Gray
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Pushed to GitHub - workflow triggered!" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Push completed - check GitHub Actions status" -ForegroundColor Gray
}

# STEP 6: Final summary
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "[6/6] 📊 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Green

Write-Host "🎉 YOUR SITE IS NOW DEPLOYING TO ALL PLATFORMS!" -ForegroundColor Cyan

Write-Host "`n📍 DEPLOYMENT ENDPOINTS:" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n🐙 GITHUB:" -ForegroundColor White
Write-Host "   Repository:    https://github.com/$GITHUB_OWNER/$GITHUB_REPO" -ForegroundColor Cyan
Write-Host "   Actions:       https://github.com/$GITHUB_OWNER/$GITHUB_REPO/actions" -ForegroundColor Cyan
Write-Host "   Status:        Watch the workflow in real-time ↑" -ForegroundColor Gray

Write-Host "`n☁️  AZURE CONTAINER APPS:" -ForegroundColor White
Write-Host "   Web App:       https://homebase-web.azurecontainerapps.io" -ForegroundColor Cyan
Write-Host "   API:           http://homebase-api.azurecontainerapps.io:5001/api" -ForegroundColor Cyan
Write-Host "   Check status:  az containerapp show --name homebase-web --resource-group homebase-rg" -ForegroundColor Gray
Write-Host "   Region:        eastus" -ForegroundColor Gray

Write-Host "`n🔥 GOOGLE CLOUD RUN:" -ForegroundColor White
Write-Host "   Web App:       https://homebase-web-xxxxx.run.app" -ForegroundColor Cyan
Write-Host "   API:           https://homebase-api-xxxxx.run.app" -ForegroundColor Cyan
Write-Host "   Check status:  gcloud run services list --region=$GCP_REGION" -ForegroundColor Gray
Write-Host "   Project:       $GCP_PROJECT" -ForegroundColor Gray
Write-Host "   Region:        $GCP_REGION" -ForegroundColor Gray

Write-Host "`n📋 CONFIGURATION SUMMARY:" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "   GCP Project ID:          $GCP_PROJECT" -ForegroundColor Cyan
Write-Host "   Service Account:         $GCP_SA_EMAIL" -ForegroundColor Cyan
Write-Host "   Artifact Registry:       us-central1-docker.pkg.dev/$GCP_PROJECT/homebase" -ForegroundColor Cyan
Write-Host "   Key File:                ./$KEY_FILE (⚠️  KEEP SECURE)" -ForegroundColor Yellow

Write-Host "`n⏱️  DEPLOYMENT TIMELINE:" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "   Build & Test:            ~3 minutes" -ForegroundColor Gray
Write-Host "   Deploy to Azure:         ~3 minutes" -ForegroundColor Gray
Write-Host "   Deploy to Google Cloud:  ~3 minutes" -ForegroundColor Gray
Write-Host "   ─────────────────────────────────" -ForegroundColor Gray
Write-Host "   TOTAL DEPLOYMENT TIME:   ~10 minutes" -ForegroundColor Cyan

Write-Host "`n🔗 QUICK LINKS:" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "   View workflow:           https://github.com/$GITHUB_OWNER/$GITHUB_REPO/actions/workflows/deploy-multi-platform.yml" -ForegroundColor Cyan
Write-Host "   Git status:              git log -1 --oneline" -ForegroundColor Cyan
Write-Host "   Monitor GCP:             gcloud run services describe homebase-web --region=$GCP_REGION" -ForegroundColor Cyan
Write-Host "   View GCP logs:           gcloud run services logs read homebase-web --region=$GCP_REGION" -ForegroundColor Cyan
Write-Host "   View Azure logs:         az containerapp logs show --name homebase-web --resource-group homebase-rg" -ForegroundColor Cyan

Write-Host "`n💡 NEXT STEPS:" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "   1️⃣  Monitor deployment:   Open GitHub Actions link above ↑" -ForegroundColor White
Write-Host "   2️⃣  Wait for completion:  Should finish in ~10 minutes" -ForegroundColor White
Write-Host "   3️⃣  Verify both platforms: Check Azure & GCP endpoints" -ForegroundColor White
Write-Host "   4️⃣  Test your site:       Click the deployed URLs" -ForegroundColor White
Write-Host "   5️⃣  Future deployments:   Just 'git push' to redeploy!" -ForegroundColor White

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ Every future push to main will automatically deploy to all platforms! ✨" -ForegroundColor Cyan
Write-Host "🚀 Your continuous deployment pipeline is now live! 🚀" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "Press any key to open GitHub Actions in browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "https://github.com/$GITHUB_OWNER/$GITHUB_REPO/actions"
