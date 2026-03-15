import { NextRequest, NextResponse } from "next/server";
import { generateMoneyPlay } from "@/lib/ai";
import rateLimiter from '@/lib/rateLimiter';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { captureError } from '@/lib/sentry';
import { canPerformActionServer, incrementUsageServer } from '@/lib/firebase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = body as Record<string, unknown>;
    const uid = parsed.uid as string | undefined;
    
    // Check usage limits
    if (uid) {
      const check = await canPerformActionServer(uid, 'moneyPlays');
      if (!check.allowed) {
        return NextResponse.json(
          { 
            error: check.reason,
            limit: check.limit,
            current: check.current,
            upgradeRequired: true
          },
          { status: 403 }
        );
      }
    }
    
    const userNiche = parsed.userNiche as string | undefined;
    const recentBookings = typeof parsed.recentBookings === 'number' ? parsed.recentBookings : Number(parsed.recentBookings) || 0;
    const userRevenue = typeof parsed.userRevenue === 'number' ? parsed.userRevenue : Number(parsed.userRevenue) || 0;

    const recaptchaToken = parsed.recaptchaToken as string | undefined;
    const rec = await verifyRecaptcha(recaptchaToken);
    if (!rec.ok) {
      return NextResponse.json({ error: 'recaptcha failed' }, { status: 403 });
    }

    if (!userNiche) {
      return NextResponse.json(
        { error: "Missing required field: userNiche" },
        { status: 400 }
      );
    }

    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimiter.checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 60) } });
    }

    const moneyPlay = await generateMoneyPlay(
      userNiche,
      recentBookings || 0,
      userRevenue || 0
    );

    // Increment usage after successful generation
    if (uid) {
      await incrementUsageServer(uid, 'moneyPlays');
    }

    const res = NextResponse.json(moneyPlay);
    if (typeof rl.remaining === 'number') res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return res;
  } catch (error) {
    console.error("Money play generation error:", error);
    captureError(error as Error);
    return NextResponse.json(
      { error: "Failed to generate money play" },
      { status: 500 }
    );
  }
}
