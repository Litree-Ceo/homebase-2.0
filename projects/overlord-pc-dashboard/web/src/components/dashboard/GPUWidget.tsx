/**
 * GPU Widget Component
 * Displays GPU usage, memory, temperature, and power usage
 *
 * @component GPUWidget
 */

import { useSystemStatsStore } from '@/lib/stores';
import { ProgressBar } from './ProgressBar';

interface GPUWidgetProps {
  compact?: boolean;
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function GPUWidget({ compact = false }: GPUWidgetProps) {
  const gpu = useSystemStatsStore((state) => state.gpu);
  const isLoading = useSystemStatsStore((state) => state.isLoading);

  if (isLoading && !gpu) {
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

  if (!gpu) {
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
          <span>GPU data unavailable (nvidia-smi not detected)</span>
        </div>
      </div>
    );
  }

  const memoryPercentage = (gpu.memoryUsed / gpu.memoryTotal) * 100;
  const hasGPU = gpu.name && gpu.name.trim() !== '';

  if (compact) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-pink-400">
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
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </span>
            <span className="text-sm font-medium text-white">GPU</span>
          </div>
          <span className="text-lg font-mono font-bold text-white">
            {gpu.usage.toFixed(1)}%
          </span>
        </div>
        <ProgressBar value={gpu.usage} color="gpu" size="sm" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-pink-500/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400">
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
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">GPU</h3>
            <p className="text-xs text-gray-400 truncate max-w-[150px]">
              {gpu.name || 'Unknown GPU'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-white">
            {gpu.usage.toFixed(1)}%
          </span>
          <p className="text-xs text-gray-400 mt-1">Usage</p>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="mb-4">
        <ProgressBar
          value={gpu.usage}
          color="gpu"
          label="3D Compute"
          showPercentage
        />
      </div>

      {/* Memory */}
      <div className="mb-4">
        <ProgressBar
          value={memoryPercentage}
          color="memory"
          label="Memory"
          showPercentage
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{formatBytes(gpu.memoryUsed)} used</span>
          <span>{formatBytes(gpu.memoryTotal)} total</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
        {/* Temperature */}
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <svg
              className="w-4 h-4 text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-xs text-gray-400">Temp</span>
          </div>
          <span
            className={`text-sm font-mono font-medium ${
              gpu.temperature > 80
                ? 'text-red-400'
                : gpu.temperature > 60
                  ? 'text-yellow-400'
                  : 'text-orange-400'
            }`}
          >
            {gpu.temperature}°C
          </span>
        </div>

        {/* Power */}
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-xs text-gray-400">Power</span>
          </div>
          <span className="text-sm font-mono font-medium text-amber-400">
            {gpu.powerUsage.toFixed(1)}W
          </span>
        </div>

        {/* Fan Speed */}
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <svg
              className="w-4 h-4 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-xs text-gray-400">Fan</span>
          </div>
          <span className="text-sm font-mono font-medium text-cyan-400">
            {gpu.fanSpeed.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default GPUWidget;
