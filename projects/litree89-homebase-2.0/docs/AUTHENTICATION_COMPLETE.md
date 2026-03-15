# 🔐 Azure AD Authentication - Implementation Complete

## ✅ What Was Implemented

Your site now has **Azure AD B2C authentication** using Microsoft Authentication Library (MSAL). Users can sign in with their Microsoft accounts or create new accounts through Azure AD B2C.

### Files Created/Modified:

1. **Authentication Configuration**

   - [apps/web/src/lib/authConfig.ts](apps/web/src/lib/authConfig.ts) - MSAL configuration with Azure AD B2C policies
   - [apps/web/src/lib/msalInstance.ts](apps/web/src/lib/msalInstance.ts) - Singleton MSAL instance
   - [apps/web/src/lib/useAuth.ts](apps/web/src/lib/useAuth.ts) - Custom React hook for authentication

2. **Application Updates**

   - [apps/web/src/pages/\_app.tsx](apps/web/src/pages/_app.tsx) - Wrapped with MsalProvider
   - [apps/web/src/components/Login.tsx](apps/web/src/components/Login.tsx) - Updated to use Azure AD
   - [apps/web/src/components/Signup.tsx](apps/web/src/components/Signup.tsx) - Updated to use Azure AD
   - [apps/web/src/components/UserMenu.tsx](apps/web/src/components/UserMenu.tsx) - NEW: User menu component
   - [apps/web/src/pages/profile.tsx](apps/web/src/pages/profile.tsx) - NEW: Protected profile page

3. **Documentation**
   - [docs/AZURE_AD_SETUP.md](docs/AZURE_AD_SETUP.md) - Complete setup guide
   - [apps/web/.env.example](apps/web/.env.example) - Updated with Azure AD B2C variables

## 🚀 Next Steps - Configure Azure AD B2C

### Option 1: Quick Dev/Test Setup (5 minutes)

If you just want to test authentication locally without full Azure setup:

1. **Copy the example env file:**

   ```powershell
   Copy-Item apps/web/.env.example apps/web/.env.local
   ```

2. **Use placeholder values** (the app will work but won't actually authenticate):

   ```env
   NEXT_PUBLIC_AZURE_B2C_CLIENT_ID=dev-mode
   NEXT_PUBLIC_AZURE_B2C_TENANT_NAME=dev
   ```

3. **Restart the dev server:**

   ```powershell
   pnpm -C apps/web dev
   ```

### Option 2: Full Azure AD B2C Setup (15 minutes)

Follow the complete guide: [docs/AZURE_AD_SETUP.md](docs/AZURE_AD_SETUP.md)

**Quick summary:**

1. **Create Azure AD B2C tenant** (if you don't have one)

   - Go to [Azure Portal](https://portal.azure.com)
   - Create new Azure AD B2C resource
   - Note your tenant name (e.g., `contoso`)

2. **Register your app**

   - Go to App registrations → New registration
   - Name: `HomeBase Web App`
   - Redirect URI: `http://localhost:3000` (SPA type)
   - Copy the Client ID

3. **Create user flow**

   - Go to User flows → New user flow
   - Type: Sign up and sign in
   - Name: `susi`
   - Enable email/password and social providers

4. **Configure environment variables** in `apps/web/.env.local`:

   ```env
   NEXT_PUBLIC_AZURE_B2C_CLIENT_ID=<your-client-id>
   NEXT_PUBLIC_AZURE_B2C_TENANT_NAME=<your-tenant-name>
   NEXT_PUBLIC_AZURE_B2C_SIGNIN_POLICY=B2C_1_susi
   ```

5. **Restart dev server:**

   ```powershell
   pnpm -C apps/web dev
   ```

## 🎯 How to Use Authentication

### In Any Component:

```tsx
import { useAuth } from '@/lib/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={login}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Add User Menu to Your Layout:

```tsx
import UserMenu from '@/components/UserMenu';

function Layout() {
  return (
    <nav>
      {/* Your nav items */}
      <UserMenu />
    </nav>
  );
}
```

### Protect Routes:

```tsx
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

### Call Protected API Endpoints:

```tsx
const { getAccessToken } = useAuth();

const response = await fetch('http://localhost:7071/api/protected', {
  headers: {
    Authorization: `Bearer ${await getAccessToken()}`,
  },
});
```

## 🔍 Test Pages

Once configured, visit:

- `/` - Landing page (Login/Signup buttons)
- `/profile` - Protected page (requires authentication)

## 📚 Resources

- Full setup guide: [docs/AZURE_AD_SETUP.md](docs/AZURE_AD_SETUP.md)
- Azure AD B2C docs: <https://learn.microsoft.com/azure/active-directory-b2c/>
- MSAL React: <https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react>

## 🐛 Troubleshooting

### "Redirect URI mismatch"

- Add `http://localhost:3000` to Azure app registration redirect URIs
- Ensure SPA platform is selected (not Web)

### "Invalid tenant"

- Check `NEXT_PUBLIC_AZURE_B2C_TENANT_NAME` in `.env.local`
- Should be just the tenant name, not full domain

### "Policy not found"

- Verify user flow name matches (case-sensitive)
- Default: `B2C_1_susi`

Need help? Check the full guide in [docs/AZURE_AD_SETUP.md](docs/AZURE_AD_SETUP.md)
