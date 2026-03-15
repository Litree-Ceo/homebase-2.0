#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Configure Paddle Payment Keys
.DESCRIPTION
    Securely stores Paddle API credentials in Azure Key Vault
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$PaddleVendorId,
    
    [Parameter(Mandatory=$true)]
    [string]$PaddleApiKey,
    
    [Parameter(Mandatory=$true)]
    [string]$PaddleWebhookSecret,
    
    [Parameter(Mandatory=$true)]
    [string]$PaddleProProductId,
    
    [Parameter(Mandatory=$true)]
    [string]$PaddleEnterpriseProductId
)

$ErrorActionPreference = "Stop"

Write-Host "`n🔐 Storing Paddle credentials in Key Vault..." -ForegroundColor Cyan

# Store in paddleapi vault
$vaultName = "paddleapi"

Write-Host "Storing secrets in $vaultName..." -ForegroundColor Gray

az keyvault secret set --vault-name $vaultName --name "PADDLE-VENDOR-ID" --value $PaddleVendorId --output none
Write-Host "✅ PADDLE-VENDOR-ID" -ForegroundColor Green

az keyvault secret set --vault-name $vaultName --name "PADDLE-API-KEY" --value $PaddleApiKey --output none
Write-Host "✅ PADDLE-API-KEY" -ForegroundColor Green

az keyvault secret set --vault-name $vaultName --name "PADDLE-WEBHOOK-SECRET" --value $PaddleWebhookSecret --output none
Write-Host "✅ PADDLE-WEBHOOK-SECRET" -ForegroundColor Green

az keyvault secret set --vault-name $vaultName --name "PADDLE-PRO-PRODUCT-ID" --value $PaddleProProductId --output none
Write-Host "✅ PADDLE-PRO-PRODUCT-ID" -ForegroundColor Green

az keyvault secret set --vault-name $vaultName --name "PADDLE-ENTERPRISE-PRODUCT-ID" --value $PaddleEnterpriseProductId --output none
Write-Host "✅ PADDLE-ENTERPRISE-PRODUCT-ID" -ForegroundColor Green

Write-Host "`n✅ All Paddle credentials stored securely!" -ForegroundColor Green
Write-Host "Next: Run .\Deploy-CryptoAPI.ps1 to deploy with these settings" -ForegroundColor Cyan
