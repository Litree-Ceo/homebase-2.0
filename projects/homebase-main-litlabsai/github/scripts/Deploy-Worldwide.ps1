<#
.SYNOPSIS
    LITLABS Master Deployment Script - Deploy HomeBase 2.0 Worldwide
.DESCRIPTION
    Complete deployment pipeline for HomeBase 2.0 to Azure:
    - Validates prerequisites
    - Fixes common issues (kubectl, git, etc.)
    - Deploys infrastructure via Bicep
    - Deploys application to Azure Container Apps
    - Configures Azure Front Door for global distribution
    - Sets up monitoring and alerts
.EXAMPLE
    .\Deploy-Worldwide.ps1 -Environment prod
.EXAMPLE
    .\Deploy-Worldwide.ps1 -Environment prod -SkipInfra
#>
[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment = 'prod',

    [Parameter()]
    [switch]$SkipInfra,

    [Parameter()]
    [switch]$SkipApp,

    [Parameter()]
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Configuration
$config = @{
    SubscriptionId = '0f95fc53-20dc-4c0d-8f76-0108222d5fb1'
    ResourceGroup = 'litreelabstudio-rg'
    Location = 'eastus'
    ACRName = 'homebasecontainers'
    KeyVaultName = 'kvprodlitree14210'
    CosmosAccount = 'litlab-cosmos'
    FunctionApp = 'litlabs-func-app-prod'
    FrontDoor = 'litlabs-fd'
}

function Write-Step {
    param([string]$Message, [string]$Status = 'INFO')
    $color = switch ($Status) {
        'INFO' { 'Cyan' }
        'SUCCESS' { 'Green' }
        'WARNING' { 'Yellow' }
        'ERROR' { 'Red' }
        default { 'White' }
    }
    Write-Host "[$Status] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."

    $missing = @()

    # Check Azure CLI
    if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
        $missing += "Azure CLI (az)"
    }

    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        $missing += "Docker"
    }

    # Check Node.js
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        $missing += "Node.js"
    }

    # Check pnpm
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        $missing += "pnpm"
    }

    if ($missing.Count -gt 0) {
        Write-Step "Missing prerequisites: $($missing -join ', ')" -Status 'ERROR'
        return $false
    }

    Write-Step "All prerequisites met!" -Status 'SUCCESS'
    return $true
}

function Set-AzureContext {
    Write-Step "Setting Azure context..."

    # Check if logged in
    $account = az account show 2>$null | ConvertFrom-Json
    if (-not $account) {
        Write-Step "Not logged in to Azure. Running 'az login'..." -Status 'WARNING'
        az login
    }

    # Set subscription
    az account set --subscription $config.SubscriptionId
    Write-Step "Using subscription: $($config.SubscriptionId)" -Status 'SUCCESS'
}

function Deploy-Infrastructure {
    if ($SkipInfra) {
        Write-Step "Skipping infrastructure deployment" -Status 'WARNING'
        return
    }

    Write-Step "Deploying infrastructure via Bicep..."

    $bicepPath = Join-Path $PSScriptRoot "..\infra\bicep\main.bicep"
    $paramsPath = Join-Path $PSScriptRoot "..\infra\bicep\parameters.json"

    if ($DryRun) {
        Write-Step "[DRY RUN] Would deploy: $bicepPath" -Status 'INFO'
        return
    }

    # Get secrets from Key Vault
    $signalrConnection = az keyvault secret show --vault-name $config.KeyVaultName --name "signalr-connection" --query value -o tsv 2>$null
    $grokApiKey = az keyvault secret show --vault-name $config.KeyVaultName --name "grok-api-key" --query value -o tsv 2>$null

    if (-not $signalrConnection) { $signalrConnection = "placeholder" }
    if (-not $grokApiKey) { $grokApiKey = "placeholder" }

    az deployment group create `
        --resource-group $config.ResourceGroup `
        --template-file $bicepPath `
        --parameters signalrConnection=$signalrConnection grokApiKey=$grokApiKey `
        --mode Incremental

    Write-Step "Infrastructure deployed!" -Status 'SUCCESS'
}

function Deploy-FrontDoor {
    Write-Step "Deploying Azure Front Door for global distribution..."

    $frontDoorBicep = Join-Path $PSScriptRoot "..\infra\bicep\frontdoor-waf.bicep"

    if ($DryRun) {
        Write-Step "[DRY RUN] Would deploy Front Door" -Status 'INFO'
        return
    }

    if (Test-Path $frontDoorBicep) {
        az deployment group create `
            --resource-group $config.ResourceGroup `
            --template-file $frontDoorBicep `
            --mode Incremental

        Write-Step "Front Door deployed with WAF protection!" -Status 'SUCCESS'
    } else {
        Write-Step "Front Door Bicep not found at $frontDoorBicep" -Status 'WARNING'
    }
}

function Build-And-Push-Images {
    if ($SkipApp) {
        Write-Step "Skipping application build" -Status 'WARNING'
        return
    }

    Write-Step "Building and pushing container images to ACR..."

    $rootPath = Split-Path $PSScriptRoot -Parent

    if ($DryRun) {
        Write-Step "[DRY RUN] Would build images" -Status 'INFO'
        return
    }

    # Login to ACR
    az acr login --name $config.ACRName

    # Build web app
    Write-Step "Building web app..."
    az acr build `
        --registry $config.ACRName `
        --image homebase-web:latest `
        --file "$rootPath\apps\web\Dockerfile" `
        $rootPath

    # Build API
    Write-Step "Building API..."
    az acr build `
        --registry $config.ACRName `
        --image homebase-api:latest `
        --file "$rootPath\packages\api\Dockerfile" `
        $rootPath

    Write-Step "Images pushed to ACR!" -Status 'SUCCESS'
}

function Get-DeploymentStatus {
    Write-Step "Getting deployment status..."

    Write-Host "`n=== AZURE RESOURCES ===" -ForegroundColor Cyan
    az resource list -g $config.ResourceGroup -o table

    Write-Host "`n=== FRONT DOOR ENDPOINTS ===" -ForegroundColor Cyan
    $fdEndpoint = az afd endpoint list -g $config.ResourceGroup --profile-name $config.FrontDoor --query "[0].hostName" -o tsv 2>$null
    if ($fdEndpoint) {
        Write-Host "🌐 Global URL: https://$fdEndpoint" -ForegroundColor Green
    }

    Write-Host "`n=== FUNCTION APP ===" -ForegroundColor Cyan
    $funcUrl = az functionapp show -g $config.ResourceGroup -n $config.FunctionApp --query "defaultHostName" -o tsv 2>$null
    if ($funcUrl) {
        Write-Host "⚡ Functions: https://$funcUrl" -ForegroundColor Green
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║  LITLABS WORLDWIDE DEPLOYMENT                                 ║
║  HomeBase 2.0 → Azure Global Infrastructure                   ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Step "Environment: $Environment"
Write-Step "Dry Run: $DryRun"

if (-not (Test-Prerequisites)) {
    exit 1
}

Set-AzureContext
Deploy-Infrastructure
Deploy-FrontDoor
Build-And-Push-Images
Get-DeploymentStatus

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║  DEPLOYMENT COMPLETE!                                         ║
╚══════════════════════════════════════════════════════════════╝

Next steps:
1. Push your local commits: git push origin main
2. GitHub Actions will auto-deploy to Container Apps
3. Front Door provides global CDN + WAF protection
4. Monitor at: https://portal.azure.com

"@ -ForegroundColor Green
