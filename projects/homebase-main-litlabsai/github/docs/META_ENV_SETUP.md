# Meta Integration - Environment Variables Guide

## Overview

This guide explains the environment variables required for Facebook/Instagram Graph API integration in HomeBase 2.0.

## Required Variables

### Public Variables (Frontend - can be exposed)

These variables are prefixed with `NEXT_PUBLIC_` and are accessible in browser console.

```env
# Meta Application ID
# Get from: https://developers.facebook.com/apps/
NEXT_PUBLIC_META_APP_ID=YOUR_APP_ID_HERE

# Optional: Page Access Token (if you want frontend publishing)
# Not recommended - keep tokens on backend
NEXT_PUBLIC_META_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_HERE
```

### Server-Only Variables (Backend - must be secure)

These variables are NOT prefixed and are only accessible on the server side.

```env
# Meta Application Secret
# NEVER share this publicly
# Get from: https://developers.facebook.com/apps/ → Settings → Basic
META_APP_SECRET=YOUR_APP_SECRET_HERE

# Webhook verification token (you create this)
# Used to verify webhook events from Meta
# Must be at least 8 characters
META_WEBHOOK_VERIFY_TOKEN=YOUR_WEBHOOK_VERIFY_TOKEN_HERE

# Facebook Page Access Token (for backend operations)
# Get from: https://developers.facebook.com/tools/accesstoken/
# Should be a page access token, not user token
META_PAGE_ACCESS_TOKEN=YOUR_PAGE_ACCESS_TOKEN_HERE

# Optional: Business Account ID for multi-account support
META_BUSINESS_ACCOUNT_ID=YOUR_BUSINESS_ACCOUNT_ID_HERE

# Optional: Instagram Business Account ID
META_INSTAGRAM_BUSINESS_ACCOUNT_ID=YOUR_INSTAGRAM_BUSINESS_ACCOUNT_ID_HERE
```

## Step-by-Step Setup

### 1. Create a Meta App

1. Go to [Facebook Developers Dashboard](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Business" as the app type
4. Fill in app details:
   - **App Name**: HomeBase Social Integration
   - **App Contact Email**: your-email@example.com
   - **App Purpose**: Select "Manage business and pages"
5. Accept terms and create app
6. Copy your **App ID** → `NEXT_PUBLIC_META_APP_ID`
7. In Settings → Basic, copy your **App Secret** → `META_APP_SECRET`

### 2. Add Product: Facebook Login

1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" → Click "Set Up"
3. Choose "Web" as your platform
4. In Settings → Facebook Login:
   - Valid OAuth Redirect URIs:
     ```
     http://localhost:3000/api/auth/meta/callback
     https://yourdomain.com/api/auth/meta/callback
     ```
   - Add both development and production URLs

### 3. Add Product: Graph API

1. Back to app dashboard, click "Add Product"
2. Find "Webhooks" → Click "Set Up"
3. In Webhooks settings:
   - **Callback URL**: `https://yourdomain.com/api/webhooks/meta`
   - **Verify Token**: Enter your `META_WEBHOOK_VERIFY_TOKEN`
4. Subscribe to fields you want to monitor:
   - `feed` (for posts)
   - `comments` (for comments)
   - `likes` (for likes)
   - `messages` (for direct messages)

### 4. Get Page Access Token

1. Go to [Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
2. Select your app
3. Click on "Get Token" next to your Facebook page
4. Copy the token → `META_PAGE_ACCESS_TOKEN`
5. **Important**: Use this token for `createFacebookPost()` and other page operations

### 5. Get Instagram Business Account ID

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer)
2. Select your app and get an access token
3. Run query:
   ```
   GET /me/instagram_business_accounts
   ```
4. Copy the `id` from response → `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`

### 6. Get Instagram Business Account Access Token

1. In Graph API Explorer, run:
   ```
   GET /me/accounts?fields=access_token
   ```
2. Copy the access token for your Instagram business account
3. Use as `META_PAGE_ACCESS_TOKEN` (Instagram uses same token endpoint)

## Environment File Example

Create `.env.local` in the root directory:

```env
# ═══════════════════════════════════════════════════════════════
# Meta/Facebook Integration Configuration
# ═══════════════════════════════════════════════════════════════

# Public (Frontend)
NEXT_PUBLIC_META_APP_ID=123456789012345
NEXT_PUBLIC_META_API_VERSION=v18.0

# Secret (Backend Only)
META_APP_SECRET=<REDACTED_IN_DOCS>
META_WEBHOOK_VERIFY_TOKEN=<REDACTED_IN_DOCS>

# Tokens
META_PAGE_ACCESS_TOKEN=<REDACTED_IN_DOCS>
META_INSTAGRAM_BUSINESS_ACCOUNT_ID=17841400000000001

# Optional
META_BUSINESS_ACCOUNT_ID=123456789000000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## Token Refresh Strategy

Access tokens expire at different rates:

- **User Access Tokens**: 60 days (can be extended with refresh token)
- **Page Access Tokens**: Can be made long-lived (60+ days)
- **Instagram Business Tokens**: 60 days

### Making Long-Lived Tokens

To extend page access token lifetime:

```bash
# Using Graph API Explorer or curl
GET /oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={app-id}&
  client_secret={app-secret}&
  fb_exchange_token={your-access-token}
```

## Usage in Code

### Backend (Server-side)

```typescript
import { initializeMetaGraphApi } from '@/lib/meta-graph-api';

const metaApi = initializeMetaGraphApi({
  appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
  appSecret: process.env.META_APP_SECRET || '',
  accessToken: process.env.META_PAGE_ACCESS_TOKEN || '',
  apiVersion: 'v18.0',
});

// Use the API
const pages = await metaApi.getFacebookPages();
const posts = await metaApi.getFacebookPagePosts(pageId, 10);
```

### Frontend (Client-side)

```typescript
import { useMetaGraphApi } from '@/lib/meta-graph-api';

function MyComponent() {
  const metaApi = useMetaGraphApi();

  useEffect(() => {
    metaApi
      .getInstagramBusinessAccount(userId)
      .then(account => console.log(account))
      .catch(error => console.error(error));
  }, []);
}
```

## Security Best Practices

1. **Never commit secrets**: Add `.env.local` and `.env` to `.gitignore`
2. **Use long-lived tokens**: Convert tokens to long-lived versions
3. **Rotate tokens regularly**: Implement token rotation every 30 days
4. **Store tokens securely**: Use environment variables or secure database
5. **Validate webhooks**: Always verify webhook signatures
6. **Use HTTPS**: In production, always use HTTPS for callbacks
7. **Restrict scopes**: Only request scopes your app needs
8. **Monitor token usage**: Set up alerts for suspicious activity

## Webhook Verification Test

To test webhook verification locally:

```bash
# Using curl
curl -X GET "http://localhost:3000/api/webhooks/meta" \
  -G --data-urlencode "hub.mode=subscribe" \
  --data-urlencode "hub.verify_token=YOUR_VERIFY_TOKEN" \
  --data-urlencode "hub.challenge=test_challenge_string"

# Expected response: test_challenge_string
```

## Scopes Required

For different operations, you need these scopes:

| Operation               | Scope                           |
| ----------------------- | ------------------------------- |
| Read Facebook pages     | `pages_read_engagement`         |
| Create posts            | `pages_manage_posts`            |
| Manage metadata         | `pages_manage_metadata`         |
| Read Instagram profile  | `instagram_graph_user_profile`  |
| Read Instagram media    | `instagram_graph_user_media`    |
| Read Instagram insights | `instagram_graph_user_insights` |
| Manage Instagram        | `instagram_graph_user_mgmt`     |

## Troubleshooting

### "Invalid OAuth Access Token"

- Token has expired → Use `refreshAccessToken()`
- Token scope insufficient → Add required scopes and re-authorize
- App was deleted → Create new app

### "Permission Denied"

- Missing scope → Add scope to app settings and re-authorize
- Token is user token, need page token → Get page access token

### "Webhook Signature Verification Failed"

- Signature doesn't match verify token → Check `META_WEBHOOK_VERIFY_TOKEN`
- Using wrong payload → Must use raw request body (not parsed JSON)

### "Rate Limited (429)"

- Too many API calls → Implement rate limiting with exponential backoff
- Check your app rate limits: https://developers.facebook.com/docs/graph-api/overview/rate-limiting

## References

- [Meta Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [Webhooks](https://developers.facebook.com/docs/graph-api/webhooks)
- [Access Tokens](https://developers.facebook.com/docs/facebook-login/access-tokens)

---

**Created**: January 2026  
**Updated**: January 2026  
**Status**: Production Ready
