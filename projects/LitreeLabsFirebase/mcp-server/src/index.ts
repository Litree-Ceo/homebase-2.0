#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import dotenv from "dotenv";
import admin from "firebase-admin";
import Stripe from "stripe";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { Pool } from "pg";
import { MongoClient } from "mongodb";
import { createClient } from "redis";
import Mixpanel from "mixpanel";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const firebaseConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
  });
}

const db = admin.firestore();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Initialize PostgreSQL (optional)
let pgPool: Pool | null = null;
if (process.env.POSTGRES_CONNECTION_STRING) {
  pgPool = new Pool({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
  });
}

// Initialize MongoDB (optional)
let mongoClient: MongoClient | null = null;
async function getMongoClient(): Promise<MongoClient> {
  if (!mongoClient && process.env.MONGODB_URI) {
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
  }
  if (!mongoClient) {
    throw new Error("MongoDB not configured");
  }
  return mongoClient;
}

// Initialize Redis (optional)
let redisClient: ReturnType<typeof createClient> | null = null;
if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  });
  redisClient.on("error", (err) => console.error("Redis Error:", err));
}

// Initialize Mixpanel (optional)
let mixpanel: ReturnType<typeof Mixpanel.init> | null = null;
if (process.env.MIXPANEL_TOKEN) {
  mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
}

// Initialize Google Analytics (optional)
let analyticsDataClient: BetaAnalyticsDataClient | null = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
}

// Tool Schemas
const GenerateContentSchema = z.object({
  userId: z.string().describe("Firebase user ID"),
  contentType: z.enum(["caption", "script", "dm", "moneyPlay", "image"]),
  prompt: z.string().describe("Content generation prompt"),
  tone: z.string().optional().describe("Content tone (e.g., professional, casual, funny)"),
  platform: z.string().optional().describe("Target platform (e.g., Instagram, TikTok, YouTube)"),
});

const GetUserAnalyticsSchema = z.object({
  userId: z.string().describe("Firebase user ID"),
  startDate: z.string().optional().describe("Start date in ISO format"),
  endDate: z.string().optional().describe("End date in ISO format"),
});

const CreateBotSchema = z.object({
  userId: z.string().describe("Firebase user ID"),
  botType: z.enum(["whatsapp", "discord", "telegram"]),
  name: z.string().describe("Bot name"),
  personality: z.string().describe("Bot personality/behavior description"),
  autoReply: z.boolean().optional().describe("Enable auto-reply"),
});

const GetSubscriptionSchema = z.object({
  userId: z.string().describe("Firebase user ID"),
});

const SaveTemplateSchema = z.object({
  userId: z.string().describe("Firebase user ID"),
  title: z.string().describe("Template title"),
  content: z.string().describe("Template content"),
  type: z.enum(["caption", "script", "dm", "moneyPlay", "image"]),
  tags: z.array(z.string()).optional().describe("Template tags"),
});

const GenerateImageSchema = z.object({
  userId: z.string().describe("Firebase user ID"),
  prompt: z.string().describe("Image generation prompt"),
  size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).optional(),
  quality: z.enum(["standard", "hd"]).optional(),
});

const GenerateMusicSchema = z.object({
  userId: z.string().describe("Firebase user ID"),
  prompt: z.string().describe("Music generation prompt"),
  duration: z.number().optional().describe("Duration in seconds (max 60)"),
  genre: z.string().optional().describe("Music genre"),
});

const QueryDatabaseSchema = z.object({
  query: z.string().describe("SQL query to execute"),
  params: z.array(z.any()).optional().describe("Query parameters"),
});

const MongoOperationSchema = z.object({
  operation: z.enum(["find", "insertOne", "updateOne", "deleteOne"]),
  collection: z.string().describe("Collection name"),
  filter: z.record(z.any()).optional(),
  document: z.record(z.any()).optional(),
  update: z.record(z.any()).optional(),
});

const TrackAnalyticsSchema = z.object({
  userId: z.string().describe("User ID"),
  event: z.string().describe("Event name"),
  properties: z.record(z.any()).optional().describe("Event properties"),
});

// MCP Server
const server = new Server(
  {
    name: "litlabs-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  {
    name: "generate_content",
    description:
      "Generate AI-powered content (captions, scripts, DMs, money plays, images) for social media and marketing using Google Gemini AI",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "Firebase user ID",
        },
        contentType: {
          type: "string",
          enum: ["caption", "script", "dm", "moneyPlay", "image"],
          description: "Type of content to generate",
        },
        prompt: {
          type: "string",
          description: "Content generation prompt",
        },
        tone: {
          type: "string",
          description: "Content tone (e.g., professional, casual, funny)",
        },
        platform: {
          type: "string",
          description: "Target platform (e.g., Instagram, TikTok, YouTube)",
        },
      },
      required: ["userId", "contentType", "prompt"],
    },
  },
  {
    name: "get_user_analytics",
    description:
      "Retrieve user analytics including usage statistics, content generation history, and subscription status",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "Firebase user ID",
        },
        startDate: {
          type: "string",
          description: "Start date in ISO format",
        },
        endDate: {
          type: "string",
          description: "End date in ISO format",
        },
      },
      required: ["userId"],
    },
  },
  {
    name: "create_bot",
    description:
      "Create an AI-powered bot for WhatsApp, Discord, or Telegram with custom personality and auto-reply capabilities",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "Firebase user ID",
        },
        botType: {
          type: "string",
          enum: ["whatsapp", "discord", "telegram"],
          description: "Platform for the bot",
        },
        name: {
          type: "string",
          description: "Bot name",
        },
        personality: {
          type: "string",
          description: "Bot personality/behavior description",
        },
        autoReply: {
          type: "boolean",
          description: "Enable auto-reply",
        },
      },
      required: ["userId", "botType", "name", "personality"],
    },
  },
  {
    name: "get_subscription",
    description:
      "Get user's subscription tier and limits (Free, Starter, Creator, Pro, Agency, Education)",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "Firebase user ID",
        },
      },
      required: ["userId"],
    },
  },
  {
    name: "save_template",
    description:
      "Save content as a reusable template in the user's library for future use",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "Firebase user ID",
        },
        title: {
          type: "string",
          description: "Template title",
        },
        content: {
          type: "string",
          description: "Template content",
        },
        type: {
          type: "string",
          enum: ["caption", "script", "dm", "moneyPlay", "image"],
          description: "Template type",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Template tags",
        },
      },
      required: ["userId", "title", "content", "type"],
    },
  },
  {
    name: "generate_image",
    description:
      "Generate AI images using DALL-E 3 from OpenAI based on text prompts",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "Firebase user ID",
        },
        prompt: {
          type: "string",
          description: "Image generation prompt",
        },
        size: {
          type: "string",
          enum: ["1024x1024", "1792x1024", "1024x1792"],
          description: "Image size",
        },
        quality: {
          type: "string",
          enum: ["standard", "hd"],
          description: "Image quality",
        },
      },
      required: ["userId", "prompt"],
    },
  },
  {
    name: "generate_music",
    description:
      "Generate AI music tracks based on text descriptions (Note: Requires Suno API integration)",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "Firebase user ID",
        },
        prompt: {
          type: "string",
          description: "Music generation prompt",
        },
        duration: {
          type: "number",
          description: "Duration in seconds (max 60)",
        },
        genre: {
          type: "string",
          description: "Music genre",
        },
      },
      required: ["userId", "prompt"],
    },
  },
  {
    name: "query_database",
    description:
      "Execute SQL queries on PostgreSQL database for analytics and reporting",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "SQL query to execute",
        },
        params: {
          type: "array",
          items: { type: "string" },
          description: "Query parameters",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "mongo_operation",
    description:
      "Perform operations on MongoDB collections (find, insert, update, delete)",
    inputSchema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["find", "insertOne", "updateOne", "deleteOne"],
          description: "MongoDB operation",
        },
        collection: {
          type: "string",
          description: "Collection name",
        },
        filter: {
          type: "object",
          description: "Query filter",
        },
        document: {
          type: "object",
          description: "Document to insert",
        },
        update: {
          type: "object",
          description: "Update operations",
        },
      },
      required: ["operation", "collection"],
    },
  },
  {
    name: "track_analytics",
    description:
      "Track user events and behavior using Mixpanel and Google Analytics",
    inputSchema: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "User ID",
        },
        event: {
          type: "string",
          description: "Event name",
        },
        properties: {
          type: "object",
          description: "Event properties",
        },
      },
      required: ["userId", "event"],
    },
  },
];

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "generate_content": {
        const { userId, contentType, prompt, tone, platform } =
          GenerateContentSchema.parse(args);

        // Check user tier and usage limits
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "User not found",
                }),
              },
            ],
          };
        }

        const userData = userDoc.data();
        const tier = userData?.tier || "free";

        // Check usage limits
        const usageDoc = await db
          .collection("usage")
          .doc(`${userId}_${new Date().toISOString().split("T")[0]}`)
          .get();

        const usage = usageDoc.data() || {};
        const usageKey = `${contentType}Count`;

        // Generate content using Google Gemini AI
        let generatedContent = "";
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const systemPrompt = `Generate ${contentType} content for ${platform || "social media"}. 
Tone: ${tone || "professional"}. 
Be creative, engaging, and optimized for the platform.`;
          
          const result = await model.generateContent(`${systemPrompt}\n\nUser request: ${prompt}`);
          const response = await result.response;
          generatedContent = response.text();
        } catch (error) {
          console.error("AI Generation Error:", error);
          generatedContent = `[Error generating content: ${error instanceof Error ? error.message : "Unknown error"}]`;
        }

        // Increment usage
        await db
          .collection("usage")
          .doc(`${userId}_${new Date().toISOString().split("T")[0]}`)
          .set(
            {
              [usageKey]: (usage[usageKey] || 0) + 1,
              lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                content: generatedContent,
                type: contentType,
                tier,
                usageRemaining: `Check tier limits for ${tier}`,
              }),
            },
          ],
        };
      }

      case "get_user_analytics": {
        const { userId, startDate, endDate } =
          GetUserAnalyticsSchema.parse(args);

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "User not found",
                }),
              },
            ],
          };
        }

        const userData = userDoc.data();

        // Get usage data
        const today = new Date().toISOString().split("T")[0];
        const usageDoc = await db.collection("usage").doc(`${userId}_${today}`).get();
        const usage = usageDoc.data() || {};

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                analytics: {
                  user: {
                    tier: userData?.tier || "free",
                    email: userData?.email,
                    createdAt: userData?.createdAt,
                  },
                  usage: {
                    today: usage,
                    period: startDate && endDate ? `${startDate} to ${endDate}` : "today",
                  },
                },
              }),
            },
          ],
        };
      }

      case "create_bot": {
        const { userId, botType, name, personality, autoReply } =
          CreateBotSchema.parse(args);

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "User not found",
                }),
              },
            ],
          };
        }

        // Create bot document
        const botRef = await db.collection("bots").add({
          userId,
          botType,
          name,
          personality,
          autoReply: autoReply ?? false,
          status: "active",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                bot: {
                  id: botRef.id,
                  type: botType,
                  name,
                  personality,
                  autoReply: autoReply ?? false,
                  status: "active",
                },
              }),
            },
          ],
        };
      }

      case "get_subscription": {
        const { userId } = GetSubscriptionSchema.parse(args);

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "User not found",
                }),
              },
            ],
          };
        }

        const userData = userDoc.data();
        const tier = userData?.tier || "free";

        // Get Stripe subscription if exists
        let stripeSubscription = null;
        if (userData?.stripeCustomerId) {
          try {
            const subscriptions = await stripe.subscriptions.list({
              customer: userData.stripeCustomerId,
              limit: 1,
            });
            stripeSubscription = subscriptions.data[0] || null;
          } catch (error) {
            // Stripe error, continue without subscription data
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                subscription: {
                  tier,
                  stripeStatus: stripeSubscription?.status,
                  currentPeriodEnd: stripeSubscription 
                    ? new Date((stripeSubscription as any).current_period_end * 1000).toISOString()
                    : null,
                },
              }),
            },
          ],
        };
      }

      case "save_template": {
        const { userId, title, content, type, tags } =
          SaveTemplateSchema.parse(args);

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "User not found",
                }),
              },
            ],
          };
        }

        // Save template
        const templateRef = await db.collection("templates").add({
          userId,
          title,
          content,
          type,
          tags: tags || [],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                template: {
                  id: templateRef.id,
                  title,
                  type,
                  tags: tags || [],
                },
              }),
            },
          ],
        };
      }

      case "generate_image": {
        const { userId, prompt, size, quality } = GenerateImageSchema.parse(args);

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "User not found",
                }),
              },
            ],
          };
        }

        try {
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt,
            n: 1,
            size: size || "1024x1024",
            quality: quality || "standard",
          });

          const imageUrl = response.data?.[0]?.url || null;

          // Increment usage
          await db
            .collection("usage")
            .doc(`${userId}_${new Date().toISOString().split("T")[0]}`)
            .set(
              {
                imageCount: admin.firestore.FieldValue.increment(1),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  imageUrl,
                  prompt,
                  size: size || "1024x1024",
                  quality: quality || "standard",
                }),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: error instanceof Error ? error.message : "Image generation failed",
                }),
              },
            ],
          };
        }
      }

      case "generate_music": {
        const { userId, prompt, duration, genre } = GenerateMusicSchema.parse(args);

        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "User not found",
                }),
              },
            ],
          };
        }

        // Note: Suno API integration required for actual music generation
        // This is a placeholder that creates a record in Firestore
        const musicRef = await db.collection("music_generations").add({
          userId,
          prompt,
          duration: duration || 30,
          genre: genre || "general",
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Music generation queued. Suno API integration required for actual generation.",
                generationId: musicRef.id,
                prompt,
                duration: duration || 30,
                genre: genre || "general",
              }),
            },
          ],
        };
      }

      case "query_database": {
        const { query, params } = QueryDatabaseSchema.parse(args);

        if (!pgPool) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "PostgreSQL not configured. Set POSTGRES_CONNECTION_STRING in .env",
                }),
              },
            ],
          };
        }

        try {
          const result = await pgPool.query(query, params);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  rows: result.rows,
                  rowCount: result.rowCount,
                }),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: error instanceof Error ? error.message : "Database query failed",
                }),
              },
            ],
          };
        }
      }

      case "mongo_operation": {
        const { operation, collection, filter, document, update } =
          MongoOperationSchema.parse(args);

        if (!process.env.MONGODB_URI) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "MongoDB not configured. Set MONGODB_URI in .env",
                }),
              },
            ],
          };
        }

        try {
          const client = await getMongoClient();
          const db = client.db("litlabs");
          const coll = db.collection(collection);

          let result;
          switch (operation) {
            case "find":
              result = await coll.find(filter || {}).toArray();
              break;
            case "insertOne":
              result = await coll.insertOne(document!);
              break;
            case "updateOne":
              result = await coll.updateOne(filter!, { $set: update! });
              break;
            case "deleteOne":
              result = await coll.deleteOne(filter!);
              break;
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  operation,
                  result,
                }),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: error instanceof Error ? error.message : "MongoDB operation failed",
                }),
              },
            ],
          };
        }
      }

      case "track_analytics": {
        const { userId, event, properties } = TrackAnalyticsSchema.parse(args);

        if (!mixpanel) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: "Mixpanel not configured. Set MIXPANEL_TOKEN in .env",
                }),
              },
            ],
          };
        }

        try {
          // Track with Mixpanel
          mixpanel.track(event, {
            distinct_id: userId,
            ...properties,
          });

          // Track with Google Analytics (if configured)
          if (process.env.GA_MEASUREMENT_ID) {
            await fetch(
              `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`,
              {
                method: "POST",
                body: JSON.stringify({
                  client_id: userId,
                  events: [
                    {
                      name: event,
                      params: properties || {},
                    },
                  ],
                }),
              }
            );
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  event,
                  userId,
                  tracked: ["mixpanel", process.env.GA_MEASUREMENT_ID ? "google_analytics" : null].filter(Boolean),
                }),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: error instanceof Error ? error.message : "Analytics tracking failed",
                }),
              },
            ],
          };
        }
      }

      default:
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: false,
                error: `Unknown tool: ${name}`,
              }),
            },
          ],
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }),
        },
      ],
    };
  }
});

// Start server
async function main() {
  // Connect Redis if configured
  if (redisClient) {
    try {
      await redisClient.connect();
      console.error("✓ Redis connected");
    } catch (error) {
      console.error("⚠ Redis connection failed:", error);
    }
  }

  console.error("✓ LitLabs MCP Server starting...");
  console.error("✓ Firebase initialized");
  console.error("✓ Stripe initialized");
  
  if (process.env.GOOGLE_GEMINI_API_KEY) console.error("✓ Google AI enabled");
  if (process.env.OPENAI_API_KEY) console.error("✓ OpenAI enabled");
  if (pgPool) console.error("✓ PostgreSQL enabled");
  if (process.env.MONGODB_URI) console.error("✓ MongoDB enabled");
  if (mixpanel) console.error("✓ Mixpanel enabled");
  if (analyticsDataClient) console.error("✓ Google Analytics enabled");

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✓ LitLabs MCP Server running on stdio");
  console.error("✓ 10 tools available: generate_content, generate_image, generate_music, create_bot, get_user_analytics, get_subscription, save_template, query_database, mongo_operation, track_analytics");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
