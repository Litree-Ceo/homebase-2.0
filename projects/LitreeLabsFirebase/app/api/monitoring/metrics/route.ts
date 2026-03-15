import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SYSTEM METRICS
 * Returns aggregated metrics for monitoring dashboard
 */

export async function GET() {
  try {
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get user counts
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    
    // Get recent activity (24h)
    const recentActivitySnapshot = await db
      .collection('activity')
      .where('timestamp', '>=', oneDayAgo)
      .get();
    const dailyActiveUsers = new Set(
      recentActivitySnapshot.docs.map(doc => doc.data().userId)
    ).size;

    // Get transactions (7d)
    const transactionsSnapshot = await db
      .collection('transactions')
      .where('createdAt', '>=', sevenDaysAgo)
      .get();
    
    const weeklyRevenue = transactionsSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    // Get tier distribution
    const tierCounts: Record<string, number> = {};
    usersSnapshot.docs.forEach(doc => {
      const tier = doc.data().tier || 'free';
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      users: {
        total: totalUsers,
        dailyActive: dailyActiveUsers,
        byTier: tierCounts,
      },
      revenue: {
        weekly: weeklyRevenue,
        monthlyProjected: (weeklyRevenue / 7) * 30,
      },
      activity: {
        last24h: recentActivitySnapshot.size,
      },
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
