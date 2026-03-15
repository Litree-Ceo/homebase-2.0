# Trae IDE + Termux Sync Guide

To get Trae IDE on your desktop in sync with this Termux environment:

## Option 1: Direct SSH (Recommended for Speed)
Trae can edit files directly on your phone.

1.  **In Termux:**
    - Install SSH: `pkg install openssh`
    - Start SSH: `sshd`
    - Check your username: `whoami` (usually `u0_aXXX`)
    - Set a password: `passwd`
    - Check your IP: `ifconfig` or `ip addr`

2.  **In Trae IDE (Desktop):**
    - Install the **Remote - SSH** extension.
    - Click the green button in the bottom-left corner.
    - Select **Connect to Host...** -> **Add New SSH Host**.
    - Enter: `ssh [username]@[phone-ip] -p 8022`
    - Open the folder: `/data/data/com.termux/files/home/dev/homebase-main`

## Option 2: GitHub Sync (Recommended for Cloud)
Use this if you want to work on both separately.

1.  **In Termux:** Run `sync` (the alias we just created).
2.  **In Trae:** 
    - Clone the repository: `git clone https://github.com/LiTree-Ceo/homebase-main`
    - Open the folder.
    - Before starting, run `bash ./sync.sh` to get your dotfiles.

## Pro Tip: Sync Command
Whenever you switch devices, just run:
```bash
sync
```
This handles Git pull, Dotfile linking, and Dependency updates in one go.
