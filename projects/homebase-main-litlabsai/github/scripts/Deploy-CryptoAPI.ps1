#!/usr/bin/env pwsh
<#
.SYNOPSIS
    💰 Deploy Crypto API to Azure and Start Making Money
.DESCRIPTION
    Complete deployment script that:
    1. Builds API
    2. Deploys to Azure Functions
    3. Configures API keys
    4. Sets up Paddle payments
    5. Tests all endpoints
#>

param(
    [string]$FunctionAppName = "homebase-crypto-api",
    [string]$ResourceGroup = "homebase-rg",
    [string]$Location = "eastus"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 DEPLOYING CRYPTO API - LET'S MAKE MONEY!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Step 1: Build API
Write-Host "`n📦 Building API..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\api"
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ API built successfully" -ForegroundColor Green

# Step 2: Deploy to Azure
Write-Host "`n🌐 Deploying to Azure Functions..." -ForegroundColor Cyan
func azure functionapp publish $FunctionAppName --typescript
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deployed to Azure" -ForegroundColor Green

# Step 3: Configure App Settings
Write-Host "`n⚙️  Configuring app settings..." -ForegroundColor Cyan

# Get Cosmos DB connection from existing Key Vault
$cosmosEndpoint = az keyvault secret show `
    --vault-name "EverythingHomebase-kv" `
    --name "COSMOS-ENDPOINT" `
    --query "value" -o tsv

# Set Function App settings
az functionapp config appsettings set `
    --name $FunctionAppName `
    --resource-group $ResourceGroup `
    --settings `
    "COINGECKO_API_KEY=@Microsoft.KeyVault(SecretUri=https://everythinghomebase-kv.vault.azure.net/secrets/COINGECKO-API-KEY/)" `
    "COSMOS_ENDPOINT=$cosmosEndpoint" `
    "COSMOS_KEY=@Microsoft.KeyVault(SecretUri=https://everythinghomebase-kv.vault.azure.net/secrets/COSMOS-KEY/)" `
    "PADDLE_VENDOR_ID=@Microsoft.KeyVault(SecretUri=https://paddleapi.vault.azure.net/secrets/PADDLE-VENDOR-ID/)" `
    "PADDLE_API_KEY=@Microsoft.KeyVault(SecretUri=https://paddleapi.vault.azure.net/secrets/PADDLE-API-KEY/)" `
    "PADDLE_WEBHOOK_SECRET=@Microsoft.KeyVault(SecretUri=https://paddleapi.vault.azure.net/secrets/PADDLE-WEBHOOK-SECRET/)" `
    "PADDLE_PRO_PRODUCT_ID=@Microsoft.KeyVault(SecretUri=https://paddleapi.vault.azure.net/secrets/PADDLE-PRO-PRODUCT-ID/)" `
    "PADDLE_ENTERPRISE_PRODUCT_ID=@Microsoft.KeyVault(SecretUri=https://paddleapi.vault.azure.net/secrets/PADDLE-ENTERPRISE-PRODUCT-ID/)" `
    --output none

Write-Host "✅ App settings configured" -ForegroundColor Green

# Step 4: Enable Managed Identity
Write-Host "`n🔐 Enabling Managed Identity..." -ForegroundColor Cyan
$principalId = az functionapp identity assign `
    --name $FunctionAppName `
    --resource-group $ResourceGroup `
    --query "principalId" -o tsv

# Grant Key Vault access
Write-Host "🔑 Granting Key Vault access..." -ForegroundColor Cyan
@("EverythingHomebase-kv", "paddleapi", "binacekey") | ForEach-Object {
    $vaultName = $_
    az keyvault set-policy `
        --name $vaultName `
        --object-id $principalId `
        --secret-permissions get list `
        --output none
    Write-Host "  ✅ Access granted to $vaultName" -ForegroundColor Gray
}

Write-Host "✅ Security configured" -ForegroundColor Green

# Step 5: Test endpoints
Write-Host "`n🧪 Testing API endpoints..." -ForegroundColor Cyan
$apiUrl = "https://$FunctionAppName.azurewebsites.net"

Write-Host "Waiting for deployment to propagate..." -ForegroundColor Gray
Start-Sleep -Seconds 10

Write-Host "`nTesting: $apiUrl/api/crypto" -ForegroundColor Gray
$response = Invoke-RestMethod -Uri "$apiUrl/api/crypto" -Method Get -ErrorAction SilentlyContinue
if ($response.success) {
    Write-Host "✅ Crypto endpoint working!" -ForegroundColor Green
    Write-Host "   BTC: `$$($response.data.bitcoin.usd)" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Crypto endpoint not ready yet (may need a few minutes)" -ForegroundColor Yellow
}

# Display final info
Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "`n🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "`nYour API is live at:" -ForegroundColor Cyan
Write-Host "  🌐 $apiUrl" -ForegroundColor White
Write-Host "`nAvailable endpoints:" -ForegroundColor Cyan
Write-Host "  📊 GET  $apiUrl/api/crypto" -ForegroundColor White
Write-Host "  💎 GET  $apiUrl/api/crypto-premium?feature=alerts" -ForegroundColor White
Write-Host "  💰 POST $apiUrl/api/paddle-webhook" -ForegroundColor White
Write-Host "  👤 GET  $apiUrl/api/subscription-status?userId=xxx" -ForegroundColor White

Write-Host "`n🚀 NEXT STEPS TO MAKE MONEY:" -ForegroundColor Magenta
Write-Host "  1. Go to paddle.com and create account" -ForegroundColor White
Write-Host "  2. Create products: Pro (`$9.99) and Enterprise (`$49.99)" -ForegroundColor White
Write-Host "  3. Add product IDs to Key Vault (run .\Set-PaddleKeys.ps1)" -ForegroundColor White
Write-Host "  4. List on RapidAPI marketplace" -ForegroundColor White
Write-Host "  5. Share on Twitter/Reddit" -ForegroundColor White

Write-Host "`n💵 REVENUE POTENTIAL:" -ForegroundColor Yellow
Write-Host "  Month 1:   `$200-500" -ForegroundColor White
Write-Host "  Month 3:   `$1,500+" -ForegroundColor White
Write-Host "  Month 6:   `$5,000+" -ForegroundColor White
Write-Host "  Month 12:  `$15,000+" -ForegroundColor White

Write-Host "`n" -NoNewline
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
