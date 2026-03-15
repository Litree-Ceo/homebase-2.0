// UserMenu component - Shows login/logout button and user info
import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';

export default function UserMenu() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-amber-400/20 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2 text-sm font-bold uppercase tracking-[0.1em] text-black shadow-glow transition-all hover:shadow-glow-lg hover:scale-[1.02]"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/profile"
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm">
          {user?.name?.[0] || user?.email?.[0] || 'U'}
        </div>
        <span className="text-amber-100 text-sm font-medium hidden md:block">
          {user?.name || user?.email || 'User'}
        </span>
      </Link>
      <button
        className="text-amber-100/60 hover:text-amber-100 text-sm font-medium transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
