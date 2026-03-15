import {
  Cpu,
  HardDrive,
  Wifi,
  Database,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | undefined;
  unit: string;
  subtitle?: string;
  trend?: number;
  color: 'cyan' | 'pink' | 'green' | 'yellow';
  icon: 'cpu' | 'memory' | 'disk' | 'network';
}

const colorClasses = {
  cyan: {
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/30',
    glow: 'shadow-neon-cyan/20',
  },
  pink: {
    text: 'text-neon-pink',
    bg: 'bg-neon-pink/10',
    border: 'border-neon-pink/30',
    glow: 'shadow-neon-pink/20',
  },
  green: {
    text: 'text-neon-green',
    bg: 'bg-neon-green/10',
    border: 'border-neon-green/30',
    glow: 'shadow-neon-green/20',
  },
  yellow: {
    text: 'text-neon-yellow',
    bg: 'bg-neon-yellow/10',
    border: 'border-neon-yellow/30',
    glow: 'shadow-neon-yellow/20',
  },
};

const icons = {
  cpu: Cpu,
  memory: Database,
  disk: HardDrive,
  network: Wifi,
};

export function StatCard({
  title,
  value,
  unit,
  subtitle,
  trend,
  color,
  icon,
}: StatCardProps) {
  const colors = colorClasses[color];
  const Icon = icons[icon];

  const displayValue = value !== undefined ? value.toFixed(1) : '--';

  return (
    <div className={`stat-card group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${colors.text}`}>
              {displayValue}
            </span>
            <span className="text-gray-500 text-sm">{unit}</span>
          </div>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-xl ${colors.bg} ${colors.border} border`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>

      {trend !== undefined && value !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          {value > trend ? (
            <TrendingUp className="w-4 h-4 text-neon-green" />
          ) : (
            <TrendingDown className="w-4 h-4 text-neon-pink" />
          )}
          <span className="text-gray-400 text-xs">
            vs {trend.toFixed(1)}
            {unit} avg
          </span>
        </div>
      )}
    </div>
  );
}
