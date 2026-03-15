/**
 * Current User Profile API Route
 *
 * @workspace Handles current authenticated user's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCosmosClient } from '@/lib/cosmos';
import { verifyToken } from '@/lib/auth-utils';
import type { User } from '@/types';

const DATABASE_ID = 'litlab';
const CONTAINER_ID = 'users';

// GET /api/users/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = verifiedUser.sub;
    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(CONTAINER_ID);

    const { resource: user } = await container.item(userId, userId).read<User>();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update last active timestamp
    await container
      .item(userId, userId)
      .patch([{ op: 'replace', path: '/lastActive', value: new Date().toISOString() }]);

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// POST /api/users/profile - Create user profile (first-time sync from Azure AD B2C)
export async function POST(request: NextRequest) {
  try {
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = verifiedUser.sub;

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(CONTAINER_ID);

    // Check if user already exists
    try {
      const { resource: existingUser } = await container.item(userId, userId).read<User>();
      if (existingUser) {
        // Update last active and return existing user
        await container.item(userId, userId).patch([
          {
            op: 'replace',
            path: '/lastActive',
            value: new Date().toISOString(),
          },
        ]);
        return NextResponse.json(existingUser);
      }
    } catch {
      // User doesn't exist, continue to create
    }

    // Generate username from email or display name
    const baseUsername = (
      body.email?.split('@')[0] ||
      body.displayName?.toLowerCase().replaceAll(/\s+/g, '') ||
      'user'
    ).slice(0, 20);
    const username = `${baseUsername}${Date.now().toString(36)}`;

    const newUser: User = {
      id: userId,
      email: body.email || verifiedUser.email || '',
      username,
      displayName: body.displayName || body.name || 'New User',
      profilePicture: body.profilePicture || '/avatars/default.png',
      coverPhoto: '/covers/default.jpg',
      bio: '',
      location: '',
      website: '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isVerified: false,
      isPrivate: false,
      type: 'user',
      stats: {
        posts: 0,
        followers: 0,
        following: 0,
        mediaItems: 0,
        watchParties: 0,
        totalWatchTime: 0,
      },
      socialLinks: {},
      preferences: {
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
      },
    };

    const { resource } = await container.items.create(newUser);

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}

// PUT /api/users/profile - Full profile update
export async function PUT(request: NextRequest) {
  try {
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = verifiedUser.sub;
    const updates = await request.json();

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(CONTAINER_ID);

    const { resource: currentUser } = await container.item(userId, userId).read<User>();
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser: User = {
      ...currentUser,
      displayName: updates.displayName ?? currentUser.displayName,
      bio: updates.bio ?? currentUser.bio,
      location: updates.location ?? currentUser.location,
      website: updates.website ?? currentUser.website,
      profilePicture: updates.profilePicture ?? currentUser.profilePicture,
      coverPhoto: updates.coverPhoto ?? currentUser.coverPhoto,
      isPrivate: updates.isPrivate ?? currentUser.isPrivate,
      socialLinks: updates.socialLinks ?? currentUser.socialLinks,
      preferences: {
        ...currentUser.preferences,
        ...updates.preferences,
      },
      lastActive: new Date().toISOString(),
    };

    const { resource } = await container.item(userId, userId).replace(updatedUser);

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
