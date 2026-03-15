'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Send, ArrowUpRight, Eye, EyeOff, Plus, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  change24h: number;
  icon: string;
}

interface WalletAccount {
  address: string;
  network: 'ethereum' | 'polygon' | 'arbitrum';
  balance: number;
  nftCount: number;
}

const SAMPLE_TOKENS: TokenBalance[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 2.5,
    usdValue: 4850,
    change24h: 5.2,
    icon: "E",
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0.15,
    usdValue: 6000,
    change24h: -2.1,
    icon: '₿',
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    balance: 500,
    usdValue: 250,
    change24h: 8.3,
    icon: '◆',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 1200,
    usdValue: 1200,
    change24h: 0,
    icon: '$',
  },
];

const SAMPLE_ACCOUNTS: WalletAccount[] = [
  {
    address: '0x1234...5678',
    network: 'ethereum',
    balance: 12100,
    nftCount: 24,
  },
  {
    address: '0x8765...4321',
    network: 'polygon',
    balance: 450,
    nftCount: 8,
  },
];

export default function Web3Page() {
  const [tokens] = useState<TokenBalance[]>(SAMPLE_TOKENS);
  const [accounts] = useState<WalletAccount[]>(SAMPLE_ACCOUNTS);
  const [hideBalance, setHideBalance] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'swap' | 'nfts'>('portfolio');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalBalance = tokens.reduce((sum, token) => sum + token.usdValue, 0);
  const change24h = (
    tokens.reduce((sum, token) => sum + (token.usdValue * token.change24h) / 100, 0) / totalBalance
  ) * 100;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  if (!isMounted) return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Header */}
        <div className="border-b border-cyan-500/20 bg-black/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <Wallet size={32} />
              Web3 Universe
            </h1>

            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Total Balance</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-cyan-300">
                    {hideBalance ? '••••••' : `$${totalBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                  </p>
                  <button onClick={() => setHideBalance(!hideBalance)} className="p-1 hover:bg-cyan-500/10 rounded">
                    {hideBalance ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">24h Change</p>
                <p className={`text-2xl font-bold ${change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                </p>
              </div>

              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Connected Wallets</p>
                <p className="text-2xl font-bold text-purple-300">{accounts.length}</p>
              </div>

              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Total NFTs</p>
                <p className="text-2xl font-bold text-pink-300">
                  {accounts.reduce((sum, acc) => sum + acc.nftCount, 0)}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mt-6 border-b border-cyan-500/10">
              {(['portfolio', 'swap', 'nfts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-2 transition-colors font-semibold text-sm ${
                    activeTab === tab
                      ? 'border-b-2 border-cyan-500 text-cyan-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-8">
              {/* Token Holdings */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-cyan-300">Token Holdings</h2>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    title="Refresh token holdings"
                    aria-label="Refresh token holdings"
                    className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={20} className={`text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="space-y-3">
                  {tokens.map((token) => (
                    <div
                      key={token.symbol}
                      className="flex items-center justify-between p-4 bg-black/50 border border-cyan-500/10 rounded-lg hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                          {token.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-cyan-300">{token.name}</p>
                          <p className="text-sm text-gray-400">{token.balance} {token.symbol}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="font-semibold text-cyan-300">
                            {hideBalance ? '•••••' : `$${token.usdValue.toLocaleString('en-US')}`}
                          </p>
                          <p className={`text-sm ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            title="Send"
                            className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg transition-colors"
                          >
                            <Send size={18} className="text-cyan-400" />
                          </button>
                          <button 
                            title="Swap"
                            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors"
                          >
                            <ArrowUpRight size={18} className="text-purple-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Wallets */}
              <div>
                <h2 className="text-2xl font-bold text-purple-300 mb-6 flex items-center gap-2">
                  <Wallet size={24} />
                  Connected Wallets
                </h2>

                <div className="space-y-3">
                  {accounts.map((account, idx) => (
                    <div key={idx} className="p-4 bg-black/50 border border-cyan-500/10 rounded-lg hover:border-cyan-500/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-cyan-300 font-mono">{account.address}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {account.network.charAt(0).toUpperCase() + account.network.slice(1)} Network
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">
                            ${account.balance.toLocaleString('en-US')}
                          </p>
                          <p className="text-sm text-gray-400">{account.nftCount} NFTs</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button className="w-full p-4 border-2 border-dashed border-cyan-500/30 rounded-lg text-cyan-400 hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-2 font-semibold">
                    <Plus size={20} />
                    Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Swap Tab */}
          {activeTab === 'swap' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">From</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      className="flex-1 bg-black/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                    <select 
                      title="Select token to swap from"
                      className="bg-black/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-300 focus:outline-none focus:border-cyan-500"
                    >
                      {tokens.map((t) => (
                        <option key={t.symbol} value={t.symbol}>
                          {t.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 rounded-lg font-semibold text-white transition-colors">
                  Swap Tokens
                </button>
              </div>
            </div>
          )}

          {/* NFTs Tab */}
          {activeTab === 'nfts' && (
            <div>
              <h2 className="text-2xl font-bold text-pink-300 mb-6">Your NFT Collection</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="group cursor-pointer bg-black/50 border border-cyan-500/10 rounded-lg overflow-hidden hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="w-full aspect-square bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-cyan-500/40 group-hover:to-purple-500/40 transition-colors">
                      <div className="text-4xl">🎨</div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-cyan-300 text-sm">NFT #{i}</p>
                      <p className="text-xs text-gray-400 mt-1">Floor: 0.5 ETH</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
