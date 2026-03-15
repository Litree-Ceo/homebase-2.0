# Deployment Guide

Complete deployment documentation for all platforms.

## Quick Deploy

```bash
# Automatic: Azure DevOps Pipelines deploys on push to main
git add .
git commit -m "your-message"
git push origin main

# Or manually trigger via Azure DevOps Pipelines UI
```

## Deployment Guides

- **DEPLOYMENT_SETUP_FINAL.md** - Complete setup and deployment steps
- **Azure Deployment** - Deploy to Azure Container Apps
- **Google Cloud Deployment** - Deploy to Cloud Run
- **Multi-Platform Setup** - Deploy to both platforms simultaneously

## Prerequisites

- Azure subscription
- Azure DevOps project with a pipeline
- Google Cloud project (optional)

## Platforms

### Azure Container Apps

- Primary deployment platform
- Auto-scaling enabled
- Global regions available
- Cost: $0.0175/vCPU/hour

### Google Cloud Run

- Secondary platform
- Serverless container execution
- Always free tier available
- Good for secondary regions

## CI/CD Pipeline

Pipeline configuration lives in `azure-pipelines.yml` at the repo root.

---

**Start deploying:** Read [DEPLOYMENT_SETUP_FINAL.md](./DEPLOYMENT_SETUP_FINAL.md)
