#!/data/data/com.termux/files/usr/bin/bash
# overlord — Control your Windows PC from Termux
# Install: bash ~/projects/Overlord-Monolith/scripts/termux-ctx-install.sh
# (installer handles this file too)

SSH="ssh -i ~/.ssh/overlord_key -o ConnectTimeout=5 -o ServerAliveInterval=60 litre@192.168.0.77"
REPO="C:\Users\litre\Desktop\Overlord-Monolith"

_check_key() {
    if [ ! -f ~/.ssh/overlord_key ]; then
        echo "❌ SSH key missing: ~/.ssh/overlord_key"
        echo "   Run: ssh-keygen -t ed25519 -f ~/.ssh/overlord_key -N ''"
        exit 1
    fi
}

case "$1" in
    ""| "ssh")
        _check_key
        echo "🔌 Connecting to Overlord..."
        $SSH -t "powershell -NoExit -Command \"cd '$REPO'; Write-Host 'OVERLORD READY' -ForegroundColor Cyan\""
        ;;

    "status")
        _check_key
        $SSH "powershell -Command \"
            Write-Host '--- Services ---';
            Get-Service OverlordDashboard -ErrorAction SilentlyContinue | Select-Object Name,Status;
            Write-Host '--- Docker ---';
            docker ps --format 'table {{.Names}}\t{{.Status}}' 2>\$null;
            Write-Host '--- RAM ---';
            \$os = Get-CimInstance Win32_OperatingSystem;
            Write-Host ('Free: ' + [math]::Round(\$os.FreePhysicalMemory/1MB,1) + ' GB  Used: ' + [math]::Round((\$os.TotalVisibleMemorySize-\$os.FreePhysicalMemory)/1MB,1) + ' GB')
        \""
        ;;

    "restart")
        _check_key
        $SSH "powershell -Command \"Restart-Service OverlordDashboard -ErrorAction SilentlyContinue; Write-Host 'Restarted'\""
        ;;

    "pull")
        _check_key
        echo "📦 Pulling latest code on PC..."
        $SSH "powershell -Command \"cd '$REPO'; git pull origin main\""
        ;;

    "logs")
        _check_key
        $SSH "powershell -Command \"Get-Content '$REPO\logs\dashboard.log' -Tail 50 -ErrorAction SilentlyContinue\""
        ;;

    "ps")
        _check_key
        $SSH "powershell -Command \"Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 Name, @{N='RAM_MB';E={[math]::Round(\$_.WorkingSet/1MB,1)}} | Format-Table -AutoSize\""
        ;;

    "cmd")
        _check_key
        shift
        if [ -z "$*" ]; then
            echo "Usage: overlord cmd <powershell command>"
            exit 1
        fi
        $SSH "powershell -Command \"$*\""
        ;;

    *)
        echo "Overlord — control your PC from Termux"
        echo ""
        echo "Usage: overlord [command]"
        echo ""
        echo "  overlord          → Drop into PowerShell on the PC"
        echo "  overlord status   → Services, Docker, RAM at a glance"
        echo "  overlord restart  → Restart dashboard service"
        echo "  overlord pull     → Git pull latest code on PC"
        echo "  overlord logs     → Tail dashboard logs"
        echo "  overlord ps       → Top RAM processes on PC"
        echo "  overlord cmd <..> → Run any PowerShell command"
        echo ""
        echo "PC: litre@192.168.0.77"
        ;;
esac
