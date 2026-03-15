# Azure AD Authentication Setup

## 1. Azure AD B2C Configuration

Create or use an existing Azure AD B2C tenant and configure the following environment variables in `apps/web/.env.local`:

```env
# Azure AD B2C Configuration
NEXT_PUBLIC_AZURE_B2C_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_AZURE_B2C_TENANT_NAME=your-tenant-name
NEXT_PUBLIC_AZURE_B2C_SIGNIN_POLICY=B2C_1_susi
NEXT_PUBLIC_AZURE_B2C_FORGOT_PASSWORD_POLICY=B2C_1_reset
NEXT_PUBLIC_AZURE_B2C_EDIT_PROFILE_POLICY=B2C_1_edit_profile
NEXT_PUBLIC_AZURE_B2C_SCOPE=openid

# Redirect URIs (adjust for production)
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI=http://localhost:3000
```

## 2. Create Azure AD B2C Tenant (if needed)

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new Azure AD B2C tenant or use existing one
3. Navigate to **Azure AD B2C** → **App registrations** → **New registration**
4. Set name: `HomeBase Web App`
5. Set Redirect URI: `http://localhost:3000` (type: Single-page application)
6. Register the application
7. Copy the **Application (client) ID** → This is your `NEXT_PUBLIC_AZURE_B2C_CLIENT_ID`
8. Note your tenant name (e.g., if your domain is `contoso.b2clogin.com`, tenant name is `contoso`)

## 3. Create User Flows

### Sign-up and Sign-in Policy (B2C_1_susi)

1. Navigate to **User flows** → **New user flow**
2. Select **Sign up and sign in**
3. Name: `susi`
4. Select identity providers (Local account, Microsoft, Google, etc.)
5. Configure user attributes to collect:
   - Display Name
   - Email Address
   - Given Name
   - Surname
6. Create the flow

### Password Reset Policy (B2C_1_reset)

1. Navigate to **User flows** → **New user flow**
2. Select **Password reset**
3. Name: `reset`
4. Configure as needed
5. Create the flow

## 4. Configure Redirect URIs

In your app registration:

1. Go to **Authentication**
2. Add platform: **Single-page application**
3. Add Redirect URIs:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - Your production domain (e.g., `https://yourdomain.com`)
4. Enable **ID tokens** and **Access tokens**
5. Save

## 5. Usage in Your Application

### Using the Auth Hook

```tsx
import { useAuth } from '@/lib/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={login}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name || user?.email}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Getting Access Tokens for API Calls

```tsx
import { useAuth } from '@/lib/useAuth';

function MyComponent() {
  const { getAccessToken } = useAuth();

  const callApi = async () => {
    const token = await getAccessToken();

    const response = await fetch('http://localhost:7071/api/protected-endpoint', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  };
}
```

### Protected Routes

Create a component to protect routes:

```tsx
// components/ProtectedRoute.tsx
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
};
```

## 6. Testing Authentication

1. Start your development server: `pnpm -C apps/web dev`
2. Navigate to the login page
3. Click "Sign In with Microsoft"
4. You'll be redirected to Azure AD B2C
5. Sign in or create a new account
6. You'll be redirected back to your app with authentication

## 7. Production Deployment

1. Update environment variables with production values
2. Add production redirect URIs to Azure AD B2C app registration
3. Update `NEXT_PUBLIC_REDIRECT_URI` and `NEXT_PUBLIC_POST_LOGOUT_REDIRECT_URI`
4. Ensure HTTPS is enabled for production domain

## Troubleshooting

### "Redirect URI mismatch"

- Verify redirect URIs in Azure AD B2C match exactly (including http/https and trailing slashes)
- Ensure you're using the correct environment variable values

### "Invalid tenant"

- Double-check `NEXT_PUBLIC_AZURE_B2C_TENANT_NAME`
- Ensure it matches your B2C tenant (without `.b2clogin.com`)

### "Policy not found"

- Verify user flow names match exactly (case-sensitive)
- Check that flows are enabled in Azure portal

### Token acquisition fails

- Ensure scopes are correct in `authConfig.ts`
- Check that API permissions are granted in Azure portal
- Verify `NEXT_PUBLIC_AZURE_B2C_SCOPE` environment variable

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use HTTPS in production** - Required for OAuth/OIDC
3. **Rotate secrets regularly** - Update client secrets in Azure portal
4. **Implement token refresh** - Handled automatically by MSAL
5. **Validate tokens on backend** - Use `auth-utils.ts` for API routes
6. **Use appropriate scopes** - Only request permissions you need

## Resources

- [Azure AD B2C Documentation](https://learn.microsoft.com/azure/active-directory-b2c/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [MSAL React Guide](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
