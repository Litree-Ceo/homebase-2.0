import { useState } from 'react';
import { Bell, Shield, Database, RefreshCw } from 'lucide-react';

export function Settings() {
  const [refreshRate, setRefreshRate] = useState(30);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 mt-1">
          Configure your dashboard preferences
        </p>
      </div>

      {/* General Settings */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-neon-cyan" />
          General
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Refresh Rate</p>
              <p className="text-sm text-gray-400">
                How often to fetch new data
              </p>
            </div>
            <select
              value={refreshRate}
              onChange={(e) => setRefreshRate(Number(e.target.value))}
              className="px-4 py-2 bg-overlord-800 border border-overlord-600 rounded-lg text-white"
            >
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-400">Use dark theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-neon-cyan' : 'bg-overlord-600'
              }`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-neon-pink" />
          Notifications
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className="text-sm text-gray-400">
                Get alerts for system events
              </p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-12 h-6 rounded-full transition-colors ${
                notifications ? 'bg-neon-cyan' : 'bg-overlord-600'
              }`}
            >
              <span
                className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-neon-green" />
          Security
        </h2>

        <div className="space-y-4">
          <button className="w-full py-3 px-4 bg-overlord-800 hover:bg-overlord-700 border border-overlord-600 rounded-xl text-left transition-colors">
            <p className="font-medium">Change API Key</p>
            <p className="text-sm text-gray-400">
              Update your authentication credentials
            </p>
          </button>

          <button className="w-full py-3 px-4 bg-overlord-800 hover:bg-overlord-700 border border-overlord-600 rounded-xl text-left transition-colors">
            <p className="font-medium">Session Management</p>
            <p className="text-sm text-gray-400">
              View and manage active sessions
            </p>
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-neon-yellow" />
          Data
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Data Retention</p>
              <p className="text-sm text-gray-400">Keep data for 30 days</p>
            </div>
            <span className="text-gray-400">System Default</span>
          </div>

          <button className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-left transition-colors">
            <p className="font-medium">Clear Local Data</p>
            <p className="text-sm text-red-400/70">
              Remove all cached data from this device
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
