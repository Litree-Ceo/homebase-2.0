# ✅ LITLABS Production Blueprint - Pre-Deployment Checklist

**Status**: Ready for Production  
**Last Validated**: January 3, 2026  
**Confidence**: ⭐⭐⭐⭐⭐

---

## 🔧 Prerequisites (Before Running Anything)

### Azure Setup
- [ ] Azure Subscription: `0f95fc53-20dc-4c0d-8f76-0108222d5fb1` (**LITLABS Production**)
- [ ] Resource Group: `litreelabstudio-rg` (eastus)
- [ ] Key Vault: `kvprodlitree14210` (existing, with secrets)
- [ ] Run: `az login` (authenticate Azure CLI)

### Local Machine
- [ ] Windows 11 with PowerShell 7+
- [ ] Node 20+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] Docker Desktop running (for emulators)
- [ ] Azure CLI installed (`az --version`)
- [ ] VS Code with Copilot + Azure extensions

### Permissions
- [ ] Contributor role on subscription (for Bicep deployments)
- [ ] Access to Key Vault (list secrets, get secrets)
- [ ] GitHub write access (for Actions secrets)

---

## 📋 One-Time Setup (5-10 minutes)

### Step 1: Validate Azure Context
```powershell
# Run this from repo root: e:\VSCode\HomeBase 2.0
.\set-subscription.ps1

# Expected output:
# ✓ Azure CLI found
# ✓ Available subscriptions listed
# ✓ Subscription set to LITLABS Production
# ✓ Resources in litreelabstudio-rg listed
```

### Step 2: Wire Key Vault Secrets
```powershell
# Populate .env.local files + Function App settings
.\wire-keyvault.ps1

# Expected output:
# ✓ Key Vault found: kvprodlitree14210
# ✓ 10 secrets retrieved
# ✓ .env.local files created
# ✓ Function App settings configured
```

### Step 3: Start Local Emulators
```powershell
# Start all 6 Docker services
docker-compose -f docker/docker-compose.yml up -d

# Or use helper:
.\docker\up.ps1

# Expected output:
# ✓ Cosmos DB running on localhost:8081
# ✓ Azurite running on localhost:10000-10002
# ✓ PostgreSQL running on localhost:5432
# ✓ Redis running on localhost:6379
# ✓ MongoDB running on localhost:27017
# ✓ Mailhog running on localhost:1025, 8025
```

### Step 4: Boot Development Servers
```powershell
# Auto-detect npm manager + start API + Web
.\litlab-first-run.auto.ps1

# Expected output (2 new terminal windows):
# ✓ API server running on http://localhost:7071/api/
# ✓ Web server running on http://localhost:3000 (auto-opens)
```

---

## 🚀 Deploy Infrastructure (Azure)

### Option 1: Manual Deployment (Recommended for First Time)
```powershell
# 1. Deploy core infrastructure
az deployment group create \
  --name litlabs-deploy-core \
  --resource-group litreelabstudio-rg \
  --template-file infra/bicep/main.bicep \
  --parameters infra/bicep/parameters.json

# Wait for completion (~5 minutes)

# 2. Deploy Front Door + WAF
az deployment group create \
  --name litlabs-deploy-fd-waf \
  --resource-group litreelabstudio-rg \
  --template-file infra/bicep/frontdoor-waf.bicep

# 3. Deploy Monitoring
az deployment group create \
  --name litlabs-deploy-monitoring \
  --resource-group litreelabstudio-rg \
  --template-file infra/bicep/monitoring.bicep
```

### Option 2: CI/CD Deployment (GitHub Actions)
```powershell
# 1. Configure GitHub secrets:
#    - AZURE_SUBSCRIPTION_ID
#    - AZURE_TENANT_ID
#    - AZURE_CLIENT_ID
#    - AZURE_STATIC_WEB_APPS_API_TOKEN
#    - AZURE_FUNCTIONS_PUBLISH_PROFILE

# 2. Push to main:
git add .
git commit -m "Deploy infrastructure"
git push origin main

# 3. Monitor: Actions tab → deploy-swa.yml workflow
#    Deploys: SWA + Functions + Bicep + Monitoring in parallel
```

---

## ✅ Validation Checklist

### Local Development
- [ ] `.\set-subscription.ps1` runs without errors
- [ ] `.\wire-keyvault.ps1` creates .env.local files
- [ ] Docker services healthy: `docker-compose ps`
- [ ] `.\litlab-first-run.auto.ps1` spawns 2 terminals
- [ ] API responds: `curl http://localhost:7071/api/health`
- [ ] Web loads: `http://localhost:3000` opens in browser

### Infrastructure Deployment
- [ ] Bicep templates compile: `az bicep build -f infra/bicep/main.bicep`
- [ ] Cosmos DB created: `az cosmosdb show -g litreelabstudio-rg -n litlab-cosmos`
- [ ] Function App created: `az functionapp show -g litreelabstudio-rg -n litlabs-func-app-prod`
- [ ] Storage Account created: `az storage account show -g litreelabstudio-rg -n litlabsblobsa`
- [ ] Key Vault secrets accessed: `az keyvault secret list --vault-name kvprodlitree14210`

### Azure Services
- [ ] Function App: Healthy (status = Ready)
- [ ] Cosmos DB: Replicating (status = Creating or Running)
- [ ] Storage Account: Provisioned
- [ ] Key Vault: All secrets present
- [ ] App Insights: Receiving traces

### CI/CD Pipeline
- [ ] GitHub Actions workflow runs on push
- [ ] Secrets configured in Settings → Secrets → Actions
- [ ] `deploy-swa.yml` passes all jobs
- [ ] SWA deployment successful
- [ ] Functions deployment successful
- [ ] Bicep deployment successful

---

## 🔑 Secrets (Must Configure Before Deployment)

### GitHub Actions Secrets Required
```
AZURE_SUBSCRIPTION_ID = 0f95fc53-20dc-4c0d-8f76-0108222d5fb1
AZURE_TENANT_ID = (your Azure AD tenant ID)
AZURE_CLIENT_ID = (service principal app ID)
AZURE_STATIC_WEB_APPS_API_TOKEN = (from SWA deployment token)
AZURE_FUNCTIONS_PUBLISH_PROFILE = (from Function App publish profile)
```

### Key Vault Secrets (Already Configured)
```
cosmos-endpoint
cosmos-key
storage-account-name
storage-account-key
stripe-secret-key
stripe-webhook-secret
jwt-secret
azure-ad-client-id
azure-ad-tenant-id
azure-ad-client-secret
```

---

## 📊 Expected Results

### After Setup
```
Local Development Ready:
✓ API: http://localhost:7071/api/
✓ Web: http://localhost:3000
✓ Cosmos: localhost:8081
✓ Azurite: localhost:10000-10002
✓ Postgres: localhost:5432
✓ Redis: localhost:6379
```

### After Infrastructure Deployment
```
Azure Resources Ready:
✓ Function App: litlabs-func-app-prod (Node 20 v4)
✓ Cosmos DB: litlab-cosmos (SQL API, 400 RU/s)
✓ Storage: litlabsblobsa
✓ App Insights: litlabs-appinsights
✓ Front Door: (litlabs-fd-prod with WAF)
✓ Key Vault: kvprodlitree14210
```

### After CI/CD Configuration
```
GitHub Actions Ready:
✓ Workflow: deploy-swa.yml
✓ Triggers: push main, PR, manual dispatch
✓ Jobs: build → deploy (SWA, Functions, Bicep, Monitoring)
✓ Status: All green (no failures)
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Azure CLI not found | Install: `winget install Microsoft.AzureCLI` |
| PowerShell 7 not found | Install: `winget install Microsoft.PowerShell` |
| pnpm not found | Install: `npm install -g pnpm` |
| Key Vault access denied | Run: `az login` and verify Contributor role |
| Docker services failing | Run: `docker-compose logs <service>` to debug |
| .env.local not found | Copy: `cp apps/web/.env.example apps/web/.env.local` |
| Function App deploy fails | Check: Publish profile in GitHub Actions secrets |
| Bicep validation fails | Run: `az bicep build -f <file>` to debug |

---

## 📚 Documentation

| Guide | Purpose | Time |
|-------|---------|------|
| [LITLABS_BLUEPRINT_CONCISE.md](LITLABS_BLUEPRINT_CONCISE.md) | Quick reference, all commands | 5 min |
| [BLUEPRINT_QUICK_START.md](BLUEPRINT_QUICK_START.md) | 10-minute setup walkthrough | 10 min |
| [BLUEPRINT_IMPLEMENTATION_COMPLETE.md](BLUEPRINT_IMPLEMENTATION_COMPLETE.md) | Detailed workflows, best practices | 30 min |
| [VALIDATION_REPORT.md](VALIDATION_REPORT.md) | File-by-file validation | 15 min |
| [LITLABS_DELIVERY_SUMMARY.md](LITLABS_DELIVERY_SUMMARY.md) | What was delivered | 5 min |

---

## 🎯 Command Reference

### Setup
```powershell
.\set-subscription.ps1                           # Validate Azure
.\wire-keyvault.ps1                             # Populate secrets
docker-compose -f docker/docker-compose.yml up -d  # Start emulators
.\litlab-first-run.auto.ps1                     # Boot dev servers
```

### Daily Development
```powershell
.\litlab-first-run.auto.ps1                     # Boot (if not running)
curl http://localhost:7071/api/health           # Check API
curl http://localhost:3000                      # Check Web
docker-compose -f docker/docker-compose.yml ps  # Check emulators
```

### Deployment
```powershell
# Manual Bicep deployment
az deployment group create -g litreelabstudio-rg -f infra/bicep/main.bicep

# Via CI/CD (GitHub Actions)
git push origin main
```

### Monitoring
```powershell
# Check Azure resources
az resource list -g litreelabstudio-rg --query "[].{Name:name,Type:type}"

# Check Function App
az functionapp show -g litreelabstudio-rg -n litlabs-func-app-prod

# Check Cosmos DB
az cosmosdb show -g litreelabstudio-rg -n litlab-cosmos
```

---

## ✨ Summary

✅ **All prerequisites met?** → Proceed to Step 1  
✅ **Setup complete?** → Proceed to infrastructure deployment  
✅ **Infrastructure deployed?** → Configure CI/CD secrets  
✅ **All green?** → You're production-ready! 🎉

---

**Status**: ✅ **READY FOR PRODUCTION**  
**Confidence**: ⭐⭐⭐⭐⭐ (5/5)  
**Support**: See [LITLABS_BLUEPRINT_CONCISE.md](LITLABS_BLUEPRINT_CONCISE.md#troubleshooting)

