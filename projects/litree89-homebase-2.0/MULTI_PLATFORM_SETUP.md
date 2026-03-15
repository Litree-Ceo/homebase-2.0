# 🚀 Multi-Platform Deployment Setup Guide

## Overview

Your project is now configured to automatically sync and deploy to:

- ✅ **GitHub** - Code repository
- ✅ **Azure** - Container Apps
- ✅ **Google Cloud** - Cloud Run

---

## Step 1: Configure GitHub Secrets

Go to: `Settings → Secrets and variables → Actions`

### Azure Secrets (Already Set Up)

```
AZURE_CLIENT_ID        → Your Azure service principal client ID
AZURE_TENANT_ID        → Your Azure tenant ID
AZURE_SUBSCRIPTION_ID  → Your Azure subscription ID
REGISTRY_USERNAME      → ACR username
REGISTRY_PASSWORD      → ACR password
```

### Google Cloud Secrets (NEW - Need Setup)

```
GCP_PROJECT_ID              → Your GCP project ID
GCP_SERVICE_ACCOUNT_KEY     → Your GCP service account JSON key (base64 encoded)
```

---

## Step 2: Set Up Google Cloud

### 2.1 Create a GCP Project

```powershell
# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2.2 Create Service Account

```powershell
# Create service account
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions Deployment"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/run.admin

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/artifactregistry.admin

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 2.3 Add to GitHub Secrets

```powershell
# Base64 encode the key for GitHub
$key = Get-Content key.json -Raw
$encoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($key))
Write-Output $encoded | Set-Clipboard
```

Then paste the encoded value into GitHub Secrets as `GCP_SERVICE_ACCOUNT_KEY`

### 2.4 Create Artifact Repository

```powershell
gcloud artifacts repositories create homebase \
  --repository-format=docker \
  --location=us-central1
```

---

## Step 3: Create Dockerfiles (If Missing)

### apps/web/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### packages/api/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 5001
CMD ["pnpm", "start"]
```

---

## Step 4: Trigger Deployment

### Option A: Push to Main Branch

```bash
git add .
git commit -m "feat: Configure multi-platform deployment"
git push origin main
```

### Option B: Manual Trigger via GitHub UI

1. Go to `.github/workflows/deploy-multi-platform.yml`
2. Click "Run workflow"
3. Select branch and click "Run workflow"

---

## Step 5: Monitor Deployments

### View Workflow Logs

- GitHub: `Actions → deploy-multi-platform`

### Check Deployment Status

```powershell
# Azure
az containerapp show --name homebase-web --resource-group homebase-rg

# Google Cloud
gcloud run services describe homebase-web --region us-central1
```

---

## URLs After Deployment

```
GitHub:      https://github.com/YOUR_USERNAME/HomeBase-2.0
Azure Web:   https://homebase-web.xyz.azurecontainerapps.io
Azure API:   https://homebase-api.xyz.azurecontainerapps.io
GCP Web:     https://homebase-web-xxxxx.run.app
GCP API:     https://homebase-api-xxxxx.run.app
```

---

## Troubleshooting

### Deployment Failed?

1. **Check logs**: `Actions → workflow run → failed step`
2. **Verify secrets**: `Settings → Secrets → check each secret is set`
3. **Test locally**: `pnpm build && pnpm test`

### Google Cloud Issues?

```powershell
# Check authentication
gcloud auth list

# Test artifact push
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/homebase/test:latest

# View service logs
gcloud run services logs read homebase-web --region us-central1
```

### Azure Issues?

```powershell
# Check container apps
az containerapp list --resource-group homebase-rg

# View logs
az containerapp logs show --name homebase-web --resource-group homebase-rg
```

---

## Auto-Sync Schedule

The workflow runs automatically:

- ✅ On every `git push` to `main` branch
- ✅ Daily at 2 AM UTC (for consistency)
- ✅ Manual trigger via GitHub Actions UI

---

## Next Steps

1. ✅ Set up GitHub secrets (this guide)
2. ✅ Create Dockerfiles
3. ✅ Push to main branch
4. ✅ Monitor first deployment
5. ✅ Access your live website!

**Questions?** Check workflow logs or run diagnostic commands above.
