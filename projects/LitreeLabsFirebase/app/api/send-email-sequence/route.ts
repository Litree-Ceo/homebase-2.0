import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, displayName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const emailType = request.nextUrl.searchParams.get('type') || 'welcome';
    const templates: Record<string, { subject: string; html: string }> = {
      welcome: {
        subject: '✨ Welcome to LitLabs - Your AI Business Brain is Ready',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; border-radius: 12px; color: #fff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 28px; margin: 0; color: #ee4898;">Welcome, ${displayName || 'Beauty Pro'}! 🚀</h1>
            </div>
            <p style="font-size: 16px; line-height: 1.6;">Your LitLabs account is live and ready to help you:</p>
            <ul style="font-size: 14px; line-height: 2;">
              <li>✅ Generate daily posts in 30 seconds</li>
              <li>✅ Reply to DMs like an AI pro</li>
              <li>✅ Detect and block scammers</li>
              <li>✅ Track your growth in real-time</li>
            </ul>
            <div style="margin: 30px 0; text-align: center;">
              <a href="https://litlabs-393dohjw9-larry-bols-projects.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ee4898, #a855f7); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                Access Your Dashboard →
              </a>
            </div>
            <p style="font-size: 13px; color: #ccc; text-align: center;">Next: Check your email in 24 hours for a quick tutorial 👀</p>
          </div>
        `,
      },
      tutorial: {
        subject: '📚 First Steps: Your LitLabs Quick Tutorial',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; border-radius: 12px; color: #fff;">
            <h1 style="font-size: 24px; color: #10b981;">3 Quick Wins Today</h1>
            <ol style="font-size: 14px; line-height: 2;">
              <li><strong>/daily_post</strong> — Tell AI your service, watch it generate 5 posts</li>
              <li><strong>/dm_reply</strong> — Show a DM, get smart response templates</li>
              <li><strong>/fraud_check</strong> — Paste a DM, AI flags red flags</li>
            </ol>
            <div style="background: rgba(238, 72, 152, 0.1); padding: 20px; border-left: 4px solid #ee4898; margin: 20px 0;">
              <p style="margin: 0;"><strong>Pro Tip:</strong> Start with /daily_post — it's a game changer.</p>
            </div>
            <a href="https://litlabs-393dohjw9-larry-bols-projects.vercel.app/dashboard" style="display: block; text-align: center; background: linear-gradient(135deg, #ee4898, #a855f7); color: white; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
              Try Your First Command Now
            </a>
          </div>
        `,
      },
      incentive: {
        subject: '💰 Upgrade to Pro & Get $20 Off + Exclusive Templates',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; border-radius: 12px; color: #fff;">
            <h1 style="font-size: 24px; color: #10b981;">🎁 Exclusive Offer: First Week + 50% Off</h1>
            <p>You've discovered the power of LitLabs. Now unlock:</p>
            <ul style="font-size: 14px;">
              <li>💎 Unlimited daily posts</li>
              <li>💎 Advanced fraud detection</li>
              <li>💎 Priority AI response queue</li>
              <li>💎 Growth coaching (coming soon)</li>
            </ul>
            <a href="https://litlabs-393dohjw9-larry-bols-projects.vercel.app/dashboard/billing" style="display: block; text-align: center; background: linear-gradient(135deg, #ee4898, #a855f7); color: white; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
              Claim Your $20 Off Now
            </a>
            <p style="font-size: 12px; color: #888; text-align: center;">Offer expires in 48 hours ⏱️</p>
          </div>
        `,
      },
    };

    const template = templates[emailType] || templates.welcome;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'LitLabs <noreply@litlabs.app>',
        to: email,
        subject: template.subject,
        html: template.html,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      console.warn(`Email send (${emailType}) may have failed, but continuing`);
    }

    return NextResponse.json({ success: true, type: emailType });
  } catch (error) {
    console.error('Email sequence error:', error);
    return NextResponse.json(
      { success: false, error: 'Email send failed' },
      { status: 500 }
    );
  }
}
