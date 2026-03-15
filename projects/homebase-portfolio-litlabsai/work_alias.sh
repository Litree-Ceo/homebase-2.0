#!/bin/bash

# L1T.GRID // THE_ARCHITECT_COMMAND_CENTER
# STATUS: OPERATIONAL // CLEARANCE: ROOT

# --- COLORS ---
RED='\033[1;31m'
GREEN='\033[1;32m'
CYAN='\033[1;36m'
YELLOW='\033[1;33m'
NC='\033[0m' 

echo -e "${RED}>>> ARCHITECT COMMAND CENTER INITIALIZED...${NC}"

# --- CORE ALIASES ---

# 1. THE GRID (Development)
alias grid-dev="echo -e '${CYAN}>>> Launching local development node...${NC}' && npm run dev -- --host"
alias grid-build="echo -e '${CYAN}>>> Rendering production fragments...${NC}' && npm run build"

# 2. THE BROADCAST (Deployment)
alias grid-deploy-web="echo -e '${RED}>>> BROADCASTING TO GITHUB_PAGES...${NC}' && npm run build && npm run deploy"
alias grid-deploy-ai="echo -e '${RED}>>> UPLOADING AI_CORE TO FIREBASE...${NC}' && firebase deploy --only functions"
alias grid-deploy-db="echo -e '${RED}>>> UPDATING GRID_RULES...${NC}' && firebase deploy --only firestore"
alias grid-deploy-all="grid-deploy-web && grid-deploy-ai && grid-deploy-db"

# 3. THE ARCHIVE (Git)
grid-sync() {
  local msg=${1:-"architect: grid update $(date +'%H:%M')"}
  echo -e "${GREEN}>>> Archiving changes: $msg${NC}"
  git add .
  git commit -m "$msg"
  git push
}

# 4. THE VOID (Maintenance)
alias grid-clean="echo -e '${YELLOW}>>> Purging system corpses...${NC}' && rm -rf dist && npm cache clean --force"
alias grid-logs="echo -e '${CYAN}>>> Accessing AI_CORE logs...${NC}' && firebase functions:log"

# 5. THE NETWORK (GitHub CLI)
alias grid-pull="echo -e '${CYAN}>>> Pulling latest (ff-only) from origin...${NC}' && git pull --ff-only origin \$(git branch --show-current)"
alias grid-pr="echo -e '${CYAN}>>> Opening PR archive...${NC}' && gh pr list"
alias grid-issue="echo -e '${CYAN}>>> Accessing system failures...${NC}' && gh issue list"
grid-sync-remote() {
  echo -e "${YELLOW}>>> Mirror syncing with origin (pull + push)...${NC}"
  gh repo sync
}
grid-save() {
    local msg=${1:-"grid: automated sync"}
    echo -e "${GREEN}>>> Creating checkpoint...${NC}"
    git add . && git commit -m "$msg" && git push
}

# 6. THE COGNITION (AI Agents)
alias agent-chat="echo -e '${RED}>>> INITIALIZING GEMINI_CLI...${NC}' && gemini"
alias agent-test="echo -e '${YELLOW}>>> Stress-testing Groq link...${NC}' && node test-groq.cjs"

# 7. THE STATUS (Info)
grid-status() {
  echo -e "${RED}--- L1T.GRID SYSTEM STATUS ---${NC}"
  echo -e "${GREEN}NODE:${NC} $(hostname)"
  echo -e "${GREEN}BRANCH:${NC} $(git branch --show-current)"
  echo -e "${GREEN}REMOTE:${NC} $(git remote get-url origin)"
  echo -e "${GREEN}AI_CORE:${NC} Groq/Llama-3.3"
  echo -e "${GREEN}SERVICES:${NC} Firebase (Functions/Firestore)"
  echo -e "${RED}----------------------------${NC}"
}

# --- AUTO-SUGGESTIONS & HINTS ---
echo -e "${CYAN}>>> GRID_MODULES LOADED: grid-dev, grid-save, grid-deploy-all, grid-status, agent-chat${NC}"
