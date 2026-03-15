/**
 * Memory Widget Component
 * Displays RAM usage with progress bar and usage details
 *
 * @component MemoryWidget
 */

import { useSystemStatsStore } from '@/lib/stores';
import { ProgressBar } from './ProgressBar';

interface MemoryWidgetProps {
  compact?: boolean;
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function MemoryWidget({ compact = false }: MemoryWidgetProps) {
  const memory = useSystemStatsStore((state) => state.memory);
  const isLoading = useSystemStatsStore((state) => state.isLoading);

  if (isLoading && !memory) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-700 rounded-lg" />
          <div className="h-5 bg-gray-700 rounded w-24" />
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-3 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <span>Memory data unavailable</span>
        </div>
      </div>
    );
  }

  const usedGB = memory.used / (1024 * 1024 * 1024);
  const totalGB = memory.total / (1024 * 1024 * 1024);
  const available = memory.available ?? memory.total - memory.used;
  const availableGB = available / (1024 * 1024 * 1024);

  if (compact) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </span>
            <span className="text-sm font-medium text-white">Memory</span>
          </div>
          <span className="text-lg font-mono font-bold text-white">
            {memory.percentage.toFixed(1)}%
          </span>
        </div>
        <ProgressBar value={memory.percentage} color="memory" size="sm" />
      </div>
    );
  }

  return (
    <section
      className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-cyan-500/30 transition-all duration-300"
      aria-labelledby="memory-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400"
            aria-hidden="true"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <h3
              id="memory-heading"
              className="text-lg font-semibold text-white"
            >
              Memory
            </h3>
            <p className="text-xs text-gray-400">RAM Usage</p>
          </div>
        </div>
        <div className="text-right">
          <span
            className="text-2xl font-mono font-bold text-white"
            aria-live="polite"
          >
            {memory.percentage.toFixed(1)}%
          </span>
          <p
            className="text-xs text-gray-400 mt-1"
            aria-label={`${usedGB.toFixed(1)} gigabytes used out of ${totalGB.toFixed(1)} gigabytes total`}
          >
            {usedGB.toFixed(1)} / {totalGB.toFixed(1)} GB
          </p>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="mb-4">
        <ProgressBar
          value={memory.percentage}
          color="memory"
          label="Usage"
          showPercentage
        />
      </div>

      {/* Memory Details */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            <span className="text-xs text-gray-400">Used</span>
          </div>
          <span className="text-sm font-mono text-white">
            {formatBytes(memory.used)}
          </span>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            <span className="text-xs text-gray-400">Available</span>
          </div>
          <span className="text-sm font-mono text-white">
            {formatBytes(available)}
          </span>
        </div>
      </div>

      {/* Usage Bar Visual */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex h-4 rounded-full overflow-hidden bg-gray-800">
          <div
            className="bg-cyan-400 h-full transition-all duration-500"
            style={{ width: `${memory.percentage}%` }}
          />
          <div
            className="bg-emerald-400 h-full transition-all duration-500"
            style={{
              width: `${((available / memory.total) * 100).toFixed(1)}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Used: {formatBytes(memory.used)}</span>
          <span>Free: {formatBytes(available)}</span>
        </div>
      </div>
    </section>
  );
}

export default MemoryWidget;
