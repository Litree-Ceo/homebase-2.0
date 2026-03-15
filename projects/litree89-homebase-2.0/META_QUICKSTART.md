# 🚀 Meta Integration - Getting Started (5 Minutes)

## Step 1: Copy Environment Template (30 seconds)

```powershell
# In HomeBase 2.0 root directory
Copy-Item .env.meta.example .env.local
```

Or manually:

```bash
cp .env.meta.example .env.local
```

## Step 2: Create Meta App (2 minutes)

1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Choose "Business" type
4. Fill app details
5. Get **App ID** and **App Secret**

## Step 3: Update .env.local (1 minute)

Edit `.env.local` and fill in:

```env
NEXT_PUBLIC_META_APP_ID=YOUR_APP_ID_FROM_STEP_2
META_APP_SECRET=YOUR_APP_SECRET_FROM_STEP_2
META_WEBHOOK_VERIFY_TOKEN=my_secure_webhook_token_12345
```

## Step 4: Get Page Access Token (1 minute)

1. Go to https://developers.facebook.com/tools/accesstoken/
2. Select your Meta app
3. Click "Get Token" next to your Facebook page
4. Copy and add to `.env.local`:

```env
META_PAGE_ACCESS_TOKEN=PASTE_TOKEN_HERE
```

## Step 5: Start Using! (30 seconds)

### In Your Code:

**Backend:**

```typescript
import { initializeMetaGraphApi } from '@/lib/meta-graph-api';

const metaApi = initializeMetaGraphApi({
  appId: process.env.NEXT_PUBLIC_META_APP_ID!,
  appSecret: process.env.META_APP_SECRET!,
  accessToken: process.env.META_PAGE_ACCESS_TOKEN!,
  apiVersion: 'v18.0',
});

// Get your Facebook pages
const pages = await metaApi.getFacebookPages();
console.log(pages);
```

**Frontend:**

```typescript
import { useMetaGraphApi } from '@/lib/meta-graph-api';

function MyComponent() {
  const metaApi = useMetaGraphApi();

  const handleGetPages = async () => {
    try {
      const pages = await metaApi.getFacebookPages();
      console.log('Pages:', pages);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <button onClick={handleGetPages}>Load Facebook Pages</button>;
}
```

---

## 📚 Next Steps

| Step | What                  | Time   | Link                       |
| ---- | --------------------- | ------ | -------------------------- |
| 1    | Set up OAuth login    | 15 min | See below                  |
| 2    | Add Instagram feed    | 20 min | See below                  |
| 3    | Create post publisher | 25 min | See below                  |
| 4    | Set up webhooks       | 30 min | `docs/META_INTEGRATION.md` |

---

## 🔐 Setting Up OAuth Login (15 minutes)

### In Meta App Dashboard:

1. **Add Facebook Login Product**

   - Go to your app
   - Click "Add Product"
   - Find "Facebook Login"
   - Set up for "Web"

2. **Configure Redirect URIs**
   - Settings → Facebook Login → Valid OAuth Redirect URIs
   - Add both:
     ```
     http://localhost:3000/api/auth/meta/callback
     https://yourdomain.com/api/auth/meta/callback
     ```

### In Your App:

Create a login button component:

```typescript
'use client';

import { useMetaOAuth } from '@/lib/meta-oauth';

export function FacebookLoginButton() {
  const oauthClient = useMetaOAuth();

  const handleLogin = () => {
    try {
      const authUrl = oauthClient.getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Login with Facebook
    </button>
  );
}
```

The callback handler (`/api/auth/meta/callback`) automatically:

- ✅ Exchanges code for token
- ✅ Gets user profile
- ✅ Creates session
- ✅ Redirects to `/dashboard/meta`

---

## 📸 Adding Instagram Feed (20 minutes)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useMetaGraphApi } from '@/lib/meta-graph-api';

export function InstagramFeed() {
  const metaApi = useMetaGraphApi();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const accountId = process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_ACCOUNT_ID!;
        const media = await metaApi.getInstagramMedia(accountId, 12);
        setPosts(media.data || []);
      } catch (error) {
        console.error('Error loading feed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [metaApi]);

  if (loading) return <div>Loading Instagram posts...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {posts.map(post => (
        <div key={post.id} className="aspect-square overflow-hidden rounded">
          <img
            src={post.media_url}
            alt="Post"
            className="w-full h-full object-cover hover:opacity-80 transition"
          />
        </div>
      ))}
    </div>
  );
}
```

Required in `.env.local`:

```env
NEXT_PUBLIC_INSTAGRAM_BUSINESS_ACCOUNT_ID=YOUR_ACCOUNT_ID
```

Get your account ID: Follow steps in `docs/META_ENV_SETUP.md`

---

## 📝 Publishing Posts (25 minutes)

Create a post publisher component:

```typescript
'use client';

import { useState } from 'react';
import { initializeMetaGraphApi } from '@/lib/meta-graph-api';

export function FacebookPostPublisher() {
  const [message, setMessage] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const metaApi = initializeMetaGraphApi({
        appId: process.env.NEXT_PUBLIC_META_APP_ID!,
        appSecret: process.env.META_APP_SECRET!,
        accessToken: process.env.NEXT_PUBLIC_META_ACCESS_TOKEN!,
        apiVersion: 'v18.0',
      });

      const pageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID!;
      const post = await metaApi.createFacebookPost(pageId, message);

      setSuccess(true);
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish post');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="What would you like to share?"
        className="w-full p-4 border rounded resize-none"
        rows={4}
      />
      <button
        onClick={handlePublish}
        disabled={publishing || !message.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
      >
        {publishing ? 'Publishing...' : 'Publish to Facebook'}
      </button>
      {success && <p className="text-green-600">Post published successfully!</p>}
    </div>
  );
}
```

---

## 🔔 Setting Up Webhooks (30 minutes)

### Step 1: Update Meta App Dashboard

**Products → Webhooks → Configuration**

Set:

```
Callback URL: https://yourdomain.com/api/webhooks/meta
Verify Token: (same as META_WEBHOOK_VERIFY_TOKEN)
```

### Step 2: Subscribe to Events

Select your page and choose fields:

- ✅ feed (new posts)
- ✅ comments (new comments)
- ✅ likes (new likes)
- ✅ messages (DMs)

### Step 3: Test Locally

```bash
curl -X GET "http://localhost:3000/api/webhooks/meta" \
  -G --data-urlencode "hub.mode=subscribe" \
  --data-urlencode "hub.verify_token=my_secure_webhook_token_12345" \
  --data-urlencode "hub.challenge=test_challenge"

# Should respond with: test_challenge
```

### Step 4: Customize Event Handling

Edit `/api/webhooks/meta.ts` to handle events:

```typescript
async function handleFacebookFeedEvent(pageId: string, value: any) {
  console.log('New post on page:', pageId);

  // TODO: Store in database
  // TODO: Send notification
  // TODO: Update dashboard

  // Example: Log event
  await db.events.create({
    type: 'facebook_post',
    pageId,
    postId: value.post_id,
    timestamp: new Date(),
  });
}
```

---

## 🐛 Common Issues & Fixes

### "Invalid access token"

**Fix**: Token expired or invalid

- Get new token from https://developers.facebook.com/tools/accesstoken/
- Update `META_PAGE_ACCESS_TOKEN` in `.env.local`
- Restart server

### "Permission denied"

**Fix**: Missing required scope

- In Meta App Dashboard, check app permissions
- Request new authorization with required scopes
- See `docs/META_ENV_SETUP.md` for all scopes

### "Webhook signature verification failed"

**Fix**: Token mismatch

- Check `META_WEBHOOK_VERIFY_TOKEN` in `.env.local`
- Verify same token in Meta App Dashboard
- Must match exactly

### Component not using latest token

**Fix**: Environment not reloaded

- Restart Next.js dev server
- Check `.env.local` is being read
- Clear browser cache

---

## ✅ Quick Checklist

- [ ] Copy `.env.meta.example` to `.env.local`
- [ ] Create Meta app
- [ ] Get App ID and Secret
- [ ] Get Page Access Token
- [ ] Update `.env.local` with credentials
- [ ] Test: `await metaApi.getFacebookPages()`
- [ ] Create login button
- [ ] Test OAuth flow
- [ ] Create Instagram feed component
- [ ] Add post publisher
- [ ] Set up webhooks (optional)

---

## 📞 Need Help?

1. **Setup Issues**: See `docs/META_ENV_SETUP.md`
2. **API Usage**: See `docs/META_INTEGRATION.md`
3. **Code Examples**: Check `/apps/web/src/lib/` files
4. **Meta Docs**: https://developers.facebook.com/docs

---

**⏱️ Total Time**: ~5 minutes for basic setup, 60+ minutes for full integration

**🎉 You're ready to go!**
