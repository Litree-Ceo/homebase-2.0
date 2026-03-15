import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://litree-labstudio.com',
  'https://www.litree-labstudio.com',
  'https://litlabs.app',
  'https://www.litlabs.app',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

const ALLOWED_METHODS = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'];
const ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With'];

/**
 * Apply CORS headers to a Next.js API response
 */
export function setCorsHeaders(
  response: NextResponse,
  origin?: string | null
): NextResponse {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) 
    ? origin 
    : ALLOWED_ORIGINS[0];

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
  response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const response = new NextResponse(null, { status: 200 });
  
  return setCorsHeaders(response, origin);
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin?: string | null): boolean {
  if (!origin) return true; // Allow requests with no origin (mobile apps, curl, etc.)
  return ALLOWED_ORIGINS.includes(origin);
}
