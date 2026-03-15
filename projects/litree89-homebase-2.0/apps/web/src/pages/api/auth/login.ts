/**
 * User Login Endpoint
 * POST /api/auth/login
 * Authenticates user with email + password
 */

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { getLitLabDatabase } from '@/lib/cosmos';

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  userId?: string;
  name?: string;
  avatar?: string;
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LoginResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body as LoginPayload;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user by email
    const db = await getLitLabDatabase();
    const usersContainer = db.container('users');

    const { resources: users } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: email.toLowerCase() }],
      })
      .fetchAll();

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const user = users[0] as any;

    // Verify password
    const hashedPassword = crypto
      .pbkdf2Sync(password, user.passwordSalt, 1000, 64, 'sha512')
      .toString('hex');

    if (hashedPassword !== user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      id: `session_${user.id}_${Date.now()}`,
      userId: user.id,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      partitionKey: 'sessions',
    };

    const sessionsContainer = db.container('sessions');
    await sessionsContainer.items.create(sessionData);

    // Set secure HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
    );

    res.status(200).json({
      success: true,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
