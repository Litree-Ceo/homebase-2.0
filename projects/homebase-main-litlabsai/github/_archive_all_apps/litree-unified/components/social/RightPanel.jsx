'use client';
import { Search, MoreHorizontal } from 'lucide-react';

const TrendingItem = ({ category, title, posts }) => (
  <div className="py-3 px-4 hover:bg-white/5 cursor-pointer transition-colors">
    <div className="flex justify-between items-start">
      <p className="text-xs text-gray-500 font-medium">{category}</p>
      <button className="text-gray-500 hover:text-hc-bright-gold p-1 rounded-full hover:bg-hc-bright-gold/10 transition-colors">
        <MoreHorizontal size={14} />
      </button>
    </div>
    <p className="font-bold text-sm text-white mt-0.5">{title}</p>
    <p className="text-xs text-gray-500 mt-0.5">{posts} posts</p>
  </div>
);

const FollowSuggestion = ({ name, handle, avatar }) => (
  <div className="flex items-center gap-3 py-3 px-4 hover:bg-white/5 cursor-pointer transition-colors">
    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-linear-to-tr from-hc-purple to-black" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-sm text-white truncate hover:underline">{name}</p>
      <p className="text-gray-500 text-xs truncate">@{handle}</p>
    </div>
    <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
      Follow
    </button>
  </div>
);

export default function RightPanel() {
  return (
    <aside className="hidden lg:block w-88 pl-8 py-4 h-screen sticky top-0 overflow-y-auto">
      {/* Search */}
      <div className="sticky top-0 bg-black pb-4 z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search
              className="text-gray-500 group-focus-within:text-hc-bright-gold transition-colors"
              size={18}
            />
          </div>
          <input
            type="text"
            placeholder="Search LiTree"
            className="w-full bg-white/5 border border-transparent focus:border-hc-bright-gold/50 focus:bg-black text-white rounded-full py-2.5 pl-12 pr-4 outline-none transition-all placeholder-gray-500"
          />
        </div>
      </div>

      {/* Premium Upgrade */}
      <div className="bg-black border border-white/10 rounded-2xl p-4 mb-4">
        <h3 className="font-black text-lg mb-2">Subscribe to Premium</h3>
        <p className="text-sm text-gray-400 mb-4">
          Subscribe to unlock new features and get verified.
        </p>
        <button className="bg-hc-bright-gold text-black font-black rounded-full px-5 py-2 hover:bg-white transition-colors">
          Subscribe
        </button>
      </div>

      {/* Trending */}
      <div className="bg-black border border-white/10 rounded-2xl overflow-hidden mb-4">
        <h3 className="font-black text-lg px-4 py-3">Trends for you</h3>
        <TrendingItem category="Technology · Trending" title="#FlashCortex" posts="12.4K" />
        <TrendingItem category="Design · Trending" title="Glassmorphism" posts="8.2K" />
        <TrendingItem category="Music · Trending" title="LiTree Beats" posts="5.1K" />
        <TrendingItem category="Business · Trending" title="$LIT" posts="2.3K" />
        <div className="p-4 hover:bg-white/5 cursor-pointer transition-colors text-hc-bright-gold text-sm">
          Show more
        </div>
      </div>

      {/* Who to follow */}
      <div className="bg-black border border-white/10 rounded-2xl overflow-hidden">
        <h3 className="font-black text-lg px-4 py-3">Who to follow</h3>
        <FollowSuggestion name="NVIDIA AI" handle="nvidia_ai" />
        <FollowSuggestion name="OpenAI" handle="openai" />
        <FollowSuggestion name="LiTree Admin" handle="admin_core" />
        <div className="p-4 hover:bg-white/5 cursor-pointer transition-colors text-hc-bright-gold text-sm">
          Show more
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
        <a href="#" className="hover:underline">
          Terms of Service
        </a>
        <a href="#" className="hover:underline">
          Privacy Policy
        </a>
        <a href="#" className="hover:underline">
          Cookie Policy
        </a>
        <a href="#" className="hover:underline">
          Accessibility
        </a>
        <a href="#" className="hover:underline">
          Ads info
        </a>
        <span>© 2026 LiTreeLab'Studio™</span>
      </div>
    </aside>
  );
}
