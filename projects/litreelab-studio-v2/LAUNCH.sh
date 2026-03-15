#!/bin/bash
# LiTreeLab Studio - Launch Script
# Run this after completing all setup steps

set -e

echo "🚀 LiTreeLab Studio Launch Sequence"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pre-flight checks
echo -e "${YELLOW}Step 1: Pre-flight checks...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not found. Please install Azure CLI first.${NC}"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found. Please install Git first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All CLI tools found${NC}"

# Step 2: Build frontend
echo -e "${YELLOW}Step 2: Building React frontend...${NC}"
cd app_builder/web
npm ci
npm run build
cd ../..
echo -e "${GREEN}✅ Frontend build complete${NC}"

# Step 3: Test locally with Docker
echo -e "${YELLOW}Step 3: Testing with Docker...${NC}"
docker-compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
if curl -s http://localhost:8000 > /dev/null; then
    echo -e "${GREEN}✅ Local test passed - http://localhost:8000 is responding${NC}"
else
    echo -e "${RED}⚠️ Local test may have issues. Check docker-compose logs${NC}"
fi

# Stop local containers
docker-compose down
echo -e "${GREEN}✅ Local containers stopped${NC}"

# Step 4: Push to GitHub
echo -e "${YELLOW}Step 4: Pushing to GitHub...${NC}"
git add -A
git commit -m "chore: pre-deployment checkpoint $(date -Iseconds)" || echo "No changes to commit"
git push origin main
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"

# Step 5: Azure setup (if needed)
echo -e "${YELLOW}Step 5: Checking Azure setup...${NC}"

if ! az account show &> /dev/null; then
    echo "🔑 Please login to Azure:"
    az login
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo -e "${GREEN}✅ Using subscription: $SUBSCRIPTION_ID${NC}"

# Step 6: Create GitHub Secret if not exists
echo -e "${YELLOW}Step 6: GitHub Secret Setup${NC}"
echo "⚠️  IMPORTANT: You need to add AZURE_CREDENTIALS to GitHub Secrets"
echo ""
echo "Run this command and copy the output:"
echo ""
echo "az ad sp create-for-rbac --name 'litreelab-studio-deployer' --role contributor --scopes /subscriptions/$SUBSCRIPTION_ID --sdk-auth"
echo ""
echo "Then go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com\///' | sed 's/\.git//')/settings/secrets/actions"
echo "Add a secret named: AZURE_CREDENTIALS"
echo ""
read -p "Press Enter once you've added the secret..."

# Step 7: Trigger deployment
echo -e "${YELLOW}Step 7: Triggering deployment...${NC}"
echo "🔄 Pushing a small change to trigger GitHub Actions..."
echo "# Deployment triggered at $(date)" >> DEPLOYMENT.md
git add DEPLOYMENT.md
git commit -m "chore: trigger deployment [skip ci]"
git push origin main

echo ""
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}🚀 Launch sequence complete!${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo "Monitor deployment at:"
echo "https://github.com/$(git remote get-url origin | sed 's/.*github.com\///' | sed 's/\.git//')/actions"
echo ""
echo "Your app will be live at:"
echo "https://litreelabstudio-prod.azurewebsites.net"
echo ""
echo "Estimated time to live: 5-10 minutes"
