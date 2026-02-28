# 🤖 Telegram AI Bot (Optimized)

A production-ready Telegram bot with AI capabilities using **Groq** (free tier) instead of Google Vertex AI/Gemini.

## ✨ Why This Setup is Best

| Feature | Before (Vertex AI) | After (Groq) |
|---------|-------------------|--------------|
| **Cost** | Limited free tier | Generous free tier |
| **Speed** | ~2-5 seconds | ~0.3-1 second |
| **Tokens** | 1M/day limit | Millions/day |
| **Setup** | Complex (service accounts, billing) | Simple (one API key) |
| **Models** | Gemini only | Llama, Mixtral, Gemma |

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your keys
```

### 3. Get Your API Keys

#### Telegram Bot Token
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow instructions
4. Copy the token to `.env`

#### Firebase (for database)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project
3. Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Copy values from the downloaded JSON to `.env`

#### Groq API Key (FREE AI)
1. Go to [groq.com](https://groq.com)
2. Sign up (free, no credit card)
3. Go to API Keys
4. Create a new key
5. Copy to `.env`

### 4. Run the Bot

#### Development
```bash
pnpm dev
# or
npm run dev
```

#### Production with PM2
```bash
# Start
pnpm pm2:start

# View logs
pnpm pm2:logs

# Monitor
pnpm pm2:monitor

# Restart
pnpm pm2:restart

# Stop
pnpm pm2:stop
```

## 📱 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/help` | Show available commands |
| `/ai <message>` | Ask AI a question |
| `/status` | Check bot status |
| `/clear` | Clear conversation context |
| `/stats` | (Admin) View statistics |
| `/broadcast <msg>` | (Admin) Broadcast message |

## 🔧 Configuration Options

Edit `.env` to customize:

```env
# Choose AI model
GROQ_MODEL=llama-3.1-8b-instant

# Response length (lower = faster)
MAX_TOKENS=150

# Your Telegram username for admin commands
ADMIN_USERNAME=your_username
```

### Available Groq Models

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `llama-3.1-8b-instant` | ⚡⚡⚡ | ⭐⭐⭐ | General chat (RECOMMENDED) |
| `llama-3.3-70b-versatile` | ⚡⚡ | ⭐⭐⭐⭐⭐ | Complex reasoning |
| `mixtral-8x7b-32768` | ⚡⚡ | ⭐⭐⭐⭐ | Long contexts |
| `gemma-2-9b-it` | ⚡⚡⚡ | ⭐⭐⭐ | Fast responses |

## 📁 Project Structure

```
telegram-bot/
├── .env                 # Your secrets (NEVER commit!)
├── .env.example         # Template for .env
├── .gitignore          # Files to ignore
├── ecosystem.config.js  # PM2 configuration
├── index.js            # Main bot code
├── package.json        # Dependencies
└── README.md           # This file
```

## 🔒 Security Best Practices

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Restrict Firebase rules** - Start in test mode, lock down later
3. **Use PM2** - Keeps bot running 24/7
4. **Set admin username** - Prevents unauthorized access to stats

## 🐛 Troubleshooting

### Bot not responding?
```bash
# Check logs
pnpm pm2:logs

# Test manually
node index.js
```

### "Rate limit" errors?
- Wait a few seconds between messages
- Groq free tier has rate limits (resets quickly)

### Firebase errors?
- Check your service account credentials
- Ensure Firestore is enabled in Firebase console

### Can't find module errors?
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## 📝 Logs & Monitoring

All messages are logged to Firebase Firestore:
- `messages` collection - All conversations
- `commands` collection - Command usage

View in Firebase Console > Firestore Database

## 🎯 Next Steps

1. [ ] Add custom commands
2. [ ] Add image generation
3. [ ] Add voice message support
4. [ ] Add webhook for production
5. [ ] Deploy to cloud server

## 💡 Tips

- Use `llama-3.1-8b-instant` for best speed/cost balance
- Lower `MAX_TOKENS` for faster responses
- Use `/ai` command for complex queries
- Regular messages for quick chats

## 📞 Support

- [Telegraf Docs](https://telegraf.js.org/)
- [Groq Docs](https://console.groq.com/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

Built with ❤️ for efficiency
