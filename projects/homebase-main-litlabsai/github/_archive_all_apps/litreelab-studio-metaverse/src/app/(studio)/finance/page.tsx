'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Activity, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

import { useFinanceData } from '@/lib/finance-service';

export default function FinancePage() {
  const { chartData, assets } = useFinanceData();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="text-lab-green-400" />
            ProfitPilot™
          </h1>
          <p className="text-white/60">AI-Driven Trading & Asset Management</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync Wallets
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-24 h-24 text-lab-purple-500" />
          </div>
          <p className="text-white/60 font-medium mb-1">Total Balance</p>
          <h2 className="text-4xl font-bold text-white mb-2">$42,850.40</h2>
          <div className="flex items-center gap-2 text-lab-green-400 text-sm font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>+12.5% ($4,250.00)</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <p className="text-white/60 font-medium mb-1">24h Profit</p>
          <h2 className="text-4xl font-bold text-white mb-2">$1,240.20</h2>
          <div className="flex items-center gap-2 text-lab-green-400 text-sm font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>+5.2%</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <p className="text-white/60 font-medium mb-1">Active Bot Trades</p>
          <h2 className="text-4xl font-bold text-white mb-2">12</h2>
          <div className="flex items-center gap-2 text-lab-purple-400 text-sm font-medium">
            <Activity className="w-4 h-4" />
            <span>Running efficiently</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="text-xl font-bold text-white mb-6">Portfolio Performance</h3>
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a12', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Assets List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Your Assets</h3>
          <div className="space-y-4">
            {assets.map((asset, i) => (
              <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                    ${asset.symbol === 'BTC' ? 'bg-orange-500' : 
                      asset.symbol === 'ETH' ? 'bg-blue-600' : 
                      asset.symbol === 'LIT' ? 'bg-lab-purple-500' : 'bg-teal-500'
                    }`}
                  >
                    {asset.symbol[0]}
                  </div>
                  <div>
                    <p className="font-bold text-white">{asset.name}</p>
                    <p className="text-xs text-white/50">{asset.balance} {asset.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">${asset.price.toLocaleString()}</p>
                  <p className={`text-xs font-medium ${asset.change >= 0 ? 'text-lab-green-400' : 'text-red-400'}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 transition-all text-sm font-medium">
            View All Assets
          </button>
        </motion.div>
      </div>
    </div>
  );
}
