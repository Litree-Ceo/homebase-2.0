# ═══════════════════════════════════════════════════════════════════════════
# 🔐 MCP Environment Variables Setup Script
# ═══════════════════════════════════════════════════════════════════════════
# This script sets up all required environment variables for MCP bots
# Run this BEFORE starting VS Code to ensure all bots work properly
# ═══════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔐 SETTING UP MCP ENVIRONMENT VARIABLES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. Load .env.local file
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "📁 Step 1: Loading .env.local file..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
  Get-Content ".env.local" | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim()
      [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
  Write-Host "  ✅ Loaded environment variables from .env.local" -ForegroundColor Green
}
else {
  Write-Host "  ⚠️  .env.local not found" -ForegroundColor Yellow
}
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. Set MCP-Specific Environment Variables
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🔧 Step 2: Setting MCP-specific variables..." -ForegroundColor Yellow

# Azure MCP
$AzureSubId = $env:AZURE_SUBSCRIPTION_ID
if (-not $AzureSubId) {
  Write-Host "  ⚠️  AZURE_SUBSCRIPTION_ID not set" -ForegroundColor Yellow
  Write-Host "     Get it from: https://portal.azure.com" -ForegroundColor Gray
  Write-Host "     Set with: `$env:AZURE_SUBSCRIPTION_ID='your-sub-id'" -ForegroundColor Gray
}
else {
  Write-Host "  ✅ Azure Subscription ID: $($AzureSubId.Substring(0,8))..." -ForegroundColor Green
}

# GitHub MCP
$GitHubToken = $env:GITHUB_TOKEN
if (-not $GitHubToken) {
  Write-Host "  ⚠️  GITHUB_TOKEN not set" -ForegroundColor Yellow
  Write-Host "     Get it from: https://github.com/settings/tokens" -ForegroundColor Gray
  Write-Host "     Set with: `$env:GITHUB_TOKEN='ghp_your_token'" -ForegroundColor Gray
}
else {
  Write-Host "  ✅ GitHub Token: $($GitHubToken.Substring(0,8))..." -ForegroundColor Green
}

# Codacy MCP
$CodacyToken = $env:CODACY_API_TOKEN
if (-not $CodacyToken) {
  Write-Host "  ⚠️  CODACY_API_TOKEN not set" -ForegroundColor Yellow
  Write-Host "     Get it from: https://app.codacy.com/account/api-tokens" -ForegroundColor Gray
  Write-Host "     Set with: `$env:CODACY_API_TOKEN='your_token'" -ForegroundColor Gray
}
else {
  Write-Host "  ✅ Codacy Token: $($CodacyToken.Substring(0,8))..." -ForegroundColor Green
}

# Postman MCP
$PostmanKey = $env:POSTMAN_API_KEY
if (-not $PostmanKey) {
  Write-Host "  ⚠️  POSTMAN_API_KEY not set" -ForegroundColor Yellow
  Write-Host "     Get it from: https://postman.co/settings/me/api-keys" -ForegroundColor Gray
  Write-Host "     Set with: `$env:POSTMAN_API_KEY='PMAK-your_key'" -ForegroundColor Gray
}
else {
  Write-Host "  ✅ Postman API Key: $($PostmanKey.Substring(0,8))..." -ForegroundColor Green
}

# Brave Search MCP
$BraveKey = $env:BRAVE_API_KEY
if (-not $BraveKey) {
  Write-Host "  ⚠️  BRAVE_API_KEY not set (optional)" -ForegroundColor Yellow
  Write-Host "     Get it from: https://brave.com/search/api/" -ForegroundColor Gray
  Write-Host "     Set with: `$env:BRAVE_API_KEY='BSA_your_key'" -ForegroundColor Gray
}
else {
  Write-Host "  ✅ Brave API Key: $($BraveKey.Substring(0,8))..." -ForegroundColor Green
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. Summary & Next Steps
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 ENVIRONMENT STATUS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$RequiredVars = @(
  @{Name = "AZURE_SUBSCRIPTION_ID"; Required = $true; For = "Azure MCP" },
  @{Name = "GITHUB_TOKEN"; Required = $true; For = "GitHub MCP" },
  @{Name = "CODACY_API_TOKEN"; Required = $true; For = "Codacy MCP" },
  @{Name = "POSTMAN_API_KEY"; Required = $false; For = "Postman MCP" },
  @{Name = "BRAVE_API_KEY"; Required = $false; For = "Web Search MCP" }
)

$AllSet = $true
foreach ($Var in $RequiredVars) {
  $Value = [System.Environment]::GetEnvironmentVariable($Var.Name)
  if ($Value) {
    Write-Host "  ✅ $($Var.Name) - $($Var.For)" -ForegroundColor Green
  }
  elseif ($Var.Required) {
    Write-Host "  ❌ $($Var.Name) - $($Var.For) [REQUIRED]" -ForegroundColor Red
    $AllSet = $false
  }
  else {
    Write-Host "  ⚠️  $($Var.Name) - $($Var.For) [OPTIONAL]" -ForegroundColor Yellow
  }
}

Write-Host ""

if ($AllSet) {
  Write-Host "🎉 All required environment variables are set!" -ForegroundColor Green
  Write-Host ""
  Write-Host "💡 Next Steps:" -ForegroundColor Cyan
  Write-Host "   1. Restart VS Code (Ctrl+Shift+P → 'Reload Window')" -ForegroundColor White
  Write-Host "   2. Open GitHub Copilot Chat" -ForegroundColor White
  Write-Host "   3. MCP bots will activate automatically!" -ForegroundColor White
}
else {
  Write-Host "⚠️  Some required environment variables are missing!" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "📝 To set them permanently:" -ForegroundColor Cyan
  Write-Host "   1. Add them to your .env.local file, OR" -ForegroundColor White
  Write-Host "   2. Set them in Windows System Environment Variables" -ForegroundColor White
  Write-Host "   3. Run this script again to verify" -ForegroundColor White
}

Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. Optional: Open VS Code with environment
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write-Host "🚀 Launch VS Code with MCP environment?" -ForegroundColor Cyan
Write-Host "   Press ENTER to launch VS Code, or Ctrl+C to exit" -ForegroundColor Gray
$null = Read-Host

Write-Host "🚀 Launching VS Code with MCP environment..." -ForegroundColor Green
code .

Write-Host "✅ Done! VS Code is starting with all MCP bots enabled." -ForegroundColor Green
Write-Host ""
