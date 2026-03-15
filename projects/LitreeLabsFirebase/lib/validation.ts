import { z } from 'zod';

// User input validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const contentGenerationSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters').max(200),
  platform: z.enum(['instagram', 'tiktok', 'twitter', 'email', 'dm']),
  tone: z.enum(['professional', 'casual', 'funny', 'motivational']).optional(),
});

export const imageGenerationSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(500),
  style: z.enum(['realistic', 'artistic', 'cartoon', 'professional']).optional(),
});

export const videoScriptSchema = z.object({
  topic: z.string().min(3).max(200),
  duration: z.number().min(15).max(300), // 15 seconds to 5 minutes
  hook: z.string().min(5).max(100).optional(),
});

export const marketplaceTemplateSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  price: z.number().min(1).max(1000),
  category: z.enum(['social', 'email', 'automation', 'analytics', 'other']),
  content: z.string().min(50),
});

export const whatsappMessageSchema = z.object({
  from: z.string().regex(/^\+\d{10,15}$/, 'Invalid phone number'),
  body: z.string().min(1).max(1000),
  timestamp: z.string().datetime(),
});

// AI chat message
export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  conversationId: z.string().min(1).max(100).optional(),
});

export const botBuilderSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(500),
  type: z.enum(['support', 'sales', 'scheduling', 'custom']),
  personality: z.string().min(10).max(200),
  responses: z.array(z.object({
    trigger: z.string().min(1),
    response: z.string().min(1),
  })),
});

export const pricingTierSchema = z.enum([
  'starter',
  'creator',
  'pro',
  'agency',
  'education'
]);

export const paymentSchema = z.object({
  tier: pricingTierSchema,
  addons: z.array(z.enum(['whatsapp', 'studio'])).optional(),
});

// Admin schemas
export const adminUserUpdateSchema = z.object({
  uid: z.string().min(1),
  tier: pricingTierSchema.optional(),
  credits: z.number().min(0).optional(),
  banned: z.boolean().optional(),
});

// API response helpers
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { 
      success: false, 
      error: result.error.issues.map((e: z.ZodIssue) => e.message).join(', ')
    };
  }
  return { success: true, data: result.data };
}
