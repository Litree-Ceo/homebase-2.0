'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface MusicTrack {
  trackName: string;
  artist: string;
  genre: string;
  mood: string;
  bpm: number;
  duration: number;
  reasoning: string;
  vibeMatch: number;
  tiktokSafe: boolean;
  spotifyUrl?: string;
  previewUrl?: string;
}

export default function MusicPage() {
  const [activeTab, setActiveTab] = useState<'recommend' | 'trending' | 'library'>('recommend');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MusicTrack[]>([]);
  const [contentDescription, setContentDescription] = useState('');
  const [platform, setPlatform] = useState<'tiktok' | 'reel' | 'story' | 'youtube'>('tiktok');
  const [mood, setMood] = useState<'energetic' | 'chill' | 'inspiring' | 'emotional' | 'professional' | 'fun'>('energetic');

  const handleRecommend = async () => {
    if (!contentDescription.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/music/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recommend',
          contentType: platform,
          mood,
          contentDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          alert('Music recommendations require the Music Add-on ($9/month). Upgrade to unlock!');
          window.location.href = '/billing?addon=music';
          return;
        }
        throw new Error(data.error);
      }

      setRecommendations(data.result);
    } catch (error) {
      console.error('Music recommendation error:', error);
      alert('Failed to generate recommendations. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetTrending = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/music/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trending',
          platform,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Convert TikTokSafeTrack to MusicTrack format
      const tracks = data.result.map((track: any) => ({
        trackName: track.name,
        artist: track.artist,
        genre: 'TikTok Audio',
        mood: track.tags[0] || 'energetic',
        bpm: track.bpm,
        duration: track.duration,
        reasoning: `Trending #${track.trendingRank || '∞'} on TikTok`,
        vibeMatch: track.popularityScore,
        tiktokSafe: true,
      }));

      setRecommendations(tracks);
    } catch (error) {
      console.error('Trending music error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* HEADER */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-black text-white'>Music Library 🎵</h1>
            <p className='text-white/60 mt-1'>AI-powered music recommendations for your content</p>
          </div>
          <div className='px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30'>
            <p className='text-sm text-pink-300 font-semibold'>Music Add-on • $9/month</p>
          </div>
        </div>

        {/* TABS */}
        <div className='flex gap-2 border-b border-white/10'>
          <button
            onClick={() => setActiveTab('recommend')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'recommend'
                ? 'text-pink-400 border-b-2 border-pink-500'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🎯 Recommend
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'trending'
                ? 'text-pink-400 border-b-2 border-pink-500'
                : 'text-white/60 hover:text-white'
            }`}
          >
            🔥 Trending
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'library'
                ? 'text-pink-400 border-b-2 border-pink-500'
                : 'text-white/60 hover:text-white'
            }`}
          >
            📚 Library
          </button>
        </div>

        {/* RECOMMEND TAB */}
        {activeTab === 'recommend' && (
          <div className='space-y-6'>
            {/* INPUT FORM */}
            <div className='rounded-xl border border-white/10 bg-slate-900 p-6 space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-white mb-2'>Content Description</label>
                <textarea
                  value={contentDescription}
                  onChange={(e) => setContentDescription(e.target.value)}
                  placeholder='Describe your content... (e.g., "Barber transformation video showing a dramatic fade haircut")'
                  className='w-full h-24 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label htmlFor="platform-select" className='block text-sm font-semibold text-white mb-2'>Platform</label>
                  <select
                    id="platform-select"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50'
                    aria-label="Select platform"
                  >
                    <option value='tiktok'>TikTok (15-60s)</option>
                    <option value='reel'>Instagram Reel (15-90s)</option>
                    <option value='story'>Instagram Story (15s)</option>
                    <option value='youtube'>YouTube (30s-3min)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="mood-select" className='block text-sm font-semibold text-white mb-2'>Mood</label>
                  <select
                    id="mood-select"
                    value={mood}
                    onChange={(e) => setMood(e.target.value as any)}
                    className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50'
                    aria-label="Select mood"
                  >
                    <option value='energetic'>Energetic 🔥</option>
                    <option value='chill'>Chill 😌</option>
                    <option value='inspiring'>Inspiring ✨</option>
                    <option value='emotional'>Emotional 💙</option>
                    <option value='professional'>Professional 💼</option>
                    <option value='fun'>Fun 🎉</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleRecommend}
                disabled={isLoading || !contentDescription.trim()}
                className='w-full px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-pink-500/30 transition'
              >
                {isLoading ? 'Analyzing...' : '🎵 Get Recommendations'}
              </button>
            </div>

            {/* RECOMMENDATIONS */}
            {recommendations.length > 0 && (
              <div className='space-y-3'>
                <h2 className='text-xl font-bold text-white'>Perfect Tracks for Your Content</h2>
                {recommendations.map((track, idx) => (
                  <div
                    key={idx}
                    className='rounded-xl border border-white/10 bg-slate-900 p-6 hover:border-pink-500/50 transition'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='text-lg font-bold text-white'>{track.trackName}</h3>
                          {track.tiktokSafe && (
                            <span className='px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold'>
                              ✓ TikTok Safe
                            </span>
                          )}
                        </div>
                        <p className='text-white/60 text-sm'>{track.artist}</p>
                      </div>
                      <div className='text-right'>
                        <div className='text-2xl font-black text-pink-400'>{track.vibeMatch}%</div>
                        <p className='text-xs text-white/50'>Vibe Match</p>
                      </div>
                    </div>

                    <div className='grid grid-cols-4 gap-4 mb-4'>
                      <div>
                        <p className='text-xs text-white/50'>Genre</p>
                        <p className='text-sm font-semibold text-white'>{track.genre}</p>
                      </div>
                      <div>
                        <p className='text-xs text-white/50'>Mood</p>
                        <p className='text-sm font-semibold text-white'>{track.mood}</p>
                      </div>
                      <div>
                        <p className='text-xs text-white/50'>BPM</p>
                        <p className='text-sm font-semibold text-white'>{track.bpm}</p>
                      </div>
                      <div>
                        <p className='text-xs text-white/50'>Duration</p>
                        <p className='text-sm font-semibold text-white'>{track.duration}s</p>
                      </div>
                    </div>

                    <p className='text-sm text-white/70 mb-4'>{track.reasoning}</p>

                    <div className='flex gap-2'>
                      {track.previewUrl && (
                        <button className='px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-sm font-semibold transition'>
                          ▶ Preview
                        </button>
                      )}
                      {track.spotifyUrl && (
                        <button className='px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm font-semibold transition'>
                          Open in Spotify
                        </button>
                      )}
                      <button className='px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-semibold transition'>
                        Save to Library
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRENDING TAB */}
        {activeTab === 'trending' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <p className='text-white/70'>Top trending sounds on {platform}</p>
              <button
                onClick={handleGetTrending}
                disabled={isLoading}
                className='px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold disabled:opacity-50 hover:shadow-lg hover:shadow-pink-500/30 transition'
              >
                {isLoading ? 'Loading...' : '🔥 Load Trending'}
              </button>
            </div>

            {recommendations.length > 0 && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {recommendations.map((track, idx) => (
                  <div
                    key={idx}
                    className='rounded-xl border border-white/10 bg-slate-900 p-5 hover:border-pink-500/50 transition'
                  >
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center font-black text-white'>
                        #{idx + 1}
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-bold text-white'>{track.trackName}</h3>
                        <p className='text-sm text-white/60'>{track.artist}</p>
                      </div>
                    </div>
                    <p className='text-sm text-white/70 mb-3'>{track.reasoning}</p>
                    <button className='w-full px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-sm font-semibold transition'>
                      Use This Track
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <div className='text-center py-12'>
            <div className='text-6xl mb-4'>📚</div>
            <h2 className='text-2xl font-bold text-white mb-2'>Your Music Library</h2>
            <p className='text-white/60 mb-6'>Saved tracks will appear here</p>
            <button className='px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/30 transition'>
              Browse Recommendations
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
