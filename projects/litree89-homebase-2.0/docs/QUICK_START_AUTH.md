# 🎯 Azure AD B2C Setup - Quick Reference

## ✅ What's Done

- Firebase completely removed
- Azure AD B2C MSAL authentication implemented
- Social login buttons (Google, Facebook, Microsoft) in UI
- Environment configuration standardized
- Setup scripts created

## 🚀 Next: Configure Azure AD B2C (Choose One)

### Option 1: Automated Setup (Recommended)

```powershell
.\scripts\Setup-AzureB2C.ps1 -Interactive
```

Follow the prompts. It will:

1. Guide you through Azure Portal steps
2. Generate `.env.local` with your settings
3. Provide social provider setup instructions

#### Time: ~30 minutes

### Option 2: Manual Setup

See [AZURE_B2C_SOCIAL_LOGIN_SETUP.md](AZURE_B2C_SOCIAL_LOGIN_SETUP.md) for step-by-step guide.

## 📋 Required Environment Variables

Create/update `apps/web/.env.local`:

```env
# From Azure Portal → App Registration
NEXT_PUBLIC_B2C_TENANT_NAME=litlabsb2c
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-client-id-here

# User flow names (default, or your custom names)
NEXT_PUBLIC_B2C_SIGNUP_SIGNIN_POLICY=B2C_1_signupsignin
NEXT_PUBLIC_B2C_FORGOT_PASSWORD_POLICY=B2C_1_passwordreset
NEXT_PUBLIC_B2C_EDIT_PROFILE_POLICY=B2C_1_profileedit

# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:7071/api
```

## 🧪 Test Without Azure Setup (Development Only)

The app will load with placeholder auth. Login won't work until you configure Azure B2C.

```powershell
pnpm -C apps/web dev
```

Visit <http://localhost:3000> - you'll see the social login buttons (they won't work yet).

## 🔧 Key Files

| File                                                       | Purpose                      |
| ---------------------------------------------------------- | ---------------------------- |
| [msal-config.ts](../apps/web/src/lib/auth/msal-config.ts) | MSAL & B2C configuration     |
| [Login.tsx](../apps/web/src/components/Login.tsx)         | Login UI with social buttons |
| [\_app.tsx](../apps/web/src/pages/_app.tsx)               | MSAL provider wrapper        |
| [Setup-AzureB2C.ps1](../scripts/Setup-AzureB2C.ps1)       | Automated setup script       |
| [.env.example](../apps/web/.env.example)                  | Environment template         |

## 📖 Full Documentation

- **Setup Guide**: [AZURE_B2C_SOCIAL_LOGIN_SETUP.md](AZURE_B2C_SOCIAL_LOGIN_SETUP.md)
- **Migration Info**: [FIREBASE_TO_AZURE_B2C_MIGRATION.md](FIREBASE_TO_AZURE_B2C_MIGRATION.md)
- **Roadmap**: [MIGRATION_ROADMAP.md](MIGRATION_ROADMAP.md)

## 🎯 What Social Logins Are Supported?

✅ Google
✅ Facebook  
✅ Microsoft (built-in)
✅ GitHub (optional)
✅ LinkedIn (optional)
✅ Twitter (optional)
✅ Email/Password

## 💰 Cost

### FREE for first 50,000 monthly active users

After: $0.00325 per MAU (monthly active user)

## 🐛 Troubleshooting

**Import errors after changes?**

```powershell
# Restart dev server
Get-Process -Name node | Where-Object {$_.Path -like "*HomeBase*"} | Stop-Process -Force
pnpm -C apps/web dev
```

**"Cannot find module '@/lib/authConfig'"**  
✅ Fixed - old files removed. Restart TypeScript server in VS Code:

- Ctrl+Shift+P → "TypeScript: Restart TS Server"

**"Redirect URI mismatch" error**  
Add `http://localhost:3000` to Azure app registration redirect URIs (SPA platform)

## 🎉 Ready to Test?

1. Run setup script: `.\scripts\Setup-AzureB2C.ps1 -Interactive`
2. Configure social providers in Azure Portal
3. Restart dev server: `pnpm -C apps/web dev`
4. Click "Continue with Google" at <http://localhost:3000>

---

**Status**: Code ready ✅ | Azure setup required ⏳
