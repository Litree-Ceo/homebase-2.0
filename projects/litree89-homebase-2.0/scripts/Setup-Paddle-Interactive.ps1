#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🔐 Interactive Paddle Credentials Setup
.DESCRIPTION
    Securely collect and store Paddle payment credentials in Azure Key Vault
    This unlocks your PRO ($9.99/mo) and ENTERPRISE ($49.99/mo) revenue tiers!
#>

$ErrorActionPreference = "Stop"

Write-Host "`n💰💰💰 PADDLE PAYMENT SETUP - ACTIVATE REVENUE STREAMS 💰💰💰`n" -ForegroundColor Green
Write-Host "This will enable:" -ForegroundColor Cyan
Write-Host "  💎 PRO Plan: `$9.99/month (10K API calls/day)" -ForegroundColor Yellow
Write-Host "  🚀 ENTERPRISE Plan: `$49.99/month (1M API calls/day)" -ForegroundColor Yellow
Write-Host "`n" -NoNewline

# Step 1: Get Paddle Vendor ID
Write-Host "📋 Step 1/5: Paddle Vendor ID" -ForegroundColor Magenta
Write-Host "Location: Paddle Dashboard → Developer Tools → Authentication" -ForegroundColor Gray
$PaddleVendorId = Read-Host "Enter your Paddle Vendor ID"

if ([string]::IsNullOrWhiteSpace($PaddleVendorId)) {
    Write-Host "❌ Vendor ID is required!" -ForegroundColor Red
    exit 1
}

# Step 2: Get Paddle API Key
Write-Host "`n📋 Step 2/5: Paddle API Key" -ForegroundColor Magenta
Write-Host "Location: Paddle Dashboard → Developer Tools → Authentication → API Keys" -ForegroundColor Gray
$PaddleApiKey = Read-Host "Enter your Paddle API Key" -AsSecureString
$PaddleApiKeyPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($PaddleApiKey)
)

# Step 3: Get Webhook Secret
Write-Host "`n📋 Step 3/5: Webhook Secret" -ForegroundColor Magenta
Write-Host "Location: Paddle Dashboard → Developer Tools → Webhooks → Create/View Secret" -ForegroundColor Gray
$PaddleWebhookSecret = Read-Host "Enter your Webhook Secret" -AsSecureString
$PaddleWebhookSecretPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($PaddleWebhookSecret)
)

# Step 4: Get PRO Product ID
Write-Host "`n📋 Step 4/5: PRO Plan Product ID" -ForegroundColor Magenta
Write-Host "Location: Paddle Dashboard → Products → Your PRO plan → Product ID" -ForegroundColor Gray
Write-Host "Reminder: PRO should be `$9.99/month" -ForegroundColor Yellow
$PaddleProProductId = Read-Host "Enter PRO Product ID"

# Step 5: Get ENTERPRISE Product ID
Write-Host "`n📋 Step 5/5: ENTERPRISE Plan Product ID" -ForegroundColor Magenta
Write-Host "Location: Paddle Dashboard → Products → Your ENTERPRISE plan → Product ID" -ForegroundColor Gray
Write-Host "Reminder: ENTERPRISE should be `$49.99/month" -ForegroundColor Yellow
$PaddleEnterpriseProductId = Read-Host "Enter ENTERPRISE Product ID"

# Validate inputs
Write-Host "`n🔍 Validating inputs..." -ForegroundColor Cyan
if ([string]::IsNullOrWhiteSpace($PaddleProProductId) -or 
    [string]::IsNullOrWhiteSpace($PaddleEnterpriseProductId)) {
    Write-Host "❌ All product IDs are required!" -ForegroundColor Red
    exit 1
}

# Store in Azure Key Vault
Write-Host "`n🔐 Storing credentials securely in Azure Key Vault..." -ForegroundColor Cyan
$vaultName = "paddleapi"

try {
    Write-Host "  → PADDLE-VENDOR-ID..." -ForegroundColor Gray
    az keyvault secret set --vault-name $vaultName --name "PADDLE-VENDOR-ID" --value $PaddleVendorId --output none
    Write-Host "    ✅ Stored" -ForegroundColor Green

    Write-Host "  → PADDLE-API-KEY..." -ForegroundColor Gray
    az keyvault secret set --vault-name $vaultName --name "PADDLE-API-KEY" --value $PaddleApiKeyPlain --output none
    Write-Host "    ✅ Stored" -ForegroundColor Green

    Write-Host "  → PADDLE-WEBHOOK-SECRET..." -ForegroundColor Gray
    az keyvault secret set --vault-name $vaultName --name "PADDLE-WEBHOOK-SECRET" --value $PaddleWebhookSecretPlain --output none
    Write-Host "    ✅ Stored" -ForegroundColor Green

    Write-Host "  → PADDLE-PRO-PRODUCT-ID..." -ForegroundColor Gray
    az keyvault secret set --vault-name $vaultName --name "PADDLE-PRO-PRODUCT-ID" --value $PaddleProProductId --output none
    Write-Host "    ✅ Stored" -ForegroundColor Green

    Write-Host "  → PADDLE-ENTERPRISE-PRODUCT-ID..." -ForegroundColor Gray
    az keyvault secret set --vault-name $vaultName --name "PADDLE-ENTERPRISE-PRODUCT-ID" --value $PaddleEnterpriseProductId --output none
    Write-Host "    ✅ Stored" -ForegroundColor Green
}
catch {
    Write-Host "`n❌ Failed to store credentials: $_" -ForegroundColor Red
    exit 1
}

# Clear sensitive variables
$PaddleApiKeyPlain = $null
$PaddleWebhookSecretPlain = $null

Write-Host "`n✅ All credentials stored securely!" -ForegroundColor Green

# Summary
Write-Host "`n" -NoNewline
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "`n🎉 PADDLE CONFIGURATION COMPLETE!" -ForegroundColor Green
Write-Host "`nYour revenue tiers are now ready:" -ForegroundColor Cyan
Write-Host "  🆓 FREE:       100 calls/day (lead generation)" -ForegroundColor White
Write-Host "  💎 PRO:        `$9.99/mo → 10,000 calls/day" -ForegroundColor Yellow
Write-Host "  🚀 ENTERPRISE: `$49.99/mo → 1,000,000 calls/day" -ForegroundColor Yellow

Write-Host "`n📌 NEXT STEPS:" -ForegroundColor Magenta
Write-Host "`n1. Deploy API with new credentials:" -ForegroundColor White
Write-Host "   .\scripts\Deploy-CryptoAPI.ps1" -ForegroundColor Cyan

Write-Host "`n2. Configure Paddle webhook:" -ForegroundColor White
Write-Host "   URL: https://homebase-crypto-api.azurewebsites.net/api/paddle-webhook" -ForegroundColor Cyan
Write-Host "   Events: subscription.created, subscription.payment_succeeded," -ForegroundColor Gray
Write-Host "           subscription.cancelled, subscription.payment_failed" -ForegroundColor Gray

Write-Host "`n3. Test your API:" -ForegroundColor White
Write-Host "   curl https://homebase-crypto-api.azurewebsites.net/api/crypto" -ForegroundColor Cyan

Write-Host "`n4. Start marketing:" -ForegroundColor White
Write-Host "   - Post on Twitter/X, Reddit (r/CryptoCurrency, r/algotrading)" -ForegroundColor Gray
Write-Host "   - List on RapidAPI marketplace" -ForegroundColor Gray
Write-Host "   - Launch on Product Hunt" -ForegroundColor Gray

Write-Host "`n💰 REVENUE PROJECTIONS:" -ForegroundColor Yellow
Write-Host "   Month 1:  `$50-200" -ForegroundColor White
Write-Host "   Month 3:  `$500-1,500" -ForegroundColor White
Write-Host "   Month 6:  `$2,000-7,500" -ForegroundColor White
Write-Host "   Month 12: `$10,000+" -ForegroundColor White

Write-Host "`n" -NoNewline
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "`n🚀 YOU'RE READY TO MAKE MONEY! 🚀`n" -ForegroundColor Green
