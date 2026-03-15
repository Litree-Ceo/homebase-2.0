import { useDashboardStore } from '../../store/dashboardStore';

export function ServiceHealthCard() {
  const currentStats = useDashboardStore((state) => state.currentStats);
  const services = currentStats?.serviceStatus || {};

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <h3 className="font-semibold text-white mb-2">Service Health</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(services).map(([service, isRunning]) => (
          <div key={service} className="flex items-center space-x-2">
            <span
              className={`h-2 w-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}
            ></span>
            <span className="text-sm text-gray-300">{service}</span>
          </div>
        ))}
        {Object.keys(services).length === 0 && (
          <p className="text-sm text-gray-500 col-span-2">
            No services configured.
          </p>
        )}
      </div>
    </div>
  );
}
