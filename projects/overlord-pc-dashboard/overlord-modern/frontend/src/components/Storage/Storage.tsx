import { HardDrive, Database, Trash2 } from 'lucide-react';

export function Storage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Storage</h1>
        <p className="text-gray-400 mt-1">
          Manage disk space and storage devices
        </p>
      </div>

      {/* Main Storage */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-neon-cyan" />
          Primary Drive
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Used / Total</span>
            <span className="text-neon-cyan font-mono">-- / -- GB</span>
          </div>
          <div className="w-full bg-overlord-800 rounded-full h-3">
            <div
              className="bg-neon-cyan h-3 rounded-full"
              style={{ width: '0%' }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-overlord-800/50 p-4 rounded-xl">
              <p className="text-gray-400 text-sm">Used</p>
              <p className="text-xl font-mono">-- GB</p>
            </div>
            <div className="bg-overlord-800/50 p-4 rounded-xl">
              <p className="text-gray-400 text-sm">Free</p>
              <p className="text-xl font-mono">-- GB</p>
            </div>
            <div className="bg-overlord-800/50 p-4 rounded-xl">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-xl font-mono">-- GB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Storage */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-neon-pink" />
          Database
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">PostgreSQL Database</span>
            <span className="text-neon-pink font-mono">-- MB</span>
          </div>
        </div>
      </div>

      {/* External Storage */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-neon-yellow" />
          External Storage
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Status</span>
            <span className="text-gray-500">Not Connected</span>
          </div>
        </div>
      </div>

      {/* Cleanup */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-400" />
          Cleanup
        </h2>
        <div className="space-y-4">
          <button className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-left transition-colors">
            <p className="font-medium">Clear Cache</p>
            <p className="text-sm text-red-400/70">
              Free up space by clearing temporary files
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
