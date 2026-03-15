/**
 * Meta OAuth Callback Handler
 * @workspace Handles OAuth redirect from Facebook/Instagram
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { MetaOAuthClient, MetaOAuthToken } from '@/lib/meta-oauth';
import { saveMetaToken } from '@/lib/cosmos';

interface OAuthSession {
  user: {
    id: string;
    name: string;
    email?: string;
    picture?: string;
  };
  metaToken: MetaOAuthToken;
  createdAt: number;
}

/**
 * Handle OAuth callback from Meta/Facebook
 * GET /api/auth/meta/callback?code=...&state=...
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, error, error_description } = req.query;

  try {
    // Handle OAuth errors
    if (error) {
      console.error('[Meta OAuth Error]', { error, error_description });
      const errorMsg = Array.isArray(error_description)
        ? error_description[0]
        : error_description || '';
      const errorText = Array.isArray(error) ? error[0] : error;
      const errorParam = encodeURIComponent(errorMsg || errorText || 'Unknown error');
      return res.redirect(`/auth/login?error=${errorParam}&provider=meta`);
    }

    // Validate code parameter
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        error: 'Missing authorization code',
      });
    }

    // Initialize OAuth client
    const oauthClient = new MetaOAuthClient({
      appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
      appSecret: process.env.META_APP_SECRET || '',
      redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/meta/callback`,
      scope: [
        'pages_manage_posts',
        'pages_read_engagement',
        'pages_manage_metadata',
        'instagram_basic',
        'instagram_graph_user_profile',
        'instagram_graph_user_media',
      ],
    });

    // Exchange code for token
    console.log('[Meta OAuth] Exchanging code for token...');
    const metaToken = await oauthClient.exchangeCodeForToken(code);

    // Get user profile
    console.log('[Meta OAuth] Fetching user profile...');
    const userProfile = await oauthClient.getUserProfile(metaToken.accessToken);

    // Prepare session data
    const session: OAuthSession = {
      user: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        picture: userProfile.picture?.url,
      },
      metaToken,
      createdAt: Date.now(),
    };

    console.log('[Meta OAuth] Authentication successful', {
      userId: session.user.id,
      userName: session.user.name,
    });

    // Store session in secure HTTP-only cookie
    // In production, use a session store (Redis, database, etc.)
    res.setHeader(
      'Set-Cookie',
      `meta_session=${JSON.stringify(
        session,
      )}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${metaToken.expiresIn}`,
    );

    // Save token to Cosmos DB for session persistence
    try {
      await saveMetaToken(userProfile.id, metaToken);
    } catch (dbError) {
      console.warn(
        '[Meta Token Storage Warning]',
        dbError instanceof Error ? dbError.message : 'Failed to save token',
      );
      // Continue without token persistence - session cookie still valid for immediate use
    }

    // Redirect to dashboard or home page
    const redirectUrl = (req.query.redirect as string) || '/dashboard/meta';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('[Meta OAuth Handler Error]', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const encodedError = encodeURIComponent(errorMessage);

    res.redirect(`/auth/login?error=${encodedError}&provider=meta`);
  }
}
