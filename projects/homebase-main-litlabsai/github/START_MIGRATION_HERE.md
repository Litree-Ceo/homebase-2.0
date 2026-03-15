# 🚀 Execute GitHub to Azure DevOps Migration

**Status:** Ready to Execute  
**Time Required:** 15 minutes  

---

## ✅ What's Ready

Everything is prepared. You have 3 options to proceed:

---

## Option 1️⃣: Automated (Recommended - 5 minutes)

### Prerequisites
- ✅ Azure DevOps account (free)
- ✅ Git installed
- ✅ PowerShell 5.0+

### Execute
```powershell
cd 'E:\VSCode\HomeBase 2.0'

# Run the automated migration
.\Migrate-ToAzureDevOps.ps1 -AzureOrgName 'YOUR_ORG_NAME'
```

**Replace `YOUR_ORG_NAME`** with your actual Azure DevOps organization.

### What It Does
1. Validates Git setup
2. Updates remote URL to Azure DevOps
3. Pushes all branches and tags
4. Shows success summary and next steps

---

## Option 2️⃣: Manual (Full Control - 10 minutes)

### 1. Create Azure DevOps Project

```
1. Go to https://dev.azure.com
2. Click "New project"
3. Name: HomeBase
4. Visibility: Private
5. Click "Create"
```

### 2. Update Git Remote

```powershell
cd 'E:\VSCode\HomeBase 2.0'

# Replace YOUR_ORG with your organization name
git remote set-url origin https://dev.azure.com/YOUR_ORG/HomeBase/_git/HomeBase
```

### 3. Push Everything

```powershell
git push -u origin main --force
git push origin --all
git push origin --tags
```

### 4. Verify

```powershell
git remote -v
# Should show Azure DevOps URL for origin
```

---

## Option 3️⃣: Keep GitHub as Backup (15 minutes)

If you want to keep GitHub as a secondary remote:

```powershell
cd 'E:\VSCode\HomeBase 2.0'

# Backup GitHub
git remote rename origin github-backup

# Add Azure DevOps as primary
git remote add origin https://dev.azure.com/YOUR_ORG/HomeBase/_git/HomeBase

# Push everything
git push -u origin main --force
git push origin --all
git push origin --tags

# Verify
git remote -v
```

---

## After Migration: Setup Secrets (5 minutes)

Once repo is in Azure DevOps:

### 1. Create Variable Group

In Azure DevOps:
1. Go to **Pipelines** → **Library**
2. Click **+ Variable group**
3. Name: `homebase-secrets`
4. Check **Link secrets from an Azure key vault** (optional)

### 2. Add Secrets

```
AZURE_CLIENT_ID           = <your client id>
AZURE_TENANT_ID           = <your tenant id>
AZURE_SUBSCRIPTION_ID     = <your subscription id>
ACR_USERNAME              = <acr username>
ACR_PASSWORD              = <acr password>
GCP_PROJECT_ID            = <optional>
GCP_SERVICE_ACCOUNT_KEY   = <optional>
```

**Get these values:**

```powershell
# Azure values
az account show --query id -o tsv              # AZURE_SUBSCRIPTION_ID
az account show --query tenantId -o tsv        # AZURE_TENANT_ID
az account show --query user.name -o tsv       # Your account

# Service Principal (if applicable)
az ad sp show --id YOUR_CLIENT_ID --query appId -o tsv

# Container Registry
az acr credential show --name homebasecontainers --query username -o tsv
az acr credential show --name homebasecontainers --query "passwords[0].value" -o tsv
```

---

## Final: Setup Azure Pipeline (3 minutes)

### 1. Create New Pipeline

In Azure DevOps:
1. Go to **Pipelines**
2. Click **New pipeline**
3. Select **Azure Repos Git**
4. Select **HomeBase** repository
5. Select **Existing Azure Pipelines YAML file**
6. Path: `azure-pipelines.yml`
7. Click **Review** → **Save and queue**

### 2. Verify Pipeline Triggers

Test it:
```powershell
git commit --allow-empty -m "test: verify azure devops pipeline"
git push origin main
```

Watch: **Azure DevOps → Pipelines** - should see your build running ✅

---

## 📋 Complete Checklist

- [ ] Created Azure DevOps project (Option 1-3)
- [ ] Updated Git remote
- [ ] Pushed all content
- [ ] Verified remote with `git remote -v`
- [ ] Created variable group with secrets
- [ ] Setup Azure Pipeline from YAML
- [ ] Pushed test commit
- [ ] Pipeline completed successfully
- [ ] Container Apps deployed
- [ ] Website live at Azure FQDN

---

## 🎯 What Happens After

Your development workflow **doesn't change**:

```powershell
# Same as always
git clone https://dev.azure.com/YOUR_ORG/HomeBase/_git/HomeBase
git commit -m "my feature"
git push origin main

# Pipeline automatically:
# 1. Builds Docker images
# 2. Pushes to Azure Container Registry
# 3. Deploys to Azure Container Apps
# 4. Updates your live website
```

---

## 🔄 Git is Universal

No matter where the repo is hosted, Git commands are **identical**:

```powershell
git clone <url>
git pull
git push
git commit
git branch
git tag
```

Only the URL changes:
- **GitHub:** `https://github.com/USER/REPO.git`
- **Azure DevOps:** `https://dev.azure.com/ORG/PROJECT/_git/REPO`

---

## ❓ FAQ

**Q: Do I need to reinstall anything?**  
A: No. Git is git. Nothing changes locally.

**Q: What if I make a mistake?**  
A: Your GitHub repo still exists. Push back anytime:
```powershell
git remote set-url origin https://github.com/YOUR_ORG/HomeBase-2.0.git
```

**Q: Will my commit history be preserved?**  
A: Yes, everything moves to Azure DevOps.

**Q: Can I sync both GitHub and Azure DevOps?**  
A: Yes, if you want. See Option 3 for keeping GitHub as backup.

---

## 🚀 Let's Go!

Choose your option above and execute. The entire process takes **15-30 minutes**.

**Most users:** Use **Option 1** (automated script) - it's fastest and safest.

---

**Questions?** See:
- `AZURE_DEVOPS_MIGRATION.md` - Step-by-step detailed guide
- `GITHUB_TO_AZUREDEVOPS_CHECKLIST.md` - Quick reference
- `MIGRATION_SUMMARY.md` - Overview and architecture
