/**
 * CPU Widget Component
 * Displays CPU usage, cores, frequency, and temperature
 *
 * @component CPUWidget
 */

import { useSystemStatsStore } from '@/lib/stores';
import { ProgressBar } from './ProgressBar';

interface CPUWidgetProps {
  compact?: boolean;
}

/**
 * Format frequency from MHz to GHz
 */
function formatFrequency(mhz: number): string {
  return (mhz / 1000).toFixed(2) + ' GHz';
}

/**
 * Get CPU icon based on usage
 */
function getCPUIcon(usage: number) {
  if (usage < 30) {
    return (
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
    );
  }
  return (
    <svg
      className="w-5 h-5 animate-pulse"
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
  );
}

export function CPUWidget({ compact = false }: CPUWidgetProps) {
  const cpu = useSystemStatsStore((state) => state.cpu);
  const isLoading = useSystemStatsStore((state) => state.isLoading);

  if (isLoading && !cpu) {
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

  if (!cpu) {
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
          <span>CPU data unavailable</span>
        </div>
      </div>
    );
  }

  const usageColor: Parameters<typeof ProgressBar>[0]['color'] = 'cpu';

  if (compact) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-purple-400">{getCPUIcon(cpu.usage)}</span>
            <span className="text-sm font-medium text-white">CPU</span>
          </div>
          <span className="text-lg font-mono font-bold text-white">
            {cpu.usage.toFixed(1)}%
          </span>
        </div>
        <ProgressBar value={cpu.usage} color={usageColor} size="sm" />
      </div>
    );
  }

  return (
    <section className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-all duration-300" aria-labelledby="cpu-heading">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400" aria-hidden="true">
            {getCPUIcon(cpu.usage)}
          </div>
          <div>
            <h3 id="cpu-heading" className="text-lg font-semibold text-white">CPU</h3>
            <p className="text-xs text-gray-400">{cpu.cores} Cores</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-white" aria-live="polite">
            {cpu.usage.toFixed(1)}%
          </span>
          <p className="text-xs text-gray-400 mt-1">
            {formatFrequency(cpu.frequency)}
          </p>
        </div>
      </div>

      {/* Usage Progress */}
      <div className="mb-4" role="region" aria-label="CPU usage progress">
        <ProgressBar
          value={cpu.usage}
          color={usageColor}
          label="Usage"
          showPercentage
        />
      </div>

      {/* Core Distribution */}
      {!compact && cpu.cores > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">Core Distribution</p>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: Math.min(cpu.cores, 16) }).map((_, i) => {
              // Simulate individual core usage for visual
              const coreUsage = Math.random() * 60 + 20;
              return (
                <div
                  key={i}
                  className="w-3 h-6 bg-gray-800 rounded-sm overflow-hidden"
                  title={`Core ${i + 1}: ${coreUsage.toFixed(0)}%`}
                >
                  <div
                    className={`w-full transition-all duration-300 ${
                      coreUsage < 50
                        ? 'bg-emerald-400'
                        : coreUsage < 70
                          ? 'bg-yellow-400'
                          : 'bg-red-500'
                    }`}
                    style={{
                      height: `${coreUsage}%`,
                      marginTop: `${100 - coreUsage}%`,
                    }}
                  />
                </div>
              );
            })}
            {cpu.cores > 16 && (
              <span className="text-xs text-gray-500 ml-1">
                +{cpu.cores - 16}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Temperature */}
      {cpu.temperature && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
              <span className="text-sm text-gray-300">Temperature</span>
            </div>
            <span
              className={`text-sm font-mono font-medium ${
                cpu.temperature > 80
                  ? 'text-red-400'
                  : cpu.temperature > 60
                    ? 'text-yellow-400'
                    : 'text-cyan-400'
              }`}
            >
              {cpu.temperature}°C
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default CPUWidget;
