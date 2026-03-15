# ⚡ OVERLORD SOCIAL

**A Facebook-style social network for The Grid**

Modern social media platform with real-time updates, user authentication, and live development mode.

## 🚀 Features

- **Social Feed** - Post, like, comment, and share
- **User Profiles** - Customizable profiles with bios
- **Real-time Updates** - Live feed refreshing
- **Authentication** - Secure Firebase Auth or local fallback
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Cyberpunk-inspired UI with neon accents
- **App Integration** - Links to your existing Overlord ecosystem
- **Lives Development** - Hot reload with instant preview

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (no frameworks)
- **Backend**: Firebase (Firestore + Auth)
- **Hosting**: Firebase Hosting
- **Dev Server**: Python HTTP server with file watching

## 📦 Quick Start

### Option 1: Live Development Mode (Recommended)

**Windows (PowerShell):**
```powershell
cd Overlord-Social
.\dev-watch.ps1
```

**Linux/Mac/Termux (Bash):**
```bash
cd Overlord-Social
chmod +x dev-watch.sh
./dev-watch.sh
```

**What it does:**
- Starts local server on `http://localhost:3000`
- Opens browser automatically
- Watches for file changes (index.html, style.css, app.js)
- Auto-restarts server when you save files
- **Edit → Save → See changes in 1-2 seconds!**

### Option 2: Simple Static Server

```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000

# Node.js (if you have it)
npx serve -p 3000
```

Then open: `http://localhost:3000`

## 🔥 Firebase Setup (Optional but Recommended)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: `overlord-social`
3. Enable **Firestore Database** (production mode)
4. Enable **Authentication** → Email/Password

### 2. Get Firebase Config

1. Project Settings → General → Your apps → Web app
2. Copy the `firebaseConfig` object
3. Paste into `app.js` (line 30):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "YOUR_APP_ID"
};
```

4. Uncomment lines 37-39 in `app.js`:
```javascript
firebase.initializeApp(firebaseConfig);
db = firebase.firestore();
auth = firebase.auth();
```

### 3. Deploy to Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (use existing project "overlord-social")
firebase init

# Deploy
firebase deploy
```

Your site will be live at: `https://overlord-social.web.app`

## 📁 Project Structure

```
Overlord-Social/
├── index.html          # Main HTML structure
├── style.css           # All styles (dark theme)
├── app.js              # Core application logic
├── dev-watch.ps1       # PowerShell dev server
├── dev-watch.sh        # Bash dev server
├── firebase.json       # Firebase hosting config
├── firestore.rules     # Firestore security rules
└── README.md           # This file
```

## 🎨 Customization

### Change Colors

Edit `style.css` (lines 7-17):

```css
:root {
    --bg-primary: #0a0a0a;      /* Main background */
    --accent: #00ff41;          /* Neon green accent */
    --text-primary: #ffffff;    /* Main text */
}
```

### Add Your Apps

Edit `index.html` (lines 93-105) to link your projects:

```html
<a href="YOUR_APP_URL" target="_blank" class="app-link">
    <span class="app-icon">🚀</span>
    <span>Your App Name</span>
</a>
```

## 🌐 Integration with Overlord Ecosystem

**Current Links:**
- **PC Dashboard**: `http://localhost:8080` (psutil monitoring)
- **L1T Stream**: GitHub repo for torrent streaming

**Add more apps** in the sidebar widget!

## 🐛 Troubleshooting

**Port 3000 already in use:**
```powershell
# Kill process on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Browser not auto-refreshing:**
- Using bolt.new? Open a new browser tab manually
- Files cached? Hard refresh with `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

**Posts not saving:**
- Check browser console (F12)
- If in offline mode, data saves to `localStorage`
- Add Firebase config for cloud sync

## 📊 Current Features

✅ **Authentication**
- Sign up / Login
- Email + Password
- Session persistence
- Logout

✅ **Posts**
- Create posts
- Like posts
- Comment on posts
- Delete own posts
- Share posts (copy link)

✅ **Profile**
- Custom username
- Edit bio
- View your posts
- Profile stats

✅ **Feed**
- Real-time updates
- Search posts
- Time-ago timestamps
- Post count statistics

## 🚧 Roadmap

- [ ] Image uploads
- [ ] Friends/Follow system
- [ ] Private messages
- [ ] Notifications
- [ ] Groups/Communities
- [ ] Video posts
- [ ] Stories (24h posts)
- [ ] Dark/Light theme toggle

## 📝 Notes

- **Offline Mode**: Works without Firebase using `localStorage`
- **No Build Step**: Pure vanilla JS, runs anywhere
- **Progressive**: Add features as you need them
- **Mobile-First**: Responsive design works on all devices

## 🔗 Related Projects

- [Overlord-Pc-Dashboard](https://github.com/Litree-Ceo/Overlord-Pc-Dashboard) - System monitoring
- [L1T_GRID](https://github.com/Litree-Ceo/L1T_GRID) - Torrent streaming
- [System-Overlord-Phase0](https://github.com/Litree-Ceo/System-Overlord-Phase0) - Automation system

## 📜 License

MIT - Do whatever you want with it!

---

**Built with ⚡ by The Grid Network**
