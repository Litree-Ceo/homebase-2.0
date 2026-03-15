/**
 * User Settings API Route - Settings Management
 *
 * @workspace Handles user settings (privacy, notifications) with Cosmos DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCosmosClient } from '@/lib/cosmos';
import { verifyToken } from '@/lib/auth-utils';
import type { User } from '@/types';

const DATABASE_ID = 'litlab';
const CONTAINER_ID = 'users';

// PUT /api/users/[id]/settings - Update user settings (privacy, notifications)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser?.sub || verifiedUser.sub !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, settings } = body;

    if (!type || !settings) {
      return NextResponse.json({ error: 'Missing type or settings' }, { status: 400 });
    }

    if (!['privacy', 'notifications'].includes(type)) {
      return NextResponse.json({ error: 'Invalid settings type' }, { status: 400 });
    }

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(CONTAINER_ID);

    // Get current user data
    const { resource: currentUser } = await container.item(userId, userId).read<User>();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize preferences if they don't exist
    if (!currentUser.preferences) {
      currentUser.preferences = {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          likes: false,
          comments: false,
          follows: false,
          mentions: false,
          watchPartyInvites: false,
        },
        privacy: {
          showOnlineStatus: true,
          showLastActive: true,
          allowDirectMessages: 'everyone',
          showMediaLibrary: 'public',
        },
        mediaQuality: 'auto',
        autoplayMedia: true,
      };
    }

    // Update the specific settings type
    if (type === 'privacy') {
      currentUser.preferences.privacy = settings;
    } else if (type === 'notifications') {
      currentUser.preferences.notifications = settings;
    }
    currentUser.lastActive = new Date().toISOString();

    // Save updated user
    const { resource: updatedUser } = await container.item(userId, userId).replace(currentUser);

    return NextResponse.json({
      success: true,
      message: `${type} settings updated successfully`,
      settings: updatedUser.preferences[type],
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      {
        error: 'Failed to save settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// GET /api/users/[id]/settings - Get user settings
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser?.sub || verifiedUser.sub !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(CONTAINER_ID);

    const { resource: user } = await container.item(userId, userId).read<User>();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user preferences/settings
    return NextResponse.json({
      privacy: user.preferences?.privacy || {
        isPublic: true,
        allowMessages: true,
        allowFollows: true,
        showActivity: true,
      },
      notifications: user.preferences?.notifications || {
        likes: true,
        comments: true,
        follows: true,
        messages: true,
        mentions: true,
        email: false,
      },
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
