# 🔥 Firebase → Azure AD B2C Migration Complete

## What Changed

- ❌ **REMOVED**: Firebase Authentication, Firestore, Storage
- ✅ **ADDED**: Azure AD B2C with MSAL (Microsoft Authentication Library)
- ✅ **ADDED**: Social login support (Google, Facebook, Microsoft, GitHub)

## Quick Start

```powershell
# 1. Setup Azure AD B2C (follow prompts)
.\scripts\Setup-AzureB2C.ps1 -Interactive

# 2. Start dev environment
pnpm -C apps/web dev

# 3. Test social login
start http://localhost:3000
```

## Files Modified

### Added

- `apps/web/src/lib/auth/msal-config.ts` - Azure AD B2C MSAL configuration
- `scripts/Setup-AzureB2C.ps1` - Automated B2C setup script
- `docs/AZURE_B2C_SOCIAL_LOGIN_SETUP.md` - Complete setup guide

### Updated

- `apps/web/src/components/Login.tsx` - Now uses MSAL with social buttons
- `apps/web/package.json` - Removed Firebase, added `@azure/msal-browser` and `@azure/msal-react`

### Removed

- `apps/web/src/lib/firebase.ts` - Deleted Firebase config
- Firebase packages: `firebase`, `react-firebase-hooks`

## Authentication Flow

### Before (Firebase)

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
await signInWithEmailAndPassword(auth, email, password);
```

### After (Azure AD B2C)

```typescript
import { useMsal } from '@azure/msal-react';
const { instance } = useMsal();
await instance.loginPopup(loginRequest); // Email or social login
```

## Features

- **Social Login**: Google, Facebook, Microsoft, GitHub, LinkedIn, Twitter
- **Email/Password**: Traditional signup with password reset
- **Free Tier**: 50,000 monthly active users (Azure AD B2C free tier)
- **Enterprise Ready**: GDPR compliant, MFA support, audit logs
- **Token-Based**: JWT tokens for API authorization
- **Profile Management**: User profile editing, password reset flows

## Environment Variables

Old (Firebase):

```env
# No longer needed
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
```

New (Azure AD B2C):

```env
NEXT_PUBLIC_B2C_TENANT_NAME=litlabsb2c
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-client-id
NEXT_PUBLIC_B2C_SIGNUP_SIGNIN_POLICY=B2C_1_signupsignin
NEXT_PUBLIC_B2C_FORGOT_PASSWORD_POLICY=B2C_1_passwordreset
NEXT_PUBLIC_B2C_EDIT_PROFILE_POLICY=B2C_1_profileedit
```

## Setup Instructions

See [`docs/AZURE_B2C_SOCIAL_LOGIN_SETUP.md`](../docs/AZURE_B2C_SOCIAL_LOGIN_SETUP.md) for:

- Azure Portal step-by-step guide
- Social provider configuration (Google, Facebook, etc.)
- User flow creation
- Testing and troubleshooting

## Benefits of Migration

| Feature               | Firebase Auth   | Azure AD B2C  |
| --------------------- | --------------- | ------------- |
| Free tier             | 10K auths/month | 50K MAU/month |
| Social login          | Yes (paid)      | Yes (free)    |
| Enterprise SSO        | No              | Yes           |
| GDPR compliance       | Partial         | Full          |
| MFA                   | Limited         | Full          |
| Custom domains        | No              | Yes           |
| Audit logs            | Limited         | Full          |
| Microsoft integration | No              | Native        |

## User Impact

**Existing Users**: Will need to re-register with social login or email/password
**New Users**: Can choose any social provider or email signup
**User Experience**: Faster onboarding (1-click social login)

## Developer Experience

### Getting User Info

```typescript
// In any component
import { useMsal } from '@azure/msal-react';

function MyComponent() {
  const { accounts } = useMsal();
  const user = accounts[0];

  return <p>Hello, {user.name}!</p>;
}
```

### Protecting API Routes

```typescript
// Azure Functions (api/src/functions/...)
import { validateToken } from '@/shared/auth';

export async function handler(request: HttpRequest, context: InvocationContext) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const user = await validateToken(token);

  if (!user) {
    return { status: 401, body: 'Unauthorized' };
  }

  // User is authenticated
  return { status: 200, body: { userId: user.id } };
}
```

## Next Steps

1. **Configure Azure AD B2C**: Run `.\scripts\Setup-AzureB2C.ps1`
2. **Set up social providers**: Follow Google/Facebook setup in docs
3. **Test login**: `pnpm -C apps/web dev` and visit `http://localhost:3000`
4. **Connect to Cosmos DB**: Store user profiles after successful login
5. **Deploy**: Update production redirect URIs in Azure Portal

## Rollback (If Needed)

If you need to revert to Firebase (not recommended):

```powershell
git checkout main -- apps/web/src/lib/firebase.ts
git checkout main -- apps/web/src/components/Login.tsx
pnpm -C apps/web add firebase react-firebase-hooks
pnpm -C apps/web remove @azure/msal-browser @azure/msal-react
```

## Support

- **Azure AD B2C Docs**: <https://learn.microsoft.com/azure/active-directory-b2c/>
- **MSAL.js Docs**: <https://learn.microsoft.com/azure/active-directory/develop/msal-overview>
- **Pricing**: <https://azure.microsoft.com/pricing/details/active-directory-b2c/>

---

**Migration Date**: 2026-01-XX
**Status**: ✅ Complete - Ready for testing
