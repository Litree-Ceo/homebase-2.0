param(
    [string]$ResourceGroup = "litreelabstudio-rg",
    [string]$FunctionApp = "litlabs-func-app-prod",
    [string]$KeyVaultName = "kvprodlitree14210"
)

$ErrorActionPreference = "Stop"

Write-Host "Ensuring Function App has managed identity..." -ForegroundColor Cyan
$identity = az functionapp identity assign -g $ResourceGroup -n $FunctionApp | ConvertFrom-Json
$principalId = $identity.principalId

Write-Host "Granting Key Vault access policy (secrets get/list)..." -ForegroundColor Cyan
az keyvault set-policy -n $KeyVaultName --object-id $principalId --secret-permissions get list | Out-Null

Write-Host "Wiring Key Vault references into Function App settings..." -ForegroundColor Cyan
az functionapp config appsettings set -g $ResourceGroup -n $FunctionApp --settings `
    "COSMOS_ENDPOINT=@Microsoft.KeyVault(VaultName=$KeyVaultName;SecretName=COSMOS-ENDPOINT)" `
    "SIGNALR_CONN=@Microsoft.KeyVault(VaultName=$KeyVaultName;SecretName=SIGNALR-CONN)" `
    "GROK_API_KEY=@Microsoft.KeyVault(VaultName=$KeyVaultName;SecretName=GROK-API-KEY)" | Out-Null

Write-Host "Key Vault wiring complete." -ForegroundColor Green
