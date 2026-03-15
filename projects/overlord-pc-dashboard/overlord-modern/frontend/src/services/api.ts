import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { SystemStats, HistoricalStats, ApiError } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const apiKey = localStorage.getItem('apiKey');
        if (apiKey) {
          config.headers['X-API-Key'] = apiKey;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Clear auth and redirect to login
          localStorage.removeItem('apiKey');
          window.location.reload();
        }
        return Promise.reject(error);
      }
    );
  }

  // Health
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Statistics
  async getCurrentStats(): Promise<SystemStats> {
    const response = await this.client.get('/stats/current');
    return response.data;
  }

  async getHistoricalStats(timeframe: string): Promise<HistoricalStats> {
    const response = await this.client.get('/stats/history', {
      params: { timeframe },
    });
    return response.data;
  }

  async getStatsSummary() {
    const response = await this.client.get('/stats/summary');
    return response.data;
  }

  // System Info
  async getSystemInfo() {
    const response = await this.client.get('/system/info');
    return response.data;
  }

  async getCpuInfo() {
    const response = await this.client.get('/system/cpu');
    return response.data;
  }

  async getMemoryInfo() {
    const response = await this.client.get('/system/memory');
    return response.data;
  }

  async getDiskInfo() {
    const response = await this.client.get('/system/disk');
    return response.data;
  }

  async getNetworkInfo() {
    const response = await this.client.get('/system/network');
    return response.data;
  }

  async getGpuInfo() {
    const response = await this.client.get('/system/gpu');
    return response.data;
  }

  // Real-Debrid
  async addMagnet(
    magnet: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post('/realdebrid/add_magnet', {
      magnet,
    });
    return response.data;
  }

  // AI App Builder
  async generateApp(prompt: string): Promise<unknown> {
    const response = await this.client.post('/app-builder/generate', {
      prompt,
    });
    return response.data;
  }

  async downloadApp(
    projectId: string
  ): Promise<{ filename: string; content: string }> {
    const response = await this.client.get(
      `/app-builder/download/${projectId}`
    );
    return response.data;
  }

  // AI Assistant - Chat
  async chatWithAssistant(
    message: string,
    history?: Array<{ role: string; content: string }>,
    model: string = 'default'
  ): Promise<{ response: string; model: string; provider: string }> {
    const response = await this.client.post('/assistant/chat', {
      message,
      history: history || [],
      model,
    });
    return response.data;
  }

  // AI Assistant - Code Generation
  async generateCode(
    prompt: string,
    language: string = 'python'
  ): Promise<{
    code: string;
    explanation: string;
    language: string;
    model: string;
  }> {
    const response = await this.client.post('/assistant/generate-code', {
      prompt,
      language,
    });
    return response.data;
  }

  // AI Assistant - Explain Code
  async explainCode(
    code: string,
    language: string = 'python'
  ): Promise<{ explanation: string; language: string; model: string }> {
    const response = await this.client.post('/assistant/explain', {
      code,
      language,
    });
    return response.data;
  }

  // AI Assistant - Agent Task
  async agentTask(
    task: string,
    context?: string,
    fast: boolean = false
  ): Promise<{ response: string; model: string; provider: string }> {
    const response = await this.client.post('/assistant/agent', {
      task,
      context,
      fast,
    });
    return response.data;
  }

  // AI Assistant - Vision to Code
  async visionToCode(
    description: string
  ): Promise<{ code: string; model: string }> {
    const response = await this.client.post('/assistant/vision-to-code', {
      description,
    });
    return response.data;
  }

  // AI Assistant - List Models
  async assistantModels(): Promise<unknown> {
    const response = await this.client.get('/assistant/models');
    return response.data;
  }

  // AI Assistant - Health Check
  async assistantHealth(): Promise<unknown> {
    const response = await this.client.get('/assistant/health');
    return response.data;
  }

  // ADB
  async getAdbDevices(): Promise<unknown> {
    const response = await this.client.get('/adb/devices');
    return response.data;
  }

  // Termux
  async termuxConnect(connection: unknown): Promise<unknown> {
    const response = await this.client.post('/termux/connect', connection);
    return response.data;
  }

  async termuxDisconnect(): Promise<unknown> {
    const response = await this.client.post('/termux/disconnect');
    return response.data;
  }

  async termuxExecute(command: string): Promise<unknown> {
    const response = await this.client.post('/termux/execute', { command });
    return response.data;
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.client.request<T>(config);
    return response.data;
  }
}

export const api = new ApiClient();
