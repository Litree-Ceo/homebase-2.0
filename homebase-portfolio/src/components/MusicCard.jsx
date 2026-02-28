import React from 'react';

export function MusicCard({ track }) {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-500 rounded-t-lg overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-bold text-xl">{track.artist[0]}</span>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 text-white font-semibold text-sm">
          {track.genre}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{track.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {track.artist}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{track.year}</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{track.duration}</span>
            <span className="text-green-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicCard;