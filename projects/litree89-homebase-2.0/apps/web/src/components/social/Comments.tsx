'use client';

import React, { useState } from 'react';
import type { Comment, User } from '@/lib/types';

interface CommentsProps {
  postId: string;
  comments: Comment[];
  currentUser: User;
  onAddComment: (content: string) => Promise<void>;
}

export function Comments({ postId, comments, currentUser, onAddComment }: CommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(content);
      setContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 border-t border-amber-400/20 pt-3">
      {/* Comments count */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-amber-100/70 hover:text-amber-100 text-sm font-medium"
      >
        💬 {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </button>

      {/* Comment list */}
      {isOpen && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-black/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <img
                  src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.name}`}
                  alt={comment.author?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-amber-100 font-medium text-sm truncate">{comment.author?.name}</p>
                  <p className="text-amber-100/60 text-xs">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-amber-50 text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comment composer */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <img
          src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}`}
          alt={currentUser.name}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-black/60 border border-amber-400/20 rounded-full px-4 py-2 text-amber-50 placeholder-amber-100/40 focus:outline-none focus:border-amber-400/60 text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 bg-amber-500/20 text-amber-100 rounded-full hover:bg-amber-500/40 disabled:opacity-50 transition-all text-sm font-medium"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
