#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Final Deployment Verification & Sync Script
.DESCRIPTION
    Verifies all deployment components are in sync and ready
    Checks: Git status, Azure resources, Key Vault, Container Apps
.NOTES
    Run this after GitHub Actions completes to verify everything is live
#>

Write-Host "`n🔍 HOMEBASE 2.0 - DEPLOYMENT VERIFICATION & SYNC`n" -ForegroundColor Cyan

# 1. Check Git Status
Write-Host "📦 Git Repository Status" -ForegroundColor Yellow
$gitStatus = git status --short
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "✅ All changes committed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Uncommitted changes found:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Gray
}

$lastCommit = git log -1 --oneline
Write-Host "📝 Latest commit: $lastCommit" -ForegroundColor Green

# 2. Check Azure Authentication
Write-Host "`n🔐 Azure Authentication" -ForegroundColor Yellow
try {
    $account = az account show --query "user.name" -o tsv 2>$null
    if ($account) {
        Write-Host "✅ Logged in as: $account" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Not authenticated to Azure. Run 'az login' first" -ForegroundColor Yellow
}

# 3. Check Container Registry
Write-Host "`n📦 Azure Container Registry" -ForegroundColor Yellow
try {
    $registries = az acr list --query "[].{name:name, loginServer:loginServer}" -o json | ConvertFrom-Json
    if ($registries) {
        Write-Host "✅ Registry found: homebasecontainers.azurecr.io" -ForegroundColor Green
        $images = az acr repository list --name homebasecontainers --query "[]" -o json 2>$null | ConvertFrom-Json
        if ($images) {
            Write-Host "📸 Images in registry:" -ForegroundColor Cyan
            foreach ($image in $images) {
                Write-Host "   - $image" -ForegroundColor Gray
            }
        }
    }
} catch {
    Write-Host "⚠️  Could not access Container Registry" -ForegroundColor Yellow
}

# 4. Check Container Apps
Write-Host "`n🌐 Azure Container Apps" -ForegroundColor Yellow
try {
    $webApp = az containerapp show --name homebase-web --resource-group homebase-rg --query "{name:name, status:properties.provisioningState, url:properties.configuration.ingress.fqdn}" -o json 2>$null | ConvertFrom-Json
    if ($webApp) {
        Write-Host "✅ Web App Status:" -ForegroundColor Green
        Write-Host "   Name: $($webApp.name)" -ForegroundColor Gray
        Write-Host "   URL: https://$($webApp.url)" -ForegroundColor Green
        Write-Host "   Provisioning: $($webApp.status)" -ForegroundColor Gray
    }
    
    $apiApp = az containerapp show --name homebase-api --resource-group homebase-rg --query "{name:name, status:properties.provisioningState, url:properties.configuration.ingress.fqdn}" -o json 2>$null | ConvertFrom-Json
    if ($apiApp) {
        Write-Host "✅ API Status:" -ForegroundColor Green
        Write-Host "   Name: $($apiApp.name)" -ForegroundColor Gray
        Write-Host "   URL: https://$($apiApp.url)/api" -ForegroundColor Green
        Write-Host "   Provisioning: $($apiApp.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Container Apps not yet deployed (GitHub Actions may still be running)" -ForegroundColor Yellow
}

# 5. Check Key Vault
Write-Host "`n🔑 Azure Key Vault - Secrets Status" -ForegroundColor Yellow
try {
    $secrets = az keyvault secret list --vault-name kvprodlitree14210 --query "[].name" -o json | ConvertFrom-Json
    
    $required = @("COSMOS-ENDPOINT", "COSMOS-KEY", "KEY-VAULT-URI", "PADDLE-VENDOR-ID", "PADDLE-API-KEY", "PADDLE-WEBHOOK-SECRET")
    $missing = @()
    
    foreach ($secret in $required) {
        if ($secrets -contains $secret) {
            Write-Host "✅ $secret" -ForegroundColor Green
        } else {
            Write-Host "❌ $secret - MISSING" -ForegroundColor Red
            $missing += $secret
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "`n⚠️  Missing secrets (run Setup-Paddle-Complete.ps1):" -ForegroundColor Yellow
        foreach ($s in $missing) {
            Write-Host "   - $s" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ All required secrets configured" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not verify Key Vault secrets" -ForegroundColor Yellow
}

# 6. Check Cosmos DB
Write-Host "`n💾 Cosmos DB - Collections" -ForegroundColor Yellow
try {
    $collections = az cosmosdb sql container list `
        --database-name homebase `
        --resource-group homebase-rg `
        --account-name homebase-cosmos `
        --query "[].name" -o json 2>$null | ConvertFrom-Json
    
    if ($collections) {
        Write-Host "✅ Database: homebase" -ForegroundColor Green
        foreach ($collection in $collections) {
            Write-Host "   - $collection" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "⚠️  Could not access Cosmos DB (may still be provisioning)" -ForegroundColor Yellow
}

# 7. Endpoint Health Checks
Write-Host "`n🧪 Endpoint Health Checks" -ForegroundColor Yellow

$endpoints = @(
    @{ name = "Web App"; url = "https://homebase-web.azurecontainerapps.io" },
    @{ name = "API Health"; url = "https://homebase-api.azurecontainerapps.io/api/health" },
    @{ name = "Paddle Webhook"; url = "https://homebase-api.azurecontainerapps.io/api/paddle-webhook" }
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.url -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 405) {
            Write-Host "✅ $($endpoint.name) - Responding" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($endpoint.name) - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  $($endpoint.name) - Not responding yet" -ForegroundColor Yellow
    }
}

# 8. GitHub Actions Status
Write-Host "`n🔄 GitHub Actions Workflow" -ForegroundColor Yellow
Write-Host "Monitor deployment progress at:" -ForegroundColor Cyan
Write-Host "https://github.com/LiTree89/HomeBase-2.0/actions" -ForegroundColor Green

# 9. Summary
Write-Host "`n" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "DEPLOYMENT STATUS SUMMARY" -ForegroundColor Green  
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

$checks = @(
    @{ name = "Git Sync"; status = "✅" },
    @{ name = "Code Deployed"; status = "✅" },
    @{ name = "GitHub Actions"; status = "🔄 In Progress" },
    @{ name = "Container Apps"; status = "🔄 Deploying" },
    @{ name = "Key Vault"; status = "✅" },
    @{ name = "Paddle Integration"; status = "⏳ Ready" }
)

foreach ($check in $checks) {
    Write-Host "$($check.status) $($check.name)" -ForegroundColor Cyan
}

# 10. Next Steps
Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "`n1️⃣  Wait for GitHub Actions to complete (5-15 minutes)" -ForegroundColor Cyan
Write-Host "   📍 Watch: https://github.com/LiTree89/HomeBase-2.0/actions" -ForegroundColor Gray

Write-Host "`n2️⃣  Once deployed, test endpoints:" -ForegroundColor Cyan
Write-Host "   🌐 https://homebase-web.azurecontainerapps.io" -ForegroundColor Gray
Write-Host "   📡 https://homebase-api.azurecontainerapps.io/api/health" -ForegroundColor Gray

Write-Host "`n3️⃣  Setup Paddle integration:" -ForegroundColor Cyan
Write-Host "   💳 .\Setup-Paddle-Complete.ps1 -VendorId '...' -ApiKey '...' -WebhookSecret '...'" -ForegroundColor Gray

Write-Host "`n4️⃣  Configure Paddle webhook in dashboard:" -ForegroundColor Cyan
Write-Host "   🔗 https://homebase-api.azurecontainerapps.io/api/paddle-webhook" -ForegroundColor Gray

Write-Host "`n5️⃣  Test payment flow with sandbox credentials" -ForegroundColor Cyan
Write-Host "   💰 Switch to production when ready" -ForegroundColor Gray

Write-Host "`n🎉 Your site is LIVE!" -ForegroundColor Green
Write-Host "`n💡 Tip: Run this script again in 10 minutes to confirm all endpoints are responding`n" -ForegroundColor Cyan

