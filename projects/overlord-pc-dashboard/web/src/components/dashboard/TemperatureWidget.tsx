/**
 * Temperature Widget Component
 * Displays system temperatures from various sensors
 *
 * @component TemperatureWidget
 */

import { useSystemStatsStore } from '@/lib/stores';
import { ProgressBar } from './ProgressBar';

interface TemperatureWidgetProps {
  compact?: boolean;
}

/**
 * Get temperature status color
 */
function getTempStatus(temp: number): 'normal' | 'warning' | 'critical' {
  if (temp < 50) return 'normal';
  if (temp < 70) return 'warning';
  return 'critical';
}

/**
 * Get temperature icon based on value
 */
function getTempIcon(temp: number) {
  if (temp < 50) {
    return (
      <svg
        className="w-5 h-5 text-cyan-400"
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
  if (temp < 70) {
    return (
      <svg
        className="w-5 h-5 text-yellow-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    );
  }
  return (
    <svg
      className="w-5 h-5 text-red-400 animate-pulse"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

export function TemperatureWidget({ compact = false }: TemperatureWidgetProps) {
  const temperatures = useSystemStatsStore((state) => state.temperatures);
  const isLoading = useSystemStatsStore((state) => state.isLoading);

  if (isLoading && !temperatures) {
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

  if (!temperatures) {
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
          <span>Temperature data unavailable</span>
        </div>
      </div>
    );
  }

  // Collect all available temperatures
  const tempEntries: { name: string; value: number }[] = [];
  if (temperatures.cpu)
    tempEntries.push({ name: 'CPU', value: temperatures.cpu });
  if (temperatures.gpu)
    tempEntries.push({ name: 'GPU', value: temperatures.gpu });
  if (temperatures.motherboard)
    tempEntries.push({ name: 'Motherboard', value: temperatures.motherboard });
  if (temperatures.disk)
    tempEntries.push({ name: 'Disk', value: temperatures.disk });
  temperatures.sensors.forEach((s) =>
    tempEntries.push({ name: s.name, value: s.temperature })
  );

  // Calculate average and max
  const avgTemp =
    tempEntries.length > 0
      ? tempEntries.reduce((sum, t) => sum + t.value, 0) / tempEntries.length
      : 0;
  const maxTemp =
    tempEntries.length > 0 ? Math.max(...tempEntries.map((t) => t.value)) : 0;

  if (compact) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-orange-400">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            <span className="text-sm font-medium text-white">Temp</span>
          </div>
          <span className="text-lg font-mono font-bold text-white">
            {avgTemp.toFixed(0)}°C
          </span>
        </div>
        <ProgressBar value={avgTemp} color="temperature" size="sm" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-orange-500/30 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Temperature</h3>
            <p className="text-xs text-gray-400">Sensor Readings</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-white">
            {avgTemp.toFixed(0)}°C
          </span>
          <p className="text-xs text-gray-400 mt-1">Average</p>
        </div>
      </div>

      {/* Overall Health Bar */}
      <div className="mb-4">
        <ProgressBar
          value={avgTemp}
          color="temperature"
          label="Overall"
          showPercentage
        />
      </div>

      {/* Temperature Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
        {tempEntries.slice(0, 6).map((temp) => {
          const status = getTempStatus(temp.value);
          return (
            <div
              key={temp.name}
              className={`bg-gray-800/50 rounded-lg p-3 border-l-2 ${
                status === 'critical'
                  ? 'border-red-500'
                  : status === 'warning'
                    ? 'border-yellow-500'
                    : 'border-cyan-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">{temp.name}</span>
                {getTempIcon(temp.value)}
              </div>
              <span
                className={`text-lg font-mono font-medium ${
                  status === 'critical'
                    ? 'text-red-400'
                    : status === 'warning'
                      ? 'text-yellow-400'
                      : 'text-orange-400'
                }`}
              >
                {temp.value}°C
              </span>
            </div>
          );
        })}
      </div>

      {/* Max Temperature Warning */}
      {maxTemp > 80 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm text-red-400">
              High temperature detected: {maxTemp}°C
            </span>
          </div>
        </div>
      )}

      {/* More sensors indicator */}
      {tempEntries.length > 6 && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          +{tempEntries.length - 6} more sensors
        </p>
      )}
    </div>
  );
}

export default TemperatureWidget;
