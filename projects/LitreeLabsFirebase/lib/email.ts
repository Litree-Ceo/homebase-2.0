import { info, error } from './serverLogger';
/**
 * Email Service
 * Supports Resend for production, dev-gated logging
 */
/**
 * Email Service
 * Supports Resend for production, console logging for development
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, replyTo = "noreply@litlabs.ai" } = options;

  if (process.env.NODE_ENV === "production" && process.env.RESEND_API_KEY) {
    // Production: Use Resend
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "noreply@litlabs.ai",
          to,
          subject,
          html,
          reply_to: replyTo,
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.statusText}`);
      }

        info(`✅ Email sent to ${to}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      error("Failed to send email:", errorMsg);
      throw err;
    }
  } else {
    // Development: Log to console
      // Development: Log to structured dev logger
      info(`📧 [DEV] Email to: ${to}`);
      info(`📧 [DEV] Subject: ${subject}`);
      info(`📧 [DEV] Body: ${html.substring(0, 100)}...`);
  }
}

// Email Templates
export async function sendWelcomeEmail(
  email: string,
  displayName: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Welcome to LitLabs! 🎉</h1>
      <p>Hi ${displayName},</p>
      <p>Your account is now active and ready to use. Start generating content for your beauty business today!</p>
      
      <div style="margin: 30px 0;">
        <p><strong>You now have access to:</strong></p>
        <ul>
          <li>✨ AI-powered Instagram & TikTok content generator</li>
          <li>💬 DM scripts and templates</li>
          <li>🎯 Promotional copy generator</li>
          <li>📊 Business automation tools</li>
        </ul>
      </div>

      <p style="text-align: center; margin-top: 40px;">
        <a href="https://litlabs.ai/dashboard" style="background-color: #ff0080; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Go to Dashboard
        </a>
      </p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        Questions? Reply to this email or visit our <a href="https://litlabs.ai/help">help center</a>.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Welcome to LitLabs! 🚀",
    html,
  });
}

export async function sendUpgradeConfirmationEmail(
  email: string,
  displayName: string,
  tier: "basic" | "pro" | "deluxe",
  amount: number
): Promise<void> {
  const tierNames = {
    basic: "Basic Plan",
    pro: "Pro Plan",
    deluxe: "Deluxe Plan",
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Upgrade Successful! ✅</h1>
      <p>Hi ${displayName},</p>
      <p>Thank you for upgrading to <strong>${tierNames[tier]}</strong>!</p>
      
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Invoice Summary:</strong></p>
        <p>Plan: ${tierNames[tier]}</p>
        <p>Amount: $${(amount / 100).toFixed(2)} USD</p>
        <p>Billing Cycle: Monthly</p>
      </div>

      <p>Your upgrade is now active. You have unlimited access to all features on the ${tierNames[tier]}.</p>

      <p style="text-align: center; margin-top: 40px;">
        <a href="https://litlabs.ai/dashboard" style="background-color: #00d4ff; color: black; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Start Creating Content
        </a>
      </p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        Need help? Reply to this email or contact support@litlabs.ai
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Upgrade Confirmed: ${tierNames[tier]} ✅`,
    html,
  });
}

export async function sendPaymentFailedEmail(
  email: string,
  displayName: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Payment Failed ⚠️</h1>
      <p>Hi ${displayName},</p>
      <p>We tried to process your subscription payment but it failed.</p>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p><strong>Why?</strong> Common reasons include:</p>
        <ul>
          <li>Card expired or invalid</li>
          <li>Insufficient funds</li>
          <li>Address mismatch</li>
        </ul>
      </div>

      <p style="text-align: center; margin-top: 40px;">
        <a href="https://litlabs.ai/dashboard/billing" style="background-color: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Update Payment Method
        </a>
      </p>

      <p style="margin-top: 30px; color: #666; font-size: 12px;">
        Your account access will be limited if payment isn't resolved within 3 days.
      </p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        Questions? Contact support@litlabs.ai
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Payment Failed: Action Required ⚠️",
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Reset Your Password</h1>
      <p>We received a request to reset your password. Click the link below to set a new password.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${resetLink}" style="background-color: #00d4ff; color: black; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </p>

      <p style="margin-top: 30px; color: #666; font-size: 12px;">
        <strong>Note:</strong> This link expires in 24 hours. If you didn't request this, ignore this email.
      </p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        Questions? Contact support@litlabs.ai
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Reset Your LitLabs Password",
    html,
  });
}

export async function sendCancellationConfirmationEmail(
  email: string,
  displayName: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Subscription Cancelled</h1>
      <p>Hi ${displayName},</p>
      <p>Your subscription has been successfully cancelled. You will have access until the end of your current billing period.</p>
      
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p>We're sorry to see you go! 😢</p>
        <p>If there's anything we can improve, please let us know.</p>
      </div>

      <p style="text-align: center; margin-top: 40px;">
        <a href="https://litlabs.ai/feedback" style="background-color: #00d4ff; color: black; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Send Feedback
        </a>
      </p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">
        Want to reactivate? You can upgrade anytime from your dashboard.
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Subscription Cancelled",
    html,
  });
}
