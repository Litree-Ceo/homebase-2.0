# ADB Debugging Setup Guide for Termux

## Overview
ADB (Android Debug Bridge) allows you to control your Android device from your PC. This guide covers both USB and wireless ADB setup.

## Prerequisites
- Android device with USB debugging enabled
- PC with ADB tools installed
- USB cable (for initial setup)

## Step 1: Install ADB on PC

### Option A: Install Android Platform Tools
1. Download from [Android Developers](https://developer.android.com/studio/releases/platform-tools)
2. Extract to a folder (e.g., `C:\Android\platform-tools`)
3. Add to PATH:
   ```powershell
   # Add to PowerShell profile
   echo 'Add-Path "C:\Android\platform-tools"' >> $PROFILE
   ```

### Option B: Install via Package Manager
```powershell
# Using Chocolatey (if installed)
choco install adb

# Using Scoop
scoop install adb
```

## Step 2: Enable USB Debugging on Android

1. Open **Settings** → **About phone**
2. Tap **Build number** 7 times to enable Developer Options
3. Go back to Settings → **Developer options**
4. Enable **USB debugging**
5. Also enable:
   - **Stay awake** (optional, for development)
   - **USB configuration** → **MTP** (for file transfer)

## Step 3: Connect Phone via USB

1. Connect your phone to PC via USB cable
2. On phone, allow USB debugging when prompted
3. Verify connection:
   ```powershell
   adb devices
   ```
   You should see your device listed.

## Step 4: Verify ADB Connection

```powershell
# Check connected devices
adb devices

# Get device info
adb -s <device_id> shell getprop ro.product.model

# Test basic commands
adb shell echo "Hello from PC!"
```

## Step 5: Test Termux ADB Access

### Method A: Direct ADB Commands
```powershell
# Run commands on Termux via ADB
adb shell am start -n com.termux/.TermuxActivity
adb shell "termux-setup-storage && pkg update -y"
```

### Method B: Install Termux ADB Package
```bash
# In Termux
pkg install -y adb
adb devices
```

## Step 6: Set Up Wireless ADB (Optional)

### Initial USB Setup
```powershell
# Connect via USB first
adb devices

# Enable wireless debugging
adb -s <device_id> tcpip 5555

# Get device IP
adb -s <device_id> shell ip route

# Disconnect USB
adb -s <device_id> disconnect

# Connect via Wi-Fi
adb connect <device_ip>:5555
```

### In Termux (Wireless)
```bash
# Install ADB in Termux
pkg install -y adb

# Connect to PC (if PC is accessible)
adb connect <pc_ip>:5555

# Or connect to another Android device
adb connect <device_ip>:5555
```

## Troubleshooting

### Common Issues
1. **Device not found**: Check USB debugging is enabled
2. **Permission denied**: Allow USB debugging on phone
3. **Connection timeout**: Check firewall settings
4. **ADB not recognized**: Add platform-tools to PATH

### Commands
```powershell
# Restart ADB server
adb kill-server
adb start-server

# Clear USB debugging authorization
adb devices -l

# Check ADB version
adb version
```

## Useful ADB Commands

### File Operations
```powershell
# Push file to device
adb push <local> <remote>

# Pull file from device
adb pull <remote> <local>

# List files
adb shell ls -la /sdcard/
```

### App Management
```powershell
# Install APK
adb install <apk_file>

# Uninstall app
adb uninstall <package_name>

# Clear app data
adb shell pm clear <package_name>
```

### Termux-Specific
```powershell
# Start Termux
adb shell am start -n com.termux/.TermuxActivity

# Send command to Termux
adb shell "termux-api Toast -b 'Hello from PC'"

# Execute script in Termux
adb push myscript.sh /sdcard/myscript.sh
adb shell "sh /sdcard/myscript.sh"
```

## Security Considerations

- Only enable USB debugging on trusted computers
- Use strong passwords for wireless connections
- Disable USB debugging when not in use
- Keep ADB tools updated

## Next Steps

1. Test ADB connection with your device
2. Try running Termux commands via ADB
3. Set up wireless ADB for convenience
4. Explore Termux ADB packages for advanced features