#!/usr/bin/env pwsh
<#
.SYNOPSIS
Deploy LiTree Studio to Azure Static Web Apps

.DESCRIPTION
Completes the deployment to Azure SWA with proper GitHub secrets setup

.NOTES
Deployment token: 50b61e654356dcac94111b5d4990e29a195cdfd3cfecab1a017c3b391f96204c04-d2c46077-1f12-4377-9a4c-44b7770acf1c00f061208c78110f
#>

Write-Host "🚀 LiTree Studio Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
$checks = @{
    "Azure CLI" = { az --version }
    "Git" = { git --version }
    "Node.js" = { node --version }
    "npm" = { npm --version }
}

foreach ($tool in $checks.Keys) {
    try {
        $checks[$tool].Invoke() > $null
        Write-Host "  ✅ $tool" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $tool - NOT INSTALLED" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📦 Deployment Details:" -ForegroundColor Cyan
Write-Host "  App Name: litree-app"
Write-Host "  Resource Group: litree-rg"
Write-Host "  Location: East US 2"
Write-Host "  Live URL: https://lemon-glacier-08c78110f.4.azurestaticapps.net"
Write-Host ""

# GitHub Secret Setup
Write-Host "🔐 Next Step: Add GitHub Secret" -ForegroundColor Yellow
Write-Host ""
Write-Host "Go to: https://github.com/LiTree89/LiTreeStudio/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add new secret:" -ForegroundColor Yellow
Write-Host "  Name:  AZURE_STATIC_WEB_APPS_TOKEN" -ForegroundColor White
Write-Host "  Value: 50b61e654356dcac94111b5d4990e29a195cdfd3cfecab1a017c3b391f96204c04-d2c46077-1f12-4377-9a4c-44b7770acf1c00f061208c78110f" -ForegroundColor White
Write-Host ""

# App Check
Write-Host "✅ Current Status:" -ForegroundColor Green
Write-Host "  ✓ Resource Group created"
Write-Host "  ✓ Static Web App created"
Write-Host "  ✓ Deployment token obtained"
Write-Host "  ⏳ Waiting for GitHub secret (manual step)"
Write-Host "  ⏳ Deployment workflow ready (auto-triggers on push)"
Write-Host ""

Write-Host "⏱️  Timeline:" -ForegroundColor Cyan
Write-Host "  1. Add GitHub secret (2 min)"
Write-Host "  2. Trigger build (push code)"
Write-Host "  3. Deployment (5-10 min)"
Write-Host "  4. Live! 🎉"
Write-Host ""

Write-Host "📖 To continue:" -ForegroundColor Yellow
Write-Host "  1. Open: https://github.com/LiTree89/LiTreeStudio/settings/secrets/actions"
Write-Host "  2. Click: New repository secret"
Write-Host "  3. Fill in the details above"
Write-Host "  4. Click: Add secret"
Write-Host "  5. Come back here and hit ENTER"
Write-Host ""

Read-Host "Press ENTER after adding the GitHub secret"

Write-Host ""
Write-Host "🚀 Triggering deployment..." -ForegroundColor Green

# Make a trivial push to trigger the workflow
Write-Host "  Adding timestamp to trigger workflow..."
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path "DEPLOYMENT_TIMESTAMP.txt" -Value "Deployment triggered: $timestamp"

git add DEPLOYMENT_TIMESTAMP.txt
git commit -m "Trigger Azure Static Web Apps deployment"
git push origin "Legend's"

Write-Host ""
Write-Host "✅ Deployment triggered!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Monitor deployment at:" -ForegroundColor Cyan
Write-Host "  GitHub Actions: https://github.com/LiTree89/LiTreeStudio/actions"
Write-Host "  Azure Portal: https://portal.azure.com"
Write-Host ""
Write-Host "🎉 Your app will be live at:" -ForegroundColor Cyan
Write-Host "  https://lemon-glacier-08c78110f.4.azurestaticapps.net"
Write-Host ""
Write-Host "✨ Deployment in progress! Check back in 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""
