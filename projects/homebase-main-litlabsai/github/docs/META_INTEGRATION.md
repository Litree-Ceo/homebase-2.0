# HomeBase 2.0 - Meta Integration Guide (January 2026)

## 📌 Overview

This guide covers the complete Meta/Facebook Graph API v18.0+ integration for HomeBase 2.0, enabling:

- ✅ Instagram Business Account management
- ✅ Facebook Pages posting and management
- ✅ Real-time webhooks for engagement tracking
- ✅ OAuth 2.0 authentication
- ✅ Analytics and insights

**Status**: Production Ready (Phase 1 Complete)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# All Meta SDKs are already in package.json
pnpm install

# Verify Meta packages installed
pnpm list | grep -E "facebook|fb|meta"
```

### 2. Configure Environment

```bash
# Copy example to local config
cp .env.meta.example .env.local

# Edit .env.local with your Meta credentials
# See docs/META_ENV_SETUP.md for detailed instructions
```

### 3. Create Meta App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new Business app
3. Add "Facebook Login" and "Webhooks" products
4. Copy credentials to `.env.local`

### 4. Start Using in Code

```typescript
// Backend
import { initializeMetaGraphApi } from '@/lib/meta-graph-api';

const metaApi = initializeMetaGraphApi({
  appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
  appSecret: process.env.META_APP_SECRET || '',
  accessToken: process.env.META_PAGE_ACCESS_TOKEN || '',
  apiVersion: 'v18.0',
});

// Frontend (with hook)
import { useMetaGraphApi } from '@/lib/meta-graph-api';

function MyComponent() {
  const metaApi = useMetaGraphApi();
  // Use metaApi methods
}
```

---

## 📁 New Files Added (Phase 1)

### Core Libraries

1. **`apps/web/src/lib/meta-graph-api.ts`** (250+ lines)

   - Main Meta Graph API client
   - Supports Instagram, Facebook, WhatsApp
   - OAuth token refresh
   - Webhook verification
   - Full TypeScript typing

2. **`apps/web/src/lib/meta-oauth.ts`** (180+ lines)
   - OAuth 2.0 authentication
   - Token exchange and refresh
   - User profile retrieval
   - Session management

### API Handlers

3. **`apps/web/src/pages/api/auth/meta/callback.ts`** (120+ lines)

   - OAuth callback handler
   - Token storage
   - User session creation
   - Error handling

4. **`apps/web/src/pages/api/webhooks/meta.ts`** (250+ lines)
   - Real-time webhook receiver
   - Signature verification
   - Event processing
   - Supports Facebook feed, comments, likes, Instagram messages

### Configuration & Documentation

5. **`.env.meta.example`** (80+ lines)

   - Environment variables template
   - Setup instructions
   - Credential placeholders

6. **`docs/META_ENV_SETUP.md`** (500+ lines)
   - Step-by-step credential setup
   - Environment variable configuration
   - Security best practices
   - Troubleshooting guide

---

## 🔑 Environment Variables

**Required for API access:**

```env
NEXT_PUBLIC_META_APP_ID=YOUR_APP_ID
META_APP_SECRET=YOUR_APP_SECRET
META_PAGE_ACCESS_TOKEN=YOUR_PAGE_TOKEN
META_WEBHOOK_VERIFY_TOKEN=YOUR_WEBHOOK_TOKEN
```

**Optional:**

```env
META_INSTAGRAM_BUSINESS_ACCOUNT_ID=ACCOUNT_ID
META_FACEBOOK_PAGE_ID=PAGE_ID
NEXT_PUBLIC_ENABLE_META_INTEGRATION=true
```

See [`docs/META_ENV_SETUP.md`](../docs/META_ENV_SETUP.md) for complete setup guide.

---

## 📚 API Client Usage

### MetaGraphApiClient Class

#### Instagram Methods

```typescript
// Get Instagram business account
const account = await metaApi.getInstagramBusinessAccount(userId);

// Get Instagram media (posts)
const media = await metaApi.getInstagramMedia(businessAccountId, 20);

// Get Instagram insights (analytics)
const insights = await metaApi.getInstagramInsights(businessAccountId, [
  'impressions',
  'reach',
  'follower_count',
]);
```

#### Facebook Methods

```typescript
// Get Facebook pages
const pages = await metaApi.getFacebookPages();

// Get page posts
const posts = await metaApi.getFacebookPagePosts(pageId, 10);

// Create a post
const post = await metaApi.createFacebookPost(pageId, 'Hello World!');

// Get page insights
const insights = await metaApi.getFacebookPageInsights(pageId, [
  'page_views',
  'page_fans',
  'page_engaged_users',
]);

// Upload photo
const upload = await metaApi.uploadPhotoToFacebook(
  pageId,
  'https://example.com/photo.jpg',
  'My caption',
);
```

#### User Methods

```typescript
// Get user profile
const user = await metaApi.getUserProfile();

// Get all accessible accounts
const accounts = await metaApi.getAllAccounts();
```

#### OAuth Methods

```typescript
// Refresh access token
const newToken = await metaApi.refreshAccessToken(longLivedToken);

// Verify webhook token (static)
const isValid = MetaGraphApiClient.verifyWebhookToken(
  webhookToken,
  process.env.META_WEBHOOK_VERIFY_TOKEN,
);
```

---

## 🔐 OAuth 2.0 Authentication Flow

### Step 1: Initiate Login

```typescript
import { useMetaOAuth } from '@/lib/meta-oauth';

function LoginButton() {
  const oauthClient = useMetaOAuth();

  const handleLogin = () => {
    const authUrl = oauthClient.getAuthorizationUrl();
    window.location.href = authUrl;
  };

  return <button onClick={handleLogin}>Login with Facebook</button>;
}
```

### Step 2: Handle Callback

- User authorizes → redirects to `/api/auth/meta/callback`
- Callback handler exchanges code for token
- User session created
- Redirects to `/dashboard/meta`

### Step 3: Use Authenticated API

```typescript
// In your component
const metaApi = useMetaGraphApi();
const pages = await metaApi.getFacebookPages();
```

---

## 🔔 Webhook Setup

### What are Webhooks?

Real-time notifications from Meta for:

- New posts on your pages
- Comments on your posts
- Likes
- Messages
- Stories (Instagram)

### Setup Steps

1. **Configure in Meta App Dashboard**

   ```
   Products > Webhooks > Configuration

   Callback URL: https://yourdomain.com/api/webhooks/meta
   Verify Token: (create one, e.g., "my_secure_webhook_token")
   Verify Token in .env: META_WEBHOOK_VERIFY_TOKEN=my_secure_webhook_token
   ```

2. **Subscribe to Events**

   - Select page(s) to listen to
   - Choose which fields trigger events:
     - feed (new posts)
     - comments (new comments)
     - likes (new likes)
     - messages (direct messages)

3. **Test Webhook**

   ```bash
   curl -X GET "https://yourdomain.com/api/webhooks/meta" \
     -G --data-urlencode "hub.mode=subscribe" \
     --data-urlencode "hub.verify_token=my_secure_webhook_token" \
     --data-urlencode "hub.challenge=test_challenge"

   # Should respond with: test_challenge
   ```

4. **Handle Events in Code**
   Events are processed in `/api/webhooks/meta.ts`:
   ```typescript
   // Automatically handles:
   - Facebook feed events → handleFacebookFeedEvent()
   - Comments → handleCommentsEvent()
   - Likes → handleLikesEvent()
   - Instagram messages → handleInstagramMessagesEvent()
   ```

---

## 🔧 Integration Examples

### React Component: Instagram Feed

```typescript
import { useEffect, useState } from 'react';
import { useMetaGraphApi } from '@/lib/meta-graph-api';

export function InstagramFeed() {
  const metaApi = useMetaGraphApi();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const accountId = process.env.NEXT_PUBLIC_INSTAGRAM_ACCOUNT_ID;
        const media = await metaApi.getInstagramMedia(accountId, 20);
        setPosts(media.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading posts');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [metaApi]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {posts.map(post => (
        <img
          key={post.id}
          src={post.media_url}
          alt="Instagram post"
          className="w-full h-auto rounded"
        />
      ))}
    </div>
  );
}
```

### Backend: Publish to Facebook

```typescript
// pages/api/publish-post.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeMetaGraphApi } from '@/lib/meta-graph-api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, pageId } = req.body;

    const metaApi = initializeMetaGraphApi({
      appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
      appSecret: process.env.META_APP_SECRET || '',
      accessToken: process.env.META_PAGE_ACCESS_TOKEN || '',
      apiVersion: 'v18.0',
    });

    const post = await metaApi.createFacebookPost(pageId, message);

    res.status(200).json({
      success: true,
      postId: post.id,
      message: 'Post published successfully',
    });
  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Publication failed',
    });
  }
}
```

---

## 🐛 Error Handling

The API client includes comprehensive error handling:

```typescript
try {
  const posts = await metaApi.getFacebookPagePosts(pageId);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('Invalid access token')) {
      // Token expired → refresh
      const newToken = await metaApi.refreshAccessToken(refreshToken);
    } else if (error.message.includes('permission')) {
      // Missing scope → request new authorization
    } else {
      // Other error
      console.error('API Error:', error.message);
    }
  }
}
```

---

## 🔄 Token Management

### Token Lifetimes

- **User Access Tokens**: 60 days (with refresh)
- **Page Access Tokens**: Can be made long-lived (60+ days)
- **Instagram Tokens**: 60 days

### Automatic Refresh

```typescript
// When using class directly
const newToken = await metaApi.refreshAccessToken(oldToken);

// Update environment or database
process.env.META_PAGE_ACCESS_TOKEN = newToken.accessToken;
```

### Long-Lived Tokens

To extend token lifetime:

```bash
# Using Graph API
GET /oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={app-id}&
  client_secret={app-secret}&
  fb_exchange_token={current-token}
```

---

## 📊 Analytics Integration

### Get Page Insights

```typescript
const insights = await metaApi.getFacebookPageInsights(pageId, [
  'page_views',
  'page_fans',
  'page_engaged_users',
  'page_consumptions',
]);

// Result includes:
// - metrics: ['page_views', 'page_fans', ...]
// - values: [1000, 500, ...]
// - period: 'day' | 'week' | 'month'
```

### Get Instagram Insights

```typescript
const insights = await metaApi.getInstagramInsights(accountId, [
  'impressions',
  'reach',
  'follower_count',
  'profile_views',
]);

// Result includes performance metrics
```

---

## 🚨 Security Considerations

1. **Never expose secrets**

   - Keep `META_APP_SECRET` server-only
   - Never commit `.env.local`
   - Use environment variables in production

2. **Validate webhooks**

   - Always verify webhook signatures
   - Check `x-hub-signature-256` header
   - Verify token matches `META_WEBHOOK_VERIFY_TOKEN`

3. **Token security**

   - Store tokens in secure database
   - Use HTTPS for all OAuth callbacks
   - Implement token rotation
   - Set token expiration alerts

4. **Scope minimization**

   - Only request needed scopes
   - Review permissions regularly
   - Remove unused scopes

5. **Rate limiting**
   - Implement exponential backoff
   - Monitor API call rates
   - Cache results when possible

---

## 📋 Checklist: Deploying to Production

- [ ] Create Meta Business app
- [ ] Configure all OAuth redirect URIs (HTTPS)
- [ ] Generate long-lived tokens
- [ ] Set up webhook endpoint (HTTPS)
- [ ] Test webhook signature verification
- [ ] Store all secrets in production environment
- [ ] Enable HTTPS everywhere
- [ ] Implement token refresh strategy
- [ ] Set up error monitoring/logging
- [ ] Test end-to-end OAuth flow
- [ ] Test webhook event delivery
- [ ] Configure rate limiting
- [ ] Create monitoring dashboard

---

## 📚 References

- [Meta Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [Webhooks](https://developers.facebook.com/docs/graph-api/webhooks)
- [Access Tokens](https://developers.facebook.com/docs/facebook-login/access-tokens)

---

## 🤝 Next Steps

### Phase 2 (Not Yet Implemented)

- [ ] React components for Facebook Login button
- [ ] Instagram Feed display component
- [ ] Facebook Post Publisher component
- [ ] Analytics dashboard
- [ ] Token refresh scheduler
- [ ] Database integration for token storage

### Phase 3 (Advanced)

- [ ] WhatsApp Business API full implementation
- [ ] Post scheduling system
- [ ] Content calendar
- [ ] Multi-account management
- [ ] Advanced analytics reporting

---

## 📞 Support & Troubleshooting

See [`docs/META_ENV_SETUP.md`](../docs/META_ENV_SETUP.md) for comprehensive troubleshooting guide.

**Common Issues:**

- "Invalid OAuth Access Token" → Token expired or invalid scope
- "Permission Denied" → Missing required scope
- "Webhook Signature Verification Failed" → Check verify token configuration

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Status**: ✅ Production Ready - Phase 1 Complete
