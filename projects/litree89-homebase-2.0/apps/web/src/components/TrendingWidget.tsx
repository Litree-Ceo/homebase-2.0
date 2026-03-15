'use client';

/**
 * Trending Widget
 * @workspace Display trending topics in sidebar
 */

import React, { useState, useEffect } from 'react';

interface TrendingTopic {
  id: string;
  topic: string;
  postCount: number;
  momentum: number;
}

export default function TrendingWidget() {
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts/trending?limit=5');
      if (res.ok) {
        setTrending(await res.json());
      }
    } catch (error) {
      console.error('Failed to load trending:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-purple-500/20">
      <h2 className="font-black text-white text-lg mb-4">🔥 Trending Now</h2>

      {loading ? (
        <p className="text-purple-300 text-sm">Loading...</p>
      ) : (
        <div className="space-y-3">
          {trending.map(topic => (
            <div
              key={topic.id}
              className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer"
            >
              <div className="font-semibold text-white">{topic.topic}</div>
              <div className="text-xs text-purple-300">{topic.postCount} posts</div>
              {topic.momentum > 0 && (
                <div className="text-xs text-amber-400 mt-1">📈 {topic.momentum}% trending</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
