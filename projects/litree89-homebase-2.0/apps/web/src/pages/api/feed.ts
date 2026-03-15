/**
 * Get feed posts (chronological, from followed users + self)
 */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // TODO: Fetch from Cosmos DB
    // For now, return mock data structure
    const posts = [
      {
        id: 'post-1',
        authorId: 'user-1',
        author: {
          id: 'user-1',
          name: 'Creator One',
          email: 'creator1@litlabs.io',
          avatar: 'https://ui-avatars.com/api/?name=Creator+One',
          followers: 1250,
          following: 340,
          createdAt: '2025-01-01T00:00:00Z',
        },
        content: 'Just launched my new project on HomeBase! 🚀',
        media: [
          {
            id: 'media-1',
            postId: 'post-1',
            type: 'image',
            url: 'https://via.placeholder.com/600x400?text=Project+Launch',
            thumbnail: 'https://via.placeholder.com/300x200?text=Project+Launch',
            uploadedAt: new Date().toISOString(),
          },
        ],
        reactions: [
          {
            id: 'react-1',
            postId: 'post-1',
            userId: 'user-2',
            type: 'love',
            createdAt: new Date().toISOString(),
          },
        ],
        comments: [],
        shares: 42,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: 'public',
      },
    ];

    res.status(200).json({
      posts,
      hasMore: false,
      total: posts.length,
    });
  } catch (error) {
    console.error('[Feed API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
