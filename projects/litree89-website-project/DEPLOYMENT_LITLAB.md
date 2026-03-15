# LITLAB Production Deployment Guide

## Architecture (Recommended Hybrid)

Use Azure Static Web Apps for the web + serverless API, and App Service for “engine room” workloads (Copilot orchestration, long-running jobs, heavier realtime, background automation).

**Why:** Static Web Apps + Functions is perfect for Phase 1 speed. App Service becomes your “always-on brain” when Copilot + automation gets deep.

### Azure Services Map

- **Frontend:** Azure Static Web Apps (React build → /dist)
- **API:** Azure Functions (Node 20, in /api)
- **AI Orchestration / Workers:** Azure App Service (Node/Python)
- **DB:** Cosmos DB (SQL API)
- **Storage:** Blob Storage (uploads/media/assets)
- **Payments:** Stripe + webhook handler in Functions
- **Monitoring:** Application Insights + traces endpoint

---

## Phase 1 Deploy (Static Web Apps + Functions)

- `/dist` → Static Web Apps (frontend)
- `/api` → Functions (API)

**Required secrets in GitHub:**

- `AZURE_STATIC_WEB_APPS_API_TOKEN` (SWA deployment token)

**Optional (only if you run az CLI steps in workflow):**

- OIDC secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`

---

## Phase 2–4 Deploy (Add App Service “Copilot Engine”)

- `/services/copilot-engine` → Azure App Service (always-on)

**Required secrets (OIDC recommended):**

- `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`

**Recommended App Service settings:**

- Enable Managed Identity
- Use Key Vault references for secrets
- Add deployment slots: staging then swap to production

**Zero-Downtime (Slots):**

- Deploy to staging
- Smoke test
- Swap:
  ```sh
  az webapp deployment slot swap \
    --name <APP_NAME> \
    --resource-group <RG> \
    --slot staging
  ```

**Observability (App Insights):**

- Frontend: SWA logging + optional custom telemetry
- API + Copilot Engine: App Insights
- Log these “events” early: `copilot_prompt`, `copilot_action_clicked`, `mission_completed`, `wallet_earned`, `upgrade_triggered`

---

## Quickstart (Local)

```sh
npm install
npm run install:all

# backend
cd api && npm start

# frontend
cd ../app && npm run dev
```

## Deploy (Phase 1)

- Set GitHub secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`
- Push to main
- Workflow `swa-deploy.yml` deploys dist/ + api/

## Deploy (Copilot Engine)

- Create App Service: `litlab-copilot-engine`
- Set OIDC GitHub secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
- Push changes in `services/copilot-engine/**`

## Recommended Environments

- production (main)
- preview (PRs via SWA)
- staging (App Service deployment slot)
