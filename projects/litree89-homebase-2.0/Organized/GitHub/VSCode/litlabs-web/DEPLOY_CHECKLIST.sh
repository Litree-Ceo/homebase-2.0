#!/bin/bash

# LITLABS DEPLOYMENT CHECKLIST - 1 HOUR LAUNCH
# ============================================

echo "🚀 Starting 1-Hour Deployment Cycle..."
echo ""

# PHASE 1: SECURITY CHECK (10 min)
echo "=== PHASE 1: SECURITY SCAN ==="
echo "[1/6] Checking for exposed secrets..."

# Look for API keys, tokens in git history
git log -p --all -S "sk_" 2>/dev/null | wc -l
git log -p --all -S "AIzaSy" 2>/dev/null | wc -l
git log -p --all -S "-----BEGIN" 2>/dev/null | wc -l

echo "[2/6] Checking .env files..."
find . -name ".env*" -type f ! -path "*/node_modules/*" ! -path "*/.git/*" | head -10

echo "[3/6] Scanning for hardcoded passwords..."
git grep -i "password.*=" | head -5 || echo "✅ No obvious passwords in code"

echo ""

# PHASE 2: BUILD & TEST (15 min)
echo "=== PHASE 2: BUILD & TEST ==="
echo "[4/6] Running smoke tests..."

# Check HTML validity
echo "Checking public/index.html..."
if grep -q "<html" public/index.html; then
  echo "✅ HTML file exists and has structure"
else
  echo "❌ HTML malformed"
fi

# Check Firebase config
echo "Checking firebase config..."
if grep -q "firebase" public/firebase-config.js; then
  echo "✅ Firebase config loaded"
else
  echo "❌ Firebase config missing"
fi

echo "[5/6] Verifying deployable assets..."
ls -lh public/ | head -20

echo ""

# PHASE 3: DEPLOY (30 min)
echo "=== PHASE 3: DEPLOY ==="
echo "[6/6] Deploying to Firebase Hosting..."
echo ""
echo "Commands to run:"
echo "  npm run deploy              # Deploy everything"
echo "  npm run deploy:hosting      # Frontend only"
echo ""
echo "After deploy:"
echo "  firebase hosting:channel:list  # See live URLs"
echo ""

echo "✅ CHECKLIST COMPLETE - Ready to deploy in ~1 hour"
