/**
 * Disk Widget Component
 * Displays disk usage with progress bar and storage information
 *
 * @component DiskWidget
 */

import { useSystemStatsStore } from '@/lib/stores';
import { ProgressBar } from './ProgressBar';

interface DiskWidgetProps {
  compact?: boolean;
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function DiskWidget({ compact = false }: DiskWidgetProps) {
  const disk = useSystemStatsStore((state) => state.disk);
  const isLoading = useSystemStatsStore((state) => state.isLoading);

  if (isLoading && !disk) {
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

  if (!disk) {
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
          <span>Disk data unavailable</span>
        </div>
      </div>
    );
  }

  const usedTB = disk.used / (1024 * 1024 * 1024 * 1024);
  const totalTB = disk.total / (1024 * 1024 * 1024 * 1024);

  if (compact) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">
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
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </span>
            <span className="text-sm font-medium text-white">Disk</span>
          </div>
          <span className="text-lg font-mono font-bold text-white">
            {disk.percentage.toFixed(1)}%
          </span>
        </div>
        <ProgressBar value={disk.percentage} color="disk" size="sm" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-amber-500/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400">
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
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Storage</h3>
            <p className="text-xs text-gray-400">Disk Usage</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-white">
            {disk.percentage.toFixed(1)}%
          </span>
          <p className="text-xs text-gray-400 mt-1">
            {usedTB.toFixed(2)} / {totalTB.toFixed(2)} TB
          </p>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="mb-4">
        <ProgressBar
          value={disk.percentage}
          color="disk"
          label="Usage"
          showPercentage
        />
      </div>

      {/* Storage Details */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Used</div>
          <span className="text-sm font-mono text-amber-400">
            {formatBytes(disk.used)}
          </span>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Free</div>
          <span className="text-sm font-mono text-emerald-400">
            {formatBytes(disk.free)}
          </span>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Total</div>
          <span className="text-sm font-mono text-white">
            {formatBytes(disk.total)}
          </span>
        </div>
      </div>

      {/* I/O Stats */}
      {(disk.readBytes > 0 || disk.writeBytes > 0) && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">I/O Activity</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="text-gray-300">Read</span>
              <span className="font-mono text-white">
                {formatBytes(disk.readBytes)}
              </span>
            </div>
            <div className="flex items-center gap-2">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="text-gray-300">Write</span>
              <span className="font-mono text-white">
                {formatBytes(disk.writeBytes)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiskWidget;
