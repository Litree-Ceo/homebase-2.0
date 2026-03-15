# 🔐 API Keys Setup Script
# This script helps you set up all required API keys for the AI system

Write-Host "🤖 HomeBase AI - API Keys Setup" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Check if logged into Azure
$azAccount = az account show 2>$null
if (-not $azAccount) {
    Write-Host "❌ Not logged into Azure. Running 'az login'..." -ForegroundColor Yellow
    az login
}

$vaultName = "kvprodlitree14210"
Write-Host "✅ Using Key Vault: $vaultName" -ForegroundColor Green
Write-Host ""

# Function to securely prompt for API key
function Get-SecureApiKey {
    param([string]$KeyName, [string]$Description, [string]$GetUrl)

    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "🔑 $KeyName" -ForegroundColor Cyan
    Write-Host "   $Description" -ForegroundColor Gray
    if ($GetUrl) {
        Write-Host "   Get it from: $GetUrl" -ForegroundColor Yellow
    }
    Write-Host ""

    $key = Read-Host "   Paste your $KeyName (or press Enter to skip)"
    return $key
}

# Check existing secrets
Write-Host "📋 Current secrets in vault:" -ForegroundColor Cyan
az keyvault secret list --vault-name $vaultName --query "[].name" -o table
Write-Host ""

# 1. GROK API KEY
$grokKey = Get-SecureApiKey `
    -KeyName "GROK-API-KEY" `
    -Description "xAI Grok API for fast reasoning & chat" `
    -GetUrl "https://console.x.ai/team/api-keys"

if ($grokKey -and $grokKey -ne "") {
    Write-Host "   Setting GROK-API-KEY..." -ForegroundColor Yellow
    az keyvault secret set --vault-name $vaultName --name "GROK-API-KEY" --value $grokKey --output none
    Write-Host "   ✅ GROK-API-KEY set successfully" -ForegroundColor Green
} else {
    Write-Host "   ⏭️  Skipped GROK-API-KEY" -ForegroundColor Gray
}
Write-Host ""

# 2. ANTHROPIC API KEY (Claude)
$claudeKey = Get-SecureApiKey `
    -KeyName "ANTHROPIC-API-KEY" `
    -Description "Anthropic Claude for complex reasoning & code" `
    -GetUrl "https://console.anthropic.com/settings/keys"

if ($claudeKey -and $claudeKey -ne "") {
    Write-Host "   Setting ANTHROPIC-API-KEY..." -ForegroundColor Yellow
    az keyvault secret set --vault-name $vaultName --name "ANTHROPIC-API-KEY" --value $claudeKey --output none
    Write-Host "   ✅ ANTHROPIC-API-KEY set successfully" -ForegroundColor Green
} else {
    Write-Host "   ⏭️  Skipped ANTHROPIC-API-KEY" -ForegroundColor Gray
}
Write-Host ""

# 3. GITHUB TOKEN (for Llama 3.3 via GitHub Models & auto-deploy)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🔑 GITHUB-TOKEN" -ForegroundColor Cyan
Write-Host "   Used for:" -ForegroundColor Gray
Write-Host "   • Llama 3.3 70B via GitHub Models API" -ForegroundColor Gray
Write-Host "   • Auto-commit generated content" -ForegroundColor Gray
Write-Host "   Get it from: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host "   Scopes needed: repo, workflow" -ForegroundColor Yellow
Write-Host ""

# Check if GitHub PAT exists in docs
$existingPat = Select-String -Path "e:\VSCode\HomeBase 2.0\COMPLETE_FIX_SUMMARY.md" -Pattern "ghp_\w+" -AllMatches | Select-Object -First 1
if ($existingPat) {
    $foundPat = $existingPat.Matches[0].Value
    Write-Host "   ℹ️  Found existing PAT in docs: $($foundPat.Substring(0,7))..." -ForegroundColor Yellow
    $useExisting = Read-Host "   Use this token? (y/n)"
    if ($useExisting -eq 'y') {
        $githubToken = $foundPat
    }
}

if (-not $githubToken) {
    $githubToken = Read-Host "   Paste your GitHub token (or press Enter to skip)"
}

if ($githubToken -and $githubToken -ne "") {
    Write-Host "   Setting GITHUB-TOKEN..." -ForegroundColor Yellow
    az keyvault secret set --vault-name $vaultName --name "GITHUB-TOKEN" --value $githubToken --output none
    Write-Host "   ✅ GITHUB-TOKEN set successfully" -ForegroundColor Green

    # Also set as GitHub Actions secret (optional)
    Write-Host ""
    Write-Host "   📝 To enable auto-deploy, also add to GitHub Actions:" -ForegroundColor Yellow
    Write-Host "   https://github.com/LiTree89/HomeBase-2.0/settings/secrets/actions" -ForegroundColor Cyan
} else {
    Write-Host "   ⏭️  Skipped GITHUB-TOKEN" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📊 Setup Summary" -ForegroundColor Cyan
Write-Host ""
Write-Host "Current secrets in vault:" -ForegroundColor White
az keyvault secret list --vault-name $vaultName --query "[].{Name:name, Updated:attributes.updated}" -o table
Write-Host ""

Write-Host "✅ Next Steps:" -ForegroundColor Green
Write-Host "1. Configure Azure Function App to use these keys:" -ForegroundColor White
Write-Host "   ./scripts/configure-function-secrets.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Test content generation locally:" -ForegroundColor White
Write-Host "   node scripts/generate-content.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Deploy functions:" -ForegroundColor White
Write-Host "   cd functions && func azure functionapp publish litlabs-func-app-prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Add GitHub Actions secrets:" -ForegroundColor White
Write-Host "   https://github.com/LiTree89/HomeBase-2.0/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""

Write-Host "💰 Revenue System Ready!" -ForegroundColor Green
Write-Host "Your AI bots will start generating content automatically." -ForegroundColor White
