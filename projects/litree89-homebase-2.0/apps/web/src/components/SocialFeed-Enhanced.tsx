'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';
import type { Post } from '@/types';

interface EnhancedPost extends Post {
  reactions?: Array<{
    emoji: string;
    count: number;
    hasReacted: boolean;
  }>;
}

export function SocialFeedEnhanced() {
  const [posts, setPosts] = useState<EnhancedPost[]>([
    {
      id: 'post-1',
      userId: 'user-1',
      authorDisplayName: 'Sarah Chen',
      authorUsername: 'sarahchen',
      authorProfilePic: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=random',
      content:
        'Just launched my new course on web development! 🚀 Check it out and let me know what you think.',
      mediaAttachments: [
        {
          id: 'media-1',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1516321318423-f06f70504646?w=600',
          thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f70504646?w=200',
        },
      ],
      hashtags: [],
      mentions: [],
      visibility: 'public',
      createdAt: new Date().toISOString(),
      isEdited: false,
      stats: {
        likes: 234,
        comments: 45,
        shares: 45,
        views: 1200,
        saves: 30,
      },
      type: 'post',
      reactions: [
        { emoji: '❤️', count: 234, hasReacted: false },
        { emoji: '🔥', count: 89, hasReacted: false },
        { emoji: '👏', count: 156, hasReacted: true },
      ],
    },
  ]);

  const [hasMore, setHasMore] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const loadMorePosts = useCallback(() => {
    // Simulate loading more posts
    const newPost: EnhancedPost = {
      id: `post-${posts.length + 1}`,
      userId: `user-${Math.floor(Math.random() * 100)}`,
      authorDisplayName: `User ${Math.floor(Math.random() * 100)}`,
      authorUsername: `user${Math.floor(Math.random() * 100)}`,
      content: `Post #${posts.length + 1} - Keep scrolling to see more amazing content!`,
      mediaAttachments: [],
      hashtags: [],
      mentions: [],
      visibility: 'public',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      isEdited: false,
      stats: {
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 100),
        views: Math.floor(Math.random() * 2000),
        saves: Math.floor(Math.random() * 50),
      },
      type: 'post',
      reactions: [
        { emoji: '❤️', count: Math.floor(Math.random() * 500), hasReacted: false },
        { emoji: '😂', count: Math.floor(Math.random() * 300), hasReacted: false },
      ],
    };

    setPosts(prev => [...prev, newPost]);

    // Stop infinite scroll after 5 posts (demo)
    if (posts.length > 4) {
      setHasMore(false);
    }
  }, [posts.length]);

  const handleReactionClick = (postId: string, emoji: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              reactions: post.reactions?.map(r =>
                r.emoji === emoji
                  ? {
                      ...r,
                      hasReacted: !r.hasReacted,
                      count: r.hasReacted ? r.count - 1 : r.count + 1,
                    }
                  : r,
              ),
            }
          : post,
      ),
    );
    setShowEmojiPicker(null);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'popular') {
      const aTotal =
        (a.reactions?.reduce((sum, r) => sum + r.count, 0) || 0) +
        (a.stats?.comments || 0) +
        (a.stats?.shares || 0);
      const bTotal =
        (b.reactions?.reduce((sum, r) => sum + r.count, 0) || 0) +
        (b.stats?.comments || 0) +
        (b.stats?.shares || 0);
      return bTotal - aTotal;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-amber-950/20 to-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/50 backdrop-blur border-b border-amber-400/20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">🌟 Social Feed</h1>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === 'recent'
                    ? 'bg-amber-600 text-white'
                    : 'bg-black/40 text-amber-100 border border-amber-400/20 hover:border-amber-400/40'
                }`}
              >
                🕐 Recent
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy('popular')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  sortBy === 'popular'
                    ? 'bg-amber-600 text-white'
                    : 'bg-black/40 text-amber-100 border border-amber-400/20 hover:border-amber-400/40'
                }`}
              >
                🔥 Popular
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <InfiniteScroll
          dataLength={sortedPosts.length}
          next={loadMorePosts}
          hasMore={hasMore}
          loader={
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex justify-center py-8"
            >
              <div className="w-8 h-8 border-3 border-amber-400/30 border-t-amber-400 rounded-full" />
            </motion.div>
          }
          endMessage={
            <div className="text-center py-12">
              <p className="text-amber-100/60">No more posts to load 🎉</p>
            </div>
          }
        >
          <AnimatePresence mode="popLayout">
            {sortedPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-black/40 backdrop-blur border border-amber-400/20 rounded-lg p-6 mb-6 hover:border-amber-400/40 transition group"
              >
                {/* Author header */}
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={post.authorProfilePic || 'https://ui-avatars.com/api/?name=User'}
                    alt={post.authorDisplayName}
                    className="w-12 h-12 rounded-full border-2 border-amber-400/40"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{post.authorDisplayName}</h3>
                    <p className="text-amber-100/50 text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition text-amber-400 hover:text-amber-300">
                    ⋯
                  </button>
                </div>

                {/* Content */}
                <p className="text-white mb-4 leading-relaxed">{post.content}</p>

                {/* Media */}
                {post.mediaAttachments.length > 0 && (
                  <div className="grid gap-2 mb-4 rounded-lg overflow-hidden">
                    {post.mediaAttachments.map(media => (
                      <motion.img
                        key={media.id}
                        whileHover={{ scale: 1.02 }}
                        src={media.url}
                        alt="Post media"
                        className="w-full h-auto rounded-lg cursor-pointer"
                      />
                    ))}
                  </div>
                )}

                {/* Reactions */}
                <div className="flex gap-2 mb-4 flex-wrap items-center">
                  {post.reactions?.map(reaction => (
                    <motion.button
                      key={reaction.emoji}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReactionClick(post.id, reaction.emoji)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                        reaction.hasReacted
                          ? 'bg-amber-600 text-white'
                          : 'bg-black/40 border border-amber-400/20 text-amber-100 hover:border-amber-400/40'
                      }`}
                    >
                      {reaction.emoji} {reaction.count}
                    </motion.button>
                  ))}

                  {/* Add reaction button */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setShowEmojiPicker(showEmojiPicker === post.id ? null : post.id)
                      }
                      className="px-3 py-1 rounded-full text-sm font-semibold bg-black/40 border border-amber-400/20 text-amber-100 hover:border-amber-400/40 transition"
                    >
                      ➕
                    </motion.button>
                  </div>
                </div>

                {/* Stats footer */}
                <div className="flex gap-4 pt-4 border-t border-amber-400/10 text-amber-100/60 text-sm">
                  <span>💬 {post.stats?.comments || 0} Comments</span>
                  <span>↗️ {post.stats?.shares || 0} Shares</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </InfiniteScroll>
      </div>
    </main>
  );
}
