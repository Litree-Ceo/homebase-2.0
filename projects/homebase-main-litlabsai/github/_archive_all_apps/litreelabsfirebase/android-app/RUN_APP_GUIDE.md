# LiTLabs Player Deluxe - How to Run in Android Studio

## ✅ Build Status
**BUILD SUCCESSFUL** ✓
- APK Location: `app/build/outputs/apk/debug/app-debug.apk`
- JDK: 17+ compatible
- Min SDK: 26 (Android 8.0)
- Target SDK: 34 (Android 14)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Set Up Android Emulator or Connect Device

**Option A: Using Android Emulator (Recommended)**
1. Open Android Studio
2. Click **Device Manager** (right sidebar, or Tools → Device Manager)
3. Click **"Create Virtual Device"**
4. Choose: **Pixel 6** or **Pixel 7** profile
5. Choose API level: **API 34** (recommended) or **API 30+**
6. Click **"Finish"** and wait for emulator to boot (1-2 minutes)

**Option B: Using Physical Device**
1. Enable Developer Mode on phone:
   - Settings → About Phone → tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"
2. Connect phone via USB cable to PC
3. Tap "Allow USB Debugging" on phone screen

---

### Step 2: Verify Device is Recognized

Open Android Studio terminal (bottom panel) and run:
```powershell
.\gradlew.bat -v
adb devices
```

You should see your emulator or device listed.

---

### Step 3: Run the App

**Method A: From Android Studio (Easiest)**
1. Click green **Run** button (top toolbar) or press **Shift+F10**
2. Select your emulator/device from the list
3. Click **OK**
4. Wait for build and deployment (~30-60 seconds)
5. App will launch automatically

**Method B: From PowerShell (Command Line)**
```powershell
cd C:\Users\dying\AndroidStudioProjects\LiTLabsPlayerDeluxe
.\gradlew.bat installDebug
adb shell am start -n com.example.litlabsplayerdeluxe/.MainActivity
```

---

## 🔍 Troubleshooting

### Problem 1: "Emulator won't start"
**Solution:**
- Check you have ≥4GB RAM free on your PC
- In Device Manager: right-click device → Edit → increase RAM allocation
- Close Chrome/VS Code to free up memory

### Problem 2: "No device found / Device not showing"
**Solution:**
```powershell
# Restart ADB
adb kill-server
adb start-server
adb devices  # should now list your device
```

### Problem 3: "Build fails with errors"
**Solution:**
```powershell
# Clean and rebuild
.\gradlew.bat clean
.\gradlew.bat assembleDebug
```

### Problem 4: "App crashes on launch"
**Solution:**
1. Open **Logcat** (View → Tool Windows → Logcat)
2. Filter by your app: search for "litlabs" or "litlabsplayerdeluxe"
3. Look for red error messages
4. Post the error stacktrace for help

### Problem 5: "Permissions error (storage/media access)"
**Solution:**
1. When app launches, grant the requested permissions
2. Or manually grant: Settings → Apps → LiTLabs Player → Permissions → grant all

### Problem 6: "adb: command not found"
**Solution:**
```powershell
# Add Android SDK tools to PATH in PowerShell temporarily
$env:PATH += ";C:\Users\dying\AppData\Local\Android\Sdk\platform-tools"
adb devices
```

---

## 📱 What to Test Once App Runs

1. **Media Library** - Swipe through list of audio/video files
2. **Playback** - Tap a file to play it
3. **Now Playing Bar** - See current track info at top
4. **God Mode Button** - Click ⚡ icon to open settings
5. **Presets** - Try "Trunk 808", "Club Night", "Chill Couch"
6. **Bass Boost** - Adjust slider (0-100)
7. **Visualizer** - Toggle on/off and change type
8. **Sleep Timer** - Set timer for auto-stop
9. **Video Playback** - Select a video file and watch it play with controls

---

## 🛠️ Build Configuration

**gradle.properties Settings:**
- JVM Args: `-Xmx2048m -XX:+UseG1GC -XX:MaxGCPauseMillis=200`
- Config Cache: Enabled (faster rebuilds)
- Android X: Enabled
- Min SDK: 26
- Target SDK: 34 (Android 14)

---

## 📞 Need Help?

If you encounter an error:
1. Check **Logcat** for the full error message
2. Take a screenshot of the error
3. Try **Build → Clean Project** then **Run**
4. Restart Android Studio if all else fails

---

**Good luck! 🚀**

