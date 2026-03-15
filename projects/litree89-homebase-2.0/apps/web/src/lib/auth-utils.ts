/**
 * Auth Utilities
 * @workspace Shared authentication helpers for API routes
 */

import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

export interface DecodedToken {
  sub: string;
  email?: string;
  name?: string;
  aud: string;
  iss: string;
  exp: number;
  iat: number;
}

const client = jwksClient({
  jwksUri: `https://${process.env.NEXT_PUBLIC_ENTRA_TENANT_NAME || 'litlabsb2c'}.ciamlogin.com/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Verify JWT token from Authorization header
 * @workspace Production-ready JWT verification with Azure AD B2C
 */
export async function verifyToken(request: NextRequest): Promise<DecodedToken | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // Development mode: Allow mock tokens
    if (process.env.NODE_ENV === 'development') {
      return {
        sub: 'dev-user-123',
        email: 'dev@litlabs.com',
        name: 'Dev User',
        aud: 'dev-audience',
        iss: 'dev-issuer',
        exp: Date.now() / 1000 + 3600,
        iat: Date.now() / 1000,
      };
    }

    // Production: Verify with Azure AD B2C JWKS
    return await new Promise<DecodedToken>((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          audience: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID,
          issuer: `https://${process.env.NEXT_PUBLIC_ENTRA_TENANT_NAME || 'litlabsb2c'}.ciamlogin.com/`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err || !decoded || typeof decoded === 'string') {
            reject(err || new Error('Invalid token'));
            return;
          }
          resolve(decoded as DecodedToken);
        },
      );
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Extract user ID from request
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const decoded = await verifyToken(request);
  return decoded?.sub || null;
}
