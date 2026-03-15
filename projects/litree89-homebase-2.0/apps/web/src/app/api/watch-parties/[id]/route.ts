/**
 * Single Watch Party API Route
 *
 * @workspace Handles join, leave, sync, and chat operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCosmosClient } from '@/lib/cosmos';
import { verifyToken } from '@/lib/auth-utils';
import type { WatchParty, WatchPartyParticipant } from '@/types';

const DATABASE_ID = 'litlab';
const WATCH_PARTIES_CONTAINER = 'watchParties';

// GET /api/watch-parties/[id] - Get watch party details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: partyId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const inviteCode = searchParams.get('code');

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(WATCH_PARTIES_CONTAINER);

    // Query for the party
    const { resources: parties } = await container.items
      .query<WatchParty>({
        query: 'SELECT * FROM c WHERE c.id = @partyId',
        parameters: [{ name: '@partyId', value: partyId }],
      })
      .fetchAll();

    if (!parties.length) {
      return NextResponse.json({ error: 'Watch party not found' }, { status: 404 });
    }

    const party = parties[0];

    // Check access for private parties
    if (party.visibility !== 'public' && inviteCode !== party.id) {
      // Only show basic info for private parties without code
      return NextResponse.json({
        party: {
          id: party.id,
          title: party.title,
          hostDisplayName: party.hostDisplayName,
          visibility: party.visibility,
          status: party.status,
          currentParticipants: party.currentParticipants,
        },
        requiresCode: true,
      });
    }

    return NextResponse.json({ party });
  } catch (error) {
    console.error('Error fetching watch party:', error);
    return NextResponse.json({ error: 'Failed to fetch watch party' }, { status: 500 });
  }
}

// Validate join request
async function validateJoinRequest(
  party: WatchParty,
  userId: string,
  body: any,
): Promise<NextResponse | null> {
  // Verify invite code for private parties
  if (party.visibility !== 'public' && body.inviteCode !== party.id) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 });
  }

  // Check if already joined
  if (party.participants.some((p: WatchPartyParticipant) => p.userId === userId)) {
    return NextResponse.json({ error: 'Already joined' }, { status: 400 });
  }

  // Check max participants
  if (party.participants.length >= party.maxParticipants) {
    return NextResponse.json({ error: 'Party is full' }, { status: 400 });
  }

  return null;
}

// Handle join action
async function handleJoinAction(
  container: any,
  usersContainer: any,
  party: WatchParty,
  partyId: string,
  userId: string,
  body: any,
) {
  const validation = await validateJoinRequest(party, userId, body);
  if (validation) {
    return validation;
  }

  // Get user info
  const { resource: user } = await usersContainer.item(userId, userId).read();

  const newParticipant: WatchPartyParticipant = {
    userId,
    displayName: user?.displayName || 'Guest',
    profilePic: user?.profilePicture,
    joinedAt: new Date().toISOString(),
    isHost: false,
    canControl: false,
  };

  const updatedParticipants = [...party.participants, newParticipant];

  await container
    .item(partyId, party.hostId)
    .patch([{ op: 'replace', path: '/participants', value: updatedParticipants }]);

  return NextResponse.json({ success: true, participant: newParticipant });
}

// Handle leave action
async function handleLeaveAction(
  container: any,
  party: WatchParty,
  partyId: string,
  userId: string,
  isHost: boolean,
) {
  const updatedParticipants = party.participants.filter(
    (p: WatchPartyParticipant) => p.userId !== userId,
  );

  // If host leaves, end the party
  if (isHost) {
    await container.item(partyId, party.hostId).patch([
      { op: 'replace', path: '/status', value: 'ended' },
      { op: 'set', path: '/endedAt', value: new Date().toISOString() },
    ]);
  } else {
    await container.item(partyId, party.hostId).patch([
      {
        op: 'replace',
        path: '/participants',
        value: updatedParticipants,
      },
    ]);
  }

  return NextResponse.json({ success: true });
}

// Handle start action
async function handleStartAction(
  container: any,
  party: WatchParty,
  partyId: string,
  isHost: boolean,
) {
  if (!isHost) {
    return NextResponse.json({ error: 'Only host can start' }, { status: 403 });
  }

  await container.item(partyId, party.hostId).patch([
    { op: 'replace', path: '/status', value: 'active' },
    { op: 'replace', path: '/playbackState/isPlaying', value: true },
    {
      op: 'replace',
      path: '/playbackState/lastUpdated',
      value: new Date().toISOString(),
    },
    { op: 'set', path: '/startedAt', value: new Date().toISOString() },
  ]);

  return NextResponse.json({ success: true });
}

// Handle end action
async function handleEndAction(
  container: any,
  party: WatchParty,
  partyId: string,
  isHost: boolean,
) {
  if (!isHost) {
    return NextResponse.json({ error: 'Only host can end' }, { status: 403 });
  }

  await container.item(partyId, party.hostId).patch([
    { op: 'replace', path: '/status', value: 'ended' },
    { op: 'replace', path: '/playbackState/isPlaying', value: false },
    { op: 'set', path: '/endedAt', value: new Date().toISOString() },
  ]);

  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: partyId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = verifiedUser.sub;

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(WATCH_PARTIES_CONTAINER);
    const usersContainer = client.database(DATABASE_ID).container('users');

    // Find party
    const { resources: parties } = await container.items
      .query<WatchParty>({
        query: 'SELECT * FROM c WHERE c.id = @partyId',
        parameters: [{ name: '@partyId', value: partyId }],
      })
      .fetchAll();

    if (!parties.length) {
      return NextResponse.json({ error: 'Watch party not found' }, { status: 404 });
    }

    const party = parties[0];
    const isHost = party.hostId === userId;

    // Route to appropriate handler
    switch (body.action) {
      case 'join':
        return await handleJoinAction(container, usersContainer, party, partyId, userId, body);
      case 'leave':
        return await handleLeaveAction(container, party, partyId, userId, isHost);
      case 'start':
        return await handleStartAction(container, party, partyId, isHost);
      case 'end':
        return await handleEndAction(container, party, partyId, isHost);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error with watch party action:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}

// PATCH /api/watch-parties/[id] - Update playback state (host only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: partyId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = verifiedUser.sub;

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(WATCH_PARTIES_CONTAINER);

    // Find party and verify host
    const { resources: parties } = await container.items
      .query<WatchParty>({
        query: 'SELECT * FROM c WHERE c.id = @partyId AND c.hostId = @hostId',
        parameters: [
          { name: '@partyId', value: partyId },
          { name: '@hostId', value: userId },
        ],
      })
      .fetchAll();

    if (!parties.length) {
      return NextResponse.json({ error: 'Party not found or not authorized' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const operations = [];

    if (typeof body.isPlaying === 'boolean') {
      operations.push({
        op: 'replace' as const,
        path: '/playbackState/isPlaying',
        value: body.isPlaying,
      });
    }

    if (typeof body.currentTime === 'number') {
      operations.push({
        op: 'replace' as const,
        path: '/playbackState/currentTime',
        value: body.currentTime,
      });
    }

    operations.push({
      op: 'replace' as const,
      path: '/playbackState/lastUpdated',
      value: now,
    });

    if (body.syncedBy) {
      operations.push({
        op: 'set' as const,
        path: '/playbackState/syncedBy',
        value: body.syncedBy,
      });
    }

    await container.item(partyId, userId).patch(operations);

    return NextResponse.json({ success: true, syncedAt: now });
  } catch (error) {
    console.error('Error updating playback state:', error);
    return NextResponse.json({ error: 'Failed to update playback state' }, { status: 500 });
  }
}

// DELETE /api/watch-parties/[id] - Delete watch party (host only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: partyId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = verifiedUser.sub;
    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(WATCH_PARTIES_CONTAINER);
    const usersContainer = client.database(DATABASE_ID).container('users');

    // Verify ownership
    const { resources: parties } = await container.items
      .query<WatchParty>({
        query: 'SELECT * FROM c WHERE c.id = @partyId AND c.hostId = @hostId',
        parameters: [
          { name: '@partyId', value: partyId },
          { name: '@hostId', value: userId },
        ],
      })
      .fetchAll();

    if (!parties.length) {
      return NextResponse.json({ error: 'Party not found or not authorized' }, { status: 404 });
    }

    await container.item(partyId, userId).delete();

    // Update user's watch party count
    await usersContainer
      .item(userId, userId)
      .patch([{ op: 'incr', path: '/stats/watchParties', value: -1 }]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting watch party:', error);
    return NextResponse.json({ error: 'Failed to delete watch party' }, { status: 500 });
  }
}
