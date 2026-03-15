# Live Monitoring and Dashboard Setup for Lit Labs Studio

## Frontend (Static Web App)

- **Live URL:** https://thankful-flower-03bd04e03.1.azurestaticapps.net
- **Status Command:**
  - Run the VS Code task: `Show Frontend Status`
  - Or use CLI: `az staticwebapp show --name litlabstudio-frontend --resource-group LitreeLabstudio --output table`

## Backend (App Service)

- **Live URL:** https://litlabstudio-backend.azurewebsites.net
- **Status Command:**
  - Run the VS Code task: `Show Backend Status`
  - Or use CLI: `az webapp show --name litlabstudio-backend --resource-group LitreeLabstudio --output table`

## Live Monitoring

- **Azure Portal:**
  - Go to [portal.azure.com](https://portal.azure.com/)
  - Search for your resources: `litlabstudio-frontend` and `litlabstudio-backend`
  - Use the built-in Monitoring > Metrics and Logs for real-time health, usage, and error tracking.
- **VS Code:**
  - Use the Azure extension for resource browsing and monitoring.
  - Run the status tasks above for instant health checks.

## One-Click Deploy

- Use the VS Code tasks:
  - `Deploy Frontend to Azure Static Web App`
  - `Deploy Backend to Azure App Service`

## Recommendations

- Set up [Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/) for advanced dashboards, alerts, and analytics.
- Use [Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview) for backend telemetry.
- For custom dashboards, pin metrics to your Azure Portal dashboard.

---

**You now have live endpoints, one-click deploy, and instant status/monitoring for your Lit Labs Studio website!**
