import { create } from 'zustand';
import { SystemStats, HistoricalStats, RealtimeStats } from '../types';

interface DashboardState {
  // Current stats
  currentStats: SystemStats | null;
  liveStats: RealtimeStats | null;
  historicalStats: HistoricalStats | null;

  // UI state
  timeframe: '1h' | '24h' | '7d' | '30d';
  isLoading: boolean;
  error: string | null;
  wsConnected: boolean;

  // Actions
  setCurrentStats: (stats: SystemStats) => void;
  setLiveStats: (stats: RealtimeStats) => void;
  setHistoricalStats: (stats: HistoricalStats) => void;
  setTimeframe: (timeframe: '1h' | '24h' | '7d' | '30d') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setWsConnected: (connected: boolean) => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  currentStats: null,
  liveStats: null,
  historicalStats: null,
  timeframe: '24h',
  isLoading: false,
  error: null,
  wsConnected: false,

  setCurrentStats: (stats) => set({ currentStats: stats }),
  setLiveStats: (stats) => set({ liveStats: stats }),
  setHistoricalStats: (stats) => set({ historicalStats: stats }),
  setTimeframe: (timeframe) => set({ timeframe }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setWsConnected: (connected) => set({ wsConnected: connected }),
  clearError: () => set({ error: null }),
}));
