import React, { useState, useEffect } from 'react';
import { database } from '../lib/firebase';
import { ref, onValue, off } from 'firebase/database';

const OverlordStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const statusRef = ref(database, 'overlord/status');
    
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatus(data);
        setLastUpdate(new Date(data.timestamp));
        
        // Auto-refresh indicator
        const updateAge = Date.now() - new Date(data.timestamp).getTime();
        if (updateAge > 90000) {
          console.warn('Status stale:', updateAge);
        }
      }
      setLoading(false);
    });

    return () => off(statusRef, 'value');
  }, []);

  const getHealthColor = (health) => {
    switch(health) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'failover': return 'text-orange-400';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (health) => {
    switch(health) {
      case 'healthy': return '●';
      case 'degraded': return '◐';
      case 'failover': return '⚡';
      case 'critical': return '✖';
      default: return '?';
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) return <div className="p-4 text-gray-400">Initializing Watchtower...</div>;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className={getHealthColor(status?.overallHealth)}>
            {getStatusIcon(status?.overallHealth)}
          </span>
          Project Overlord Status
        </h2>
        <div className="text-sm text-gray-400">
          Last Update: {lastUpdate?.toLocaleTimeString()}
          {Date.now() - lastUpdate?.getTime() > 90000 && (
            <span className="text-red-400 ml-2">(STALE)</span>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-gray-400 text-sm">Host</div>
          <div className="text-white font-mono">{status?.host || 'Unknown'}</div>
          <div className="text-gray-500 text-xs">{status?.ip}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-gray-400 text-sm">Overall Health</div>
          <div className={`text-lg font-bold capitalize ${getHealthColor(status?.overallHealth)}`}>
            {status?.overallHealth || 'Unknown'}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded">
          <div className="text-gray-400 text-sm">System Uptime</div>
          <div className="text-white">
            {status?.system?.uptime?.Days}d {status?.system?.uptime?.Hours}h {status?.system?.uptime?.Minutes}m
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {status?.services?.map((service) => (
          <div key={service.Name} className={`p-4 rounded border ${
            service.Status === 'healthy' 
              ? 'border-green-600 bg-green-900/20' 
              : 'border-red-600 bg-red-900/20'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white">{service.Name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                service.Status === 'healthy' ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {service.Status}
              </span>
            </div>
            {service.Status === 'healthy' ? (
              <div className="space-y-1 text-sm text-gray-300">
                <div>Uptime: {formatUptime(service.Uptime)}</div>
                <div>Requests: {service.Requests || 0}</div>
                <div>Version: {service.Version}</div>
                <div className="text-xs text-gray-500 mt-2">
                  Memory: {Math.round(service.Memory?.rss / 1024 / 1024)}MB
                </div>
              </div>
            ) : (
              <div className="text-red-300 text-sm">
                Error: {service.Error || 'Service unreachable'}
                <div className="text-xs text-gray-500 mt-2">
                  Last check: {new Date(service.LastCheck).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Alerts */}
      {status?.alerts?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-white mb-3">Active Alerts</h3>
          <div className="space-y-2">
            {status.alerts.map((alert, idx) => (
              <div key={idx} className={`p-3 rounded flex items-center gap-3 ${
                alert.severity === 'critical' ? 'bg-red-900/30 border border-red-600' :
                alert.severity === 'warning' ? 'bg-yellow-900/30 border border-yellow-600' :
                'bg-blue-900/30 border border-blue-600'
              }`}>
                <span className="text-2xl">
                  {alert.severity === 'critical' ? '🔴' : 
                   alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <div>
                  <div className="text-white font-medium">{alert.message}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Metrics */}
      {status?.system && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-bold text-gray-400 mb-2">System Resources</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-300">
              CPU: <span className="text-white">{status.system.cpu?.toFixed(1)}%</span>
            </div>
            <div className="text-gray-300">
              Memory: <span className="text-white">
                {Math.round(status.system.memoryFree)}MB / {Math.round(status.system.memoryTotal)}GB free
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverlordStatus;
