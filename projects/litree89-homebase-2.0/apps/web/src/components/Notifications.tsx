'use client';

/**
 * Notifications Component - Activity Feed & Alerts
 *
 * @workspace Displays user activity notifications (likes, comments, follows)
 * with real-time updates and read status tracking
 */

import { useState } from 'react';

type Notification = {
  id: string;
  fromUserId?: string;
  type?: 'like' | 'comment';
  postId?: string;
  read?: boolean;
  timestamp?: Date;
};

const formatTimestamp = (value?: Date): string => {
  if (!value) return 'Just now';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString();
};

export default function Notifications() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const loading = false;
  const error = null;

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold text-gradient mb-4">Notifications</h2>

      {loading && (
        <div className="flex items-center gap-3 text-amber-100/60">
          <div className="w-4 h-4 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
          Loading notifications...
        </div>
      )}
      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">
          Error loading notifications.
        </p>
      )}

      {!loading && notifs?.length === 0 && (
        <div className="text-center py-4">
          <p className="text-2xl mb-2">🔔</p>
          <p className="text-amber-100/60 italic">No notifications yet.</p>
        </div>
      )}

      <div className="space-y-3 mt-2">
        {notifs?.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-all ${
              n.read
                ? 'bg-black/20 border-amber-400/10 text-amber-100/60'
                : 'bg-amber-400/10 border-amber-400/30 text-amber-50 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm">
                  <span className="font-bold text-amber-200">{n.fromUserId ?? 'Someone'}</span>
                  {n.type === 'like' ? ' ❤️ liked ' : ' 💬 commented on '}
                  your post
                </p>
                <p className="text-xs mt-1 opacity-60">{formatTimestamp(n.timestamp)}</p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-amber-400 text-black hover:bg-amber-300 transition-all hover:shadow-glow"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
