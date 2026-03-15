# LitLabs MCP Server - Full Featured Edition

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

**Comprehensive Model Context Protocol server for LitLabs AI** - AI content generation, image creation with DALL-E 3, bot building, database operations, analytics tracking, and subscription management for AI agents like Claude, Cline, and other LLM-based assistants.

---

## ✨ Features

### 🎨 AI Content Generation (Google Gemini)
- Generate captions, scripts, DMs, money plays
- Platform-specific optimization (Instagram, TikTok, LinkedIn, Twitter)
- Customizable tone (professional, casual, friendly, persuasive, humorous)
- Real Google Gemini AI integration

### 🖼️ DALL-E 3 Image Generation (OpenAI)
- Create stunning AI images from text prompts
- Multiple sizes: 1024x1024, 1792x1024, 1024x1792
- Quality options: standard or HD
- Direct integration with OpenAI DALL-E 3

### 🎵 Music Generation
- AI music track creation (Suno API ready)
- Custom duration and genre selection
- Queue-based generation system

### 🤖 Multi-Platform Bot Builder
- WhatsApp Business bots
- Discord community bots
- Telegram channel bots
- Custom personalities and auto-reply

### 🗄️ Database Operations
- **PostgreSQL**: Execute SQL queries for analytics and reporting
- **MongoDB**: CRUD operations on document collections
- **Redis**: Caching and session management (optional)

### 📈 Analytics & Tracking
- **Mixpanel**: Product analytics and user behavior tracking
- **Google Analytics**: Web analytics integration
- User statistics and usage patterns
- Date range filtering

### 💳 Subscription Management
- Check user subscription tiers (Free, Starter, Creator, Pro, Agency, Education)
- Stripe integration for billing
- Usage limits enforcement

### 📚 Template Library
- Save and organize reusable content templates
- Tag-based organization
- Multiple content types

---

## 🛠️ Available Tools (10 Total)

### 1. `generate_content` - AI Content Generation
Generate AI-powered content using Google Gemini.

**Parameters:**
- `userId` (string, required): Firebase user ID
- `contentType` (string, required): "caption", "script", "dm", "moneyPlay", "image"
- `prompt` (string, required): Content generation prompt
- `tone` (string, optional): "professional", "casual", "friendly", "persuasive", "humorous"
- `platform` (string, optional): "instagram", "tiktok", "linkedin", "twitter", "youtube"

**Example:**
```json
{
  "userId": "user123",
  "contentType": "caption",
  "prompt": "Product launch for eco-friendly water bottles",
  "tone": "professional",
  "platform": "instagram"
}
```

### 2. `generate_image` - DALL-E 3 Image Generation
Create AI images using OpenAI's DALL-E 3.

**Parameters:**
- `userId` (string, required): Firebase user ID
- `prompt` (string, required): Image generation prompt
- `size` (string, optional): "1024x1024", "1792x1024", "1024x1792" (default: "1024x1024")
- `quality` (string, optional): "standard", "hd" (default: "standard")

**Example:**
```json
{
  "userId": "user123",
  "prompt": "A futuristic AI assistant robot helping a content creator in a modern studio",
  "size": "1792x1024",
  "quality": "hd"
}
```

### 3. `generate_music` - AI Music Generation
Queue AI music track generation (Suno API integration supported).

**Parameters:**
- `userId` (string, required): Firebase user ID
- `prompt` (string, required): Music generation prompt
- `duration` (number, optional): Duration in seconds, max 60 (default: 30)
- `genre` (string, optional): Music genre (default: "general")

**Example:**
```json
{
  "userId": "user123",
  "prompt": "Upbeat electronic music for a tech tutorial video",
  "duration": 30,
  "genre": "electronic"
}
```

### 4. `create_bot` - Multi-Platform Bot Builder
Build AI-powered bots for WhatsApp, Discord, or Telegram.

**Parameters:**
- `userId` (string, required): Firebase user ID
- `platform` (string, required): "whatsapp", "discord", "telegram"
- `name` (string, required): Bot name
- `personality` (string, optional): Bot personality description

**Example:**
```json
{
  "userId": "user123",
  "platform": "discord",
  "name": "SupportBot",
  "personality": "Helpful and professional customer support assistant"
}
```

### 5. `get_user_analytics` - User Analytics
Retrieve user statistics and usage patterns.

**Parameters:**
- `userId` (string, required): Firebase user ID
- `startDate` (string, optional): Start date (ISO format)
- `endDate` (string, optional): End date (ISO format)

**Example:**
```json
{
  "userId": "user123",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

### 6. `get_subscription` - Subscription Management
Check user's subscription tier and limits.

**Parameters:**
- `userId` (string, required): Firebase user ID

**Example:**
```json
{
  "userId": "user123"
}
```

### 7. `save_template` - Template Library
Save content as a reusable template.

**Parameters:**
- `userId` (string, required): Firebase user ID
- `title` (string, required): Template title
- `content` (string, required): Template content
- `type` (string, required): "caption", "script", "dm", "moneyPlay", "image"
- `tags` (array, optional): Template tags

**Example:**
```json
{
  "userId": "user123",
  "title": "Product Launch Caption",
  "content": "🚀 Exciting news! Our new product is here...",
  "type": "caption",
  "tags": ["product", "launch", "instagram"]
}
```

### 8. `query_database` - PostgreSQL Queries
Execute SQL queries on PostgreSQL database.

**Parameters:**
- `query` (string, required): SQL query to execute
- `params` (array, optional): Query parameters for prepared statements

**Example:**
```json
{
  "query": "SELECT * FROM users WHERE created_at > $1 ORDER BY id DESC LIMIT 10",
  "params": ["2025-01-01"]
}
```

### 9. `mongo_operation` - MongoDB Operations
Perform CRUD operations on MongoDB collections.

**Parameters:**
- `operation` (string, required): "find", "insertOne", "updateOne", "deleteOne"
- `collection` (string, required): Collection name
- `filter` (object, optional): Query filter
- `document` (object, optional): Document to insert (for insertOne)
- `update` (object, optional): Update operations (for updateOne)

**Example:**
```json
{
  "operation": "find",
  "collection": "analytics",
  "filter": { "userId": "user123", "eventType": "content_generated" }
}
```

### 10. `track_analytics` - Analytics Tracking
Track user events with Mixpanel and Google Analytics.

**Parameters:**
- `userId` (string, required): User ID
- `event` (string, required): Event name
- `properties` (object, optional): Event properties

**Example:**
```json
{
  "userId": "user123",
  "event": "content_generated",
  "properties": {
    "contentType": "caption",
    "platform": "instagram",
    "tone": "professional"
  }
}
```

---

## 🚀 Installation

### Prerequisites
- **Node.js 18+** installed
- **Firebase project** with Firestore enabled
- **Stripe account** (for subscription features)
- **Google AI API key** (for content generation)
- **OpenAI API key** (for image generation)
- **Optional**: PostgreSQL, MongoDB, Redis instances
- **Optional**: Mixpanel and Google Analytics accounts

### Option 1: Install via npm (Recommended)
```bash
npm install -g @litlabs/mcp-server
```

### Option 2: Install via npx
```bash
npx @litlabs/mcp-server
```

### Option 3: Build from Source
```bash
git clone https://github.com/LiTree89/LitreeLabsFirebase.git
cd LitreeLabsFirebase/mcp-server
npm install
npm run build
node dist/index.js
```

---

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file in the `mcp-server` directory:

```env
# Firebase Admin SDK (REQUIRED)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com

# Stripe (REQUIRED)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Google AI (REQUIRED for content generation)
GOOGLE_GEMINI_API_KEY=your_google_ai_api_key

# OpenAI (REQUIRED for image generation)
OPENAI_API_KEY=sk-your_openai_api_key

# PostgreSQL (Optional - for SQL queries)
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/litlabs_db

# MongoDB (Optional - for document storage)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/litlabs

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379

# Mixpanel (Optional - for product analytics)
MIXPANEL_TOKEN=your_mixpanel_token

# Google Analytics (Optional - for web analytics)
GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=your_ga_api_secret
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json
```

### 2. Claude Desktop Configuration

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "litlabs": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIREBASE_ADMIN_PROJECT_ID": "your_project_id",
        "FIREBASE_ADMIN_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
        "FIREBASE_ADMIN_CLIENT_EMAIL": "firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com",
        "STRIPE_SECRET_KEY": "sk_test_...",
        "GOOGLE_GEMINI_API_KEY": "your_key",
        "OPENAI_API_KEY": "sk-...",
        "POSTGRES_CONNECTION_STRING": "postgresql://...",
        "MONGODB_URI": "mongodb+srv://...",
        "REDIS_URL": "redis://...",
        "MIXPANEL_TOKEN": "your_token",
        "GA_MEASUREMENT_ID": "G-...",
        "GA_API_SECRET": "your_secret"
      }
    }
  }
}
```

### 3. Cline Configuration

Add to `.vscode/settings.json` or Cline settings:

```json
{
  "cline.mcpServers": {
    "litlabs": {
      "command": "node",
      "args": ["c:/path/to/mcp-server/dist/index.js"]
    }
  }
}
```

---

## 📊 Database Setup (Optional)

### PostgreSQL
```bash
# Install PostgreSQL
# Create database
createdb litlabs_db

# Set connection string in .env
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/litlabs_db
```

### MongoDB
```bash
# Sign up for MongoDB Atlas or install locally
# Get connection URI

# Set in .env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/litlabs
```

### Redis
```bash
# Install Redis locally or use cloud service (Upstash, Redis Cloud)

# Set in .env
REDIS_URL=redis://localhost:6379
```

---

## 📈 Analytics Setup (Optional)

### Mixpanel
1. Sign up at [mixpanel.com](https://mixpanel.com)
2. Create a project
3. Get your project token from Settings > Project Settings
4. Add to `.env`: `MIXPANEL_TOKEN=your_token`

### Google Analytics 4
1. Create GA4 property in Google Analytics
2. Get Measurement ID and API Secret from Admin > Data Streams
3. Download service account credentials JSON
4. Add to `.env`:
   ```env
   GA_MEASUREMENT_ID=G-XXXXXXXXXX
   GA_API_SECRET=your_secret
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
   ```

---

## 🧪 Testing

### Test with Cline
```bash
# In VS Code with Cline installed
@litlabs generate_content --userId=test123 --contentType=caption --prompt="Product launch"
```

### Test with Claude Desktop
Open Claude Desktop and try:
```
Can you generate an Instagram caption for a new eco-friendly water bottle launch?
```

Claude should use the `generate_content` tool automatically.

### Direct Testing
```bash
cd mcp-server
npm run build
echo '{"userId":"test123","contentType":"caption","prompt":"Test"}' | node dist/index.js
```

---

## 📝 Usage Examples

### Example 1: Generate Instagram Caption
```typescript
// AI agent will call this tool
{
  "tool": "generate_content",
  "arguments": {
    "userId": "creator123",
    "contentType": "caption",
    "prompt": "Announcing our new sustainable fashion line",
    "tone": "friendly",
    "platform": "instagram"
  }
}
```

### Example 2: Create DALL-E Image
```typescript
{
  "tool": "generate_image",
  "arguments": {
    "userId": "creator123",
    "prompt": "Modern minimalist logo for a tech startup, purple and blue gradient",
    "size": "1024x1024",
    "quality": "hd"
  }
}
```

### Example 3: Track Analytics Event
```typescript
{
  "tool": "track_analytics",
  "arguments": {
    "userId": "creator123",
    "event": "image_generated",
    "properties": {
      "size": "1024x1024",
      "quality": "hd",
      "success": true
    }
  }
}
```

### Example 4: Query User Statistics
```typescript
{
  "tool": "query_database",
  "arguments": {
    "query": "SELECT COUNT(*) as total_users, AVG(content_count) as avg_content FROM users WHERE tier = $1",
    "params": ["pro"]
  }
}
```

---

## 🔒 Security

- **Firebase Admin SDK**: Server-side authentication with service account
- **API Keys**: Never expose keys in client-side code
- **Input Validation**: Zod schemas validate all inputs
- **Rate Limiting**: Implement rate limiting in production
- **Database Access**: Use parameterized queries to prevent SQL injection
- **Environment Variables**: Store all secrets in `.env` file (never commit)

---

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify `FIREBASE_ADMIN_PROJECT_ID` matches your project
- Check private key formatting (include `\n` newlines)
- Ensure service account has Firestore permissions

### OpenAI Image Generation Errors
- Verify `OPENAI_API_KEY` is valid and has credits
- Check prompt doesn't violate content policy
- Ensure size and quality parameters are valid

### Database Connection Failures
- **PostgreSQL**: Verify connection string format and credentials
- **MongoDB**: Check URI includes correct username/password
- **Redis**: Ensure Redis server is running

### Analytics Not Tracking
- **Mixpanel**: Verify token is correct
- **Google Analytics**: Check credentials JSON path and measurement ID
- Test with simple events first

### Common Errors
```
Error: Firebase Admin SDK not initialized
→ Check FIREBASE_ADMIN_* environment variables

Error: OpenAI API key invalid
→ Verify OPENAI_API_KEY format (should start with sk-)

Error: Cannot connect to database
→ Check connection strings and network access
```

---

## 📚 API Reference

### Subscription Tiers & Limits

| Tier | Monthly Cost | AI Generations | Image Generations | Bot Creations |
|------|--------------|----------------|-------------------|---------------|
| Free | $0 | 10 | 0 | 0 |
| Starter | $29 | 100 | 20 | 1 |
| Creator | $79 | 500 | 100 | 5 |
| Pro | $199 | 2000 | 500 | 20 |
| Agency | $499 | Unlimited | Unlimited | Unlimited |
| Education | $19 | 200 | 50 | 3 |

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

---

## 🔗 Links

- **GitHub**: [LitreeLabsFirebase](https://github.com/LiTree89/LitreeLabsFirebase)
- **MCP Protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **LitLabs AI**: [litree-labstudio.vercel.app](https://litree-labstudio.vercel.app)
- **Documentation**: [Full Installation Guide](../llms-install.md)

---

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/LiTree89/LitreeLabsFirebase/issues)
- **Discussions**: [GitHub Discussions](https://github.com/LiTree89/LitreeLabsFirebase/discussions)
- **Email**: support@litlabs.ai

---

**Built with ❤️ by LitLabs AI Team**
