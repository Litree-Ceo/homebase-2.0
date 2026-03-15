#Requires -Version 5.0
<#
.SYNOPSIS
    Setup Google Cloud for HomeBase deployment
.DESCRIPTION
    Configures GCP project, service accounts, and GitHub secrets
.NOTES
    Author: LITLABS 2026
    Prerequisites: gcloud CLI installed and authenticated
#>

param(
    [switch]$Interactive = $true,
    [string]$ProjectId = "",
    [string]$GitHubRepo = "",
    [string]$GitHubOwner = ""
)

$ErrorActionPreference = "Stop"

Write-Host "`n[GOOGLE CLOUD SETUP FOR HOMEBASE 2.0]`n" -ForegroundColor Cyan

# Step 1: Get Project ID
if (-not $ProjectId) {
    Write-Host "[1/5] Getting GCP Project ID..." -ForegroundColor Yellow
    $currentProject = cmd /c "E:\VSCode\google-cloud-sdk\bin\gcloud config get-value project 2>nul"
    
    if ($Interactive) {
        Write-Host "Current GCP project: $currentProject" -ForegroundColor Cyan
        $input = Read-Host "Enter GCP Project ID (press Enter for current)"
        $ProjectId = if ($input) { $input } else { $currentProject }
    } else {
        $ProjectId = $currentProject
    }
}

if (-not $ProjectId) {
    Write-Host "[ERROR] No GCP project ID found!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Using project: $ProjectId" -ForegroundColor Green

# Step 2: Enable Required APIs
Write-Host "`n[2/5] Enabling required GCP APIs..." -ForegroundColor Yellow
try {
    cmd /c "E:\VSCode\google-cloud-sdk\bin\gcloud services enable run.googleapis.com --project=$ProjectId --quiet"
    cmd /c "E:\VSCode\google-cloud-sdk\bin\gcloud services enable artifactregistry.googleapis.com --project=$ProjectId --quiet"
    cmd /c "E:\VSCode\google-cloud-sdk\bin\gcloud services enable containerregistry.googleapis.com --project=$ProjectId --quiet"
    Write-Host "[OK] APIs enabled successfully" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Some APIs may already be enabled: $_" -ForegroundColor Yellow
}

# Step 3: Create Service Account
Write-Host "`n[3/5] Creating service account..." -ForegroundColor Yellow
$sa = "github-actions-sa"
$saEmail = "$sa@$ProjectId.iam.gserviceaccount.com"

try {
    cmd /c "E:\VSCode\google-cloud-sdk\bin\gcloud iam service-accounts create $sa --display-name='GitHub Actions Deployment' --project=$ProjectId --quiet 2>nul"
    Write-Host "[OK] Service account created: $saEmail" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Service account may already exist: $_" -ForegroundColor Yellow
}

# Step 4: Grant IAM Roles
Write-Host "`n[4/5] Granting IAM roles..." -ForegroundColor Yellow
$roles = @(
    "roles/run.admin",
    "roles/artifactregistry.admin",
    "roles/iam.serviceAccountUser"
)

foreach ($role in $roles) {
    try {
        cmd /c "E:\VSCode\google-cloud-sdk\bin\gcloud projects add-iam-policy-binding $ProjectId --member=serviceAccount:$saEmail --role=$role --quiet 2>nul"
        Write-Host "[OK] Granted: $role" -ForegroundColor Green
    } catch {
        Write-Host "[WARN] Role already granted or error: $_" -ForegroundColor Yellow
    }
}

# Step 5: Create and Download Key
Write-Host "`n[5/5] Creating service account key..." -ForegroundColor Yellow
$keyFile = "gcp-github-key.json"
$keyPath = (Get-Location).Path + "\$keyFile"

try {
    cmd /c "E:\VSCode\google-cloud-sdk\bin\gcloud iam service-accounts keys create $keyFile --iam-account=$saEmail --project=$ProjectId --quiet 2>nul"
    Write-Host "[OK] Key saved to: $keyPath" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Key file may already exist or error: $_" -ForegroundColor Yellow
    if (-not (Test-Path $keyFile)) {
        Write-Host "[ERROR] Cannot proceed without key file" -ForegroundColor Red
        exit 1
    }
}

# Encode and Display Key for GitHub
Write-Host "`n[NEXT STEPS: ADD TO GITHUB SECRETS]`n" -ForegroundColor Green

if (Test-Path $keyFile) {
    $keyContent = Get-Content $keyFile -Raw
    $encodedKey = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($keyContent))
    
    Write-Host "1. Go to GitHub: https://github.com/LiTree89/HomeBase-2.0" -ForegroundColor Cyan
    Write-Host "2. Settings -> Secrets and variables -> Actions" -ForegroundColor Cyan
    Write-Host "3. Click 'New repository secret'" -ForegroundColor Cyan
    Write-Host "4. Name: GCP_SERVICE_ACCOUNT_KEY" -ForegroundColor Cyan
    Write-Host "5. Value: (copy below, it's base64 encoded)" -ForegroundColor Cyan
    Write-Host "`n========== COPY EVERYTHING BELOW TO GITHUB SECRET ==========" -ForegroundColor DarkGray
    Write-Host $encodedKey -ForegroundColor Yellow
    Write-Host "============================================================`n" -ForegroundColor DarkGray
    
    Write-Host "6. Add another secret:" -ForegroundColor Cyan
    Write-Host "   Name: GCP_PROJECT_ID" -ForegroundColor Cyan
    Write-Host "   Value: $ProjectId" -ForegroundColor Yellow
    
    Write-Host "`nFile location: $keyPath" -ForegroundColor Gray
    Write-Host "IMPORTANT: Keep this file secure and never commit to git!" -ForegroundColor Red
}

# Create Artifact Repository
Write-Host "`nCreating Artifact Registry repository..." -ForegroundColor Yellow
try {
    cmd /c "E:\VSCode\google-cloud-sdk\bin\gcloud artifacts repositories create homebase --repository-format=docker --location=us-central1 --project=$ProjectId --quiet 2>nul"
    Write-Host "[OK] Artifact repository created" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Repository may already exist: $_" -ForegroundColor Yellow
}

# Summary
Write-Host "`n[GOOGLE CLOUD SETUP COMPLETE]`n" -ForegroundColor Green

Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Project ID: $ProjectId" -ForegroundColor White
Write-Host "   Service Account: $saEmail" -ForegroundColor White
Write-Host "   Artifact Registry: us-central1-docker.pkg.dev/$ProjectId/homebase" -ForegroundColor White
Write-Host "   Cloud Run Region: us-central1" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "   1. Add secrets to GitHub (see instructions above)" -ForegroundColor White
Write-Host "   2. Push to main branch to trigger deployment" -ForegroundColor White
Write-Host "   3. Monitor workflow at: GitHub -> Actions" -ForegroundColor White

Write-Host "`nHelpful commands:" -ForegroundColor Yellow
Write-Host "   View logs: gcloud run services logs read homebase-web --region=us-central1" -ForegroundColor Gray
Write-Host "   List services: gcloud run services list --region=us-central1" -ForegroundColor Gray
