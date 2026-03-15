# Database & Analytics MCP Servers Configuration

This document provides guidance for integrating additional MCP servers for databases and analytics into your LitLabs AI project.

## 🗄️ Database MCP Servers

### 1. PostgreSQL MCP Server

**Purpose**: Query and manage PostgreSQL databases directly from AI agents.

**Installation**:
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:password@localhost:5432/litlabs_db"
      }
    }
  }
}
```

**Use Cases for LitLabs**:
- Alternative to Firebase Firestore for relational data
- Analytics queries and reporting
- User data management with SQL
- Complex joins and aggregations

**Configuration in LitLabs**:
```typescript
// lib/postgres.ts (create this file)
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function queryDatabase(query: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}
```

**Example Queries**:
```sql
-- Get user content generation statistics
SELECT user_id, COUNT(*) as total_generations, content_type
FROM content_generations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id, content_type;

-- Find most active users
SELECT u.email, COUNT(c.id) as generation_count
FROM users u
JOIN content_generations c ON u.id = c.user_id
WHERE c.created_at >= NOW() - INTERVAL '7 days'
GROUP BY u.email
ORDER BY generation_count DESC
LIMIT 10;
```

---

### 2. MongoDB MCP Server

**Purpose**: Work with MongoDB collections for flexible document storage.

**Installation**:
```json
{
  "mcpServers": {
    "mongodb": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-mongodb"],
      "env": {
        "MONGODB_URI": "mongodb+srv://user:password@cluster.mongodb.net/litlabs"
      }
    }
  }
}
```

**Use Cases for LitLabs**:
- Store unstructured content templates
- Chat history and conversation logs
- Bot conversation data
- Flexible schema for experimental features

**Configuration in LitLabs**:
```typescript
// lib/mongodb.ts (create this file)
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
let client: MongoClient;

export async function connectMongoDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function getDatabase(dbName: string = 'litlabs') {
  const client = await connectMongoDB();
  return client.db(dbName);
}
```

**Example Operations**:
```javascript
// Store conversation history
await db.collection('conversations').insertOne({
  userId: 'user123',
  botId: 'bot_xyz',
  messages: [
    { role: 'user', content: 'Hello', timestamp: new Date() },
    { role: 'bot', content: 'Hi there!', timestamp: new Date() }
  ],
  platform: 'whatsapp',
  createdAt: new Date()
});

// Find templates by tags
await db.collection('templates').find({
  tags: { $in: ['marketing', 'social-media'] }
}).toArray();
```

---

### 3. Redis MCP Server

**Purpose**: High-speed caching and session management.

**Installation**:
```json
{
  "mcpServers": {
    "redis": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-redis"],
      "env": {
        "REDIS_URL": "redis://localhost:6379"
      }
    }
  }
}
```

**Use Cases for LitLabs**:
- Cache AI-generated content
- Session management for bot conversations
- Rate limiting token buckets
- Real-time leaderboard data

**Configuration in LitLabs**:
```typescript
// lib/redis.ts (create this file)
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis Client Error', err));

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

// Cache AI generations
export async function cacheContent(key: string, content: string, ttl: number = 3600) {
  const redis = await connectRedis();
  await redis.setEx(key, ttl, content);
}

export async function getCachedContent(key: string) {
  const redis = await connectRedis();
  return await redis.get(key);
}
```

**Example Usage**:
```typescript
// Cache expensive AI generation
const cacheKey = `content:${userId}:${prompt}`;
let content = await getCachedContent(cacheKey);

if (!content) {
  content = await generateAIContent(prompt);
  await cacheContent(cacheKey, content, 3600); // 1 hour
}
```

---

## 📊 Analytics MCP Servers

### 1. Google Analytics MCP Server

**Purpose**: Track and analyze user behavior across LitLabs.

**Installation**:
```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-analytics"],
      "env": {
        "GA_PROPERTY_ID": "G-XXXXXXXXXX",
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/credentials.json"
      }
    }
  }
}
```

**Use Cases for LitLabs**:
- Track content generation events
- Measure user engagement
- Analyze subscription conversions
- Monitor feature adoption

**Configuration in LitLabs**:
```typescript
// lib/google-analytics.ts (create this file)
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function trackEvent(eventName: string, params: Record<string, any>) {
  // Track custom events
  await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`, {
    method: 'POST',
    body: JSON.stringify({
      client_id: params.userId,
      events: [{
        name: eventName,
        params,
      }],
    }),
  });
}

export async function getAnalyticsReport(startDate: string, endDate: string) {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
  });
  
  return response;
}
```

**Event Tracking Examples**:
```typescript
// Track content generation
await trackEvent('content_generated', {
  userId: 'user123',
  contentType: 'caption',
  platform: 'Instagram',
  tier: 'pro',
});

// Track bot creation
await trackEvent('bot_created', {
  userId: 'user123',
  botType: 'whatsapp',
  hasAutoReply: true,
});

// Track subscription upgrade
await trackEvent('subscription_upgraded', {
  userId: 'user123',
  fromTier: 'free',
  toTier: 'creator',
  amount: 29,
});
```

---

### 2. Mixpanel MCP Server

**Purpose**: Advanced product analytics and user behavior tracking.

**Installation**:
```json
{
  "mcpServers": {
    "mixpanel": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-mixpanel"],
      "env": {
        "MIXPANEL_TOKEN": "your_mixpanel_token",
        "MIXPANEL_SECRET": "your_mixpanel_secret"
      }
    }
  }
}
```

**Use Cases for LitLabs**:
- Funnel analysis (signup → paid conversion)
- Cohort analysis by subscription tier
- A/B testing for features
- User retention metrics

**Configuration in LitLabs**:
```typescript
// lib/mixpanel.ts (create this file)
import Mixpanel from 'mixpanel';

const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN || '', {
  secret: process.env.MIXPANEL_SECRET,
});

export function trackMixpanelEvent(userId: string, event: string, properties: Record<string, any>) {
  mixpanel.track(event, {
    distinct_id: userId,
    ...properties,
  });
}

export function setUserProfile(userId: string, properties: Record<string, any>) {
  mixpanel.people.set(userId, properties);
}

export async function getFunnelData(funnelName: string) {
  // Fetch funnel analysis
  return mixpanel.funnels.get(funnelName);
}
```

**Analytics Examples**:
```typescript
// Track user journey
trackMixpanelEvent('user123', 'Page Viewed', { page: 'Dashboard' });
trackMixpanelEvent('user123', 'Content Generated', { type: 'caption' });
trackMixpanelEvent('user123', 'Template Saved', { tags: ['marketing'] });

// Update user profile
setUserProfile('user123', {
  $email: 'user@example.com',
  $name: 'John Doe',
  tier: 'pro',
  totalGenerations: 150,
  signupDate: '2025-01-15',
});

// Analyze conversion funnel
const funnelData = await getFunnelData('signup-to-paid');
console.log('Conversion Rate:', funnelData.conversionRate);
```

---

### 3. Custom Analytics MCP Server

**Purpose**: Build your own analytics server tailored to LitLabs needs.

**Installation**:
```json
{
  "mcpServers": {
    "litlabs-analytics": {
      "command": "node",
      "args": ["/path/to/analytics-mcp-server/dist/index.js"],
      "env": {
        "ANALYTICS_DB": "postgresql://...",
        "REDIS_URL": "redis://..."
      }
    }
  }
}
```

**Implementation**:
```typescript
// Create custom analytics MCP server
// analytics-mcp-server/src/index.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "litlabs-analytics",
  version: "1.0.0",
}, {
  capabilities: { tools: {} },
});

// Define custom analytics tools
const tools = [
  {
    name: "get_user_metrics",
    description: "Get detailed user metrics and KPIs",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        metric: {
          type: "string",
          enum: ["engagement", "revenue", "usage", "retention"]
        },
        period: { type: "string", enum: ["day", "week", "month"] }
      },
      required: ["userId", "metric"]
    }
  },
  {
    name: "get_platform_stats",
    description: "Get overall platform statistics",
    inputSchema: {
      type: "object",
      properties: {
        stat: {
          type: "string",
          enum: ["total_users", "active_users", "revenue", "churn_rate"]
        },
        period: { type: "string" }
      },
      required: ["stat"]
    }
  }
];

// Implement tool handlers
// ... (similar to LitLabs MCP server implementation)
```

---

## 🔧 Integration Checklist

### Database Setup
- [ ] Choose database(s): PostgreSQL, MongoDB, Redis, or combination
- [ ] Set up database instances (local or cloud)
- [ ] Create database schemas/collections
- [ ] Migrate existing Firebase data (if needed)
- [ ] Configure MCP servers in Claude/Cline
- [ ] Test database queries through AI agents

### Analytics Setup
- [ ] Create Google Analytics 4 property
- [ ] Set up Mixpanel project
- [ ] Install tracking code in LitLabs
- [ ] Define custom events and properties
- [ ] Configure MCP servers for analytics
- [ ] Create dashboards and reports

### Environment Variables
Add to `.env.local`:
```env
# PostgreSQL
POSTGRES_CONNECTION_STRING=postgresql://user:password@localhost:5432/litlabs_db

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/litlabs

# Redis
REDIS_URL=redis://localhost:6379

# Google Analytics
GA_PROPERTY_ID=G-XXXXXXXXXX
GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_API_SECRET=your_api_secret
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Mixpanel
MIXPANEL_TOKEN=your_mixpanel_token
MIXPANEL_SECRET=your_mixpanel_secret
```

---

## 📈 Recommended Architecture

### Hybrid Data Strategy
- **Firebase Firestore**: User profiles, authentication, real-time features
- **PostgreSQL**: Analytics, reporting, complex queries
- **MongoDB**: Conversation logs, flexible templates, experimental features
- **Redis**: Caching, sessions, rate limiting

### Analytics Stack
- **Vercel Analytics**: Basic web analytics (already integrated)
- **Google Analytics**: User behavior and conversion tracking
- **Mixpanel**: Product analytics and cohort analysis
- **Custom Dashboard**: Real-time metrics using Redis + PostgreSQL

---

## 🚀 Next Steps

1. **Choose Your Stack**: Decide which databases and analytics tools to integrate
2. **Set Up Infrastructure**: Deploy database instances and create accounts
3. **Install MCP Servers**: Configure Claude/Cline with new servers
4. **Migrate Data**: Move or sync data from Firebase (if needed)
5. **Test Integration**: Verify AI agents can access new databases
6. **Build Features**: Use new capabilities to enhance LitLabs

---

**Need Help?** Check the official MCP server documentation:
- PostgreSQL: https://github.com/modelcontextprotocol/servers/tree/main/src/postgres
- MongoDB: https://github.com/modelcontextprotocol/servers/tree/main/src/mongodb
- Custom Servers: https://modelcontextprotocol.io/docs
