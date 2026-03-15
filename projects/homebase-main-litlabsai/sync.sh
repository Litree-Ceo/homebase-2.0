#!/bin/bash
# L1T GRID SYNC - Unified Synchronization Script
# Works in Termux, Codespaces, and Linux (Trae IDE)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOTFILES_DIR="$REPO_ROOT/dotfiles"

# Colors for output
CYAN='\033[0;36m'
GREEN='\033[0;32m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${MAGENTA}===============================================================${NC}"
echo -e "${MAGENTA}  L1T GRID - UNIFIED SYNC SYSTEM${NC}"
echo -e "${MAGENTA}===============================================================${NC}"

# 1. Sync Dotfiles
echo -e "
${CYAN}[1/3] Syncing Dotfiles...${NC}"
ln -sf "$DOTFILES_DIR/zshrc" "$HOME/.zshrc"
ln -sf "$DOTFILES_DIR/p10k.zsh" "$HOME/.p10k.zsh"
ln -sf "$DOTFILES_DIR/gitconfig" "$HOME/.gitconfig"
echo -e "${GREEN}✓ Dotfiles symlinked to home directory.${NC}"

# 2. Git Sync (GitHub)
echo -e "
${CYAN}[2/3] Syncing Code with GitHub...${NC}"
cd "$REPO_ROOT" || exit
git pull origin main --rebase

if [[ -n $(git status --porcelain) ]]; then
    echo -e "${MAGENTA}Uncommitted changes detected. Committing and pushing...${NC}"
    git add .
    git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
    git push origin main
    echo -e "${GREEN}✓ Changes pushed to GitHub.${NC}"
else
    echo -e "${GREEN}✓ Code is already up to date.${NC}"
fi

# 3. Dependency Sync
echo -e "
${CYAN}[3/3] Syncing Dependencies (pnpm)...${NC}"
if command -v pnpm >/dev/null; then
    pnpm install --no-frozen-lockfile
    echo -e "${GREEN}✓ Dependencies installed.${NC}"
else
    echo -e "${RED}✗ pnpm not found. Skipping dependency sync.${NC}"
fi

echo -e "
${MAGENTA}===============================================================${NC}"
echo -e "${GREEN}  SYNC COMPLETE - EVERYTHING IS IN LOCKSTEP${NC}"
echo -e "${MAGENTA}===============================================================${NC}"
