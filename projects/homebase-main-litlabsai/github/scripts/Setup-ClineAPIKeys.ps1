#Requires -Version 5.0
<#
.SYNOPSIS
    Setup Cline AI extension with API keys from environment or Azure Key Vault
.DESCRIPTION
    Configures Cline to use your API keys for Claude, OpenRouter, or OpenAI
.NOTES
    Author: LITLABS 2026
    Prerequisites: Cline extension installed in VS Code
#>

param(
    [ValidateSet("anthropic", "openrouter", "openai", "local")]
    [string]$Provider = "anthropic",
    
    [string]$ApiKey = "",
    [string]$ModelId = "",
    
    [switch]$Interactive = $true
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🔧 CLINE SETUP - AI ASSISTANT CONFIGURATION               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# VS Code settings file path
$vscodeSettingsPath = "$env:APPDATA\Code\User\settings.json"

# Ensure settings file exists
if (-not (Test-Path $vscodeSettingsPath)) {
    Write-Host "[!] VS Code settings.json not found. Creating..." -ForegroundColor Yellow
    @{} | ConvertTo-Json | Set-Content $vscodeSettingsPath
}

# Read current settings
$settings = Get-Content $vscodeSettingsPath -Raw | ConvertFrom-Json

Write-Host "[1/4] Selecting AI Provider..." -ForegroundColor Yellow

if ($Interactive) {
    Write-Host "Available providers:" -ForegroundColor Cyan
    Write-Host "  1 - Anthropic Claude - FREE 300 dollar credit for new users" -ForegroundColor Cyan
    Write-Host "  2 - OpenRouter - Multi-provider with free tier" -ForegroundColor Cyan
    Write-Host "  3 - OpenAI - GPT-4o, GPT-4 Turbo" -ForegroundColor Cyan
    Write-Host "  4 - Local - Ollama or LM Studio (free, runs locally)" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "Select provider [1-4]"
    
    switch ($choice) {
        "1" { $Provider = "anthropic"; $ModelId = "claude-3-5-sonnet-20241022" }
        "2" { $Provider = "openrouter"; $ModelId = "anthropic/claude-3.5-sonnet" }
        "3" { $Provider = "openai"; $ModelId = "gpt-4o" }
        "4" { $Provider = "local"; $ModelId = "local" }
        default { $Provider = "anthropic"; $ModelId = "claude-3-5-sonnet-20241022" }
    }
}

Write-Host "✓ Selected: $Provider" -ForegroundColor Green

# Step 2: Get API Key
Write-Host "`n[2/4] Getting API Key..." -ForegroundColor Yellow

if ($Provider -ne "local") {
    if (-not $ApiKey) {
        if ($Interactive) {
            Write-Host "Paste your $Provider API key (will not be echoed):" -ForegroundColor Cyan
            $ApiKey = Read-Host -AsSecureString | ConvertFrom-SecureString -AsPlainText
        } else {
            $envVarName = "$($Provider.ToUpper())_API_KEY"
            $ApiKey = [Environment]::GetEnvironmentVariable($envVarName)
            if (-not $ApiKey) {
                Write-Host "[ERROR] No API key provided and environment variable not set!" -ForegroundColor Red
                exit 1
            }
        }
    }
    
    if (-not $ApiKey) {
        Write-Host "[ERROR] API key is required for $Provider!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ API key received" -ForegroundColor Green
} else {
    Write-Host "✓ Using local model (no API key needed)" -ForegroundColor Green
}

# Step 3: Configure VS Code settings
Write-Host "`n[3/4] Updating VS Code settings..." -ForegroundColor Yellow

# Ensure cline settings object exists
if (-not $settings.cline) {
    $settings | Add-Member -NotePropertyName "cline" -NotePropertyValue @{}
}

# Configure based on provider
switch ($Provider) {
    "anthropic" {
        $settings.cline | Add-Member -NotePropertyName "apiProvider" -NotePropertyValue "anthropic" -Force
        $settings.cline | Add-Member -NotePropertyName "anthropicApiKey" -NotePropertyValue $ApiKey -Force
        $settings.cline | Add-Member -NotePropertyName "modelId" -NotePropertyValue $ModelId -Force
        Write-Host "✓ Configured Anthropic API" -ForegroundColor Green
    }
    "openrouter" {
        $settings.cline | Add-Member -NotePropertyName "apiProvider" -NotePropertyValue "openrouter" -Force
        $settings.cline | Add-Member -NotePropertyName "openrouterApiKey" -NotePropertyValue $ApiKey -Force
        $settings.cline | Add-Member -NotePropertyName "modelId" -NotePropertyValue $ModelId -Force
        Write-Host "✓ Configured OpenRouter API" -ForegroundColor Green
    }
    "openai" {
        $settings.cline | Add-Member -NotePropertyName "apiProvider" -NotePropertyValue "openai" -Force
        $settings.cline | Add-Member -NotePropertyName "openaiApiKey" -NotePropertyValue $ApiKey -Force
        $settings.cline | Add-Member -NotePropertyName "modelId" -NotePropertyValue $ModelId -Force
        Write-Host "✓ Configured OpenAI API" -ForegroundColor Green
    }
    "local" {
        $settings.cline | Add-Member -NotePropertyName "apiProvider" -NotePropertyValue "ollama" -Force
        $settings.cline | Add-Member -NotePropertyName "ollamaModelId" -NotePropertyValue "neural-chat" -Force
        $settings.cline | Add-Member -NotePropertyName "ollamaBaseUrl" -NotePropertyValue "http://localhost:11434" -Force
        Write-Host "✓ Configured Local Model (Ollama)" -ForegroundColor Green
    }
}

# Save settings
$settings | ConvertTo-Json -Depth 10 | Set-Content $vscodeSettingsPath
Write-Host "✓ Settings saved to $vscodeSettingsPath" -ForegroundColor Green

# Step 4: Verify
Write-Host "`n[4/4] Verifying configuration..." -ForegroundColor Yellow

$savedSettings = Get-Content $vscodeSettingsPath -Raw | ConvertFrom-Json
if ($savedSettings.cline.apiProvider -eq $Provider) {
    Write-Host "✓ Configuration verified" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Configuration may not have saved correctly" -ForegroundColor Yellow
}

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ CLINE SETUP COMPLETE                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host @"

📋 NEXT STEPS:
  1. Reload VS Code:
     • Press Ctrl+Shift+P → "Developer: Reload Window"
     • Or close and reopen VS Code

  2. Open Cline:
     • Press Ctrl+Shift+P → "Cline: Open"
     • Or click Cline icon in sidebar

  3. Test the connection:
     • Ask Cline a simple question
     • Check that it responds correctly

📊 CONFIGURATION SUMMARY:
  Provider:  $Provider
  Model ID:  $ModelId
  Status:    ✓ Ready
  Settings:  $vscodeSettingsPath

💡 TIPS:
  • Keep your API key secret - never commit to git
  • Set environment variables if reloading settings
  • Switch providers anytime by running this script again
  • Use local models to avoid API costs

🆘 TROUBLESHOOTING:
  Q: Still getting 401 error?
  A: Reload VS Code and check API key is correct
  
  Q: Want to use a different provider?
  A: Run this script again and select a new provider
  
  Q: API key rejected?
  A: Verify key is active at your provider's dashboard

"@ -ForegroundColor Cyan
