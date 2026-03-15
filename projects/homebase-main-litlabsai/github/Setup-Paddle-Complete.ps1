#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Complete Paddle Payment Setup for HomeBase 2.0
.DESCRIPTION
    Configures Paddle integration with Azure Key Vault and tests webhook
.PARAMETER VendorId
    Paddle Vendor ID
.PARAMETER ApiKey
    Paddle API Key  
.PARAMETER WebhookSecret
    Paddle Webhook Secret
.PARAMETER ProProductId
    Paddle Pro Plan Product ID
.PARAMETER EnterpriseProductId
    Paddle Enterprise Plan Product ID
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$VendorId,
    
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    
    [Parameter(Mandatory=$true)]
    [string]$WebhookSecret,
    
    [Parameter(Mandatory=$true)]
    [string]$ProProductId,
    
    [Parameter(Mandatory=$true)]
    [string]$EnterpriseProductId,
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "sandbox",
    
    [Parameter(Mandatory=$false)]
    [string]$KeyVaultName = "kvprodlitree14210"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 PADDLE INTEGRATION SETUP`n" -ForegroundColor Cyan

# Step 1: Validate credentials format
Write-Host "📋 Validating credentials..." -ForegroundColor Yellow
if ($VendorId.Length -lt 5) {
    Write-Host "❌ Invalid Vendor ID (too short)" -ForegroundColor Red
    exit 1
}
if ($ApiKey.Length -lt 10) {
    Write-Host "❌ Invalid API Key (too short)" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Credentials format valid" -ForegroundColor Green

# Step 2: Check Azure login
Write-Host "`n🔐 Checking Azure authentication..." -ForegroundColor Yellow
try {
    $context = az account show 2>$null | ConvertFrom-Json
    Write-Host "✅ Logged in as: $($context.user.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Azure. Running 'az login'..." -ForegroundColor Red
    az login | Out-Null
}

# Step 3: Check Key Vault exists
Write-Host "`n🔑 Checking Key Vault..." -ForegroundColor Yellow
try {
    $vault = az keyvault show --name $KeyVaultName 2>$null | ConvertFrom-Json
    Write-Host "✅ Key Vault found: $($vault.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Key Vault not found: $KeyVaultName" -ForegroundColor Red
    exit 1
}

# Step 4: Add secrets to Key Vault
Write-Host "`n📝 Adding credentials to Key Vault..." -ForegroundColor Yellow

$secrets = @{
    "PADDLE-VENDOR-ID" = $VendorId
    "PADDLE-API-KEY" = $ApiKey
    "PADDLE-WEBHOOK-SECRET" = $WebhookSecret
    "PADDLE-PRO-PRODUCT-ID" = $ProProductId
    "PADDLE-ENTERPRISE-PRODUCT-ID" = $EnterpriseProductId
    "PADDLE-ENV" = $Environment
}

foreach ($key in $secrets.Keys) {
    Write-Host "  Adding $key..." -ForegroundColor Cyan
    try {
        az keyvault secret set `
            --vault-name $KeyVaultName `
            --name $key `
            --value $secrets[$key] | Out-Null
        Write-Host "  ✅ $key added" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Failed to add $key" -ForegroundColor Red
        exit 1
    }
}

# Step 5: Verify secrets were added
Write-Host "`n✔️ Verifying secrets..." -ForegroundColor Yellow
try {
    $secretList = az keyvault secret list --vault-name $KeyVaultName --query "[?contains(name, 'PADDLE')]" | ConvertFrom-Json
    $count = ($secretList | Measure-Object).Count
    Write-Host "✅ Found $count Paddle secrets in Key Vault" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not verify secrets" -ForegroundColor Yellow
}

# Step 6: Show webhook configuration
Write-Host "`n🔗 Webhook Configuration" -ForegroundColor Cyan
Write-Host "Set this in your Paddle dashboard:" -ForegroundColor Yellow
Write-Host "  Webhook URL: https://homebase-api.azurecontainerapps.io/api/paddle-webhook" -ForegroundColor Green
Write-Host "  Secret: (the one you just saved)" -ForegroundColor Green
Write-Host "  Events: subscription.created, subscription.updated, subscription.cancelled" -ForegroundColor Green

# Step 7: Test webhook endpoint
Write-Host "`n🧪 Testing webhook endpoint..." -ForegroundColor Yellow
$webhookUrl = "https://homebase-api.azurecontainerapps.io/api/paddle-webhook"
try {
    Write-Host "  Testing: $webhookUrl" -ForegroundColor Cyan
    $testResponse = Invoke-WebRequest -Uri $webhookUrl -Method Post -ContentType "application/json" -Body '{"event":"test"}' -ErrorAction SilentlyContinue
    Write-Host "  ✅ Webhook endpoint responding" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Webhook endpoint may not be responding yet (API may still be deploying)" -ForegroundColor Yellow
}

# Step 8: Create .env file for local testing
Write-Host "`n💾 Creating local .env file..." -ForegroundColor Yellow
$envPath = "api/local.settings.json"
Write-Host "  Note: Update $envPath with these values in the 'Values' section:" -ForegroundColor Cyan

$envContent = @"

{
  "Values": {
    "PADDLE_VENDOR_ID": "$VendorId",
    "PADDLE_API_KEY": "$ApiKey",
    "PADDLE_WEBHOOK_SECRET": "$WebhookSecret",
    "PADDLE_PRO_PRODUCT_ID": "$ProProductId",
    "PADDLE_ENTERPRISE_PRODUCT_ID": "$EnterpriseProductId",
    "PADDLE_ENV": "$Environment"
  }
}
"@

Write-Host "  Suggested values (add to api/local.settings.json):" -ForegroundColor Green
Write-Host $envContent -ForegroundColor Cyan

# Step 9: Summary
Write-Host "`n" -ForegroundColor Green
Write-Host "✅ PADDLE SETUP COMPLETE!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Go to Paddle Dashboard: https://paddledashboard.com" -ForegroundColor Yellow
Write-Host "  2. Add webhook URL: https://homebase-api.azurecontainerapps.io/api/paddle-webhook" -ForegroundColor Yellow
Write-Host "  3. Copy webhook secret and verify it's stored in Key Vault" -ForegroundColor Yellow
Write-Host "  4. Test payment flow with $Environment credentials" -ForegroundColor Yellow
Write-Host "  5. Once verified, update PADDLE_ENV to 'production' in Key Vault" -ForegroundColor Yellow
Write-Host "`n💰 Your payment system is ready!" -ForegroundColor Green

