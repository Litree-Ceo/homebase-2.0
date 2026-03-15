# Agent Zero Enhanced 🚀

A powerful development assistant designed for Trae IDE integration. Works without external API dependencies and provides enhanced development workflow support.

## Features ✨

- **No API Dependencies**: Works completely offline
- **Trae IDE Integration**: Optimized for Trae development environment
- **Project Analysis**: Automatically detects and analyzes your project type
- **Build System**: Integrated build commands for multiple languages
- **Docker Management**: Control Docker containers from within
- **Git Integration**: Git operations and repository management
- **Code Analysis**: Linting and code quality checks
- **File Operations**: Project structure analysis and file management

## Quick Start 🏃‍♂️

### Option 1: Direct Python (Recommended for Trae)
```bash
python main_enhanced.py
```

### Option 2: Docker (Full Isolation)
```bash
# Using enhanced Docker setup
docker-compose -f docker-compose-enhanced.yml up --build

# Or use the enhanced Dockerfile directly
docker build -f Dockerfile.enhanced -t agent-zero-enhanced .
docker run -it -v $(pwd):/workspace agent-zero-enhanced
```

### Option 3: Quick Launcher Scripts
```bash
# Windows PowerShell
.\start.ps1

# Linux/Mac
./start.sh
```

## Commands 🎮

### Analysis & Status
- `status` - Show agent and project status
- `analyze` - Analyze your codebase structure
- `hello` - Get introduction and available commands
- `help` - Show all available commands

### Development
- `build` - Build your project (auto-detects type)
- `lint` - Run code linting and quality checks
- `run <command>` - Execute custom shell commands

### Project Management
- `git status` - Check git repository status
- `docker status` - Show Docker containers
- `files` - Show project file structure

### Agent Control
- `capabilities` - List enhanced capabilities
- `history` - Show conversation history
- `save <filename>` - Save conversation
- `load <filename>` - Load conversation
- `clear` - Clear history
- `exit` - Exit the agent

## Project Detection 🔍

Agent Zero Enhanced automatically detects:
- **Node.js** projects (package.json)
- **Python** projects (requirements.txt)
- **Rust** projects (Cargo.toml)
- **Go** projects (go.mod)
- **Java** projects (pom.xml, build.gradle)
- **Docker** projects (Dockerfile, docker-compose.yml)

## Trae IDE Integration 🎯

The enhanced version is specifically designed for Trae IDE:
- Mounts your entire workspace for full project access
- Provides development-focused commands
- Integrates with build systems and tools
- Offers project-specific assistance

## Docker Features 🐳

When running in Docker:
- Full Docker CLI available inside container
- Can manage other containers
- Access to Docker socket for container orchestration
- Persistent logs and data directories

## Examples 💡

```bash
# Analyze your project
analyze

# Build your project (auto-detects type)
build

# Check code quality
lint

# Run custom commands
run npm test
run python -m pytest
run cargo check

# Git operations
git status

# Docker management
docker status
```

## No API Keys Needed 🔑

Unlike the original Agent Zero, this enhanced version works completely offline without requiring:
- OpenAI API keys
- Google AI API keys
- Anthropic API keys
- Any external AI services

## File Structure 📁

```
agent-zero/
├── main_enhanced.py          # Enhanced main agent
├── Dockerfile.enhanced       # Enhanced Docker configuration
├── docker-compose-enhanced.yml # Enhanced Docker Compose
├── start.sh                  # Linux/Mac launcher
├── start.ps1                 # Windows PowerShell launcher
├── requirements.txt          # Python dependencies
├── logs/                     # Persistent logs
└── data/                     # Persistent data
```

## Development 🛠️

To extend Agent Zero Enhanced:

1. Add new capabilities in the `capabilities` list
2. Implement new commands in the `generate_response` method
3. Add project type detection in the `scan_project` method
4. Extend build/lint commands for new project types

## Troubleshooting 🔧

### Container won't start
- Check Docker is running: `docker ps`
- Ensure ports aren't conflicting
- Check volume mount permissions

### Commands not working
- Verify you're in the right directory
- Check project type is detected correctly
- Use `status` to see current working directory

### Build failures
- Ensure project dependencies are installed
- Check build configuration files exist
- Use `analyze` to verify project structure

Enjoy your enhanced development assistant! 🎉