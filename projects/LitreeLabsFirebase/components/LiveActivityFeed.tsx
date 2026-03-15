'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface Activity {
  id: string;
  type: 'signup' | 'upgrade' | 'created_content';
  userName: string;
  businessName?: string;
  tier?: string;
  message: string;
  timestamp: number;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!db) return;

    const dbInstance = db;
    const q = query(
      collection(dbInstance, 'activity_log'),
      orderBy('timestamp', 'desc'),
      limit(6)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newActivities = snapshot.docs.map((doc) => {
        const data = doc.data();
        const type = data.type as 'signup' | 'upgrade' | 'created_content';
        
        let message = '';
        if (type === 'signup') {
          message = `${data.userName} just signed up! 🎉`;
        } else if (type === 'upgrade') {
          message = `${data.businessName || data.userName} upgraded to ${data.tier} 💎`;
        } else if (type === 'created_content') {
          message = `${data.userName} created new content 📝`;
        }

        return {
          id: doc.id,
          type,
          userName: data.userName,
          businessName: data.businessName,
          tier: data.tier,
          message,
          timestamp: data.timestamp,
        };
      });

      setActivities(newActivities);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="fixed bottom-24 right-4 w-80 bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden z-40">
      <div className="p-4 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <p className="text-sm font-bold text-white">Live Activity</p>
        </div>
      </div>
      
      <div className="max-h-72 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">
            Waiting for activity...
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="p-3 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors"
            >
              <p className="text-xs text-slate-300">{activity.message}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LiveActivityFeed;
