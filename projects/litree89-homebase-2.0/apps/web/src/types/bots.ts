/**
 * Bot types for frontend
 */

export interface BotConfig {
  id: string;
  name: string;
  strategy: string;
  coins: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Signal {
  id: string;
  coin: string;
  type: 'oversold' | 'overbought' | 'price-above' | 'price-below' | 'opportunity';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface BotState {
  botId: string;
  lastRun: string;
  lastSignal: Signal | null;
  runCount: number;
  successCount: number;
  errorCount: number;
  isRunning: boolean;
}
