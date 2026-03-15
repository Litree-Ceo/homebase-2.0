import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * UPTIME MONITORING
 * Records uptime checks and provides historical data
 * Call this endpoint every 1-5 minutes from external monitoring
 */

export async function GET() {
  const start = Date.now();
  
  try {
    // Check database connectivity
    const db = getAdminDb();
    const isDbHealthy = !!db;
    
    const responseTime = Date.now() - start;
    const status = {
      timestamp: new Date().toISOString(),
      status: 'operational',
      responseTime,
      services: {
        database: isDbHealthy ? 'operational' : 'degraded',
        api: 'operational',
      },
    };

    // Log uptime check (optional)
    if (db && process.env.NODE_ENV === 'production') {
      try {
        await db.collection('uptime_logs').add({
          ...status,
          createdAt: new Date(),
        });
      } catch (err) {
        console.warn('Failed to log uptime check:', err);
      }
    }

    return NextResponse.json(status);
  } catch (error) {
    const responseTime = Date.now() - start;
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Webhook for external monitoring services (Uptime Robot, Pingdom, etc.)
  return NextResponse.json({ received: true });
}
