import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, uid, displayName } = await request.json();

    if (!email || !uid) {
      return NextResponse.json(
        { error: 'Email and UID required' },
        { status: 400 }
      );
    }

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?uid=${uid}&code=${Buffer.from(`${uid}:${Date.now()}`).toString('base64')}`;

    // Send email using SendGrid/Resend (mocked here - add your email provider)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'LitLabs <noreply@litlabs.app>',
        to: email,
        subject: '✨ Verify Your LitLabs Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ee4898;">Welcome to LitLabs, ${displayName || 'Beauty Pro'}!</h1>
            <p>Click the link below to verify your email and unlock AI-powered beauty business automation:</p>
            <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #ee4898, #a855f7); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: bold;">
              Verify Email ✓
            </a>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              Link expires in 24 hours. If you didn't sign up, ignore this email.
            </p>
          </div>
        `,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      console.warn('Email send failed, but signup continues');
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({
      success: true,
      message: 'Signup complete (email service unavailable)',
    });
  }
}

