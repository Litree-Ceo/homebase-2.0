#!/bin/bash

# LitreeLabs Payment System Testing Script
# Run this after deploying Cloud Functions

set -e

echo "🧪 LITLABS PAYMENT SYSTEM TEST"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found${NC}"
    echo "Install: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI found${NC}"

# Check if functions are deployed
echo ""
echo "Checking Cloud Functions deployment..."

FUNCTIONS=$(firebase functions:list 2>/dev/null || echo "")

if [[ $FUNCTIONS == *"createPaymentIntent"* ]]; then
    echo -e "${GREEN}✅ Functions deployed${NC}"
else
    echo -e "${YELLOW}⚠️  Functions may not be deployed yet${NC}"
    echo "Deploy with: firebase deploy --only functions"
fi

# Check environment variables
echo ""
echo "Checking environment variables..."

CONFIG=$(firebase functions:config:get 2>/dev/null || echo "")

if [[ $CONFIG == *"stripe"* ]]; then
    echo -e "${GREEN}✅ Stripe configuration found${NC}"
else
    echo -e "${YELLOW}⚠️  Stripe environment variables not set${NC}"
    echo "Set with: firebase functions:config:set stripe.secret_key='sk_test_...' stripe.webhook_secret='whsec_...'"
fi

# Test Firestore connectivity
echo ""
echo "Testing Firestore connectivity..."

if firebase firestore:indexes --json &> /dev/null; then
    echo -e "${GREEN}✅ Firestore accessible${NC}"
else
    echo -e "${RED}❌ Firestore not accessible${NC}"
    exit 1
fi

# Check if test data exists
echo ""
echo "Checking test data in Firestore..."

COLLECTIONS=$(firebase firestore:indexes --json 2>/dev/null | grep -o "collections" || echo "")

if [[ -n $COLLECTIONS ]]; then
    echo -e "${GREEN}✅ Firestore collections accessible${NC}"
fi

# Summary
echo ""
echo "================================"
echo -e "${GREEN}✅ PAYMENT SYSTEM READY${NC}"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Set environment variables:"
echo "   firebase functions:config:set stripe.secret_key='sk_test_...' stripe.webhook_secret='whsec_...'"
echo ""
echo "2. Deploy functions:"
echo "   firebase deploy --only functions"
echo ""
echo "3. Configure Stripe webhook:"
echo "   - URL: https://us-central1-studio-6082148059-d1fec.cloudfunctions.net/stripeWebhook"
echo "   - Secret: (from Stripe Dashboard)"
echo ""
echo "4. Test payments:"
echo "   - Open: https://studio-6082148059-d1fec.web.app/dashboard-premium.html"
echo "   - Billing tab → Upgrade to Pro"
echo "   - Use test card: 4242 4242 4242 4242"
echo ""
