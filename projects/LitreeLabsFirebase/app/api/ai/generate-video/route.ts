import { NextRequest, NextResponse } from 'next/server';
import { generateVideoScript, generateHookVariations, analyzeVideoPerformance } from '@/lib/video-generator';
import { getUserFromRequest } from '@/lib/auth-helper';
import { incrementUsageServer, canPerformActionServer } from '@/lib/firebase-server';
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
    const { action, ...params } = body;

    // GUARDIAN: Analyze for suspicious activity
    const forwarded = request.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
    
    const guardian = Guardian.getInstance();
    const securityCheck = await guardian.analyzeUserBehavior(user.uid, 'video_generation', {
      action,
      params,
      ip,
    });

    if (!securityCheck.safe && securityCheck.threat) {
      console.warn('🛡️ GUARDIAN blocked video generation request:', securityCheck.threat);
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

    switch (action) {
      case 'generate':
        result = await generateVideoScript(params);
        break;

      case 'hooks':
        result = await generateHookVariations(params.topic, params.platform, params.count);
        break;

      case 'analyze':
        result = await analyzeVideoPerformance(params);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: generate, hooks, or analyze' },
          { status: 400 }
        );
    }

    // Increment usage after successful generation
    await incrementUsageServer(user.uid, 'aiGenerations');

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process video request' },
      { status: 500 }
    );
  }
}
