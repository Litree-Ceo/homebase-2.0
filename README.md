# 🚀 Groq-Powered Telegram Bots

This project contains two distinct Telegram bots:

1.  **AI Chat Bot (`index.js`)**: An AI assistant powered by the Groq API for fast chat completions.
2.  **Command Bot (`command_bot.js`)**: A secure remote control to execute shell commands on your PC from Telegram.

## ✨ Key Features

- **Dual Bot Functionality**: Run an AI Chat Bot and a secure Command Bot from the same project.
- **Groq-Powered AI**: Blazing fast AI responses using the free Groq tier.
- **Secure Command Execution**: The command bot is locked down to only accept commands from your specific Telegram User ID.
- **Firebase Logging**: All AI conversations are automatically logged to a secure Firebase Firestore database.
- **Production Ready**: Includes PM2 configuration for process management.

## ⚙️ Setup and Installation

### 1. Create Your Environment File

Copy the example environment file to create your own local version.

For Unix-like systems (Linux/macOS):

```bash
cp .env.example .env
```

For Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

### 2. Get Your API Keys & IDs

You will need credentials from a few different services:

- **Telegram Bot Token**:
  - Talk to the [BotFather](https://t.me/botfather) on Telegram.
  - Create a new bot and copy the token he gives you.

- **Your Telegram User ID**:
  - Talk to the [@userinfobot](https://t.me/userinfobot) on Telegram.
  - It will immediately give you your numeric `Id`. This is **critical for securing your command bot**.

- **Groq API Key**:
  - Go to [groq.com](https://groq.com).
  - Sign up for a free account.
  - Navigate to the API Keys section and create a new key.

- **Firebase Service Account**:
  - Go to the [Firebase Console](https://console.firebase.google.com).
  - Create a project, then go to **Project settings** > **Service accounts**.
  - Click **"Generate new private key"** to download the JSON file.

### 3. Update Your `.env` File

Open the `.env` file and paste in all your credentials.

```
# For both bots
TELEGRAM_BOT_TOKEN=your_telegram_token_here

# For the Command Bot (Security)
MY_TELEGRAM_ID=your_numeric_user_id_here

# For the AI Chat Bot
GROQ_API_KEY=your_groq_api_key_here

# For Firebase Logging
FIREBASE_PROJECT_ID=your-project-id-from-the-json-file
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Run Your Bots

You can run either bot using the following commands:

- **Run the AI Chat Bot**:
  ```bash
  pnpm start
  ```

- **Run the Command Bot**:
  ```bash
  pnpm start:command
  ```

- **Run in Production (with PM2)**:
  The `ecosystem.config.js` is set up to run the AI Chat Bot by default. You can modify it to run the command bot or both.
  ```bash
  pnpm pm2:start
  ```
