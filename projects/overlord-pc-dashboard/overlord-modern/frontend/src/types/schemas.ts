export interface Process {
  pid: number;
  ppid?: number;
  name: string;
  cpu_percent?: number;
  memory_mb?: number;
  status?: string;
  children: Process[];
}

export interface SystemStats {
  cpu_percent?: number;
  cpu_count_physical?: number;
  cpu_count_logical?: number;
  cpu_freq_mhz?: number;

  memory_percent?: number;
  memory_used_gb?: number;
  memory_total_gb?: number;
  memory_available_gb?: number;
  swap_percent?: number;

  disk_percent?: number;
  disk_used_gb?: number;
  disk_total_gb?: number;

  network_sent_mb?: number;
  network_recv_mb?: number;

  gpu_percent?: number;
  gpu_memory_percent?: number;
  gpu_temperature_c?: number;

  service_status?: Record<string, boolean>;
  processes?: Process[];
  
  id: number;
  created_at: string; 
}
