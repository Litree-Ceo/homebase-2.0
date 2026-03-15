#!/usr/bin/env pwsh
# Hello GKE Deployment Script
# This script deploys the Hello GKE app using Cloud Build (avoids local network issues)

param(
    [string]$ProjectId = "studio-6082148059-d1fec",
    [string]$Region = "us-central1",
    [string]$ClusterName = "LiTrees-Cluster",
    [string]$ClusterZone = "us-central1-c",
    [string]$ImageTag = "v1"
)

$ErrorActionPreference = "Stop"
$ArtifactRegistry = "$Region-docker.pkg.dev"
$ImagePath = "$ArtifactRegistry/$ProjectId/hello-repo/hello-gke:$ImageTag"

function Write-Step {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Step 1: Set Project
Write-Step "Setting Google Cloud Project"
gcloud config set project $ProjectId
Write-Success "Project set to $ProjectId"

# Step 2: Enable Required APIs
Write-Step "Enabling Required APIs"
gcloud services enable artifactregistry.googleapis.com container.googleapis.com cloudbuild.googleapis.com
Write-Success "APIs enabled"

# Step 3: Create Artifact Registry Repository (if not exists)
Write-Step "Creating Artifact Registry Repository"
try {
    gcloud artifacts repositories create hello-repo `
        --repository-format=docker `
        --location=$Region `
        --description="Hello GKE Docker repository" 2>&1 | Out-Null
    Write-Success "Created hello-repo repository"
} catch {
    Write-Success "Repository hello-repo already exists"
}

# Step 4: Configure Docker Authentication
Write-Step "Configuring Docker Authentication"
gcloud auth configure-docker $ArtifactRegistry --quiet
Write-Success "Docker authentication configured"

# Step 5: Build and Push using Cloud Build
Write-Step "Building and Pushing Image using Cloud Build"
gcloud builds submit --tag $ImagePath
Write-Success "Image built and pushed to $ImagePath"

# Step 6: Get Cluster Credentials
Write-Step "Getting GKE Cluster Credentials"
gcloud container clusters get-credentials $ClusterName --zone $ClusterZone
Write-Success "Connected to cluster $ClusterName"

# Step 7: Update deployment.yaml with actual project ID
Write-Step "Preparing Kubernetes Manifests"
$deploymentContent = Get-Content deployment.yaml -Raw
$deploymentContent = $deploymentContent -replace "PROJECT_ID", $ProjectId
$deploymentContent | Set-Content deployment-temp.yaml
Write-Success "Manifests prepared"

# Step 8: Deploy to GKE
Write-Step "Deploying to GKE"
kubectl apply -f deployment-temp.yaml
Write-Success "Deployment applied"

# Step 9: Wait for deployment to be ready
Write-Step "Waiting for Deployment to be Ready"
kubectl rollout status deployment/hello-gke-deployment --timeout=120s
Write-Success "Deployment is ready"

# Step 10: Get External IP
Write-Step "Getting Service Information"
Write-Host "Waiting for LoadBalancer IP (this may take 1-2 minutes)..." -ForegroundColor Yellow

$externalIp = ""
$attempts = 0
$maxAttempts = 30

while ($externalIp -eq "" -or $externalIp -eq "<pending>") {
    Start-Sleep -Seconds 5
    $attempts++
    
    $svc = kubectl get service hello-gke-service -o json | ConvertFrom-Json
    $externalIp = $svc.status.loadBalancer.ingress[0].ip
    
    if ($externalIp) {
        break
    }
    
    if ($attempts -ge $maxAttempts) {
        Write-Error "Timeout waiting for external IP. Check with: kubectl get service hello-gke-service"
        exit 1
    }
    
    Write-Host "  Attempt $attempts/$maxAttempts - IP not ready yet..." -ForegroundColor Gray
}

# Cleanup temp file
Remove-Item deployment-temp.yaml -ErrorAction SilentlyContinue

# Success!
Write-Host "`n" + ("=" * 60) -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Green
Write-Host "Your app is live at: http://$externalIp" -ForegroundColor Cyan
Write-Host "`nUseful commands:"
Write-Host "  kubectl get pods          - Check pod status"
Write-Host "  kubectl logs -l app=hello-gke  - View logs"
Write-Host "  kubectl delete -f deployment.yaml  - Clean up"
Write-Host ("=" * 60) -ForegroundColor Green

# Open browser (optional)
$openBrowser = Read-Host "`nOpen in browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process "http://$externalIp"
}
