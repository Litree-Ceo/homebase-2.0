#!/bin/bash

# Security Audit Script
# Run automated security checks on the codebase

echo "🔍 Running Security Audit..."
echo "=================================="

PASSED=0
FAILED=0
WARNINGS=0

# Check 1: .env not in git
echo -n "✓ Checking .env not in version control... "
if git ls-files | grep -q "^\.env$"; then
    echo "FAILED"
    ((FAILED++))
else
    echo "PASSED"
    ((PASSED++))
fi

# Check 2: npm audit
echo -n "✓ Checking npm vulnerabilities... "
if npm audit 2>&1 | grep -q "0 vulnerabilities"; then
    echo "PASSED"
    ((PASSED++))
else
    echo "FAILED"
    ((FAILED++))
fi

# Check 3: Security headers
echo -n "✓ Checking security headers... "
if grep -q "X-Content-Type-Options\|X-Frame-Options\|Strict-Transport-Security" next.config.ts 2>/dev/null; then
    echo "PASSED"
    ((PASSED++))
else
    echo "WARNING"
    ((WARNINGS++))
fi

# Check 4: .env.example exists
echo -n "✓ Checking .env.example... "
if [ -f ".env.example" ]; then
    echo "PASSED"
    ((PASSED++))
else
    echo "FAILED"
    ((FAILED++))
fi

# Check 5: SECURITY.md exists
echo -n "✓ Checking SECURITY.md... "
if [ -f "SECURITY.md" ]; then
    echo "PASSED"
    ((PASSED++))
else
    echo "WARNING"
    ((WARNINGS++))
fi

# Check 6: Middleware exists
echo -n "✓ Checking security middleware... "
if [ -f "lib/middleware/rateLimit.ts" ] && [ -f "lib/middleware/cors.ts" ]; then
    echo "PASSED"
    ((PASSED++))
else
    echo "WARNING"
    ((WARNINGS++))
fi

echo ""
echo "=================================="
echo "Results: ✓$PASSED | ✗$FAILED | ⚠$WARNINGS"
echo "=================================="

if [ $FAILED -gt 0 ]; then
    echo "🚨 FAILED - Please fix security issues"
    exit 1
fi

if [ $WARNINGS -gt 0 ]; then
    echo "⚠️  PASSED with warnings"
    exit 0
fi

echo "✅ PASSED - Security audit complete"
exit 0
