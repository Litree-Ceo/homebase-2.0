import { Cpu, Activity, XCircle, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Process } from '../../types';
import React, { useState } from 'react';

const ProcessRow: React.FC<{ process: Process; level: number }> = ({ process, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren =
    (process as any).children && (process as any).children.length > 0;

  const statusColor =
    (process as any).status === 'running'
      ? 'bg-neon-green/10 text-neon-green'
      : 'bg-gray-500/10 text-gray-400';

  return (
    <>
      <tr className="border-b border-white/5 hover:bg-white/5">
        <td
          className="py-3 text-gray-400 font-mono"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          <div className="flex items-center">
            {hasChildren && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="mr-2 p-0.5 rounded hover:bg-white/10"
              >
                {isOpen ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-[22px]"></div>}
            {process.pid}
          </div>
        </td>
        <td className="py-3 truncate max-w-xs">{process.name}</td>
        <td className="py-3 font-mono">
          {process.cpu_percent?.toFixed(1) ?? '0.0'}%
        </td>
        <td className="py-3 font-mono">
          {(process as any).memory_mb?.toFixed(1) ?? '0.0'} MB
        </td>
        <td className="py-3">
          <span
            className={`px-2 py-1 ${statusColor} text-xs rounded capitalize`}
          >
            {(process as any).status}
          </span>
        </td>
        <td className="py-3">
          <button className="p-1 hover:bg-red-500/20 rounded transition-colors">
            <XCircle className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
        </td>
      </tr>
      {isOpen &&
        hasChildren &&
        (process as any).children.map((child: Process) => (
          <ProcessRow key={child.pid} process={child} level={level + 1} />
        ))}
    </>
  );
};


export function Processes() {
  const { wsConnected } = useDashboardStore();
  const processes = useDashboardStore(
    (state) => state.currentStats?.processes ?? []
  );
  
  const countProcesses = (procs: Process[]): number => {
    let count = procs.length;
    for (const proc of procs) {
      if ((proc as any).children) {
        count += countProcesses((proc as any).children);
      }
    }
    return count;
  };

  const totalProcessCount = countProcesses(processes);
  const totalCpuUsage = processes.reduce(
    (acc: number, p: Process) => acc + (p.cpu_percent || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Processes</h1>
        <p className="text-gray-400 mt-1">View and manage running processes</p>
      </div>

      {/* Process Summary */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-neon-cyan" />
          Overview
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-overlord-800/50 p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Total Processes</p>
            <p className="text-2xl font-mono text-neon-cyan">
              {wsConnected ? totalProcessCount : '--'}
            </p>
          </div>
          <div className="bg-overlord-800/50 p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Root Processes</p>
            <p className="text-2xl font-mono text-neon-green">
              {wsConnected ? processes.length : '--'}
            </p>
          </div>
          <div className="bg-overlord-800/50 p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Total CPU Usage</p>
            <p className="text-2xl font-mono text-neon-pink">
              {wsConnected ? totalCpuUsage.toFixed(1) : '--'}%
            </p>
          </div>
        </div>
      </div>

      {/* Process List */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-neon-pink" />
            Running Processes
          </h2>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full">
            <thead className="sticky top-0 bg-overlord-900/80 backdrop-blur-sm">
              <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                <th className="py-3 pl-3 font-medium">PID</th>
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">CPU %</th>
                <th className="py-3 font-medium">Memory</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {wsConnected && processes.length > 0 ? (
                processes.map((process: Process) => (
                  <ProcessRow key={process.pid} process={process} level={0} />
                ))
              ) : (
                <tr className="border-b border-white/5">
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    {wsConnected
                      ? 'No process data available.'
                      : 'Connecting to backend...'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
