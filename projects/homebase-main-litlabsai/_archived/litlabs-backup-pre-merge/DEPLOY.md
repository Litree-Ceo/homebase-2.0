# LitreeLab Studio — Deployment Guide

## Overview
LitreeLab Studio is a Next.js 14 App Router dashboard with Firebase integration. This guide covers:
- **Local Development**: Running the site locally
- **Firebase Setup**: Configuring your Firebase project
- **Deploy to Firebase Hosting**: Publishing to litlabs.net
- **CI/CD**: Optional GitHub Actions setup

---

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase CLI: `npm i -g firebase-tools`

### Setup
1. Clone/download the repo to `litlabs/`
2. Install dependencies:
   ```bash
   cd litlabs
   npm install
   ```
3. Create `.env.local` with your Firebase config:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
   Get these from [Firebase Console](https://console.firebase.google.com) > Project Settings > SDK setup.

4. Run dev server:
   ```bash
   npm run dev
   # or specify port:
   npm run dev -- -p 3002
   ```
   Open http://localhost:3002

---

## Firebase Project Setup

### 1. Create/Configure Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing): `litreelabstudio`
3. Enable these services:
   - **Authentication**: Google + Email/Password
   - **Firestore**: Native mode, location: us-east1 (or nearest)
   - **Storage**: Create a bucket (default public for testing, restrict later)
   - **Hosting**: Enable for custom domain

### 2. Configure Auth
- Firebase Console > Authentication > Sign-in method
- Enable: **Google** and **Email/Password**
- Set authorized redirect URIs:
  - Local: `http://localhost:3000`, `http://localhost:3001`, `http://localhost:3002`
  - Prod: `https://litlabs.net`

### 3. Deploy Firestore Rules
```bash
firebase login
firebase deploy --only firestore:rules
```

### 4. Deploy Storage Rules
```bash
firebase deploy --only storage:rules
```

---

## Deploy to Firebase Hosting (litlabs.net)

### Step 1: Build the Next.js App
```bash
cd litlabs
npm run build
```
Output: `.next/` folder contains the static/optimized build.

### Step 2: Configure Firebase Hosting
Ensure `firebase.json` exists in `litlabs/` (included in repo):
```json
{
  "hosting": {
    "public": ".next/standalone/public",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Step 3: Deploy
```bash
firebase login
firebase deploy --only hosting
```

**First deploy**: Firebase will show you a temporary URL like `https://litreelabstudio.web.app`. Visit it to confirm the app loads.

### Step 4: Connect Custom Domain (litlabs.net)
1. Firebase Console > Hosting > Add custom domain
2. Enter `litlabs.net`
3. Follow DNS setup:
   - Add **A records** for your domain (Firebase shows the IPs):
     - `151.101.1.195`
     - `151.101.65.195`
   - Add **TXT record** for verification (Firebase provides it)
4. Wait 5-15 min for DNS propagation
5. Firebase will auto-verify and issue SSL cert

---

## GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml` to auto-deploy on push:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: cd litlabs && npm ci

      - name: Build
        run: cd litlabs && npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: litreelabstudio

```

**Setup**:
1. Download service account key: Firebase Console > Project Settings > Service Accounts > Generate key
2. Add to GitHub Secrets as `FIREBASE_SERVICE_ACCOUNT` (paste the JSON)
3. Commit & push — GitHub will auto-build and deploy

---

## Environment Variables

| Variable                                   | Required | Example                      |
| ------------------------------------------ | -------- | ---------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Yes      | `AIzaSy...`                  |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Yes      | `studio-xxx.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Yes      | `studio-xxx`                 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Yes      | `studio-xxx.appspot.com`     |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes      | `123456789`                  |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Yes      | `1:123456789:web:abc...`     |

**Note**: These are client-side keys (safe to expose). Keep service account keys private.

---

## Troubleshooting

### Build fails: "Cannot find module"
- Run `npm install` in `litlabs/`
- Check `.env.local` is populated

### Deployment shows blank page
- Ensure `.next/` build folder exists: `npm run build`
- Check `firebase.json` points to correct public folder
- Verify Firestore rules allow reads (or loosen for testing)

### Auth not working
- Confirm Google OAuth is enabled in Firebase Console
- Check authorized redirect URIs include your domain
- Test Google sign-in on `/login` page

### Firestore "permission-denied" errors
- If you see these during dev, it's expected (auth rules are restrictive)
- On `/` homepage, public reads are blocked by default (update rules if needed)
- Logged-in users can access `/studio` (protected route)

---

## Quick Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy everything
firebase deploy

# View Firebase logs
firebase functions:log
```

---

## Support

- **Firebase Docs**: https://firebase.google.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Firebase CLI**: https://firebase.google.com/docs/cli
- **Your App**: http://localhost:3002 (dev)

---

**Last Updated**: 2026-01-30  
**Built with**: Next.js 14.2.3, Firebase, Tailwind CSS  
**@Litree420 Grand Haven 🚀**
