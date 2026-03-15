<#
.SYNOPSIS
    Securely stores API keys and secrets in Azure Key Vault
.DESCRIPTION
    Prompts for sensitive credentials and stores them in Key Vault.
    Values are entered securely (masked) and never logged.
    Skips secrets that already exist (use -Force to update existing).
.PARAMETER Force
    Update all secrets, even if they already exist
.NOTES
    Key Vault: kvprodlitree14210
    Subscription: 0f95fc53-20dc-4c0d-8f76-0108222d5fb1
#>

param(
    [string]$VaultName = "kvprodlitree14210",
    [string]$Subscription = "0f95fc53-20dc-4c0d-8f76-0108222d5fb1",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "`n🔐 LITLABS Key Vault Secret Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Vault: $VaultName" -ForegroundColor DarkGray

# Check Azure CLI login
Write-Host "`n📡 Checking Azure login..." -ForegroundColor Yellow
$account = az account show 2>$null | ConvertFrom-Json
if (-not $account) {
    Write-Host "Not logged in. Opening browser for authentication..." -ForegroundColor Yellow
    az login
    az account set --subscription $Subscription
}
else {
    Write-Host "✅ Logged in as: $($account.user.name)" -ForegroundColor Green
    if ($account.id -ne $Subscription) {
        az account set --subscription $Subscription
    }
}

Write-Host "`n📋 Current secrets in vault:" -ForegroundColor Yellow
$existingSecrets = az keyvault secret list --vault-name $VaultName --query "[].name" -o tsv
$existingSecrets | ForEach-Object { Write-Host "  • $_" -ForegroundColor DarkGray }

# Helper function to securely prompt and store
function Set-KeyVaultSecret {
    param(
        [string]$SecretName,
        [string]$Description,
        [switch]$Optional,
        [switch]$ForceUpdate
    )
    
    # Check if secret already exists
    if ($existingSecrets -contains $SecretName -and -not $ForceUpdate -and -not $Force) {
        Write-Host "`n✅ $SecretName already configured - skipping" -ForegroundColor Green
        return
    }
    
    $marker = if ($Optional) { "[Optional]" } else { "[Required]" }
    Write-Host "`n$marker $Description" -ForegroundColor $(if ($Optional) { "DarkGray" } else { "White" })
    
    if ($Optional) {
        $confirm = Read-Host "Add $SecretName? (y/N)"
        if ($confirm -ne 'y' -and $confirm -ne 'Y') {
            Write-Host "  ⏭️  Skipped" -ForegroundColor DarkGray
            return
        }
    }
    
    $secureValue = Read-Host "Enter $SecretName" -AsSecureString
    $plainValue = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
    )
    
    if ([string]::IsNullOrWhiteSpace($plainValue)) {
        if (-not $Optional) {
            Write-Host "  ⚠️  Empty value - skipping (you can run this again later)" -ForegroundColor Yellow
        }
        return
    }
    
    Write-Host "  📤 Storing in Key Vault..." -ForegroundColor DarkGray
    $result = az keyvault secret set `
        --vault-name $VaultName `
        --name $SecretName `
        --value $plainValue `
        --query "name" -o tsv 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $SecretName stored successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  ❌ Failed to store: $result" -ForegroundColor Red
    }
    
    # Clear from memory
    $plainValue = $null
    [GC]::Collect()
}

Write-Host "`n" + "="*50 -ForegroundColor DarkGray
Write-Host "🔑 BINANCE API CREDENTIALS" -ForegroundColor Cyan
Write-Host "Get these from: https://www.binance.com/en/my/settings/api-management" -ForegroundColor DarkGray
Write-Host "(Use Testnet for sandbox: https://testnet.binance.vision/)" -ForegroundColor DarkGray

Set-KeyVaultSecret -SecretName "BINANCE-API-KEY" -Description "Binance API Key"
Set-KeyVaultSecret -SecretName "BINANCE-API-SECRET" -Description "Binance API Secret"

Write-Host "`n" + "="*50 -ForegroundColor DarkGray
Write-Host "💬 DISCORD WEBHOOK" -ForegroundColor Cyan
Write-Host "Create at: Discord Server Settings > Integrations > Webhooks" -ForegroundColor DarkGray

Set-KeyVaultSecret -SecretName "DISCORD-WEBHOOK-URL" -Description "Discord Webhook URL for notifications"

Write-Host "`n" + "="*50 -ForegroundColor DarkGray
Write-Host "📊 COINGECKO API" -ForegroundColor Cyan
Write-Host "Get from: https://www.coingecko.com/en/api/pricing" -ForegroundColor DarkGray

Set-KeyVaultSecret -SecretName "COINGECKO-API-KEY" -Description "CoinGecko API Key" -Optional

Write-Host "`n" + "="*50 -ForegroundColor DarkGray
Write-Host "💳 PADDLE PAYMENTS" -ForegroundColor Cyan
Write-Host "Get from: https://vendors.paddle.com/authentication" -ForegroundColor DarkGray

Set-KeyVaultSecret -SecretName "PADDLE-API-KEY" -Description "Paddle API Key" -Optional
Set-KeyVaultSecret -SecretName "PADDLE-WEBHOOK-SECRET" -Description "Paddle Webhook Secret" -Optional

Write-Host "`n" + "="*50 -ForegroundColor DarkGray
Write-Host "🤖 GROK AI" -ForegroundColor Cyan
Write-Host "Get from: https://console.x.ai/" -ForegroundColor DarkGray

Set-KeyVaultSecret -SecretName "GROK-API-KEY" -Description "Grok/xAI API Key" -Optional

# Final summary
Write-Host "`n`n📋 FINAL SECRET INVENTORY" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
az keyvault secret list --vault-name $VaultName --query "[].{Name:name, Enabled:attributes.enabled}" -o table

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "Run .\scripts\Setup-DevEnvironment.ps1 to generate local.settings.json" -ForegroundColor DarkGray
