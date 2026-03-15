/**
 * Meta OAuth 2.0 Authentication Handler
 * @workspace Handles Facebook/Instagram OAuth login and token management
 */

export interface MetaOAuthConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface MetaOAuthToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  userId: string;
  issuedAt: number;
}

export interface MetaOAuthUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    height: number;
    width: number;
    is_silhouette: boolean;
    url: string;
  };
}

export class MetaOAuthClient {
  private readonly config: MetaOAuthConfig;
  private readonly authorizationUrl = 'https://www.facebook.com/v18.0/dialog/oauth';
  private readonly tokenUrl = 'https://graph.instagram.com/v18.0/oauth/access_token';
  private readonly userUrl = 'https://graph.instagram.com/v18.0/me';

  constructor(config: MetaOAuthConfig) {
    this.config = config;
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(','),
      state: state || Math.random().toString(36).substring(7),
      response_type: 'code',
      display: 'popup',
    });

    return `${this.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<MetaOAuthToken> {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      redirect_uri: this.config.redirectUri,
      code,
    });

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to exchange code: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        tokenType: data.token_type || 'bearer',
        expiresIn: data.expires_in || 5184000, // 60 days default
        refreshToken: data.refresh_token,
        userId: data.user_id,
        issuedAt: Math.floor(Date.now() / 1000),
      };
    } catch (error) {
      console.error('[Meta OAuth Token Exchange Error]', error);
      throw error;
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken: string): Promise<MetaOAuthUser> {
    try {
      const response = await fetch(
        `${this.userUrl}?fields=id,name,email,picture.width(256).height(256)&access_token=${accessToken}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[Meta User Profile Error]', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<MetaOAuthToken> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      refresh_token: refreshToken,
    });

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        body: params,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        tokenType: data.token_type || 'bearer',
        expiresIn: data.expires_in,
        refreshToken: data.refresh_token || refreshToken,
        userId: data.user_id,
        issuedAt: Math.floor(Date.now() / 1000),
      };
    } catch (error) {
      console.error('[Meta Token Refresh Error]', error);
      throw error;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: MetaOAuthToken, bufferSeconds: number = 300): boolean {
    const expiresAt = token.issuedAt + token.expiresIn;
    return Math.floor(Date.now() / 1000) > expiresAt - bufferSeconds;
  }
}

/**
 * Initialize Meta OAuth client
 */
export function initializeMetaOAuth(config: MetaOAuthConfig): MetaOAuthClient {
  return new MetaOAuthClient(config);
}

/**
 * Hook for React components
 */
export function useMetaOAuth() {
  const client = new MetaOAuthClient({
    appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    redirectUri: `${globalThis.window === undefined ? '' : globalThis.window.location.origin}/api/meta/callback`,
    scope: [
      'pages_manage_posts',
      'pages_read_engagement',
      'pages_manage_metadata',
      'instagram_basic',
      'instagram_graph_user_profile',
      'instagram_graph_user_media',
    ],
  });

  return client;
}
