# 🔐 Azure AD B2C Social Login Setup - Quick Start

## What You Get

- **FREE** social login for 50,000 monthly active users
- Login with: Google, Facebook, Microsoft, GitHub, LinkedIn, Twitter
- Email/password signup with password reset
- Enterprise-grade security (GDPR compliant)
- User profile management

## Prerequisites

- Azure subscription (free tier works)
- 30 minutes for setup
- Social provider accounts (Google Console, Facebook Developers)

## 🚀 Automated Setup (Recommended)

```powershell
# Run the setup script
.\scripts\Setup-AzureB2C.ps1 -TenantName "your-unique-name" -Interactive

# Follow the prompts for:
# 1. B2C tenant creation
# 2. App registration
# 3. Social provider configuration
# 4. User flow creation
```

## 📋 Manual Setup (If you prefer Azure Portal)

### Step 1: Create Azure AD B2C Tenant (5 minutes)

1. Go to [Azure Portal](https://portal.azure.com/#create/Microsoft.AzureActiveDirectory)
2. Select **"Azure Active Directory B2C"**
3. **Initial domain name**: `litlabsb2c` (or your choice)
4. **Country/region**: United States
5. Click **Create** and wait 2-3 minutes

### Step 2: Register Application (3 minutes)

1. Switch directory to your B2C tenant (`litlabsb2c.onmicrosoft.com`)
2. Go to **Azure AD B2C** → **App registrations** → **New registration**
3. **Name**: `HomeBase-Web`
4. **Supported account types**: Accounts in any identity provider or organizational directory
5. **Redirect URI**:
   - Platform: **Single-page application (SPA)**
   - URI: `http://localhost:3000`
6. Click **Register**
7. **Copy the "Application (client) ID"** (you'll need this)

### Step 3: Configure Social Identity Providers (15 minutes)

#### Google Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Create Project**: `HomeBase` → **Create**
3. **APIs & Services** → **OAuth consent screen**
   - User Type: **External** → Create
   - App name: `HomeBase`
   - User support email: your email
   - Scopes: `email`, `profile`, `openid`
4. **Credentials** → **Create OAuth 2.0 Client ID**

   - Application type: **Web application**
   - Name: `HomeBase Web`
   - **Authorized redirect URIs**:

     ```text
     https://litlabsb2c.b2clogin.com/litlabsb2c.onmicrosoft.com/oauth2/authresp
     ```

5. Copy **Client ID** and **Client Secret**
6. Back in Azure Portal:
   - **Azure AD B2C** → **Identity providers** → **New OpenID Connect provider**
   - Name: `Google`
   - Client ID: (paste from step 5)
   - Client secret: (paste from step 5)
   - Scope: `openid profile email`
   - Response type: `code`
   - Domain hint: `google`

#### Facebook Setup

1. Go to [Facebook Developers](https://developers.facebook.com)
2. **Create App** → **Consumer** → App name: `HomeBase`
3. **Settings** → **Basic**
   - Copy **App ID** and **App Secret**
4. **Add Product** → **Facebook Login** → **Settings**
5. **Valid OAuth Redirect URIs**:

   ```text
   https://litlabsb2c.b2clogin.com/litlabsb2c.onmicrosoft.com/oauth2/authresp
   ```

6. Back in Azure Portal:
   - **Azure AD B2C** → **Identity providers** → **Facebook**
   - Client ID: (paste App ID)
   - Client secret: (paste App Secret)

#### Microsoft Account (Built-in, 30 seconds)

1. **Azure AD B2C** → **Identity providers** → **Microsoft Account**
2. Click **Set up** → Enable
3. Done! No external setup needed.

#### GitHub (Optional)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. **New OAuth App**

   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL:

     ```text
     https://litlabsb2c.b2clogin.com/litlabsb2c.onmicrosoft.com/oauth2/authresp
     ```

3. Copy **Client ID** → Generate **Client Secret**
4. Back in Azure Portal:
   - **Azure AD B2C** → **Identity providers** → **GitHub**
   - Client ID: (paste)
   - Client secret: (paste)

### Step 4: Create User Flows (5 minutes)

#### Sign up and sign in flow

1. **Azure AD B2C** → **User flows** → **New user flow**
2. **Type**: Sign up and sign in (Recommended)
3. **Name**: `signupsignin`
4. **Identity providers**:
   - ✅ Email signup
   - ✅ Google
   - ✅ Facebook
   - ✅ Microsoft Account
   - ✅ GitHub (if you configured it)
5. **User attributes and token claims**:
   - ✅ Email Address (collect & return)
   - ✅ Display Name (collect & return)
   - ✅ Given Name (collect & return)
   - ✅ Surname (collect & return)
   - ✅ User's Object ID (return)
6. Click **Create**

#### Password reset flow

1. **New user flow** → **Password reset (Recommended)**
2. **Name**: `passwordreset`
3. **Identity providers**: Email address
4. Click **Create**

#### Profile editing flow

1. **New user flow** → **Profile editing (Recommended)**
2. **Name**: `profileedit`
3. **Identity providers**: Local Account SignIn
4. **User attributes**: Display Name, Given Name, Surname
5. Click **Create**

### Step 5: Configure Environment Variables (2 minutes)

1. Copy `.env.local.example` to `.env.local`:

   ```powershell
   Copy-Item "apps\web\.env.local.example" "apps\web\.env.local"
   ```

2. Edit `apps\web\.env.local`:

   ```env
   NEXT_PUBLIC_B2C_TENANT_NAME=litlabsb2c
   NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-client-id-from-step-2
   NEXT_PUBLIC_B2C_SIGNUP_SIGNIN_POLICY=B2C_1_signupsignin
   NEXT_PUBLIC_B2C_FORGOT_PASSWORD_POLICY=B2C_1_passwordreset
   NEXT_PUBLIC_B2C_EDIT_PROFILE_POLICY=B2C_1_profileedit
   ```

## 🧪 Test Your Setup

```powershell
# Start dev server
pnpm -C apps/web dev

# Open browser
start http://localhost:3000

# Click "Sign In with Google" or other providers
# You should see the B2C login page with social buttons
```

## 🎯 What Happens When User Logs In

1. User clicks "Continue with Google" (or Facebook, etc.)
2. Redirects to Google login
3. User authorizes HomeBase app
4. Returns to your app with Azure AD B2C token
5. MSAL stores token in localStorage
6. Your app can now:
   - Get user profile (`useAuth()` hook)
   - Call protected APIs (token in headers)
   - Store user data in Cosmos DB

## 📊 Monitoring & Costs

- **Free Tier**: 50,000 monthly active users
- **Pricing beyond free**: $0.00325 per MAU
- **Monitor**: Azure Portal → Azure AD B2C → Overview
- **Logs**: Azure AD B2C → Audit logs

## 🔒 Production Checklist

Before deploying to production:

- [ ] Update redirect URIs in app registration (add production URL)
- [ ] Configure custom domains (optional): `login.yourdomain.com`
- [ ] Enable MFA (multi-factor authentication)
- [ ] Review token lifetimes (Settings → Token compatibility settings)
- [ ] Set up user profile storage in Cosmos DB
- [ ] Configure CORS in Azure Functions API
- [ ] Test logout flow
- [ ] Test password reset flow
- [ ] Add privacy policy and terms of service links
- [ ] Enable Application Insights for monitoring

## 🐛 Troubleshooting

### "AADSTS50011: Reply URL mismatch"

**Fix**: Add your URL to app registration redirect URIs

### "AADB2C90118: Forgot password"

**Fix**: User clicked "Forgot password" - redirect to password reset flow:

```typescript
if (error.errorMessage?.includes('AADB2C90118')) {
  // Redirect to password reset flow
  const resetAuthority = b2cPolicies.authorities.forgotPassword.authority;
  await instance.loginRedirect({ authority: resetAuthority });
}
```

### Social login button doesn't appear

**Fix**: Check identity provider is enabled in user flow configuration

### "localhost refused to connect"

**Fix**: Ensure redirect URI in app registration includes `http://localhost:3000`

## 📚 Resources

- [Azure AD B2C Documentation](https://learn.microsoft.com/azure/active-directory-b2c/)
- [MSAL.js Documentation](https://learn.microsoft.com/azure/active-directory/develop/msal-overview)
- [User Flow Customization](https://learn.microsoft.com/azure/active-directory-b2c/customize-ui)
- [Custom Policies (Advanced)](https://learn.microsoft.com/azure/active-directory-b2c/custom-policy-overview)

## 🎉 You're Done!

Your app now supports:

- ✅ Google login
- ✅ Facebook login
- ✅ Microsoft login
- ✅ Email/password signup
- ✅ Password reset
- ✅ Profile editing
- ✅ Free for 50K users/month

**Next**: Connect user profiles to Cosmos DB for data persistence!
