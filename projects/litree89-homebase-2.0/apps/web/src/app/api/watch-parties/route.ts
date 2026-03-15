/**
 * Watch Parties API Route
 *
 * @workspace Handles synchronized viewing sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCosmosClient } from '@/lib/cosmos';
import { verifyToken } from '@/lib/auth-utils';
import type { WatchParty } from '@/types';

const DATABASE_ID = 'litlab';
const WATCH_PARTIES_CONTAINER = 'watchParties';

// GET /api/watch-parties - List watch parties
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hostId = searchParams.get('hostId');
    const status = searchParams.get('status');
    const isPublic = searchParams.get('public') !== 'false';
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10);

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(WATCH_PARTIES_CONTAINER);

    let query = 'SELECT * FROM c WHERE 1=1';
    const parameters: { name: string; value: string | boolean }[] = [];

    if (hostId) {
      query += ' AND c.hostId = @hostId';
      parameters.push({ name: '@hostId', value: hostId });
    }

    if (status) {
      query += ' AND c.status = @status';
      parameters.push({ name: '@status', value: status });
    }

    if (isPublic) {
      query += ' AND c.visibility = @visibility';
      parameters.push({ name: '@visibility', value: 'public' });
    }

    query += ' ORDER BY c.createdAt DESC';

    const { resources: parties } = await container.items
      .query<WatchParty>({ query, parameters }, { maxItemCount: limit })
      .fetchNext();

    return NextResponse.json({ parties });
  } catch (error) {
    console.error('Error fetching watch parties:', error);
    return NextResponse.json({ error: 'Failed to fetch watch parties' }, { status: 500 });
  }
}

// POST /api/watch-parties - Create new watch party
export async function POST(request: NextRequest) {
  try {
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = verifiedUser.sub;

    if (!body.mediaId || !body.title) {
      return NextResponse.json({ error: 'Media ID and title are required' }, { status: 400 });
    }

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(WATCH_PARTIES_CONTAINER);
    const usersContainer = client.database(DATABASE_ID).container('users');
    const mediaContainer = client.database(DATABASE_ID).container('media');

    // Get host info
    const { resource: host } = await usersContainer.item(userId, userId).read();

    // Get media info
    const { resources: mediaItems } = await mediaContainer.items
      .query({
        query: 'SELECT c.title, c.thumbnailUrl, c.duration FROM c WHERE c.id = @mediaId',
        parameters: [{ name: '@mediaId', value: body.mediaId }],
      })
      .fetchAll();

    const partyId = `party_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const now = new Date().toISOString();

    const newParty: WatchParty = {
      id: partyId,
      hostId: userId,
      hostDisplayName: host?.displayName || 'Host',
      mediaId: body.mediaId,
      mediaTitle: mediaItems[0]?.title || body.title,
      mediaThumbnail: mediaItems[0]?.thumbnailUrl,
      title: body.title,
      description: body.description || '',
      visibility: body.visibility ?? 'public',
      maxParticipants: body.maxParticipants || 50,
      currentParticipants: 1,
      participants: [
        {
          userId,
          displayName: host?.displayName || 'Host',
          profilePic: host?.profilePicture,
          joinedAt: now,
          isHost: true,
          canControl: true,
        },
      ],
      status: 'scheduled' as const,
      scheduledStart: body.scheduledFor,
      chatEnabled: body.chatEnabled ?? true,
      syncEnabled: true,
      currentPosition: 0,
      isPlaying: false,
      createdAt: now,
      type: 'watchparty' as const,
    };

    const { resource } = await container.items.create(newParty);

    // Update user's watch party count
    await usersContainer
      .item(userId, userId)
      .patch([{ op: 'incr', path: '/stats/watchParties', value: 1 }]);

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating watch party:', error);
    return NextResponse.json({ error: 'Failed to create watch party' }, { status: 500 });
  }
}
