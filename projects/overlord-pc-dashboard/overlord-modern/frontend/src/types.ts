export interface Post {
  id: number;
  author: string;
  time: string;
  content: string;
  type: string;
  likes: number;
  comments: number;
}

export interface SystemStats {
  cpuPercent: number;
  memoryPercent: number;
  memoryUsedGb: number;
  diskPercent: number;
  networkRecv: number;
  networkSent: number;
  serviceStatus: Record<string, boolean>;
  processes: Process[];
}

export interface RealtimeStats {
  cpuPercent: number;
  memoryPercent: number;
  networkRecv: number;
  networkSent: number;
}

export interface HistoricalStats {
  timestamps: string[];
  cpu: number[];
  memory: number[];
  disk: number[];
  network: { recv: number[]; sent: number[] };
  aggregated: {
    cpuAvg: number;
    memoryAvg: number;
  };
}

export interface ApiError {
  detail: string;
}

export interface Process {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_percent: number;
}

export interface ModelInfo {
  id: string;
  description: string;
  provider: string;
}

export interface GenerationResult {
  code: string;
  explanation: string;
  language: string;
}

export interface AdbDevice {
  serial: string;
  status: string;
}
