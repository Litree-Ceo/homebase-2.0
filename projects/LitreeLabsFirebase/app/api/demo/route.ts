import { NextResponse } from "next/server";
import rateLimiter from '../../../lib/rateLimiter';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { captureError } from '@/lib/sentry';

export async function POST(req: Request) {
  try {
    // Gate demo: require explicit enable via env or a secret demo token header.
    // To enable publicly set `NEXT_PUBLIC_ENABLE_DEMO=true` in your deployment.
    // For limited access, set a server env `DEMO_TOKEN` and provide it in
    // the request header `x-demo-token`.
    const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO === "true";
    const demoToken = process.env.DEMO_TOKEN;
    const reqToken = req.headers.get("x-demo-token");

    if (!demoEnabled && (!demoToken || reqToken !== demoToken)) {
      return NextResponse.json({ error: "Demo is disabled" }, { status: 403 });
    }

    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    // Use Redis-backed limiter if available, otherwise in-memory fallback inside the limiter.
    const rl = await rateLimiter.checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter || 60) } });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = body as Record<string, unknown>;
    // If RECAPTCHA_SECRET is set, require a recaptcha token and verify it
    const recaptchaToken = parsed.recaptchaToken as string | undefined;
    const rec = await verifyRecaptcha(recaptchaToken);
    if (!rec.ok) {
      return NextResponse.json({ error: 'recaptcha failed' }, { status: 403 });
    }
    const message = typeof parsed.message === "string" ? parsed.message.trim().slice(0, 500) : "";

    if (!message || message.length < 3) {
      return NextResponse.json({ error: "Please provide a short description (3+ chars)." }, { status: 400 });
    }

    // Sanitize: remove tags and collapse whitespace
    const safeMessage = message.replace(/<[^>]*>?/g, "").replace(/\s+/g, " ");

    // Demo-only canned response. Replace this with a real function call
    // to your AI backend or functions client if/when you wire secrets.
    const reply = `Demo reply: I heard: "${safeMessage}" — here are 3 quick ideas to help you book more clients this week:\n1) Post a before/after carousel with these caption prompts; 2) Send these 3 DM reply templates; 3) Run a 48-hr promo and use this CTA.`;

    return NextResponse.json({ reply });
  } catch (err) {
    try { captureError(err as Error); } catch { /* best-effort */ }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
