# LitLabs AI Master Setup Script
# Simple version without special characters

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "LitLabs AI - Master Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Open Firebase Console
Write-Host "Step 1: Opening Firebase Console..." -ForegroundColor Yellow
$firebaseUrl = "https://console.firebase.google.com/u/0/project/studio-6082148059/settings/general"
Start-Process $firebaseUrl

Write-Host "`nINSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Go to your Firebase Project Settings (gear icon)" -ForegroundColor Yellow
Write-Host "2. Select 'Your Apps' section at the bottom" -ForegroundColor Yellow
Write-Host "3. Click the '</>' code icon" -ForegroundColor Yellow
Write-Host "4. Copy the entire firebaseConfig object" -ForegroundColor Yellow
Write-Host "5. Paste it below and press Enter twice" -ForegroundColor Yellow

Write-Host "`nPaste your Firebase config here (then Enter twice):" -ForegroundColor Cyan
$config = ""
$emptyLines = 0
while ($emptyLines -lt 2) {
    $line = Read-Host
    if ([string]::IsNullOrWhiteSpace($line)) {
        $emptyLines++
    } else {
        $emptyLines = 0
        $config += $line + "`n"
    }
}

# Extract Firebase values
Write-Host "`nParsing Firebase config..." -ForegroundColor Green

if ($config -match 'apiKey[`"'']?\s*:\s*[`"'']?([^`"'']+)') {
    $apiKey = $matches[1].Trim()
}
if ($config -match 'authDomain[`"'']?\s*:\s*[`"'']?([^`"'']+)') {
    $authDomain = $matches[1].Trim()
}
if ($config -match 'projectId[`"'']?\s*:\s*[`"'']?([^`"'']+)') {
    $projectId = $matches[1].Trim()
}
if ($config -match 'storageBucket[`"'']?\s*:\s*[`"'']?([^`"'']+)') {
    $storageBucket = $matches[1].Trim()
}
if ($config -match 'messagingSenderId[`"'']?\s*:\s*[`"'']?([^`"'']+)') {
    $messagingSenderId = $matches[1].Trim()
}
if ($config -match 'appId[`"'']?\s*:\s*[`"'']?([^`"'']+)') {
    $appId = $matches[1].Trim()
}

if (-not $apiKey -or -not $projectId) {
    Write-Host "ERROR: Could not parse Firebase config" -ForegroundColor Red
    Write-Host "Make sure you copied the entire config object" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Firebase config extracted!" -ForegroundColor Green
Write-Host "  Project ID: $projectId" -ForegroundColor Green
Write-Host "  Auth Domain: $authDomain" -ForegroundColor Green

# Step 2: Optional credentials
Write-Host "`nStep 2: Optional Integrations" -ForegroundColor Yellow
Write-Host "(Press Enter to skip any of these except OpenAI if you want speech/image features)`n" -ForegroundColor Yellow

$stripeKey = Read-Host "Stripe Publishable Key"
$stripeSecret = Read-Host "Stripe Secret Key"
$stripeWebhook = Read-Host "Stripe Webhook Secret"
$googleAi = Read-Host "Google AI API Key"
$openAi = Read-Host "OpenAI API Key (for Whisper, image generation, speech)"
$msClientId = Read-Host "Microsoft Client ID"
$msClientSecret = Read-Host "Microsoft Client Secret"
$msTenantId = Read-Host "Microsoft Tenant ID"

# Step 3: Create .env.local
Write-Host "`nStep 3: Creating .env.local..." -ForegroundColor Yellow

# Set defaults for optional values
if (-not $stripeKey) { $stripeKey = 'pk_test_placeholder' }
if (-not $stripeSecret) { $stripeSecret = 'sk_test_placeholder' }
if (-not $stripeWebhook) { $stripeWebhook = 'whsec_placeholder' }
if (-not $googleAi) { $googleAi = 'your_google_ai_key' }
if (-not $openAi) { $openAi = 'your_openai_key' }
if (-not $msClientId) { $msClientId = 'your_client_id' }
if (-not $msClientSecret) { $msClientSecret = 'your_client_secret' }
if (-not $msTenantId) { $msTenantId = 'your_tenant_id' }

$envContent = @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$projectId
NEXT_PUBLIC_FIREBASE_API_KEY=$apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$authDomain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://$projectId.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=$appId

# Server-side Firebase Admin
FIREBASE_PROJECT_ID=$projectId
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@$projectId.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your_private_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripeKey
STRIPE_SECRET_KEY=$stripeSecret
STRIPE_WEBHOOK_SECRET=$stripeWebhook

# Internal Security
INTERNAL_WEBHOOK_SECRET=dev_webhook_secret_12345

# Google AI
NEXT_PUBLIC_GOOGLE_AI_API_KEY=$googleAi
OPENAI_API_KEY=$openAi

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Microsoft 365 / Azure AD
MICROSOFT_CLIENT_ID=$msClientId
MICROSOFT_CLIENT_SECRET=$msClientSecret
MICROSOFT_TENANT_ID=$msTenantId
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/callback/microsoft

# Microsoft 365 Graph API
NEXT_PUBLIC_MICROSOFT_GRAPH_API=https://graph.microsoft.com/v1.0
"@

Set-Content -Path "C:\Users\dying\public\.env.local" -Value $envContent -Force
Write-Host "SUCCESS: .env.local created!" -ForegroundColor Green

# Step 3.5: Ensure VS Code terminal persistent sessions are disabled (needed for PowerShell Pro Tools)
Write-Host "`nStep 3.5: Updating VS Code terminal settings..." -ForegroundColor Yellow
$vsSettingsPath = Join-Path $env:APPDATA "Code\User\settings.json"
if (-not (Test-Path $vsSettingsPath)) {
    '{}' | Set-Content -Path $vsSettingsPath -Force -Encoding UTF8
}
try {
    $settingsJson = Get-Content -Path $vsSettingsPath -Raw | ConvertFrom-Json
} catch {
    $settingsJson = @{}
}
$settingsJson."terminal.integrated.enablePersistentSessions" = $false
$settingsJson | ConvertTo-Json -Depth 10 | Set-Content -Path $vsSettingsPath -Force -Encoding UTF8
Write-Host "VS Code setting terminal.integrated.enablePersistentSessions set to false." -ForegroundColor Green

# Step 3.6: Ensure Node.js is available (prefers existing Node over nvm for simplicity)
Write-Host "`nStep 3.6: Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node -v
    Write-Host "Node detected: $nodeVersion" -ForegroundColor Green
} elseif (Get-Command nvm -ErrorAction SilentlyContinue) {
    Write-Host "Node not found, but nvm is available. Installing Node 20..." -ForegroundColor Yellow
    nvm install 20
    nvm use 20
    $nodeVersion = node -v
    Write-Host "Node detected: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "ERROR: Node.js is not installed. Please install Node 20+ (winget install OpenJS.NodeJS.LTS) and rerun this script." -ForegroundColor Red
    exit 1
}

# Step 4: Install dependencies
Write-Host "`nStep 4: Installing dependencies..." -ForegroundColor Yellow
Push-Location "C:\Users\dying\public"
npm install

# Step 5: Build
Write-Host "`nStep 5: Building project..." -ForegroundColor Yellow
npm run build

# Step 6: Start dev server
Write-Host "`nStep 6: Starting dev server..." -ForegroundColor Yellow
Write-Host "Stopping any existing Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

Write-Host "Starting development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\dying\public'; npm run dev"
Start-Sleep -Seconds 8

Pop-Location

# Final message
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Your site is ready at:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Green
Write-Host "  http://172.25.32.1:3000 (network)" -ForegroundColor Green

Write-Host "`nConfiguration Summary:" -ForegroundColor Cyan
Write-Host "  Firebase Project: $projectId" -ForegroundColor Green
Write-Host "  Auth Domain: $authDomain" -ForegroundColor Green
if ($stripeKey) { Write-Host "  Stripe: Configured" -ForegroundColor Green }
if ($googleAi) { Write-Host "  Google AI: Configured" -ForegroundColor Green }
if ($msClientId) { Write-Host "  Microsoft 365: Configured" -ForegroundColor Green }

Write-Host "`nReady to go!" -ForegroundColor Cyan
Write-Host "Open http://localhost:3000/speech for the voice demo (set OPENAI_API_KEY for Whisper accuracy)." -ForegroundColor Cyan
