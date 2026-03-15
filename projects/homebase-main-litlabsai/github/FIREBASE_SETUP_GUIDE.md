# 🔥 Firebase Free Tier Setup Guide

## Quick Setup (5 minutes)

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Get Configuration
1. Click gear icon → Project settings
2. Scroll to "Your apps"
3. Click "Web" icon
4. Copy the config object
5. Paste into `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=xxx
```

### 3. Enable Services

#### Authentication
1. Left menu → Authentication
2. Click "Get started"
3. Enable: Email/Password, Google, GitHub
4. Done!

#### Firestore Database
1. Left menu → Firestore Database
2. Click "Create database"
3. Select "Start in test mode"
4. Choose region (us-central1)
5. Click "Create"

#### Cloud Storage
1. Left menu → Storage
2. Click "Get started"
3. Start in test mode
4. Choose region
5. Click "Done"

#### Cloud Functions
1. Left menu → Functions
2. Click "Get started"
3. Select Blaze plan (free tier available)
4. Done!

#### Hosting
1. Left menu → Hosting
2. Click "Get started"
3. Install Firebase CLI: `npm install -g firebase-tools`
4. Initialize: `firebase init hosting`
5. Deploy: `firebase deploy`

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| Authentication | Unlimited users |
| Firestore | 1GB storage, 50k reads/day, 20k writes/day |
| Storage | 5GB total, 1GB/day download |
| Functions | 125k invocations/month |
| Hosting | 1GB storage, 10GB/month bandwidth |

---

## Security Rules

### Firestore Rules
```
- Users can only read/write their own data
- Public data is readable by all
- Authenticated users can create public data
```

### Storage Rules
```
- Users can upload to their own folder (5MB max)
- Public files readable by all
- 5MB file size limit per upload
```

---

## Usage Examples

### Authentication
```typescript
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Sign up
await createUserWithEmailAndPassword(auth, email, password);

// Sign in
await signInWithEmailAndPassword(auth, email, password);

// Sign out
await auth.signOut();
```

### Firestore
```typescript
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Add document
await addDoc(collection(db, 'users'), { name: 'John' });

// Query
const q = query(collection(db, 'users'), where('name', '==', 'John'));
const docs = await getDocs(q);
```

### Storage
```typescript
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Upload
const fileRef = ref(storage, `users/${userId}/file.txt`);
await uploadBytes(fileRef, file);

// Download URL
const url = await getDownloadURL(fileRef);
```

---

## Monitoring Free Tier Usage

1. Go to Firebase Console
2. Click "Usage" tab
3. View daily usage
4. Set up alerts (optional)

---

## Cost Optimization Tips

1. **Firestore**: Use indexes wisely, batch writes
2. **Storage**: Compress images, delete old files
3. **Functions**: Keep execution time short
4. **Hosting**: Use CDN caching

---

## Upgrade to Blaze (Pay-as-you-go)

When free tier limits aren't enough:
1. Go to Billing
2. Click "Upgrade to Blaze"
3. Add payment method
4. Only pay for what you use

---

## Troubleshooting

### "Permission denied" errors
- Check security rules
- Verify user is authenticated
- Check user ID matches

### "Quota exceeded"
- Upgrade to Blaze plan
- Optimize queries
- Batch operations

### "Storage quota exceeded"
- Delete old files
- Compress images
- Upgrade storage

---

## Next Steps

1. Create Firebase project
2. Get configuration
3. Add to `.env.local`
4. Enable services
5. Deploy security rules
6. Test authentication
7. Start building!

---

**Status**: Ready to setup  
**Time**: 5-10 minutes  
**Cost**: FREE

🚀 Let's build!
