# Enhanced Terminal Intelligence - Setup Guide

## 🧠 What You're Getting

A genius-level smart terminal system with:
- **Context Awareness**: Automatic project detection and environment awareness
- **Git Intelligence**: Smart branch management, commit suggestions, and workflow automation
- **Deployment Intelligence**: Multi-platform deployment with rollback capabilities
- **Emergency Intelligence**: Proactive monitoring, error detection, and automated recovery

## 📋 Quick Setup

### 1. Load the Enhanced Terminal

Add this to your PowerShell profile (`$PROFILE`):

```powershell
# Load Enhanced Terminal Intelligence
$TerminalPath = "C:\Users\litre\homebase-2.0\github\smart-terminal-enhanced.ps1"
if (Test-Path $TerminalPath) {
    . $TerminalPath
}
```

### 2. Verify Installation

```powershell
# Check if loaded
hb-help

# Should show all available commands
```

## 🎯 Core Commands

### Status & Monitoring
```powershell
hb                    # Quick status overview
hb-health             # Detailed project health
hb-monitor            # Continuous health monitoring
hb-diagnose "issue"   # Diagnose problems
```

### Development
```powershell
hb-dev                # Start dev environment
hb-dev [package]      # Start specific package
hb-build              # Build project
hb-lint               # Run linter
hb-test               # Run tests
```

### Git Operations
```powershell
hb-status             # Git status with suggestions
hb-pull               # Smart pull
hb-push "message"     # Smart push
hb-commit             # Get commit suggestions
```

### Deployment
```powershell
hb-deploy vercel      # Deploy to Vercel
hb-deploy azure       # Deploy to Azure
hb-rollback           # Rollback last deployment
hb-rollback 3         # Rollback 3 deployments
```

### Maintenance
```powershell
hb-clean              # Clear all caches
hb-monitor            # Monitor health
```

## 🔧 Configuration

### Customize Aliases

Edit `smart-terminal-enhanced.ps1` to add your own aliases:

```powershell
Set-Alias -Name your-alias -Value Your-Function -Force
```

### Adjust Monitoring Interval

```powershell
Monitor-ProjectHealth -IntervalSeconds 120  # Check every 2 minutes
```

### Add Custom Diagnostics

Edit `emergency-intelligence.ps1` to add more diagnostic steps:

```powershell
"your-issue" = @(
    "Step 1",
    "Step 2",
    "Step 3"
)
```

## 📊 Features in Detail

### Context Awareness
- Automatically detects monorepo structure
- Identifies current environment (local/staging/production)
- Monitors project health (dependencies, configs, etc.)
- Caches context for performance

### Git Intelligence
- Smart branch detection
- Commit message suggestions based on changes
- Automatic staging of untracked files
- Pull/push with status awareness

### Deployment Intelligence
- Pre-deployment readiness checks
- Multi-platform support (Vercel, Azure)
- Deployment history tracking
- One-command rollback

### Emergency Intelligence
- Continuous health monitoring
- Automatic recovery for common issues
- Disk space and memory monitoring
- Diagnostic suggestions for problems

## 🚀 Advanced Usage

### Continuous Monitoring

```powershell
# Start monitoring in background
$job = Start-Job -ScriptBlock { Monitor-ProjectHealth -IntervalSeconds 60 }

# View results
Receive-Job $job

# Stop monitoring
Stop-Job $job
```

### Custom Deployment Workflow

```powershell
# Check readiness
Test-DeploymentReady

# Deploy
Deploy-ToVercel -Environment production

# Monitor
Monitor-ProjectHealth
```

### Automated Recovery

The system automatically detects and fixes:
- Empty node_modules
- Missing lock files
- Low disk space
- Memory issues
- Git configuration problems

## 📝 Troubleshooting

### Commands not found?
```powershell
# Reload the terminal
. "C:\Users\litre\homebase-2.0\github\smart-terminal-enhanced.ps1"
```

### Slow performance?
```powershell
# Clear caches
hb-clean

# Check health
hb-health
```

### Git issues?
```powershell
# Diagnose
hb-diagnose "git issues"
```

## 🔄 Updating

To update the terminal intelligence:

1. Pull latest changes
2. Reload PowerShell profile
3. Run `hb-health` to verify

## 📚 Module Structure

```
terminal-intelligence/
├── context-awareness.ps1      # Project detection
├── git-intelligence.ps1        # Git operations
├── deployment-intelligence.ps1 # Deployment automation
└── emergency-intelligence.ps1  # Monitoring & recovery

smart-terminal-enhanced.ps1     # Main integration
fix-workspace.ps1               # Workspace configuration
```

## 🎓 Tips & Tricks

### Quick Status Check
```powershell
hb  # Shows everything at a glance
```

### Smart Development
```powershell
hb-dev litlabs-web  # Start specific app
```

### Safe Deployment
```powershell
Test-DeploymentReady  # Check before deploying
hb-deploy vercel      # Deploy when ready
```

### Emergency Recovery
```powershell
hb-diagnose "build fails"  # Get suggestions
hb-clean                   # Clear caches
hb-dev                     # Try again
```

## 🆘 Support

For issues or questions:
1. Run `hb-diagnose` with your symptom
2. Check `hb-health` for system status
3. Review logs in terminal output

---

**Version**: 2.0.0-genius  
**Last Updated**: 2025  
**Status**: Production Ready ✓
