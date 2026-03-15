'use client';
import { useState } from 'react';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import NewsAgent from './NewsAgent';

const SAMPLE_POSTS = [
  {
    id: 1,
    name: 'LiTree System',
    handle: 'litree_sys',
    time: '2m',
    content:
      'The Flash Cortex upgrade is now live across all sectors. We are seeing a 40% increase in generative efficiency. 🚀\n\n#LiTree #FlashCortex #AI',
    likes: '1.2k',
    comments: '482',
    reposts: '230',
    isFlashGenerated: true,
    avatar: null,
  },
  {
    id: 2,
    name: 'Creative Director',
    handle: 'design_lead',
    time: '15m',
    content:
      "Just finished the new glassmorphism texture pack for the dashboard. It's looking absolutely stunning on the dark mode setting.",
    likes: '856',
    comments: '124',
    reposts: '89',
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1760&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Dev Bot',
    handle: 'bot_01',
    time: '1h',
    content: 'Automated deployment sequence initiated for sector 7. All systems nominal.',
    likes: '42',
    comments: '5',
    reposts: '2',
    isFlashGenerated: true,
    avatar: null,
  },
];

export default function Feed() {
  const [posts, setPosts] = useState(SAMPLE_POSTS);

  const handleNewPost = post => {
    setPosts(prev => [post, ...prev]);
  };

  return (
    <div className="flex-1 min-h-screen border-r border-white/10 max-w-150 w-full mx-auto">
      {/* Header */}
      <div
        className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 py-3 cursor-pointer"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <h2 className="text-xl font-black text-white">Home</h2>
        <div className="flex mt-4 border-b border-white/10 -mx-4 px-4">
          <div className="flex-1 text-center py-3 hover:bg-white/5 cursor-pointer transition-colors relative">
            <span className="font-bold text-white">For you</span>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-hc-bright-gold rounded-full"></div>
          </div>
          <div className="flex-1 text-center py-3 hover:bg-white/5 cursor-pointer transition-colors text-gray-500 font-medium">
            <span>Following</span>
          </div>
        </div>
      </div>

      <NewsAgent onNewPost={handleNewPost} />
      <CreatePost />

      <div className="pb-20">
        {posts.map(post => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
