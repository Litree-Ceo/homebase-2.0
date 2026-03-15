import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter for Next.js API routes
// For production, use the main rateLimiter.ts with Redis backend

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Create a rate limiter middleware for Next.js API routes
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();
    
    const record = requestCounts.get(key);
    
    if (!record || now > record.resetTime) {
      // New window
      requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null; // Allow request
    }
    
    if (record.count >= config.max) {
      // Rate limit exceeded
      return NextResponse.json(
        { error: config.message },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
          },
        }
      );
    }
    
    // Increment counter
    record.count++;
    return null; // Allow request
  };
}

// Pre-configured rate limiters
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later',
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later',
});

export const criticalLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many critical operations, please try again later',
});

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute
