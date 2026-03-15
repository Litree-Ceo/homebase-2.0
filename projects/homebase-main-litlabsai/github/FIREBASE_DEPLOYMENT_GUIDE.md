# 🚀 Firebase Hosting & Deployment Guide

## Quick Deploy (2 minutes)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase
```bash
cd c:\Users\litre\homebase-2.0\github\apps\litree-unified
firebase init hosting
```

Select:
- Use existing project
- Select your Firebase project
- Public directory: `.next` (for Next.js)
- Configure as SPA: Yes
- Overwrite: No

### 4. Build and Deploy
```bash
# Build Next.js
pnpm build

# Deploy to Firebase
firebase deploy
```

---

## Deployment Configuration

### firebase.json
```json
{
  "hosting": {
    "public": ".next/standalone/public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### .firebaserc
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

---

## Environment Variables

### Local Development
Create `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

### Production (Firebase Hosting)
1. Go to Firebase Console
2. Project Settings → Environment variables
3. Add variables
4. Redeploy

---

## Continuous Deployment

### GitHub Actions
Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-project-id
```

### Setup GitHub Secrets
1. Go to GitHub repo → Settings → Secrets
2. Add `FIREBASE_SERVICE_ACCOUNT`:
   - Firebase Console → Project Settings
   - Service Accounts → Generate new private key
   - Copy JSON content

---

## Monitoring Deployments

### View Logs
```bash
firebase functions:log
```

### View Hosting Analytics
1. Firebase Console → Hosting
2. Click "Analytics" tab
3. View traffic, errors, performance

### Set Up Alerts
1. Firebase Console → Monitoring
2. Create alert policy
3. Set thresholds
4. Add notification channels

---

## Rollback Deployment

### View Deployment History
```bash
firebase hosting:channel:list
```

### Rollback to Previous Version
```bash
firebase hosting:rollback
```

### Deploy to Preview Channel
```bash
firebase hosting:channel:deploy preview-channel
```

---

## Performance Optimization

### Caching
```javascript
// firebase.json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### Compression
Firebase automatically compresses:
- HTML, CSS, JavaScript
- JSON, XML, SVG
- Images (with optimization)

### CDN
Firebase uses Google's global CDN:
- 150+ edge locations
- Automatic failover
- DDoS protection

---

## Troubleshooting

### "Permission denied" on deploy
```bash
firebase login --reauth
```

### Build fails
```bash
pnpm clean
pnpm install
pnpm build
```

### Deployment stuck
```bash
firebase hosting:disable
firebase deploy
```

### Environment variables not working
1. Verify in Firebase Console
2. Redeploy after adding
3. Check `.env.local` locally

---

## Free Tier Limits

| Resource | Limit |
|----------|-------|
| Storage | 1GB |
| Bandwidth | 10GB/month |
| Deployments | Unlimited |
| Custom domains | 1 free |
| SSL/TLS | Automatic |

---

## Upgrade to Blaze

For higher limits:
1. Firebase Console → Billing
2. Click "Upgrade to Blaze"
3. Add payment method
4. Pay only for what you use

---

## Next Steps

1. Install Firebase CLI
2. Login and initialize
3. Configure firebase.json
4. Build and deploy
5. Monitor performance
6. Set up CI/CD

---

**Status**: Ready to deploy  
**Time**: 5-10 minutes  
**Cost**: FREE (with limits)

🚀 Deploy now!
