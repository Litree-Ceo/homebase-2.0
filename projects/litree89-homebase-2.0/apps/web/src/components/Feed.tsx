'use client';

import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Picker } from 'emoji-mart';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import 'emoji-mart/css/emoji-mart.css';

export interface FeedPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  content: string;
  media?: {
    type: 'image' | 'video';
    url: string;
  }[];
  createdAt: Date;
  reactions: Record<string, number>;
  comments: {
    id: string;
    author: string;
    content: string;
    createdAt: Date;
  }[];
  shares: number;
}

interface FeedProps {
  posts: FeedPost[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
}

interface PostItemProps {
  post: FeedPost;
  onReact?: (postId: string, emoji: string) => void;
  onComment?: (postId: string, text: string) => void;
}

const PostItem: React.FC<PostItemProps> = ({ post, onReact, onComment }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);

  const handleEmojiSelect = (emoji: any) => {
    onReact?.(post.id, emoji.native);
    setShowEmojiPicker(false);
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onComment?.(post.id, newComment);
      setNewComment('');
    }
  };

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-sm">{post.author.name}</h3>
              <p className="text-xs text-muted-foreground">@{post.author.username}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{post.content}</p>

        {/* Media Grid */}
        {post.media && post.media.length > 0 && (
          <div
            className={cn(
              'grid gap-2 rounded-lg overflow-hidden',
              post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
            )}
          >
            {post.media.map(media => (
              <div key={media.url} className="bg-muted h-64 rounded-lg">
                {media.type === 'image' ? (
                  <img src={media.url} alt="Post media" className="w-full h-full object-cover" />
                ) : (
                  <video src={media.url} className="w-full h-full object-cover" controls>
                    <track kind="captions" src="" label="English" default />
                  </video>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-b pb-2">
          {totalReactions > 0 && (
            <span>
              {totalReactions}{' '}
              {Object.entries(post.reactions).map(([emoji, count]) => (
                <span key={emoji} title={`${count} ${emoji}`}>
                  {emoji}
                </span>
              ))}
            </span>
          )}
          {post.comments.length > 0 && <span>{post.comments.length} comments</span>}
          {post.shares > 0 && <span>{post.shares} shares</span>}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 justify-between">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-500"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Heart className="w-4 h-4 mr-2" />
              React
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-10">
                {/* @ts-ignore */}
                <Picker onEmojiSelect={handleEmojiSelect} theme="dark" set="native" />
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-blue-500"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Comment
          </Button>

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t">
            {post.comments.map(comment => (
              <div key={comment.id} className="text-xs space-y-1">
                <p className="font-semibold">{comment.author}</p>
                <p className="text-muted-foreground">{comment.content}</p>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSubmitComment();
                }}
                className="flex-1 px-2 py-1 rounded text-xs border border-input"
              />
              <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()}>
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const Feed: React.FC<FeedProps> = ({ posts, hasMore, onLoadMore, isLoading = false }) => {
  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={onLoadMore}
      hasMore={hasMore && !isLoading}
      loader={
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
      endMessage={<p className="text-center text-muted-foreground py-4">No more posts to load</p>}
    >
      <div className="space-y-4">
        {posts.map(post => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default Feed;
