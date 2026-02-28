import React from 'react';

export function GameCard({ game }) {
  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-500 rounded-t-lg overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xl">{game.platform[0]}</span>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 text-white font-semibold text-sm">
          {game.genre}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{game.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {game.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{game.releaseYear}</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{game.rating}</span>
            <span className="text-yellow-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 15l-3.873 1.763-.994-3.583-2.873-2.487 1.251-1.882L4 6.247l3.588-1.051L10 0l2.412 5.196 3.588 1.051-4.748 4.326 1.251 1.882-2.873 2.487-.994 3.583L10 15z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameCard;