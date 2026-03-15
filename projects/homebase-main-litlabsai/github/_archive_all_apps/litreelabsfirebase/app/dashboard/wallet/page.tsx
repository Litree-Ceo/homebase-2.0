'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, Copy, Check,
  TrendingUp, TrendingDown, MoreHorizontal, Send, QrCode, Plus,
  Gem, Coins, Zap, Shield, History, ExternalLink, ChevronRight,
  Sparkles, Award, Lock, Unlock, ArrowRightLeft
} from 'lucide-react';

type Token = {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  balance: number;
  value: number;
  change24h: number;
  color: string;
};

type Transaction = {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'reward';
  token: string;
  amount: number;
  value: number;
  address: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
};

type NFT = {
  id: string;
  name: string;
  collection: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  floorPrice: number;
};

const TOKENS: Token[] = [
  { id: '1', name: 'LitBit', symbol: 'LITBIT', icon: '💎', balance: 12847.00, value: 1284.70, change24h: 8.45, color: 'from-pink-500 to-purple-500' },
  { id: '2', name: 'Ethereum', symbol: 'ETH', icon: '⟠', balance: 2.451, value: 4902.00, change24h: 3.21, color: 'from-blue-500 to-indigo-500' },
  { id: '3', name: 'Bitcoin', symbol: 'BTC', icon: '₿', balance: 0.089, value: 3471.00, change24h: -1.24, color: 'from-orange-500 to-yellow-500' },
  { id: '4', name: 'Solana', symbol: 'SOL', icon: '◎', balance: 45.200, value: 1356.00, change24h: 12.87, color: 'from-purple-500 to-violet-500' },
  { id: '5', name: 'Polygon', symbol: 'MATIC', icon: '🔷', balance: 892.000, value: 892.00, change24h: -2.15, color: 'from-indigo-500 to-purple-500' },
];

const TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'receive', token: 'LITBIT', amount: 500, value: 50.00, address: '0x1234...5678', timestamp: '2 hours ago', status: 'completed' },
  { id: '2', type: 'stake', token: 'ETH', amount: 0.5, value: 1000.00, address: 'Staking Pool', timestamp: '5 hours ago', status: 'completed' },
  { id: '3', type: 'swap', token: 'SOL → LITBIT', amount: 100, value: 30.00, address: 'DEX', timestamp: '1 day ago', status: 'completed' },
  { id: '4', type: 'send', token: 'BTC', amount: 0.01, value: 390.00, address: '0xabcd...efgh', timestamp: '2 days ago', status: 'completed' },
  { id: '5', type: 'reward', token: 'LITBIT', amount: 847, value: 84.70, address: 'Mining Reward', timestamp: '3 days ago', status: 'completed' },
];

const NFTS: NFT[] = [
  { id: '1', name: 'Cyber Punk #847', collection: 'LitLabs Genesis', image: '🤖', rarity: 'legendary', floorPrice: 2.5 },
  { id: '2', name: 'Matrix Agent #042', collection: 'Digital Dreams', image: '👤', rarity: 'epic', floorPrice: 0.8 },
  { id: '3', name: 'Neon City #123', collection: 'Future Worlds', image: '🌃', rarity: 'rare', floorPrice: 0.3 },
  { id: '4', name: 'Code Wizard #999', collection: 'Dev Legends', image: '🧙', rarity: 'common', floorPrice: 0.1 },
];

const STAKING_POOLS = [
  { name: 'LITBIT Staking', apy: 24.5, staked: 5000, rewards: 125.50, lock: '30 days' },
  { name: 'ETH 2.0 Staking', apy: 4.2, staked: 1.0, rewards: 0.042, lock: 'Flexible' },
  { name: 'LP Farming', apy: 89.7, staked: 1000, rewards: 89.70, lock: '7 days' },
];

const RARITY_COLORS = {
  common: 'text-gray-400 border-gray-500/30',
  rare: 'text-blue-400 border-blue-500/30',
  epic: 'text-purple-400 border-purple-500/30',
  legendary: 'text-yellow-400 border-yellow-500/30',
};

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'staking' | 'history'>('tokens');
  const [copied, setCopied] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  const totalBalance = TOKENS.reduce((sum, t) => sum + t.value, 0);
  const totalChange = TOKENS.reduce((sum, t) => sum + (t.value * t.change24h / 100), 0);
  const changePercent = (totalChange / (totalBalance - totalChange)) * 100;

  const copyAddress = () => {
    navigator.clipboard.writeText('0x7B4f...3E9a');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900/50 via-slate-900 to-pink-900/50 rounded-3xl border border-white/10 p-8 relative overflow-hidden"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.15),transparent_50%)]" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/60 text-sm mb-1">Total Portfolio Value</p>
                <h1 className="text-5xl font-black text-white mb-2">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h1>
                <div className={`flex items-center gap-2 ${totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">
                    {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)} ({changePercent.toFixed(2)}%)
                  </span>
                  <span className="text-white/50">24h</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-white/60 text-sm mb-1">Wallet Address</p>
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/15 transition"
                >
                  <span className="font-mono text-white">0x7B4f...3E9a</span>
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/50" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSend(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-semibold hover:opacity-90 transition"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/15 transition">
                <ArrowDownLeft className="w-5 h-5" />
                Receive
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/15 transition">
                <ArrowRightLeft className="w-5 h-5" />
                Swap
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/15 transition">
                <QrCode className="w-5 h-5" />
                QR Code
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl">
          {([
            { id: 'tokens', label: '💰 Tokens', icon: Coins },
            { id: 'nfts', label: '🎨 NFTs', icon: Gem },
            { id: 'staking', label: '⚡ Staking', icon: Zap },
            { id: 'history', label: '📜 History', icon: History },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'tokens' && (
            <motion.div
              key="tokens"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {TOKENS.map((token, i) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedToken(token)}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 p-4 hover:border-white/20 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center text-2xl`}>
                        {token.icon}
                      </div>
                      <div>
                        <p className="font-bold text-white">{token.name}</p>
                        <p className="text-white/50 text-sm">{token.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">{token.balance.toLocaleString()} {token.symbol}</p>
                      <p className="text-white/50 text-sm">${token.value.toLocaleString()}</p>
                    </div>
                    <div className={`text-right min-w-[80px] ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {token.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="font-semibold">{token.change24h >= 0 ? '+' : ''}{token.change24h}%</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition ml-2" />
                  </div>
                </motion.div>
              ))}
              
              <button className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-white/50 hover:text-white hover:border-white/40 transition flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Add Token
              </button>
            </motion.div>
          )}

          {activeTab === 'nfts' && (
            <motion.div
              key="nfts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {NFTS.map((nft, i) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border ${RARITY_COLORS[nft.rarity]} overflow-hidden hover:scale-105 transition cursor-pointer`}
                >
                  <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-6xl">
                    {nft.image}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-white text-sm truncate">{nft.name}</p>
                    <p className="text-white/50 text-xs truncate">{nft.collection}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-semibold uppercase ${RARITY_COLORS[nft.rarity].split(' ')[0]}`}>
                        {nft.rarity}
                      </span>
                      <span className="text-white/70 text-xs">{nft.floorPrice} ETH</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="aspect-square border-2 border-dashed border-white/20 rounded-2xl text-white/50 hover:text-white hover:border-white/40 transition flex flex-col items-center justify-center gap-2"
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm">Add NFT</span>
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'staking' && (
            <motion.div
              key="staking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {STAKING_POOLS.map((pool, i) => (
                <motion.div
                  key={pool.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{pool.name}</p>
                        <p className="text-white/50 text-sm flex items-center gap-1">
                          {pool.lock === 'Flexible' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {pool.lock}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold text-2xl">{pool.apy}%</p>
                      <p className="text-white/50 text-sm">APY</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-white/50 text-xs">Your Stake</p>
                      <p className="text-white font-bold">{pool.staked.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-white/50 text-xs">Earned Rewards</p>
                      <p className="text-emerald-400 font-bold">{pool.rewards.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold text-sm hover:opacity-90 transition">
                      Stake More
                    </button>
                    <button className="flex-1 py-2 bg-white/10 rounded-xl font-semibold text-sm hover:bg-white/15 transition">
                      Claim Rewards
                    </button>
                  </div>
                </motion.div>
              ))}

              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/20 p-6 text-center">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Boost Your Rewards</h3>
                <p className="text-white/60 mb-4">Stake LITBIT to earn up to 5x rewards multiplier</p>
                <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:opacity-90 transition">
                  Learn More
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <h3 className="font-bold text-white">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-white/5">
                {TRANSACTIONS.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 flex items-center justify-between hover:bg-white/5 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'receive' || tx.type === 'reward' ? 'bg-emerald-500/20 text-emerald-400' :
                        tx.type === 'send' ? 'bg-red-500/20 text-red-400' :
                        tx.type === 'swap' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {tx.type === 'receive' || tx.type === 'reward' ? <ArrowDownLeft className="w-5 h-5" /> :
                         tx.type === 'send' ? <ArrowUpRight className="w-5 h-5" /> :
                         tx.type === 'swap' ? <ArrowRightLeft className="w-5 h-5" /> :
                         <Zap className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-white capitalize">{tx.type}</p>
                        <p className="text-white/50 text-sm">{tx.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'send' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.token}
                      </p>
                      <p className="text-white/50 text-sm">${tx.value}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-white/50 text-sm">{tx.timestamp}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-white/10 text-center">
                <button className="text-pink-400 font-semibold text-sm hover:text-pink-300 transition flex items-center gap-1 mx-auto">
                  View All Transactions
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send Modal */}
        <AnimatePresence>
          {showSend && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowSend(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 rounded-3xl border border-white/10 p-6 w-full max-w-md"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Send Crypto</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Select Token</label>
                    <select className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500">
                      {TOKENS.map(t => (
                        <option key={t.id} value={t.symbol}>{t.icon} {t.name} ({t.balance} {t.symbol})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Recipient Address</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-pink-500"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 text-sm font-semibold">
                        MAX
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/50">Network Fee</span>
                      <span className="text-white">~$2.50</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Estimated Time</span>
                      <span className="text-white">~30 seconds</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-bold text-lg hover:opacity-90 transition">
                    Send Transaction
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
