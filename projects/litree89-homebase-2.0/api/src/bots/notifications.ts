/**
 * Notification Hub - Multi-channel alert delivery
 * @workspace Sends alerts to Discord, webhooks, SMS, etc.
 */

import { Alert } from '../bots/types';

export interface NotificationConfig {
  discord?: {
    webhookUrl: string;
    enabled: boolean;
  };
  webhook?: {
    url: string;
    enabled: boolean;
    headers?: Record<string, string>;
  };
  twilio?: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
    toNumber: string;
    enabled: boolean;
  };
}

export class NotificationHub {
  private config: NotificationConfig;

  constructor() {
    this.config = {
      discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
        enabled: !!process.env.DISCORD_WEBHOOK_URL,
      },
      webhook: {
        url: process.env.ALERT_WEBHOOK_URL || '',
        enabled: !!process.env.ALERT_WEBHOOK_URL,
      },
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        fromNumber: process.env.TWILIO_FROM_NUMBER || '',
        toNumber: process.env.TWILIO_TO_NUMBER || '',
        enabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_TO_NUMBER),
      },
    };
  }

  async send(alert: Alert): Promise<void> {
    const promises: Promise<void>[] = [];

    // Always log to console
    this.logToConsole(alert);

    // Send to enabled channels
    if (this.config.discord?.enabled) {
      promises.push(this.sendDiscord(alert));
    }

    if (this.config.webhook?.enabled) {
      promises.push(this.sendWebhook(alert));
    }

    // Only SMS for urgent alerts
    if (this.config.twilio?.enabled && alert.priority === 'urgent') {
      promises.push(this.sendSMS(alert));
    }

    await Promise.allSettled(promises);
  }

  private logToConsole(alert: Alert): void {
    const emoji =
      alert.priority === 'urgent'
        ? '🚨'
        : alert.priority === 'high'
        ? '⚠️'
        : alert.priority === 'medium'
        ? '📢'
        : 'ℹ️';

    console.log(`${emoji} [${alert.type.toUpperCase()}] ${alert.title}`);
    console.log(`   ${alert.message}`);
  }

  async sendDiscord(alert: Alert): Promise<void> {
    const url = this.config.discord?.webhookUrl;
    if (!url) return;

    try {
      const color =
        alert.priority === 'urgent'
          ? 0xff0000
          : alert.priority === 'high'
          ? 0xffa500
          : alert.priority === 'medium'
          ? 0x00ff00
          : 0x808080;

      const payload = {
        username: 'HomeBase Bot',
        avatar_url: 'https://i.imgur.com/4M34hi2.png',
        embeds: [
          {
            title: alert.title,
            description: alert.message,
            color,
            timestamp: new Date().toISOString(),
            footer: {
              text: `Bot: ${alert.botId} | Type: ${alert.type}`,
            },
            fields: this.formatDataFields(alert.data),
          },
        ],
      };

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[NotificationHub] Discord sent');
    } catch (error) {
      console.error('[NotificationHub] Discord failed:', error);
    }
  }

  async sendWebhook(alert: Alert): Promise<void> {
    const url = this.config.webhook?.url;
    if (!url) return;

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.webhook?.headers,
        },
        body: JSON.stringify({
          ...alert,
          sentAt: new Date().toISOString(),
        }),
      });

      console.log('[NotificationHub] Webhook sent');
    } catch (error) {
      console.error('[NotificationHub] Webhook failed:', error);
    }
  }

  async sendSMS(alert: Alert): Promise<void> {
    const { accountSid, authToken, fromNumber, toNumber } = this.config.twilio || {};
    if (!accountSid || !authToken || !fromNumber || !toNumber) return;

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const message = `🚨 ${alert.title}\n${alert.message}`;

      await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: toNumber,
          From: fromNumber,
          Body: message.substring(0, 160), // SMS limit
        }),
      });

      console.log('[NotificationHub] SMS sent');
    } catch (error) {
      console.error('[NotificationHub] SMS failed:', error);
    }
  }

  private formatDataFields(
    data: Record<string, unknown>,
  ): Array<{ name: string; value: string; inline: boolean }> {
    const fields: Array<{ name: string; value: string; inline: boolean }> = [];

    for (const [key, value] of Object.entries(data || {})) {
      if (value !== null && value !== undefined) {
        let displayValue = String(value);

        // Format numbers nicely
        if (typeof value === 'number') {
          if (key.toLowerCase().includes('price') || key.toLowerCase().includes('usd')) {
            displayValue = `$${value.toLocaleString()}`;
          } else if (
            key.toLowerCase().includes('percent') ||
            key.toLowerCase().includes('change')
          ) {
            displayValue = `${value.toFixed(2)}%`;
          }
        }

        fields.push({
          name: key.replace(/([A-Z])/g, ' $1').trim(),
          value: displayValue,
          inline: true,
        });
      }
    }

    return fields.slice(0, 25); // Discord limit
  }
}

export const notificationHub = new NotificationHub();
