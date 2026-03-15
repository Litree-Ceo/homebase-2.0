import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { Resend } from 'resend';
import { info, error } from '@/lib/serverLogger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface EmailTemplate {
  type: 'welcome' | 'tutorial' | 'incentive';
  subject: string;
  renderHtml: (userName: string, verificationLink?: string) => string;
}

const templates: Record<string, EmailTemplate> = {
  welcome: {
    type: 'welcome',
    subject: "🎉 Welcome to LitLabs - Your AI Beauty Business Assistant",
    renderHtml: (userName: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; }
            .header { background: linear-gradient(135deg, #ff0080 0%, #00d4ff 100%); padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 20px; }
            .feature { background: rgba(0,212,255,0.1); border-left: 4px solid #00d4ff; padding: 15px; margin: 10px 0; border-radius: 4px; }
            .button { display: inline-block; background: linear-gradient(135deg, #ff0080 0%, #00d4ff 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { color: #888; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Welcome to LitLabs!</h1>
              <p>Your AI-powered beauty business assistant</p>
            </div>

            <h2>Hey ${userName}! 👋</h2>
            <p>We're thrilled to have you on board! Your account is now active and ready to go.</p>

            <h3>🚀 What You Can Do Now:</h3>
            <div class="feature">
              <strong>💬 Smart DM Replies</strong><br/>
              Let AI handle your client messages. Respond faster, book more appointments.
            </div>
            <div class="feature">
              <strong>📱 Daily Post Generator</strong><br/>
              Create engaging beauty content in seconds. Posts, captions, hashtags - all automated.
            </div>
            <div class="feature">
              <strong>🛡️ Fraud Detection</strong><br/>
              Protect your business from fake inquiries and scams automatically.
            </div>

            <h3>📚 Quick Start Guide:</h3>
            <ol>
              <li>Complete your profile (2 min)</li>
              <li>Connect your Instagram account</li>
              <li>Set up your response templates</li>
              <li>Start automating!</li>
            </ol>

            <a href="https://litlabs-h0wbcvrok-larry-bols-projects.vercel.app/dashboard" class="button">Go to Dashboard</a>

            <h3>💡 Pro Tip:</h3>
            <p>Check out our template library in the left sidebar. We've pre-built templates for lash techs, nail artists, and stylists!</p>

            <div class="footer">
              <p>Questions? Reply to this email or visit our help center.</p>
              <p>&copy; 2025 LitLabs. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  tutorial: {
    type: 'tutorial',
    subject: "📚 3 Quick Wins to Try Today - LitLabs Tutorial",
    renderHtml: (userName: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; }
            .header { background: linear-gradient(135deg, #40e0d0 0%, #00d4ff 100%); padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 20px; }
            .win { background: rgba(64,224,208,0.1); border: 1px solid rgba(64,224,208,0.3); padding: 20px; margin: 15px 0; border-radius: 8px; }
            .button { display: inline-block; background: linear-gradient(135deg, #40e0d0 0%, #00d4ff 100%); color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 15px 0; font-size: 14px; }
            .footer { color: #888; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 3 Quick Wins to Master Today</h1>
              <p>Learn how to save 5+ hours per week</p>
            </div>

            <h2>Hi ${userName}! 👋</h2>
            <p>You've been using LitLabs for a few days. Now let's unlock the real power!</p>

            <h3>⚡ Quick Win #1: Auto-Reply Setup (5 min)</h3>
            <div class="win">
              <p><strong>What:</strong> Set up automatic responses to new DM inquiries</p>
              <p><strong>Why:</strong> Never miss a lead. Reply instantly even while sleeping.</p>
              <p><strong>How:</strong></p>
              <ol>
                <li>Go to Dashboard → Smart DM Replies</li>
                <li>Choose a template or create custom response</li>
                <li>Set trigger keywords (e.g., "booking", "price", "available")</li>
              </ol>
              <a href="https://litlabs-h0wbcvrok-larry-bols-projects.vercel.app/dashboard?tab=dm-replies" class="button">Try It Now</a>
            </div>

            <h3>⚡ Quick Win #2: Daily Post Generator (3 min)</h3>
            <div class="win">
              <p><strong>What:</strong> Generate a week of content at once</p>
              <p><strong>Why:</strong> Consistent posting = higher engagement + visibility</p>
              <p><strong>How:</strong></p>
              <ol>
                <li>Go to Dashboard → Daily Post Generator</li>
                <li>Pick your niche (lash tech, nail artist, etc)</li>
                <li>Generate posts → copy to clipboard → share</li>
              </ol>
              <a href="https://litlabs-h0wbcvrok-larry-bols-projects.vercel.app/dashboard?tab=posts" class="button">Generate Now</a>
            </div>

            <h3>⚡ Quick Win #3: Fraud Detection Shield (2 min)</h3>
            <div class="win">
              <p><strong>What:</strong> Screen out fake inquiries automatically</p>
              <p><strong>Why:</strong> Save time, avoid scams, focus on real clients</p>
              <p><strong>How:</strong></p>
              <ol>
                <li>Go to Dashboard → Fraud Detection</li>
                <li>Toggle "Auto-Screen" ON</li>
                <li>That's it! Fake inquiries flagged automatically</li>
              </ol>
              <a href="https://litlabs-h0wbcvrok-larry-bols-projects.vercel.app/dashboard?tab=fraud" class="button">Activate Shield</a>
            </div>

            <h3>📊 Expected Results (After 1 Week):</h3>
            <ul>
              <li>⏰ 5+ hours saved per week</li>
              <li>📈 20% more leads responded to</li>
              <li>💰 Potential +$500/mo revenue</li>
              <li>🛡️ 100% scam protection</li>
            </ul>

            <div class="footer">
              <p>Next week: We'll show you advanced AI personalization tips!</p>
              <p>&copy; 2025 LitLabs. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  incentive: {
    type: 'incentive',
    subject: "🎁 50% Off Your First Month (This Week Only!)",
    renderHtml: (userName: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; }
            .urgency { background: linear-gradient(135deg, #ff0080 0%, #ff8c00 100%); padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 20px; color: #fff; }
            .pricing { display: flex; justify-content: space-around; margin: 30px 0; }
            .plan { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; text-align: center; }
            .original { text-decoration: line-through; color: #888; }
            .discount { color: #ff0080; font-size: 24px; font-weight: bold; }
            .button { display: inline-block; background: linear-gradient(135deg, #ff0080 0%, #ff8c00 100%); color: white; padding: 15px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; font-size: 16px; }
            .footer { color: #888; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="urgency">
              <h1>🎁 50% OFF FOR 1 MONTH</h1>
              <p style="font-size: 18px; margin: 10px 0;">Ends <strong>in 48 hours</strong></p>
              <p style="font-size: 14px; opacity: 0.9;">Join 2,000+ beauty pros who are automating their business</p>
            </div>

            <h2>Hey ${userName}! 👋</h2>
            <p>You've been testing LitLabs for a week. Time to level up?</p>

            <h3>Here's the deal:</h3>
            <div class="pricing">
              <div class="plan">
                <strong>Pro Tier</strong><br/>
                <div class="original">\$99/mo</div>
                <div class="discount">\$49.50/mo</div>
                <p style="font-size: 12px; color: #ccc;">Unlimited posts<br/>Smart DM Replies<br/>Priority support</p>
              </div>
              <div class="plan">
                <strong>Enterprise</strong><br/>
                <div class="original">\$299/mo</div>
                <div class="discount">\$149.50/mo</div>
                <p style="font-size: 12px; color: #ccc;">Everything + Team<br/>Integrations<br/>24/7 support</p>
              </div>
            </div>

            <h3>💡 What You're Getting:</h3>
            <ul>
              <li>✅ Unlimited daily posts (vs 1/day on free)</li>
              <li>✅ AI-powered DM responses (save 5+ hrs/week)</li>
              <li>✅ Advanced analytics & insights</li>
              <li>✅ Fraud detection shield</li>
              <li>✅ Priority email support</li>
              <li>✅ 50% off your first month</li>
            </ul>

            <h3>⏰ Time-sensitive offer:</h3>
            <p><strong>This 50% discount expires in 48 hours.</strong> After that, it's back to full price. Don't miss out!</p>

            <a href="https://litlabs-h0wbcvrok-larry-bols-projects.vercel.app/dashboard/billing" class="button">Upgrade Now (50% Off)</a>

            <h3>Still deciding?</h3>
            <p>📞 Reply to this email with any questions. We're here to help!</p>

            <div class="footer">
              <p>Offer valid for new pro/enterprise subscribers only. Discount applies to first month, then regular pricing.</p>
              <p>&copy; 2025 LitLabs. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
};

export async function POST(request: NextRequest) {
  try {
    const { userId, email, type } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const template = templates[type];
    if (!template) {
      return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
    }

    // Get user name
    const dbRef = getAdminDb();
    if (!dbRef) {
      return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
    }
    const usersSnap = await dbRef.collection('users').where('email', '==', email).get();
    const userName = usersSnap.empty ? 'there' : (usersSnap.docs[0].data() as any).displayName || 'there';

    // Send email
    const response = await resend.emails.send({
      from: 'LitLabs <onboarding@litlabs.io>',
      to: email,
      subject: template.subject,
      html: template.renderHtml(userName),
    });

    if (response.error) {
      error('Resend error:', response.error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // Log to Firestore
    await dbRef.collection('email_sequences').add({
      userId,
      email,
      type,
      templateId: response.data?.id || 'unknown',
      sentAt: new Date(),
      status: 'sent',
      openedAt: null,
      clickedAt: null,
    });

    info(`✅ Email sent: ${email} - ${type}`);

    return NextResponse.json({
      success: true,
      message: `${type} email sent to ${email}`,
      emailId: response.data?.id,
    });
  } catch (err) {
    error('Email sequence error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
