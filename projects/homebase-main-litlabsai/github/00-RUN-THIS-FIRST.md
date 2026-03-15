# 🚀 Complete Setup - RUN THIS NOW

## ⚡ Quick Start (2 minutes)

### Step 1: Open Windows PowerShell

```
# DO NOT use WSL - Open native Windows PowerShell
Win + X → PowerShell (Administrator)
```

### Step 2: Navigate to project

```powershell
cd 'e:\VSCode\HomeBase 2.0'
```

### Step 3: Run complete setup

```powershell
.\FINAL-COMPLETE-SETUP.ps1
```

The script will:

- ✅ Setup Google Cloud infrastructure
- ✅ Create service account & key
- ✅ Grant IAM roles
- ✅ Add GitHub secrets
- ✅ Commit all changes
- ✅ Push to GitHub (triggers workflow)
- ✅ Open GitHub Actions dashboard

---

## 📊 What Happens After

### **10-15 Minutes: Automated Deployment**

Your GitHub Actions workflow will:

1. **Build Phase** (~3 min)

   - Install pnpm dependencies
   - Build Next.js frontend
   - Build Azure Functions API
   - Run tests
   - Run linter

2. **Azure Deployment** (~3 min)

   - Push Docker images to Azure Container Registry
   - Deploy web app to Container Apps
   - Deploy API to Container Apps
   - Verify health checks

3. **Google Cloud Deployment** (~3 min)

   - Push Docker images to Google Artifact Registry
   - Deploy web app to Cloud Run
   - Deploy API to Cloud Run
   - Verify health checks

4. **Success Summary** (~1 min)
   - Create deployment summary artifact
   - Generate live URLs
   - Log all endpoints

---

## 🎯 Final Deployment Endpoints

After workflow completes (~15 min):

### **Azure Container Apps** (eastus)

```
Web:  https://homebase-web.azurecontainerapps.io
API:  http://homebase-api.azurecontainerapps.io:5001/api
```

### **Google Cloud Run** (us-central1)

```
Web:  https://homebase-web-xxxxx.run.app
API:  https://homebase-api-xxxxx.run.app
```

### **GitHub Repository**

```
Code: https://github.com/LiTree89/HomeBase-2.0
Actions: https://github.com/LiTree89/HomeBase-2.0/actions
```

---

## 🔗 Monitor Deployment

### **Real-Time Status**

- Open GitHub Actions: https://github.com/LiTree89/HomeBase-2.0/actions
- Watch the workflow execute in real-time
- See logs for each step

### **Verify Deployments**

```powershell
# Check Azure
az containerapp show --name homebase-web --resource-group homebase-rg

# Check Google Cloud
gcloud run services describe homebase-web --region us-central1

# Check latest git commit
git log -1 --oneline
```

---

## 💡 Future Deployments

**Just git push to redeploy!**

```powershell
# Make your changes
code .

# Deploy to all platforms automatically
git add .
git commit -m "Your message"
git push origin main
```

That's it! Your workflow will automatically:

- Test everything
- Deploy to Azure
- Deploy to Google Cloud
- Provide live URLs

---

## 🆘 If Something Fails

### Workflow stops?

1. Check GitHub Actions logs: https://github.com/LiTree89/HomeBase-2.0/actions
2. Look for red X next to step that failed
3. Click on failed step to see error details

### Secrets not working?

```powershell
# Verify secrets are set
gh secret list --repo LiTree89/HomeBase-2.0

# Should show:
# GCP_PROJECT_ID
# GCP_SERVICE_ACCOUNT_KEY
# AZURE_CLIENT_ID
# AZURE_TENANT_ID
# AZURE_SUBSCRIPTION_ID
# REGISTRY_USERNAME
# REGISTRY_PASSWORD
```

### Can't connect to endpoints?

- Wait 1-2 minutes for DNS to propagate
- Check deployment status in Azure Portal / GCP Console
- Verify container is running: `docker ps`

---

## 📝 Configuration Summary

| Setting                | Value                                                      |
| ---------------------- | ---------------------------------------------------------- |
| **GCP Project**        | wise-cycling-479520-n1                                     |
| **GCP Region**         | us-central1                                                |
| **Azure Region**       | eastus                                                     |
| **Service Account**    | github-actions-sa                                          |
| **Artifact Registry**  | us-central1-docker.pkg.dev/wise-cycling-479520-n1/homebase |
| **Container Registry** | homebasecontainers.azurecr.io                              |
| **GitHub Repo**        | LiTree89/HomeBase-2.0                                      |

---

**🎉 You're ready! Run that setup script now! 🚀**
