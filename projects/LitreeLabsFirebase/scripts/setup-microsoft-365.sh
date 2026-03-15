#!/bin/bash
# Setup script for Microsoft 365 integration
# This script validates and configures all required Microsoft 365 components

set -e

echo "🔧 LitLabs AI - Microsoft 365 Integration Setup"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "Please copy .env.example to .env.local and fill in the values:"
    echo ""
    echo "  cp .env.example .env.local"
    echo ""
    echo "Then add these Microsoft 365 variables:"
    echo "  MICROSOFT_CLIENT_ID=<your-client-id>"
    echo "  MICROSOFT_CLIENT_SECRET=<your-client-secret>"
    echo "  MICROSOFT_TENANT_ID=<your-tenant-id>"
    echo "  MICROSOFT_REDIRECT_URI=https://your-domain.com/api/auth/callback/microsoft"
    echo ""
    exit 1
fi

# Check required environment variables
echo "✓ Checking environment variables..."
required_vars=(
    "MICROSOFT_CLIENT_ID"
    "MICROSOFT_CLIENT_SECRET"
    "MICROSOFT_TENANT_ID"
    "MICROSOFT_REDIRECT_URI"
    "STRIPE_SECRET_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env.local; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please add them to .env.local"
    exit 1
fi

echo -e "${GREEN}✓ All required variables found${NC}"
echo ""

# Run build validation
echo "🔨 Building project..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    npm run build
    exit 1
fi

# Run type checking
echo "✓ Type checking..."
npm run typecheck > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ TypeScript validation passed${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    npm run typecheck
    exit 1
fi

# Run linting
echo "✓ Linting code..."
npm run lint > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Lint check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Lint warnings found:${NC}"
    npm run lint
fi

echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure Azure AD registration (if not done):"
echo "   - Go to: https://portal.azure.com"
echo "   - Create app registration with your credentials"
echo "   - Grant permissions: User.Read, Mail.Send, Calendars.ReadWrite, etc."
echo ""
echo "2. Deploy to Vercel:"
echo "   - Push to master: git push origin master"
echo "   - Vercel will auto-deploy"
echo ""
echo "3. Set Vercel environment variables:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Add all MICROSOFT_* variables from .env.local"
echo ""
echo "4. Test the integration:"
echo "   - npm run dev"
echo "   - Visit: http://localhost:3000"
echo ""
echo "Documentation: MICROSOFT_365_DEPLOYMENT.md"
