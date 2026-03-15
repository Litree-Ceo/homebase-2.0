'use client';

import { motion } from 'framer-motion';
import { Package, Plus, Calendar, Users } from 'lucide-react';

export default function DropsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Drops</h1>
            <p className="text-white/60">Schedule and manage your content releases</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Drop
          </button>
        </div>

        {/* Upcoming Drops */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Upcoming</h2>
          <div className="space-y-4">
            {[
              {
                title: 'Exclusive NFT Collection',
                date: 'Feb 15, 2026',
                type: 'NFT Drop',
                subscribers: 1240,
              },
              {
                title: 'Trading Masterclass',
                date: 'Feb 20, 2026',
                type: 'Video Course',
                subscribers: 890,
              },
            ].map((drop, i) => (
              <div key={i} className="flex items-center justify-between p-4 glass rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-lab-purple-500/20">
                    <Package className="w-6 h-6 text-lab-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{drop.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/50 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {drop.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {drop.subscribers} waiting
                      </span>
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-lab-green-500/20 text-lab-green-400 text-sm">
                  {drop.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Past Drops */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Past Drops</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Genesis NFT', sold: 500, revenue: '$12,500' },
              { title: 'Crypto Guide', sold: 1200, revenue: '$24,000' },
              { title: 'Metaverse Pass', sold: 350, revenue: '$17,500' },
            ].map((drop, i) => (
              <div key={i} className="glass p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2">{drop.title}</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">{drop.sold} sold</span>
                  <span className="text-lab-green-400 font-semibold">{drop.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
