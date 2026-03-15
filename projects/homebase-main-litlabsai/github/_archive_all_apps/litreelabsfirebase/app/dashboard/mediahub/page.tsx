'use client';

import React, { useState, useEffect } from 'react';
import { Play, Search, Filter, Clock, Star, Download } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface MediaItem {
  id: string;
  title: string;
  poster: string;
  type: 'movie' | 'series' | 'music' | 'photo';
  progress: number; // 0-100
  duration: number; // in minutes
  source: 'youtube' | 'plex' | 'jellyfin' | 'drive' | 'tmdb';
  rating: number;
}

const SAMPLE_MEDIA: MediaItem[] = [
  {
    id: '1',
    title: 'Inception',
    poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=300',
    type: 'movie',
    progress: 65,
    duration: 148,
    source: 'plex',
    rating: 8.8,
  },
  {
    id: '2',
    title: 'The Matrix',
    poster: 'https://images.unsplash.com/photo-1533613220915-609f21a91335?w=200&h=300',
    type: 'movie',
    progress: 100,
    duration: 136,
    source: 'plex',
    rating: 8.7,
  },
  {
    id: '3',
    title: 'Stranger Things',
    poster: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=200&h=300',
    type: 'series',
    progress: 45,
    duration: 45,
    source: 'jellyfin',
    rating: 8.9,
  },
];

export default function MediaHubPage() {
  const [media] = useState<MediaItem[]>(SAMPLE_MEDIA);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series' | 'music' | 'photo'>('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  if (!isMounted) return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Header */}
        <div className="border-b border-cyan-500/20 bg-black/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
              🎬 MediaHub
            </h1>

            {/* Search & Filters */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={20} />
                  <input
                    type="text"
                    placeholder="Search movies, series, music..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/50 border border-cyan-500/30 rounded-lg pl-10 pr-4 py-2 text-cyan-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-colors flex items-center gap-2 text-cyan-300">
                  <Filter size={20} />
                  Filters
                </button>
              </div>

              {/* Type Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {(['all', 'movie', 'series', 'music', 'photo'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm font-semibold ${
                      filterType === type
                        ? 'bg-cyan-500/30 border border-cyan-500 text-cyan-300'
                        : 'bg-black/50 border border-cyan-500/20 text-gray-300 hover:border-cyan-500/40'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Watching */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center gap-2">
              <Clock size={24} />
              Continue Watching
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia
                .filter((m) => m.progress > 0 && m.progress < 100)
                .map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
            </div>
          </div>

          {/* Trending */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-purple-300 mb-6 flex items-center gap-2">
              <Star size={24} />
              Trending Now
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer relative rounded-lg overflow-hidden"
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="text-white fill-white" size={40} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-300">{item.source}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Library */}
          <div>
            <h2 className="text-2xl font-bold text-green-300 mb-6 flex items-center gap-2">
              <Download size={24} />
              Your Library
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-black/50 border border-cyan-500/10 rounded-lg hover:border-cyan-500/30 transition-colors group cursor-pointer"
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-32 h-48 object-cover rounded group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300">{item.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {item.duration} min
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex-1 max-w-xs bg-gray-700 h-1 rounded-full overflow-hidden">
                          {/* eslint-disable-next-line */}
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{item.progress}%</span>
                      </div>
                      <p className="text-sm text-yellow-400 mt-2">⭐ {item.rating}/10</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded transition-colors text-sm font-semibold text-cyan-300 flex items-center gap-2">
                        <Play size={16} />
                        Play
                      </button>
                      <button className="px-4 py-2 bg-gray-700/20 hover:bg-gray-700/30 border border-gray-600/30 rounded transition-colors text-sm font-semibold text-gray-300">
                        Details
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 py-2">{item.source.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface MediaCardProps {
  item: MediaItem;
}

function MediaCard({ item }: MediaCardProps) {
  return (
    <div className="group cursor-pointer rounded-lg overflow-hidden bg-black/50 border border-cyan-500/10 hover:border-cyan-500/30 transition-colors">
      <div className="relative overflow-hidden h-64">
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="text-white fill-white" size={48} />
        </div>
        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold text-yellow-400">
          ⭐ {item.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-cyan-300 mb-2">{item.title}</h3>
        <div className="space-y-2">
          <div className="bg-gray-700 h-1 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full"
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{item.progress}% watched</span>
            <span>{item.source}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
