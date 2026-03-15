/**
 * Microsoft Graph API Client
 * Handles OAuth 2.0 authentication and interactions with Microsoft 365 services
 * (Teams, Outlook, SharePoint, etc.)
 */

interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface GraphError {
  error: {
    code: string;
    message: string;
  };
}

class MicrosoftGraphClient {
  private clientId = process.env.MICROSOFT_CLIENT_ID;
  private clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  private tenantId = process.env.MICROSOFT_TENANT_ID;
  private redirectUri = process.env.MICROSOFT_REDIRECT_URI;
  private baseUrl = 'https://graph.microsoft.com/v1.0';
  private authUrl = `https://login.microsoftonline.com/${this.tenantId}`;

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthorizationUrl(scopes: string[] = []): string {
    const defaultScopes = [
      'Teams.Send',
      'Mail.Send',
      'Calendars.Read',
      'ChatMessage.Send',
      'offline_access',
    ];

    const allScopes = [...new Set([...defaultScopes, ...scopes])];

    const params = new URLSearchParams({
      client_id: this.clientId || '',
      redirect_uri: this.redirectUri || '',
      response_type: 'code',
      scope: allScopes.join(' '),
      response_mode: 'query',
    });

    return `${this.authUrl}/oauth2/v2.0/authorize?${params}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<AccessTokenResponse> {
    const params = new URLSearchParams({
      client_id: this.clientId || '',
      client_secret: this.clientSecret || '',
      code,
      redirect_uri: this.redirectUri || '',
      grant_type: 'authorization_code',
      scope: 'https://graph.microsoft.com/.default',
    });

    const response = await fetch(`${this.authUrl}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get access token: ${error.error_description}`);
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AccessTokenResponse> {
    const params = new URLSearchParams({
      client_id: this.clientId || '',
      client_secret: this.clientSecret || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/.default',
    });

    const response = await fetch(`${this.authUrl}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    return response.json();
  }

  /**
   * Make authenticated request to Microsoft Graph API
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit & { accessToken: string }
  ): Promise<any> {
    const { accessToken, ...fetchOptions } = options;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error: GraphError = await response.json();
      throw new Error(
        `Graph API error: ${error.error.code} - ${error.error.message}`
      );
    }

    return response.json();
  }

  /**
   * Send message to Teams channel
   */
  async sendTeamsMessage(
    accessToken: string,
    teamId: string,
    channelId: string,
    message: string
  ) {
    return this.makeRequest(
      `/teams/${teamId}/channels/${channelId}/messages`,
      {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
          body: {
            content: message,
            contentType: 'html',
          },
        }),
      }
    );
  }

  /**
   * Send email via Outlook
   */
  async sendEmail(
    accessToken: string,
    to: string[],
    subject: string,
    content: string,
    isHtml = true
  ) {
    return this.makeRequest('/me/sendMail', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({
        message: {
          subject,
          body: {
            contentType: isHtml ? 'HTML' : 'text',
            content,
          },
          toRecipients: to.map((email) => ({
            emailAddress: { address: email },
          })),
        },
        saveToSentItems: true,
      }),
    });
  }

  /**
   * Get user's calendar events
   */
  async getCalendarEvents(accessToken: string, limit = 10) {
    return this.makeRequest(
      `/me/calendarview?$top=${limit}&$orderby=start/dateTime`,
      {
        method: 'GET',
        accessToken,
      }
    );
  }

  /**
   * Get user's recent emails
   */
  async getEmails(accessToken: string, limit = 10) {
    return this.makeRequest(
      `/me/messages?$top=${limit}&$orderby=receivedDateTime desc`,
      {
        method: 'GET',
        accessToken,
      }
    );
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(
    accessToken: string,
    event: {
      subject: string;
      start: string;
      end: string;
      attendees?: string[];
    }
  ) {
    return this.makeRequest('/me/events', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({
        subject: event.subject,
        start: { dateTime: event.start, timeZone: 'UTC' },
        end: { dateTime: event.end, timeZone: 'UTC' },
        attendees: event.attendees?.map((email) => ({
          emailAddress: { address: email },
          type: 'required',
        })),
      }),
    });
  }

  /**
   * Subscribe to webhook for resource changes
   */
  async subscribeToWebhook(
    accessToken: string,
    resource: string,
    notificationUrl: string,
    expirationMinutes = 4230 // Max 43200, default 4230
  ) {
    return this.makeRequest('/subscriptions', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({
        changeType: 'created,updated,deleted',
        notificationUrl,
        resource,
        expirationDateTime: new Date(
          Date.now() + expirationMinutes * 60000
        ).toISOString(),
        clientState: process.env.INTERNAL_WEBHOOK_SECRET,
      }),
    });
  }

  /**
   * Get current user profile
   */
  async getUserProfile(accessToken: string) {
    return this.makeRequest('/me', {
      method: 'GET',
      accessToken,
    });
  }
}

// Singleton instance
let instance: MicrosoftGraphClient | null = null;

export function getMicrosoftGraphClient(): MicrosoftGraphClient {
  if (!instance) {
    instance = new MicrosoftGraphClient();
  }
  return instance;
}

export { MicrosoftGraphClient };
export type { AccessTokenResponse, GraphError };
