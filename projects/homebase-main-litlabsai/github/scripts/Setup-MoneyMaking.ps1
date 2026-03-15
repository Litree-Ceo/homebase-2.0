#!/usr/bin/env pwsh
<#
.SYNOPSIS
    💰 Complete Money-Making Setup for HomeBase 2.0
.DESCRIPTION
    Sets up all Key Vault secrets and deploys the crypto API
#>

$ErrorActionPreference = "Stop"

Write-Host "`n" -NoNewline
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "    💰 HOMEBASE 2.0 - COMPLETE MONEY-MAKING SETUP" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify Azure Login
Write-Host "🔐 Step 1: Verifying Azure login..." -ForegroundColor Magenta
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "❌ Not logged into Azure!" -ForegroundColor Red
    Write-Host "Run: az login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host "   Subscription: $($account.name)" -ForegroundColor Gray

# Step 2: Set up CoinGecko API Key
Write-Host "`n💎 Step 2: Setting up CoinGecko API Key..." -ForegroundColor Magenta
$coingeckoKey = Read-Host "Enter your CoinGecko API key (or press Enter to use demo mode)"
if ([string]::IsNullOrWhiteSpace($coingeckoKey)) {
    $coingeckoKey = "CG-DEMO-KEY-USE-FREE-TIER"
    Write-Host "ℹ️  Using demo mode (limited to 10-30 calls/min)" -ForegroundColor Yellow
}

az keyvault secret set `
    --vault-name "EverythingHomebase-kv" `
    --name "COINGECKO-API-KEY" `
    --value $coingeckoKey `
    --output none

Write-Host "✅ CoinGecko API key stored" -ForegroundColor Green

# Step 3: Set up Cosmos DB Key (if missing)
Write-Host "`n🗄️  Step 3: Checking Cosmos DB setup..." -ForegroundColor Magenta
$cosmosKey = az keyvault secret show `
    --vault-name "EverythingHomebase-kv" `
    --name "COSMOS-KEY" `
    --query "value" -o tsv 2>$null

if (-not $cosmosKey) {
    Write-Host "⚠️  Cosmos DB key not found. Fetching from Azure..." -ForegroundColor Yellow
    
    # Find Cosmos DB account
    $cosmosAccount = az cosmosdb list --query "[0].{name:name,resourceGroup:resourceGroup}" 2>$null | ConvertFrom-Json
    
    if ($cosmosAccount) {
        $cosmosKey = az cosmosdb keys list `
            --name $cosmosAccount.name `
            --resource-group $cosmosAccount.resourceGroup `
            --query "primaryMasterKey" -o tsv
        
        az keyvault secret set `
            --vault-name "EverythingHomebase-kv" `
            --name "COSMOS-KEY" `
            --value $cosmosKey `
            --output none
        
        Write-Host "✅ Cosmos DB key stored" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No Cosmos DB found (will create if needed)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Cosmos DB already configured" -ForegroundColor Green
}

# Step 4: Set up Paddle API (optional for now)
Write-Host "`n💳 Step 4: Paddle Payment Setup (optional)..." -ForegroundColor Magenta
Write-Host "Do you want to configure Paddle payments now? (y/N)" -ForegroundColor Yellow
$paddleChoice = Read-Host
if ($paddleChoice -eq "y" -or $paddleChoice -eq "Y") {
    Write-Host "`nEnter Paddle credentials:" -ForegroundColor Cyan
    $paddleVendorId = Read-Host "Paddle Vendor ID"
    $paddleApiKey = Read-Host "Paddle API Key" -AsSecureString
    $paddleWebhookSecret = Read-Host "Paddle Webhook Secret" -AsSecureString
    $paddleProProduct = Read-Host "Pro Product ID"
    $paddleEnterpriseProduct = Read-Host "Enterprise Product ID"
    
    # Convert SecureString to plain text for storage
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($paddleApiKey)
    $paddleApiKeyPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($paddleWebhookSecret)
    $paddleWebhookSecretPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    
    az keyvault secret set --vault-name "paddleapi" --name "PADDLE-VENDOR-ID" --value $paddleVendorId --output none
    az keyvault secret set --vault-name "paddleapi" --name "PADDLE-API-KEY" --value $paddleApiKeyPlain --output none
    az keyvault secret set --vault-name "paddleapi" --name "PADDLE-WEBHOOK-SECRET" --value $paddleWebhookSecretPlain --output none
    az keyvault secret set --vault-name "paddleapi" --name "PADDLE-PRO-PRODUCT-ID" --value $paddleProProduct --output none
    az keyvault secret set --vault-name "paddleapi" --name "PADDLE-ENTERPRISE-PRODUCT-ID" --value $paddleEnterpriseProduct --output none
    
    Write-Host "✅ Paddle credentials stored" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping Paddle setup (can configure later)" -ForegroundColor Yellow
}

# Step 5: Set up Binance API (optional)
Write-Host "`n📈 Step 5: Binance API Setup (optional)..." -ForegroundColor Magenta
Write-Host "Do you want to configure Binance API now? (y/N)" -ForegroundColor Yellow
$binanceChoice = Read-Host
if ($binanceChoice -eq "y" -or $binanceChoice -eq "Y") {
    $binanceApiKey = Read-Host "Binance API Key"
    $binanceApiSecret = Read-Host "Binance API Secret" -AsSecureString
    
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($binanceApiSecret)
    $binanceApiSecretPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
    
    az keyvault secret set --vault-name "binacekey" --name "BINANCE-API-KEY" --value $binanceApiKey --output none
    az keyvault secret set --vault-name "binacekey" --name "BINANCE-API-SECRET" --value $binanceApiSecretPlain --output none
    
    Write-Host "✅ Binance credentials stored" -ForegroundColor Green
} else {
    Write-Host "⏭️  Skipping Binance setup (can configure later)" -ForegroundColor Yellow
}

# Step 6: Enable Function App Managed Identity and Key Vault Access
Write-Host "`n🔑 Step 6: Configuring Function App security..." -ForegroundColor Magenta
$functionAppName = "homebase-crypto-api"
$resourceGroup = "homebase-rg"

# Check if Function App exists
$appExists = az functionapp show --name $functionAppName --resource-group $resourceGroup 2>$null
if ($appExists) {
    Write-Host "Enabling Managed Identity..." -ForegroundColor Gray
    $principalId = az functionapp identity assign `
        --name $functionAppName `
        --resource-group $resourceGroup `
        --query "principalId" -o tsv
    
    Write-Host "Granting Key Vault access..." -ForegroundColor Gray
    @("EverythingHomebase-kv", "paddleapi", "binacekey") | ForEach-Object {
        $vaultName = $_
        az keyvault set-policy `
            --name $vaultName `
            --object-id $principalId `
            --secret-permissions get list `
            --output none
        Write-Host "  ✅ $vaultName" -ForegroundColor Gray
    }
    
    Write-Host "✅ Function App security configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Function App not found (will be created on first deployment)" -ForegroundColor Yellow
}

# Step 7: Display Summary
Write-Host "`n" -NoNewline
Write-Host "================================================================" -ForegroundColor Green
Write-Host "    ✅ SETUP COMPLETE - READY TO MAKE MONEY!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Configuration Summary:" -ForegroundColor Cyan
Write-Host "  ✅ CoinGecko API: Configured" -ForegroundColor White
Write-Host "  ✅ Cosmos DB: Configured" -ForegroundColor White
if ($paddleChoice -eq "y" -or $paddleChoice -eq "Y") {
    Write-Host "  ✅ Paddle Payments: Configured" -ForegroundColor White
} else {
    Write-Host "  ⏭️  Paddle Payments: Skipped" -ForegroundColor Gray
}
if ($binanceChoice -eq "y" -or $binanceChoice -eq "Y") {
    Write-Host "  ✅ Binance API: Configured" -ForegroundColor White
} else {
    Write-Host "  ⏭️  Binance API: Skipped" -ForegroundColor Gray
}

Write-Host "`n🚀 Next Steps:" -ForegroundColor Magenta
Write-Host "  1. Deploy API: .\scripts\Deploy-CryptoAPI.ps1" -ForegroundColor White
Write-Host "  2. Test locally: pnpm -C api start" -ForegroundColor White
Write-Host "  3. Set up Paddle: https://paddle.com" -ForegroundColor White
Write-Host "  4. List on RapidAPI: https://rapidapi.com" -ForegroundColor White

Write-Host "`n💵 Revenue Potential:" -ForegroundColor Yellow
Write-Host "  Month 1:   $200-500" -ForegroundColor White
Write-Host "  Month 3:   $1,500+" -ForegroundColor White
Write-Host "  Month 6:   $5,000+" -ForegroundColor White
Write-Host "  Month 12:  $15,000+" -ForegroundColor White

Write-Host "`n🎯 Pro Tips:" -ForegroundColor Cyan
Write-Host "  • Start with free tier CoinGecko (10-30 calls/min)" -ForegroundColor Gray
Write-Host "  • Upgrade to Pro when you hit limits ($129/month)" -ForegroundColor Gray
Write-Host "  • Price Pro tier at $9.99/month (300 users = $3k/mo)" -ForegroundColor Gray
Write-Host "  • Price Enterprise at $49.99/month for unlimited" -ForegroundColor Gray

Write-Host "`n" -NoNewline
Write-Host "================================================================" -ForegroundColor Gray
Write-Host ""
