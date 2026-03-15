#!/bin/bash

echo "🔥 Litree Web - Complete Setup Checklist"
echo "=========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Check if in Litree-web directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in Litree-web directory"
    echo "Run: cd Litree-web"
    exit 1
fi
echo "✅ In Litree-web directory"

# Check dependencies installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi
echo "✅ Dependencies installed"

# Check .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found"
    echo "Create .env.local with your API keys:"
    echo ""
    echo "NEXT_PUBLIC_FIREBASE_API_KEY=your_key"
    echo "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain"
    echo "... (see SETUP.md for all vars)"
    echo ""
    exit 1
fi
echo "✅ .env.local exists"

# Check required env vars
required_vars=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "STRIPE_SECRET_KEY"
    "GOOGLE_AI_STUDIO_API_KEY"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "$var" .env.local; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "⚠️  Missing environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Edit .env.local and add these variables"
    exit 1
fi
echo "✅ All required environment variables set"

# Check build
echo ""
echo "🔨 Building project..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    npm run build
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo "3. Sign up with a test account"
echo "4. Try checkout with test card: 4242 4242 4242 4242"
echo ""
echo "Need help? See SETUP.md"
echo ""

