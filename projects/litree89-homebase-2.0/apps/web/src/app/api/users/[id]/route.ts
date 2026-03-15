/**
 * Users API Route - Profile Management
 *
 * @workspace Handles user profile CRUD operations with Cosmos DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCosmosClient } from '@/lib/cosmos';
import { verifyToken } from '@/lib/auth-utils';
import type { User } from '@/types';

const DATABASE_ID = 'litlab';
const CONTAINER_ID = 'users';

// GET /api/users/[id] - Get user profile
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(CONTAINER_ID);

    const { resource: user } = await container.item(userId, userId).read<User>();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive fields for public viewing
    const { preferences, ...publicUser } = user;
    if (user.isPrivate) {
      // Only return basic info for private profiles
      return NextResponse.json({
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        isPrivate: true,
        stats: {
          followers: user.stats.followers,
          following: user.stats.following,
        },
      });
    }

    return NextResponse.json(publicUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/users/[id] - Update user profile
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser?.sub || verifiedUser.sub !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(CONTAINER_ID);

    // Fields that can be updated
    const allowedFields = [
      'displayName',
      'bio',
      'location',
      'website',
      'profilePicture',
      'coverPhoto',
      'socialLinks',
      'preferences',
    ];

    const sanitizedUpdates: Partial<User> = {};
    for (const field of allowedFields) {
      if (field in updates) {
        sanitizedUpdates[field as keyof User] = updates[field];
      }
    }

    const { resource: currentUser } = await container.item(userId, userId).read<User>();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = {
      ...currentUser,
      ...sanitizedUpdates,
      lastActive: new Date().toISOString(),
    };

    const { resource } = await container.item(userId, userId).replace(updatedUser);

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
