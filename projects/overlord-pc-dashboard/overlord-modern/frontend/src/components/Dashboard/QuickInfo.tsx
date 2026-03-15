import { Clock, Activity, Server } from 'lucide-react';
import { formatDuration, intervalToDuration } from 'date-fns';

interface QuickInfoProps {
  summary:
    | {
        periodHours: number;
        latest: {
          cpu: number | null;
          memory: number | null;
          disk: number | null;
          timestamp: string | null;
        };
        aggregates: {
          cpuAvg: number;
          cpuMax: number;
          memoryAvg: number;
          memoryMax: number;
          sampleCount: number;
        };
      }
    | undefined;
  isLoading: boolean;
}

export function QuickInfo({ summary, isLoading }: QuickInfoProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-24" />
            <div className="h-8 bg-white/10 rounded w-16 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  const uptime = summary.latest.timestamp
    ? formatDuration(
        intervalToDuration({
          start: new Date(summary.latest.timestamp),
          end: new Date(),
        }),
        { format: ['hours', 'minutes'] }
      )
    : 'Unknown';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="glass-panel p-4 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-neon-cyan/10">
          <Clock className="w-5 h-5 text-neon-cyan" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">Uptime</p>
          <p className="text-white font-semibold">{uptime}</p>
        </div>
      </div>

      <div className="glass-panel p-4 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-neon-green/10">
          <Activity className="w-5 h-5 text-neon-green" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">Peak CPU (24h)</p>
          <p className="text-white font-semibold">
            {summary.aggregates.cpuMax.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="glass-panel p-4 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-neon-pink/10">
          <Server className="w-5 h-5 text-neon-pink" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">Data Points</p>
          <p className="text-white font-semibold">
            {summary.aggregates.sampleCount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
