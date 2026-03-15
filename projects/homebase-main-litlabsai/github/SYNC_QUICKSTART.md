# 🎯 QUICK SYNC REFERENCE

## 🚀 Deploy to All Platforms (GitHub + Azure + Google Cloud)

### Option 1: Via VS Code Tasks (Easiest)

```
Ctrl+Shift+P → Tasks: Run Task
→ "🚀 Deploy: Trigger Multi-Platform Deployment"
```

### Option 2: Via Terminal

```powershell
cd "E:\VSCode\HomeBase 2.0"
git add .
git commit -m "your changes"
git push origin main
```

### Option 3: Manual GitHub Trigger

1. Go to GitHub → Actions
2. Find "Multi-Platform Deployment"
3. Click "Run workflow"

---

## ⚙️ Initial Setup Steps

### 1️⃣ Setup Google Cloud (First Time Only)

```
Ctrl+Shift+P → Tasks: Run Task
→ "🌐 Setup: Google Cloud Integration"
```

This will:

- ✅ Create GCP project config
- ✅ Set up service accounts
- ✅ Generate authentication key
- ✅ Show you what to add to GitHub

### 2️⃣ Add GitHub Secrets

Go to: `https://github.com/YOUR_USERNAME/HomeBase-2.0/settings/secrets/actions`

**Add these secrets:**

- `GCP_PROJECT_ID` → Your GCP project ID
- `GCP_SERVICE_ACCOUNT_KEY` → (from Setup-GoogleCloud.ps1 output)
- `AZURE_CLIENT_ID` → (already set?)
- `AZURE_TENANT_ID` → (already set?)
- `AZURE_SUBSCRIPTION_ID` → (already set?)

### 3️⃣ Create Dockerfiles (If Missing)

```
✅ apps/web/Dockerfile
✅ packages/api/Dockerfile
```

(Template provided in MULTI_PLATFORM_SETUP.md)

### 4️⃣ Push & Deploy

```powershell
git push origin main
```

---

## 📊 Monitor Deployments

### Quick Status Check

```
Ctrl+Shift+P → Tasks: Run Task
→ "📊 Monitor: View Deployment Status"
```

### Detailed Checks

**GitHub:**

```
https://github.com/YOUR_USERNAME/HomeBase-2.0/actions
```

**Azure:**

```powershell
az containerapp show --name homebase-web --resource-group homebase-rg
```

**Google Cloud:**

```powershell
gcloud run services list --region us-central1
gcloud run services logs read homebase-web --region us-central1
```

---

## 🌐 Live URLs (After Deploy)

```
GitHub:  https://github.com/YOUR_USERNAME/HomeBase-2.0
Azure:   https://homebase-web.xyz.azurecontainerapps.io
GCP:     https://homebase-web-xxxxx.run.app
```

---

## 🔄 Auto-Sync Triggers

✅ **Every push** to `main` branch
✅ **Daily** at 2 AM UTC (scheduled)
✅ **Manual** via GitHub Actions UI

---

## ❌ Troubleshooting

**Deployment Failed?**

1. Check: `GitHub → Actions → latest workflow`
2. View logs of failed step
3. Verify all secrets are set correctly

**Google Cloud Issues?**

```powershell
gcloud auth list  # Check if authenticated
gcloud config list  # View current config
```

**Azure Issues?**

```powershell
az account show  # Check current subscription
az containerapp list --resource-group homebase-rg
```

---

## 📝 Important Notes

- 🔐 Never commit `.json` keys to git!
- ⏱️ First deployment takes ~5-10 minutes
- 📦 Builds are cached for speed
- 🌍 All platforms sync simultaneously

---

**All set! Your project will now auto-deploy to GitHub, Azure, and Google Cloud!** 🎉
