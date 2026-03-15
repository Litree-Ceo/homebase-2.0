'use client';
import { motion } from 'framer-motion';

export const ProfitPilotShowcase = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card p-6 border-l-4 border-lab-green-500"
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lab-green-400 font-bold flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lab-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-lab-green-500"></span>
        </span>
        ProfitPilot Active
      </h3>
    </div>
    <div className="flex items-baseline gap-2">
        <p className="text-4xl font-mono text-white font-bold">+$1,247.50</p>
        <span className="text-sm text-green-400">(+12.4%)</span>
    </div>
    <p className="text-xs text-white/50 mt-1">Current Monthly Yield • Strategy: Conservative</p>
    
    {/* Mini Chart Visualization */}
    <div className="h-16 flex items-end gap-1 mt-4 opacity-50">
        {[40, 65, 50, 80, 55, 90, 70, 85, 95, 100].map((h, i) => (
            <div key={i} className="flex-1 bg-lab-green-500/50 rounded-t-sm" style={{ height: `${h}%` }} />
        ))}
    </div>
  </motion.div>
);
