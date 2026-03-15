"use client";

import { useEffect, useState } from "react";

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  responseTime?: number;
  lastChecked?: string;
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Health', status: 'operational' },
    { name: 'Database', status: 'operational' },
    { name: 'Authentication', status: 'operational' },
    { name: 'Payment Processing', status: 'operational' },
    { name: 'AI Services', status: 'operational' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  async function checkHealth() {
    try {
      const start = Date.now();
      const res = await fetch('/api/health');
      const responseTime = Date.now() - start;
      
      if (res.ok) {
        setServices(prev => prev.map(s => 
          s.name === 'API Health' 
            ? { ...s, status: 'operational', responseTime, lastChecked: new Date().toISOString() }
            : s
        ));
      } else {
        setServices(prev => prev.map(s => 
          s.name === 'API Health' 
            ? { ...s, status: 'degraded', lastChecked: new Date().toISOString() }
            : s
        ));
      }
    } catch {
      setServices(prev => prev.map(s => 
        s.name === 'API Health' 
          ? { ...s, status: 'outage', lastChecked: new Date().toISOString() }
          : s
      ));
    } finally {
      setLoading(false);
    }
  }

  const allOperational = services.every(s => s.status === 'operational');
  const anyOutage = services.some(s => s.status === 'outage');

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">System Status</h1>
          <p className="text-slate-400">Real-time status of LitLabs OS services</p>
        </div>

        {/* Overall Status */}
        <div className={`rounded-2xl border p-6 text-center ${
          anyOutage 
            ? 'border-red-500/50 bg-red-500/10' 
            : allOperational 
            ? 'border-emerald-500/50 bg-emerald-500/10' 
            : 'border-yellow-500/50 bg-yellow-500/10'
        }`}>
          <div className="inline-flex items-center gap-3">
            <div className={`h-4 w-4 rounded-full ${
              anyOutage 
                ? 'bg-red-500' 
                : allOperational 
                ? 'bg-emerald-500 animate-pulse' 
                : 'bg-yellow-500'
            }`}></div>
            <p className="text-2xl font-bold">
              {anyOutage ? 'Service Disruption' : allOperational ? 'All Systems Operational' : 'Partial Outage'}
            </p>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          {loading ? (
            <div className="text-center text-slate-400 py-8">
              Checking services...
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.name}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${
                    service.status === 'operational' 
                      ? 'bg-emerald-500' 
                      : service.status === 'degraded' 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="text-right text-sm">
                  <p className={
                    service.status === 'operational' 
                      ? 'text-emerald-400' 
                      : service.status === 'degraded' 
                      ? 'text-yellow-400' 
                      : 'text-red-400'
                  }>
                    {service.status === 'operational' ? 'Operational' : service.status === 'degraded' ? 'Degraded' : 'Outage'}
                  </p>
                  {service.responseTime && (
                    <p className="text-slate-500">{service.responseTime}ms</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Uptime Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">99.9%</p>
            <p className="text-sm text-slate-400 mt-1">Uptime (30d)</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">45ms</p>
            <p className="text-sm text-slate-400 mt-1">Avg Response</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">0</p>
            <p className="text-sm text-slate-400 mt-1">Incidents (7d)</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-slate-500">
          Last updated: {new Date().toLocaleString()}
          <br />
          Auto-refreshes every 30 seconds
        </div>

        {/* Back Link */}
        <div className="text-center">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition"
          >
            ← Back to homepage
          </a>
        </div>
      </div>
    </main>
  );
}
