/**
 * AuthButton - Smart login/logout button with user menu
 * 
 * @workspace Production-ready auth UI component
 * Features: Auto-detects auth state, dropdown menu, responsive
 */

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export function AuthButton() {
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={login}
        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
          {user?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <span className="hidden sm:inline">{user?.name || 'User'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                setShowMenu(false);
                logout();
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
