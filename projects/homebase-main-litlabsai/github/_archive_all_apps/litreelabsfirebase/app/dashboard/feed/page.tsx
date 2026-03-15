'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, 
  Image, Video, Smile, Send, ThumbsUp, Flame, PartyPopper,
  Skull, Laugh, AlertCircle, Zap, Star, Crown, Gift, Rocket,
  TrendingUp, Users, Globe, Lock, Clock, CheckCircle2
} from 'lucide-react';

type Reaction = {
  type: 'like' | 'love' | 'fire' | 'laugh' | 'skull' | 'party' | 'rocket';
  count: number;
  reacted: boolean;
};

type Post = {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    badge?: string;
  };
  content: string;
  media?: { type: 'image' | 'video'; url: string }[];
  timestamp: string;
  reactions: Reaction[];
  comments: number;
  shares: number;
  saved: boolean;
  visibility: 'public' | 'friends' | 'private';
};

const REACTION_ICONS = {
  like: { icon: ThumbsUp, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  love: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/20' },
  fire: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  laugh: { icon: Laugh, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  skull: { icon: Skull, color: 'text-gray-400', bg: 'bg-gray-500/20' },
  party: { icon: PartyPopper, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  rocket: { icon: Rocket, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
};

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: {
      name: 'LitLabs Official',
      username: '@litlabs',
      avatar: '🔥',
      verified: true,
      badge: '👑',
    },
    content: '🚀 MASSIVE UPDATE INCOMING!\n\nWe just shipped the biggest update in LitLabs history:\n\n✅ Terminal Interface with Matrix mode\n✅ Full crypto wallet integration\n✅ AI-powered content generation\n✅ Real-time messaging\n✅ Media center with streaming\n\nThis is just the beginning. #LitLabsUltra #BuildInPublic',
    timestamp: '2 hours ago',
    reactions: [
      { type: 'fire', count: 847, reacted: false },
      { type: 'rocket', count: 423, reacted: true },
      { type: 'love', count: 312, reacted: false },
    ],
    comments: 156,
    shares: 89,
    saved: false,
    visibility: 'public',
  },
  {
    id: '2',
    author: {
      name: 'CryptoWhale',
      username: '@whale_watching',
      avatar: '🐋',
      verified: true,
    },
    content: 'Just mined 10,000 LITBIT using the new terminal interface. The Matrix mode is absolutely insane! 💎⛏️\n\nAnyone else getting crazy hash rates?',
    media: [{ type: 'image', url: '/placeholder-chart.png' }],
    timestamp: '4 hours ago',
    reactions: [
      { type: 'like', count: 234, reacted: false },
      { type: 'fire', count: 156, reacted: false },
    ],
    comments: 67,
    shares: 23,
    saved: true,
    visibility: 'public',
  },
  {
    id: '3',
    author: {
      name: 'DevMode Sarah',
      username: '@sarah_codes',
      avatar: '👩‍💻',
      verified: false,
      badge: '⭐',
    },
    content: 'The new API is chef\'s kiss 👨‍🍳💋\n\nBuilt a custom bot in 20 minutes using the LitLabs SDK. Documentation is actually good for once!\n\n```typescript\nconst bot = new LitBot({\n  name: "AutoTrader",\n  triggers: ["$BTC", "$ETH"],\n  actions: ["analyze", "alert"]\n});\n```',
    timestamp: '6 hours ago',
    reactions: [
      { type: 'like', count: 89, reacted: true },
      { type: 'party', count: 45, reacted: false },
    ],
    comments: 34,
    shares: 12,
    saved: false,
    visibility: 'friends',
  },
];

const TRENDING_TOPICS = [
  { tag: '#LitLabsUltra', posts: '12.4K' },
  { tag: '#CryptoMining', posts: '8.7K' },
  { tag: '#BuildInPublic', posts: '6.2K' },
  { tag: '#Web3Gaming', posts: '4.8K' },
  { tag: '#AITools', posts: '3.9K' },
];

const SUGGESTED_USERS = [
  { name: 'TechGuru Mike', username: '@miketheguru', avatar: '🧙‍♂️', followers: '45.2K' },
  { name: 'AI Artist', username: '@ai_creates', avatar: '🎨', followers: '23.1K' },
  { name: 'Crypto Queen', username: '@queenofcrypto', avatar: '👸', followers: '67.8K' },
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [newPost, setNewPost] = useState('');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'foryou' | 'following' | 'trending'>('foryou');

  const handleReaction = (postId: string, reactionType: Reaction['type']) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          reactions: post.reactions.map(r => 
            r.type === reactionType 
              ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
              : r
          ),
        };
      }
      return post;
    }));
    setShowReactions(null);
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    
    const post: Post = {
      id: Date.now().toString(),
      author: {
        name: 'You',
        username: '@you',
        avatar: '😎',
        verified: false,
      },
      content: newPost,
      timestamp: 'Just now',
      reactions: [
        { type: 'like', count: 0, reacted: false },
        { type: 'fire', count: 0, reacted: false },
      ],
      comments: 0,
      shares: 0,
      saved: false,
      visibility: 'public',
    };
    
    setPosts([post, ...posts]);
    setNewPost('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 p-4"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-xl">
                😎
              </div>
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's happening in your world?"
                  className="w-full bg-transparent text-white placeholder-white/40 resize-none outline-none min-h-[80px]"
                />
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Add Image">
                      <Image className="w-5 h-5 text-pink-400" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Add Video">
                      <Video className="w-5 h-5 text-purple-400" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Add Emoji">
                      <Smile className="w-5 h-5 text-yellow-400" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Add GIF">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </button>
                  </div>
                  <button
                    onClick={handlePost}
                    disabled={!newPost.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Post
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feed Tabs */}
          <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl">
            {(['foryou', 'following', 'trending'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'foryou' ? '✨ For You' : tab === 'following' ? '👥 Following' : '🔥 Trending'}
              </button>
            ))}
          </div>

          {/* Posts */}
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition"
              >
                {/* Post Header */}
                <div className="p-4 flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl border-2 border-white/10">
                      {post.author.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{post.author.name}</span>
                        {post.author.verified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        )}
                        {post.author.badge && (
                          <span className="text-sm">{post.author.badge}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <span>{post.author.username}</span>
                        <span>·</span>
                        <Clock className="w-3 h-3" />
                        <span>{post.timestamp}</span>
                        <span>·</span>
                        {post.visibility === 'public' ? (
                          <Globe className="w-3 h-3" />
                        ) : post.visibility === 'friends' ? (
                          <Users className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition" title="More">
                    <MoreHorizontal className="w-5 h-5 text-white/50" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-4">
                  <p className="text-white/90 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Media */}
                {post.media && post.media.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="rounded-xl overflow-hidden bg-slate-700/50 aspect-video flex items-center justify-center">
                      <span className="text-white/30">📊 Media Preview</span>
                    </div>
                  </div>
                )}

                {/* Reactions Summary */}
                <div className="px-4 pb-2 flex items-center justify-between text-sm text-white/50">
                  <div className="flex items-center gap-1">
                    {post.reactions.filter(r => r.count > 0).slice(0, 3).map((r, i) => {
                      const ReactionIcon = REACTION_ICONS[r.type].icon;
                      return (
                        <span key={r.type} className={`${i > 0 ? '-ml-1' : ''}`}>
                          <ReactionIcon className={`w-4 h-4 ${REACTION_ICONS[r.type].color}`} />
                        </span>
                      );
                    })}
                    <span className="ml-1">
                      {post.reactions.reduce((sum, r) => sum + r.count, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span>{post.comments} comments</span>
                    <span>{post.shares} shares</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-white/10 p-2 flex items-center justify-between">
                  <div className="relative flex-1">
                    <button
                      onMouseEnter={() => setShowReactions(post.id)}
                      onMouseLeave={() => setShowReactions(null)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition w-full justify-center ${
                        post.reactions.some(r => r.reacted)
                          ? 'text-pink-400 bg-pink-500/10'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Heart className="w-5 h-5" fill={post.reactions.some(r => r.reacted) ? 'currentColor' : 'none'} />
                      <span className="text-sm font-medium">React</span>
                    </button>

                    {/* Reaction Picker */}
                    <AnimatePresence>
                      {showReactions === post.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          onMouseEnter={() => setShowReactions(post.id)}
                          onMouseLeave={() => setShowReactions(null)}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 rounded-full border border-white/20 p-2 flex gap-1 shadow-xl"
                        >
                          {Object.entries(REACTION_ICONS).map(([type, config]) => {
                            const Icon = config.icon;
                            const reaction = post.reactions.find(r => r.type === type);
                            return (
                              <motion.button
                                key={type}
                                whileHover={{ scale: 1.3 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleReaction(post.id, type as Reaction['type'])}
                                className={`p-2 rounded-full transition ${
                                  reaction?.reacted ? config.bg : 'hover:bg-white/10'
                                }`}
                                title={type}
                              >
                                <Icon className={`w-5 h-5 ${config.color}`} />
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition flex-1 justify-center">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Comment</span>
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition flex-1 justify-center">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Share</span>
                  </button>

                  <button
                    onClick={() => setPosts(posts.map(p => 
                      p.id === post.id ? { ...p, saved: !p.saved } : p
                    ))}
                    className={`p-2 rounded-lg transition ${
                      post.saved ? 'text-yellow-400 bg-yellow-500/10' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                    title="Save"
                  >
                    <Bookmark className="w-5 h-5" fill={post.saved ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 p-4"
          >
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              Trending Now
            </h3>
            <div className="space-y-3">
              {TRENDING_TOPICS.map((topic, i) => (
                <div key={topic.tag} className="flex items-center justify-between group cursor-pointer">
                  <div>
                    <p className="text-white/50 text-xs">#{i + 1} Trending</p>
                    <p className="text-white font-medium group-hover:text-pink-400 transition">{topic.tag}</p>
                    <p className="text-white/40 text-xs">{topic.posts} posts</p>
                  </div>
                  <button className="p-1 opacity-0 group-hover:opacity-100 transition" title="More">
                    <MoreHorizontal className="w-4 h-4 text-white/50" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Suggested Users */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 p-4"
          >
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Who to Follow
            </h3>
            <div className="space-y-4">
              {SUGGESTED_USERS.map((user) => (
                <div key={user.username} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <p className="text-white/50 text-sm truncate">{user.username} · {user.followers}</p>
                  </div>
                  <button className="px-3 py-1 bg-white text-black rounded-full text-xs font-bold hover:bg-white/90 transition">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 p-4"
          >
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400 text-sm font-medium hover:bg-pink-500/20 transition">
                🎯 Daily Mission
              </button>
              <button className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition">
                🎁 Claim Reward
              </button>
              <button className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition">
                ⚡ Go Live
              </button>
              <button className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm font-medium hover:bg-yellow-500/20 transition">
                👥 Find Friends
              </button>
            </div>
          </motion.div>

          {/* Footer */}
          <div className="text-xs text-white/30 space-x-2">
            <a href="#" className="hover:underline">Terms</a>
            <span>·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:underline">Help</a>
            <span>·</span>
            <span>© 2024 LitLabs</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
