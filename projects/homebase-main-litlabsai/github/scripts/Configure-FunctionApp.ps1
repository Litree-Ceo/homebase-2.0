#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Configure Function App with Key Vault references
#>

param(
    [string]$FunctionAppName = "homebase-crypto-api",
    [string]$ResourceGroup = "homebase-rg"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🔧 Configuring Function App Settings..." -ForegroundColor Cyan

# Configure settings one by one to avoid parsing issues
$settings = @{
    "COINGECKO_API_KEY" = "@Microsoft.KeyVault(SecretUri=https://everythinghomebase-kv.vault.azure.net/secrets/COINGECKO-API-KEY/)"
    "COSMOS_ENDPOINT" = "@Microsoft.KeyVault(SecretUri=https://everythinghomebase-kv.vault.azure.net/secrets/COSMOS-ENDPOINT/)"
    "COSMOS_KEY" = "@Microsoft.KeyVault(SecretUri=https://everythinghomebase-kv.vault.azure.net/secrets/COSMOS-KEY/)"
    "PADDLE_VENDOR_ID" = "@Microsoft.KeyVault(SecretUri=https://paddleapi.vault.azure.net/secrets/PADDLE-VENDOR-ID/)"
    "PADDLE_API_KEY" = "@Microsoft.KeyVault(SecretUri=https://paddleapi.vault.azure.net/secrets/PADDLE-API-KEY/)"
    "PADDLE_WEBHOOK_SECRET" = "@Microsoft.KeyVault(SecretUri=https://paddleapi.vault.azure.net/secrets/PADDLE-WEBHOOK-SECRET/)"
}

foreach ($key in $settings.Keys) {
    Write-Host "  Setting $key..." -ForegroundColor Gray
    az functionapp config appsettings set `
        --name $FunctionAppName `
        --resource-group $ResourceGroup `
        --settings "$key=$($settings[$key])" `
        --output none
}

Write-Host "✅ Function App configured with Key Vault references" -ForegroundColor Green

# Restart to apply settings
Write-Host "`n🔄 Restarting Function App..." -ForegroundColor Cyan
az functionapp restart --name $FunctionAppName --resource-group $ResourceGroup --output none
Write-Host "✅ Function App restarted" -ForegroundColor Green

# Test endpoint
Write-Host "`n🧪 Testing API..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

$apiUrl = "https://$FunctionAppName.azurewebsites.net/api/crypto?coin=bitcoin"
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Get -TimeoutSec 10
    if ($response.success) {
        Write-Host "✅ API is working!" -ForegroundColor Green
        Write-Host "   Bitcoin: `$$($response.data.bitcoin.usd)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  API not responding yet (may need more time)" -ForegroundColor Yellow
    Write-Host "   Try: curl https://$FunctionAppName.azurewebsites.net/api/crypto?coin=bitcoin" -ForegroundColor Gray
}

Write-Host "`n✅ Configuration Complete!" -ForegroundColor Green
Write-Host "`n🚀 Your API: https://$FunctionAppName.azurewebsites.net" -ForegroundColor Cyan
