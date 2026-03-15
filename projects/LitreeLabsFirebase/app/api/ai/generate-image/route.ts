import { NextRequest, NextResponse } from 'next/server';
import { canPerformActionServer, incrementUsageServer } from '@/lib/firebase-server';
import { Guardian } from '@/lib/guardian-bot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { uid, prompt, size = '1024x1024', quality = 'standard' } = body;

    // Check usage limits
    if (uid) {
      const check = await canPerformActionServer(uid, 'imageGenerations');
      if (!check.allowed) {
        return NextResponse.json(
          {
            error: check.reason,
            limit: check.limit,
            current: check.current,
            upgradeRequired: true,
          },
          { status: 403 }
        );
      }
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // GUARDIAN: Analyze for suspicious activity
    if (uid) {
      const forwarded = req.headers.get("x-forwarded-for") || "";
      const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
      
      const guardian = Guardian.getInstance();
      const securityCheck = await guardian.analyzeUserBehavior(uid, 'image_generation', {
        prompt,
        size,
        quality,
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

    // Enhance prompt for better business marketing images
    const enhancedPrompt = `Professional marketing image: ${prompt}. Style: high-quality, clean, vibrant colors, suitable for social media posting. Focus on visual appeal and brand aesthetics.`;

    // Call OpenAI DALL-E 3 API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size,
        quality,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate image', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Increment usage after successful generation
    if (uid) {
      await incrementUsageServer(uid, 'imageGenerations');
    }

    return NextResponse.json({
      imageUrl: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt,
      cost: quality === 'hd' ? 0.08 : 0.04, // DALL-E 3 pricing
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
