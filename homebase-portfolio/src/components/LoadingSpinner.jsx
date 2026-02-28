import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center space-x-4">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-gray-600 text-sm">Loading...</span>
    </div>
  );
}

export default LoadingSpinner;