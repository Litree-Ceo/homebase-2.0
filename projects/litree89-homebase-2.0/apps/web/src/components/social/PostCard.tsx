'use client';

import React from 'react';
import { Reactions } from './Reactions';
import { Comments } from './Comments';
import type { FeedPost, User } from '@/lib/types';

interface PostCardProps {
  post: FeedPost;
  currentUser: User;
  onReact: (postId: string, reactionType: string) => Promise<void>;
  onComment: (postId: string, content: string) => Promise<void>;
  onShare: (postId: string) => Promise<void>;
}

export function PostCard({ post, currentUser, onReact, onComment, onShare }: PostCardProps) {
  return (
    <article className="bg-black/40 border border-amber-400/20 rounded-2xl overflow-hidden hover:border-amber-400/40 transition-all">
      {/* Post header */}
      <div className="p-4 border-b border-amber-400/10 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.name}`}
            alt={post.author.name}
            className="w-12 h-12 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-amber-100 font-bold truncate">{post.author.name}</p>
            <p className="text-amber-100/60 text-sm">
              {new Date(post.createdAt).toLocaleDateString()} ·{' '}
              <span className="capitalize">{post.visibility}</span>
            </p>
          </div>
        </div>
        <button className="text-amber-100/60 hover:text-amber-100">⋯</button>
      </div>

      {/* Post content */}
      <div className="p-4 space-y-3">
        {post.content && <p className="text-amber-50 text-base leading-relaxed">{post.content}</p>}

        {/* Media grid */}
        {post.media && post.media.length > 0 && (
          <div
            className={`grid gap-3 ${
              post.media.length === 1
                ? 'grid-cols-1'
                : post.media.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2 md:grid-cols-3'
            }`}
          >
            {post.media.map((media) => (
              <div key={media.id} className="relative group rounded-lg overflow-hidden bg-black/60">
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt="Post media"
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <video
                    src={media.url}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                    controls
                  />
                )}
                {media.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                    <div className="text-4xl">▶️</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2 bg-black/20 border-y border-amber-400/10 text-amber-100/60 text-sm flex justify-between">
        <span>❤️ {post.reactions.length} reactions</span>
        <span>💬 {post.comments.length} comments</span>
        <span>📤 {post.shares} shares</span>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <Reactions
          postId={post.id}
          reactions={post.reactions}
          userReaction={post.userReaction}
          onReact={(type) => onReact(post.id, type)}
        />

        <div className="flex gap-2">
          <button
            onClick={() => onShare(post.id)}
            className="flex-1 px-4 py-2 bg-black/60 border border-amber-400/20 rounded-lg text-amber-100 hover:border-amber-400/60 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <span>📤</span>
            <span>Share</span>
          </button>
        </div>

        <Comments
          postId={post.id}
          comments={post.comments}
          currentUser={currentUser}
          onAddComment={(content) => onComment(post.id, content)}
        />
      </div>
    </article>
  );
}
