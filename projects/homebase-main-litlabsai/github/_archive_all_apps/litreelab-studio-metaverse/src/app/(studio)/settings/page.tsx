'use client';

import { motion } from 'framer-motion';
import { User, Lock, Bell, Palette, Globe, Save, Volume2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useSound } from '@/lib/sound-context';
import { Button } from '@/components/ui/button';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'audio', label: 'Audio & Media', icon: Volume2 },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { isMuted, volume, toggleMute, setVolume, play } = useSound();

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your studio preferences and account</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:w-64 shrink-0"
        >
          <div className="glass-card p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-lab-purple-500/20 text-white border border-lab-purple-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-lab-purple-400' : ''}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 space-y-6"
        >
          {activeTab === 'profile' && (
            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-lab-purple-400" />
                Public Profile
              </h2>
              
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-500 p-0.5 shrink-0">
                  <div className="w-full h-full rounded-[10px] bg-black overflow-hidden relative group">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-xs font-medium text-white">Change</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 text-xs flex items-center gap-1 border-white/10 hover:bg-white/5 hover:text-lab-purple-400">
                    <Wand2 className="w-3 h-3" />
                    AI Gen
                  </Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-white/60">Display Name</label>
                      <input 
                        type="text" 
                        defaultValue="LiTree Creator" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-lab-purple-500/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-white/60">Username</label>
                      <div className="flex">
                        <span className="bg-white/5 border border-r-0 border-white/10 rounded-l-lg px-3 py-2 text-white/40 text-sm flex items-center">
                          @
                        </span>
                        <input 
                          type="text" 
                          defaultValue="litree_master" 
                          className="w-full bg-white/5 border border-white/10 rounded-r-lg px-4 py-2 text-white focus:border-lab-purple-500/50 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/60">Bio</label>
                    <textarea 
                      rows={3}
                      defaultValue="Building the future of the metaverse, one block at a time."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-lab-purple-500/50 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-white/10">
                <button className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-lab-purple-400" />
                Audio & Media Settings
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <p className="font-medium text-white">Master Volume</p>
                    <p className="text-sm text-white/50">Control the global volume for UI effects and ambience.</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-sm font-mono w-8 text-right">{(volume * 100).toFixed(0)}%</span>
                     <input 
                       type="range" 
                       min="0" 
                       max="1" 
                       step="0.05"
                       value={volume}
                       onChange={(e) => {
                         setVolume(parseFloat(e.target.value));
                         if (parseFloat(e.target.value) > 0 && isMuted) toggleMute();
                       }}
                       className="accent-lab-purple-500"
                     />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <p className="font-medium text-white">Sound Effects</p>
                    <p className="text-sm text-white/50">Enable or disable interface clicks and notifications.</p>
                  </div>
                  <Button 
                    variant={isMuted ? "outline" : "default"}
                    onClick={() => {
                       toggleMute();
                       if (isMuted) play('success');
                    }}
                    className={!isMuted ? "bg-lab-purple-600 hover:bg-lab-purple-700" : ""}
                  >
                    {isMuted ? "Muted" : "Enabled"}
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                   <h3 className="font-medium text-white mb-4">Test Audio</h3>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => play('click')}>Click Sound</Button>
                      <Button variant="outline" size="sm" onClick={() => play('success')}>Success</Button>
                      <Button variant="outline" size="sm" onClick={() => play('error')}>Error</Button>
                      <Button variant="outline" size="sm" onClick={() => play('notification')}>Notification</Button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
             <div className="glass-card p-8">
               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <Lock className="w-5 h-5 text-lab-green-400" />
                 Security & Authentication
               </h2>
               <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                   <div>
                     <p className="font-medium text-white">Two-Factor Authentication</p>
                     <p className="text-sm text-white/50">Add an extra layer of security to your account.</p>
                   </div>
                   <button className="px-4 py-2 rounded-lg bg-lab-green-500/20 text-lab-green-400 text-sm font-medium border border-lab-green-500/30">
                     Enabled
                   </button>
                 </div>
                 
                 <div className="space-y-4 pt-4 border-t border-white/10">
                   <h3 className="font-medium text-white">API Keys</h3>
                   <div className="p-4 rounded-lg bg-black/40 border border-white/10 font-mono text-sm text-white/70 flex justify-between items-center">
                     <span>pk_live_51M...x42Z</span>
                     <button className="text-xs text-lab-purple-400 hover:text-lab-purple-300">Copy</button>
                   </div>
                   <button className="text-sm text-lab-purple-400 hover:text-lab-purple-300 font-medium">
                     + Generate New Key
                   </button>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'integrations' && (
            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Connected Apps
              </h2>
              <div className="space-y-4">
                {[
                  { name: 'Discord', status: 'Connected', color: 'bg-indigo-500' },
                  { name: 'Twitter / X', status: 'Not Connected', color: 'bg-black' },
                  { name: 'Coinbase', status: 'Connected', color: 'bg-blue-600' },
                  { name: 'OpenSea', status: 'Not Connected', color: 'bg-blue-400' },
                ].map((app) => (
                  <div key={app.name} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${app.color} flex items-center justify-center`}>
                         <span className="text-white font-bold">{app.name[0]}</span>
                      </div>
                      <span className="font-medium text-white">{app.name}</span>
                    </div>
                    <button className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      app.status === 'Connected' 
                        ? 'bg-white/5 text-white/60 border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30' 
                        : 'bg-white text-black border-white hover:bg-white/90'
                    }`}>
                      {app.status === 'Connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
