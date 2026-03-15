'use client';

import { motion } from 'framer-motion';
import { 
  Activity,
  ArrowUpRight,
  Box,
  FileAudio,
  FileImage,
  FileVideo,
  HardDrive,
  MoreHorizontal,
  TrendingUp,
  Users,
  Zap,
  Play,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { LucideIcon } from 'lucide-react';
import { useFirebase } from '@/lib/firebase';
import { userService, UserWallet } from '@/lib/user-service';
import { useCryptoPrices } from '@/lib/crypto-service';
import { useFinanceData } from '@/lib/finance-service';
import { useSound } from '@/lib/sound-context';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/VideoPlayer';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useFirebase();
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const { prices } = useCryptoPrices();
  const { chartData, totalBalance, profitChange } = useFinanceData();
  const { play } = useSound();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      userService.syncUser(user); // Ensure profile exists
      const unsub = userService.subscribeWallet(user.uid, (data) => {
        setWallet(data);
      });
      return () => unsub();
    }
  }, [user]);

  const handleRefresh = () => {
    play('click');
    setIsRefreshing(true);
    toast.info('Syncing blockchain data...');
    setTimeout(() => {
      setIsRefreshing(false);
      play('success');
      toast.success('Dashboard updated');
    }, 1500);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Calculate live net worth if wallet exists, otherwise fallback to finance service mock
  const liveNetWorth = wallet && prices 
    ? (wallet.balance + 
      (wallet.crypto.btc * prices.bitcoin.usd) + 
      (wallet.crypto.eth * prices.ethereum.usd) + 
      (wallet.crypto.sol * prices.solana.usd) + 
      (wallet.crypto.lit * prices.litree.usd))
    : totalBalance;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Welcome back, <span className="text-lab-purple-400">{user?.displayName?.split(' ')[0] || 'Creator'}</span>
          </h1>
          <p className="text-gray-400">Here's what's happening in your studio today.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className={isRefreshing ? "animate-spin text-lab-purple-400" : ""}
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button variant="secondary" onClick={() => play('click')}>Customize Layout</Button>
          <Button onClick={() => play('click')}>New Upload</Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Net Worth" 
          value={`$${liveNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          change={prices ? (prices.bitcoin.usd_24h_change > 0 ? `+${prices.bitcoin.usd_24h_change.toFixed(1)}%` : `${prices.bitcoin.usd_24h_change.toFixed(1)}%`) : "+2.4%"} 
          isPositive={prices ? prices.bitcoin.usd_24h_change > 0 : true}
          icon={Activity}
          color="purple"
        />
        <StatCard 
          title="ProfitPilot Yield" 
          value={`$${(liveNetWorth * 0.12).toLocaleString('en-US', { maximumFractionDigits: 2 })}`} 
          change={`+${profitChange}%`} 
          isPositive={true}
          icon={TrendingUp}
          color="green"
        />
        <StatCard 
          title="Total Assets" 
          value="1,240" 
          change="+12" 
          isPositive={true}
          icon={HardDrive}
          color="blue"
        />
        <StatCard 
          title="Community" 
          value="8.2k" 
          change="-0.5%" 
          isPositive={false}
          icon={Users}
          color="orange"
        />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-lab-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-lab-purple-400" />
                  Revenue Overview
                </h3>
                <p className="text-sm text-gray-400">Portfolio performance over last 7 days</p>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:border-lab-purple-500 transition-colors">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Year to Date</option>
              </select>
            </div>
            
            <div className="h-75 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a12', borderColor: '#ffffff20', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" name="Portfolio Value" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
             <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Upload Media', icon: FileVideo }, 
                  { name: 'Create NFT', icon: Box }, 
                  { name: 'Start Stream', icon: Play }, 
                  { name: 'Deploy Contract', icon: Zap }
                ].map((action, i) => (
                   <button 
                    key={i} 
                    onClick={() => play('click')}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:-translate-y-1 hover:border-lab-purple-500/30 group"
                   >
                      <div className="w-10 h-10 rounded-full bg-lab-purple-500/20 flex items-center justify-center text-lab-purple-400 group-hover:scale-110 transition-transform">
                         <action.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium">{action.name}</span>
                   </button>
                ))}
             </div>
          </div>
        </motion.div>

        {/* Right Sidebar Area */}
        <motion.div variants={item} className="space-y-6">
           {/* Featured Content / Video */}
           <div className="glass-card p-0 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                 <h3 className="font-bold flex items-center gap-2">
                   <Play className="w-4 h-4 text-red-500" />
                   Creator Academy
                 </h3>
                 <span className="text-xs text-lab-purple-400 bg-lab-purple-500/10 px-2 py-0.5 rounded-full">New</span>
              </div>
              <div className="aspect-video w-full bg-black">
                <VideoPlayer 
                  url="https://www.youtube.com/watch?v=LXb3EKWsInQ" // Placeholder
                  className="w-full h-full"
                />
              </div>
              <div className="p-4">
                 <h4 className="font-medium text-sm mb-1">Mastering the Metaverse Economy</h4>
                 <p className="text-xs text-gray-500">Learn how to monetize your 3D assets in LiTreeLab.</p>
              </div>
           </div>

           {/* Recent Files */}
           <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold">Recent Files</h3>
                 <button className="text-xs text-lab-purple-400 hover:text-lab-purple-300">View All</button>
              </div>
              <div className="space-y-3">
                 {[
                    { name: 'Avatar_v2.glb', type: '3D Model', size: '24MB', icon: Box, color: 'text-blue-400' },
                    { name: 'Promo_Video.mp4', type: 'Video', size: '156MB', icon: FileVideo, color: 'text-purple-400' },
                    { name: 'Podcast_Intro.wav', type: 'Audio', size: '4MB', icon: FileAudio, color: 'text-green-400' },
                    { name: 'Banner_Art.png', type: 'Image', size: '2MB', icon: FileImage, color: 'text-orange-400' },
                 ].map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                       <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${file.color}`}>
                          <file.icon className="w-5 h-5" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate group-hover:text-lab-purple-300 transition-colors">{file.name}</h4>
                          <p className="text-xs text-gray-500">{file.type} • {file.size}</p>
                       </div>
                       <button className="p-1.5 rounded hover:bg-white/10 text-gray-400">
                          <MoreHorizontal className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
              </div>
           </div>

           {/* System Status */}
           <div className="glass-card p-6 bg-linear-to-br from-lab-purple-900/20 to-lab-blue-900/20 border-lab-purple-500/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <Zap className="w-5 h-5 text-yellow-400" />
                 System Status
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Storage Usage</span>
                    <span className="text-white">45%</span>
                 </div>
                 <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse-slow" />
                 </div>
                 
                 <div className="flex items-center justify-between text-sm pt-2">
                    <span className="text-gray-400">API Latency</span>
                    <span className="text-green-400">24ms (Good)</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Agent Zero</span>
                    <span className="text-green-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </span>
                 </div>
              </div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  color: 'purple' | 'green' | 'blue' | 'orange';
}

function StatCard({ title, value, change, isPositive, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    purple: 'bg-purple-500/20 text-purple-400 group-hover:text-purple-300',
    green: 'bg-green-500/20 text-green-400 group-hover:text-green-300',
    blue: 'bg-blue-500/20 text-blue-400 group-hover:text-blue-300',
    orange: 'bg-orange-500/20 text-orange-400 group-hover:text-orange-300',
  };

  return (
    <div className="glass-card p-6 hover:border-white/20 transition-all cursor-default group hover:-translate-y-1 duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <h3 className="text-2xl font-display font-bold text-white group-hover:text-glow transition-all">{value}</h3>
      </div>
    </div>
  );
}
