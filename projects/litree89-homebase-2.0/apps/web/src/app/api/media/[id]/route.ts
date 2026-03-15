/**
 * Single Media Item API Route
 *
 * @workspace Handles individual media operations, playback, and ratings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCosmosClient } from '@/lib/cosmos';
import { verifyToken } from '@/lib/auth-utils';
import type { MediaItem, WatchHistory } from '@/types';

const DATABASE_ID = 'litlab';
const MEDIA_CONTAINER = 'media';
const WATCH_HISTORY_CONTAINER = 'watchHistory';

// Helper functions
async function handleLikeAction(
  container: any,
  mediaId: string,
  media: MediaItem,
  liked: boolean
) {
  await container
    .item(mediaId, media.userId)
    .patch([{ op: 'incr', path: '/stats/likes', value: liked ? 1 : -1 }]);
  return NextResponse.json({ success: true });
}

async function handleWatchProgress(
  container: any,
  client: any,
  data: {
    userId: string;
    mediaId: string;
    media: MediaItem;
    position: number;
    duration: number;
    completed: boolean;
  }
) {
  const watchContainer = client.database(DATABASE_ID).container(WATCH_HISTORY_CONTAINER);
  const now = new Date().toISOString();

  const historyId = `watch_${data.userId}_${data.mediaId}`;
  const watchRecord: WatchHistory = {
    id: historyId,
    userId: data.userId,
    mediaId: data.mediaId,
    mediaTitle: data.media.title,
    mediaThumbnail: data.media.thumbnailUrl || "",
    mediaType: data.media.type || "media",
    watchedAt: now,
    duration: data.duration || data.media.duration || 0,
    progress: data.position || 0,
    completed: data.completed || false,
    type: "watchhistory",
  };

  await watchContainer.items.upsert(watchRecord);
  return NextResponse.json({ success: true });
}

async function handleMetadataUpdate(
  container: any,
  mediaId: string,
  media: MediaItem,
  userId: string,
  body: any
) {
  if (media.userId !== userId) {
    return NextResponse.json({ error: 'Unauthorized to update' }, { status: 403 });
  }

  const allowedFields = ['title', 'description', 'thumbnailUrl', 'posterUrl', 'isPublic', 'tags'];
  const operations = [];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      operations.push({
        op: 'replace' as const,
        path: `/${field}`,
        value: body[field],
      });
    }
  }

  if (operations.length > 0) {
    await container.item(mediaId, media.userId).patch(operations);
  }

  return NextResponse.json({ success: true });
}

// GET /api/media/[id] - Get single media item
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: mediaId } = await params;
    const verifiedUser = await verifyToken(request);

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(MEDIA_CONTAINER);

    // Query for the media item
    const { resources: mediaItems } = await container.items
      .query<MediaItem>({
        query: 'SELECT * FROM c WHERE c.id = @mediaId',
        parameters: [{ name: '@mediaId', value: mediaId }],
      })
      .fetchAll();

    if (!mediaItems.length) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const media = mediaItems[0];

    // Check access (visibility check)
    if (media.visibility !== 'public' && media.userId !== verifiedUser?.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Increment view count
    await container
      .item(mediaId, media.userId)
      .patch([{ op: 'incr', path: '/stats/views', value: 1 }]);

    // Get watch progress if authenticated
    let watchProgress: { position: number; completed: boolean } | null = null;
    if (verifiedUser) {
      try {
        const watchContainer = client.database(DATABASE_ID).container(WATCH_HISTORY_CONTAINER);
        const { resources: history } = await watchContainer.items
          .query<WatchHistory>({
            query: 'SELECT * FROM c WHERE c.userId = @userId AND c.mediaId = @mediaId',
            parameters: [
              { name: '@userId', value: verifiedUser.sub },
              { name: '@mediaId', value: mediaId },
            ],
          })
          .fetchAll();

        if (history.length) {
          watchProgress = {
            position: history[0].progress,
            completed: history[0].completed,
          };
        }
      } catch {
        // Watch history not available
      }
    }

    return NextResponse.json({
      media: {
        ...media,
        stats: { ...media.stats, views: media.stats.views + 1 },
      },
      watchProgress,
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// PATCH /api/media/[id] - Update media or record interaction
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: mediaId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = verifiedUser.sub;
    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(MEDIA_CONTAINER);

    // Find media
    const { resources: mediaItems } = await container.items
      .query<MediaItem>({
        query: 'SELECT * FROM c WHERE c.id = @mediaId',
        parameters: [{ name: '@mediaId', value: mediaId }],
      })
      .fetchAll();

    if (!mediaItems.length) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const media = mediaItems[0];

    // Dispatch to appropriate handler
    if (body.action === 'like') {
      return handleLikeAction(container, mediaId, media, body.liked);
    }

    if (body.action === 'rate' && typeof body.rating === 'number') {
      return NextResponse.json({ error: 'Rating functionality not implemented' }, { status: 501 });
    }

    if (body.action === 'progress') {
      return handleWatchProgress(container, client, {
        userId,
        mediaId,
        media,
        position: body.position,
        duration: body.duration,
        completed: body.completed,
      });
    }

    if (body.metadata) {
      return handleMetadataUpdate(container, mediaId, media, userId, body);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

// DELETE /api/media/[id] - Delete media item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: mediaId } = await params;
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = verifiedUser.sub;
    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(MEDIA_CONTAINER);
    const usersContainer = client.database(DATABASE_ID).container('users');

    // Find and verify ownership
    const { resources: mediaItems } = await container.items
      .query<MediaItem>({
        query: 'SELECT * FROM c WHERE c.id = @mediaId AND c.userId = @userId',
        parameters: [
          { name: '@mediaId', value: mediaId },
          { name: '@userId', value: userId },
        ],
      })
      .fetchAll();

    if (!mediaItems.length) {
      return NextResponse.json({ error: 'Media not found or unauthorized' }, { status: 404 });
    }

    await container.item(mediaId, userId).delete();

    // Update user's media count
    await usersContainer
      .item(userId, userId)
      .patch([{ op: 'incr', path: '/stats/mediaItems', value: -1 }]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
