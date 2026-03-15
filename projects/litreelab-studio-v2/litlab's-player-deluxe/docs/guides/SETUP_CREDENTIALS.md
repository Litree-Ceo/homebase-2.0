# 🔐 Secure Credential Setup Guide

This guide will help you securely configure your API keys and credentials.

## ⚠️ IMPORTANT: Security Notice

**NEVER commit these files to git:**
- `.env` (your local environment variables)
- `firebase-credentials.json` (service account keys)
- `API Keys.txt` (any file containing secrets)

These are already excluded in `.gitignore` ✓

---

## Step 1: Generate Secure API Keys

### Dashboard API Key
Run this command to generate a secure random key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and paste it into your `.env` file on the `API_KEY=` line.

### Overlord Bridge Auth Token
Run this command for the WebSocket bridge:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output and paste it into your `.env` file on the `OVERLORD_AUTH_TOKEN=` line.

---

## Step 2: Firebase Configuration (Optional)

### If you want to use Firebase cloud sync:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **"Generate new private key"**
5. Save the downloaded JSON file as `firebase-key.json` in the `overlord-dashboard/dashboard/` folder
6. **Never commit this file!** It's already in `.gitignore`

### Add Firebase to .env:

```bash
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

Find this URL in: Firebase Console → Realtime Database → Data

---

## Step 3: Real-Debrid API Key (Optional)

For streaming/torrent features:

1. Go to https://real-debrid.com/apitoken
2. Copy your API key
3. Add to `.env`:

```bash
RD_API_KEY=your_realdebrid_key_here
```

---

## Step 4: Verify Configuration

After adding your credentials, run:

```bash
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print('API_KEY:', 'SET' if os.getenv('API_KEY') else 'MISSING'); print('OVERLORD_AUTH_TOKEN:', 'SET' if os.getenv('OVERLORD_AUTH_TOKEN') else 'MISSING')"
```

---

## 🚀 Start the Server

Once all credentials are set:

```bash
python server.py
```

Then open: http://localhost:8080

---

## 🔒 Security Checklist

- [ ] `.env` file exists and is NOT committed to git
- [ ] `firebase-key.json` is NOT committed (if using Firebase)
- [ ] `API_KEY` is 32+ characters, random/generated
- [ ] `OVERLORD_AUTH_TOKEN` is 64 hex characters, random/generated
- [ ] `robots.txt` is in place (blocks search engines)
- [ ] SEO meta tags removed from `index.html`

---

**Need help?** Check the main README.md or SECURITY_CHECKLIST.md
