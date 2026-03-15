'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize,
  Film, Tv, Music, Radio, Podcast, Search, ChevronRight, Star,
  Clock, Heart, Plus, Download, Share2, MoreHorizontal, Shuffle,
  Repeat, ListMusic, Users, Wifi, Settings, Grid, List, Filter
} from 'lucide-react';

type MediaItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type: 'movie' | 'tv' | 'music' | 'podcast' | 'live';
  rating?: number;
  year?: number;
  duration?: string;
  progress?: number;
};

type Category = {
  id: string;
  name: string;
  icon: React.ElementType;
  gradient: string;
};

const CATEGORIES: Category[] = [
  { id: 'movies', name: 'Movies', icon: Film, gradient: 'from-red-500 to-orange-500' },
  { id: 'tv', name: 'TV Shows', icon: Tv, gradient: 'from-blue-500 to-purple-500' },
  { id: 'music', name: 'Music', icon: Music, gradient: 'from-green-500 to-emerald-500' },
  { id: 'podcasts', name: 'Podcasts', icon: Podcast, gradient: 'from-purple-500 to-pink-500' },
  { id: 'live', name: 'Live TV', icon: Radio, gradient: 'from-pink-500 to-red-500' },
];

const FEATURED: MediaItem = {
  id: '0',
  title: 'The Matrix: Resurrections',
  subtitle: 'Return to the source',
  image: '🎬',
  type: 'movie',
  rating: 8.5,
  year: 2024,
  duration: '2h 28m',
};

const CONTINUE_WATCHING: MediaItem[] = [
  { id: '1', title: 'Mr. Robot', subtitle: 'S4 E10', image: '🤖', type: 'tv', progress: 65, duration: '45m' },
  { id: '2', title: 'Blade Runner 2049', subtitle: 'Sci-Fi', image: '🌃', type: 'movie', progress: 40, duration: '2h 44m' },
  { id: '3', title: 'Dark', subtitle: 'S3 E8', image: '⏰', type: 'tv', progress: 80, duration: '1h 2m' },
  { id: '4', title: 'Dune: Part Two', subtitle: 'Epic', image: '🏜️', type: 'movie', progress: 25, duration: '2h 46m' },
];

const TRENDING_MOVIES: MediaItem[] = [
  { id: '5', title: 'Oppenheimer', subtitle: 'Biography', image: '💣', type: 'movie', rating: 9.2, year: 2023 },
  { id: '6', title: 'Interstellar', subtitle: 'Sci-Fi', image: '🌌', type: 'movie', rating: 9.5, year: 2014 },
  { id: '7', title: 'Inception', subtitle: 'Thriller', image: '💭', type: 'movie', rating: 9.3, year: 2010 },
  { id: '8', title: 'The Dark Knight', subtitle: 'Action', image: '🦇', type: 'movie', rating: 9.8, year: 2008 },
  { id: '9', title: 'Tenet', subtitle: 'Sci-Fi', image: '⏪', type: 'movie', rating: 8.7, year: 2020 },
];

const TOP_TV: MediaItem[] = [
  { id: '10', title: 'Breaking Bad', subtitle: '5 Seasons', image: '🧪', type: 'tv', rating: 9.9 },
  { id: '11', title: 'Severance', subtitle: '2 Seasons', image: '🧠', type: 'tv', rating: 9.1 },
  { id: '12', title: 'The Last of Us', subtitle: '1 Season', image: '🍄', type: 'tv', rating: 9.4 },
  { id: '13', title: 'Succession', subtitle: '4 Seasons', image: '💰', type: 'tv', rating: 9.2 },
  { id: '14', title: 'House of Dragon', subtitle: '2 Seasons', image: '🐉', type: 'tv', rating: 8.9 },
];

const LIVE_CHANNELS = [
  { id: '20', name: 'Tech News 24/7', viewers: '12.4K', image: '📺', status: 'live' },
  { id: '21', name: 'Crypto Markets', viewers: '8.7K', image: '📊', status: 'live' },
  { id: '22', name: 'Gaming Central', viewers: '45.2K', image: '🎮', status: 'live' },
  { id: '23', name: 'Music Vibes', viewers: '23.1K', image: '🎵', status: 'live' },
];

const PLAYLISTS = [
  { id: '30', name: 'Coding Flow', tracks: 47, duration: '3h 12m', image: '💻' },
  { id: '31', name: 'Night Drive', tracks: 32, duration: '2h 8m', image: '🌙' },
  { id: '32', name: 'Focus Mode', tracks: 55, duration: '4h 20m', image: '🎯' },
  { id: '33', name: 'Workout Beast', tracks: 28, duration: '1h 45m', image: '💪' },
];

export default function MediaPage() {
  const [activeCategory, setActiveCategory] = useState('movies');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, shows, music..."
              className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pink-500 transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-pink-500/20 text-pink-400' : 'text-white/50 hover:text-white'}`}
              title="Grid View"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-pink-500/20 text-pink-400' : 'text-white/50 hover:text-white'}`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg text-white/50 hover:text-white transition" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition whitespace-nowrap ${
                  activeCategory === cat.id
                    ? `bg-gradient-to-r ${cat.gradient} border-transparent`
                    : 'bg-slate-800/80 border-white/10 hover:border-white/20'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="font-semibold">{cat.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Featured Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-green-900/50 via-slate-900 to-cyan-900/50 border border-white/10"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.3),transparent_50%)]" />
          
          {/* Featured Content */}
          <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-pink-500 rounded-full text-xs font-bold">FEATURED</span>
              <span className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                {FEATURED.rating}
              </span>
              <span className="text-white/50">{FEATURED.year}</span>
              <span className="text-white/50">{FEATURED.duration}</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-2">{FEATURED.title}</h1>
            <p className="text-xl text-white/70 mb-6">{FEATURED.subtitle}</p>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition">
                <Play className="w-6 h-6 fill-current" />
                Play Now
              </button>
              <button className="flex items-center gap-2 px-6 py-4 bg-white/20 rounded-xl font-semibold hover:bg-white/30 transition">
                <Plus className="w-5 h-5" />
                My List
              </button>
              <button className="p-4 bg-white/10 rounded-xl hover:bg-white/20 transition" title="More Info">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Featured Emoji/Poster */}
          <div className="absolute right-8 bottom-8 text-[200px] opacity-20">
            {FEATURED.image}
          </div>
        </motion.div>

        {/* Continue Watching */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-pink-400" />
              Continue Watching
            </h2>
            <button className="text-pink-400 text-sm font-semibold flex items-center gap-1 hover:text-pink-300 transition">
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CONTINUE_WATCHING.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-slate-800/80 rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition cursor-pointer"
              >
                <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-6xl relative">
                  {item.image}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-bold text-white truncate">{item.title}</p>
                  <p className="text-white/50 text-sm">{item.subtitle}</p>
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending Movies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Film className="w-6 h-6 text-red-400" />
              Trending Movies
            </h2>
            <button className="text-pink-400 text-sm font-semibold flex items-center gap-1 hover:text-pink-300 transition">
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TRENDING_MOVIES.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-slate-800/80 rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 hover:scale-105 transition cursor-pointer"
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-6xl">
                  {item.image}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1 text-yellow-400 text-sm mb-1">
                    <Star className="w-3 h-3 fill-current" />
                    {item.rating}
                  </div>
                  <p className="font-bold text-white text-sm truncate">{item.title}</p>
                  <p className="text-white/50 text-xs">{item.year}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top TV Shows */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Tv className="w-6 h-6 text-blue-400" />
              Top TV Shows
            </h2>
            <button className="text-pink-400 text-sm font-semibold flex items-center gap-1 hover:text-pink-300 transition">
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TOP_TV.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-slate-800/80 rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 hover:scale-105 transition cursor-pointer"
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-6xl">
                  {item.image}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1 text-yellow-400 text-sm mb-1">
                    <Star className="w-3 h-3 fill-current" />
                    {item.rating}
                  </div>
                  <p className="font-bold text-white text-sm truncate">{item.title}</p>
                  <p className="text-white/50 text-xs">{item.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Live Channels */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Radio className="w-6 h-6 text-red-500 animate-pulse" />
              Live Now
            </h2>
            <button className="text-pink-400 text-sm font-semibold flex items-center gap-1 hover:text-pink-300 transition">
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LIVE_CHANNELS.map((channel, i) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-slate-800/80 rounded-2xl overflow-hidden border border-white/10 hover:border-red-500/50 transition cursor-pointer"
              >
                <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-6xl relative">
                  {channel.image}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-500 rounded-full text-xs font-bold">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full text-xs">
                    <Users className="w-3 h-3" />
                    {channel.viewers}
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-bold text-white">{channel.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Music Playlists */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Music className="w-6 h-6 text-green-400" />
              Your Playlists
            </h2>
            <button className="text-pink-400 text-sm font-semibold flex items-center gap-1 hover:text-pink-300 transition">
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLAYLISTS.map((playlist, i) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl overflow-hidden border border-white/10 hover:border-green-500/50 transition cursor-pointer p-4"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition">
                  {playlist.image}
                </div>
                <p className="font-bold text-white">{playlist.name}</p>
                <p className="text-white/50 text-sm">{playlist.tracks} tracks · {playlist.duration}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Now Playing Bar */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4 z-40"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {/* Current Track */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl">
                🎵
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate">Blinding Lights</p>
                <p className="text-white/50 text-sm truncate">The Weeknd</p>
              </div>
              <button className="p-2 text-pink-400 hover:text-pink-300 transition" title="Add to favorites">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="flex items-center gap-4">
                <button className="p-2 text-white/50 hover:text-white transition" title="Shuffle">
                  <Shuffle className="w-5 h-5" />
                </button>
                <button className="p-2 text-white hover:text-pink-400 transition" title="Previous">
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-4 bg-white rounded-full text-black hover:scale-105 transition"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                </button>
                <button className="p-2 text-white hover:text-pink-400 transition" title="Next">
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
                <button className="p-2 text-white/50 hover:text-white transition" title="Repeat">
                  <Repeat className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 w-full max-w-md">
                <span className="text-xs text-white/50">1:23</span>
                <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden group cursor-pointer">
                  <div className="h-full w-1/3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full group-hover:from-pink-400 group-hover:to-purple-400" />
                </div>
                <span className="text-xs text-white/50">3:20</span>
              </div>
            </div>

            {/* Volume & Options */}
            <div className="flex items-center gap-4 flex-1 justify-end">
              <button className="p-2 text-white/50 hover:text-white transition" title="Queue">
                <ListMusic className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/50 hover:text-white transition" title="Devices">
                <Wifi className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setVolume(volume > 0 ? 0 : 80)}
                  className="p-2 text-white/50 hover:text-white transition"
                  title={volume > 0 ? 'Mute' : 'Unmute'}
                >
                  {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  title="Volume"
                />
              </div>
              <button className="p-2 text-white/50 hover:text-white transition" title="Fullscreen">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Spacer for fixed bottom bar */}
        <div className="h-24" />
      </div>
    </DashboardLayout>
  );
}
