import { NextRequest, NextResponse } from 'next/server';
import { godModeExecute, godModeVideoScript, godModeCompetitorAnalysis } from '@/lib/god-mode';
import { incrementUsageServer, canPerformActionServer } from '@/lib/firebase-server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { Guardian } from '@/lib/guardian-bot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mode, ...params } = body;

    // GUARDIAN: Analyze for suspicious activity
    const forwarded = request.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    
    const guardian = Guardian.getInstance();
    const securityCheck = await guardian.analyzeUserBehavior(user.uid, 'god_mode_api', {
      mode,
      params,
      ip,
    });

    if (!securityCheck.safe && securityCheck.threat) {
      console.warn('🛡️ GUARDIAN blocked GOD MODE request:', securityCheck.threat);
      return NextResponse.json(
        { error: "Security check failed. Please contact support if you believe this is an error." },
        { status: 403 }
      );
    }

    // Check usage limits
    const usageCheck = await canPerformActionServer(user.uid, 'aiGenerations');
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.reason, upgradeRequired: true },
        { status: 429 }
      );
    }

    let result;

    switch (mode) {
      case 'execute':
        result = await godModeExecute(params);
        break;
      
      case 'video':
        result = await godModeVideoScript(params);
        break;
      
      case 'competitor':
        result = await godModeCompetitorAnalysis(params);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid mode. Use: execute, video, or competitor' },
          { status: 400 }
        );
    }

    // Increment usage after successful generation
    await incrementUsageServer(user.uid, 'aiGenerations');

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('God Mode error:', error);
    return NextResponse.json(
      { error: 'Failed to execute God Mode' },
      { status: 500 }
    );
  }
}
