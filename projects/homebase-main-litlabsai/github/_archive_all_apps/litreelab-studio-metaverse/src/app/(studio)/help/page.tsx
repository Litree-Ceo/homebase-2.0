'use client';

import { motion } from 'framer-motion';

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-white">Help & Support</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Documentation</h2>
          <p className="text-white/60 mb-4">Read the full guide on how to use the Studio and Metaverse.</p>
          <button className="btn-secondary w-full">View Docs</button>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Contact Support</h2>
          <p className="text-white/60 mb-4">Need help? Reach out to our support team.</p>
          <button className="btn-primary w-full">Contact Us</button>
        </div>
      </div>
    </div>
  );
}
