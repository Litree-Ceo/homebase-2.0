# 🚀 HomeBase 2.0 - Backend Setup & Database Configuration

**Status:** ✅ Cosmos DB Connected | ✅ Authentication Endpoints Ready | ⏳ Seed Data Ready to Deploy

---

## 📋 Configuration Checklist

### ✅ Completed Tasks

- [x] **Cosmos DB Connection**

  - Endpoint: `https://your-account.documents.azure.com:443/`
  - Key: Securely stored in `.env.local`
  - Database: `litlab`
  - Containers: posts, profiles, comments, reactions, media, modules, users, sessions

- [x] **Authentication Endpoints Created**

  - `POST /api/auth/register` - Create new user account
  - `POST /api/auth/login` - Authenticate with email + password
  - `POST /api/auth/logout` - Clear session
  - `GET /api/auth/me` - Get current authenticated user

- [x] **Environment Configuration**

  - `.env.local` updated with Cosmos DB credentials (no secrets committed)
  - Cloudinary setup (cloud name: `litlabs`)
  - All required variables in place

- [x] **Seed Data Script**
  - 3 test users created
  - 4 sample posts with media
  - 3 test comments with reactions
  - 4 emoji reactions
  - 3 custom modules (gallery, links, stats)

### ⏳ Pending Tasks

- [ ] Install required dependencies
- [ ] Run seed data script
- [ ] Test authentication endpoints
- [ ] Verify Cosmos DB containers are created
- [ ] Set up Cloudinary upload presets
- [ ] Test media upload functionality

---

## 🔧 Setup Instructions

### Step 1: Install Required Dependencies

```bash
# Install dotenv (for environment variables)
pnpm add dotenv

# Install tsx (for running TypeScript scripts)
pnpm add -D tsx ts-node

# Install @azure/cosmos (already installed)
pnpm install
```

### Step 2: Verify Environment Configuration

Check your `.env.local` file in `apps/web/`:

```bash
# Should contain (add your own secrets locally, never commit them):
COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_KEY=[REDACTED - Set in .env.local only]
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=litlabs
```

✅ **Status:** Environment file configured

### Step 3: Create Cosmos DB Containers

Before seeding, you need to ensure all containers exist. Run this setup:

```bash
# This creates all necessary containers if they don't exist
node scripts/setup-cosmos-containers.js
```

**Containers to create:**

- `users` (Partition key: `/id`)
- `posts` (Partition key: `/partitionKey`)
- `comments` (Partition key: `/partitionKey`)
- `reactions` (Partition key: `/partitionKey`)
- `media` (Partition key: `/userId`)
- `modules` (Partition key: `/partitionKey`)
- `sessions` (Partition key: `/partitionKey`)
- `profiles` (Partition key: `/id`)

### Step 4: Run Seed Data Script

Once environment is configured and containers exist:

```bash
# Seed the database with test data
pnpm seed

# Check seed status
pnpm seed:check
```

**What gets created:**

- ✅ 3 test users (alice, bob, charlie)
- ✅ 4 sample posts with images
- ✅ 3 comments with reactions
- ✅ 4 emoji reactions
- ✅ 3 custom modules

### Step 5: Test Authentication

#### Test User Credentials

```plaintext
Email: alice@example.com
Password: Alice123!
Username: alice
```

```plaintext
Email: bob@example.com
Password: Bob123!
Username: bob
```

```plaintext
Email: charlie@example.com
Password: Charlie123!
Username: charlie
```

#### Test Registration Endpoint

```bash
# Create new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "name": "New User",
    "username": "newuser"
  }'

# Expected response:
# {
#   "success": true,
#   "userId": "user-uuid-here",
#   "message": "User registered successfully"
# }
```

#### Test Login Endpoint

```bash
# Login with credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "Alice123!"
  }'

# Expected response:
# {
#   "success": true,
#   "userId": "user_alice",
#   "name": "Alice Johnson",
#   "avatar": "https://ui-avatars.com/api/?name=Alice+Johnson&background=random",
#   "message": "Login successful"
# }
```

#### Test Get Current User

```bash
# Get authenticated user info
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: session=YOUR_SESSION_TOKEN"

# Expected response:
# {
#   "success": true,
#   "user": {
#     "id": "user_alice",
#     "email": "alice@example.com",
#     "name": "Alice Johnson",
#     "avatar": "https://...",
#     "bio": "🎨 Designer & Creator...",
#     "followers": 245,
#     "following": 128
#   }
# }
```

---

## 📊 Database Schema

### Users Collection

```json
{
  "id": "user_alice",
  "email": "alice@example.com",
  "username": "alice",
  "name": "Alice Johnson",
  "passwordHash": "hashed_password",
  "passwordSalt": "salt_value",
  "avatar": "https://...",
  "bio": "Designer & Creator",
  "followers": 245,
  "following": 128,
  "modules": [],
  "createdAt": "2026-01-05T12:00:00Z",
  "updatedAt": "2026-01-05T12:00:00Z"
}
```

### Posts Collection

```json
{
  "id": "post_1",
  "userId": "user_alice",
  "username": "alice",
  "userAvatar": "https://...",
  "content": "Post content here",
  "media": [
    {
      "url": "https://...",
      "type": "image",
      "alt": "description"
    }
  ],
  "reactions": {
    "❤️": ["user_bob", "user_charlie"],
    "🔥": ["user_bob"]
  },
  "comments": ["comment_id_1", "comment_id_2"],
  "likes": 42,
  "shares": 5,
  "createdAt": "2026-01-05T12:00:00Z"
}
```

### Comments Collection

```json
{
  "id": "comment_1",
  "postId": "post_1",
  "userId": "user_bob",
  "username": "bob",
  "userAvatar": "https://...",
  "text": "Great post!",
  "reactions": {
    "❤️": 2
  },
  "createdAt": "2026-01-05T12:00:00Z"
}
```

### Reactions Collection

```json
{
  "id": "reaction_1",
  "postId": "post_1",
  "userId": "user_bob",
  "emoji": "❤️",
  "createdAt": "2026-01-05T12:00:00Z"
}
```

### Modules Collection

```json
{
  "id": "module_1",
  "userId": "user_alice",
  "type": "gallery",
  "title": "Design Portfolio",
  "config": {
    "columns": 3,
    "spacing": 12,
    "images": ["url1", "url2", "url3"]
  },
  "published": true,
  "createdAt": "2026-01-05T12:00:00Z"
}
```

---

## 🌐 Cloudinary Setup

You have a Cloudinary account configured at `litlabs`. To complete media upload functionality:

### 1. Get Your Cloudinary Credentials

Go to: [Cloudinary Console](https://cloudinary.com/console/)

- Cloud Name: `litlabs` ✅ (already in `.env.local`)
- API Key: Get from dashboard
- API Secret: Get from dashboard

### 2. Create Upload Preset

1. Go to Settings → Upload
2. Click "Add upload preset"
3. Name: `homebase_2026`
4. Unsigned: ON (for client-side uploads)
5. Save

### 3. Update .env.local

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=litlabs
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=homebase_2026
```

### 4. Test Media Upload

```bash
curl -X POST \
  https://api.cloudinary.com/v1_1/litlabs/image/upload \
  -F "file=@/path/to/image.jpg" \
  -F "upload_preset=homebase_2026"
```

---

## 🔐 Security Notes

✅ **Implemented:**

- Passwords hashed with PBKDF2 (1000 iterations)
- HTTP-only secure cookies for session tokens
- Environment variables for sensitive data
- CORS protection

⚠️ **To Implement Before Production:**

- [ ] Add rate limiting to auth endpoints
- [ ] Implement email verification
- [ ] Add 2FA (two-factor authentication)
- [ ] Set up password reset flow
- [ ] Add audit logging
- [ ] Implement content moderation
- [ ] Set up backup strategy

---

## 🐛 Troubleshooting

### Issue: "COSMOS_ENDPOINT or COSMOS_KEY missing"

**Solution:**

```bash
# Check .env.local exists in apps/web/
cd apps/web
ls -la .env.local

# Verify keys are set
grep COSMOS_ENDPOINT .env.local
grep COSMOS_KEY .env.local
```

### Issue: "Container not found" error

**Solution:**

```bash
# Run container setup
node scripts/setup-cosmos-containers.js

# Or manually create in Azure Portal:
# 1. Go to Azure Cosmos DB → litlab
# 2. Click "Container" → "New Container"
# 3. Set Partition Key: /partitionKey
# 4. Container ID: users, posts, comments, etc.
```

### Issue: "Session not found" on `/api/auth/me`

**Solution:**

1. Make sure you're including the session cookie in requests
2. Check cookie is set correctly after login
3. Session expires after 7 days - login again

### Issue: "Database operation failed"

**Solution:**

```bash
# Check Cosmos DB status
az cosmosdb show --name litlab-cosmos --resource-group litlab-prod-rg

# Check credentials
grep COSMOS_ apps/web/.env.local

# Verify database exists
az cosmosdb database show --name litlab-cosmos --resource-group litlab-prod-rg --db-name litlab
```

---

## 📈 Next Steps

1. **Start Dev Server**

   ```bash
   pnpm dev
   ```

2. **Test Authentication**

   - Go to [http://localhost:3000/profile/me](http://localhost:3000/profile/me)
   - Click "Login"
   - Use `alice@example.com` / `Alice123!`

3. **Test Feed**

   - Go to [http://localhost:3000/feed](http://localhost:3000/feed)
   - See seeded posts
   - Try reactions and comments

4. **Test Profile**

   - Visit [http://localhost:3000/profile/alice](http://localhost:3000/profile/alice)
   - See user posts and modules

5. **Test Media Upload**
   - Go to [http://localhost:3000/upload](http://localhost:3000/upload)
   - Upload image (will save to Cloudinary)

---

## 📚 Additional Resources

- [Cosmos DB Best Practices](https://learn.microsoft.com/azure/cosmos-db/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Secure Cookie Best Practices](https://owasp.org/www-community/controls/Cookie_Security)

---

**Status:** ✅ Ready for Testing | Last Updated: January 6, 2026
