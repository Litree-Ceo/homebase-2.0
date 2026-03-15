import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/ai";
import rateLimiter from '@/lib/rateLimiter';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { captureError } from '@/lib/sentry';
import { canPerformActionServer, incrementUsageServer } from '@/lib/firebase-server';
import { Guardian } from '@/lib/guardian-bot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = body as Record<string, unknown>;
    const uid = parsed.uid as string | undefined;
    
    // Check usage limits if user is authenticated
    if (uid) {
      const check = await canPerformActionServer(uid, 'aiGenerations');
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
    const description = parsed.description as string | undefined;

    // Validate niche/contentType/tone against allowed values
    const allowedNiches = ["barber", "lash_tech", "nail_tech", "aesthetician", "salon"] as const;
    const allowedContentTypes = ["instagram_caption", "tiktok_script", "email", "dm_opener", "money_play"] as const;
    const allowedTones = ["casual", "professional", "funny", "urgent"] as const;

    function isStringArrayMember<T extends readonly string[]>(arr: T, v: unknown): v is T[number] {
      return typeof v === 'string' && (arr as readonly string[]).includes(v);
    }

    const niche = isStringArrayMember(allowedNiches, parsed.niche) ? parsed.niche : undefined;
    const contentType = isStringArrayMember(allowedContentTypes, parsed.contentType) ? parsed.contentType : undefined;
    const tone = isStringArrayMember(allowedTones, parsed.tone) ? parsed.tone : undefined;

    // If RECAPTCHA_SECRET is set, verify token included in body
    const recaptchaToken = parsed.recaptchaToken as string | undefined;
    const rec = await verifyRecaptcha(recaptchaToken);
    if (!rec.ok) {
      return NextResponse.json({ error: 'recaptcha failed' }, { status: 403 });
    }

    // Validate input
    if (!niche || !contentType || !description) {
      return NextResponse.json(
        { error: "Missing required fields: niche, contentType, description" },
        { status: 400 }
      );
    }

    // Generate content using Google Gemini
    // Rate limit per-IP/token
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rl = await rateLimiter.checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 60) } });
    }

    // GUARDIAN: Analyze for suspicious activity
    if (uid) {
      const guardian = Guardian.getInstance();
      const securityCheck = await guardian.analyzeUserBehavior(uid, 'content_generation', {
        niche,
        contentType,
        description,
        ip,
      });

      if (!securityCheck.safe && securityCheck.threat) {
        console.warn('🛡️ GUARDIAN blocked request:', securityCheck.threat);
        return NextResponse.json(
          { error: "Security check failed. Please contact support if you believe this is an error." },
          { status: 403 }
        );
      }
    }

    // Get smart context and enhance prompt
    let enhancedDescription = description;
    // Smart context disabled during refactor - will re-enable with proper server-side implementation
    // if (uid) {
    //   const context = await getSmartContext(uid);
    //   if (context) {
    //     enhancedDescription = enhancePromptWithContext(description, context);
    //     console.log('📝 Enhanced prompt with smart context for user:', uid);
    //   }
    // }

    const result = await generateContent({
      niche,
      contentType,
      description: enhancedDescription,
      tone: tone || "casual",
    });

    // Increment usage counter and track content usage after successful generation
    if (uid) {
      await incrementUsageServer(uid, 'aiGenerations');
      // Track content disabled during refactor
      // await trackContentUsage(uid, description);
    }

    const res = NextResponse.json(result);
    if (typeof rl.remaining === 'number') res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    return res;
  } catch (error) {
    console.error("Content generation error:", error);
    captureError(error as Error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
