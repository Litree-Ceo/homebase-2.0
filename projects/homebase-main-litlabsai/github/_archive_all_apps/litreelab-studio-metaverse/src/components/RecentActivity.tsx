'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, FileText, MessageCircle, ArrowUpRight } from 'lucide-react';

const activities = [
  {
    id: '1',
    type: 'trade',
    title: 'ProfitPilot Trade',
    description: 'BTCUSDT +$45.20',
    time: '2 min ago',
    icon: TrendingUp,
    color: 'lab-green',
    positive: true,
  },
  {
    id: '2',
    type: 'follower',
    title: 'New Follower',
    description: '@crypto_whale started following',
    time: '5 min ago',
    icon: Users,
    color: 'lab-purple',
    positive: true,
  },
  {
    id: '3',
    type: 'content',
    title: 'Post Published',
    description: 'Your article hit 1,000 views',
    time: '12 min ago',
    icon: FileText,
    color: 'blue',
    positive: true,
  },
  {
    id: '4',
    type: 'comment',
    title: 'New Comment',
    description: '@trader_joe commented on your post',
    time: '25 min ago',
    icon: MessageCircle,
    color: 'pink',
    positive: true,
  },
  {
    id: '5',
    type: 'trade',
    title: 'ProfitPilot Trade',
    description: 'ETHUSDT -$12.50',
    time: '42 min ago',
    icon: TrendingUp,
    color: 'red',
    positive: false,
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  'lab-green': { bg: 'bg-lab-green-500/20', text: 'text-lab-green-400' },
  'lab-purple': { bg: 'bg-lab-purple-500/20', text: 'text-lab-purple-400' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        <button
          className="text-lab-purple-400 text-sm hover:text-lab-purple-300 
                           transition-colors flex items-center gap-1"
        >
          View All
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity, i) => {
          const colors = colorMap[activity.color] || colorMap['lab-purple'];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 
                         transition-all cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${colors.bg} shrink-0`}>
                <activity.icon className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{activity.title}</p>
                <p className="text-white/60 text-xs truncate">{activity.description}</p>
                <p className="text-white/40 text-xs mt-1">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
