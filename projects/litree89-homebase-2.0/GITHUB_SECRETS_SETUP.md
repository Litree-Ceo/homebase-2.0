# GitHub Secrets Setup - FINAL

## Your Google Cloud Service Account Key Created ✅

**Project ID:** `wise-cycling-479520-n1`
**Service Account:** `github-actions-sa@wise-cycling-479520-n1.iam.gserviceaccount.com`

---

## Step 1: Add These Secrets to GitHub

Go to: [GitHub Repository](https://github.com/LiTree89/HomeBase-2.0)
→ Settings
→ Secrets and variables
→ Actions

### Secret #1: GCP_PROJECT_ID

```bash
Name: GCP_PROJECT_ID
Value: wise-cycling-479520-n1
```

### Secret #2: GCP_SERVICE_ACCOUNT_KEY

The encoded key is in: `gcp-github-key.json` (local file)

To add it:

1. Go to GitHub Secrets
2. Click "New repository secret"
3. Name: `GCP_SERVICE_ACCOUNT_KEY`
4. Value: Copy the entire contents of `E:\VSCode\HomeBase 2.0\gcp-github-key.json`

**Note:** The workflow will automatically encode it when needed.

---

## Step 2: Verify Azure Secrets

Check these exist in GitHub Secrets:

- ✅ AZURE_CLIENT_ID
- ✅ AZURE_TENANT_ID
- ✅ AZURE_SUBSCRIPTION_ID = `0f95fc53-20dc-4c0d-8f76-0108222d5fb1`
- ✅ REGISTRY_USERNAME (Azure ACR username)
- ✅ REGISTRY_PASSWORD (Azure ACR password)

---

## Step 3: Push to GitHub

Once all secrets are added, run:

```powershell
cd "E:\VSCode\HomeBase 2.0"
git add .
git commit -m "chore: enable multi-platform deployment"
git push origin main
```

Or use VS Code Task: **Ctrl+Shift+P → Run Task → "🚀 Deploy: Trigger Multi-Platform Deployment"**

---

## Step 4: Monitor Deployment

Go to: [GitHub Actions](https://github.com/LiTree89/HomeBase-2.0/actions)

Watch for "Multi-Platform Deployment" workflow to start and complete (~15 minutes).

---

## Expected Results

After successful deployment:

- **Azure:** [Azure Container Apps](https://homebase-web.azurecontainerapps.io)
- **Google Cloud:** [Cloud Run](https://homebase-web-[REGION].run.app)
- **GitHub:** Repository synced

---

## Key Files

- `gcp-github-key.json` - Keep secure, never commit
- `.github/workflows/deploy-multi-platform.yml` - CI/CD pipeline
- `docker-compose.yml` - Local development
- `apps/web/Dockerfile` - Web container
- `api/Dockerfile` - API container

**Status: 100% Ready for Deployment** ✅
