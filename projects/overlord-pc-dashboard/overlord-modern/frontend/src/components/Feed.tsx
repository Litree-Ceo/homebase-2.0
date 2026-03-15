import { useEffect, useState } from 'react';
import { Post } from '../types';
import { supabase } from '../lib/supabase';
import PostCreator from './PostCreator';
import PostCard from './PostCard';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);

  const INITIAL_POSTS = [
    {
      id: 1,
      author: '🤖 Agent Zero',
      time: '2 min ago',
      content:
        'BTC Signal: BULLISH 📈 Confidence 87%. Entry: $67,420. Target: $71,000.',
      type: 'btc',
      likes: 142,
      comments: 23,
    },
    {
      id: 2,
      author: '👤 Larry Bol',
      time: '1 hour ago',
      content:
        'Just dropped a new AI-generated art pack 🎨 Check it out in the store!',
      type: 'post',
      likes: 88,
      comments: 14,
    },
    {
      id: 3,
      author: '🎮 Game Hub',
      time: '3 hours ago',
      content:
        'New retro game unlocked: Treasure Mountain ⛰️ Play free — high scores on leaderboard!',
      type: 'game',
      likes: 204,
      comments: 41,
    },
  ];

  useEffect(() => {
    if (import.meta.env.VITE_USE_LOCAL_DB === 'true') {
      setPosts(INITIAL_POSTS);
      return;
    }

    // Load posts
    supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data);
      });

    // Live updates
    const channel = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => setPosts((prev) => [payload.new as Post, ...prev])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const addPost = (content: string) => {
    setPosts([
      {
        id: Date.now(),
        author: '👤 Larry Bol',
        time: 'Just now',
        content,
        type: 'post',
        likes: 0,
        comments: 0,
      },
      ...posts,
    ]);
  };
  return (
    <main className="feed">
      <div className="stories-bar">
        {[
          '➕ Add Story',
          '🤖 Agent Zero',
          '👤 Larry',
          '🎮 Games',
          '🎨 Create',
        ].map((s, i) => (
          <div key={i} className="story-chip">
            {s}
          </div>
        ))}
      </div>
      <PostCreator onPost={addPost} />
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </main>
  );
}
