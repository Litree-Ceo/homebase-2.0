# Emergency Reset & Full Restart Guide

## How to Fully Reset EverythingHomebase

1. **Close all running dev servers and editors.**
2. **Open PowerShell in the workspace root.**
3. **Run:**
   ```
   ```powershell
   ./reset-all.ps1
   ```
   ```
   - This will:
     - Clean all untracked files and folders
     - Remove any git locks
     - Reinstall all dependencies
     - Rebuild all apps/packages
     - Lint and format everything
4. **Wait for the script to finish.**
5. **Reopen VS Code and start developing!**

---

- If you ever get stuck, just run `./reset-all.ps1` for a clean, synced, ready-to-go workspace.
- All Azure, Git, and automation settings are preserved.

**You are always one command away from a perfect restart.**
