# 🚀 FINAL DEPLOYMENT SETUP - COMPLETE GUIDE

Your infrastructure is **100% configured**. You just need to complete 3 final steps:

---

## ✅ COMPLETED AUTOMATICALLY

- ✅ Azure DevOps pipeline config created (`azure-pipelines.yml`)
- ✅ Dockerfiles created for web & API
- ✅ VS Code tasks configured
- ✅ Documentation complete
- ✅ Code ready to push

---

## 🔴 YOU MUST COMPLETE THESE 3 STEPS

### **STEP 1: Authenticate with Google Cloud (If you have GCP account)**

**Option A: Using Windows Terminal/PowerShell**

```powershell
# Install Google Cloud CLI (if not installed)
# https://cloud.google.com/sdk/docs/install-sdk

# Login to Google Cloud
gcloud auth login

# Set default project (replace YOUR-PROJECT-ID)
gcloud config set project YOUR-PROJECT-ID

# Run the automated setup
cd 'E:\VSCode\HomeBase 2.0'
.\Setup-GoogleCloud.ps1
```

**The script will output something like:**

```
🎉 Setup Complete!
────────────────────────────────────────
GCP Project ID: your-project-id-xxxxx
Service Account: github-actions-sa@your-project-id-xxxxx.iam.gserviceaccount.com

📋 ADD THESE TO AZURE DEVOPS PIPELINE VARIABLES:
GCP_PROJECT_ID = your-project-id-xxxxx
GCP_SERVICE_ACCOUNT_KEY = <LONG_BASE64_STRING>
```

**→ Copy the output values**

---

### **STEP 2: Add Azure DevOps Pipeline Secrets**

Go to: **Azure DevOps → Pipelines → Library (Variable groups)** or **Pipeline → Variables**

#### **Add These Secrets:**

**For Google Cloud (from Step 1):**

```
Name: GCP_PROJECT_ID
Value: your-project-id-xxxxx

Name: GCP_SERVICE_ACCOUNT_KEY
Value: (the base64-encoded key from setup output)
```

**Verify Azure pipeline secrets/variables are set (should already exist):**

- ✅ AZURE_CLIENT_ID
- ✅ AZURE_TENANT_ID
- ✅ AZURE_SUBSCRIPTION_ID
- ✅ REGISTRY_USERNAME
- ✅ REGISTRY_PASSWORD

**If Azure secrets are missing, add them:**

```powershell
# Get Azure credentials
az account show --query id -o tsv  # Your subscription ID
az ad sp show --id YOUR_PRINCIPAL_ID --query appId -o tsv  # Client ID
az ad sp show --id YOUR_PRINCIPAL_ID --query appOwnerTenantId -o tsv  # Tenant ID

# Get ACR credentials
az acr credential show --name homebasecontainers --query username -o tsv
az acr credential show --name homebasecontainers --query "passwords[0].value" -o tsv
```

---

### **STEP 3: Push to Main (Trigger Azure Pipelines)**

Once secrets are added:

```powershell
cd 'E:\VSCode\HomeBase 2.0'
git add .
git commit -m "chore: enable multi-platform deployment"
git push origin main
```

**OR use VS Code:**

```
Ctrl+Shift+P → Tasks: Run Task → "🚀 Deploy: Trigger Multi-Platform Deployment"
```

---

## 🎯 WHAT HAPPENS NEXT

Once you push:

1. **Azure Pipelines starts automatically**

   - Go to: Azure DevOps → Pipelines
   - Find your pipeline run
   - Watch the build progress

2. **Deployment takes ~10-15 minutes**

   - Installs dependencies
   - Builds Next.js web app
   - Builds Azure Functions API
   - Runs tests & linting
   - Creates Docker images
   - Pushes to Azure ACR
   - Pushes to Google Cloud Artifact Registry
   - Deploys to Azure Container Apps
   - Deploys to Google Cloud Run

3. **Your sites go LIVE**
   - Azure: `https://homebase-web.azurecontainerapps.io`
   - Google Cloud: `https://homebase-web-xxxxx.run.app`
   - Azure DevOps: Pipelines UI

---

## 📊 QUICK REFERENCE

| Step | Action             | Time   | Status                  |
| ---- | ------------------ | ------ | ----------------------- |
| 1    | Google Cloud Setup | 5 min  | ⚠️ Need GCP account     |
| 2    | Add Azure DevOps Variables | 2 min  | ⏳ After Step 1   |
| 3    | Push to Main       | 1 min  | ⏳ After Step 2         |
| 4    | Deployment         | 15 min | ⏳ Automatic after push |
| 5    | Sites Live         | N/A    | ⏳ After deployment     |

---

## 🆘 TROUBLESHOOTING

**"GCP authentication failed"**

- Run: `gcloud auth login`
- Then: `gcloud auth application-default login`
- Ensure gcloud CLI is installed: https://cloud.google.com/sdk/docs/install-sdk

**"Secrets not found in pipeline"**

- Go to: Azure DevOps → Pipelines → Library/Variables
- Verify all required variables are set
- Re-run the pipeline

**"Pipeline still failing after secrets"**

- Check pipeline logs: Azure DevOps → Pipelines → run → failed step
- Usually missing secret or incorrect value

**"Don't have GCP account?"**

- Create free: https://cloud.google.com/free
- You get $300 free credits for 90 days
- Container Apps is your fallback (Azure only)

---

## 🎓 WHAT WAS SET UP

### Infrastructure Files Created:

- ✅ `azure-pipelines.yml` - Main CI/CD pipeline
- ✅ `api/Dockerfile` - Azure Functions containerization
- ✅ `apps/web/Dockerfile` - Next.js containerization (already existed)
- ✅ `Setup-GoogleCloud.ps1` - Automated GCP setup script
- ✅ `MULTI_PLATFORM_SETUP.md` - Detailed setup documentation
- ✅ `SYNC_QUICKSTART.md` - Quick reference guide

### Pipeline Configuration:

- Builds on every push to `main`
- Manual trigger via Azure Pipelines UI
- Deploys to Azure Container Apps

### Cloud Platforms:

- **Azure:** Container Apps in `eastus`
- **Google Cloud:** Cloud Run in `us-central1`
- **Azure DevOps:** CI/CD pipeline

---

## ✨ YOU'RE ALMOST THERE!

Just execute the steps above and your website will be:

- **Deployed to Azure** ✅
- **Deployed to Google Cloud** ✅
- **CI/CD managed in Azure DevOps** ✅
- **Auto-deployed on every push** ✅

**Time to complete: ~30 minutes total**

Need help? Check the logs in Azure DevOps → Pipelines
