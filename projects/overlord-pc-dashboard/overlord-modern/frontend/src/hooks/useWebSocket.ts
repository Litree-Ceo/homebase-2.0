import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDashboardStore } from '../store/dashboardStore';
import { RealtimeStats } from '../types';

interface WebSocketMessage {
  type: string;
  data: RealtimeStats;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
const RECONNECT_DELAY = 5000;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const wsToken = useAuthStore((state) => state.wsToken);
  const setWsConnected = useDashboardStore((state) => state.setWsConnected);
  const setLiveStats = useDashboardStore((state) => state.setLiveStats);
  const setError = useDashboardStore((state) => state.setError);

  const connect = useCallback(() => {
    if (!wsToken) {
      setError('WebSocket token not available');
      return;
    }

    try {
      const ws = new WebSocket(`${WS_URL}?token=${wsToken}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setWsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'stats':
              if (message.data) {
                setLiveStats(message.data as RealtimeStats);
              }
              break;
            case 'connected':
              console.log('Server:', (message as any).message);
              break;
            case 'error':
              console.error('WebSocket error:', (message as any).message);
              setError((message as any).message || 'WebSocket error');
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);

        // Auto-reconnect
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setWsConnected(false);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to connect to WebSocket');
    }
  }, [wsToken, setWsConnected, setLiveStats, setError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
  }, []);

  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  useEffect(() => {
    connect();

    // Ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(sendPing, 30000);

    return () => {
      disconnect();
      clearInterval(pingInterval);
    };
  }, [connect, disconnect, sendPing]);

  return {
    disconnect,
    sendPing,
  };
}
