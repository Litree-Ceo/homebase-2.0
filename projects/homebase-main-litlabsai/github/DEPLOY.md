# 🚀 Deployment Guide

## Quick Recommendation

| Platform | Best For | API Routes | Difficulty |
|----------|----------|------------|------------|
| **Vercel** | Next.js apps | ✅ Yes | ⭐ Easiest |
| **Firebase App Hosting** | Firebase ecosystem | ✅ Yes | ⭐⭐ Medium |
| **Cloud Run** | Containerized | ✅ Yes | ⭐⭐⭐ Harder |

---

## Option 1: Vercel (Recommended ⭐)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

**Pros:**
- Native Next.js support
- API routes work automatically
- Fastest deployment

---

## Option 2: Firebase App Hosting

```bash
# In Cloud Shell
gcloud auth login

# Enable Firebase App Hosting
gcloud services enable firebaseapphosting.googleapis.com

# Deploy via Firebase Console
# Go to: https://console.firebase.google.com/project/studio-6082148059-d1fec/apphosting
```

**Pros:**
- Stays in Firebase ecosystem
- Built-in CI/CD
- Supports Next.js SSR

---

## Option 3: Cloud Run (Docker)

```bash
# Build and push container
gcloud builds submit --tag gcr.io/studio-6082148059-d1fec/homebase-web

# Deploy to Cloud Run
gcloud run deploy homebase-web \
  --image gcr.io/studio-6082148059-d1fec/homebase-web \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Environment Variables

Create `.env.local` in `apps/web/`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-6082148059-d1fec.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-6082148059-d1fec
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-6082148059-d1fec.appspot.com

# API
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

---

## Troubleshooting

### Build fails with "output: export"
You have API routes. Use Vercel or Firebase App Hosting instead.

### "Cannot find module"
Run `pnpm install` first.

### Firebase permission denied
```bash
firebase logout
firebase login --no-localhost
```
