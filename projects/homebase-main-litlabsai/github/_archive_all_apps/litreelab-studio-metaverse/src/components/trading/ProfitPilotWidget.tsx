'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Play,
  Square,
  Activity,
  DollarSign,
  BarChart3,
} from 'lucide-react';

interface TradingStats {
  isActive: boolean;
  balance: number;
  todayProfit: number;
  totalProfit: number;
  winRate: number;
  activeTrades: number;
  recentTrades: Array<{
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    profit: number;
    timestamp: string;
  }>;
}

export function ProfitPilotWidget() {
  const [stats, setStats] = useState<TradingStats>({
    isActive: true,
    balance: 15420.5,
    todayProfit: 127.35,
    totalProfit: 2847.2,
    winRate: 68.5,
    activeTrades: 3,
    recentTrades: [
      { id: '1', symbol: 'BTCUSDT', side: 'BUY', profit: 45.2, timestamp: '2m ago' },
      { id: '2', symbol: 'ETHUSDT', side: 'SELL', profit: -12.5, timestamp: '15m ago' },
      { id: '3', symbol: 'SOLUSDT', side: 'BUY', profit: 89.15, timestamp: '32m ago' },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<Array<{ height: number; isPositive: boolean }>>([]);
  const [prices, setPrices] = useState<{ bitcoin: { usd: number }; ethereum: { usd: number } } | null>(null);

  const toggleTrading = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStats(prev => ({ ...prev, isActive: !prev.isActive }));
    setIsLoading(false);
  };

  // Simulate live updates
  useEffect(() => {
    // Initialize chart data on client side to avoid hydration mismatch
    setChartData(
      Array.from({ length: 20 }).map(() => ({
        height: 30 + Math.random() * 70,
        isPositive: Math.random() > 0.3,
      })),
    );

    // Fetch crypto prices
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'
        );
        const data = await res.json();
        setPrices(data);
      } catch (e) {
        // Silently fail - prices are optional UI enhancement
      }
    };
    fetchPrices();

    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        todayProfit: prev.todayProfit + (Math.random() - 0.3) * 5,
        balance: prev.balance + (Math.random() - 0.3) * 2,
      }));

      // Update chart data occasionally
      if (Math.random() > 0.7) {
        setChartData(prev => [
          ...prev.slice(1),
          { height: 30 + Math.random() * 70, isPositive: Math.random() > 0.3 },
        ]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-lab-green-500/20">
            <TrendingUp className="w-6 h-6 text-lab-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ProfitPilot</h2>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${stats.isActive ? 'bg-lab-green-400 live-dot' : 'bg-red-400'}`}
              />
              <span className={`text-sm ${stats.isActive ? 'text-lab-green-400' : 'text-red-400'}`}>
                {stats.isActive ? 'Auto-Trading Active' : 'Trading Paused'}
              </span>
            </div>
          </div>
        </div>
        {prices && (
          <div className="hidden md:flex gap-3 text-xs font-mono">
            <div className="px-2 py-1 bg-gray-800/50 rounded border border-gray-700">
              <span className="text-gray-400">BTC</span>{' '}
              <span className="text-white">${prices.bitcoin.usd.toLocaleString()}</span>
            </div>
            <div className="px-2 py-1 bg-gray-800/50 rounded border border-gray-700">
              <span className="text-gray-400">ETH</span>{' '}
              <span className="text-white">${prices.ethereum.usd.toLocaleString()}</span>
            </div>
          </div>
        )}
        <button
          onClick={toggleTrading}
          disabled={isLoading}
          className={`p-3 rounded-xl transition-all ${
            stats.isActive
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
              : 'bg-lab-green-500/20 hover:bg-lab-green-500/30 text-lab-green-400'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : stats.isActive ? (
            <Square className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <DollarSign className="w-4 h-4" />
            Today&apos;s Profit
          </div>
          <p
            className={`text-2xl font-bold ${stats.todayProfit >= 0 ? 'text-lab-green-400' : 'text-red-400'}`}
          >
            {stats.todayProfit >= 0 ? '+' : ''}${stats.todayProfit.toFixed(2)}
          </p>
        </div>
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <Activity className="w-4 h-4" />
            Win Rate
          </div>
          <p className="text-2xl font-bold text-white">{stats.winRate}%</p>
        </div>
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <BarChart3 className="w-4 h-4" />
            Balance
          </div>
          <p className="text-2xl font-bold text-white">${stats.balance.toLocaleString()}</p>
        </div>
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            Active Trades
          </div>
          <p className="text-2xl font-bold text-white">{stats.activeTrades}</p>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="mb-6">
        <p className="text-white/60 text-sm mb-3">Live Performance</p>
        <div className="flex items-end gap-1 h-20">
          {(chartData.length > 0
            ? chartData
            : Array.from({ length: 20 }).map(() => ({ height: 50, isPositive: true }))
          ).map((data, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all duration-500 ${
                data.isPositive ? 'bg-lab-green-500/60' : 'bg-red-500/40'
              }`}
              style={{ height: `${data.height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <p className="text-white/60 text-sm mb-3">Recent Trades</p>
        <div className="space-y-2">
          {stats.recentTrades.map(trade => (
            <div key={trade.id} className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    trade.side === 'BUY' ? 'bg-lab-green-500/20' : 'bg-red-500/20'
                  }`}
                >
                  {trade.side === 'BUY' ? (
                    <TrendingUp
                      className={`w-4 h-4 ${trade.profit >= 0 ? 'text-lab-green-400' : 'text-red-400'}`}
                    />
                  ) : (
                    <TrendingDown
                      className={`w-4 h-4 ${trade.profit >= 0 ? 'text-lab-green-400' : 'text-red-400'}`}
                    />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{trade.symbol}</p>
                  <p className="text-white/50 text-xs">{trade.timestamp}</p>
                </div>
              </div>
              <p
                className={`font-bold ${trade.profit >= 0 ? 'text-lab-green-400' : 'text-red-400'}`}
              >
                {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
