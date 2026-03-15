# 🔵 GitHub → Azure DevOps Migration Guide

**Status:** ✅ Complete - All GitHub integrations removed

---

## ✅ What Was Done

1. ✅ Removed GitHub Copilot from extensions
2. ✅ Removed GitHub authentication settings  
3. ✅ Removed GitHub.gitProtocol override
4. ✅ Kept Git functionality (Git is independent of GitHub)
5. ✅ Added Azure Pipelines extension recommendation

---

## 🎯 Next Steps: Complete Repo Migration

### **STEP 1: Prepare Local Repo (5 minutes)**

```powershell
# Navigate to HomeBase
cd 'E:\VSCode\HomeBase 2.0'

# Verify current Git remote (should point to GitHub)
git remote -v

# If you want to keep GitHub as backup
git remote rename origin github-backup
git remote add origin https://dev.azure.com/YOUR_ORG/YOUR_PROJECT/_git/HomeBase

# OR replace directly (recommended)
git remote set-url origin https://dev.azure.com/YOUR_ORG/YOUR_PROJECT/_git/HomeBase
```

### **STEP 2: Create Azure DevOps Project**

1. Go to [dev.azure.com](https://dev.azure.com)
2. Create new project: `HomeBase`
3. Set visibility: **Private**
4. Initialize with empty repo (don't auto-import)

### **STEP 3: Migrate Repository**

```powershell
# Push all branches and history to Azure DevOps
git push -u origin main --force
git push origin --all
git push origin --tags

# Verify
git remote -v
```

### **STEP 4: Setup Azure Pipelines (In Azure DevOps)**

1. Go to **Pipelines** → **New Pipeline**
2. Select **Azure Repos Git**
3. Choose your **HomeBase** repository
4. Select **Existing Azure Pipelines YAML file**
5. Branch: `main` | Path: `azure-pipelines.yml`
6. Save and queue

---

## 🔐 Update Secrets in Azure DevOps

Go to **Pipelines** → **Library** → **Variable Groups**

Ensure these secrets exist:

```
AZURE_CLIENT_ID          → Your Service Principal Client ID
AZURE_TENANT_ID          → Your Azure Tenant ID
AZURE_SUBSCRIPTION_ID    → Your Subscription ID
ACR_USERNAME             → Azure Container Registry username
ACR_PASSWORD             → Azure Container Registry password
GCP_PROJECT_ID           → (Optional) Google Cloud Project ID
GCP_SERVICE_ACCOUNT_KEY  → (Optional) GCP service account key
```

---

## ✨ Benefits of Azure DevOps

| Feature | Azure DevOps | GitHub Actions |
|---------|------------|-----------------|
| **CI/CD Pipelines** | ✅ Full YAML support | ✅ Full YAML support |
| **Cost** | ✅ Free for small teams | ✅ Free with limits |
| **Integration** | ✅ **Native Azure** | ❌ Extra config |
| **Multi-platform** | ✅ Built-in | ❌ Marketplace only |
| **Artifacts** | ✅ Azure Artifacts | ❌ Marketplace |
| **Security** | ✅ Azure AD integration | ❌ GitHub-only |
| **Enterprise** | ✅ Better for Azure shops | ❌ GitHub Enterprise |

---

## 📋 Your Setup

- ✅ **Repository:** Azure Repos
- ✅ **CI/CD:** Azure Pipelines (`azure-pipelines.yml`)
- ✅ **Artifacts:** Azure Container Registry (homebasecontainers)
- ✅ **Deployment:** Azure Container Apps + Google Cloud Run
- ✅ **Secrets:** Azure DevOps Variable Groups
- ✅ **Code Quality:** Codacy (independent)

---

## 🚀 Verify Everything Works

After migration:

```powershell
# 1. Verify repo
git log --oneline | head -5

# 2. Verify remote
git remote -v

# 3. Trigger pipeline (push any change)
git commit --allow-empty -m "chore: verify azure devops pipeline"
git push origin main

# 4. Watch deployment
# Go to Azure DevOps → Pipelines → Your Pipeline Run
```

---

## 🧹 Optional: Delete GitHub Repository

Once verified in Azure DevOps:

1. Go to GitHub → HomeBase repository
2. Settings → Danger Zone → Delete repository
3. Confirm deletion

---

## ❓ Troubleshooting

**"Failed to push to Azure DevOps"**
- Check repo URL format: `https://dev.azure.com/ORG/PROJECT/_git/REPO`
- Verify you have **Contribute** permission in Azure DevOps
- Try: `git remote -v` to see current URL

**"Pipeline doesn't trigger on push"**
- Go to Pipelines → Settings → Triggers
- Enable "Continuous Integration"
- Check branch is `main`

**"Secrets not found"**
- Verify secrets exist in Library → Variable Groups
- Ensure pipeline references correct variable group
- Check secret names match exactly in pipeline YAML

---

## 📚 Reference

- [Azure Pipelines Docs](https://learn.microsoft.com/azure/devops/pipelines/)
- [YAML Pipeline Reference](https://learn.microsoft.com/azure/devops/pipelines/yaml-schema/)
- [Azure DevOps Pricing](https://azure.microsoft.com/pricing/details/devops/azure-devops-services/)

---

**Migration Complete!** 🎉

Your HomeBase project is now fully Azure DevOps-ready. No GitHub dependencies remain in the codebase.
