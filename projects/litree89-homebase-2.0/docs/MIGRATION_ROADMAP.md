# 🚧 Firebase to Cosmos DB Migration TODO

## Status: Authentication Complete ✅, Data Layer In Progress 🔄

### Completed

- ✅ Removed Firebase Auth
- ✅ Added Azure AD B2C with MSAL
- ✅ Updated Login.tsx with social buttons (Google, Facebook, Microsoft)
- ✅ Created setup scripts and documentation
- ✅ Deleted firebase.ts config file

### Next: Migrate Data Layer (Firestore → Cosmos DB)

The following files still use Firestore and need migration:

#### 1. **User Profiles** - `apps/web/src/pages/profile/[uid].tsx`

```typescript
// Current (Firestore)
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// TODO: Replace with Cosmos DB
import { CosmosClient } from '@azure/cosmos';
const userContainer = cosmosClient.database('homebase').container('users');
const { resource: user } = await userContainer.item(uid, uid).read();
```

#### 2. **Feed/Posts** - `apps/web/src/components/Feed.tsx`

```typescript
// Current (Firestore)
import { collection, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// TODO: Replace with Cosmos DB
const querySpec = {
  query: 'SELECT * FROM c WHERE c.authorId = @userId ORDER BY c.timestamp DESC',
  parameters: [{ name: '@userId', value: userId }],
};
const { resources: posts } = await container.items.query(querySpec).fetchAll();
```

#### 3. **Post Actions** - `apps/web/src/lib/postActions.ts`

```typescript
// Current (Firestore)
import { updateDoc, increment } from 'firebase/firestore';

// TODO: Replace with Cosmos DB
await container.item(postId, postId).patch([{ op: 'incr', path: '/likes', value: 1 }]);
```

#### 4. **Notifications** - `apps/web/src/components/Notifications.tsx`

```typescript
// Current (Firestore)
import { collection, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// TODO: Replace with Cosmos DB
const querySpec = {
  query: 'SELECT * FROM c WHERE c.userId = @userId AND c.read = false ORDER BY c.timestamp DESC',
  parameters: [{ name: '@userId', value: userId }],
};
```

#### 5. **HomeBase Page** - `apps/web/src/pages/homebase.tsx`

```typescript
// Current (Firebase Auth)
import { auth } from '@/lib/firebase';

// TODO: Replace with MSAL
import { useMsal } from '@azure/msal-react';
const { accounts } = useMsal();
const user = accounts[0];
```

## Migration Strategy

### Option A: Big Bang (Faster, Riskier)

Replace all Firestore calls in one go with Cosmos DB. Requires data migration script.

**Steps:**

1. Create Cosmos DB schema (users, posts, notifications, likes, comments)
2. Write data migration script (export from Firestore, import to Cosmos)
3. Update all 5 files above
4. Test thoroughly
5. Deploy

**Estimated Time:** 4-6 hours

### Option B: Incremental (Safer, Slower)

Migrate one feature at a time, keeping both databases during transition.

**Steps:**

1. Authentication only (✅ DONE)
2. User profiles → Cosmos DB (Week 1)
3. Posts/Feed → Cosmos DB (Week 2)
4. Notifications → Cosmos DB (Week 3)
5. Remove Firestore entirely (Week 4)

**Estimated Time:** 1 month

## Recommended: Option B (Incremental)

Since you already have users and data, incremental migration reduces risk.

## Cosmos DB Setup (If Not Done)

```powershell
# Create Cosmos DB account
az cosmosdb create \
  --name homebase-cosmos \
  --resource-group homebase-rg \
  --locations regionName=eastus failoverPriority=0

# Create database
az cosmosdb sql database create \
  --account-name homebase-cosmos \
  --resource-group homebase-rg \
  --name homebase

# Create containers
az cosmosdb sql container create \
  --account-name homebase-cosmos \
  --resource-group homebase-rg \
  --database-name homebase \
  --name users \
  --partition-key-path "/id" \
  --throughput 400

az cosmosdb sql container create \
  --name posts \
  --partition-key-path "/authorId" \
  --throughput 400

az cosmosdb sql container create \
  --name notifications \
  --partition-key-path "/userId" \
  --throughput 400
```

## Data Schema Migration

### Users (Firestore → Cosmos DB)

```json
{
  "id": "user-uuid",
  "displayName": "John Doe",
  "email": "john@example.com",
  "avatarUrl": "https://...",
  "bio": "Software developer",
  "createdAt": "2026-01-01T00:00:00Z",
  "socialLogins": {
    "google": "google-user-id",
    "facebook": null,
    "microsoft": null
  }
}
```

### Posts (Firestore → Cosmos DB)

```json
{
  "id": "post-uuid",
  "authorId": "user-uuid",
  "content": "Hello world!",
  "timestamp": "2026-01-01T12:00:00Z",
  "likes": 42,
  "comments": 5,
  "likedBy": ["user1", "user2"]
}
```

### Notifications (Firestore → Cosmos DB)

```json
{
  "id": "notif-uuid",
  "userId": "user-uuid",
  "type": "like",
  "fromUserId": "other-user",
  "postId": "post-uuid",
  "read": false,
  "timestamp": "2026-01-01T12:05:00Z"
}
```

## Next Immediate Steps

1. **Test Azure AD B2C Login** (Current Priority)

   ```powershell
   .\scripts\Setup-AzureB2C.ps1 -Interactive
   ```

2. **After login works, migrate user profiles**

   - Update `profile/[uid].tsx` to read from Cosmos DB
   - Create user in Cosmos DB after successful B2C login

3. **Then migrate posts/feed**
   - Update `Feed.tsx` and `postActions.ts`

## Files to Create

- `apps/web/src/lib/cosmos.ts` - Cosmos DB client initialization
- `apps/web/src/lib/repositories/UserRepository.ts` - User CRUD operations
- `apps/web/src/lib/repositories/PostRepository.ts` - Post CRUD operations
- `apps/web/src/lib/repositories/NotificationRepository.ts` - Notification CRUD
- `scripts/Migrate-FirestoreToCosmosDB.ps1` - Data migration script

## Testing Checklist

Before removing Firestore:

- [ ] User login with Google
- [ ] User login with Facebook
- [ ] User login with Microsoft
- [ ] User profile displays correctly
- [ ] Create new post
- [ ] Like/unlike post
- [ ] Comment on post
- [ ] View notifications
- [ ] Mark notification as read
- [ ] Edit user profile
- [ ] Logout

## Support

- **Cosmos DB Docs**: <https://learn.microsoft.com/azure/cosmos-db/>
- **Cosmos DB Best Practices** (see attached instructions)
- **NoSQL → SQL Query Guide**: <https://learn.microsoft.com/azure/cosmos-db/nosql/query/>

---

**Current Phase**: Authentication (✅ Complete)
**Next Phase**: Data Layer Migration (🔄 In Progress)
**Target Completion**: 2-4 weeks (incremental approach)
