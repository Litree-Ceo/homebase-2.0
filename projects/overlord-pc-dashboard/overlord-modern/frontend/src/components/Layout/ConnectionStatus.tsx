import { Wifi, WifiOff } from 'lucide-react';
import { useDashboardStore } from '../../store/dashboardStore';

export function ConnectionStatus() {
  const wsConnected = useDashboardStore((state) => state.wsConnected);

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 glass-panel rounded-full text-sm">
      {wsConnected ? (
        <>
          <Wifi className="w-4 h-4 text-neon-green" />
          <span className="text-neon-green">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">Offline</span>
        </>
      )}
    </div>
  );
}
