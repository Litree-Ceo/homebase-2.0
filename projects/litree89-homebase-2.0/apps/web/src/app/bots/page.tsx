'use client';

/**
 * Trading Bots Management Dashboard
 * @workspace Autonomous AI agent management and monitoring
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

interface BotConfig {
  id: string;
  name: string;
  strategy: string;
  coins: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BotState {
  botId: string;
  lastRun: string;
  lastSignal: any;
  runCount: number;
  successCount: number;
  errorCount: number;
  isRunning: boolean;
}

interface BotResult {
  botId: string;
  success: boolean;
  signals: any[];
  executionTimeMs: number;
  error?: string;
  timestamp: string;
}

export default function BotsPage() {
  const { user } = useAuth();
  const [bots, setBots] = useState<BotConfig[]>([]);
  const [botStates, setBotStates] = useState<Map<string, BotState>>(new Map());
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newBotName, setNewBotName] = useState('');
  const [newBotStrategy, setNewBotStrategy] = useState('price-alert');
  const [newBotCoins, setNewBotCoins] = useState('bitcoin,ethereum');

  const strategies = [
    { id: 'price-alert', name: '🚨 Price Alert', description: 'Trigger on price changes' },
    {
      id: 'sma-crossover',
      name: '📊 SMA Crossover',
      description: 'Moving average crossover signals',
    },
    {
      id: 'rsi-oversold',
      name: '💹 RSI Oversold',
      description: 'Buy when RSI drops below threshold',
    },
    { id: 'momentum-scalp', name: '⚡ Momentum Scalp', description: 'Quick trades on momentum' },
    { id: 'grid-trading', name: '🔷 Grid Trading', description: 'Automated grid positions' },
    {
      id: 'opportunity-detector',
      name: '🎯 Opportunity Detector',
      description: 'Find market opportunities',
    },
  ];

  useEffect(() => {
    loadBots();
    const interval = setInterval(loadBots, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user?.id || user?.localAccountId]);

  const loadBots = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bots');
      if (res.ok) {
        const data = await res.json();
        setBots(data);

        // Load states for each bot
        for (const bot of data) {
          const stateRes = await fetch(`/api/bots/${bot.id}/state`);
          if (stateRes.ok) {
            const state = await stateRes.json();
            setBotStates(prev => new Map(prev).set(bot.id, state));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load bots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) return;

    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBotName,
          strategy: newBotStrategy,
          coins: newBotCoins.split(',').map(c => c.trim().toLowerCase()),
          enabled: true,
        }),
      });

      if (res.ok) {
        setNewBotName('');
        setNewBotStrategy('price-alert');
        setNewBotCoins('bitcoin,ethereum');
        setShowCreate(false);
        await loadBots();
      }
    } catch (error) {
      console.error('Failed to create bot:', error);
    }
  };

  const handleToggleBotStatus = async (botId: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/bots/${botId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });

      if (res.ok) {
        await loadBots();
      }
    } catch (error) {
      console.error('Failed to toggle bot status:', error);
    }
  };

  const handleRunBot = async (botId: string) => {
    try {
      const res = await fetch(`/api/bots/${botId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const result: BotResult = await res.json();
        console.log('Bot run result:', result);
        await loadBots();
      }
    } catch (error) {
      console.error('Failed to run bot:', error);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    if (!confirm('Delete this bot? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/bots/${botId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSelectedBot(null);
        await loadBots();
      }
    } catch (error) {
      console.error('Failed to delete bot:', error);
    }
  };

  if (loading && bots.length === 0) {
    return (
      <div className="honeycomb-bg min-h-screen flex items-center justify-center">
        <div className="honeycomb-float text-center">
          <div className="honeycomb-cell w-16 h-16 rounded-full border-4 border-honeycomb-gold/30 border-t-honeycomb-gold animate-spin mx-auto mb-4"></div>
          <p className="honeycomb-accent">Loading your bot arsenal...</p>
        </div>
      </div>
    );
  }

  const strategyName = (id: string) => strategies.find(s => s.id === id)?.name || id;

  return (
    <div className="honeycomb-bg min-h-screen">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-black text-white honeycomb-text">🤖 Trading Bots</h1>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="honeycomb-cell px-6 py-3 bg-honeycomb-brightGold text-honeycomb-black rounded-lg font-bold hover:bg-honeycomb-gold transition"
            >
              {showCreate ? '❌ Cancel' : '➕ Create Bot'}
            </button>
          </div>
          <p className="text-honeycomb-gold">Manage your autonomous trading agents</p>
        </div>

        {/* Create Bot Form */}
        {showCreate && (
          <div className="mb-8 honeycomb-cell honeycomb-glow p-6 border border-honeycomb-gold/20">
            <h2 className="text-xl font-bold text-white mb-4 honeycomb-accent">Create New Bot</h2>
            <div className="mb-4 p-3 honeycomb-border rounded-lg bg-honeycomb-darkPurple/30">
              <p className="text-sm text-honeycomb-gold">
                ✨ Paper trading is free and perfect for testing strategies. Live trading unlocks
                with Pro when you're ready to trade with real money.
              </p>
            </div>
            <form onSubmit={handleCreateBot} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="botName"
                    className="block text-sm font-semibold text-honeycomb-gold mb-2"
                  >
                    Bot Name
                  </label>
                  <input
                    id="botName"
                    type="text"
                    value={newBotName}
                    onChange={e => setNewBotName(e.target.value)}
                    placeholder="My First Bot"
                    className="w-full px-4 py-2 bg-honeycomb-darkPurple border border-honeycomb-gold/20 rounded-lg text-white placeholder-honeycomb-gold/50 focus:outline-none focus:border-honeycomb-gold"
                  />
                </div>
                <div>
                  <label
                    htmlFor="strategySelect"
                    className="block text-sm font-semibold text-honeycomb-gold mb-2"
                  >
                    Strategy
                  </label>
                  <select
                    id="strategySelect"
                    value={newBotStrategy}
                    onChange={e => setNewBotStrategy(e.target.value)}
                    className="w-full px-4 py-2 bg-honeycomb-darkPurple border border-honeycomb-gold/20 rounded-lg text-white focus:outline-none focus:border-honeycomb-gold"
                  >
                    {strategies.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="botCoins"
                    className="block text-sm font-semibold text-honeycomb-gold mb-2"
                  >
                    Coins (comma-separated)
                  </label>
                  <input
                    id="botCoins"
                    type="text"
                    value={newBotCoins}
                    onChange={e => setNewBotCoins(e.target.value)}
                    placeholder="bitcoin,ethereum"
                    className="w-full px-4 py-2 bg-honeycomb-darkPurple border border-honeycomb-gold/20 rounded-lg text-white placeholder-honeycomb-gold/50 focus:outline-none focus:border-honeycomb-gold"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full honeycomb-pulse px-6 py-2 bg-honeycomb-brightGold text-honeycomb-black rounded-lg font-bold hover:bg-honeycomb-gold"
              >
                Create Bot
              </button>
            </form>
          </div>
        )}

        {/* Bots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bots.map(bot => {
            const state = botStates.get(bot.id);
            const strategyInfo = strategies.find(s => s.id === bot.strategy);
            const successRate =
              state && state.runCount > 0
                ? Math.round((state.successCount / state.runCount) * 100)
                : 0;

            return (
              <div
                key={bot.id}
                className={`text-left bg-slate-900 border-2 rounded-lg p-6 transition ${
                  selectedBot?.id === bot.id
                    ? 'border-amber-400 bg-slate-800'
                    : 'border-purple-500/20 hover:border-purple-400'
                }`}
              >
                {/* Top Section */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    onClick={() => setSelectedBot(bot)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedBot(bot);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedBot?.id === bot.id}
                    className="cursor-pointer flex-1"
                  >
                    <h3 className="text-xl font-black text-white">{bot.name}</h3>
                    <p className="text-sm text-purple-300">{strategyInfo?.description}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      bot.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {bot.enabled ? '🟢 Active' : '🔴 Inactive'}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-800 rounded p-3">
                    <p className="text-xs text-purple-300">Strategy</p>
                    <p className="text-sm font-bold text-white">{strategyName(bot.strategy)}</p>
                  </div>
                  <div className="bg-slate-800 rounded p-3">
                    <p className="text-xs text-purple-300">Coins Watched</p>
                    <p className="text-sm font-bold text-white">{bot.coins.length}</p>
                  </div>
                  <div className="bg-slate-800 rounded p-3">
                    <p className="text-xs text-purple-300">Total Runs</p>
                    <p className="text-sm font-bold text-white">{state?.runCount || 0}</p>
                  </div>
                  <div className="bg-slate-800 rounded p-3">
                    <p className="text-xs text-purple-300">Success Rate</p>
                    <p className="text-sm font-bold text-green-400">{successRate}%</p>
                  </div>
                </div>

                {/* Coins List */}
                <div className="mb-4">
                  <p className="text-xs text-purple-300 mb-2">Monitoring:</p>
                  <div className="flex flex-wrap gap-2">
                    {bot.coins.map(coin => (
                      <span
                        key={coin}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                      >
                        {coin}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status */}
                {state && (
                  <div className="mb-4 p-3 bg-slate-800 rounded">
                    {state.isRunning ? (
                      <p className="text-xs text-amber-400">⚙️ Running...</p>
                    ) : (
                      <p className="text-xs text-purple-300">
                        Last run:{' '}
                        {state.lastRun ? new Date(state.lastRun).toLocaleDateString() : 'Never'}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleBotStatus(bot.id, bot.enabled)}
                    className="flex-1 px-3 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition text-sm font-semibold"
                  >
                    {bot.enabled ? '⏸️ Pause' : '▶️ Resume'}
                  </button>
                  <button
                    onClick={() => handleRunBot(bot.id)}
                    disabled={state?.isRunning}
                    className="flex-1 px-3 py-2 bg-amber-400/20 text-amber-400 rounded hover:bg-amber-400/30 transition text-sm font-semibold disabled:opacity-50"
                  >
                    ▶️ Run Now
                  </button>
                  <button
                    onClick={() => handleDeleteBot(bot.id)}
                    className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition text-sm font-semibold"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {bots.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-white font-bold text-lg">No bots yet</p>
            <p className="text-purple-300">Create your first trading bot to get started</p>
          </div>
        )}

        {/* Strategy Guide */}
        <div className="mt-12 bg-slate-900 border border-purple-500/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">📚 Strategy Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategies.map(s => (
              <div key={s.id} className="p-4 bg-slate-800 rounded">
                <h3 className="font-bold text-white mb-1">{s.name}</h3>
                <p className="text-sm text-purple-300">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
