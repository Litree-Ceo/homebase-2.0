# Quick Start

## Local (Windows)

### Start everything (recommended)
```powershell
cd C:\Users\litre\Desktop\Overlord-Monolith
./start-all-servers.ps1
```

### URLs
- Dashboard: http://localhost:8080
- Social: http://localhost:3000
- Grid: http://localhost:5000

## Termux (Android) — optional

Use Termux only if you want to access/control Overlord from your phone (SSH/tunnels).

Start here:
- `REMOTE-ACCESS-GUIDE.md`
- `TUNNEL-INSTRUCTIONS.md`

Common Windows gotchas:
- `chmod` doesn’t exist in PowerShell → use Git Bash/WSL for `.sh` scripts
- `./script.sh` doesn’t work in PowerShell → use `bash script.sh`
