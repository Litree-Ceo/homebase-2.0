'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Calendar } from 'lucide-react';

export function EarningsChart() {
  // Sample data for the chart
  const data = [
    { day: 'Mon', earnings: 120 },
    { day: 'Tue', earnings: 180 },
    { day: 'Wed', earnings: 150 },
    { day: 'Thu', earnings: 280 },
    { day: 'Fri', earnings: 220 },
    { day: 'Sat', earnings: 350 },
    { day: 'Sun', earnings: 290 },
  ];

  const maxEarnings = Math.max(...data.map(d => d.earnings));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-lab-purple-500/20">
            <TrendingUp className="w-6 h-6 text-lab-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Earnings Overview</h3>
            <p className="text-white/60 text-sm">Content + Trading combined</p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg 
                           glass text-white/70 hover:text-white transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm">This Week</span>
        </button>
      </div>

      {/* Chart */}
      <div className="h-48 flex items-end gap-4">
        {data.map((item, i) => {
          const height = (item.earnings / maxEarnings) * 100;
          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative group">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="w-full bg-linear-to-t from-lab-purple-600 to-lab-green-500 
                             rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity"
                />
                {/* Tooltip */}
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 
                                bg-white text-black text-xs font-bold px-2 py-1 rounded 
                                opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ${item.earnings}
                </div>
              </div>
              <span className="text-white/50 text-xs">{item.day}</span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
        <div>
          <p className="text-white/50 text-sm mb-1">Content Earnings</p>
          <p className="text-xl font-bold text-white">$890.50</p>
        </div>
        <div>
          <p className="text-white/50 text-sm mb-1">Trading Profits</p>
          <p className="text-xl font-bold text-lab-green-400">$357.20</p>
        </div>
        <div>
          <p className="text-white/50 text-sm mb-1">Total This Week</p>
          <p className="text-xl font-bold text-white">$1,247.70</p>
        </div>
      </div>
    </motion.div>
  );
}
