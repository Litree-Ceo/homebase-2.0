'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Image as ImageIcon,
  Smile,
  Globe,
} from 'lucide-react';
import { useSocialFeed, type SocialPost } from '@/lib/social-service';
import { formatDistanceToNow } from 'date-fns';

export function SocialFeed() {
  const { posts, loading, error, addPost, likePost } = useSocialFeed();
  const [newPost, setNewPost] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const handleLike = (id: string) => {
    likePost(id);
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    try {
      await addPost(newPost, mediaFile || undefined);
      setNewPost('');
      setMediaFile(null);
    } catch (e) {
      console.error('Failed to post', e);
      alert('Failed to post. Please try again.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-900 rounded-xl p-6 animate-pulse border border-gray-800">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-700 rounded w-1/4" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-700 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-900 rounded-xl text-red-200">
        Failed to load social feed. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Input */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 shadow-lg" role="region" aria-label="Create post">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold">You</span>
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-gray-800 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-24"
              aria-label="Create post content"
              aria-describedby="post-button"
            />
            {mediaFile && (
                <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {mediaFile.name}
                    <button onClick={() => setMediaFile(null)} className="text-red-400 hover:text-red-300 ml-2">Remove</button>
                </div>
            )}
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2" role="toolbar" aria-label="Post formatting options">
                <label
                  className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                  aria-label="Add image"
                >
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
                  <ImageIcon className="w-5 h-5" />
                </label>
                <button
                  className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Add location"
                >
                  <Globe className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handlePost}
                disabled={!newPost.trim() && !mediaFile}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                id="post-button"
                aria-label="Post content"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        <AnimatePresence>
          {posts.map((post) => {
             // Handle Firestore timestamp or fallbacks
             let timeDisplay = 'Just now';
             try {
                if (post.timestamp) {
                   if ('seconds' in post.timestamp) {
                      // Firestore Timestamp
                      timeDisplay = formatDistanceToNow(new Date(post.timestamp.seconds * 1000), { addSuffix: true });
                   } else if (typeof post.timestamp === 'number') {
                      // Unix timestamp (ms) - fallback for some mock data
                      timeDisplay = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });
                   } else if (typeof post.timestamp === 'string') {
                      // ISO string or formatted string
                      const parsed = Date.parse(post.timestamp);
                      if (!isNaN(parsed)) {
                          timeDisplay = formatDistanceToNow(new Date(parsed), { addSuffix: true });
                      } else {
                          timeDisplay = post.timestamp;
                      }
                   }
                }
             } catch (e) {
                 console.warn('Date parsing error', e);
                 timeDisplay = 'Recently';
             }

             return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <img
                      src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full bg-gray-700"
                    />
                    <div>
                      <h3 className="font-bold text-white">{post.author.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{post.author.username}</span>
                        <span>•</span>
                        <span>{timeDisplay}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

                {post.media && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-gray-800">
                    {post.media.type === 'image' && (
                      <img
                        src={post.media.url}
                        alt="Post attachment"
                        className="w-full h-auto object-cover max-h-96"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors group"
                  >
                    <Heart className="w-5 h-5 group-hover:fill-pink-500" />
                    <span>{post.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>{post.shares || 0}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
