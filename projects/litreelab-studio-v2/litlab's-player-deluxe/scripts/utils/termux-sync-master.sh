#!/bin/bash
# 🎯 MASTER SYNC SETUP - Choose Your Sync Method
# All-in-one script for setting up PC ↔ Termux sync

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_banner() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                           ║${NC}"
    echo -e "${CYAN}║         🔄 OVERLORD UNIFIED SYNC SYSTEM 🔄                ║${NC}"
    echo -e "${CYAN}║                                                           ║${NC}"
    echo -e "${CYAN}║              PC ←→ Termux Synchronization                 ║${NC}"
    echo -e "${CYAN}║                                                           ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

show_menu() {
    echo -e "${YELLOW}Choose your sync method:${NC}"
    echo ""
    echo -e "${GREEN}1)${NC} ${CYAN}Git + GitHub${NC}         - Version control + cloud backup (RECOMMENDED)"
    echo -e "${GREEN}2)${NC} ${CYAN}Syncthing${NC}            - Real-time automatic sync (Dropbox-like)"
    echo -e "${GREEN}3)${NC} ${CYAN}SSH Server${NC}           - Remote access from PC to Termux files"
    echo -e "${GREEN}4)${NC} ${CYAN}Shared Storage${NC}       - USB cable access (simple file transfers)"
    echo ""
    echo -e "${GREEN}5)${NC} ${YELLOW}Setup ALL${NC}            - Install all sync methods (smart choice!)"
    echo ""
    echo -e "${GREEN}6)${NC} ${BLUE}Fix vision-board${NC}     - Fix Turbopack error in Next.js"
    echo ""
    echo -e "${GREEN}7)${NC} ${RED}Exit${NC}"
    echo ""
}

setup_git() {
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Git + GitHub Setup${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/termux-git-setup.sh" ]; then
        bash "$SCRIPT_DIR/termux-git-setup.sh"
    else
        echo -e "${RED}Error: termux-git-setup.sh not found${NC}"
        echo "Download it from GitHub first!"
    fi
}

setup_syncthing() {
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Syncthing Setup${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/setup-syncthing-termux.sh" ]; then
        bash "$SCRIPT_DIR/setup-syncthing-termux.sh"
    else
        echo -e "${RED}Error: setup-syncthing-termux.sh not found${NC}"
    fi
}

setup_ssh() {
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  SSH Server Setup${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/setup-ssh-termux.sh" ]; then
        bash "$SCRIPT_DIR/setup-ssh-termux.sh"
    else
        echo -e "${RED}Error: setup-ssh-termux.sh not found${NC}"
    fi
}

setup_shared_storage() {
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Shared Storage Setup${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/setup-shared-storage.sh" ]; then
        bash "$SCRIPT_DIR/setup-shared-storage.sh"
    else
        echo -e "${RED}Error: setup-shared-storage.sh not found${NC}"
    fi
}

setup_all() {
    echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  Setting Up ALL Sync Methods${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
    echo ""
    echo "This will install and configure:"
    echo "  ✓ Git + GitHub (version control)"
    echo "  ✓ Syncthing (real-time sync)"
    echo "  ✓ SSH Server (remote access)"
    echo "  ✓ Shared Storage (USB access)"
    echo ""
    read -p "Continue? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${GREEN}[1/4] Git + GitHub...${NC}"
        setup_git
        
        echo ""
        echo -e "${GREEN}[2/4] Syncthing...${NC}"
        setup_syncthing
        
        echo ""
        echo -e "${GREEN}[3/4] SSH Server...${NC}"
        setup_ssh
        
        echo ""
        echo -e "${GREEN}[4/4] Shared Storage...${NC}"
        setup_shared_storage
        
        echo ""
        echo -e "${GREEN}╔═══════════════════════════════════════════════${NC}"
        echo -e "${GREEN}║  ALL SYNC METHODS INSTALLED!                  ${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${CYAN}🎉 You now have 4 ways to sync PC ↔ Termux:${NC}"
        echo ""
        echo -e "${YELLOW}Daily Use:${NC}"
        echo "  - Git for version control:  ~/projects/sync"
        echo "  - Syncthing runs automatically in background"
        echo ""
        echo -e "${YELLOW}When Needed:${NC}"
        echo "  - SSH: Connect from PC:  ssh $(whoami)@YOUR_PHONE_IP -p 8022"
        echo "  - USB: Plug phone → Open Termux-Projects folder"
        echo ""
    fi
}

fix_vision_board() {
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  Fix vision-board Turbopack Error${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/fix-vision-board.sh" ]; then
        bash "$SCRIPT_DIR/fix-vision-board.sh"
    else
        echo -e "${RED}Error: fix-vision-board.sh not found${NC}"
    fi
}

# Main loop
while true; do
    clear
    show_banner
    show_menu
    
    read -p "Enter choice [1-7]: " choice
    
    case $choice in
        1)
            clear
            setup_git
            read -p "Press Enter to continue..."
            ;;
        2)
            clear
            setup_syncthing
            read -p "Press Enter to continue..."
            ;;
        3)
            clear
            setup_ssh
            read -p "Press Enter to continue..."
            ;;
        4)
            clear
            setup_shared_storage
            read -p "Press Enter to continue..."
            ;;
        5)
            clear
            setup_all
            read -p "Press Enter to continue..."
            ;;
        6)
            clear
            fix_vision_board
            read -p "Press Enter to continue..."
            ;;
        7)
            echo ""
            echo -e "${GREEN}✅ Goodbye!${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please select 1-7.${NC}"
            sleep 2
            ;;
    esac
done
