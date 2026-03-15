export interface SystemStats {
  id: number;
  createdAt: string;
  cpuPercent: number | null;
  cpuCountPhysical: number | null;
  cpuCountLogical: number | null;
  cpuFreqMhz: number | null;
  memoryPercent: number | null;
  memoryUsedGb: number | null;
  memoryTotalGb: number | null;
  memoryAvailableGb: number | null;
  swapPercent: number | null;
  diskPercent: number | null;
  diskUsedGb: number | null;
  diskTotalGb: number | null;
  networkSentMb: number | null;
  networkRecvMb: number | null;
  gpuPercent: number | null;
  gpuMemoryPercent: number | null;
  gpuTemperatureC: number | null;
}

export interface HistoricalStats {
  timeframe: '1h' | '24h' | '7d' | '30d';
  data: SystemStats[];
  aggregated: {
    cpuAvg: number;
    cpuMax: number;
    cpuMin: number;
    memoryAvg: number;
    memoryMax: number;
    sampleCount: number;
  };
}

export interface RealtimeStats {
  cpu: number;
  memory: number;
  disk: number;
  networkSent: number;
  networkRecv: number;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'stats' | 'connected' | 'error' | 'pong';
  data?: RealtimeStats;
  message?: string;
  timestamp?: string;
}

export interface User {
  id: number;
  username: string;
  email: string | null;
  apiKey: string;
  createdAt: string;
}

export interface ApiError {
  detail: string;
  status?: number;
}
