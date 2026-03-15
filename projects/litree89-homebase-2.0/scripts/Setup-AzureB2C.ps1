<#
.SYNOPSIS
Setup Azure AD B2C with social identity providers for HomeBase 2.0

.DESCRIPTION
Automates Azure AD B2C tenant creation, app registration, and social login configuration.
Supports: Google, Facebook, Microsoft, GitHub, LinkedIn, Twitter

.EXAMPLE
.\Setup-AzureB2C.ps1 -TenantName "litlabsb2c" -Interactive
#>

param(
    [string]$TenantName = "litlabsb2c",
    [switch]$Interactive,
    [string]$Location = "United States"
)

$ErrorActionPreference = "Stop"
Write-Host "🔐 Azure AD B2C Social Login Setup" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkCyan

# Check Azure CLI
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI not found. Install: https://aka.ms/InstallAzureCLIDocs"
    exit 1
}

# Login
Write-Host "`n📡 Logging into Azure..." -ForegroundColor Yellow
az account show 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    az login
}

$subscription = az account show --query "name" -o tsv
Write-Host "✅ Logged in to subscription: $subscription" -ForegroundColor Green

# Step 1: Create B2C Tenant
Write-Host "`n📦 Step 1: Create Azure AD B2C Tenant" -ForegroundColor Cyan
Write-Host "Tenant name: $TenantName" -ForegroundColor White
Write-Host "This creates a FREE tenant (50K MAU included)" -ForegroundColor DarkGray

if ($Interactive) {
    Write-Host "`n⚠️  MANUAL STEP REQUIRED:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://portal.azure.com/#create/Microsoft.AzureActiveDirectory" -ForegroundColor White
    Write-Host "2. Select 'Azure Active Directory B2C'" -ForegroundColor White
    Write-Host "3. Initial domain name: $TenantName" -ForegroundColor White
    Write-Host "4. Country/region: $Location" -ForegroundColor White
    Write-Host "5. Create and wait 2-3 minutes" -ForegroundColor White
    Read-Host "`nPress ENTER after B2C tenant is created"
}

# Step 2: Register Application
Write-Host "`n📱 Step 2: Register Application" -ForegroundColor Cyan
$appName = "HomeBase-Web"
$redirectUri = "http://localhost:3000"

Write-Host "Creating app registration: $appName" -ForegroundColor White

# This requires switching to B2C tenant context
Write-Host "`n⚠️  MANUAL STEP REQUIRED:" -ForegroundColor Yellow
Write-Host "1. Go to: https://portal.azure.com" -ForegroundColor White
Write-Host "2. Switch directory → $TenantName.onmicrosoft.com" -ForegroundColor White
Write-Host "3. Azure AD B2C → App registrations → New registration" -ForegroundColor White
Write-Host "4. Name: $appName" -ForegroundColor White
Write-Host "5. Redirect URI: Single-page application (SPA) → $redirectUri" -ForegroundColor White
Write-Host "6. Register → Copy 'Application (client) ID'" -ForegroundColor White

$clientId = if ($Interactive) {
    Read-Host "`nPaste the Application (client) ID here"
} else {
    "PASTE-CLIENT-ID-HERE"
}

# Step 3: Configure Social Identity Providers
Write-Host "`n🌐 Step 3: Add Social Identity Providers" -ForegroundColor Cyan
Write-Host "Configure these in Azure Portal → Azure AD B2C → Identity providers" -ForegroundColor DarkGray

@"

══════════════════════════════════════════════════════════════════
GOOGLE SETUP
══════════════════════════════════════════════════════════════════
1. Go to: https://console.cloud.google.com
2. Create project: HomeBase
3. APIs & Services → OAuth consent screen
   - User Type: External
   - Scopes: email, profile, openid
4. Credentials → Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     https://$TenantName.b2clogin.com/$TenantName.onmicrosoft.com/oauth2/authresp
5. Copy Client ID and Client Secret
6. Azure Portal → Identity providers → Google
   - Paste Client ID and Secret

══════════════════════════════════════════════════════════════════
FACEBOOK SETUP
══════════════════════════════════════════════════════════════════
1. Go to: https://developers.facebook.com
2. Create App → Consumer → App name: HomeBase
3. Settings → Basic → Copy App ID and App Secret
4. Add Product → Facebook Login
5. Valid OAuth Redirect URIs:
   https://$TenantName.b2clogin.com/$TenantName.onmicrosoft.com/oauth2/authresp
6. Azure Portal → Identity providers → Facebook
   - Paste App ID and Secret

══════════════════════════════════════════════════════════════════
MICROSOFT (Built-in, no setup required)
══════════════════════════════════════════════════════════════════
Azure Portal → Identity providers → Microsoft Account
Click "Set up" → Enable

══════════════════════════════════════════════════════════════════
GITHUB (Optional)
══════════════════════════════════════════════════════════════════
1. Go to: https://github.com/settings/developers
2. New OAuth App
   - Homepage URL: https://yourdomain.com
   - Authorization callback URL:
     https://$TenantName.b2clogin.com/$TenantName.onmicrosoft.com/oauth2/authresp
3. Copy Client ID and generate Client Secret
4. Azure Portal → Identity providers → GitHub
   - Paste Client ID and Secret

"@ | Write-Host -ForegroundColor White

# Step 4: Create User Flows
Write-Host "`n⚙️  Step 4: Create User Flows" -ForegroundColor Cyan
Write-Host "Azure Portal → Azure AD B2C → User flows → New user flow" -ForegroundColor DarkGray

@"

══════════════════════════════════════════════════════════════════
USER FLOW: Sign up and sign in (B2C_1_signupsignin)
══════════════════════════════════════════════════════════════════
1. Type: Sign up and sign in (Recommended)
2. Version: Recommended
3. Name: signupsignin
4. Identity providers:
   ✅ Email signup
   ✅ Google
   ✅ Facebook
   ✅ Microsoft Account
   ✅ GitHub (if configured)
5. User attributes and token claims:
   ✅ Email Address (collect & return)
   ✅ Display Name (collect & return)
   ✅ Given Name (collect & return)
   ✅ Surname (collect & return)
   ✅ User's Object ID (return)
6. Create

══════════════════════════════════════════════════════════════════
USER FLOW: Password reset (B2C_1_passwordreset)
══════════════════════════════════════════════════════════════════
1. Type: Password reset (Recommended)
2. Name: passwordreset
3. Identity providers: Email address
4. Create

══════════════════════════════════════════════════════════════════
USER FLOW: Profile editing (B2C_1_profileedit)
══════════════════════════════════════════════════════════════════
1. Type: Profile editing (Recommended)
2. Name: profileedit
3. Identity providers: Local Account SignIn
4. User attributes: Display Name, Given Name, Surname
5. Create

"@ | Write-Host -ForegroundColor White

# Step 5: Generate .env.local
Write-Host "`n📝 Step 5: Generate .env.local configuration" -ForegroundColor Cyan

$envContent = @"
# ═══════════════════════════════════════════════════════════════
# Azure AD B2C Configuration - Generated $(Get-Date -Format "yyyy-MM-dd HH:mm")
# ═══════════════════════════════════════════════════════════════

NEXT_PUBLIC_B2C_TENANT_NAME=$TenantName
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=$clientId
NEXT_PUBLIC_B2C_SIGNUP_SIGNIN_POLICY=B2C_1_signupsignin
NEXT_PUBLIC_B2C_FORGOT_PASSWORD_POLICY=B2C_1_passwordreset
NEXT_PUBLIC_B2C_EDIT_PROFILE_POLICY=B2C_1_profileedit
NEXT_PUBLIC_B2C_API_SCOPE=api

# Azure Cosmos DB
COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
COSMOS_KEY=your-primary-key-here
COSMOS_DATABASE=homebase
COSMOS_USERS_CONTAINER=users

# SignalR
SIGNALR_ENDPOINT=https://your-signalr.service.signalr.net
SIGNALR_CONNECTION_STRING=your-connection-string

# API
NEXT_PUBLIC_API_URL=http://localhost:7071/api
"@

$envPath = "E:\VSCode\HomeBase 2.0\apps\web\.env.local"
$envContent | Out-File -FilePath $envPath -Encoding UTF8
Write-Host "✅ Created: $envPath" -ForegroundColor Green

# Final Instructions
Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkCyan
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Complete social provider setup (Google, Facebook, etc.)" -ForegroundColor White
Write-Host "2. Create user flows in Azure Portal" -ForegroundColor White
Write-Host "3. Update .env.local with your Client ID: $envPath" -ForegroundColor White
Write-Host "4. Test login: pnpm -C apps/web dev" -ForegroundColor White
Write-Host "`n🌐 Login URL: http://localhost:3000" -ForegroundColor Yellow
Write-Host "📖 Docs: https://learn.microsoft.com/azure/active-directory-b2c/" -ForegroundColor DarkGray
