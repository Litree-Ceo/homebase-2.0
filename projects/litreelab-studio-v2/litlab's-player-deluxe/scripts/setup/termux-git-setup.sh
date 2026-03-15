#!/bin/bash
# 🔧 TERMUX GIT SETUP - Fix "Can't Push" Issues
# Run this on your phone in Termux

set -e

echo "╔══════════════════════════════════════════════╗"
echo "║     TERMUX GIT AUTHENTICATION SETUP          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "📦 Installing git..."
    pkg install git -y
fi

# Check if gh (GitHub CLI) is installed
if ! command -v gh &> /dev/null; then
    echo "📦 Installing GitHub CLI..."
    pkg install gh -y
fi

echo ""
echo "🔑 Step 1: Configure Git User"
echo "────────────────────────────────────────────"

# Get current config
CURRENT_NAME=$(git config --global user.name 2>/dev/null || echo "")
CURRENT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")

if [ -z "$CURRENT_NAME" ]; then
    echo "Enter your name (e.g., Larry B):"
    read -r GIT_NAME
    git config --global user.name "$GIT_NAME"
    echo "✓ Set name: $GIT_NAME"
else
    echo "✓ Name already set: $CURRENT_NAME"
fi

if [ -z "$CURRENT_EMAIL" ]; then
    echo "Enter your email (e.g., dyingbreed243@gmail.com):"
    read -r GIT_EMAIL
    git config --global user.email "$GIT_EMAIL"
    echo "✓ Set email: $GIT_EMAIL"
else
    echo "✓ Email already set: $CURRENT_EMAIL"
fi

echo ""
echo "🔐 Step 2: Authenticate with GitHub"
echo "────────────────────────────────────────────"

# Check if already authenticated
if gh auth status &>/dev/null; then
    echo "✓ Already authenticated with GitHub!"
    gh auth status
else
    echo "⚠️  Not authenticated. Starting login process..."
    echo ""
    echo "Choose these options:"
    echo "  - GitHub.com"
    echo "  - HTTPS"
    echo "  - Yes (authenticate Git)"
    echo "  - Login with a web browser"
    echo ""
    
    gh auth login
fi

echo ""
echo "🔧 Step 3: Set Git to Use HTTPS"
echo "────────────────────────────────────────────"

# Configure git to use HTTPS
git config --global credential.helper store
git config --global url."https://github.com/".insteadOf git@github.com:

echo "✓ Git configured to use HTTPS with credential storage"

echo ""
echo "🔄 Step 4: Update Remote URLs in Your Repos"
echo "────────────────────────────────────────────"

if [ -d ~/projects ]; then
    cd ~/projects
    
    for repo in Overlord-Monolith Overlord-Pc-Dashboard Overlord-Social L1T_GRID System-Overlord-Phase0; do
        if [ -d "$repo" ]; then
            echo "Updating $repo..."
            cd "$repo"
            
            # Get current remote
            CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
            
            if [[ "$CURRENT_REMOTE" == git@github.com:* ]]; then
                # Convert SSH to HTTPS
                NEW_REMOTE="https://github.com/Litree-Ceo/$repo.git"
                git remote set-url origin "$NEW_REMOTE"
                echo "  ✓ Changed to HTTPS: $NEW_REMOTE"
            elif [[ "$CURRENT_REMOTE" == https://github.com/* ]]; then
                echo "  ✓ Already using HTTPS: $CURRENT_REMOTE"
            else
                echo "  ⚠️  Setting new remote..."
                git remote add origin "https://github.com/Litree-Ceo/$repo.git" 2>/dev/null || \
                git remote set-url origin "https://github.com/Litree-Ceo/$repo.git"
                echo "  ✓ Remote set to: https://github.com/Litree-Ceo/$repo.git"
            fi
            
            cd ~/projects
        fi
    done
else
    echo "⚠️  ~/projects directory not found. Run sync script first."
fi

echo ""
echo "✅ Step 5: Test Push Access"
echo "────────────────────────────────────────────"

TEST_REPO=""
for candidate in Overlord-Monolith Overlord-Pc-Dashboard; do
    if [ -d "$HOME/projects/$candidate" ]; then
        TEST_REPO="$candidate"
        break
    fi
done

if [ -n "$TEST_REPO" ] && [ -d "$HOME/projects/$TEST_REPO" ]; then
    cd "$HOME/projects/$TEST_REPO"
    
    # Try a test push
    echo "Testing push to $TEST_REPO..."
    git pull origin main &>/dev/null || true
    
    # Create a test file
    echo "# Termux access test - $(date)" > .termux-test
    git add .termux-test
    git commit -m "test: Termux push access" &>/dev/null || true
    
    if git push origin main 2>&1 | tee /tmp/push-test.log; then
        echo "✅ SUCCESS! You can now push from Termux!"
        
        # Clean up test file
        git rm .termux-test &>/dev/null
        git commit -m "test: cleanup" &>/dev/null
        git push origin main &>/dev/null
    else
        echo "❌ Push failed. Check the error above."
        echo ""
        echo "Common fixes:"
        echo "1. Make sure you selected 'Yes' to authenticate Git during gh auth login"
        echo "2. Try: gh auth refresh -s repo,workflow"
        echo "3. Check if you're using the right GitHub account"
    fi
else
    echo "⚠️  Repo not found. Clone repos first with: ~/projects/sync"
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║              SETUP COMPLETE                  ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "📝 Next steps:"
echo "   1. Go to your project: cd ~/projects/Overlord-Social"
echo "   2. Make changes to any file"
echo "   3. Run: ~/projects/sync"
echo "   4. Your changes will push to GitHub!"
echo ""
