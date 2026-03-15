#!/bin/bash

# ============================================================================
# HOMEBASE PRO - Termux Deployment Script
# Mobile development and deployment from Android devices
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="HomeBase Pro"
PROJECT_VERSION="2.0.0"
BUILD_DIR="dist"

# Helper functions
print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║          🚀 HOMEBASE PRO - Termux Deploy Script              ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_step() {
    echo -e "${CYAN}→ $1${NC}"
}

# Check if running in Termux
check_termux() {
    if [ -z "$TERMUX_VERSION" ] && [ -z "$TERMUX_API_VERSION" ]; then
        print_warning "Not running in Termux environment"
        print_info "This script is optimized for Termux on Android"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "Running in Termux v${TERMUX_VERSION}"
    fi
}

# Check dependencies
check_dependencies() {
    print_step "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found"
        print_info "Installing Node.js..."
        pkg update -y
        pkg install nodejs -y
    fi
    
    NODE_VERSION=$(node -v)
    print_success "Node.js ${NODE_VERSION}"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    print_success "npm ${NPM_VERSION}"
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_warning "Git not found, installing..."
        pkg install git -y
    fi
    
    print_success "Git installed"
}

# Setup storage permissions
setup_storage() {
    print_step "Setting up storage..."
    
    # Request storage permission on Android
    if [ -n "$TERMUX_VERSION" ]; then
        termux-setup-storage
        print_success "Storage permission granted"
    fi
    
    # Create necessary directories
    mkdir -p ~/.termux/boot
    mkdir -p ~/storage/shared/HomeBasePro
}

# Install dependencies
install_deps() {
    print_step "Installing dependencies..."
    
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_error "package.json not found"
        exit 1
    fi
}

# Development server
dev_server() {
    print_step "Starting development server..."
    print_info "Server will be available at: http://localhost:3001"
    print_info "Press Ctrl+C to stop"
    
    # Check if port is already in use
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port 3001 is already in use"
        print_info "Killing existing process..."
        kill $(lsof -t -i:3001) 2>/dev/null || true
        sleep 2
    fi
    
    npm run dev
}

# Build production
build_production() {
    print_step "Building for production..."
    
    # Clean previous build
    rm -rf ${BUILD_DIR}
    
    # Build
    npm run build
    
    if [ -d "${BUILD_DIR}" ]; then
        print_success "Build completed: ${BUILD_DIR}/"
        
        # Show build size
        BUILD_SIZE=$(du -sh ${BUILD_DIR} | cut -f1)
        print_info "Build size: ${BUILD_SIZE}"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Deploy to Firebase
deploy_firebase() {
    print_step "Deploying to Firebase..."
    
    # Check if firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        print_info "Installing Firebase CLI..."
        npm install -g firebase-tools
    fi
    
    # Check if logged in
    if ! firebase projects:list &> /dev/null; then
        print_info "Please login to Firebase"
        firebase login
    fi
    
    # Deploy
    firebase deploy
    print_success "Deployed to Firebase"
}

# Deploy to local server (for testing)
deploy_local() {
    print_step "Setting up local deployment..."
    
    build_production
    
    # Copy to Termux web server directory
    if [ -d "~/storage/shared/HomeBasePro" ]; then
        cp -r ${BUILD_DIR}/* ~/storage/shared/HomeBasePro/
        print_success "Copied to ~/storage/shared/HomeBasePro/"
    fi
    
    # Start Python HTTP server
    print_info "Starting local HTTP server on port 8080..."
    cd ${BUILD_DIR}
    python3 -m http.server 8080 &
    SERVER_PID=$!
    
    print_success "Server running at http://localhost:8080"
    print_info "PID: ${SERVER_PID}"
    print_info "Stop server with: kill ${SERVER_PID}"
}

# Create Android shortcut
create_shortcut() {
    print_step "Creating Android shortcut..."
    
    if [ -n "$TERMUX_VERSION" ]; then
        # Create Termux widget script
        mkdir -p ~/.shortcuts
        
        cat > ~/.shortcuts/HomeBasePro << 'EOF'
#!/bin/bash
cd ~/HomeBase-Pro/homebase-portfolio
npm run dev
EOF
        chmod +x ~/.shortcuts/HomeBasePro
        
        print_success "Shortcut created in Termux:Widget"
        print_info "Add Termux:Widget to your home screen to access it"
    else
        print_warning "Skipping shortcut creation (not in Termux)"
    fi
}

# Sync to cloud storage
sync_cloud() {
    print_step "Syncing to cloud storage..."
    
    # Check for rclone
    if command -v rclone &> /dev/null; then
        print_info "Syncing with rclone..."
        # Add your rclone remote name here
        # rclone sync ${BUILD_DIR} remote:HomeBasePro
        print_warning "Configure rclone remote before using this feature"
    else
        # Manual copy to shared storage
        if [ -d "~/storage/shared" ]; then
            cp -r ${BUILD_DIR} ~/storage/shared/HomeBasePro-Build
            print_success "Copied to ~/storage/shared/HomeBasePro-Build/"
        fi
    fi
}

# Backup project
backup_project() {
    print_step "Creating backup..."
    
    BACKUP_NAME="homebase-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Create backup excluding node_modules
    tar -czf ${BACKUP_NAME} \
        --exclude='node_modules' \
        --exclude='${BUILD_DIR}' \
        --exclude='.git' \
        .
    
    if [ -d "~/storage/shared" ]; then
        mv ${BACKUP_NAME} ~/storage/shared/
        print_success "Backup saved to ~/storage/shared/${BACKUP_NAME}"
    else
        print_success "Backup saved to ./${BACKUP_NAME}"
    fi
}

# Health check
health_check() {
    print_step "Running health check..."
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then 
        print_success "Node.js version OK (${NODE_VERSION})"
    else
        print_warning "Node.js version ${NODE_VERSION} may be too old (recommended: ${REQUIRED_VERSION}+)"
    fi
    
    # Check disk space
    DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | tr -d '%')
    if [ "$DISK_USAGE" -gt 90 ]; then
        print_warning "Low disk space: ${DISK_USAGE}% used"
    else
        print_success "Disk space OK: ${DISK_USAGE}% used"
    fi
    
    # Check memory
    if command -v free &> /dev/null; then
        MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
        if [ "$MEM_USAGE" -gt 90 ]; then
            print_warning "High memory usage: ${MEM_USAGE}%"
        else
            print_success "Memory OK: ${MEM_USAGE}% used"
        fi
    fi
    
    # Check for updates
    if [ -f "package.json" ]; then
        print_info "Checking for dependency updates..."
        npm outdated 2>/dev/null || print_info "All dependencies up to date"
    fi
}

# Display menu
show_menu() {
    echo
    echo -e "${CYAN}Available Commands:${NC}"
    echo "  ${GREEN}1${NC}. ${YELLOW}dev${NC}        - Start development server"
    echo "  ${GREEN}2${NC}. ${YELLOW}build${NC}      - Build for production"
    echo "  ${GREEN}3${NC}. ${YELLOW}deploy${NC}     - Deploy to Firebase"
    echo "  ${GREEN}4${NC}. ${YELLOW}local${NC}      - Deploy locally with HTTP server"
    echo "  ${GREEN}5${NC}. ${YELLOW}install${NC}    - Install dependencies"
    echo "  ${GREEN}6${NC}. ${YELLOW}backup${NC}     - Create project backup"
    echo "  ${GREEN}7${NC}. ${YELLOW}sync${NC}       - Sync to cloud storage"
    echo "  ${GREEN}8${NC}. ${YELLOW}shortcut${NC}   - Create Android shortcut"
    echo "  ${GREEN}9${NC}. ${YELLOW}health${NC}     - Run health check"
    echo "  ${GREEN}0${NC}. ${YELLOW}setup${NC}      - Initial setup"
    echo "  ${GREEN}q${NC}. ${YELLOW}quit${NC}       - Exit"
    echo
}

# Main execution
main() {
    print_header
    
    # Check if command is provided
    COMMAND=${1:-""}
    
    case $COMMAND in
        "dev"|"1")
            check_termux
            check_dependencies
            dev_server
            ;;
        "build"|"2")
            check_dependencies
            build_production
            ;;
        "deploy"|"3")
            check_dependencies
            build_production
            deploy_firebase
            ;;
        "local"|"4")
            check_dependencies
            deploy_local
            ;;
        "install"|"5")
            check_termux
            check_dependencies
            install_deps
            ;;
        "backup"|"6")
            backup_project
            ;;
        "sync"|"7")
            sync_cloud
            ;;
        "shortcut"|"8")
            create_shortcut
            ;;
        "health"|"9")
            health_check
            ;;
        "setup"|"0")
            check_termux
            check_dependencies
            setup_storage
            install_deps
            create_shortcut
            print_success "Setup complete!"
            ;;
        "menu"|"")
            while true; do
                show_menu
                read -p "Enter command: " choice
                case $choice in
                    1|dev) main "dev"; break ;;
                    2|build) main "build"; break ;;
                    3|deploy) main "deploy"; break ;;
                    4|local) main "local"; break ;;
                    5|install) main "install"; break ;;
                    6|backup) main "backup"; break ;;
                    7|sync) main "sync"; break ;;
                    8|shortcut) main "shortcut"; break ;;
                    9|health) main "health"; break ;;
                    0|setup) main "setup"; break ;;
                    q|quit) print_info "Goodbye!"; exit 0 ;;
                    *) print_error "Invalid command" ;;
                esac
            done
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            print_info "Usage: ./deploy-termux.sh [command]"
            print_info "Run without arguments for interactive menu"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
