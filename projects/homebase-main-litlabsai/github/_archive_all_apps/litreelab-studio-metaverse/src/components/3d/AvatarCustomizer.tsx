'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Palette, X } from 'lucide-react';

const colors = ['#7c3aed', '#22c55e', '#3b82f6', '#ec4899', '#f59e0b', '#ef4444'];

export function AvatarCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="glass-strong p-2 rounded-xl text-white hover:bg-white/20 transition-all"
      >
        <User className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-lab-purple-400" />
                  Customize Avatar
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Avatar Preview */}
              <div className="flex justify-center mb-8">
                <div
                  className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center"
                  style={{ backgroundColor: selectedColor }}
                >
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <p className="text-white/60 text-sm mb-3">Choose Color</p>
                <div className="flex gap-3 justify-center">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        selectedColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => setIsOpen(false)} className="flex-1 btn-primary">
                  Save Changes
                </button>
                <button onClick={() => setIsOpen(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
