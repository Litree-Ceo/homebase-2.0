#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Sets up the HomeBase development environment on any machine.
.DESCRIPTION
    Run this script on any new machine to get everything configured.
    It pulls secrets from Azure Key Vault and sets up local.settings.json.
#>

param(
    [switch]$SkipAzureLogin,
    [switch]$UseEmulator  # Use local Cosmos emulator instead of Azure
)

Write-Host "🏠 HomeBase Environment Setup" -ForegroundColor Cyan
Write-Host "=" * 50

# Check prerequisites
$requiredTools = @("az", "pnpm", "node")
foreach ($tool in $requiredTools) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Error "Missing required tool: $tool"
        exit 1
    }
}
Write-Host "✅ All required tools found" -ForegroundColor Green

# Azure Login
if (-not $SkipAzureLogin) {
    Write-Host "`n🔐 Logging into Azure..." -ForegroundColor Yellow
    az login --output none
    az account set --subscription "0f95fc53-20dc-4c0d-8f76-0108222d5fb1"
}

# Key Vault name
$vaultName = "kvprodlitree14210"

Write-Host "`n📥 Fetching secrets from Key Vault: $vaultName" -ForegroundColor Yellow

# Fetch secrets (with fallbacks for missing ones)
function Get-Secret {
    param([string]$SecretName, [string]$DefaultValue = "")
    try {
        $value = az keyvault secret show --vault-name $vaultName --name $SecretName --query value -o tsv 2>$null
        if ($value) { return $value }
    } catch { }
    return $DefaultValue
}

$secrets = @{
    BINANCE_API_KEY = Get-Secret "BINANCE-API-KEY"
    BINANCE_API_SECRET = Get-Secret "BINANCE-API-SECRET"
    DISCORD_WEBHOOK_URL = Get-Secret "DISCORD-WEBHOOK-URL"
    COSMOS_KEY = Get-Secret "COSMOS-KEY" "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=="
    COINGECKO_API_KEY = Get-Secret "COINGECKO-API-KEY"
}

# Determine Cosmos endpoint
$cosmosEndpoint = if ($UseEmulator) {
    "https://localhost:8081"
} else {
    Get-Secret "COSMOS-ENDPOINT" "https://homebase-cosmos.documents.azure.com:443/"
}

# Create local.settings.json for API
$apiSettingsPath = Join-Path $PSScriptRoot ".." "api" "local.settings.json"

$settings = @{
    IsEncrypted = $false
    Values = @{
        AzureWebJobsStorage = "UseDevelopmentStorage=true"
        FUNCTIONS_WORKER_RUNTIME = "node"
        FUNCTIONS_NODE_BLOCK_ON_ENTRY_POINT_ERROR = "true"
        
        # Cosmos DB
        COSMOS_ENDPOINT = $cosmosEndpoint
        COSMOS_KEY = $secrets.COSMOS_KEY
        COSMOS_DATABASE = "homebase"
        
        # Blob Storage
        BLOB_CONNECTION_STRING = "UseDevelopmentStorage=true"
        
        # Key Vault (for runtime secret fetching)
        KEY_VAULT_URI = "https://$vaultName.vault.azure.net/"
        
        # Exchange Integration
        EXCHANGE_NAME = "binance"
        EXCHANGE_API_KEY = $secrets.BINANCE_API_KEY
        EXCHANGE_SECRET = $secrets.BINANCE_API_SECRET
        EXCHANGE_SANDBOX = "true"  # KEEP TRUE until tested!
        
        # Notifications
        DISCORD_WEBHOOK_URL = $secrets.DISCORD_WEBHOOK_URL
        WEBHOOK_URL = ""
        
        # CoinGecko (optional - free tier works without key)
        COINGECKO_API_KEY = $secrets.COINGECKO_API_KEY
        
        # Paddle (payments - optional)
        PADDLE_WEBHOOK_SECRET = ""
        PADDLE_ENV = "sandbox"
    }
    Host = @{
        CORS = "*"
        CORSCredentials = $false
        LocalHttpPort = 7071
    }
}

$settings | ConvertTo-Json -Depth 4 | Set-Content $apiSettingsPath -Encoding UTF8
Write-Host "✅ Created: $apiSettingsPath" -ForegroundColor Green

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
Set-Location (Join-Path $PSScriptRoot "..")
pnpm install

Write-Host "`n✅ Environment setup complete!" -ForegroundColor Green
Write-Host @"

📋 Next Steps:
1. Start Azurite (Azure Storage Emulator):
   - VS Code: F1 → 'Azurite: Start'
   - Or: npx azurite --silent

2. Start the API:
   pnpm -C api start

3. Test the bots:
   Open api/bot-api.http in VS Code

⚠️  IMPORTANT: EXCHANGE_SANDBOX=true means paper trading only.
    Change to 'false' ONLY after extensive testing!

"@
