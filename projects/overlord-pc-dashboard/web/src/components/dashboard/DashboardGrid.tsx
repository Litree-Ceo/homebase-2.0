/**
 * Dashboard Grid Component
 * Main dashboard page with all system stats widgets in a responsive grid layout
 *
 * @component DashboardGrid
 */

import { useSystemStatsStore } from '@/lib/stores';
import { useEffect } from 'react';
import { CPUWidget } from './CPUWidget';
import { DiskWidget } from './DiskWidget';
import { GPUWidget } from './GPUWidget';
import { MemoryWidget } from './MemoryWidget';
import { NetworkWidget } from './NetworkWidget';
import { TemperatureWidget } from './TemperatureWidget';

interface DashboardGridProps {
  compact?: boolean;
  refreshInterval?: number;
}

/**
 * Simulate fetching system stats (replace with actual API/WebSocket calls)
 */
export function DashboardGrid({
  compact = false,
  refreshInterval = 2000,
}: DashboardGridProps) {
  const fetchStats = useSystemStatsStore((state) => state.fetchStats);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Set up interval to fetch stats periodically
    const intervalId = setInterval(fetchStats, refreshInterval);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchStats, refreshInterval]);

  // Selectors for individual stats
  const cpu = useSystemStatsStore((state) => state.cpu);
  const memory = useSystemStatsStore((state) => state.memory);
  const disk = useSystemStatsStore((state) => state.disk);
  const network = useSystemStatsStore((state) => state.network);
  const gpu = useSystemStatsStore((state) => state.gpu);
  const temperatures = useSystemStatsStore((state) => state.temperatures);
  const isLoading = useSystemStatsStore((state) => state.isLoading);
  const error = useSystemStatsStore((state) => state.error);
  const lastUpdated = useSystemStatsStore((state) => state.lastUpdated);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-400">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Last Updated Timestamp */}
      {lastUpdated && !error && (
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <span className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
              }`}
            />
            {isLoading ? 'Updating...' : 'Live'}
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div
        className={
          compact
            ? 'grid grid-cols-2 lg:grid-cols-3 gap-4'
            : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        }
      >
        {/* CPU Widget */}
        <CPUWidget compact={compact} />

        {/* Memory Widget */}
        <MemoryWidget compact={compact} />

        {/* Disk Widget */}
        <DiskWidget compact={compact} />

        {/* Network Widget */}
        <NetworkWidget compact={compact} />

        {/* GPU Widget */}
        <GPUWidget compact={compact} />

        {/* Temperature Widget */}
        <TemperatureWidget compact={compact} />
      </div>

      {/* Quick Stats Summary */}
      {!compact && (cpu || memory || disk) && (
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">
            System Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/30 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">CPU Load</p>
              <p className="text-xl font-mono font-bold text-purple-400">
                {cpu ? `${cpu.usage.toFixed(1)}%` : '--'}
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Memory Used</p>
              <p className="text-xl font-mono font-bold text-cyan-400">
                {memory ? `${memory.percentage.toFixed(1)}%` : '--'}
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Storage Used</p>
              <p className="text-xl font-mono font-bold text-amber-400">
                {disk ? `${disk.percentage.toFixed(1)}%` : '--'}
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Network Activity</p>
              <p className="text-xl font-mono font-bold text-green-400">
                {network
                  ? `${(network.downloadSpeed / 1024 / 1024).toFixed(1)} MB/s`
                  : '--'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardGrid;
