'use client';

import { motion } from 'framer-motion';
import { SocialFeed } from '@/components/SocialFeed';


export default function SocialPage() {

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Social Hub</h1>
        <p className="text-white/60">Connect your empire across all platforms</p>
      </motion.div>

      {/* Social Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SocialFeed />
      </motion.div>

      {/* Platform Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
      >
        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold text-blue-400">12.4K</div>
          <div className="text-white/60 text-sm">Facebook Followers</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold text-sky-400">8.9K</div>
          <div className="text-white/60 text-sm">Twitter Followers</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-2xl font-bold text-pink-400">15.2K</div>
          <div className="text-white/60 text-sm">Instagram Followers</div>
        </div>
      </motion.div>
    </div>
  );
}
