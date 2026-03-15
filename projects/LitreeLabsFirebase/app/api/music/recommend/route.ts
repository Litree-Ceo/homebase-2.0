import { NextRequest, NextResponse } from 'next/server';
import { generateMusicRecommendations, analyzeMusicVibe, getTikTokSafeTracks, getTrendingMusic, hasMusicSubscription } from '@/lib/music-generator';
import { getUserFromRequest } from '@/lib/auth-helper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has music subscription
    const hasSubscription = await hasMusicSubscription();
    if (!hasSubscription) {
      return NextResponse.json(
        {
          error: 'Music recommendations require the Music Add-on ($9/month)',
          upgradeRequired: true,
          upgradeUrl: '/billing?addon=music',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    let result;

    switch (action) {
      case 'recommend':
        // Generate AI-powered recommendations
        result = await generateMusicRecommendations(params);
        break;

      case 'analyze':
        // Analyze content and suggest music vibe
        result = await analyzeMusicVibe(params.contentText, params.platform);
        break;

      case 'tiktok-safe':
        // Get TikTok-safe tracks from library
        result = await getTikTokSafeTracks(params.mood, params.duration);
        break;

      case 'trending':
        // Get trending music for platform
        result = await getTrendingMusic();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: recommend, analyze, tiktok-safe, or trending' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Music recommendation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process music request' },
      { status: 500 }
    );
  }
}
