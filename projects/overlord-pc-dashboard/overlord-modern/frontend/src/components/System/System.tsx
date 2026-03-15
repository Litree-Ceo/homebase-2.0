import { Activity, Cpu, Thermometer, Zap } from 'lucide-react';

export function System() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Monitor</h1>
        <p className="text-gray-400 mt-1">
          Real-time system performance metrics
        </p>
      </div>

      {/* CPU Usage */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-neon-cyan" />
          CPU Usage
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Usage</span>
            <span className="text-neon-cyan font-mono">--%</span>
          </div>
          <div className="w-full bg-overlord-800 rounded-full h-2">
            <div
              className="bg-neon-cyan h-2 rounded-full"
              style={{ width: '0%' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-overlord-800/50 p-4 rounded-xl">
              <p className="text-gray-400 text-sm">Cores</p>
              <p className="text-xl font-mono">--</p>
            </div>
            <div className="bg-overlord-800/50 p-4 rounded-xl">
              <p className="text-gray-400 text-sm">Speed</p>
              <p className="text-xl font-mono">-- GHz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-neon-pink" />
          Memory Usage
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Used / Total</span>
            <span className="text-neon-pink font-mono">-- / -- GB</span>
          </div>
          <div className="w-full bg-overlord-800 rounded-full h-2">
            <div
              className="bg-neon-pink h-2 rounded-full"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Temperature */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-neon-yellow" />
          Temperature
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">CPU Temperature</span>
            <span className="text-neon-yellow font-mono">--°C</span>
          </div>
        </div>
      </div>

      {/* Power */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-green" />
          Power
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Status</span>
            <span className="text-neon-green">--</span>
          </div>
        </div>
      </div>
    </div>
  );
}
