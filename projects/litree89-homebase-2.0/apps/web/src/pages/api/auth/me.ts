/**
 * Get Current User Endpoint
 * GET /api/auth/me
 * Returns authenticated user info from session cookie
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getLitLabDatabase } from '@/lib/cosmos';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
}

interface MeResponse {
  success: boolean;
  user?: UserInfo;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<MeResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get session cookie
    const sessionToken = req.cookies.session;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Look up session
    const db = await getLitLabDatabase();
    const sessionsContainer = db.container('sessions');

    const { resources: sessions } = await sessionsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.token = @token',
        parameters: [{ name: '@token', value: sessionToken }],
      })
      .fetchAll();

    if (sessions.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Session not found',
      });
    }

    const session = sessions[0] as any;

    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'Session expired',
      });
    }

    // Get user
    const usersContainer = db.container('users');
    const { resource: user } = await usersContainer
      .item(session.userId, session.userId)
      .read<any>();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio || '',
        followers: user.followers || 0,
        following: user.following || 0,
      },
    });
  } catch (error) {
    console.error('[Get Me Error]', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
