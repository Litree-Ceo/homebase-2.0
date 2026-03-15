# 🚀 LiTreeLab Studio Deployment Guide

## Quick Start

Deploy to Azure in 3 steps:

```bash
# 1. Set up Azure credentials
az ad sp create-for-rbac --name "litreelab-studio" --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/litreelab-studio-rg \
  --sdk-auth

# 2. Add AZURE_CREDENTIALS secret to GitHub (Settings > Secrets > Actions)
# Paste the JSON output from the command above

# 3. Push to main - GitHub Actions will deploy automatically!
git push origin main
```

---

## Prerequisites

### Local Development
- **Node.js** 18+ (for frontend build)
- **Python** 3.11+ (for backend)
- **Docker** Desktop (for containerization)
- **Azure CLI** (for Azure deployment)

### Azure Requirements
- Azure subscription ([free tier](https://azure.microsoft.com/free) works)
- Owner or Contributor access to create resources

---

## Local Development

### Option 1: Direct Python
```powershell
cd app_builder
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

cd web
npm install
npm run build

cd ..
python main.py
# Open http://localhost:8000
```

### Option 2: Docker Compose (Recommended)
```powershell
docker-compose up --build
# Open http://localhost:8000
```

---

## Azure Deployment

### Step 1: Create Azure Service Principal

Run this in PowerShell or Azure Cloud Shell:

```powershell
# Login to Azure
az login

# Create service principal for GitHub Actions
$sp = az ad sp create-for-rbac `
  --name "litreelab-studio-deployer" `
  --role contributor `
  --scopes /subscriptions/$(az account show --query id -o tsv) `
  --sdk-auth | ConvertFrom-Json

# Output the credentials - save this JSON!
$sp | ConvertTo-Json -Depth 10
```

### Step 2: Configure GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret

| Secret Name | Value |
|-------------|-------|
| `AZURE_CREDENTIALS` | The entire JSON from Step 1 |

### Step 3: Deploy

Push to main branch - GitHub Actions handles the rest:

```bash
git add .
git commit -m "chore: ready for Azure deployment"
git push origin main
```

Monitor deployment at: https://github.com/Litree-Ceo/litreelab-studio/actions

---

## What Gets Deployed

The GitHub Actions workflow:

1. **Builds** React frontend (`npm run build`)
2. **Creates** Azure resources via Bicep:
   - Azure Container Registry (ACR)
   - App Service Plan (Linux)
   - App Service (Container)
3. **Builds** Docker image
4. **Pushes** image to ACR
5. **Deploys** to App Service
6. **Verifies** deployment

### Resource Naming

| Resource | Name Pattern |
|----------|--------------|
| Resource Group | `litreelab-studio-rg` |
| App Service | `litreelabstudio-prod` |
| Container Registry | `litreelabacr` |

---

## Manual Azure Deployment (Alternative)

If you prefer not using GitHub Actions:

```powershell
# 1. Create resource group
az group create --name litreelab-studio-rg --location eastus

# 2. Deploy infrastructure
az deployment group create `
  --resource-group litreelab-studio-rg `
  --template-file azure.bicep `
  --parameters appName=litreelabstudio

# 3. Build and push Docker image
az acr build --registry litreelabacr --image litreelabstudio:latest ./app_builder

# 4. Get ACR credentials
$creds = az acr credential show --name litreelabacr --query "{u:username, p:passwords[0].value}"

# 5. Configure App Service
az webapp config container set `
  --name litreelabstudio-prod `
  --resource-group litreelab-studio-rg `
  --docker-custom-image-name "litreelabacr.azurecr.io/litreelabstudio:latest" `
  --docker-registry-server-url "https://litreelabacr.azurecr.io" `
  --docker-registry-server-user (echo $creds | jq -r '.u') `
  --docker-registry-server-password (echo $creds | jq -r '.p')
```

---

## Troubleshooting

### Build Fails
```powershell
# Clean and rebuild
cd app_builder/web
Remove-Item -Recurse -Force node_modules, dist
npm install
npm run build
```

### Container Won't Start
Check logs in Azure Portal → App Service → Log stream

Or via CLI:
```powershell
az webapp log tail --name litreelabstudio-prod --resource-group litreelab-studio-rg
```

### 502 Bad Gateway
Usually means the container crashed. Check:
1. PORT environment variable is set to 8000
2. Docker image was built successfully
3. ACR credentials are correct

---

## Cost Estimate (Monthly)

| Resource | SKU | Est. Cost |
|----------|-----|-----------|
| App Service | B1 (Basic) | ~$13/month |
| Container Registry | Basic | ~$5/month |
| **Total** | | **~$18/month** |

Scale up/down by changing `appServiceSku` in `azure.bicep`:
- `B1` - Basic (dev/test)
- `S1` - Standard (production)
- `P1v2` - Premium V2 (high performance)

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   GitHub Repo   │────▶│  GitHub Actions  │────▶│  Azure (ACR)    │
│                 │     │                  │     │  Docker Image   │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  Azure App      │
                                                 │  Service        │
                                                 │  (Container)    │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  React SPA      │
                                                 │  FastAPI API    │
                                                 └─────────────────┘
```

---

## Useful Commands

```powershell
# View deployed resources
az resource list --resource-group litreelab-studio-rg --output table

# Get app URL
az webapp show --name litreelabstudio-prod --resource-group litreelab-studio-rg --query defaultHostName -o tsv

# Restart app
az webapp restart --name litreelabstudio-prod --resource-group litreelab-studio-rg

# View logs
az webapp log tail --name litreelabstudio-prod --resource-group litreelab-studio-rg

# Delete everything (⚠️ Destructive!)
az group delete --name litreelab-studio-rg --yes
```

---

## Support

- GitHub Actions logs: https://github.com/Litree-Ceo/litreelab-studio/actions
- Azure Portal: https://portal.azure.com
- Docs: https://docs.microsoft.com/azure/app-service/
