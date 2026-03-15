# Overlord-PC-Dashboard Workspace Guide

This guide helps you run, manage, and develop your Overlord-PC-Dashboard project on both Windows (PowerShell) and WSL (Linux/Bash).

## Windows PowerShell Usage
- Use PowerShell for all `.ps1` scripts and Windows paths.
- Example commands:
  - `& .venv\Scripts\Activate.ps1` (activate Python venv)
  - `./start-all.ps1` (start all services)
  - `./start-overlord.ps1` (start Overlord dashboard)
  - `./stop-servers.ps1` (stop all services)

## WSL/Bash Usage
- Use Bash/WSL for Linux commands and Linux paths.
- Example commands:
  - `source .venv/bin/activate` (activate Python venv in WSL)
  - `bash start-all.sh` (start all services)
  - `bash stop-servers.sh` (stop all services)

## VS Code Environment
- Your `.vscode/settings.json` is synced for optimal Python, Git, and file management.
- Recommended extensions: Python, Pylance, Black, Ruff, ESLint, Prettier, GitLens, PowerShell, MarkdownLint, YAML, etc.
- Tasks and launch configs can be added for debugging and automation.

## Duplicate Cleanup
- Workspace has been checked for duplicate files. Only the most recent and relevant files are kept.
- If you find any unnecessary files, you can safely delete them.

## General Tips
- Always use the correct shell for your scripts (PowerShell for `.ps1`, Bash for `.sh`).
- If you need to run Python, activate the correct virtual environment first.
- For cross-platform scripts, keep separate `.ps1` and `.sh` versions.
- If you need to sync more files or settings, copy from your Overlord-Monolith backup.

## Need Help?
- If you encounter errors, check your shell and path syntax.
- For missing dependencies, run `pip install -r requirements.txt` or `npm install` as needed.
- For further automation or cleanup, ask GitHub Copilot for help!

---

Enjoy your optimized Overlord-PC-Dashboard workspace!
