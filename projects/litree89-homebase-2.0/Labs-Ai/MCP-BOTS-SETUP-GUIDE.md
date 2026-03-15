# 🤖 MCP Bots Setup & Configuration Guide

## 📋 Overview

This guide explains how to set up all Model Context Protocol (MCP) bots for the Labs-Ai project. MCP bots enhance GitHub Copilot with specialized capabilities for Azure, Git, code quality, databases, and more.

## ✅ Configuration Status

### ✨ **GOOD NEWS**: MCP Configuration is Complete!

Your [.vscode/settings.json](d:\LiTreeLabStudio.vscode\settings.json) now has all 14 MCP servers configured:

1. ✅ **Azure MCP** - Azure resource management & best practices
2. ✅ **Azure Functions MCP** - Functions development tools
3. ✅ **Git MCP** - Version control operations
4. ✅ **GitHub MCP** - Repository operations & PR management
5. ✅ **Codacy MCP** - Code quality analysis & security scanning
6. ✅ **Docker MCP** - Container management
7. ✅ **Postman MCP** - API testing
8. ✅ **Filesystem MCP** - File operations
9. ✅ **SQLite MCP** - SQLite database operations
10. ✅ **MSSQL MCP** - SQL Server operations
11. ✅ **Puppeteer MCP** - Browser automation
12. ✅ **SCOPE Studio MCP** - SCOPE script development
13. ✅ **AI Toolkit MCP** - AI development tools
14. ✅ **Web Search MCP** - Internet search capabilities

## 🔐 Environment Variables Required

Some MCP bots require API keys and tokens. Here's what you need:

### Required (Critical for Key Features)

| Variable                | Required For | How to Get                                                                     |
| ----------------------- | ------------ | ------------------------------------------------------------------------------ |
| `AZURE_SUBSCRIPTION_ID` | Azure MCP    | [Azure Portal](https://portal.azure.com) → Subscriptions                       |
| `GITHUB_TOKEN`          | GitHub MCP   | [GitHub Settings](https://github.com/settings/tokens) → Personal Access Tokens |
| `CODACY_API_TOKEN`      | Codacy MCP   | [Codacy Account](https://app.codacy.com/account/api-tokens) → API Tokens       |

### Optional (Enhanced Features)

| Variable          | Required For   | How to Get                                                             |
| ----------------- | -------------- | ---------------------------------------------------------------------- |
| `POSTMAN_API_KEY` | Postman MCP    | [Postman Settings](https://postman.co/settings/me/api-keys) → API Keys |
| `BRAVE_API_KEY`   | Web Search MCP | [Brave Search API](https://brave.com/search/api/) → Sign Up            |

## 🚀 Quick Setup

### Option 1: Automated Setup Script

Run the setup script to check and configure everything:

```powershell
cd "d:\LiTreeLabStudio\Projects\Active\Labs-Ai"
.\setup-mcp-env.ps1
```

This script will:

- ✅ Load variables from `.env.local`
- ✅ Check which MCP bots are configured
- ✅ Show which environment variables are missing
- ✅ Optionally launch VS Code with proper environment

### Option 2: Manual Setup

#### Step 1: Get API Keys

1. **Azure Subscription ID**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to "Subscriptions"
   - Copy your Subscription ID

2. **GitHub Token**
   - Go to [GitHub Settings](https://github.com/settings/tokens)
   - Generate new token (classic)
   - Required scopes: `repo`, `read:org`, `workflow`

3. **Codacy Token**
   - Go to [Codacy Account](https://app.codacy.com/account/api-tokens)
   - Create new API token
   - Name it "LitLabs MCP"

#### Step 2: Add to .env.local

Open `d:\LiTreeLabStudio\Projects\Active\Labs-Ai\.env.local` and add:

```bash
# MCP Bot Credentials
AZURE_SUBSCRIPTION_ID=your-azure-subscription-id-here
GITHUB_TOKEN=ghp_your_github_token_here
CODACY_API_TOKEN=your-codacy-token-here

# Optional MCP Bots
POSTMAN_API_KEY=PMAK-your-postman-key-here
BRAVE_API_KEY=BSA-your-brave-key-here
```

#### Step 3: Restart VS Code

1. Press `Ctrl+Shift+P`
2. Type "Reload Window"
3. Press Enter

## 🔍 Verifying Setup

### Check MCP Bots are Active

Open GitHub Copilot Chat and try these commands:

```
@workspace What MCP tools are available?
```

You should see responses using various MCP servers.

### Test Individual Bots

```
# Test Azure MCP
Ask about Azure best practices

# Test Git MCP
@workspace Show me the current git status

# Test GitHub MCP
@workspace What are the open PRs?

# Test Codacy MCP
@workspace Run code quality analysis on this file
```

## 📦 MCP Bot Packages

All bots are installed automatically via `npx` when first used. No manual installation needed!

The packages used:

- `@azure/mcp-server-azure`
- `@azure/mcp-server-azure-functions`
- `@modelcontextprotocol/server-git`
- `@modelcontextprotocol/server-github`
- `@codacy/mcp-server`
- `@docker/mcp-server`
- `@postman/mcp-server`
- `@modelcontextprotocol/server-filesystem`
- `@modelcontextprotocol/server-sqlite`
- `@microsoft/mcp-server-mssql`
- `@modelcontextprotocol/server-puppeteer`
- `@microsoft/scope-studio-mcp`
- `@microsoft/aitk-mcp-server`
- `@modelcontextprotocol/server-brave-search`

## 🎯 What Each Bot Does

### Azure MCP (`azure-mcp`)

- Azure resource management
- Best practices for Azure services
- Deployment guidance
- Azure Functions support

### Git MCP (`git`)

- Branch management
- Commit operations
- Repository status
- Diff viewing

### GitHub MCP (`github`)

- Pull request operations
- Issue management
- Repository insights
- Workflow automation

### Codacy MCP (`codacy`)

- **CRITICAL FOR THIS PROJECT**: Automatic code quality analysis
- Security vulnerability scanning
- Code complexity analysis
- See `.github/instructions/codacy.instructions.md` for usage rules

### Docker MCP (`docker`)

- Container management
- Image operations
- Docker Compose support

### Postman MCP (`postman`)

- API testing
- Collection management
- Environment variables

### MSSQL MCP (`mssql`)

- SQL Server operations
- Database queries
- Schema exploration

### Filesystem MCP (`filesystem`)

- File operations beyond standard VS Code
- Directory traversal
- Bulk file operations

### AI Toolkit MCP (`aitk`)

- AI agent development
- Model evaluation
- Tracing and debugging

## 🔧 Troubleshooting

### MCP Bots Not Showing Up

1. **Check settings are saved**

   ```powershell
   Get-Content "d:\LiTreeLabStudio\.vscode\settings.json" | Select-String "mcp"
   ```

   Should show MCP configuration.

2. **Verify environment variables**

   ```powershell
   .\setup-mcp-env.ps1
   ```

3. **Reload VS Code**
   - Press `Ctrl+Shift+P`
   - Type "Reload Window"
   - Press Enter

### Specific Bot Not Working

1. **Check API key is valid**
   - Tokens can expire
   - Check permissions/scopes

2. **Check bot package**

   ```powershell
   npx --yes @azure/mcp-server-azure --version
   ```

3. **Check VS Code Output**
   - View → Output
   - Select "GitHub Copilot" from dropdown
   - Look for MCP-related errors

### Codacy Analysis Not Running

Per the Codacy instructions (`.github/instructions/codacy.instructions.md`):

- **CRITICAL**: After ANY file edit, Codacy analysis MUST run automatically
- If Codacy CLI is not installed, you'll be prompted to install it
- Analysis uses: `codacy_cli_analyze` tool
- Organization: `LitLabs420`
- Repository: `Labs-Ai`

## 📚 Additional Resources

### Documentation

- [Main README](d:\LiTreeLabStudio\Projects\Active\Labs-Ai\README.md)
- [Copilot Instructions](.github/copilot-instructions.md)
- [Codacy Instructions](.github/instructions/codacy.instructions.md)
- [MCP Setup Guide](.vscode/MCP-SETUP-GUIDE.md)

### Scripts

- `activate-all-bots.ps1` - Pre-warm MCP bots and optimize performance
- `setup-mcp-env.ps1` - Configure environment variables (THIS FILE)
- `quick-commands.ps1` - Useful development aliases

## 🎉 You're All Set!

Once configured, your MCP bots will:

- ✅ Automatically activate when you ask relevant questions
- ✅ Enhance Copilot with specialized knowledge
- ✅ Provide real-time code quality feedback
- ✅ Integrate with your development tools

**Happy coding with superpowered Copilot! 🚀**

---

## ⚡ Quick Reference

```powershell
# Check MCP configuration
.\setup-mcp-env.ps1

# Pre-warm all bots (faster first use)
.\activate-all-bots.ps1

# Load quick commands
. .\quick-commands.ps1

# Start dev server
npm run dev
```
