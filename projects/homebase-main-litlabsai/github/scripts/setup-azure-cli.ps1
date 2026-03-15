<#
.SYNOPSIS
  Validate Azure CLI, optionally log in, and set defaults.

.EXAMPLE
  .\scripts\setup-azure-cli.ps1 -Login -UseDeviceCode -SubscriptionId "00000000-0000-0000-0000-000000000000" -SetDefaults -DefaultLocation "eastus2" -DefaultResourceGroup "litree-prod-rg"
#>

param(
  [string]$SubscriptionId,
  [string]$TenantId,
  [string]$DefaultLocation,
  [string]$DefaultResourceGroup,
  [switch]$Login,
  [switch]$UseDeviceCode,
  [switch]$SetDefaults
)

$ErrorActionPreference = "Stop"

function Write-Info([string]$Message) { Write-Host $Message -ForegroundColor Cyan }
function Write-Ok([string]$Message) { Write-Host $Message -ForegroundColor Green }
function Write-Warn([string]$Message) { Write-Host $Message -ForegroundColor Yellow }

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  throw "Azure CLI (az) not found. Install: winget install --id Microsoft.AzureCLI"
}

Write-Info "Checking Azure CLI login..."
$account = $null
try {
  $account = az account show -o json 2>$null | ConvertFrom-Json
} catch {
  $account = $null
}

if (-not $account) {
  if (-not $Login) {
    Write-Warn "Azure CLI is not authenticated."
    Write-Host "Run: az login"
    exit 1
  }

  $loginArgs = @("login")
  if ($UseDeviceCode) { $loginArgs += "--use-device-code" }
  if ($TenantId) { $loginArgs += @("--tenant", $TenantId) }
  & az @loginArgs | Out-Null

  $account = az account show -o json | ConvertFrom-Json
}

if ($SubscriptionId) {
  Write-Info "Setting active subscription to $SubscriptionId"
  az account set --subscription $SubscriptionId | Out-Null
  $account = az account show -o json | ConvertFrom-Json
}

if ($SetDefaults) {
  $defaults = @()
  if ($DefaultLocation) { $defaults += "location=$DefaultLocation" }
  if ($DefaultResourceGroup) { $defaults += "group=$DefaultResourceGroup" }

  if ($defaults.Count -gt 0) {
    Write-Info "Setting Azure CLI defaults: $($defaults -join ', ')"
    az configure --defaults @defaults | Out-Null
  }
}

Write-Ok "Azure CLI ready."
@{
  name = $account.name
  id = $account.id
  tenantId = $account.tenantId
  user = $account.user.name
} | ConvertTo-Json -Depth 3
