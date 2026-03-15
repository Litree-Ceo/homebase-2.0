/**
 * User Registration Endpoint
 * POST /api/auth/register
 * Creates new user account with email + password
 */

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { getLitLabDatabase } from '@/lib/cosmos';

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  username: string;
}

interface RegisterResponse {
  success: boolean;
  userId?: string;
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<RegisterResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password, name, username } = req.body as RegisterPayload;

    // Validation
    if (!email || !password || !name || !username) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, name, username',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters',
      });
    }

    // Check if user already exists
    const db = await getLitLabDatabase();
    const usersContainer = db.container('users');

    const { resources: existingUsers } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.email = @email OR c.username = @username',
        parameters: [
          { name: '@email', value: email.toLowerCase() },
          { name: '@username', value: username.toLowerCase() },
        ],
      })
      .fetchAll();

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email or username already exists',
      });
    }

    // Hash password
    const saltRounds = 10;
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    // Create user document
    const userId = crypto.randomUUID();
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      name,
      passwordHash: hashedPassword,
      passwordSalt: salt,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      bio: '',
      followers: 0,
      following: 0,
      modules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      partitionKey: 'users',
    };

    // Save to Cosmos DB
    const { resource: createdUser } = await usersContainer.items.create(newUser);

    if (!createdUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create user',
      });
    }

    // Set HTTP-only secure cookie with session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      id: `session_${userId}_${Date.now()}`,
      userId,
      token: sessionToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
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

    res.status(201).json({
      success: true,
      userId: createdUser.id,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
