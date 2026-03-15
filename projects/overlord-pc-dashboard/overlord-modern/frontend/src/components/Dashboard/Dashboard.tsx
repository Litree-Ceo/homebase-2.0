import { useWebSocket } from '../../hooks/useWebSocket';
import { StatCard } from './StatCard';
import { ChartSection } from './ChartSection';
import { QuickInfo } from './QuickInfo';
import { LoadingState } from './LoadingState';
import { ServiceHealthCard } from './ServiceHealthCard';
import { RealDebridCard } from './RealDebridCard';
import { AdbCard } from './AdbCard';
import { TermuxCard } from './TermuxCard';
import {
  useCurrentStats,
  useHistoricalStats,
  useStatsSummary,
} from '../../hooks/useStats';
import { useDashboardStore } from '../../store/dashboardStore';

export function Dashboard() {
  const timeframe = useDashboardStore((state) => state.timeframe);
  const setTimeframe = useDashboardStore((state) => state.setTimeframe);
  const liveStats = useDashboardStore((state) => state.liveStats);
  const error = useDashboardStore((state) => state.error);

  // Initialize WebSocket
  useWebSocket();

  // Fetch data
  // const { isLoading: isLoadingCurrent } = useCurrentStats()
  // const { isLoading: isLoadingHistory } = useHistoricalStats(timeframe)
  const { isLoading: isLoadingCurrent, data: currentStats } = useCurrentStats();
  const { isLoading: isLoadingHistory, data: historicalStats } =
    useHistoricalStats(timeframe);
  const { data: summary, isLoading: isLoadingSummary } = useStatsSummary();

  // Merge live stats with current stats
  const displayStats = liveStats ?? currentStats;

  if (isLoadingCurrent && !currentStats) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Overview</h1>
          <p className="text-gray-400 mt-1">
            Real-time monitoring and analytics
          </p>
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Quick Info */}
      <QuickInfo summary={summary} isLoading={isLoadingSummary} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="CPU Usage"
          value={displayStats?.cpuPercent}
          unit="%"
          trend={historicalStats?.aggregated.cpuAvg}
          color="cyan"
          icon="cpu"
        />
        <StatCard
          title="Memory"
          value={displayStats?.memoryPercent}
          unit="%"
          subtitle={
            (displayStats as any)?.memory_used_gb
              ? `${(displayStats as any).memory_used_gb.toFixed(1)} GB used`
              : undefined
          }
          trend={historicalStats?.aggregated.memoryAvg}
          color="pink"
          icon="memory"
        />
        <StatCard
          title="Disk"
          value={(displayStats as any)?.disk_percent}
          unit="%"
          color="green"
          icon="disk"
        />
        <StatCard
          title="Network"
          value={liveStats?.networkRecv}
          unit=" MB/s"
          subtitle={
            liveStats?.networkSent
              ? `↑ ${liveStats.networkSent.toFixed(1)} MB/s`
              : undefined
          }
          color="yellow"
          icon="network"
        />
        <ServiceHealthCard />
        <RealDebridCard />
        <AdbCard />
        <TermuxCard />
      </div>

      {/* Charts */}
      <div className="space-y-4">
        <ChartSection
          data={
            historicalStats?.cpu.map((value, index) => ({
              time: historicalStats.timestamps[index],
              date: historicalStats.timestamps[index],
              value,
            })) || []
          }
          color="cyan"
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          isLoading={isLoadingHistory}
        />
        <ChartSection
          data={
            historicalStats?.memory.map((value, index) => ({
              time: historicalStats.timestamps[index],
              date: historicalStats.timestamps[index],
              value,
            })) || []
          }
          color="pink"
          isLoading={isLoadingHistory}
        />
      </div>
    </div>
  );
}
