/**
 * Network Widget Component
 * Displays network statistics including upload/download speeds
 *
 * @component NetworkWidget
 */

import { useSystemStatsStore } from '@/lib/stores';
import { useEffect, useState } from 'react';

interface NetworkWidgetProps {
  compact?: boolean;
}

/**
 * Format bytes per second to human readable format
 */
function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return (
    parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  );
}

/**
 * Format total bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function NetworkWidget({ compact = false }: NetworkWidgetProps) {
  const network = useSystemStatsStore((state) => state.network);
  const isLoading = useSystemStatsStore((state) => state.isLoading);

  // For animated speed indicators
  const [uploadPulse, setUploadPulse] = useState(false);
  const [downloadPulse, setDownloadPulse] = useState(false);

  useEffect(() => {
    if (network?.uploadSpeed && network.uploadSpeed > 0) {
      setUploadPulse(true);
      const timer = setTimeout(() => setUploadPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [network?.uploadSpeed]);

  useEffect(() => {
    if (network?.downloadSpeed && network.downloadSpeed > 0) {
      setDownloadPulse(true);
      const timer = setTimeout(() => setDownloadPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [network?.downloadSpeed]);

  if (isLoading && !network) {
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

  if (!network) {
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
          <span>Network data unavailable</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-green-400">
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
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
            </span>
            <span className="text-sm font-medium text-white">Network</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-cyan-400">
              ↓ {formatSpeed(network.downloadSpeed)}
            </span>
            <span className="text-amber-400">
              ↑ {formatSpeed(network.uploadSpeed)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-green-500/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400">
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
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Network</h3>
            <p className="text-xs text-gray-400">Real-time Traffic</p>
          </div>
        </div>
      </div>

      {/* Speed Indicators */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Download */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className={`w-5 h-5 text-cyan-400 ${downloadPulse ? 'animate-pulse' : ''}`}
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
            <span className="text-sm text-gray-300">Download</span>
          </div>
          <span className="text-2xl font-mono font-bold text-cyan-400">
            {formatSpeed(network.downloadSpeed)}
          </span>
        </div>

        {/* Upload */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className={`w-5 h-5 text-amber-400 ${uploadPulse ? 'animate-pulse' : ''}`}
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
            <span className="text-sm text-gray-300">Upload</span>
          </div>
          <span className="text-2xl font-mono font-bold text-amber-400">
            {formatSpeed(network.uploadSpeed)}
          </span>
        </div>
      </div>

      {/* Total Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            <span className="text-xs text-gray-400">Total Received</span>
          </div>
          <span className="text-sm font-mono text-white">
            {formatBytes(network.bytesReceived)}
          </span>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-amber-400 rounded-full" />
            <span className="text-xs text-gray-400">Total Sent</span>
          </div>
          <span className="text-sm font-mono text-white">
            {formatBytes(network.bytesSent)}
          </span>
        </div>
      </div>

      {/* Packet Stats */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Packets In: {network.packetsReceived.toLocaleString()}</span>
          <span>Packets Out: {network.packetsSent.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default NetworkWidget;
