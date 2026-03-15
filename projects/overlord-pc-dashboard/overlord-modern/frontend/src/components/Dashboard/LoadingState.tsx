import { Activity, Cpu, HardDrive, Wifi } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-8 bg-white/10 rounded w-48" />

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel p-4 h-20" />
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[Cpu, Activity, HardDrive, Wifi].map((Icon, i) => (
          <div key={i} className="stat-card h-32">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-20" />
                <div className="h-8 bg-white/10 rounded w-16" />
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-container h-96">
        <div className="h-full bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}
