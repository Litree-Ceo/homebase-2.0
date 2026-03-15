# 🌐 HOMEBASE 2.0 - COMPLETE DEPLOYMENT GUIDE

## 📍 YOU ARE HERE

```
┌─────────────────────────────────────────────────────────────────┐
│  CURRENT STATUS: Setup Complete - Ready for Final Deployment    │
│  ✅ All infrastructure files created                            │
│  ✅ GitHub Actions workflow configured                          │
│  ✅ Dockerfiles ready                                           │
│  ✅ Google Cloud project authenticated                          │
│  ⏳ AWAITING: Run FINAL-COMPLETE-SETUP.ps1                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 IMMEDIATE ACTION

### **Your next step (copy-paste this):**

```powershell
# Open Windows PowerShell (NOT WSL)
cd 'e:\VSCode\HomeBase 2.0'
.\FINAL-COMPLETE-SETUP.ps1
```

**That's it!** The script handles everything:

- Google Cloud setup
- GitHub secrets
- Git commit
- Deployment trigger

---

## 📊 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         YOUR CODEBASE                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐         │
│  │  apps/web/    │  │     api/       │  │  packages/core/  │         │
│  │  (Next.js)    │  │  (Azure Funcs) │  │  (Shared Utils)  │         │
│  └────────────────┘  └────────────────┘  └──────────────────┘         │
│          ↓                   ↓                      ↓                  │
│     Dockerfile          Dockerfile            (included in both)      │
│    (port 3000)         (port 5001)                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                ↓
                    ┌────────────────────────┐
                    │   GitHub Repository    │
                    │ LiTree89/HomeBase-2.0  │
                    │  (code + trigger)      │
                    └────────────────────────┘
                                ↓
                ┌───────────────┬───────────────┐
                │               │               │
                ↓               ↓               ↓
         ┌──────────────┐ ┌──────────────┐ ┌─────────────┐
         │    AZURE     │ │  GCP (Google)│ │   GitHub    │
         │ Container    │ │   Cloud Run  │ │   Pages     │
         │   Apps       │ │ + Artifact   │ │ (optional)  │
         └──────────────┘ │   Registry   │ └─────────────┘
                         └──────────────┘
         ↓                        ↓
    homebase-web.         homebase-web-
    azurecontainer        xxxxx.run.app
    apps.io
```

---

## 🔄 WORKFLOW EXECUTION TIMELINE

### **GitHub Actions Workflow** (Auto-runs after git push)

```
START
 │
 ├─ [1] Checkout code ...................... 30 sec
 │   └─ Pull latest commit from GitHub
 │
 ├─ [2] Setup Node.js ...................... 1 min
 │   └─ Install Node 20, pnpm
 │
 ├─ [3] Install Dependencies .............. 2-3 min
 │   └─ pnpm install (all workspaces)
 │
 ├─ [4] Build Project ..................... 2-3 min
 │   ├─ Build Next.js frontend
 │   └─ Build Azure Functions API
 │
 ├─ [5] Run Tests ......................... 1-2 min
 │   └─ Jest unit tests
 │
 ├─ [6] Lint Code ......................... 1 min
 │   └─ ESLint + Prettier check
 │
 ├─ [7] Deploy to Azure ................... 2-3 min
 │   ├─ Build Docker images
 │   ├─ Push to homebasecontainers.azurecr.io
 │   ├─ Deploy web to Container Apps
 │   ├─ Deploy API to Container Apps
 │   └─ Verify endpoints live
 │
 ├─ [8] Deploy to Google Cloud ............ 2-3 min
 │   ├─ Build Docker images
 │   ├─ Push to Artifact Registry
 │   ├─ Deploy web to Cloud Run
 │   ├─ Deploy API to Cloud Run
 │   └─ Verify endpoints live
 │
 └─ [9] Create Summary .................... 1 min
     ├─ Collect deployment URLs
     ├─ Generate artifact
     └─ Log all endpoints

SUCCESS ✅ (Total: ~15 minutes)
```

---

## 🎯 FINAL DEPLOYMENT ENDPOINTS

### **After Workflow Completes**

```
┌─────────────────────────────────────────────────────────────────┐
│  🐙 GITHUB                                                       │
│  Repository: https://github.com/LiTree89/HomeBase-2.0           │
│  Actions:    https://github.com/LiTree89/HomeBase-2.0/actions   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ☁️  AZURE CONTAINER APPS (eastus)                              │
│  Web:  https://homebase-web.azurecontainerapps.io              │
│  API:  http://homebase-api.azurecontainerapps.io:5001/api      │
│  Status: az containerapp show --name homebase-web ...          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🔥 GOOGLE CLOUD RUN (us-central1)                              │
│  Web:  https://homebase-web-xxxxx.run.app                      │
│  API:  https://homebase-api-xxxxx.run.app                      │
│  Status: gcloud run services list --region us-central1         │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ CONFIGURATION DETAILS

### **Google Cloud Setup**

| Component         | Value                                                            |
| ----------------- | ---------------------------------------------------------------- |
| Project ID        | wise-cycling-479520-n1                                           |
| Region            | us-central1                                                      |
| Service Account   | github-actions-sa@wise-cycling-479520-n1.iam.gserviceaccount.com |
| Artifact Registry | us-central1-docker.pkg.dev/wise-cycling-479520-n1/homebase       |

**Enabled APIs:**

- Cloud Run
- Artifact Registry
- Container Registry

**IAM Roles:**

- roles/run.admin (deploy to Cloud Run)
- roles/artifactregistry.admin (push images)
- roles/iam.serviceAccountUser (use service account)

### **Azure Setup**

| Component          | Value                         |
| ------------------ | ----------------------------- |
| Region             | eastus                        |
| Container Registry | homebasecontainers.azurecr.io |
| Container Apps     | homebase-web, homebase-api    |

**Secrets (Already Configured):**

- AZURE_CLIENT_ID
- AZURE_TENANT_ID
- AZURE_SUBSCRIPTION_ID
- REGISTRY_USERNAME
- REGISTRY_PASSWORD

---

## 📋 DEPLOYMENT CHECKLIST

Before running setup script:

- [ ] Windows PowerShell open (NOT WSL)
- [ ] Current directory: `e:\VSCode\HomeBase 2.0`
- [ ] GitHub authentication: `git config user.email` is set
- [ ] gcloud CLI installed: `gcloud --version` works
- [ ] GitHub CLI (gh) installed: `gh --version` works (optional, script handles it)

---

## 🔧 TROUBLESHOOTING

### **Setup script fails with "gcloud not found"**

```
❌ You're in WSL bash, not Windows PowerShell
✅ Close terminal, open native Windows PowerShell
   Win + X → PowerShell
```

### **GitHub secrets don't appear**

```
✅ Run: gh secret list --repo LiTree89/HomeBase-2.0
✅ Or manually add at:
   https://github.com/LiTree89/HomeBase-2.0/settings/secrets/actions
```

### **Workflow stuck on Azure deploy**

```
✅ Check Azure credentials in GitHub secrets
✅ Verify Container Registry is accessible:
   az acr login --name homebasecontainers
```

### **Google Cloud deploy fails**

```
✅ Verify service account key:
   gcloud iam service-accounts keys list --iam-account=github-actions-sa@...
✅ Check IAM roles are assigned:
   gcloud projects get-iam-policy wise-cycling-479520-n1
```

---

## 📚 DOCUMENTATION FILES

All setup documentation:

| File                                            | Purpose                             |
| ----------------------------------------------- | ----------------------------------- |
| **00-RUN-THIS-FIRST.md**                        | Quick start guide                   |
| **FINAL-COMPLETE-SETUP.ps1**                    | Full automated setup (run this!)    |
| **MULTI_PLATFORM_SETUP.md**                     | Detailed configuration guide        |
| **SYNC_QUICKSTART.md**                          | Quick reference for deployment      |
| **DEPLOYMENT_SETUP_FINAL.md**                   | Final setup checklist               |
| **.github/workflows/deploy-multi-platform.yml** | GitHub Actions workflow (273 lines) |
| **api/Dockerfile**                              | API container definition            |
| **apps/web/Dockerfile**                         | Web app container definition        |

---

## 🎓 UNDERSTANDING THE SETUP

### **Why This Architecture?**

1. **Multi-Platform**: Deploy to Azure AND Google Cloud simultaneously
2. **Serverless**: Azure Functions + Cloud Run = no server management
3. **Automatic**: Git push = automatic tests + deployments
4. **Cost-Effective**: Only pay for what you use
5. **Scalable**: Handles traffic spikes automatically
6. **Global**: Serve users from nearest data center

### **Why These Tools?**

| Tool                 | Reason                                |
| -------------------- | ------------------------------------- |
| **GitHub Actions**   | Free CI/CD, integrated with GitHub    |
| **Docker**           | Containers = consistent environment   |
| **pnpm**             | Fast, space-efficient package manager |
| **Next.js**          | Fast, full-stack React framework      |
| **Azure Functions**  | Serverless, low-cost API backend      |
| **Google Cloud Run** | Auto-scaling serverless containers    |

---

## 🚀 NEXT STEPS AFTER SETUP

### **Immediate (After deployment)**

1. ✅ Open GitHub Actions
2. ✅ Watch workflow complete
3. ✅ Click Azure endpoint to verify
4. ✅ Click Google Cloud endpoint to verify
5. ✅ Test API with browser/Postman

### **Short-term (Next week)**

1. Add custom domain (use Azure DNS + Google Cloud DNS)
2. Setup SSL certificates (free with Azure + GCP)
3. Monitor costs (Dashboard in both platforms)
4. Setup alerts for errors

### **Medium-term (Next month)**

1. Add more features
2. Optimize performance
3. Add database (Azure Cosmos DB / Cloud Firestore)
4. Setup CI/CD for staging environment

---

## 💬 GET HELP

### **Resources**

- GitHub Actions: https://docs.github.com/actions
- Azure Container Apps: https://docs.microsoft.com/azure/container-apps
- Google Cloud Run: https://cloud.google.com/run/docs
- Next.js: https://nextjs.org/docs
- Azure Functions: https://docs.microsoft.com/azure/azure-functions

### **Common Issues**

- 🔍 Check GitHub Actions logs first
- 📊 Check both platform dashboards
- 🐛 Enable debug logging in workflow
- 💬 Ask in GitHub Issues/Discussions

---

## ✨ YOU'RE ALMOST DONE!

```
Current Status:
┌────────────────────────────────────────┐
│  ✅ Infrastructure setup complete      │
│  ✅ Secrets configured                 │
│  ✅ Workflow ready                     │
│  📍 YOU ARE HERE                       │
│  ⏳ Run setup script (1 command)       │
│  ⏳ Wait for workflow (10-15 min)      │
│  ⏳ Get live URLs!                     │
└────────────────────────────────────────┘
```

---

## 🔥 FINAL COMMAND

Copy and paste this into **Windows PowerShell** (not WSL):

```powershell
cd 'e:\VSCode\HomeBase 2.0' ; .\FINAL-COMPLETE-SETUP.ps1
```

**That's all you need! Everything else is automated! 🚀**

---

**Created**: 2026  
**Project**: HomeBase 2.0  
**Status**: ✨ Production Ready ✨
