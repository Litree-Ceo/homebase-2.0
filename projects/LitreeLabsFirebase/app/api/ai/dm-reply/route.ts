import { NextRequest, NextResponse } from "next/server";
import { generateDMReply } from "@/lib/ai";
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
      const check = await canPerformActionServer(uid, 'dmReplies');
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
    
    const incomingMessage = parsed.incomingMessage as string | undefined;
    const userNiche = parsed.userNiche as string | undefined;
    const userContext = parsed.userContext as string | undefined;

    // Verify reCAPTCHA token if RECAPTCHA_SECRET is set
    const recaptchaToken = parsed.recaptchaToken as string | undefined;
    const rec = await verifyRecaptcha(recaptchaToken);
    if (!rec.ok) {
      return NextResponse.json({ error: 'recaptcha failed' }, { status: 403 });
    }

    if (!incomingMessage || !userNiche) {
      return NextResponse.json(
        { error: "Missing required fields: incomingMessage, userNiche" },
        { status: 400 }
      );
    }

    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimiter.checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 60) } });
    }

    const reply = await generateDMReply(incomingMessage, userNiche, userContext || "");

    // Increment usage after successful generation
    if (uid) {
      await incrementUsageServer(uid, 'dmReplies');
    }

    const res = NextResponse.json({ reply });
    if (typeof rl.remaining === 'number') res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return res;
  } catch (error) {
    console.error("DM reply generation error:", error);
    captureError(error as Error);
    return NextResponse.json(
      { error: "Failed to generate DM reply" },
      { status: 500 }
    );
  }
}
