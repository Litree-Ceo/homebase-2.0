'use client';

import { motion } from 'framer-motion';
import { Folder, FileText, Image, Video, MoreVertical, Grid, List } from 'lucide-react';
import { useState } from 'react';

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Files</h1>
            <p className="text-white/60">Manage your content assets</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'All Files', count: 248, icon: Folder, color: 'lab-purple' },
            { label: 'Images', count: 120, icon: Image, color: 'blue' },
            { label: 'Videos', count: 45, icon: Video, color: 'lab-green' },
            { label: 'Documents', count: 83, icon: FileText, color: 'yellow' },
          ].map(category => {
            const colorMap: Record<string, { bg: string; text: string }> = {
              'lab-purple': { bg: 'bg-lab-purple-500/20', text: 'text-lab-purple-400' },
              blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
              'lab-green': { bg: 'bg-lab-green-500/20', text: 'text-lab-green-400' },
              yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
            };
            const styles = colorMap[category.color] || colorMap['lab-purple'];

            return (
              <div
                key={category.label}
                className="glass-card p-4 hover:bg-white/10 transition-all cursor-pointer"
              >
                <div className={`p-3 rounded-lg ${styles.bg} w-fit mb-3`}>
                  <category.icon className={`w-5 h-5 ${styles.text}`} />
                </div>
                <p className="text-2xl font-bold text-white">{category.count}</p>
                <p className="text-white/50 text-sm">{category.label}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Files */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Files</h2>
          <div className="space-y-2">
            {[
              {
                name: 'Trading_Strategy_2026.pdf',
                size: '2.4 MB',
                date: '2 hours ago',
                type: 'pdf',
              },
              { name: 'Metaverse_Preview.png', size: '4.8 MB', date: '5 hours ago', type: 'image' },
              { name: 'Podcast_Episode_12.mp3', size: '45.2 MB', date: '1 day ago', type: 'audio' },
              {
                name: 'Tutorial_Video_Final.mp4',
                size: '234 MB',
                date: '2 days ago',
                type: 'video',
              },
            ].map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <FileText className="w-5 h-5 text-white/50" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-white/50 text-sm">
                      {file.size} • {file.date}
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all">
                  <MoreVertical className="w-4 h-4 text-white/50" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
