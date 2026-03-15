import { z } from 'zod';

// Environment variables schema
export const envSchema = z.object({
  // Firebase
  FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
  FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase Auth Domain is required'),
  FIREBASE_DATABASE_URL: z.string().url('Invalid Firebase Database URL'),
  FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase Storage Bucket is required'),

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'Stripe Publishable Key is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe Secret Key is required'),

  // App Config
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Google AI (Optional)
  NEXT_PUBLIC_GOOGLE_AI_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates environment variables at application startup
 */
export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');

      throw new Error(
        `Environment validation failed:\n${missingVars}\n\nPlease check your .env.local file.`
      );
    }
    throw error;
  }
}

// Export validated config
export const env = validateEnv();
