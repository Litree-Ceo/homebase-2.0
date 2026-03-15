# 🚀 HomeBase 2.0 Deployment Checklist - January 5, 2026

## Pre-Deployment Verification

### Code Quality & Testing

- [ ] **Run linting**: `pnpm lint` (all workspaces must pass ESLint + Prettier)
- [ ] **Run tests**: `pnpm -w test` (all unit tests passing)
- [ ] **Verify no `// @debugger` markers** left in production code
- [ ] **Check TypeScript strict mode**: No `any` types, all functions typed
- [ ] **Review .env.local**: No secrets hardcoded in code (only env vars)
- [ ] **Update CHANGELOG.md** with new features/fixes since last release

### Repository Health

- [ ] **Git status clean**: `git status` (no uncommitted changes)
- [ ] **All commits pushed**: `git log origin/main..HEAD` (should be empty)
- [ ] **Remote up-to-date**: `git fetch origin && git diff origin/main` (should be empty)
- [ ] **Branch protection**: `main` branch has PR reviews enabled
- [ ] **Security scanning**: Run `pnpm audit` (no critical vulnerabilities)

### Configuration Validation

- [ ] **Environment variables**: All required `.env` vars documented in `.env.example`
- [ ] **Meta OAuth**: App ID `1989409728353652` + secret in Azure Key Vault
- [ ] **Azure Services**:
  - [ ] Cosmos DB connection tested
  - [ ] Key Vault access verified
  - [ ] Storage Blob containers created
  - [ ] Function App deployment settings configured
- [ ] **DNS/Domains**: Update redirect URIs if deploying to new domain
- [ ] **Secrets rotation**: Last rotated date checked (rotate every 90 days)

### Build & Container Preparation

- [ ] **Docker builds locally**: `docker build -f docker/Dockerfile.web .` (API & Web)
- [ ] **Image size reasonable**: < 500MB per image
- [ ] **Test image runs**: `docker run -p 3000:3000 homebase-web:latest`
- [ ] **Multi-stage builds used**: Optimize for production size
- [ ] **No hardcoded secrets in Dockerfile**
- [ ] **Container Registry ACR**: Credentials verified in GitHub Secrets

---

## GitHub Actions CI/CD Pipeline

### Pre-Deployment Checks

- [ ] **GitHub Actions workflow validated**: [.github/workflows/deploy-azure.yml]
- [ ] **All secrets present in GitHub Settings**:
  - [ ] `AZURE_CLIENT_ID`
  - [ ] `AZURE_TENANT_ID`
  - [ ] `AZURE_SUBSCRIPTION_ID`
  - [ ] `GCP_PROJECT_ID`
  - [ ] `GCP_SERVICE_ACCOUNT_KEY`
  - [ ] `REGISTRY_USERNAME`
  - [ ] `REGISTRY_PASSWORD`
- [ ] **Workflow on `push` to `main` trigger**: Verified in YAML
- [ ] **Build matrix correct**: Node 20, Python 3.11 (if applicable)
- [ ] **Artifact retention**: 30 days (cost optimization)

### Pipeline Steps Verified

- [ ] ✅ **Checkout code** - uses `actions/checkout@v4`
- [ ] ✅ **Setup Node.js** - v20 LTS specified
- [ ] ✅ **Install dependencies** - `pnpm install --frozen-lockfile`
- [ ] ✅ **Lint & Format** - `pnpm lint`, Prettier check
- [ ] ✅ **Run tests** - `pnpm -w test` with coverage
- [ ] ✅ **Build** - `pnpm -w build`, TypeScript compilation
- [ ] ✅ **Build Docker images** - Parallel builds for API + Web
- [ ] ✅ **Push to ACR** - Azure Container Registry
- [ ] ✅ **Deploy to Azure Container Apps** - `az containerapp create/update`
- [ ] ✅ **Deploy to Google Cloud Run** - `gcloud run deploy`

---

## Azure Deployment

### Infrastructure

- [ ] **Resource Group**: `homebase-rg` exists
- [ ] **Container Apps Environment**: `homebase-env` in `eastus`
- [ ] **Container Registry**: `homebasecontainers.azurecr.io` with images
- [ ] **Cosmos DB**:
  - [ ] Database `litlab` exists
  - [ ] Containers: `items`, `users`, `games`, `webhook_events`, `meta_tokens`
  - [ ] Partition keys configured correctly
  - [ ] TTL enabled for transient data (90 days)
  - [ ] Backup enabled (geo-redundant)
- [ ] **Key Vault**:
  - [ ] All secrets present and rotated
  - [ ] Access policies for Function Apps configured
  - [ ] `COSMOS_ENDPOINT`, `COSMOS_KEY`, `FACEBOOK_APP_SECRET`, etc.
- [ ] **Storage Accounts**:
  - [ ] Blob containers created
  - [ ] Access policies for Functions set
  - [ ] CORS configured if needed

### Container Apps Configuration

- [ ] **Web App** (`homebase-web`):
  - [ ] CPU: 0.5, Memory: 1Gi (adjust per load)
  - [ ] Port: 3000 (internal), ingress external
  - [ ] Environment variables loaded from Key Vault
  - [ ] Health check configured (if supported)
  - [ ] Auto-scaling rules (min 1, max 5 replicas)
- [ ] **API App** (`homebase-api`):
  - [ ] CPU: 0.5, Memory: 1Gi (increase if high throughput)
  - [ ] Port: 7071 (Azure Functions port)
  - [ ] Ingress: internal (only Container Apps communicate)
  - [ ] Environment variables from Key Vault
  - [ ] Function runtime: Node 20

### DNS & SSL

- [ ] **SSL Certificates**: Auto-managed by Azure (\*.azurecontainerapps.io)
- [ ] **Custom Domain** (if applicable): DNS CNAME configured, SSL provisioned
- [ ] **CORS Settings**: Updated if new domains added
- [ ] **Rate Limiting**: API gateway rules (if applicable)

---

## Google Cloud Deployment (if multi-cloud required)

### GCP Setup

- [ ] **Project**: `homebase-web-xxxxx` created
- [ ] **Service Account**: GitHub Actions sa with proper permissions
- [ ] **Artifact Registry**: `us-central1` with Docker images
- [ ] **Cloud Run Service**: `homebase-web` configured
- [ ] **Secrets Manager**: Sensitive data stored (not in code)

### Cloud Run Configuration

- [ ] **Environment**: Production
- [ ] **Memory**: 512MB, CPU: 2 (auto-scaling)
- [ ] **Concurrency**: 100 requests per instance
- [ ] **Timeout**: 3600 seconds (for long-running ops)
- [ ] **Port**: 8080 (standard Cloud Run port)
- [ ] **VPC**: None (publicly accessible)

---

## Post-Deployment Verification

### URL & Connectivity

- [ ] **Azure Web App URL accessible**: `https://homebase-web.azurecontainerapps.io`
- [ ] **API endpoint responding**: `curl https://homebase-api.azurecontainerapps.io/health`
- [ ] **Google Cloud URL accessible** (if deployed): `https://homebase-web-xxxxx.run.app`
- [ ] **Redirect URIs working**: Test Meta OAuth callback
- [ ] **HTTPS enforcement**: All traffic redirected to HTTPS

### Application Functionality

- [ ] **Frontend loads**: Check `/` and key pages
- [ ] **Meta OAuth login**: Test full flow (login, token refresh, logout)
- [ ] **API endpoints**: Test 3-5 core endpoints
- [ ] **Database connectivity**: Verify Cosmos DB queries working
- [ ] **File uploads**: Test Azure Blob Storage integration
- [ ] **Secrets access**: Verify Key Vault retrieval working
- [ ] **Logging**: Check function logs in Azure Portal

### Performance & Monitoring

- [ ] **Response times acceptable**: < 200ms for API, < 1s for frontend
- [ ] **Error rates low**: < 0.5% 4xx/5xx errors
- [ ] **CPU/Memory usage**: < 80% normal load
- [ ] **Database performance**: Queries < 100ms avg
- [ ] **Logs appearing in Azure Monitor**: Application Insights active
- [ ] **Alerts configured**: High CPU, error rate, latency spikes

### Security Validation

- [ ] **Secrets not exposed**: No API keys in logs
- [ ] **CORS headers correct**: Only expected origins allowed
- [ ] **Authentication enforced**: Protected endpoints require auth token
- [ ] **Rate limiting active**: API protected from abuse
- [ ] **SSL/TLS only**: HTTP redirect working
- [ ] **Signature verification**: Meta webhooks HMAC validation active

---

## Rollback Plan (If Issues Found)

### Quick Rollback

```bash
# Revert to previous container image
az containerapp update \
  --name homebase-web \
  --resource-group homebase-rg \
  --image homebasecontainers.azurecr.io/homebase-web:PREVIOUS_TAG

az containerapp update \
  --name homebase-api \
  --resource-group homebase-rg \
  --image homebasecontainers.azurecr.io/homebase-api:PREVIOUS_TAG
```

### Full Rollback Steps

1. [ ] Stop production traffic to new version
2. [ ] Revert to previous Azure Container App revision
3. [ ] Verify rollback successful
4. [ ] Post-mortem review of failure
5. [ ] Fix issues in code before next deployment

---

## Documentation & Communication

### Internal Docs

- [ ] **CHANGELOG.md**: Updated with new features/fixes
- [ ] **README.md**: Updated with new deployment URLs
- [ ] **API documentation**: Swagger/OpenAPI updated (if applicable)
- [ ] **Deployment notes**: Recorded in `DEPLOYMENT-NOTES-2026-01-05.md`

### Team Communication

- [ ] **Deployment announcement**: Sent to team/stakeholders
- [ ] **Known issues documented**: Any limitations noted
- [ ] **Monitoring alert subscriptions**: Team added to Azure alerts
- [ ] **Incident response plan**: Updated with new services

---

## Final Sign-Off

| Role         | Name           | Date       | Status     |
| ------------ | -------------- | ---------- | ---------- |
| **Dev Lead** | GitHub Copilot | 2026-01-05 | 🚀 Ready   |
| **QA**       | (To be filled) |            | ⏳ Pending |
| **DevOps**   | (To be filled) |            | ⏳ Pending |
| **Product**  | (To be filled) |            | ⏳ Pending |

---

## Post-Deployment Monitoring (Next 24 Hours)

- [ ] **Monitor error rates** - Watch for anomalies
- [ ] **Check user reports** - Listen for issues
- [ ] **Review analytics** - Page views, API latency
- [ ] **Verify backups**: Cosmos DB, blobs backed up
- [ ] **Check security logs**: No suspicious access patterns
- [ ] **Performance baseline**: Establish baseline metrics

### Success Criteria

✅ **Deployment is successful if**:

- All health checks pass
- No critical errors in logs
- Response times within SLA
- User reports positive
- Security validation complete
- Monitoring alerts configured

---

**Last Updated**: January 5, 2026
**Deployment Date**: [TBD]
**Status**: 🟡 **AWAITING DEPLOYMENT**
