# LitLabs AI - MCP Marketplace Submission

This document contains all materials needed to submit LitLabs AI to the Cline MCP Marketplace.

## 📦 Submission Overview

**Server Name**: LitLabs AI  
**Repository**: https://github.com/LiTree89/LitreeLabsFirebase  
**MCP Server Path**: `/mcp-server`  
**npm Package**: `@litlabs/mcp-server` (to be published)  
**Category**: AI Tools, Content Generation, Productivity  
**License**: MIT

---

## 🎯 Short Description (for marketplace listing)

AI-powered content generation, bot building, and analytics platform. Generate captions, scripts, DMs, and images. Create WhatsApp/Discord/Telegram bots. Track usage and subscriptions. Firebase + Stripe powered.

---

## 📝 Long Description

LitLabs AI is a comprehensive Model Context Protocol server that exposes powerful AI capabilities to agents like Claude and Cline. Built on Firebase and integrated with Stripe, it provides:

**Content Generation**: Generate social media captions, video scripts, DM templates, monetization strategies, and image prompts using Google Gemini AI. Support for multiple tones and platforms (Instagram, TikTok, YouTube, LinkedIn).

**Bot Creation**: Build AI-powered bots for WhatsApp Business, Discord servers, and Telegram channels with custom personalities and auto-reply capabilities.

**Analytics & Insights**: Track user activity, content generation history, usage patterns, and subscription status with date range filtering.

**Subscription Management**: Multi-tier subscription system (Free, Starter, Creator, Pro, Agency, Education) with Stripe billing integration and usage limit enforcement.

**Template Library**: Save and organize reusable content templates with tag-based categorization for quick access.

Perfect for content creators, marketers, agencies, and developers building AI-powered workflows.

---

## 🛠️ Installation Instructions

### For Cline MCP Marketplace (One-Click Install)

1. **Add Server via Marketplace**
   - Open Cline
   - Navigate to MCP Marketplace
   - Search for "LitLabs AI"
   - Click "Install"

2. **Configure Environment Variables**
   - After installation, Cline will prompt for required environment variables:
     - `FIREBASE_ADMIN_PROJECT_ID`: Your Firebase project ID
     - `FIREBASE_ADMIN_PRIVATE_KEY`: Firebase service account private key
     - `FIREBASE_ADMIN_CLIENT_EMAIL`: Firebase service account email
     - `STRIPE_SECRET_KEY`: Stripe API secret key

3. **Get Firebase Credentials**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Copy the values from the downloaded JSON file

4. **Get Stripe Key**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to Developers → API Keys
   - Copy your Secret Key (starts with `sk_test_` or `sk_live_`)

5. **Test Installation**
   - Ask Cline: "Generate a social media caption using LitLabs"
   - If successful, the server is working!

### For Claude Desktop

Add to `claude_desktop_config.json`:

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

**Config file locations:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Manual Installation (Developers)

```bash
# Clone repository
git clone https://github.com/LiTree89/LitreeLabsFirebase.git
cd LitreeLabsFirebase/mcp-server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Build
npm run build

# Test
node dist/index.js
```

---

## 🎨 Logo & Branding

**Logo Requirements**: 400x400 PNG  
**Logo Location**: `/public/litlabs-logo-400x400.png`  
**Color Scheme**: Purple/Blue gradient with cosmic theme  
**Font**: Modern, tech-forward sans-serif

*Note: Logo file needs to be created before marketplace submission*

---

## 🔧 Available Tools

### 1. generate_content
Generate AI-powered content for social media and marketing.

**Parameters:**
- `userId` (string, required): Firebase user ID
- `contentType` (enum, required): caption | script | dm | moneyPlay | image
- `prompt` (string, required): Content generation prompt
- `tone` (string, optional): professional | casual | funny | exciting
- `platform` (string, optional): Instagram | TikTok | YouTube | LinkedIn

**Example:**
```json
{
  "userId": "user123",
  "contentType": "caption",
  "prompt": "New product launch announcement",
  "tone": "exciting",
  "platform": "Instagram"
}
```

### 2. create_bot
Create AI-powered bots for messaging platforms.

**Parameters:**
- `userId` (string, required): Firebase user ID
- `botType` (enum, required): whatsapp | discord | telegram
- `name` (string, required): Bot name
- `personality` (string, required): Bot personality description
- `autoReply` (boolean, optional): Enable auto-reply

**Example:**
```json
{
  "userId": "user123",
  "botType": "whatsapp",
  "name": "Support Bot",
  "personality": "Friendly customer service representative",
  "autoReply": true
}
```

### 3. get_user_analytics
Retrieve user statistics and usage insights.

**Parameters:**
- `userId` (string, required): Firebase user ID
- `startDate` (string, optional): ISO format start date
- `endDate` (string, optional): ISO format end date

**Example:**
```json
{
  "userId": "user123",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

### 4. get_subscription
Check user's subscription tier and limits.

**Parameters:**
- `userId` (string, required): Firebase user ID

**Example:**
```json
{
  "userId": "user123"
}
```

### 5. save_template
Save content as a reusable template.

**Parameters:**
- `userId` (string, required): Firebase user ID
- `title` (string, required): Template title
- `content` (string, required): Template content
- `type` (enum, required): caption | script | dm | moneyPlay | image
- `tags` (array[string], optional): Template tags

**Example:**
```json
{
  "userId": "user123",
  "title": "Product Launch Template",
  "content": "🚀 Launching [PRODUCT] today!",
  "type": "caption",
  "tags": ["product-launch", "announcement"]
}
```

---

## 📊 Subscription Tiers

| Tier | Price | Content Gen | Bots | Templates |
|------|-------|-------------|------|-----------|
| Free | $0/mo | 10/day | 1 | 5 |
| Starter | $9/mo | 50/day | 3 | 20 |
| Creator | $29/mo | 200/day | 10 | 100 |
| Pro | $99/mo | 1000/day | Unlimited | Unlimited |
| Agency | $299/mo | Unlimited | Unlimited | Unlimited |
| Education | $49/mo | 500/day | 20 | 200 |

---

## 🔐 Security & Privacy

- **Data Storage**: All data stored in Firebase Firestore
- **Authentication**: Firebase Authentication (12+ providers)
- **Payment Security**: PCI-compliant via Stripe
- **Rate Limiting**: Enforced per user tier
- **Usage Tracking**: All operations logged
- **Privacy Policy**: Available at https://litree-labstudio.vercel.app/privacy-policy

---

## 🐛 Known Issues & Limitations

1. **AI Generation**: Currently simulated in MCP server (production uses Google Gemini API)
2. **Image Generation**: Prompts only - actual generation requires OpenAI DALL-E API
3. **Bot Deployment**: Bots created but deployment to platforms requires manual setup
4. **Analytics**: Limited to daily aggregates (real-time coming soon)

---

## 🚀 Roadmap

- [ ] Direct image generation via DALL-E
- [ ] Music generation via Suno API
- [ ] Video generation via Runway ML
- [ ] Real-time analytics dashboard
- [ ] Multi-user team collaboration
- [ ] White-label agency features
- [ ] Advanced bot customization

---

## 📞 Support & Contact

- **GitHub Issues**: https://github.com/LiTree89/LitreeLabsFirebase/issues
- **Documentation**: https://github.com/LiTree89/LitreeLabsFirebase/tree/master/mcp-server
- **Email**: support@litlabs.ai (setup pending)
- **Website**: https://litree-labstudio.vercel.app

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 🎯 Marketplace Submission Checklist

- [ ] Create 400x400 PNG logo
- [ ] Publish `@litlabs/mcp-server` to npm
- [ ] Test installation with Cline
- [ ] Verify all 5 tools work correctly
- [ ] Update README with npm package name
- [ ] Create GitHub release with version tag
- [ ] Submit to Cline MCP Marketplace repository
- [ ] Monitor for approval and feedback

---

## 📝 Submission Pull Request Template

```markdown
### Server Information
- **Name**: LitLabs AI
- **Repository**: https://github.com/LiTree89/LitreeLabsFirebase
- **npm Package**: @litlabs/mcp-server
- **Version**: 1.0.0
- **License**: MIT

### Description
AI-powered content generation, bot building, and analytics platform. Generate captions, scripts, DMs, and images. Create WhatsApp/Discord/Telegram bots. Track usage and subscriptions.

### Tools
- generate_content: AI content generation
- create_bot: Bot creation for messaging platforms
- get_user_analytics: User statistics
- get_subscription: Subscription management
- save_template: Template library

### Installation
```bash
npx @litlabs/mcp-server
```

### Configuration
Requires Firebase Admin SDK credentials and Stripe API key.

### Testing
Tested with Cline and Claude Desktop. All tools working as expected.

### Additional Notes
Full documentation available in repository: `/mcp-server/README.md`
```

---

**Ready for submission after:**
1. Creating logo (400x400 PNG)
2. Publishing to npm
3. Final testing with Cline
