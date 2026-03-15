# LitLabs MCP Server

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

**Model Context Protocol server for LitLabs AI** - Expose AI content generation, bot building, analytics, and subscription management capabilities to AI agents like Claude, Cline, and other LLM-based assistants.

## 🌟 Features

LitLabs MCP Server provides the following tools:

### 🎨 Content Generation
- **generate_content**: Generate AI-powered content using Google Gemini
  - Captions for social media (Instagram, TikTok, LinkedIn)
  - Scripts for videos and podcasts
  - DM templates for outreach
  - Money plays (monetization strategies)
  - Image generation prompts

### 🤖 Bot Creation
- **create_bot**: Build AI-powered bots for multiple platforms
  - WhatsApp Business bots
  - Discord community bots
  - Telegram channel bots
  - Custom personalities and auto-reply

### 📊 Analytics
- **get_user_analytics**: Access user statistics and insights
  - Content generation history
  - Usage patterns
  - Subscription status
  - Date range filtering

### 💳 Subscription Management
- **get_subscription**: Check user's subscription tier and limits
  - Free, Starter, Creator, Pro, Agency, Education tiers
  - Stripe integration for billing
  - Usage limits per tier

### 📚 Template Library
- **save_template**: Save and organize reusable content templates
  - Tag-based organization
  - Multiple content types
  - Quick access to saved templates

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ installed
- Firebase project with Firestore enabled
- Stripe account (for subscription features)
- LitLabs AI environment variables configured

### Option 1: Install via npx (Recommended)
```bash
npx @litlabs/mcp-server
```

### Option 2: Install Globally
```bash
npm install -g @litlabs/mcp-server
```

### Option 3: Install Locally
```bash
cd mcp-server
npm install
npm run build
```

---

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file in the `mcp-server` directory:

```env
# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Optional: Google AI (for content generation)
GOOGLE_GEMINI_API_KEY=your_google_ai_key
```

### 2. Claude Desktop Configuration

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "litlabs": {
      "command": "npx",
      "args": ["@litlabs/mcp-server"],
      "env": {
        "FIREBASE_ADMIN_PROJECT_ID": "your_project_id",
        "FIREBASE_ADMIN_PRIVATE_KEY": "your_private_key",
        "FIREBASE_ADMIN_CLIENT_EMAIL": "your_client_email",
        "STRIPE_SECRET_KEY": "your_stripe_key"
      }
    }
  }
}
```

### 3. Cline Configuration

Add to your Cline MCP settings:

```json
{
  "mcpServers": {
    "litlabs": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIREBASE_ADMIN_PROJECT_ID": "your_project_id",
        "FIREBASE_ADMIN_PRIVATE_KEY": "your_private_key",
        "FIREBASE_ADMIN_CLIENT_EMAIL": "your_client_email",
        "STRIPE_SECRET_KEY": "your_stripe_key"
      }
    }
  }
}
```

---

## 📖 Usage Examples

### Generate Content

```typescript
// Ask Claude or Cline:
"Generate an Instagram caption for a beauty brand launch using LitLabs"

// Tool call:
{
  "name": "generate_content",
  "arguments": {
    "userId": "user123",
    "contentType": "caption",
    "prompt": "Beauty brand launch announcement",
    "tone": "exciting",
    "platform": "Instagram"
  }
}

// Response:
{
  "success": true,
  "content": "✨ NEW DROP ALERT ✨ Our beauty revolution starts NOW! 💄...",
  "type": "caption",
  "tier": "creator"
}
```

### Create a Bot

```typescript
// Ask Claude:
"Create a WhatsApp bot for customer support with a friendly personality"

// Tool call:
{
  "name": "create_bot",
  "arguments": {
    "userId": "user123",
    "botType": "whatsapp",
    "name": "Support Bot",
    "personality": "Friendly, helpful, and professional customer service representative",
    "autoReply": true
  }
}

// Response:
{
  "success": true,
  "bot": {
    "id": "bot_xyz789",
    "type": "whatsapp",
    "name": "Support Bot",
    "status": "active"
  }
}
```

### Get Analytics

```typescript
// Ask Cline:
"Show me my LitLabs usage statistics for today"

// Tool call:
{
  "name": "get_user_analytics",
  "arguments": {
    "userId": "user123"
  }
}

// Response:
{
  "success": true,
  "analytics": {
    "user": {
      "tier": "pro",
      "email": "user@example.com"
    },
    "usage": {
      "today": {
        "captionCount": 15,
        "scriptCount": 3,
        "dmCount": 8
      }
    }
  }
}
```

### Check Subscription

```typescript
// Ask Claude:
"What's my current LitLabs subscription tier?"

// Tool call:
{
  "name": "get_subscription",
  "arguments": {
    "userId": "user123"
  }
}

// Response:
{
  "success": true,
  "subscription": {
    "tier": "pro",
    "stripeStatus": "active",
    "currentPeriodEnd": 1735689600
  }
}
```

### Save Template

```typescript
// Ask Cline:
"Save this caption as a template"

// Tool call:
{
  "name": "save_template",
  "arguments": {
    "userId": "user123",
    "title": "Product Launch Template",
    "content": "🚀 Launching [PRODUCT] today! Get [DISCOUNT]% off...",
    "type": "caption",
    "tags": ["product-launch", "discount", "announcement"]
  }
}

// Response:
{
  "success": true,
  "template": {
    "id": "template_abc123",
    "title": "Product Launch Template",
    "type": "caption",
    "tags": ["product-launch", "discount"]
  }
}
```

---

## 🔧 Development

### Build from Source

```bash
# Clone repository
git clone https://github.com/LiTree89/LitreeLabsFirebase.git
cd LitreeLabsFirebase/mcp-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev
```

### Testing

```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## 🏗️ Architecture

```
mcp-server/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # NPM dependencies
├── tsconfig.json         # TypeScript configuration
├── .env                  # Environment variables (create this)
└── README.md             # This file
```

### Tech Stack
- **MCP SDK**: `@modelcontextprotocol/sdk` v0.5.0
- **Firebase Admin**: Server-side Firebase integration
- **Stripe**: Payment and subscription management
- **Zod**: Runtime schema validation
- **TypeScript**: Type-safe development

---

## 🔒 Security

- **Environment Variables**: Never commit `.env` files
- **Firebase Admin**: Uses service account credentials
- **Rate Limiting**: Enforced at API level in main LitLabs app
- **Usage Tracking**: All operations tracked in Firestore
- **Stripe Integration**: PCI-compliant payment processing

---

## 📊 Subscription Tiers

| Tier | Content Generation | Bots | Analytics | Templates |
|------|-------------------|------|-----------|-----------|
| **Free** | 10/day | 1 | Basic | 5 |
| **Starter** | 50/day | 3 | Standard | 20 |
| **Creator** | 200/day | 10 | Advanced | 100 |
| **Pro** | 1000/day | Unlimited | Premium | Unlimited |
| **Agency** | Unlimited | Unlimited | Enterprise | Unlimited |
| **Education** | 500/day | 20 | Advanced | 200 |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🌐 Links

- **LitLabs AI**: https://litree-labstudio.vercel.app
- **GitHub**: https://github.com/LiTree89/LitreeLabsFirebase
- **Documentation**: See repository docs folder
- **MCP Protocol**: https://modelcontextprotocol.io
- **Support**: Open an issue on GitHub

---

## 🆘 Troubleshooting

### "Firebase Admin not initialized"
**Solution**: Check that all `FIREBASE_ADMIN_*` environment variables are set correctly. Ensure private key has proper `\n` newlines.

### "Stripe API error"
**Solution**: Verify `STRIPE_SECRET_KEY` is correct. Use test keys for development (`sk_test_...`).

### "User not found"
**Solution**: Ensure the `userId` exists in your Firestore `users` collection. Check Firebase console.

### "Tool not found"
**Solution**: Make sure MCP server is running and properly configured in Claude/Cline settings. Restart the AI assistant.

---

## ✨ What's Next?

- [ ] Add image generation via DALL-E integration
- [ ] Implement music generation via Suno API
- [ ] Add video generation via Runway ML
- [ ] Support for more bot platforms (Slack, Teams)
- [ ] Advanced analytics with predictive insights
- [ ] Multi-user team collaboration tools

---

**Built with ❤️ by the LitLabs AI team**
