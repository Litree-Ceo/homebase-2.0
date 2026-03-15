#Requires -Version 5.0
<#
Deploy HomeBase 2.0 to Azure Container Apps
#>

param()

$ErrorActionPreference = "Stop"

Write-Host "=== AZURE DEPLOYMENT ===" -ForegroundColor Cyan
Write-Host ""

$rg = "homebase-rg"
$env = "homebase-env"
$reg = "homebasecontainers"

# Create environment
Write-Host "[1] Creating Container Apps environment..." -ForegroundColor Yellow
az containerapp env create --name $env --resource-group $rg --location eastus --no-wait 2>&1 | Select-String "created|exists|error"

Start-Sleep -Seconds 30

# Get registry credentials
Write-Host "[2] Getting registry credentials..." -ForegroundColor Yellow
$user = az acr credential show --name $reg --query username -o tsv
$pass = az acr credential show --name $reg --query "passwords[0].value" -o tsv

# Build and push images
Write-Host "[3] Building and pushing web image..." -ForegroundColor Yellow
az acr build --registry $reg --image homebase-web:latest --file apps/web/Dockerfile .

Write-Host "[4] Building and pushing API image..." -ForegroundColor Yellow
az acr build --registry $reg --image homebase-api:latest --file api/Dockerfile .

# Deploy
Write-Host "[5] Deploying web container..." -ForegroundColor Yellow
az containerapp create --name homebase-web --resource-group $rg --environment $env `
    --image "$reg.azurecr.io/homebase-web:latest" --target-port 3000 --ingress external `
    --cpu 0.5 --memory 1Gi --registry-server "$reg.azurecr.io" `
    --registry-username $user --registry-password $pass 2>&1 | Select-String "created|updated|ERROR"

Write-Host "[6] Getting web URL..." -ForegroundColor Yellow
$url = az containerapp show --name homebase-web --resource-group $rg --query "properties.configuration.ingress.fqdn" -o tsv 2>/dev/null
if ($url) { Write-Host "✓ https://$url" -ForegroundColor Green }

Write-Host ""
Write-Host "Deployment started! Monitor at: https://portal.azure.com/" -ForegroundColor Green
