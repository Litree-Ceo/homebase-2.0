import { useQuery } from 'react-query';
import { api } from '../services/api';
import { useDashboardStore } from '../store/dashboardStore';

const REFRESH_INTERVAL = 30000; // 30 seconds

export function useCurrentStats() {
  const setCurrentStats = useDashboardStore((state) => state.setCurrentStats);

  return useQuery(
    'currentStats',
    async () => {
      const stats = await api.getCurrentStats();
      setCurrentStats(stats);
      return stats;
    },
    {
      refetchInterval: REFRESH_INTERVAL,
      staleTime: 15000,
      onError: (error) => {
        console.error('Failed to fetch current stats:', error);
      },
    }
  );
}

export function useHistoricalStats(timeframe: string = '24h') {
  const setHistoricalStats = useDashboardStore(
    (state) => state.setHistoricalStats
  );

  return useQuery(
    ['historicalStats', timeframe],
    async () => {
      const stats = await api.getHistoricalStats(timeframe);
      setHistoricalStats(stats);
      return stats;
    },
    {
      staleTime: 60000, // 1 minute
      onError: (error) => {
        console.error('Failed to fetch historical stats:', error);
      },
    }
  );
}

export function useStatsSummary() {
  return useQuery('statsSummary', () => api.getStatsSummary(), {
    refetchInterval: REFRESH_INTERVAL,
    staleTime: 15000,
  });
}
