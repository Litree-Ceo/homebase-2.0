# Termux Setup for Overlord Monolith

## Quick Start (Run Overlord from Android)

```bash
# 1) Base packages
pkg update -y && pkg upgrade -y
pkg install -y git python nodejs-lts ffmpeg openssh termux-api
npm install -g pm2 pnpm

# 2) Storage permission
termux-setup-storage

# 3) Clone repo
cd ~
git clone https://github.com/Litree-Ceo/Overlord-Monolith.git
cd Overlord-Monolith

# 4) Dashboard (Python)
cd modules/dashboard
pip install -r requirements.txt
pm2 start python --name overlord-dashboard -- server.py

# 5) Social (Node)
cd ../social
pnpm install
pm2 start pnpm --name overlord-social -- run dev

# 6) Persist PM2 process list
pm2 save
```

## Phone-to-PC Control (SSH into WSL)

In Windows/WSL:

```powershell
wsl -e sudo apt update
wsl -e sudo apt install -y openssh-server
wsl -e sudo systemctl enable ssh
wsl -e sudo systemctl start ssh
wsl hostname -I
```

In Termux:

```bash
pkg install -y openssh
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
ssh-copy-id -i ~/.ssh/id_ed25519.pub litree@<WSL_IP>
ssh litree@<WSL_IP>
```

Run Overlord commands remotely:

```bash
ssh litree@<WSL_IP> "cd /mnt/c/Users/litre/Desktop/Overlord-Monolith && pwsh -c './manage-overlord-pro.ps1 status'"
ssh litree@<WSL_IP> "cd /mnt/c/Users/litre/Desktop/Overlord-Monolith && pwsh -c './manage-overlord-pro.ps1 start-all'"
```

## Optional Boot Auto-Start in Termux

```bash
mkdir -p ~/.termux/boot
cat << 'EOF' > ~/.termux/boot/start-overlord.sh
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
pm2 resurrect
EOF
chmod +x ~/.termux/boot/start-overlord.sh
```

## Status and Logs

```bash
pm2 status
pm2 logs overlord-dashboard
pm2 logs overlord-social
```

## Access URLs

- Dashboard: http://localhost:5000
- Social: http://localhost:5001
- LAN access: http://YOUR_PHONE_IP:5000
