param(
    [string]$SubscriptionId = "0f95fc53-20dc-4c0d-8f76-0108222d5fb1"
)

$ErrorActionPreference = "Stop"

Write-Host "Setting Azure subscription to $SubscriptionId..." -ForegroundColor Cyan
az account set --subscription $SubscriptionId
az account show --query "{name:name,id:id,tenantId:tenantId,user:user.name}" -o table
