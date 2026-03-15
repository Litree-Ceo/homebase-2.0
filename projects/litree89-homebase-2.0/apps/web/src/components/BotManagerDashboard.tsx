'use client';

/**
 * @workspace Bot Manager Dashboard - Real-time Bot Orchestration & Profit Tracking
 *
 * Features:
 * - Start/stop/configure trading bots
 * - Monitor real-time signals and profits
 * - Track ROI by strategy
 * - Configure Meta/social bots
 */

import { useState, useEffect } from 'react';
import type { BotConfig, Signal, BotState } from '@/types/bots';

interface BotDashboardProps {
  userId: string;
}

interface BotMetrics {
  totalBots: number;
  activeBots: number;
  totalProfit: number;
  totalROI: number;
  dailyProfit: number;
  topStrategy: string;
}

interface StrategyStats {
  name: string;
  roi: number;
  winRate: number;
  trades: number;
  profit: number;
}

export default function BotManagerDashboard({ userId }: BotDashboardProps) {
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [metrics, setMetrics] = useState<BotMetrics>({
    totalBots: 0,
    activeBots: 0,
    totalProfit: 0,
    totalROI: 0,
    dailyProfit: 0,
    topStrategy: 'None',
  });
  const [strategyStats, setStrategyStats] = useState<StrategyStats[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'trading' | 'social' | 'metaverse'>('overview');

  // Load bots on mount
  useEffect(() => {
    fetchBots();
    fetchMetrics();
    fetchSignals();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchBots();
      fetchMetrics();
      fetchSignals();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  const fetchBots = async () => {
    try {
      const res = await fetch('/api/bot-api');
      const data = await res.json();
      setBots(data.bots || []);
    } catch (error) {
      console.error('Failed to fetch bots:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/bot-analytics');
      const data = await res.json();
      setMetrics(data.metrics);
      setStrategyStats(data.strategies);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchSignals = async () => {
    try {
      const res = await fetch('/api/bot-signals');
      const data = await res.json();
      setSignals(data.signals || []);
    } catch (error) {
      console.error('Failed to fetch signals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startBot = async (botId: string) => {
    try {
      await fetch('/api/bot-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', botId }),
      });
      fetchBots();
    } catch (error) {
      console.error('Failed to start bot:', error);
    }
  };

  const stopBot = async (botId: string) => {
    try {
      await fetch('/api/bot-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop', botId }),
      });
      fetchBots();
    } catch (error) {
      console.error('Failed to stop bot:', error);
    }
  };

  const createBot = async (config: Partial<BotConfig>) => {
    try {
      const res = await fetch('/api/bot-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', config }),
      });
      if (res.ok) {
        fetchBots();
      }
    } catch (error) {
      console.error('Failed to create bot:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading Bot Manager...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6">
        <h1 className="text-4xl font-bold mb-2">🤖 Bot Manager</h1>
        <p className="text-slate-400">
          Orchestrate trading bots, social bots, and metaverse agents
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 flex gap-6">
          {(['overview', 'trading', 'social', 'metaverse'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-4 px-2 border-b-2 transition-all ${
                tab === t
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t === 'overview' && '📊 Overview'}
              {t === 'trading' && '💰 Trading Bots'}
              {t === 'social' && '📱 Social Bots'}
              {t === 'metaverse' && '🌐 Metaverse'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Metrics Cards */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Total Bots"
                value={metrics.totalBots}
                change={metrics.activeBots}
                icon="🤖"
              />
              <MetricCard
                label="Active Bots"
                value={metrics.activeBots}
                change={metrics.activeBots > 0 ? 1 : 0}
                icon="✅"
              />
              <MetricCard
                label="Total Profit"
                value={`$${metrics.totalProfit.toFixed(2)}`}
                change={metrics.totalProfit > 0 ? 1 : -1}
                icon="💵"
              />
              <MetricCard
                label="Total ROI"
                value={`${metrics.totalROI.toFixed(2)}%`}
                change={metrics.totalROI}
                icon="📈"
              />
            </div>

            {/* Strategy Performance */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Strategy Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4">Strategy</th>
                      <th className="text-right py-3 px-4">ROI</th>
                      <th className="text-right py-3 px-4">Win Rate</th>
                      <th className="text-right py-3 px-4">Trades</th>
                      <th className="text-right py-3 px-4">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategyStats.map(stat => (
                      <tr key={stat.name} className="border-b border-slate-700/50">
                        <td className="py-3 px-4">{stat.name}</td>
                        <td
                          className={`text-right font-bold ${stat.roi > 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {stat.roi.toFixed(2)}%
                        </td>
                        <td className="text-right">{stat.winRate.toFixed(1)}%</td>
                        <td className="text-right">{stat.trades}</td>
                        <td
                          className={`text-right font-semibold ${stat.profit > 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          ${stat.profit.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Signals */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Recent Trading Signals</h2>
              <div className="space-y-2">
                {signals.slice(0, 10).map(signal => (
                  <SignalCard key={signal.id} signal={signal} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trading Bots Tab */}
        {tab === 'trading' && (
          <div className="space-y-6">
            <button
              onClick={() =>
                createBot({ name: 'New Trading Bot', strategy: 'rsi-oversold', coins: ['bitcoin'] })
              }
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              + Add Trading Bot
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {bots
                .filter(b =>
                  ['rsi-oversold', 'sma-crossover', 'momentum-scalp', 'grid-trading'].includes(
                    b.strategy,
                  ),
                )
                .map(bot => (
                  <BotCard
                    key={bot.id}
                    bot={bot}
                    onStart={() => startBot(bot.id)}
                    onStop={() => stopBot(bot.id)}
                    onSelect={() => setSelectedBot(bot)}
                  />
                ))}
            </div>

            {selectedBot && (
              <BotConfigPanel bot={selectedBot} onClose={() => setSelectedBot(null)} />
            )}
          </div>
        )}

        {/* Social Bots Tab */}
        {tab === 'social' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📱 Social Media Bots</h2>
            <div className="space-y-4">
              <SocialBotConfig platform="discord" />
              <SocialBotConfig platform="twitter" />
              <SocialBotConfig platform="telegram" />
            </div>
          </div>
        )}

        {/* Metaverse Tab */}
        {tab === 'metaverse' && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🌐 Metaverse & Meta Bots</h2>
            <p className="text-slate-400 mb-4">No metaverse bots configured yet</p>
            <button
              onClick={() => alert('Meta integration coming soon')}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
            >
              Configure Meta Bot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components
function MetricCard({ label, value, change, icon }: any) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {change > 0 && <span className="text-green-400 text-sm">↑ {change}</span>}
    </div>
  );
}

function SignalCard({ signal }: { signal: Signal }) {
  const severity = {
    info: 'bg-blue-500/20',
    warning: 'bg-yellow-500/20',
    critical: 'bg-red-500/20',
  };

  return (
    <div
      className={`${severity[signal.severity]} border border-slate-700 rounded p-3 flex justify-between items-start`}
    >
      <div>
        <div className="font-semibold">{signal.coin.toUpperCase()}</div>
        <div className="text-sm text-slate-300">{signal.message}</div>
      </div>
      <span className="text-xs text-slate-400">
        {new Date(signal.timestamp).toLocaleTimeString()}
      </span>
    </div>
  );
}

function BotCard({ bot, onStart, onStop, onSelect }: any) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{bot.name}</h3>
          <p className="text-sm text-slate-400">{bot.strategy}</p>
        </div>
        {bot.enabled ? (
          <span className="text-green-400 text-xl">●</span>
        ) : (
          <span className="text-gray-500 text-xl">●</span>
        )}
      </div>
      <div className="flex gap-2">
        {bot.enabled ? (
          <button
            onClick={onStop}
            className="flex-1 bg-red-600/20 hover:bg-red-600/30 px-3 py-2 rounded text-sm text-red-400"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex-1 bg-green-600/20 hover:bg-green-600/30 px-3 py-2 rounded text-sm text-green-400"
          >
            Start
          </button>
        )}
        <button
          onClick={onSelect}
          className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 px-3 py-2 rounded text-sm text-blue-400"
        >
          Config
        </button>
      </div>
    </div>
  );
}

function BotConfigPanel({ bot, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{bot.name}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Strategy</label>
            <div className="text-white">{bot.strategy}</div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Coins</label>
            <div className="text-white">{bot.coins.join(', ')}</div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Check Interval</label>
            <div className="text-white">{bot.checkIntervalMs}ms</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg mt-4 font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function SocialBotConfig({ platform }: { platform: string }) {
  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <h3 className="font-bold text-lg mb-2">
        {platform === 'discord' && '💬'} {platform === 'twitter' && '𝕏'}{' '}
        {platform === 'telegram' && '✈️'} {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </h3>
      <p className="text-slate-400 text-sm mb-3">{platform} integration not configured</p>
      <button className="bg-blue-600/20 hover:bg-blue-600/30 px-4 py-2 rounded text-sm text-blue-400">
        Configure {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </button>
    </div>
  );
}
