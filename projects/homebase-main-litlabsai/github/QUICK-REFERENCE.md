# 🎯 QUICK REFERENCE - COMMANDS TO RUN

## 🚀 DEPLOY YOUR SITE (DO THIS NOW!)

### Step 1: Open Windows PowerShell

```
Press: Win + X
Select: PowerShell (Administrator)
```

### Step 2: Run this command

```powershell
cd 'e:\VSCode\HomeBase 2.0' ; .\FINAL-COMPLETE-SETUP.ps1
```

**That's it!** Everything else is automatic.

---

## ⏱️ What The Setup Script Does

```
✅ Google Cloud setup (2 min)
   ├─ Enable APIs
   ├─ Create service account
   ├─ Grant IAM roles
   ├─ Create credentials
   └─ Setup Artifact Registry

✅ GitHub configuration (1 min)
   ├─ Add GCP_PROJECT_ID secret
   └─ Add GCP_SERVICE_ACCOUNT_KEY secret

✅ Git operations (1 min)
   ├─ Add all files
   ├─ Create commit
   └─ Push to GitHub (TRIGGERS WORKFLOW)

✅ Open GitHub Actions dashboard
```

---

## 📊 What Happens Next (Auto-runs)

**GitHub Actions Workflow** (~15 minutes):

```
BUILD:
  pnpm install          ▓▓▓▓▓▓▓▓░░ 3 min
  Build Next.js         ▓▓▓▓▓░░░░░ 2 min
  Build Azure Funcs     ▓▓▓░░░░░░░ 1 min
  Run tests             ▓▓▓▓░░░░░░ 2 min
  Run linter            ▓▓░░░░░░░░ 1 min

DEPLOY TO AZURE:
  Build Docker images   ▓▓▓▓░░░░░░ 2 min
  Push to ACR           ▓▓░░░░░░░░ 1 min
  Deploy to Container   ▓▓▓▓░░░░░░ 2 min
  Verify endpoints      ▓░░░░░░░░░ 1 min

DEPLOY TO GOOGLE CLOUD:
  Build Docker images   ▓▓▓▓░░░░░░ 2 min
  Push to Registry      ▓▓░░░░░░░░ 1 min
  Deploy to Cloud Run   ▓▓▓▓░░░░░░ 2 min
  Verify endpoints      ▓░░░░░░░░░ 1 min

SUCCESS! ✅ (Total: ~15 min)
```

---

## 🔗 Your Live Endpoints (After Workflow)

```
🐙 GitHub:
   https://github.com/LiTree89/HomeBase-2.0

☁️  Azure:
   Web:  https://homebase-web.azurecontainerapps.io
   API:  http://homebase-api.azurecontainerapps.io:5001/api

🔥 Google Cloud:
   Web:  https://homebase-web-XXXXX.run.app
   API:  https://homebase-api-XXXXX.run.app
```

---

## 📈 Monitor Deployment

### While workflow runs:

```powershell
# Watch real-time logs
gh run watch --repo LiTree89/HomeBase-2.0

# Or open in browser:
https://github.com/LiTree89/HomeBase-2.0/actions
```

### After deployment:

```powershell
# Verify Azure
az containerapp show --name homebase-web --resource-group homebase-rg

# Verify Google Cloud
gcloud run services describe homebase-web --region us-central1
```

---

## 🔄 Future Deployments (Easy!)

```powershell
# Make your changes
code .

# Deploy to ALL platforms with one command:
git add .
git commit -m "Your message"
git push origin main

# That's it! Workflow runs automatically
```

---

## 🛠️ Troubleshooting

### Setup script won't run?

```powershell
# Make sure you're in Windows PowerShell, not WSL
echo $PSVersionTable.PSVersion

# Check if gcloud is available
gcloud --version

# If gcloud not found, reinstall from:
# https://cloud.google.com/sdk/docs/install-sdk
```

### Workflow fails?

```
Open: https://github.com/LiTree89/HomeBase-2.0/actions
Click: Failed workflow
Expand: Each step to see errors
```

### Endpoints not loading?

```
⏳ Wait 2-3 minutes for DNS/containers to start
🔄 Refresh browser
📊 Check platform dashboards:
   Azure: https://portal.azure.com
   GCP: https://console.cloud.google.com
```

---

## 📝 Configuration Reference

| Setting      | Value                  |
| ------------ | ---------------------- |
| GCP Project  | wise-cycling-479520-n1 |
| GCP Region   | us-central1            |
| Azure Region | eastus                 |
| GitHub Org   | LiTree89               |
| GitHub Repo  | HomeBase-2.0           |

---

## 📚 Setup Files Created

✅ **00-RUN-THIS-FIRST.md** - Start here  
✅ **FINAL-COMPLETE-SETUP.ps1** - Main setup script  
✅ **COMPLETE-SETUP-VISUAL-GUIDE.md** - Detailed guide  
✅ **QUICK-REFERENCE.md** - This file  
✅ **.github/workflows/deploy-multi-platform.yml** - CI/CD workflow  
✅ **api/Dockerfile** - API container  
✅ **apps/web/Dockerfile** - Web container

---

## ✨ You're Ready!

Just run:

```powershell
cd 'e:\VSCode\HomeBase 2.0' ; .\FINAL-COMPLETE-SETUP.ps1
```

Everything else is automated! 🚀
