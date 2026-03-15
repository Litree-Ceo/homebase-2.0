# Project Setup

This document describes the initial setup and structure for EverythingHomebase.

- `src/` - Source code
- `docs/` - Documentation
- `assets/` - Images, media, and other assets

---

## Cloud Integration Setup

### 1. Azure Cloud Integration (Recommended)

- **VS Code Extensions:**
  - Azure Account
  - Azure Cosmos DB
  - Azure Functions (if using serverless)
  - Sign in via the Azure sidebar in VS Code.

- **Azure CLI:**
  - [Install Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
  - Run: `az login`

- **Azure Cosmos DB:**
  - Use the VS Code extension to create/manage databases.
  - For local dev, use the [Cosmos DB Emulator](https://learn.microsoft.com/azure/cosmos-db/emulator).
  - Store connection strings in a `.env` file (never commit secrets).

- **Azure Storage, Functions, Web Apps:**
  - Use the Azure extension to deploy static sites, APIs, or serverless functions.
  - For Functions: Scaffold with the extension, deploy from VS Code.

- **Monitoring & Diagnostics:**
  - Enable Azure Monitor and Application Insights.
  - View logs/metrics in the Azure portal or VS Code.

---

### 2. GitHub Integration

- Connect your repo to GitHub for CI/CD and collaboration.
- Use GitHub Actions for automated deployments to Azure.

---

### 3. General Cloud Setup (AWS/GCP)

- **AWS:**
  - Install AWS Toolkit for VS Code, configure with `aws configure`.
- **GCP:**
  - Install Google Cloud Tools extension, authenticate with `gcloud auth login`.

---

### 4. Security & Best Practices

- Store secrets in environment variables or Azure Key Vault.
- Use `.gitignore` to avoid committing sensitive files.
- Regularly review cloud costs and permissions.

---

### 5. Documentation

- Keep this file updated with any changes to your cloud setup.

---

Your homebase is now ready for cloud-powered development!
