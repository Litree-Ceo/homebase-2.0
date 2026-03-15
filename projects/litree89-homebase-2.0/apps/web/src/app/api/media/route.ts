/**
 * Media Library API Route
 *
 * @workspace Handles media upload, listing, and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCosmosClient } from '@/lib/cosmos';
import { verifyToken } from '@/lib/auth-utils';
import type { MediaItem } from '@/types';

const DATABASE_ID = 'litlab';
const MEDIA_CONTAINER = 'media';

// GET /api/media - List media items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recent';
    const limit = Number.parseInt(searchParams.get('limit') || '24', 10);
    const continuationToken = searchParams.get('continuation');

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(MEDIA_CONTAINER);

    let query = 'SELECT * FROM c WHERE c.isPublic = true';
    const parameters: { name: string; value: string }[] = [];

    if (userId) {
      query = 'SELECT * FROM c WHERE c.userId = @userId';
      parameters.push({ name: '@userId', value: userId });
    }

    if (category) {
      query += ' AND c.category = @category';
      parameters.push({ name: '@category', value: category });
    }

    if (genre) {
      query += ' AND ARRAY_CONTAINS(c.genres, @genre)';
      parameters.push({ name: '@genre', value: genre });
    }

    if (search) {
      query +=
        ' AND (CONTAINS(LOWER(c.title), @search) OR CONTAINS(LOWER(c.description), @search))';
      parameters.push({ name: '@search', value: search.toLowerCase() });
    }

    // Sorting
    switch (sort) {
      case 'popular':
        query += ' ORDER BY c.stats.views DESC';
        break;
      case 'rating':
        query += ' ORDER BY c.stats.rating DESC';
        break;
      case 'title':
        query += ' ORDER BY c.title ASC';
        break;
      case 'recent':
      default:
        query += ' ORDER BY c.uploadedAt DESC';
    }

    const { resources: media, continuationToken: nextToken } = await container.items
      .query<MediaItem>(
        { query, parameters },
        {
          maxItemCount: limit,
          continuationToken: continuationToken || undefined,
        },
      )
      .fetchNext();

    // Get featured/trending items if no filters
    let featured: MediaItem[] = [];
    if (!userId && !category && !search) {
      const { resources } = await container.items
        .query<MediaItem>({
          query: 'SELECT TOP 5 * FROM c WHERE c.isFeatured = true ORDER BY c.stats.views DESC',
        })
        .fetchAll();
      featured = resources;
    }

    return NextResponse.json({
      media,
      featured,
      continuation: nextToken,
      hasMore: !!nextToken,
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// POST /api/media - Create new media item
export async function POST(request: NextRequest) {
  try {
    const verifiedUser = await verifyToken(request);

    if (!verifiedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = verifiedUser.sub;

    // Validate required fields
    if (!body.title || !body.url || !body.category) {
      return NextResponse.json({ error: 'Title, URL, and category are required' }, { status: 400 });
    }

    const client = getCosmosClient();
    const container = client.database(DATABASE_ID).container(MEDIA_CONTAINER);
    const usersContainer = client.database(DATABASE_ID).container('users');

    const mediaId = `media_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const now = new Date().toISOString();

    const newMedia: MediaItem = {
      id: mediaId,
      userId,
      title: body.title,
      description: body.description || '',
      mediaType: body.mediaType || 'clip',
      genre: body.genre || [],
      tags: body.tags || [],
      thumbnailUrl: body.thumbnailUrl || '/thumbnails/default.jpg',
      posterUrl: body.posterUrl,
      backdropUrl: body.backdropUrl,
      sourceUrl: body.sourceUrl || '',
      hlsUrl: body.hlsUrl,
      dashUrl: body.dashUrl,
      duration: body.duration || 0,
      releaseYear: body.releaseYear,
      rating: body.rating ? { average: body.rating, count: 1 } : undefined,
      quality: body.quality || '720p',
      fileSize: body.fileSize,
      visibility: body.visibility || 'public',
      createdAt: now,
      updatedAt: now,
      type: 'media',
      metadata: {
        director: body.director,
        cast: body.cast || [],
        studio: body.studio,
        artist: body.artist,
        album: body.album,
        trackNumber: body.trackNumber,
        language: body.language || 'en',
        subtitles: body.subtitles || [],
        audioTracks: body.audioTracks || [],
        chapters: body.chapters || [],
      },
      stats: {
        views: 0,
        likes: 0,
        shares: 0,
        saves: 0,
        watchTime: 0,
        completionRate: 0,
      },
    };

    const { resource } = await container.items.create(newMedia);

    // Update user's media count
    await usersContainer
      .item(userId, userId)
      .patch([{ op: 'incr', path: '/stats/mediaItems', value: 1 }]);

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating media:', error);
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 });
  }
}
