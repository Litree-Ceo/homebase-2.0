import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAdminDb } from './firebase-admin';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export interface SecurityThreat {
  type: 'rate_limit_abuse' | 'fraud' | 'spam' | 'suspicious_activity' | 'api_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip?: string;
  details: string;
  timestamp: Date;
  autoBlocked: boolean;
}

export interface SecurityReport {
  period: string;
  threats: SecurityThreat[];
  blockedUsers: number;
  totalIncidents: number;
  recommendations: string[];
}

/**
 * GUARDIAN - AI Security Bot
 * Monitors for fraud, abuse, and suspicious activity
 */
export class Guardian {
  private static instance: Guardian;
  private alertThreshold = {
    low: 10,
    medium: 5,
    high: 3,
    critical: 1,
  };

  static getInstance(): Guardian {
    if (!Guardian.instance) {
      Guardian.instance = new Guardian();
    }
    return Guardian.instance;
  }

  /**
   * Analyze user behavior for suspicious activity
   */
  async analyzeUserBehavior(
    userId: string,
    action: string,
    metadata: Record<string, any>
  ): Promise<{ safe: boolean; threat?: SecurityThreat }> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Get recent activity
    const recentActivity = await this.getRecentActivity(userId);
    
    const prompt = `You are GUARDIAN, an AI security expert analyzing user behavior for fraud/abuse.

USER: ${userId}
ACTION: ${action}
METADATA: ${JSON.stringify(metadata)}
RECENT ACTIVITY: ${JSON.stringify(recentActivity)}

ANALYZE FOR:
1. Rate limit abuse (excessive requests in short time)
2. Fraud patterns (stolen cards, fake accounts)
3. Spam behavior (mass content generation, identical requests)
4. API abuse (scraping, automation, reverse engineering)
5. Account sharing (same account from multiple IPs/locations)

RESPOND WITH JSON:
{
  "safe": true/false,
  "threatType": "rate_limit_abuse" | "fraud" | "spam" | "suspicious_activity" | "api_abuse" | null,
  "severity": "low" | "medium" | "high" | "critical",
  "confidence": 0-1,
  "reason": "Brief explanation",
  "recommendation": "What action to take"
}

Be smart but not paranoid. False positives hurt legitimate users.`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const analysis = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));

      if (!analysis.safe && analysis.confidence > 0.7) {
        const threat: SecurityThreat = {
          type: analysis.threatType,
          severity: analysis.severity,
          userId,
          details: analysis.reason,
          timestamp: new Date(),
          autoBlocked: analysis.severity === 'critical',
        };

        // Log threat
        await this.logThreat(threat);

        // Auto-block if critical
        if (threat.autoBlocked) {
          await this.blockUser(userId, threat);
        }

        return { safe: false, threat };
      }

      return { safe: true };
    } catch (error) {
      console.error('Guardian analysis error:', error);
      return { safe: true }; // Fail open to avoid blocking legitimate users
    }
  }

  /**
   * Monitor API usage for abuse
   */
  async monitorApiUsage(
    userId: string,
    endpoint: string,
    requestsLast5Min: number
  ): Promise<boolean> {
    // Simple rate limit checks
    const limits = {
      '/api/ai/generate-content': 30,
      '/api/ai/generate-image': 10,
      '/api/ai/god-mode': 5,
    };

    const limit = limits[endpoint as keyof typeof limits] || 60;

    if (requestsLast5Min > limit) {
      const threat: SecurityThreat = {
        type: 'rate_limit_abuse',
        severity: 'high',
        userId,
        details: `${requestsLast5Min} requests to ${endpoint} in 5 minutes (limit: ${limit})`,
        timestamp: new Date(),
        autoBlocked: requestsLast5Min > limit * 2,
      };

      await this.logThreat(threat);

      if (threat.autoBlocked) {
        await this.blockUser(userId, threat);
      }

      return false;
    }

    return true;
  }

  /**
   * Check for payment fraud
   */
  async checkPaymentFraud(
    userId: string,
    paymentData: {
      amount: number;
      currency: string;
      cardBin?: string;
      ip?: string;
      email?: string;
    }
  ): Promise<{ safe: boolean; reason?: string }> {
    // Check for suspicious patterns
    const recentPayments = await this.getRecentPayments(userId);

    // Multiple failed payments
    if (recentPayments.failedCount > 3) {
      return {
        safe: false,
        reason: 'Multiple failed payment attempts detected',
      };
    }

    // Rapid subscription changes (churning)
    if (recentPayments.subscriptionChanges > 5) {
      return {
        safe: false,
        reason: 'Excessive subscription changes detected',
      };
    }

    // First payment from new account (higher risk)
    if (recentPayments.totalPayments === 0 && paymentData.amount > 50) {
      // Flag for manual review but allow
      await this.logThreat({
        type: 'fraud',
        severity: 'low',
        userId,
        details: 'First payment from new account (high value)',
        timestamp: new Date(),
        autoBlocked: false,
      });
    }

    return { safe: true };
  }

  /**
   * Generate weekly security report
   */
  async generateWeeklyReport(): Promise<SecurityReport> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const db = getAdminDb();
    if (!db) {
      return {
        period: 'Last 7 days',
        threats: [],
        blockedUsers: 0,
        totalIncidents: 0,
        recommendations: ['Configure Firebase Admin credentials to enable security reporting.'],
      };
    }

    const snapshot = await db
      .collection('security_threats')
      .where('timestamp', '>=', weekAgo)
      .get();

    const threats: SecurityThreat[] = snapshot.docs.map((doc) => {
      const data = doc.data() as any;
      const ts = data.timestamp;
      const asDate = ts?.toDate ? ts.toDate() : (ts as Date);
      return {
        type: data.type,
        severity: data.severity,
        userId: data.userId,
        ip: data.ip,
        details: data.details,
        timestamp: asDate || new Date(),
        autoBlocked: !!data.autoBlocked,
      } as SecurityThreat;
    });

    const blockedUsers = threats.filter(t => t.autoBlocked).length;

    // AI-generated recommendations
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `Analyze this week's security data and provide 3-5 actionable recommendations:

THREATS THIS WEEK:
${threats.map(t => `${t.type} (${t.severity}): ${t.details}`).join('\n')}

TOTAL INCIDENTS: ${threats.length}
AUTO-BLOCKED: ${blockedUsers}

Provide specific, actionable recommendations to improve security. Return as JSON array of strings.`;

    let recommendations: string[] = [];
    try {
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      recommendations = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch {
      recommendations = ['Continue monitoring user behavior', 'Review blocked accounts manually'];
    }

    return {
      period: 'Last 7 days',
      threats,
      blockedUsers,
      totalIncidents: threats.length,
      recommendations,
    };
  }

  /**
   * Log security threat to Firestore
   */
  private async logThreat(threat: SecurityThreat): Promise<void> {
    try {
      const db = getAdminDb();
      if (!db) return;
      await db.collection('security_threats').add({
        ...threat,
        timestamp: threat.timestamp,
      });
    } catch (error) {
      console.error('Failed to log threat:', error);
    }
  }

  /**
   * Block user account
   */
  private async blockUser(userId: string, threat: SecurityThreat): Promise<void> {
    try {
      const db = getAdminDb();
      if (!db) return;
      await db.collection('blocked_users').add({
        userId,
        reason: threat.details,
        type: threat.type,
        severity: threat.severity,
        blockedAt: new Date(),
        autoBlocked: true,
      });

      // TODO: Integrate with Firebase Auth to disable account
      console.log(`🛡️ GUARDIAN: Blocked user ${userId} - ${threat.details}`);
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  }

  /**
   * Get recent user activity
   */
  private async getRecentActivity(userId: string): Promise<any[]> {
    try {
      const fiveMinAgo = new Date();
      fiveMinAgo.setMinutes(fiveMinAgo.getMinutes() - 5);

      const db = getAdminDb();
      if (!db) return [];

      const snapshot = await db
        .collection('user_activity')
        .where('userId', '==', userId)
        .where('timestamp', '>=', fiveMinAgo)
        .get();
      return snapshot.docs.map((doc) => doc.data());
    } catch {
      return [];
    }
  }

  /**
   * Get recent payment history
   */
  private async getRecentPayments(userId: string): Promise<{
    totalPayments: number;
    failedCount: number;
    subscriptionChanges: number;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const db = getAdminDb();
      if (!db) return { totalPayments: 0, failedCount: 0, subscriptionChanges: 0 };

      const snapshot = await db
        .collection('payments')
        .where('userId', '==', userId)
        .where('createdAt', '>=', thirtyDaysAgo)
        .get();
      const payments = snapshot.docs.map((doc) => doc.data() as any);

      return {
        totalPayments: payments.length,
        failedCount: payments.filter(p => p.status === 'failed').length,
        subscriptionChanges: payments.filter(p => p.type === 'subscription_change').length,
      };
    } catch {
      return { totalPayments: 0, failedCount: 0, subscriptionChanges: 0 };
    }
  }
}

// Export singleton instance
export const guardian = Guardian.getInstance();
