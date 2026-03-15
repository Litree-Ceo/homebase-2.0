# EverythingHomebase Azure Function App - Complete Setup Index

**Project:** EverythingHomebase - Azure Function App with Grok Integration  
**Created:** January 2, 2026  
**Status:** ✅ **READY FOR DEPLOYMENT**  
**Deployment Region:** eastus2 (East US 2)  
**Resource Group:** litree-prod-rg  

---

## 🚀 Quick Start (5 Minutes)

### For Impatient Users
```powershell
# In Windows PowerShell (as Administrator)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd "e:\VSCode\HomeBase 2.0"
.\Setup-KeyVaultSecrets.ps1
.\Deploy-Infrastructure.ps1
cd functions && npm install && func azure functionapp publish EverythingBasebase-func --build remote
```

See [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) for detailed step-by-step instructions.

---

## 📚 Documentation Map

### Start Here (Read in Order)

1. **[FUNCTION_APP_SETUP_SUMMARY.md](FUNCTION_APP_SETUP_SUMMARY.md)** ⭐ START HERE
   - Overview of all configured components
   - Architecture and design decisions
   - Security checklist
   - Quick reference guide

2. **[DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md)** ⭐ FOLLOW THIS
   - Phase 1: Key Vault Setup
   - Phase 2: Infrastructure Deployment
   - Phase 3: Function Code Deployment
   - Phase 4: Testing
   - Troubleshooting guide

3. **[FUNCTION_APP_DEPLOYMENT_GUIDE.md](FUNCTION_APP_DEPLOYMENT_GUIDE.md)** - DETAILED REFERENCE
   - Complete deployment procedures
   - Monitoring and diagnostics
   - Advanced troubleshooting
   - Security best practices

### Infrastructure & Code

4. **[infrastructure-function-app.bicep](infrastructure-function-app.bicep)** - Infrastructure as Code
   - Complete Azure resource definitions
   - Resource dependencies
   - Configuration parameters

5. **[infrastructure-function-app.parameters.json](infrastructure-function-app.parameters.json)** - Parameter Values
   - Azure resource names
   - Configuration values
   - Update before deploying

6. **[functions/GrokChat/index.js](functions/GrokChat/index.js)** - Function Implementation
   - Grok API integration
   - Error handling
   - Request/response format

### Deployment Scripts

7. **[Setup-KeyVaultSecrets.ps1](Setup-KeyVaultSecrets.ps1)** - Key Vault Configuration
   - Sets up Azure Key Vault
   - Configures Function App identity
   - Grants access permissions

8. **[Deploy-Infrastructure.ps1](Deploy-Infrastructure.ps1)** - Infrastructure Deployment
   - Deploys Bicep template
   - Creates all Azure resources
   - Configures monitoring

9. **[Run-Setup.bat](Run-Setup.bat)** - Automated Setup Wrapper
   - Batch file for quick setup
   - Calls PowerShell scripts

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Azure Function App (EverythingBasebase-func)    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  GrokChat Handler (Node.js)                       │  │
│  │  - Query validation                              │  │
│  │  - Grok API integration                          │  │
│  │  - Error handling                                │  │
│  │  - Logging                                       │  │
│  └──────────────────────────────────────────────────┘  │
│            │ System Managed Identity                     │
│            ▼                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Application Settings (Key Vault References)     │  │
│  │  - @Microsoft.KeyVault(VaultName=...;Secret...)  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
     ▼               ▼               ▼
┌──────────┐  ┌─────────────┐  ┌──────────────┐
│ Key Vault│  │ App Insights│  │ Log Analytics│
│ Secrets  │  │ Monitoring  │  │ Diagnostics  │
└──────────┘  └─────────────┘  └──────────────┘
     │               │               │
     │ (get/list)    │ (telemetry)   │ (logs)
     │               │               │
     ├───────────────┴───────────────┤
     │                               │
     │ Security & Compliance         │
     ├───────────────┬───────────────┤
     ▼               ▼
 - Encrypted    - Smart Detection
 - No hardcoded  - Anomaly Alerts
 - Auditable     - Performance Metrics
```

### Data Flow

```
1. Client sends POST to /api/grok-chat
   ↓
2. Azure Function retrieves Grok API key from Key Vault (via Managed Identity)
   ↓
3. Validates request and calls Grok API
   ↓
4. Grok API returns response
   ↓
5. Function returns response to client
   ↓
6. Metrics and logs sent to Application Insights
   ↓
7. Application Insights exports logs to Log Analytics
```

---

## 🔧 Component Configuration Matrix

| Component | Type | Name | Status | Purpose |
|-----------|------|------|--------|---------|
| **Function App** | Compute | EverythingBasebase-func | ✅ Ready | API endpoint for Grok integration |
| **App Service Plan** | Compute | EverythingBasebase-plan | ✅ Ready | Y1 Dynamic tier (serverless) |
| **Key Vault** | Security | EverythingBasebase-kv | ✅ Ready | Secrets management (COSMOS-ENDPOINT, SIGNALR-CONN, GROK-API-KEY) |
| **Storage Account** | Storage | everythingbasestor | ✅ Ready | Function runtime storage |
| **Application Insights** | Monitoring | EverythingBasebase-insights | ✅ Ready | Performance monitoring & diagnostics |
| **Log Analytics** | Analytics | log-baseline01 | ✅ Ready | Centralized logging & queries |
| **Managed Identity** | Security | (Auto-assigned) | ✅ Ready | Secure Key Vault access (no credentials) |
| **Action Group** | Alerting | EverythingBasebase-action-group | ✅ Ready | Smart Detection alerts |

---

## 📋 Configuration Details

### Key Vault Secrets
```
COSMOS-ENDPOINT      ← Cosmos DB connection endpoint
SIGNALR-CONN         ← SignalR Service connection string
GROK-API-KEY         ← xAI Grok API key (SENSITIVE)
```

### Function App Environment Variables
```
COSMOS_ENDPOINT      = @Microsoft.KeyVault(VaultName=EverythingBasebase-kv;SecretName=COSMOS-ENDPOINT)
SIGNALR_CONN         = @Microsoft.KeyVault(VaultName=EverythingBasebase-kv;SecretName=SIGNALR-CONN)
GROK_API_KEY         = @Microsoft.KeyVault(VaultName=EverythingBasebase-kv;SecretName=GROK-API-KEY)
APPINSIGHTS_INSTRUMENTATIONKEY = [auto-configured]
FUNCTIONS_EXTENSION_VERSION    = ~4
FUNCTIONS_WORKER_RUNTIME       = node
```

### Azure Subscription Context
- **Subscription ID:** 0f95fc53-20dc-4c0d-8f76-0108222d5fb1
- **Resource Group:** litree-prod-rg
- **Location:** eastus2 (East US 2)
- **Environment:** Production

---

## ✅ Pre-Deployment Checklist

### Prerequisites
- [ ] Azure CLI installed and authenticated
- [ ] Azure Functions Core Tools installed
- [ ] Node.js 18+ installed
- [ ] PowerShell 7+ available
- [ ] Windows machine with admin access
- [ ] Internet connectivity to Azure

### Required Information
- [ ] Grok API key from https://console.x.ai/
- [ ] SignalR connection string (or will use placeholder)
- [ ] Cosmos DB endpoint (or will use default)
- [ ] Azure subscription ID: 0f95fc53-20dc-4c0d-8f76-0108222d5fb1

### Files in Place
- [ ] ✅ Setup-KeyVaultSecrets.ps1
- [ ] ✅ Deploy-Infrastructure.ps1
- [ ] ✅ infrastructure-function-app.bicep
- [ ] ✅ infrastructure-function-app.parameters.json
- [ ] ✅ functions/GrokChat/index.js
- [ ] ✅ functions/GrokChat/function.json
- [ ] ✅ functions/package.json
- [ ] ✅ Documentation files

---

## 🚀 Deployment Phases

### Phase 1: Key Vault Setup (2-5 min)
**What:** Sets up Azure Key Vault with secrets and grants Function App access  
**Script:** `Setup-KeyVaultSecrets.ps1`  
**Output:** Key Vault with 3 secrets + Function App identity configured  
**Estimated Duration:** 2-5 minutes

### Phase 2: Infrastructure Deployment (5-10 min)
**What:** Deploys complete Azure infrastructure via Bicep template  
**Script:** `Deploy-Infrastructure.ps1`  
**Output:** Function App, App Insights, Log Analytics, Storage Account, etc.  
**Estimated Duration:** 5-10 minutes

### Phase 3: Function Code Deployment (3-5 min)
**What:** Deploys GrokChat function code to Azure Function App  
**Command:** `func azure functionapp publish EverythingBasebase-func --build remote`  
**Output:** Function endpoint ready to handle requests  
**Estimated Duration:** 3-5 minutes

### Phase 4: Testing & Verification (2-3 min)
**What:** Test function endpoint and verify all components working  
**Commands:** PowerShell test scripts  
**Output:** Confirmation of successful request/response cycle  
**Estimated Duration:** 2-3 minutes

**Total Estimated Deployment Time: 12-23 minutes** ⏱️

---

## 🧪 Testing Scenarios

### Test 1: Basic Query
```powershell
$body = @{query = "What is 2+2?"} | ConvertTo-Json
Invoke-WebRequest -Uri $functionUrl -Method POST -Body $body -Headers @{"Content-Type"="application/json"}
# Expected: 200 OK with "4" in response
```

### Test 2: Custom Model & Parameters
```powershell
$body = @{
  query = "Explain quantum computing"
  model = "grok-2"
  max_tokens = 500
  temperature = 0.3
} | ConvertTo-Json
# Expected: 200 OK with detailed explanation
```

### Test 3: Error Handling - Missing Query
```powershell
$body = @{} | ConvertTo-Json
# Expected: 400 Bad Request with error message
```

### Test 4: Authentication - Invalid Key
```powershell
# Call with wrong function key
# Expected: 401 Unauthorized
```

### Test 5: Rate Limiting
```powershell
# Send 15 rapid requests (if rate limit = 10)
# Expected: 429 Too Many Requests after 10th request
```

---

## 📊 Monitoring & Metrics

### Key Metrics to Monitor

**Availability**
- Target: ≥99.9%
- Alert if: <99%
- Dashboard: Azure Portal → Function App → Monitor

**Response Time**
- Target: <500ms
- Alert if: >2000ms
- Dashboard: Application Insights → Performance

**Error Rate**
- Target: 0%
- Alert if: >1% or >5 errors in 15 minutes
- Dashboard: Application Insights → Failures

**Server Exceptions**
- Target: 0
- Alert if: >5 in 15 minutes
- Dashboard: Application Insights → Server exceptions

**Function Execution Count**
- Tracks: Total requests handled
- Dashboard: Application Insights → Custom metrics

---

## 🔒 Security Implementation

### ✅ Implemented Security Measures
- **Secrets Management:** Azure Key Vault (encrypted, auditable)
- **Authentication:** Managed Identity (no credentials stored)
- **Network:** HTTPS only (TLS 1.2+ required)
- **Access Control:** Function App identity only has "get" and "list" permissions on secrets
- **Monitoring:** Application Insights tracks all requests and errors
- **Encryption:** All data in transit encrypted with TLS 1.2
- **Audit Logging:** All Key Vault access is logged

### ⚠️ Recommended Additional Security
- [ ] Configure IP whitelist on Function App
- [ ] Enable Key Vault audit logging to Log Analytics
- [ ] Set up email notifications for critical alerts
- [ ] Implement rate limiting in function code
- [ ] Regular security assessments
- [ ] Rotate Grok API key periodically

---

## 📞 Support & Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **GROK_API_KEY missing** | Check Key Vault secret exists and Function App identity has access |
| **401 Unauthorized** | Verify Grok API key is valid in Key Vault |
| **429 Rate Limited** | Implement exponential backoff in client code |
| **Function timeout** | Increase timeout in App Service settings |
| **High latency** | Check Grok API health at console.x.ai |
| **No logs appearing** | Verify Application Insights is linked to Function App |

### Quick Diagnostic Commands

```powershell
# Check Function App status
az functionapp show --name EverythingBasebase-func --resource-group litree-prod-rg

# View Function App settings
az functionapp config appsettings list --name EverythingBasebase-func --resource-group litree-prod-rg

# Stream Function App logs
az functionapp log tail --name EverythingBasebase-func --resource-group litree-prod-rg

# Check Key Vault access
az keyvault show --name EverythingBasebase-kv --resource-group litree-prod-rg

# View deployment history
az functionapp deployment source show-build-status --name EverythingBasebase-func --resource-group litree-prod-rg
```

### Getting Help

1. **Check logs:**
   - Azure Portal → Function App → Monitor → Live Metrics Stream
   - Or use: `az functionapp log tail --name EverythingBasebase-func --resource-group litree-prod-rg`

2. **Query Log Analytics:**
   - Azure Portal → Log Analytics Workspace → Logs
   - Run KQL queries for detailed diagnostics

3. **Review Application Insights:**
   - Azure Portal → Application Insights → Performance, Failures, Server Exceptions

4. **Check documentation:**
   - [FUNCTION_APP_DEPLOYMENT_GUIDE.md](FUNCTION_APP_DEPLOYMENT_GUIDE.md#troubleshooting)
   - [FUNCTION_APP_SETUP_SUMMARY.md](FUNCTION_APP_SETUP_SUMMARY.md)

---

## 📝 File Structure

```
e:\VSCode\HomeBase 2.0\
├── SETUP_INSTRUCTIONS.md (this file)
├── DEPLOYMENT_STEPS.md (step-by-step guide)
├── FUNCTION_APP_SETUP_SUMMARY.md (architecture & overview)
├── FUNCTION_APP_DEPLOYMENT_GUIDE.md (detailed reference)
├── Setup-KeyVaultSecrets.ps1 (phase 1 script)
├── Deploy-Infrastructure.ps1 (phase 2 script)
├── Run-Setup.bat (automated setup wrapper)
├── infrastructure-function-app.bicep (IaC template)
├── infrastructure-function-app.parameters.json (configuration)
└── functions/
    ├── package.json (Node.js dependencies)
    └── GrokChat/
        ├── index.js (function handler)
        └── function.json (function metadata)
```

---

## 🎯 Next Steps

### Immediate (Before Deployment)
1. [ ] Gather required credentials (Grok API key, etc.)
2. [ ] Review [FUNCTION_APP_SETUP_SUMMARY.md](FUNCTION_APP_SETUP_SUMMARY.md)
3. [ ] Verify Azure CLI is logged in: `az account show`

### During Deployment
1. [ ] Run Phase 1: `.\Setup-KeyVaultSecrets.ps1`
2. [ ] Run Phase 2: `.\Deploy-Infrastructure.ps1`
3. [ ] Run Phase 3: `func azure functionapp publish EverythingBasebase-func --build remote`
4. [ ] Run Phase 4: Test endpoint

### Post-Deployment
1. [ ] Monitor metrics in Azure Portal
2. [ ] Set up alerts for your team
3. [ ] Document any custom configurations
4. [ ] Share Function App URL with API consumers
5. [ ] Review security checklist

### Long-term Maintenance
1. [ ] Monthly security review
2. [ ] Quarterly cost optimization
3. [ ] Annual disaster recovery drill
4. [ ] Regular log analysis and insights

---

## 📖 How to Use This Documentation

### For Developers
1. Start with [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md)
2. Reference [FUNCTION_APP_DEPLOYMENT_GUIDE.md](FUNCTION_APP_DEPLOYMENT_GUIDE.md) for details
3. Check [functions/GrokChat/index.js](functions/GrokChat/index.js) to modify function behavior

### For DevOps/Cloud Engineers
1. Review [infrastructure-function-app.bicep](infrastructure-function-app.bicep) for IaC
2. Customize [infrastructure-function-app.parameters.json](infrastructure-function-app.parameters.json) as needed
3. Execute [Deploy-Infrastructure.ps1](Deploy-Infrastructure.ps1) for deployment

### For Operations/Monitoring
1. Use [FUNCTION_APP_SETUP_SUMMARY.md](FUNCTION_APP_SETUP_SUMMARY.md) for component overview
2. Check "Monitoring & Metrics" section in this file
3. Follow troubleshooting guide in [FUNCTION_APP_DEPLOYMENT_GUIDE.md](FUNCTION_APP_DEPLOYMENT_GUIDE.md)

### For Security/Compliance
1. Review security checklist in [FUNCTION_APP_SETUP_SUMMARY.md](FUNCTION_APP_SETUP_SUMMARY.md)
2. Check [infrastructure-function-app.bicep](infrastructure-function-app.bicep) for security configurations
3. Verify audit logging is enabled for Key Vault

---

## 📞 Contacts & Resources

### Azure Resources
- **Azure Portal:** https://portal.azure.com
- **Azure CLI Documentation:** https://docs.microsoft.com/cli/azure/
- **Azure Functions Documentation:** https://docs.microsoft.com/azure/azure-functions/

### External APIs
- **Grok API Console:** https://console.x.ai/
- **Grok API Documentation:** https://console.x.ai/docs

### Internal Resources
- **GitHub Repository:** [Your repo URL]
- **Azure Subscription:** 0f95fc53-20dc-4c0d-8f76-0108222d5fb1
- **Resource Group:** litree-prod-rg

---

## ✨ Final Checklist Before Deployment

- [ ] All prerequisites installed and verified
- [ ] Credentials collected (Grok API key, SignalR connection string)
- [ ] Azure CLI authenticated and subscription set
- [ ] All script files present in project root
- [ ] Documentation read and understood
- [ ] Bicep template reviewed and parameters updated if needed
- [ ] Team notified of upcoming deployment
- [ ] Backup of current configuration taken (if applicable)
- [ ] Time allocated for deployment (20-30 minutes recommended)
- [ ] Ready to proceed with deployment

---

## 🎉 Congratulations!

Your EverythingHomebase Azure Function App infrastructure is ready for deployment!

**Ready to get started?**

👉 **Next Step:** Read [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) and execute Phase 1

---

**Last Updated:** January 2, 2026  
**Status:** ✅ Ready for Production Deployment  
**Version:** 1.0  
**Maintainer:** Development Team

