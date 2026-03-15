import React, { useEffect, useState, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PostCard } from '@/components/social/PostCard';
import { PostComposer } from '@/components/social/PostComposer';
import type { FeedPost, User, Post } from '@/lib/types';

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState(0);

  // Mock current user for development
  const mockUser: User = {
    id: 'user-dev',
    name: 'You',
    email: 'user@litlabs.io',
    avatar: 'https://ui-avatars.com/api/?name=You&background=random',
    followers: 100,
    following: 50,
    createdAt: new Date().toISOString(),
  };

  useEffect(() => {
    setCurrentUser(mockUser);
    fetchFeed();
  }, []);

  const fetchFeed = async (pageNum: number = 0) => {
    try {
      const response = await fetch(`/api/feed?page=${pageNum}&limit=10`);
      const data = await response.json();

      if (pageNum === 0) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }

      setHasMore(data.hasMore ?? true);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMorePosts = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  }, [page]);

  const handlePostCreated = (newPost: Post) => {
    const feedPost: FeedPost = {
      ...newPost,
      author: mockUser,
      userReaction: undefined,
      isFollowing: true,
    };
    setPosts([feedPost, ...posts]);
  };

  const handleReact = async (postId: string, reactionType: string) => {
    console.log(`Reacted to ${postId} with ${reactionType}`);
  };

  const handleComment = async (postId: string, content: string) => {
    console.log(`Commented on ${postId}: ${content}`);
  };

  const handleShare = async (postId: string) => {
    console.log(`Shared ${postId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-amber-950/20 to-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-amber-400/20 py-4">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-black text-amber-400">🏠 HomeBase Feed</h1>
          <p className="text-amber-100/60">Connect. Create. Inspire.</p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Post Composer */}
        {currentUser && <PostComposer userId={currentUser.id} onPostCreated={handlePostCreated} />}

        {/* Infinite Scroll Feed */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-amber-100/60">Loading feed...</p>
          </div>
        )}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-12 space-y-4 mt-8">
            <div className="text-6xl">📭</div>
            <p className="text-amber-100/60">No posts yet. Be the first to share!</p>
          </div>
        )}
        {!isLoading && posts.length > 0 && (
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchMorePosts}
            hasMore={hasMore}
            loader={
              <div className="text-center py-8">
                <p className="text-amber-100/60">Loading more posts...</p>
              </div>
            }
            endMessage={
              <div className="text-center py-8">
                <p className="text-amber-100/60">You've reached the end of your feed</p>
              </div>
            }
          >
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser!}
                  onReact={handleReact}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </main>
  );
}
