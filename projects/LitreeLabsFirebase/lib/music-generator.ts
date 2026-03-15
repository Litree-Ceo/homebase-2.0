import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export interface MusicRecommendation {
  trackName: string;
  artist: string;
  genre: string;
  mood: string;
  bpm: number;
  duration: number; // seconds
  spotifyUrl?: string;
  previewUrl?: string;
  reasoning: string;
  vibeMatch: number; // 0-100
  tiktokSafe: boolean;
}

export interface MusicSearchParams {
  contentType: 'post' | 'reel' | 'tiktok' | 'story' | 'youtube';
  mood?: 'energetic' | 'chill' | 'inspiring' | 'emotional' | 'professional' | 'fun';
  genre?: 'pop' | 'hip-hop' | 'edm' | 'indie' | 'jazz' | 'acoustic' | 'any';
  duration?: number; // target duration in seconds
  contentDescription?: string;
}

export interface TikTokSafeTrack {
  id: string;
  name: string;
  artist: string;
  duration: number;
  bpm: number;
  tags: string[];
  popularityScore: number; // 0-100
  trendingRank?: number;
}

/**
 * TikTok-safe royalty-free music library
 * These tracks are cleared for commercial use
 */
const TIKTOK_SAFE_LIBRARY: TikTokSafeTrack[] = [
  {
    id: 'tt_001',
    name: 'Upbeat Energy',
    artist: 'TikTok Audio Library',
    duration: 15,
    bpm: 128,
    tags: ['energetic', 'upbeat', 'dance', 'viral'],
    popularityScore: 95,
    trendingRank: 1,
  },
  {
    id: 'tt_002',
    name: 'Chill Vibes',
    artist: 'TikTok Audio Library',
    duration: 30,
    bpm: 90,
    tags: ['chill', 'relaxed', 'ambient', 'aesthetic'],
    popularityScore: 88,
    trendingRank: 3,
  },
  {
    id: 'tt_003',
    name: 'Inspiring Journey',
    artist: 'TikTok Audio Library',
    duration: 45,
    bpm: 120,
    tags: ['inspiring', 'motivational', 'emotional', 'storytelling'],
    popularityScore: 92,
    trendingRank: 2,
  },
  {
    id: 'tt_004',
    name: 'Fun & Quirky',
    artist: 'TikTok Audio Library',
    duration: 20,
    bpm: 140,
    tags: ['fun', 'quirky', 'comedy', 'lighthearted'],
    popularityScore: 85,
  },
  {
    id: 'tt_005',
    name: 'Luxury Feels',
    artist: 'TikTok Audio Library',
    duration: 25,
    bpm: 110,
    tags: ['professional', 'luxury', 'elegant', 'sophisticated'],
    popularityScore: 80,
  },
];

/**
 * Generate AI-powered music recommendations
 * Uses Gemini to analyze content and recommend perfect tracks
 */
export async function generateMusicRecommendations(
  params: MusicSearchParams
): Promise<MusicRecommendation[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a music supervisor for social media content. Recommend the perfect background music.

CONTENT DETAILS:
- Platform: ${params.contentType}
- Mood: ${params.mood || 'any'}
- Genre: ${params.genre || 'any'}
- Duration: ${params.duration ? `${params.duration}s` : 'flexible'}
- Description: ${params.contentDescription || 'General content'}

PLATFORM REQUIREMENTS:
${getPlatformRequirements(params.contentType)}

RECOMMEND 5 TRACKS that would work perfectly for this content.

RESPOND WITH JSON ARRAY:
[
  {
    "trackName": "Song Name",
    "artist": "Artist Name",
    "genre": "Genre",
    "mood": "Mood description",
    "bpm": 120,
    "duration": 30,
    "reasoning": "Why this track works perfectly",
    "vibeMatch": 95,
    "tiktokSafe": true
  }
]

Focus on tracks that:
1. Match the content mood and energy
2. Are popular and trending
3. Work well with the platform's algorithm
4. Are copyright-safe for creators`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const recommendations = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    
    return recommendations.map((rec: any) => ({
      ...rec,
      tiktokSafe: rec.tiktokSafe ?? true, // Default to true
    }));
  } catch (error) {
    console.error('Music recommendation error:', error);
    // Return fallback recommendations
    return getFallbackRecommendations(params);
  }
}

/**
 * Get TikTok-safe tracks from our curated library
 */
export async function getTikTokSafeTracks(
  mood?: string,
  duration?: number
): Promise<TikTokSafeTrack[]> {
  let tracks = [...TIKTOK_SAFE_LIBRARY];

  // Filter by mood if specified
  if (mood) {
    tracks = tracks.filter(track => 
      track.tags.some(tag => tag.toLowerCase().includes(mood.toLowerCase()))
    );
  }

  // Filter by duration if specified (within 5 seconds)
  if (duration) {
    tracks = tracks.filter(track => 
      Math.abs(track.duration - duration) <= 5
    );
  }

  // Sort by popularity and trending rank
  tracks.sort((a, b) => {
    if (a.trendingRank && b.trendingRank) {
      return a.trendingRank - b.trendingRank;
    }
    return b.popularityScore - a.popularityScore;
  });

  return tracks;
}

/**
 * Analyze content and suggest best music vibe
 */
export async function analyzeMusicVibe(
  contentText: string,
  platform: string
): Promise<{
  suggestedMood: string;
  suggestedGenre: string;
  suggestedBpm: number;
  reasoning: string;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Analyze this social media content and recommend the perfect music vibe.

CONTENT: "${contentText}"
PLATFORM: ${platform}

What mood, genre, and BPM would work best?

RESPOND WITH JSON:
{
  "suggestedMood": "energetic/chill/inspiring/emotional/professional/fun",
  "suggestedGenre": "pop/hip-hop/edm/indie/jazz/acoustic",
  "suggestedBpm": 120,
  "reasoning": "Brief explanation of why this music would work"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
  } catch (error) {
    console.error('Music vibe analysis error:', error);
    return {
      suggestedMood: 'energetic',
      suggestedGenre: 'pop',
      suggestedBpm: 128,
      reasoning: 'General upbeat music works well for most content',
    };
  }
}

/**
 * Search Spotify API for tracks
 * (Requires Spotify Web API credentials)
 */
export async function searchSpotifyTracks(
  query: string,
  filters?: {
    mood?: string;
    bpm?: number;
    duration?: number;
  }
): Promise<MusicRecommendation[]> {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.warn('Spotify credentials not configured, using fallback library');
    return [];
  }

  try {
    // Get Spotify access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await tokenResponse.json();

    // Search for tracks
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      }
    );

    const data = await searchResponse.json();
    
    return data.tracks.items.map((track: any) => ({
      trackName: track.name,
      artist: track.artists[0].name,
      genre: 'Various',
      mood: filters?.mood || 'any',
      bpm: 120, // Spotify doesn't provide BPM in basic search
      duration: Math.round(track.duration_ms / 1000),
      spotifyUrl: track.external_urls.spotify,
      previewUrl: track.preview_url,
      reasoning: 'Spotify search result',
      vibeMatch: 75,
      tiktokSafe: false, // Assume not safe unless verified
    }));
  } catch (error) {
    console.error('Spotify search error:', error);
    return [];
  }
}

/**
 * Get trending music for a platform
 */
export async function getTrendingMusic(): Promise<TikTokSafeTrack[]> {
  // Return trending tracks from our library
  const tracks = [...TIKTOK_SAFE_LIBRARY];
  
  return tracks
    .filter(track => track.trendingRank !== undefined)
    .sort((a, b) => (a.trendingRank || 999) - (b.trendingRank || 999))
    .slice(0, 10);
}

/**
 * Helper: Get platform-specific requirements
 */
function getPlatformRequirements(platform: string): string {
  const requirements: Record<string, string> = {
    'tiktok': '- Duration: 15-60 seconds\n- High energy, fast-paced\n- Must be copyright-safe\n- Trending sounds perform better',
    'reel': '- Duration: 15-90 seconds\n- Upbeat and engaging\n- Instagram trending audio\n- Avoid copyrighted music',
    'story': '- Duration: 15 seconds\n- Light background music\n- Should not overpower voice\n- Casual and authentic vibe',
    'youtube': '- Duration: flexible (30s-3min)\n- Royalty-free preferred\n- Can be more sophisticated\n- Match video pacing',
    'post': '- Background music for carousel/static post\n- Ambient and subtle\n- Sets mood without distraction',
  };

  return requirements[platform] || 'General social media music';
}

/**
 * Helper: Get fallback recommendations
 */
function getFallbackRecommendations(params: MusicSearchParams): MusicRecommendation[] {
  const mood = params.mood || 'energetic';
  const safeTracks = TIKTOK_SAFE_LIBRARY.filter(track =>
    track.tags.includes(mood)
  );

  return safeTracks.slice(0, 5).map(track => ({
    trackName: track.name,
    artist: track.artist,
    genre: 'Various',
    mood,
    bpm: track.bpm,
    duration: track.duration,
    reasoning: `TikTok-safe track perfect for ${params.contentType} content`,
    vibeMatch: 85,
    tiktokSafe: true,
  }));
}

/**
 * Check if user has music add-on subscription
 */
export async function hasMusicSubscription(): Promise<boolean> {
  // TODO: Check user's subscription in Firestore
  // For now, return true for testing
  return true;
}

/**
 * Track music recommendation usage
 */
export async function trackMusicUsage(
  userId: string,
  trackId: string,
  platform: string
): Promise<void> {
  // TODO: Store analytics in Firestore
  console.log(`Music usage tracked: ${userId} used ${trackId} for ${platform}`);
}
