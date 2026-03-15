'use client';

/**
 * Explore & Discover Page
 * @workspace Find trending posts, popular users, and engaging content
 */

import React, { useState, useEffect } from 'react';
import SocialFeed from '@/components/social/SocialFeed';

interface TrendingTopic {
  id: string;
  topic: string;
  postCount: number;
  momentum: number;
  category: string;
}

export default function ExplorePage() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingTopics();
  }, []);

  const loadTrendingTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts/trending?limit=10');
      if (res.ok) {
        setTrendingTopics(await res.json());
      }
    } catch (error) {
      console.error('Failed to load trending:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 py-6 px-4">
      {/* Sidebar - Trending Topics */}
      <aside className="lg:col-span-1">
        <div className="bg-slate-900 rounded-lg p-4 border border-purple-500/20 sticky top-20">
          <h2 className="font-black text-white text-lg mb-4">🔥 Trending Now</h2>

          {loading ? (
            <p className="text-purple-300 text-sm">Loading...</p>
          ) : (
            <div className="space-y-3">
              {trendingTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.topic)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedTopic === topic.topic
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800/50 text-purple-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold">{topic.topic}</div>
                  <div className="text-xs text-purple-300/70">{topic.postCount} posts</div>
                  {topic.momentum > 0 && (
                    <div className="text-xs text-amber-400 mt-1">📈 {topic.momentum}% trending</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Categories */}
          <div className="mt-6 pt-6 border-t border-purple-500/20">
            <h3 className="font-bold text-white text-sm mb-3">Categories</h3>
            <div className="space-y-2">
              {[
                '🎬 Entertainment',
                '🎵 Music',
                '🎮 Gaming',
                '💻 Tech',
                '📚 Learning',
                '🚀 Innovation',
              ].map(cat => (
                <button
                  key={cat}
                  className="w-full text-left text-sm text-purple-300 hover:text-amber-400 transition"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <div className="lg:col-span-3">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">🔍 Explore</h1>
          <p className="text-purple-300">
            {selectedTopic
              ? `Viewing posts about "${selectedTopic}"`
              : 'Discover trending content and new creators'}
          </p>
        </div>

        <SocialFeed feedType="explore" />
      </div>
    </div>
  );
}
