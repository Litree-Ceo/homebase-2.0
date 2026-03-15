#!/usr/bin/env pwsh
# 🤖 Gemini CLI Powered Deployment Script
# Automates Firebase deployment with AI assistance

param(
    [string]$ProjectId = "studio-6082148059-d1fec",
    [string]$SiteName = "homebase-web",
    [switch]$SkipBuild = $false,
    [switch]$UseCloudShell = $false
)

$ErrorActionPreference = "Stop"

# Colors
$Green = "`e[32m"
$Yellow = "`e[33m"
$Cyan = "`e[36m"
$Red = "`e[31m"
$Reset = "`e[0m"

function Write-Color($Color, $Message) {
    Write-Host "$Color$Message$Reset"
}

function Check-Command($Command) {
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Banner
Write-Color $Cyan @"
╔══════════════════════════════════════════════════════════════╗
║     🤖 Gemini CLI + Firebase Deployment Automation           ║
║     Project: $ProjectId                                       ║
╚══════════════════════════════════════════════════════════════╝
"@

# Step 1: Check prerequisites
Write-Color $Yellow "`n📋 Step 1: Checking prerequisites..."

$tools = @{
    "firebase" = "Firebase CLI"
    "node" = "Node.js"
    "pnpm" = "pnpm"
    "gemini" = "Gemini CLI"
}

$missing = @()
foreach ($tool in $tools.Keys) {
    if (Check-Command $tool) {
        $version = & $tool --version 2>$null | Select-Object -First 1
        Write-Color $Green "  ✅ $($tools[$tool]): $version"
    } else {
        Write-Color $Red "  ❌ $($tools[$tool]) not found"
        $missing += $tool
    }
}

if ($missing.Count -gt 0) {
    Write-Color $Yellow "`n📦 Installing missing tools..."
    if ($missing -contains "pnpm") {
        npm install -g pnpm
    }
    if ($missing -contains "firebase") {
        npm install -g firebase-tools
    }
    if ($missing -contains "gemini") {
        npm install -g @google/gemini-cli
    }
}

# Step 2: Configure Gemini
Write-Color $Yellow "`n🔧 Step 2: Configuring Gemini CLI..."
$geminiConfig = @"
{
  "defaultProject": "$ProjectId",
  "preferredRegion": "us-central1",
  "firebase": {
    "projectId": "$ProjectId",
    "hosting": {
      "site": "$SiteName"
    }
  }
}
"@

$geminiConfigDir = "$env:USERPROFILE\.gemini"
if (!(Test-Path $geminiConfigDir)) {
    New-Item -ItemType Directory -Path $geminiConfigDir -Force | Out-Null
}
$geminiConfig | Out-File "$geminiConfigDir\config.json" -Encoding UTF8
Write-Color $Green "  ✅ Gemini config created"

# Step 3: Set Firebase project
Write-Color $Yellow "`n🔥 Step 3: Setting Firebase project..."
firebase use $ProjectId 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Color $Green "  ✅ Firebase project set: $ProjectId"
} else {
    Write-Color $Yellow "  ⚠️  Running firebase login..."
    firebase login
    firebase use $ProjectId
}

# Step 4: Install dependencies
Write-Color $Yellow "`n📦 Step 4: Installing dependencies..."
cd "$PSScriptRoot\github"
if (!(Test-Path "node_modules")) {
    pnpm install
    Write-Color $Green "  ✅ Dependencies installed"
} else {
    Write-Color $Green "  ✅ Dependencies already present"
}

# Step 5: Build
if (!$SkipBuild) {
    Write-Color $Yellow "`n🔨 Step 5: Building project..."
    pnpm build:web
    if ($LASTEXITCODE -eq 0) {
        Write-Color $Green "  ✅ Build successful"
    } else {
        Write-Color $Red "  ❌ Build failed"
        exit 1
    }
} else {
    Write-Color $Yellow "  ⏭️  Skipping build (use -SkipBuild:$false to build)"
}

# Step 6: Deploy with Gemini insights
Write-Color $Yellow "`n🚀 Step 6: Deploying to Firebase..."

# Pre-deployment checks with Gemini
Write-Color $Cyan "  🤖 Running Gemini pre-deployment checks..."

# Get deployment insights
$deployInsights = gemini ask "Analyze this Firebase deployment config for project $ProjectId and provide a checklist: 
- Hosting site: $SiteName
- Build output: apps/web/.next
- API routes: Yes (12 routes)

Provide a concise 5-point deployment readiness checklist." 2>$null

if ($deployInsights) {
    Write-Color $Cyan "  💡 Gemini Insights:"
    $deployInsights -split "`n" | ForEach-Object { Write-Host "     $_" }
}

# Actual deployment
Write-Color $Yellow "  📤 Uploading to Firebase..."
firebase deploy --only hosting:$SiteName --project $ProjectId

if ($LASTEXITCODE -eq 0) {
    Write-Color $Green "`n✅ Deployment successful!"
    Write-Color $Cyan "`n🌐 Your site is live at:"
    Write-Color $Cyan "   https://$ProjectId.web.app"
    Write-Color $Cyan "   https://$ProjectId.firebaseapp.com"
    
    # Post-deployment summary with Gemini
    Write-Color $Yellow "`n📊 Deployment Summary:"
    $summary = @"
    Project: $ProjectId
    Site: $SiteName
    Time: $(Get-Date)
    Status: ✅ LIVE
"@
    Write-Host $summary
    
} else {
    Write-Color $Red "`n❌ Deployment failed"
    Write-Color $Yellow "🤖 Running Gemini diagnostics..."
    
    # Get troubleshooting help
    $troubleshooting = gemini ask "Firebase deployment failed for project $ProjectId. Provide 3 common fixes for Firebase hosting deployment failures." 2>$null
    if ($troubleshooting) {
        Write-Color $Cyan "  💡 Gemini Suggestions:"
        Write-Host $troubleshooting
    }
    exit 1
}

Write-Color $Green "`n🎉 All done! Your Homebase 2.0 is deployed and ready!"
