/**
 * SignalR Hub Endpoint
 * This endpoint is a proxy for SignalR WebSocket connections
 * It should be handled by the Azure Functions API backend via next.config rewrites
 * This file serves as documentation and fallback
 */

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint is handled by next.config.ts rewrites -> backend API
  // If you're seeing this error, check:
  // 1. Backend API is running (port 7071)
  // 2. next.config.ts has correct rewrites for /api/hub
  // 3. Environment variable API_BASE_URL is set correctly

  const apiUrl = process.env.API_BASE_URL || 'http://localhost:7071';

  res.status(502).json({
    error: 'SignalR hub endpoint not properly configured',
    details: 'This endpoint should be proxied to the backend API',
    backend: apiUrl,
    message: 'Please ensure your Azure Functions API is running and accessible',
  });
}
