"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { 
  Heart, MessageCircle, Share2, MoreVertical, Image as ImageIcon,
  Video, Smile, MapPin, Users, TrendingUp, Calendar, Bell, 
  Send, Bookmark, Flag, Eye, ThumbsUp, Flame, Rocket,
  Laugh, Lightbulb, Frown, Angry, Sparkles
} from "lucide-react";

interface Post {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  media_urls?: string[];
  media_types?: string[];
  created_at: string;
  reactions_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  privacy: string;
  feeling?: string;
  location?: string;
  user_reaction?: string | null;
}

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
  reactions_count: number;
  replies_count: number;
}

const REACTION_TYPES = [
  { type: "like", icon: ThumbsUp, label: "Like", color: "text-blue-500" },
  { type: "love", icon: Heart, label: "Love", color: "text-red-500" },
  { type: "fire", icon: Flame, label: "Fire", color: "text-orange-500" },
  { type: "rocket", icon: Rocket, label: "Rocket", color: "text-purple-500" },
  { type: "clap", icon: Sparkles, label: "Clap", color: "text-yellow-500" },
  { type: "laugh", icon: Laugh, label: "Laugh", color: "text-green-500" },
  { type: "thinking", icon: Lightbulb, label: "Thinking", color: "text-gray-500" },
  { type: "wow", icon: Sparkles, label: "Wow", color: "text-pink-500" },
];

export default function SocialFeedPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [feeling, setFeeling] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadFeed();
  }, [user, router]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/social/feed");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!postContent.trim()) return;
    
    try {
      const response = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postContent,
          feeling,
          privacy: "public",
        }),
      });

      if (response.ok) {
        setPostContent("");
        setFeeling("");
        loadFeed();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const reactToPost = async (postId: string, reactionType: string) => {
    try {
      const response = await fetch("/api/social/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: "post",
          target_id: postId,
          reaction_type: reactionType,
        }),
      });

      if (response.ok) {
        loadFeed();
        setShowReactions(null);
      }
    } catch (error) {
      console.error("Error reacting to post:", error);
    }
  };

  const loadComments = async (postId: string) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
      return;
    }

    try {
      const response = await fetch(`/api/social/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments({ ...comments, [postId]: data.comments || [] });
        setExpandedComments(postId);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const addComment = async (postId: string) => {
    if (!commentContent.trim()) return;

    try {
      const response = await fetch(`/api/social/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      });

      if (response.ok) {
        setCommentContent("");
        loadComments(postId);
        loadFeed();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const sharePost = async (postId: string) => {
    try {
      const response = await fetch("/api/social/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          share_type: "timeline",
        }),
      });

      if (response.ok) {
        loadFeed();
      }
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Social Feed
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                3
              </span>
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-sm font-bold">{user.displayName?.[0] || "U"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start bg-white/5 hover:bg-white/10">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </Button>
              <Button className="w-full justify-start bg-white/5 hover:bg-white/10">
                <Users className="w-4 h-4 mr-2" />
                Groups
              </Button>
              <Button className="w-full justify-start bg-white/5 hover:bg-white/10">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </Button>
              <Button className="w-full justify-start bg-white/5 hover:bg-white/10">
                <Bookmark className="w-4 h-4 mr-2" />
                Saved
              </Button>
            </div>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Trending Topics</h3>
            <div className="space-y-3">
              {["#AIContent", "#CreatorEconomy", "#Web3", "#NFTs"].map((tag) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className="text-purple-400 font-semibold">{tag}</span>
                  <span className="text-sm text-gray-400">12.5K posts</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold">{user.displayName?.[0] || "U"}</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MapPin className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    onClick={createPost}
                    disabled={!postContent.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Posts Feed */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : posts.length === 0 ? (
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-12 text-center">
              <p className="text-gray-400">No posts yet. Be the first to post!</p>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="bg-black/40 border-white/10 backdrop-blur-xl p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-lg font-bold">{post.user_name?.[0] || "U"}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{post.user_name}</h4>
                      <p className="text-sm text-gray-400">
                        {new Date(post.created_at).toLocaleString()} • {post.privacy}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>

                {/* Post Content */}
                <p className="text-white mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Post Media */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={post.media_urls[0]}
                      alt="Post media"
                      className="w-full object-cover"
                    />
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center gap-4 py-3 border-y border-white/10 text-sm text-gray-400">
                  <span>{post.reactions_count} reactions</span>
                  <span>{post.comments_count} comments</span>
                  <span>{post.shares_count} shares</span>
                  <span className="ml-auto flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.views_count}
                  </span>
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="relative flex-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-center"
                      onMouseEnter={() => setShowReactions(post.id)}
                      onMouseLeave={() => setShowReactions(null)}
                    >
                      <Heart className={post.user_reaction ? "fill-red-500 text-red-500" : ""} />
                      <span className="ml-2">React</span>
                    </Button>
                    {showReactions === post.id && (
                      <div className="absolute bottom-full left-0 mb-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-full px-3 py-2 flex gap-2 z-10">
                        {REACTION_TYPES.map(({ type, icon: Icon, color }) => (
                          <button
                            key={type}
                            onClick={() => reactToPost(post.id, type)}
                            className={`hover:scale-125 transition-transform ${color}`}
                          >
                            <Icon className="w-6 h-6" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => loadComments(post.id)}
                  >
                    <MessageCircle />
                    <span className="ml-2">Comment</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={() => sharePost(post.id)}
                  >
                    <Share2 />
                    <span className="ml-2">Share</span>
                  </Button>
                </div>

                {/* Comments Section */}
                {expandedComments === post.id && (
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-sm font-bold">{user.displayName?.[0] || "U"}</span>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addComment(post.id);
                            }
                          }}
                        />
                        <Button
                          onClick={() => addComment(post.id)}
                          disabled={!commentContent.trim()}
                          size="sm"
                          className="rounded-full"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Comments List */}
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold">{comment.user_name?.[0] || "U"}</span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-white/5 rounded-2xl p-3">
                            <h5 className="font-semibold text-white text-sm">{comment.user_name}</h5>
                            <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 px-3">
                            <button className="hover:text-purple-400">Like</button>
                            <button className="hover:text-purple-400">Reply</button>
                            <span>{new Date(comment.created_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
