# ✅ GitHub to Azure DevOps Migration Checklist

## 🟢 COMPLETED (Automatic)

- ✅ Removed GitHub Copilot extensions
- ✅ Removed GitHub authentication configs
- ✅ Removed GitHub protocol overrides
- ✅ Added Azure Pipelines extension
- ✅ Verified `.github/` folder contains only docs (no Actions)
- ✅ Verified `azure-pipelines.yml` is properly configured
- ✅ Verified no GitHub hardcoded URLs in main code

---

## 🔵 YOU NEED TO DO (5-10 minutes)

### Phase 1: Create Azure DevOps Project
- [ ] Go to https://dev.azure.com
- [ ] Click **New Project**
- [ ] Name: `HomeBase`
- [ ] Visibility: **Private**
- [ ] Initialize: **Empty** (don't import from GitHub)

### Phase 2: Migrate Repository
```powershell
cd 'E:\VSCode\HomeBase 2.0'

# Option A: Replace GitHub with Azure DevOps
git remote set-url origin https://dev.azure.com/YOUR_ORG/HomeBase/_git/HomeBase

# Option B: Keep GitHub as backup
git remote rename origin github-backup
git remote add origin https://dev.azure.com/YOUR_ORG/HomeBase/_git/HomeBase

# Push everything
git push -u origin main --force
git push origin --all
git push origin --tags
```

**Replace:**
- `YOUR_ORG` → Your Azure DevOps organization name

### Phase 3: Setup Secrets in Azure DevOps
1. Go to **Pipelines** → **Library**
2. Click **+ Variable group**
3. Name: `homebase-secrets`
4. Add all secrets from your current setup:
   - AZURE_CLIENT_ID
   - AZURE_TENANT_ID
   - AZURE_SUBSCRIPTION_ID
   - ACR_USERNAME
   - ACR_PASSWORD
   - GCP_PROJECT_ID (if using Google Cloud)
   - GCP_SERVICE_ACCOUNT_KEY (if using Google Cloud)

### Phase 4: Setup Azure Pipeline
1. Go to **Pipelines** → **New Pipeline**
2. Select **Azure Repos Git**
3. Select **HomeBase** repository
4. Select **Existing Azure Pipelines YAML file**
5. Path: `azure-pipelines.yml`
6. Click **Save and queue**

### Phase 5: Verify Pipeline Runs
- [ ] Pipeline triggers on push
- [ ] All secrets resolve correctly
- [ ] Docker images build successfully
- [ ] Container Apps deployment succeeds

---

## 🚀 ONE-COMMAND TEST

After migration, run this to verify:

```powershell
git commit --allow-empty -m "test: verify azure devops pipeline"
git push origin main
```

Then check **Azure DevOps → Pipelines** to see it build.

---

## 📊 Current Status

| Component | Status | Location |
|-----------|--------|----------|
| **Repo** | ⏳ Needs migration | GitHub → Azure DevOps |
| **Pipeline** | ✅ Ready | `azure-pipelines.yml` |
| **Secrets** | ⏳ Needs setup | Azure DevOps Library |
| **Code** | ✅ Clean | No GitHub dependencies |
| **Extensions** | ✅ Updated | Only Azure tools |

---

## ⏱️ Time Estimate

- Phase 1 (Create project): **2 min**
- Phase 2 (Push repo): **3 min**
- Phase 3 (Add secrets): **3 min**
- Phase 4 (Setup pipeline): **2 min**
- Phase 5 (Verify): **5 min**

**Total: ~15 minutes**

---

## 🔗 Useful Links

- Azure DevOps: https://dev.azure.com
- Your Azure DevOps Organization: https://dev.azure.com/YOUR_ORG
- Azure Pipelines Docs: https://learn.microsoft.com/azure/devops/pipelines/

---

## 💬 Questions?

See [AZURE_DEVOPS_MIGRATION.md](./AZURE_DEVOPS_MIGRATION.md) for detailed instructions.
