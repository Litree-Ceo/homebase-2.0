'use client';

/**
 * Enhanced Social Feed Component
 *
 * @workspace Facebook-like feed with media sharing, reactions, comments,
 * and real-time updates via SignalR
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { getConnection, startSignalR } from '@/lib/signalrClient';
import type { Post, MediaAttachment } from '@/types';

interface SocialFeedProps {
  readonly userId?: string; // Filter to specific user's posts
  readonly feedType?: 'home' | 'profile' | 'explore';
}

type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'laugh', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Sad' },
  { type: 'angry', emoji: '😠', label: 'Angry' },
];
const PAGE_SIZE = 20;

// Helper functions for deeply nested operations
const updatePostInList = (posts: Post[], updatedPost: Post): Post[] =>
  posts.map(p => (p.id === updatedPost.id ? updatedPost : p));

const removePostFromList = (posts: Post[], postId: string): Post[] =>
  posts.filter(p => p.id !== postId);

const removeFileFromList = (files: File[], idx: number): File[] =>
  files.filter((_, i) => i !== idx);

export default function SocialFeed({ userId, feedType = 'home' }: SocialFeedProps) {
  const { userProfile, getAccessToken, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [continuationToken, setContinuationToken] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch posts
  const fetchPosts = useCallback(
    async (refresh = false) => {
      try {
        const token = await getAccessToken();
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        params.append('type', feedType);
        params.append('limit', PAGE_SIZE.toString());
        if (refresh) {
          setContinuationToken(null);
        } else if (continuationToken) {
          params.append('continuation', continuationToken);
        }

        const response = await fetch(`/api/posts?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const payload = await response.json();
          const items = Array.isArray(payload) ? payload : payload?.posts;
          const data = Array.isArray(items) ? items : [];
          if (refresh) {
            setPosts(data);
          } else {
            setPosts(prev => [...prev, ...data]);
          }
          const hasMoreFlag =
            typeof payload?.hasMore === 'boolean' ? payload.hasMore : data.length === PAGE_SIZE;
          setHasMore(hasMoreFlag);
          if (typeof payload?.continuation === 'string' && payload.continuation.length > 0) {
            setContinuationToken(payload.continuation);
          } else {
            setContinuationToken(null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, feedType, getAccessToken, continuationToken],
  );

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchPosts(true);
    startSignalR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, feedType]);

  // Real-time updates via SignalR
  useEffect(() => {
    const connection = getConnection();
    if (!connection) return;

    connection.on('NewPost', (post: Post) => {
      if (!userId || post.userId === userId) {
        setPosts(prev => [post, ...prev]);
      }
    });

    connection.on('PostUpdated', (updatedPost: Post) => {
      setPosts(prev => updatePostInList(prev, updatedPost));
    });

    connection.on('PostDeleted', (postId: string) => {
      setPosts(prev => removePostFromList(prev, postId));
    });

    return () => {
      connection.off('NewPost');
      connection.off('PostUpdated');
      connection.off('PostDeleted');
    };
  }, [userId]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchPosts(false);
        }
      },
      { threshold: 0.5 },
    );

    if (lastPostRef.current) {
      observerRef.current.observe(lastPostRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoading, fetchPosts]);

  // Remove media file
  const removeMediaFile = useCallback((idx: number) => {
    setNewPostMedia(prev => removeFileFromList(prev, idx));
  }, []);

  // Create new post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() && newPostMedia.length === 0) return;
    if (!isAuthenticated) return;

    setIsPosting(true);
    try {
      const token = await getAccessToken();
      const formData = new FormData();
      formData.append('content', newPostContent);
      formData.append('visibility', 'public');

      // Add poll if created
      if (showPollCreator && pollOptions.filter(o => o.trim()).length >= 2) {
        formData.append(
          'poll',
          JSON.stringify({
            question: newPostContent,
            options: pollOptions.filter(o => o.trim()),
            allowMultiple: false,
          }),
        );
      }

      // Upload media files
      for (const file of newPostMedia) {
        formData.append('media', file);
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost, ...prev]);
        setNewPostContent('');
        setNewPostMedia([]);
        setShowPollCreator(false);
        setPollOptions(['', '']);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  // Handle reaction
  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    try {
      const token = await getAccessToken();
      await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reaction: reactionType }),
      });

      // Optimistic update
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, stats: { ...p.stats, likes: p.stats.likes + 1 } } : p,
        ),
      );
      setActiveReactionPicker(null);
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  // Submit comment
  const handleSubmitComment = async (postId: string) => {
    const content = commentDrafts[postId]?.trim();
    if (!content) return;

    try {
      const token = await getAccessToken();
      await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      // Update comment count
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } } : p,
        ),
      );
      setCommentDrafts(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewPostMedia(prev => [...prev, ...files].slice(0, 10));
  };

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Poll vote handler
  const handlePollVote = async (postId: string, optionId: string) => {
    try {
      const token = await getAccessToken();
      await fetch(`/api/posts/${postId}/poll/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ optionId }),
      });
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  // Render media attachment
  const renderMedia = (media: MediaAttachment) => {
    switch (media.type) {
      case 'image':
      case 'gif':
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.url}
            alt={media.altText || ''}
            className="max-h-96 w-full rounded-xl object-cover"
          />
        );
      case 'video':
        return (
          <video
            src={media.url}
            poster={media.thumbnailUrl}
            controls
            className="max-h-96 w-full rounded-xl"
          >
            <track kind="captions" srcLang="en" label="English" default />
          </video>
        );
      case 'audio':
        return (
          <div className="rounded-xl bg-amber-400/10 p-4">
            <audio src={media.url} controls className="w-full">
              <track kind="captions" srcLang="en" label="English" default />
            </audio>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      {isAuthenticated && feedType !== 'explore' && (
        <div className="rounded-2xl border border-amber-400/30 bg-black/60 p-4 shadow-lg">
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-amber-400/20">
              {userProfile?.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userProfile.profilePicture}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-bold text-amber-400">
                  {userProfile?.displayName?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder={showPollCreator ? 'Ask a question...' : "What's on your mind?"}
                className="w-full resize-none rounded-xl border border-amber-400/20 bg-black/30 p-3 text-amber-100 placeholder-amber-100/40 focus:border-amber-400 focus:outline-none"
                rows={3}
              />

              {/* Poll Creator */}
              {showPollCreator && (
                <div className="mt-3 space-y-2 rounded-xl border border-amber-400/20 bg-black/20 p-3">
                  {pollOptions.map((opt, idx) => (
                    <input
                      key={`poll-${idx}`}
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOpts = [...pollOptions];
                        newOpts[idx] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="w-full rounded-lg border border-amber-400/20 bg-black/30 px-3 py-2 text-sm text-amber-100 focus:border-amber-400 focus:outline-none"
                    />
                  ))}
                  {pollOptions.length < 6 && (
                    <button
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      className="text-sm text-amber-400 hover:underline"
                    >
                      + Add option
                    </button>
                  )}
                </div>
              )}

              {/* Media Preview */}
              {newPostMedia.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {newPostMedia.map((file, idx) => (
                    <div key={file.name + idx} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <button
                        onClick={() => removeMediaFile(idx)}
                        className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-xs text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,audio/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Upload media files"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-amber-400/10 px-3 py-1.5 text-sm text-amber-100 hover:bg-amber-400/20"
                  >
                    📷 Photo/Video
                  </button>
                  <button
                    onClick={() => setShowPollCreator(!showPollCreator)}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      showPollCreator
                        ? 'bg-amber-400 text-black'
                        : 'bg-amber-400/10 text-amber-100 hover:bg-amber-400/20'
                    }`}
                  >
                    📊 Poll
                  </button>
                  <button className="rounded-lg bg-amber-400/10 px-3 py-1.5 text-sm text-amber-100 hover:bg-amber-400/20">
                    🎬 Watch Party
                  </button>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={isPosting || (!newPostContent.trim() && newPostMedia.length === 0)}
                  className="rounded-full bg-amber-400 px-6 py-1.5 font-medium text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && posts.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        </div>
      )}

      {/* Posts */}
      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastPostRef : undefined}
          className="rounded-2xl border border-amber-400/30 bg-black/60 shadow-lg"
        >
          {/* Post Header */}
          <div className="flex items-start justify-between p-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-amber-400/20">
                {post.authorProfilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.authorProfilePic} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-bold text-amber-400">
                    {post.authorDisplayName.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-100">{post.authorDisplayName}</span>
                  <span className="text-sm text-amber-100/50">@{post.authorUsername}</span>
                </div>
                <span className="text-xs text-amber-100/40">
                  {formatTime(post.createdAt)}
                  {post.isEdited && ' • Edited'}
                </span>
              </div>
            </div>
            <button className="text-amber-100/50 hover:text-amber-100">⋯</button>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            <p className="whitespace-pre-wrap text-amber-100">{post.content}</p>

            {/* Hashtags */}
            {post.hashtags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.hashtags.map(tag => (
                  <span key={tag} className="text-sm text-amber-400 hover:underline">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media Attachments */}
          {post.mediaAttachments.length > 0 && (
            <div
              className={`px-4 pb-4 ${
                post.mediaAttachments.length > 1 ? 'grid grid-cols-2 gap-2' : ''
              }`}
            >
              {post.mediaAttachments.map(media => (
                <div key={media.id}>{renderMedia(media)}</div>
              ))}
            </div>
          )}

          {/* Poll */}
          {post.poll && (
            <div className="mx-4 mb-4 rounded-xl border border-amber-400/20 bg-black/30 p-4">
              <p className="mb-3 font-medium text-amber-100">{post.poll.question}</p>
              <div className="space-y-2">
                {post.poll.options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handlePollVote(post.id, option.id)}
                    className="relative w-full overflow-hidden rounded-lg border border-amber-400/20 bg-black/20 p-2 text-left transition hover:border-amber-400/40"
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-amber-400/20"
                      style={{ width: `${option.percentage}%` }}
                    />
                    <div className="relative flex justify-between">
                      <span className="text-amber-100">{option.text}</span>
                      <span className="text-amber-100/60">{option.percentage}%</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-amber-100/40">{post.poll.totalVotes} votes</p>
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-between border-t border-amber-400/10 px-4 py-2 text-sm text-amber-100/60">
            <span>{post.stats.likes} reactions</span>
            <span>
              {post.stats.comments} comments • {post.stats.shares} shares
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex border-t border-amber-400/10">
            {/* Reaction Button */}
            <div className="relative flex-1">
              <button
                onClick={() =>
                  setActiveReactionPicker(activeReactionPicker === post.id ? null : post.id)
                }
                onMouseEnter={() => setActiveReactionPicker(post.id)}
                className="flex w-full items-center justify-center gap-2 py-3 text-amber-100/70 transition hover:bg-amber-400/10 hover:text-amber-100"
              >
                👍 Like
              </button>

              {/* Reaction Picker */}
              {activeReactionPicker === post.id && (
                <div
                  className="absolute bottom-full left-0 z-10 mb-2 flex gap-1 rounded-full bg-black/95 p-2 shadow-xl"
                  onMouseLeave={() => setActiveReactionPicker(null)}
                >
                  {REACTIONS.map(r => (
                    <button
                      key={r.type}
                      onClick={() => handleReaction(post.id, r.type)}
                      className="transform rounded-full p-2 text-xl transition hover:scale-125 hover:bg-amber-400/20"
                      title={r.label}
                    >
                      {r.emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() =>
                setExpandedComments(prev => {
                  const next = new Set(prev);
                  if (next.has(post.id)) next.delete(post.id);
                  else next.add(post.id);
                  return next;
                })
              }
              className="flex flex-1 items-center justify-center gap-2 py-3 text-amber-100/70 transition hover:bg-amber-400/10 hover:text-amber-100"
            >
              💬 Comment
            </button>

            <button className="flex flex-1 items-center justify-center gap-2 py-3 text-amber-100/70 transition hover:bg-amber-400/10 hover:text-amber-100">
              🔄 Share
            </button>
          </div>

          {/* Comments Section */}
          {expandedComments.has(post.id) && (
            <div className="border-t border-amber-400/10 p-4">
              {/* Comment Input */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={commentDrafts[post.id] || ''}
                  onChange={e =>
                    setCommentDrafts(prev => ({
                      ...prev,
                      [post.id]: e.target.value,
                    }))
                  }
                  onKeyDown={e => e.key === 'Enter' && handleSubmitComment(post.id)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-full border border-amber-400/20 bg-black/30 px-4 py-2 text-sm text-amber-100 placeholder-amber-100/40 focus:border-amber-400 focus:outline-none"
                />
                <button
                  onClick={() => handleSubmitComment(post.id)}
                  className="rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-black hover:bg-amber-300"
                >
                  Post
                </button>
              </div>

              {/* Comments would be loaded and displayed here */}
              <p className="text-center text-sm text-amber-100/40">Loading comments...</p>
            </div>
          )}
        </div>
      ))}

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => fetchPosts(false)}
            className="rounded-full bg-amber-400/10 px-6 py-2 text-amber-100 hover:bg-amber-400/20"
          >
            Load More
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && posts.length === 0 && (
        <div className="rounded-2xl border border-amber-400/20 bg-black/40 p-12 text-center">
          <div className="mb-4 text-5xl">📝</div>
          <h3 className="mb-2 text-lg font-medium text-amber-100">No posts yet</h3>
          <p className="text-amber-100/60">
            {feedType === 'home'
              ? 'Follow people to see their posts here'
              : 'Be the first to post something!'}
          </p>
        </div>
      )}
    </div>
  );
}
