#!/usr/bin/env pwsh
# =============================================================================
# LitreeLabs TypeScript + Next.js Quick Start Script
# =============================================================================
# Purpose: Automate initial project setup
# Usage: .\QUICKSTART.ps1
# Status: Run this FIRST before manual development
# =============================================================================

Write-Host "🚀 LitreeLabs TypeScript + Next.js Quick Start" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Colors for output
$success = "Green"
$error = "Red"
$warning = "Yellow"
$info = "Cyan"

# =============================================================================
# Step 1: Check Prerequisites
# =============================================================================
Write-Host "📋 Step 1: Checking Prerequisites..." -ForegroundColor $info

# Check Node.js
Write-Host "  Checking Node.js..." -NoNewline
$nodeVersion = node -v 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✓ $nodeVersion" -ForegroundColor $success
} else {
    Write-Host " ✗ Node.js not found" -ForegroundColor $error
    Write-Host "  Install Node.js from https://nodejs.org/" -ForegroundColor $warning
    exit 1
}

# Check npm
Write-Host "  Checking npm..." -NoNewline
$npmVersion = npm -v 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✓ $npmVersion" -ForegroundColor $success
} else {
    Write-Host " ✗ npm not found" -ForegroundColor $error
    exit 1
}

Write-Host ""

# =============================================================================
# Step 2: Install Dependencies
# =============================================================================
Write-Host "📦 Step 2: Installing Dependencies..." -ForegroundColor $info

if (Test-Path "node_modules" -PathType Container) {
    Write-Host "  Dependencies already installed (node_modules found)" -ForegroundColor $warning
    Write-Host "  To reinstall, delete node_modules and run again" -ForegroundColor $warning
} else {
    Write-Host "  Running: npm install" -ForegroundColor $info
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ npm install failed" -ForegroundColor $error
        exit 1
    }
    Write-Host "  ✓ Dependencies installed" -ForegroundColor $success
}

Write-Host ""

# =============================================================================
# Step 3: Install Required Packages
# =============================================================================
Write-Host "📚 Step 3: Installing Required Packages..." -ForegroundColor $info

$requiredPackages = @(
    "firebase",
    "stripe",
    "openai",
    "class-variance-authority",
    "clsx",
    "tailwind-merge"
)

foreach ($package in $requiredPackages) {
    Write-Host "  Checking $package..." -NoNewline
    if (Test-Path "node_modules/$package" -PathType Container) {
        Write-Host " ✓ already installed" -ForegroundColor $success
    } else {
        Write-Host " installing..." -ForegroundColor $warning
        npm install $package --save
        if ($LASTEXITCODE -ne 0) {
            Write-Host "    ✗ Failed to install $package" -ForegroundColor $error
            exit 1
        }
        Write-Host "    ✓ installed" -ForegroundColor $success
    }
}

Write-Host ""

# =============================================================================
# Step 4: Create Environment File
# =============================================================================
Write-Host "🔐 Step 4: Creating Environment File..." -ForegroundColor $info

if (Test-Path ".env.local" -PathType Leaf) {
    Write-Host "  .env.local already exists" -ForegroundColor $warning
    Write-Host "  Skipping environment file creation" -ForegroundColor $warning
    Write-Host "  To reset: delete .env.local and run again" -ForegroundColor $warning
} else {
    if (Test-Path ".env.example" -PathType Leaf) {
        Copy-Item ".env.example" ".env.local"
        Write-Host "  ✓ Created .env.local from .env.example" -ForegroundColor $success
        Write-Host "  ⚠️  You must fill in the environment variables!" -ForegroundColor $warning
        Write-Host ""
        Write-Host "  Required environment variables:" -ForegroundColor $info
        Write-Host "  • NEXT_PUBLIC_FIREBASE_API_KEY" -ForegroundColor $info
        Write-Host "  • NEXT_PUBLIC_FIREBASE_PROJECT_ID" -ForegroundColor $info
        Write-Host "  • FIREBASE_ADMIN_SDK_KEY" -ForegroundColor $info
        Write-Host "  • STRIPE_SECRET_KEY" -ForegroundColor $info
        Write-Host "  • NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" -ForegroundColor $info
        Write-Host "  • OPENAI_API_KEY" -ForegroundColor $info
    } else {
        Write-Host "  ⚠️  .env.example not found" -ForegroundColor $warning
        Write-Host "  Create .env.local manually with required variables" -ForegroundColor $warning
    }
}

Write-Host ""

# =============================================================================
# Step 5: Verify File Structure
# =============================================================================
Write-Host "📁 Step 5: Verifying File Structure..." -ForegroundColor $info

$requiredDirs = @(
    "app",
    "components",
    "config",
    "lib",
    "types",
    "public",
    "styles"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir -PathType Container) {
        Write-Host "  ✓ $dir/" -ForegroundColor $success
    } else {
        Write-Host "  ✗ $dir/ missing - creating..." -ForegroundColor $warning
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "    ✓ created" -ForegroundColor $success
    }
}

# Check key files
$requiredFiles = @(
    "package.json",
    "tsconfig.json",
    "types/world.ts",
    "types/user.ts",
    "config/subscriptions.ts",
    "lib/db.ts",
    "lib/payments.ts"
)

Write-Host ""
Write-Host "  Checking key files..." -ForegroundColor $info
foreach ($file in $requiredFiles) {
    if (Test-Path $file -PathType Leaf) {
        Write-Host "    ✓ $file" -ForegroundColor $success
    } else {
        Write-Host "    ⚠️  $file missing - you may need to create it" -ForegroundColor $warning
    }
}

Write-Host ""

# =============================================================================
# Step 6: TypeScript Check
# =============================================================================
Write-Host "✅ Step 6: TypeScript Check..." -ForegroundColor $info

Write-Host "  Running: npx tsc --noEmit" -ForegroundColor $info
npx tsc --noEmit 2>&1 | Select-Object -First 5
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ TypeScript check passed" -ForegroundColor $success
} else {
    Write-Host "  ⚠️  TypeScript errors found (see above)" -ForegroundColor $warning
    Write-Host "  This is normal during development - check after adding components" -ForegroundColor $warning
}

Write-Host ""

# =============================================================================
# Step 7: Display Next Steps
# =============================================================================
Write-Host "🎯 Next Steps:" -ForegroundColor $info
Write-Host ""
Write-Host "1️⃣  FILL IN ENVIRONMENT VARIABLES" -ForegroundColor $warning
Write-Host "   • Open .env.local" -ForegroundColor $info
Write-Host "   • Add your Firebase credentials" -ForegroundColor $info
Write-Host "   • Add your Stripe keys" -ForegroundColor $info
Write-Host "   • Add your OpenAI API key" -ForegroundColor $info
Write-Host ""

Write-Host "2️⃣  START DEVELOPMENT SERVER" -ForegroundColor $warning
Write-Host "   • Run: npm run dev" -ForegroundColor $info
Write-Host "   • Open: http://localhost:3000" -ForegroundColor $info
Write-Host ""

Write-Host "3️⃣  BUILD FIRST COMPONENT" -ForegroundColor $warning
Write-Host "   • Create: components/auth/LoginForm.tsx" -ForegroundColor $info
Write-Host "   • Reference: IMPLEMENTATION_CHECKLIST.md" -ForegroundColor $info
Write-Host "   • Phase 1 has detailed requirements" -ForegroundColor $info
Write-Host ""

Write-Host "4️⃣  DOCUMENTATION" -ForegroundColor $warning
Write-Host "   • Architecture: ARCHITECTURE_TYPESCRIPT_NEXTJS.md" -ForegroundColor $info
Write-Host "   • Checklist: IMPLEMENTATION_CHECKLIST.md" -ForegroundColor $info
Write-Host "   • Type Reference: types/*.ts files" -ForegroundColor $info
Write-Host ""

Write-Host "5️⃣  DEPLOYMENT" -ForegroundColor $warning
Write-Host "   • Build: npm run build" -ForegroundColor $info
Write-Host "   • Deploy: firebase deploy" -ForegroundColor $info
Write-Host ""

# =============================================================================
# Step 8: Show Project Summary
# =============================================================================
Write-Host "📊 Project Summary:" -ForegroundColor $info
Write-Host ""
Write-Host "  Platform: LitreeLabs - AI-Powered Creative Worlds" -ForegroundColor $success
Write-Host "  Stack: Next.js 14+ + TypeScript + Firebase" -ForegroundColor $success
Write-Host "  Payments: Stripe + Coinbase + On-Chain" -ForegroundColor $success
Write-Host "  AI: OpenAI GPT-4o-mini (5 personas)" -ForegroundColor $success
Write-Host ""
Write-Host "  Features to Build:" -ForegroundColor $info
Write-Host "    • Authentication (email/password)" -ForegroundColor $info
Write-Host "    • World Creation & Editor" -ForegroundColor $info
Write-Host "    • 8 Widgets (clock, money bot, chat, etc.)" -ForegroundColor $info
Write-Host "    • Theme System (6 presets + mixer)" -ForegroundColor $info
Write-Host "    • Subscriptions (4 tiers)" -ForegroundColor $info
Write-Host "    • Marketplace (buy/sell items)" -ForegroundColor $info
Write-Host "    • Real-time Presence & Chat" -ForegroundColor $info
Write-Host "    • AI Chat with Multi-Persona Support" -ForegroundColor $info
Write-Host ""

# =============================================================================
# Step 9: Helpful Commands
# =============================================================================
Write-Host "💡 Useful Commands:" -ForegroundColor $info
Write-Host ""
Write-Host "  Development:" -ForegroundColor $warning
Write-Host "    npm run dev              Start development server" -ForegroundColor $info
Write-Host "    npm run build            Build for production" -ForegroundColor $info
Write-Host "    npm run lint             Run ESLint" -ForegroundColor $info
Write-Host ""
Write-Host "  Firebase:" -ForegroundColor $warning
Write-Host "    firebase login           Login to Firebase" -ForegroundColor $info
Write-Host "    firebase init            Initialize Firebase project" -ForegroundColor $info
Write-Host "    firebase deploy          Deploy to Firebase Hosting" -ForegroundColor $info
Write-Host ""
Write-Host "  Database:" -ForegroundColor $warning
Write-Host "    firebase emulators:start Start local emulators" -ForegroundColor $info
Write-Host ""

# =============================================================================
# Final Message
# =============================================================================
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor $success
Write-Host ""
Write-Host "Your project is ready for development!" -ForegroundColor $success
Write-Host ""
Write-Host "📖 Read ARCHITECTURE_TYPESCRIPT_NEXTJS.md for full details" -ForegroundColor $info
Write-Host "📋 Check IMPLEMENTATION_CHECKLIST.md for what to build next" -ForegroundColor $info
Write-Host ""
Write-Host "Good luck! 🚀" -ForegroundColor $success
Write-Host ""
