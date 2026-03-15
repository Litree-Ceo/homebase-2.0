#!/bin/bash
#
# Deployment Script for HomeBase Pro
# Handles deployment to multiple environments with rollback capability
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="homebase-portfolio"
ENVIRONMENT=${1:-production}
VERSION=$(node -p "require('./package.json').version")
BUILD_DIR="dist"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log_error "node_modules not found. Run 'npm install' first."
        exit 1
    fi
    
    # Check environment variables
    if [ -z "$VITE_FIREBASE_API_KEY" ]; then
        log_warn "Firebase API key not set. Loading from .env..."
        if [ -f ".env" ]; then
            export $(cat .env | xargs)
        else
            log_error ".env file not found"
            exit 1
        fi
    fi
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI not installed. Run 'npm install -g firebase-tools'"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Create backup
create_backup() {
    log_info "Creating backup..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup current build if exists
    if [ -d "$BUILD_DIR" ]; then
        cp -r "$BUILD_DIR" "$BACKUP_DIR/"
        log_info "Build backed up to $BACKUP_DIR"
    fi
    
    # Backup configuration
    cp package.json "$BACKUP_DIR/"
    if [ -f ".env" ]; then
        cp .env "$BACKUP_DIR/"
    fi
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Lint check
    npm run lint || {
        log_error "Linting failed"
        exit 1
    }
    
    # Build check
    npm run build || {
        log_error "Build failed"
        exit 1
    }
    
    log_info "Tests passed ✓"
}

# Build application
build_app() {
    log_info "Building for $ENVIRONMENT..."
    
    # Set environment
    export NODE_ENV=$ENVIRONMENT
    export VITE_APP_ENV=$ENVIRONMENT
    
    # Clean previous build
    rm -rf "$BUILD_DIR"
    
    # Build
    npm run build
    
    # Verify build
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        log_error "Build verification failed - index.html not found"
        exit 1
    fi
    
    log_info "Build completed ✓"
}

# Deploy to Firebase
deploy_firebase() {
    log_info "Deploying to Firebase ($ENVIRONMENT)..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        firebase deploy --only hosting:production
    elif [ "$ENVIRONMENT" = "staging" ]; then
        firebase deploy --only hosting:staging
    else
        firebase deploy --only hosting
    fi
    
    log_info "Deployment completed ✓"
}

# Deploy functions
deploy_functions() {
    log_info "Deploying Firebase Functions..."
    
    cd functions
    npm ci
    npm run build
    firebase deploy --only functions
    cd ..
    
    log_info "Functions deployed ✓"
}

# Update deployment metadata
update_metadata() {
    log_info "Updating deployment metadata..."
    
    cat > "$BUILD_DIR/version.json" << EOF
{
  "version": "$VERSION",
  "environment": "$ENVIRONMENT",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "gitCommit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF

    log_info "Metadata updated ✓"
}

# Rollback function
rollback() {
    log_warn "Initiating rollback..."
    
    if [ -d "$BACKUP_DIR/dist" ]; then
        rm -rf "$BUILD_DIR"
        cp -r "$BACKUP_DIR/dist" "$BUILD_DIR"
        log_info "Restored from backup"
        
        # Re-deploy
        deploy_firebase
        log_info "Rollback completed ✓"
    else
        log_error "No backup found for rollback"
        exit 1
    fi
}

# Main deployment flow
main() {
    log_info "Starting deployment of $PROJECT_NAME v$VERSION to $ENVIRONMENT"
    
    # Trap errors for rollback
    trap 'log_error "Deployment failed"; rollback' ERR
    
    check_prerequisites
    create_backup
    run_tests
    build_app
    update_metadata
    deploy_firebase
    
    if [ "$DEPLOY_FUNCTIONS" = "true" ]; then
        deploy_functions
    fi
    
    log_info "====================================="
    log_info "Deployment successful! 🚀"
    log_info "Version: $VERSION"
    log_info "Environment: $ENVIRONMENT"
    log_info "Backup: $BACKUP_DIR"
    log_info "====================================="
}

# Show usage
usage() {
    echo "Usage: $0 [environment] [options]"
    echo ""
    echo "Environments:"
    echo "  production    Deploy to production (default)"
    echo "  staging       Deploy to staging"
    echo "  development   Deploy to development"
    echo ""
    echo "Options:"
    echo "  --functions   Also deploy Firebase Functions"
    echo "  --rollback    Rollback to previous deployment"
    echo ""
    echo "Examples:"
    echo "  $0 production"
    echo "  $0 staging --functions"
    echo "  $0 --rollback"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --functions)
            DEPLOY_FUNCTIONS=true
            shift
            ;;
        --rollback)
            rollback
            exit 0
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        production|staging|development)
            ENVIRONMENT=$1
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main
main
