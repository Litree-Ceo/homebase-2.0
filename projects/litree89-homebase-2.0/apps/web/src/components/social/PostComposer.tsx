'use client';

import React, { useState } from 'react';
import { MediaUpload } from '@/components/media/MediaUpload';
import type { Post, Media } from '@/lib/types';

interface PostComposerProps {
  userId: string;
  onPostCreated?: (post: Post) => void;
}

export function PostComposer({ userId, onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<Media[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');

  const handleAddMedia = (newMedia: Media) => {
    setMedia([...media, newMedia]);
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMedia(media.filter(m => m.id !== mediaId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && media.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Create post in Cosmos DB
      const newPost: Post = {
        id: `post-${Date.now()}`,
        authorId: userId,
        content: content.trim(),
        media: media,
        reactions: [],
        comments: [],
        shares: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: visibility,
      };

      // Call parent callback
      onPostCreated?.(newPost);

      // Reset form
      setContent('');
      setMedia([]);
      setVisibility('public');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black/40 rounded-2xl border border-amber-400/20 p-6 space-y-4"
    >
      {/* Text input */}
      <div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="w-full bg-black/60 border border-amber-400/20 rounded-lg px-4 py-3 text-amber-50 placeholder-amber-100/40 focus:outline-none focus:border-amber-400/60"
        />
      </div>

      {/* Media preview */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {media.map(m => (
            <div key={m.id} className="relative group rounded-lg overflow-hidden">
              {m.type === 'image' ? (
                <img src={m.url} alt="Preview" className="w-full h-40 object-cover" />
              ) : (
                <video src={m.url} className="w-full h-40 object-cover">
                  <track kind="captions" src="" label="English" default />
                </video>
              )}
              <button
                type="button"
                onClick={() => handleRemoveMedia(m.id)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <span className="text-amber-100 font-bold">Remove</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Media upload */}
      <MediaUpload onMediaAdded={handleAddMedia} />

      {/* Visibility + Submit */}
      <div className="flex items-center justify-between">
        <select
          value={visibility}
          onChange={e => setVisibility(e.target.value as any)}
          aria-label="Post visibility"
          title="Choose who can see this post"
          className="bg-black/60 border border-amber-400/20 rounded-lg px-3 py-2 text-amber-50 focus:outline-none focus:border-amber-400/60"
        >
          <option value="public">🌍 Public</option>
          <option value="followers">👥 Followers Only</option>
          <option value="private">🔒 Private</option>
        </select>

        <button
          type="submit"
          disabled={isSubmitting || (!content.trim() && media.length === 0)}
          className="px-6 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
