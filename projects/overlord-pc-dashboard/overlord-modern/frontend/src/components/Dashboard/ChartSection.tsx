import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface ChartSectionProps {
  data: { time: string; date: string; value: number }[];
  color: string;
  timeframe?: '1h' | '24h' | '7d' | '30d';
  onTimeframeChange?: (timeframe: '1h' | '24h' | '7d' | '30d') => void;
  isLoading?: boolean;
}

const timeframes = [
  { value: '1h', label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
] as const;

export function ChartSection({
  data,
  timeframe,
  onTimeframeChange,
  isLoading,
}: ChartSectionProps) {
  const chartData = useMemo(() => {
    return data.map((stat) => ({
      ...stat,
      time: format(new Date(stat.time), 'HH:mm'),
      date: format(new Date(stat.date), 'MMM dd'),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="chart-container h-96 animate-pulse">
        <div className="h-full bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="chart-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Performance History</h3>

        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange && onTimeframeChange(tf.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeframe === tf.value
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff00ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff00ff" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />

            <XAxis
              dataKey="time"
              stroke="#666"
              tick={{ fill: '#666', fontSize: 12 }}
              tickLine={false}
            />

            <YAxis
              stroke="#666"
              tick={{ fill: '#666', fontSize: 12 }}
              tickLine={false}
              domain={[0, 100]}
            />

            <Tooltip
              contentStyle={{
                background: '#1e1e2f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px',
              }}
              labelStyle={{ color: '#fff', marginBottom: '8px' }}
            />

            <Area
              type="monotone"
              dataKey="cpuPercent"
              name="CPU %"
              stroke="#00d4ff"
              strokeWidth={2}
              fill="url(#colorCpu)"
            />

            <Area
              type="monotone"
              dataKey="memoryPercent"
              name="Memory %"
              stroke="#ff00ff"
              strokeWidth={2}
              fill="url(#colorMemory)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
