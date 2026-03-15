# 🔥 Firebase Setup Guide

Complete guide to deploy Overlord Dashboard with Firebase Hosting and Realtime Database.

---

## 📋 Prerequisites

- **Node.js** installed (for Firebase CLI)
- **Firebase CLI** installed: `npm install -g firebase-tools`
- **Firebase account** (free tier works)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Name it: `overlord-dashboard` (or your choice)
4. Click through the setup (disable Google Analytics if you want)
5. **Copy your Project ID** (e.g., `overlord-dashboard-a1b2c`)

### Step 2: Enable Firebase Services

#### A. Enable Realtime Database

1. In Firebase Console → **Realtime Database**
2. Click **Create Database**
3. Choose location (e.g., `us-central1`)
4. Start in **Test mode** (we'll secure it later)
5. **Copy your Database URL** (e.g., `https://overlord-dashboard-a1b2c-default-rtdb.firebaseio.com`)

#### B. Enable Firebase Hosting

1. In Firebase Console → **Hosting**
2. Click **Get Started** → click through the wizard

### Step 3: Download Service Account Key

1. Firebase Console → ⚙️ **Project Settings** → **Service Accounts** tab
2. Click **Generate new private key**
3. Save the file as `firebase-key.json` in your Overlord directory:
   ```
   C:\Users\litre\Desktop\Overlord-Pc-Dashboard\firebase-key.json
   ```

### Step 4: Update Configuration Files

#### A. Update `.firebaserc`

```json
{
  "projects": {
    "default": "YOUR-PROJECT-ID-HERE"
  }
}
```

Replace `YOUR-PROJECT-ID-HERE` with your actual Project ID from Step 1.

#### B. Update `config.yaml`

```yaml
firebase:
  enabled: true  # ← Change from false to true
  database_url: "https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com"
  service_account_key: "firebase-key.json"
```

Replace `YOUR-PROJECT-ID` with your actual Project ID.

### Step 5: Install Python Firebase SDK

```powershell
pip install firebase-admin
```

### Step 6: Deploy!

```powershell
# Deploy dashboard to Firebase Hosting
.\deploy-firebase.ps1

# Start Python server (will now push stats to Firebase)
python server.py
```

---

## 🌐 Access Your Dashboard

After deployment:

- **Live Dashboard**: `https://YOUR-PROJECT-ID.web.app`
- **Local Dashboard**: `http://localhost:8080` (same as before)

Both dashboards show the same data in real-time!

---

## 🔐 Secure Your Database (Important!)

After testing, secure your Realtime Database:

1. Firebase Console → **Realtime Database** → **Rules** tab
2. Replace with:

```json
{
  "rules": {
    "stats": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

3. Click **Publish**

This requires authentication. Update `database.rules.json` for custom rules.

---

## 🔧 Troubleshooting

### "Permission denied" on Firebase

- Check database rules in Firebase Console
- Verify `firebase-key.json` exists and is readable
- Ensure service account has "Firebase Realtime Database Admin" role

### "Database URL not found"

- Double-check the URL in `config.yaml` matches Firebase Console
- Remove trailing slashes from the URL

### "firebase command not found"

```powershell
npm install -g firebase-tools
```

### Dashboard shows old data

- Clear browser cache (Ctrl+Shift+R)
- Check Firebase Console → Realtime Database for live data
- Verify Python server logs show "Firebase: ACTIVE"

---

## 📊 How It Works

```
┌─────────────┐
│ Your PC     │
│ server.py   │ ← Monitors system stats
│   ↓         │
│ Firebase DB │ ← Pushes stats every 2s
└─────────────┘
       ↓
  ┌────────────────────────────┐
  │ Firebase Realtime Database │ ← Cloud storage
  └────────────────────────────┘
       ↓
  ┌────────────────────────────┐
  │ Firebase Hosting           │ ← Serves dashboard
  │ https://your-app.web.app   │
  └────────────────────────────┘
       ↓
  ┌────────────────────────────┐
  │ Phone / Tablet / Any Device│ ← View anywhere
  └────────────────────────────┘
```

---

## 🎯 What You Get

✅ **Real-time monitoring** from any device  
✅ **Zero-config networking** (no port forwarding)  
✅ **HTTPS by default** (Firebase Hosting)  
✅ **Free tier** supports thousands of connections  
✅ **Global CDN** for fast loading anywhere  

---

## 🔄 Daily Usage

```powershell
# Start local server (pushes to Firebase)
python server.py

# Or use deployment script
.\deploy.ps1

# Update Firebase dashboard
.\deploy-firebase.ps1

# Sync and push changes
.\sync.ps1
```

---

## 📱 Mobile Access

1. Open `https://YOUR-PROJECT-ID.web.app` on your phone
2. Tap **Share** → **Add to Home Screen**
3. Now it's a native-like app! (PWA)

---

## 💡 Tips

- **Local first**: Your PC server works offline, Firebase is optional
- **Hybrid mode**: Keep both local (`http://localhost:8080`) and cloud access
- **Multiple PCs**: Run server on multiple PCs, each pushes to different Firebase paths
- **History**: Firebase stores last 100 snapshots automatically

---

Need help? Check [Firebase Documentation](https://firebase.google.com/docs) or open an issue.
