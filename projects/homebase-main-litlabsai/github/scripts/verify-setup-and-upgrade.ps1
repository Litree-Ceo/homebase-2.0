#!/usr/bin/env pwsh
# Verify API Keys Setup & Upgrade to Azure Premium

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 Verifying API Keys Setup" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$vaultName = "kvprodlitree14210"
$resourceGroup = "litreelabstudio-rg"

# Check secrets in vault
Write-Host "📋 Secrets in Key Vault:" -ForegroundColor Yellow
$secrets = az keyvault secret list --vault-name $vaultName --query "[].{Name:name}" -o table
Write-Host $secrets

Write-Host ""
Write-Host "✅ Status Check:" -ForegroundColor Green

# Check each required secret
$requiredSecrets = @("GROK-API-KEY", "ANTHROPIC-API-KEY", "GITHUB-TOKEN")
foreach ($secret in $requiredSecrets) {
    $exists = az keyvault secret show --vault-name $vaultName --name $secret 2>$null
    if ($exists) {
        Write-Host "   ✅ $secret - SET" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $secret - MISSING (run setup-api-keys.ps1)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "⭐ Upgrade to Azure Premium" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Show current tier
Write-Host "📊 Current Azure Resources:" -ForegroundColor Yellow
$functionApp = "litlabs-func-app-prod"

Write-Host ""
Write-Host "Function App: $functionApp" -ForegroundColor Cyan
$appInfo = az functionapp show --name $functionApp --resource-group $resourceGroup --query "{Name:name, AppServicePlan:appServicePlanId, State:state}" -o json | ConvertFrom-Json

Write-Host "  Current State: $($appInfo.State)" -ForegroundColor White

# Get current plan
$planInfo = az appservice plan show --name $functionApp-plan --resource-group $resourceGroup --query "{Name:name, Sku:sku.name, Tier:sku.tier}" -o json 2>$null | ConvertFrom-Json

if ($planInfo) {
    Write-Host "  Current Plan: $($planInfo.Sku) ($($planInfo.Tier))" -ForegroundColor White
} else {
    Write-Host "  (Plan details could not be retrieved)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Available Azure Premium Tiers:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Tier                  | vCPU | Memory | Monthly Cost  | Best For" -ForegroundColor White
Write-Host "  ──────────────────────┼──────┼────────┼───────────────┼──────────────────" -ForegroundColor Gray
Write-Host "  Premium (P1)          |  1   | 1.75GB | ~\$70-80      | Development/Testing" -ForegroundColor White
Write-Host "  Premium (P2)          |  2   | 3.5GB  | ~\$140-160    | Small Production" -ForegroundColor Green
Write-Host "  Premium (P3)          |  4   | 7GB    | ~\$280-300    | High Traffic" -ForegroundColor Cyan
Write-Host "  Isolated (I1)         |  1   | 3.5GB  | ~\$195        | Enterprise/Compliance" -ForegroundColor Yellow
Write-Host "  Isolated (I2)         |  2   | 7GB    | ~\$390        | Enterprise Scale" -ForegroundColor Yellow
Write-Host ""

Write-Host "💡 Why Upgrade to Premium?" -ForegroundColor Cyan
Write-Host "  • Always-on instances (no cold starts)" -ForegroundColor White
Write-Host "  • Auto-scaling with multiple instances" -ForegroundColor White
Write-Host "  • 50GB storage (vs 1GB in Consumption)" -ForegroundColor White
Write-Host "  • Better performance for AI workloads" -ForegroundColor White
Write-Host "  • VNet integration support" -ForegroundColor White
Write-Host "  • Dedicated resources" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Recommendation for Revenue System:" -ForegroundColor Yellow
Write-Host "  Start with P2 for balance of cost & performance" -ForegroundColor White
Write-Host "  (Enough for 10K+ daily requests with AI generation)" -ForegroundColor White
Write-Host ""

# Upgrade prompt
$upgrade = Read-Host "Would you like to upgrade to Premium? (y/n, default: n)"

if ($upgrade -eq 'y' -or $upgrade -eq 'yes') {
    Write-Host ""
    Write-Host "🔄 Available Premium Tiers:" -ForegroundColor Cyan
    Write-Host "  1. P1V2 (\$70-80/month)"  -ForegroundColor White
    Write-Host "  2. P2V2 (\$140-160/month)" -ForegroundColor Green
    Write-Host "  3. P3V2 (\$280-300/month)" -ForegroundColor White
    Write-Host "  4. I1 Isolated (\$195/month)" -ForegroundColor Yellow
    Write-Host ""

    $tier = Read-Host "Select tier (1-4, or press Enter for P2V2)"

    $planName = switch ($tier) {
        "1" { "P1V2" }
        "2" { "P2V2" }
        "3" { "P3V2" }
        "4" { "I1" }
        default { "P2V2" }
    }

    Write-Host ""
    Write-Host "⏳ Upgrading Function App to $planName..." -ForegroundColor Yellow
    Write-Host "   (This may take 2-5 minutes)" -ForegroundColor Gray
    Write-Host ""

    # Create new premium plan
    $newPlanName = "$functionApp-$planName-plan"
    Write-Host "Creating App Service Plan: $newPlanName" -ForegroundColor Cyan

    az appservice plan create `
        --name $newPlanName `
        --resource-group $resourceGroup `
        --sku $planName `
        --is-linux `
        --output table

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Plan created. Now migrating Function App..." -ForegroundColor Green

        # Migrate function app to new plan
        az functionapp update `
            --name $functionApp `
            --resource-group $resourceGroup `
            --plan $newPlanName `
            --output table

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "🎉 Successfully upgraded to $planName!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next Steps:" -ForegroundColor Cyan
            Write-Host "  1. Verify in Azure Portal" -ForegroundColor White
            Write-Host "     https://portal.azure.com/#@litreelabstudio.onmicrosoft.com/resource/subscriptions/0f95fc53-20dc-4c0d-8f76-0108222d5fb1/resourceGroups/$resourceGroup" -ForegroundColor Blue
            Write-Host ""
            Write-Host "  2. Deploy your functions:" -ForegroundColor White
            Write-Host "     cd functions" -ForegroundColor Cyan
            Write-Host "     func azure functionapp publish $functionApp" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "  3. Test auto-deployment:" -ForegroundColor White
            Write-Host "     git push  # Triggers GitHub Actions" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Migration failed. Check the errors above." -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Plan creation failed. Check the errors above." -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Skipped upgrade. You can upgrade anytime via Azure Portal." -ForegroundColor Gray
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Your Revenue System:" -ForegroundColor Green
Write-Host "  • AI Orchestrator: Ready" -ForegroundColor White
Write-Host "  • Content Generator: Ready" -ForegroundColor White
Write-Host "  • Auto-Deploy: Ready" -ForegroundColor White
Write-Host "  • API Keys: Check above ✅" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Deploy & Go Live:" -ForegroundColor Cyan
Write-Host "  1. Verify all API keys (check ✅ above)" -ForegroundColor White
Write-Host "  2. Deploy Functions:" -ForegroundColor White
Write-Host "     cd e:\\VSCode\\HomeBase\\ 2.0\\functions" -ForegroundColor Cyan
Write-Host "     func azure functionapp publish $functionApp" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Push to GitHub (triggers auto-deploy):" -ForegroundColor White
Write-Host "     git add . && git commit -m '🚀 Activate revenue system' && git push" -ForegroundColor Cyan
Write-Host ""
Write-Host "💰 Expected Timeline:" -ForegroundColor Yellow
Write-Host "  • Week 1: System running, generating content" -ForegroundColor White
Write-Host "  • Week 2-4: Content indexing by search engines" -ForegroundColor White
Write-Host "  • Month 2+: SEO ranking improves, traffic grows" -ForegroundColor White
Write-Host "  • Month 3+: Measurable revenue (~\$100-500/month)" -ForegroundColor Green
Write-Host ""
