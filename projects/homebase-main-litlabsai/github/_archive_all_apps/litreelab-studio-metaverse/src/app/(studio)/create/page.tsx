'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Image as ImageIcon, Video, FileText, Mic } from 'lucide-react';

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState('post');

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Create Content</h1>
        <p className="text-white/60 mb-8">Share your ideas with the world</p>

        {/* Content Type Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'post', label: 'Post', icon: FileText },
            { id: 'image', label: 'Image', icon: ImageIcon },
            { id: 'video', label: 'Video', icon: Video },
            { id: 'audio', label: 'Audio', icon: Mic },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-lab-purple-500/20 text-lab-purple-400 border border-lab-purple-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="glass-card p-6">
          <textarea
            placeholder="What's on your mind?"
            className="w-full h-40 bg-transparent text-white placeholder-white/30 
                       resize-none focus:outline-none text-lg"
          />

          {/* AI Assist */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-lab-purple-500/10 border border-lab-purple-500/20 mb-4">
            <Sparkles className="w-5 h-5 text-lab-purple-400" />
            <p className="text-white/70 text-sm">
              AI can help you write, suggest hashtags, or generate images
            </p>
            <button
              className="ml-auto px-4 py-2 rounded-lg bg-lab-purple-500/20 
                               text-lab-purple-400 text-sm font-medium hover:bg-lab-purple-500/30 transition-all"
            >
              Use AI
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all">
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary">Save Draft</button>
              <button className="btn-primary">Publish</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
