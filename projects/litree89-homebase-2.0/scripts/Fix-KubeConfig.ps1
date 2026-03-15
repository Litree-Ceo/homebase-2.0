<#
.SYNOPSIS
    Fixes kubectl configuration issues
.DESCRIPTION
    Resets KUBECONFIG environment variable to proper location
    and sets up Azure Kubernetes Service credentials if needed
#>
[CmdletBinding()]
param(
    [switch]$SetAKSCredentials
)

$ErrorActionPreference = 'Stop'

Write-Host "=== KUBECTL CONFIG FIX ===" -ForegroundColor Cyan

# Fix KUBECONFIG path
$kubeDir = Join-Path $env:USERPROFILE ".kube"
$kubeConfig = Join-Path $kubeDir "config"

# Create .kube directory if it doesn't exist
if (-not (Test-Path $kubeDir)) {
    New-Item -ItemType Directory -Path $kubeDir -Force | Out-Null
    Write-Host "Created $kubeDir" -ForegroundColor Green
}

# Set environment variable for current session
$env:KUBECONFIG = $kubeConfig
Write-Host "KUBECONFIG set to: $kubeConfig" -ForegroundColor Green

# Set it permanently for user
[Environment]::SetEnvironmentVariable("KUBECONFIG", $kubeConfig, "User")
Write-Host "KUBECONFIG persisted to user environment" -ForegroundColor Green

# Check if config file exists
if (Test-Path $kubeConfig) {
    Write-Host "Kubectl config exists at $kubeConfig" -ForegroundColor Green
    kubectl config get-contexts 2>$null
} else {
    Write-Host "No kubectl config file found. Creating empty config..." -ForegroundColor Yellow
    @"
apiVersion: v1
kind: Config
clusters: []
contexts: []
current-context: ""
users: []
preferences: {}
"@ | Out-File -FilePath $kubeConfig -Encoding utf8
    Write-Host "Created empty kubectl config" -ForegroundColor Green
}

# Optionally get AKS credentials
if ($SetAKSCredentials) {
    Write-Host "`nGetting AKS credentials..." -ForegroundColor Cyan
    $rgName = "litreelabstudio-rg"
    $aksName = "homebase-aks"

    try {
        az aks get-credentials --resource-group $rgName --name $aksName --overwrite-existing
        Write-Host "AKS credentials configured!" -ForegroundColor Green
    } catch {
        Write-Host "AKS cluster not found or not configured. Run 'az login' first." -ForegroundColor Yellow
    }
}

Write-Host "`n=== DONE ===" -ForegroundColor Cyan
