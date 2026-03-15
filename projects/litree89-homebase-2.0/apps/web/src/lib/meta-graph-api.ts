/**
 * Meta Graph API Client (v18.0+)
 * @workspace Unified client for Facebook, Instagram, WhatsApp Graph APIs
 * Supports: OAuth 2.0, token refresh, pagination, error handling
 */

export interface MetaGraphConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  apiVersion: string;
  businessAccountId?: string;
  baseUrl?: string;
}

export interface MetaApiResponse<T = any> {
  data?: T;
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export interface InstagramBusinessAccount {
  id: string;
  name: string;
  username: string;
  biography: string;
  website: string;
  profile_picture_url: string;
  followers_count: number;
  media_count: number;
}

export interface InstagramInsights {
  name: string;
  period: string;
  values: Array<{
    value: number;
  }>;
  title: string;
  description: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  fan_count?: number;
  followers_count?: number;
  likes?: number;
}

export interface FacebookPost {
  created_time: string;
  message: string;
  story: string;
  permalink_url: string;
  type: string;
  id: string;
}

export interface FacebookInsights {
  name: string;
  period: string;
  values: Array<{
    value: number | Record<string, number>;
  }>;
  title?: string;
  description?: string;
}

export class MetaGraphApiClient {
  private readonly config: MetaGraphConfig;
  private readonly baseUrl: string;

  constructor(config: MetaGraphConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl ?? `https://graph.facebook.com/${config.apiVersion}`;
  }

  /**
   * Make authenticated request to Meta Graph API
   */
  private async makeRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: Record<string, any>,
    accessToken: string = this.config.accessToken,
  ): Promise<MetaApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add access token
    url.searchParams.append('access_token', accessToken);

    const serializeParam = (value: unknown) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }
      return JSON.stringify(value);
    };

    const options: RequestInit = { method };

    if (data) {
      if (method === 'GET') {
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            url.searchParams.append(key, serializeParam(value));
          }
        });
      } else {
        const bodyParams = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            bodyParams.append(key, serializeParam(value));
          }
        });

        options.body = bodyParams;
        options.headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        };
      }
    }

    try {
      const response = await fetch(url.toString(), options);
      const responseData = await response.json();

      if (!response.ok) {
        console.error('[Meta Graph API Error]', {
          endpoint,
          status: response.status,
          error: responseData.error,
        });

        if (response.status === 401) {
          // Token expired - trigger refresh
          throw new Error('Access token expired');
        }

        return {
          error: responseData.error || {
            message: `HTTP ${response.status}`,
            type: 'api_error',
            code: response.status,
            fbtrace_id: response.headers.get('x-fb-trace-id') || '',
          },
        };
      }

      if (
        responseData !== null &&
        typeof responseData === 'object' &&
        ('data' in responseData || 'paging' in responseData || 'error' in responseData)
      ) {
        return responseData as MetaApiResponse<T>;
      }

      return { data: responseData as T };
    } catch (error) {
      console.error('[Meta Graph API Network Error]', error);
      throw error;
    }
  }

  /**
   * Get Instagram Business Account
   */
  async getInstagramBusinessAccount(pageId: string): Promise<InstagramBusinessAccount | null> {
    const response = await this.makeRequest<{
      instagram_business_account?: InstagramBusinessAccount;
    }>(`/${pageId}`, 'GET', {
      fields:
        'instagram_business_account{id,username,biography,website,profile_picture_url,followers_count,media_count,name}',
    });

    if (response.error || !response.data?.instagram_business_account) {
      return null;
    }

    return response.data.instagram_business_account;
  }

  /**
   * Get Instagram media (posts)
   */
  async getInstagramMedia(businessAccountId: string, limit: number = 25) {
    const response = await this.makeRequest(`/${businessAccountId}/media`, 'GET', {
      fields:
        'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count',
      limit,
    });

    return response.data || [];
  }

  /**
   * Get Instagram insights (analytics)
   */
  async getInstagramInsights(
    businessAccountId: string,
    metrics: string[] = ['impressions', 'reach', 'profile_visits', 'follower_count'],
  ): Promise<InstagramInsights[]> {
    const response = await this.makeRequest<InstagramInsights[]>(
      `/${businessAccountId}/insights`,
      'GET',
      {
        metric: metrics.join(','),
        period: 'day',
      },
    );

    return response.data || [];
  }

  /**
   * Create Facebook post
   */
  async createFacebookPost(
    pageId: string,
    message: string,
    link?: string,
    pageAccessToken?: string,
  ): Promise<{ id: string } | null> {
    const response = await this.makeRequest<{ id: string }>(
      `/${pageId}/feed`,
      'POST',
      {
        message,
        link,
      },
      pageAccessToken,
    );

    return response.data || null;
  }

  /**
   * Get Facebook page posts
   */
  async getFacebookPagePosts(pageId: string, limit: number = 25, pageAccessToken?: string) {
    const response = await this.makeRequest(
      `/${pageId}/posts`,
      'GET',
      {
        fields: 'created_time,message,story,permalink_url,type,id',
        limit,
      },
      pageAccessToken,
    );

    return response.data || [];
  }

  /**
   * Get Facebook page insights
   */
  async getFacebookPageInsights(
    pageId: string,
    metrics: string[] = ['page_fans', 'page_engaged_users', 'page_post_engagements'],
    pageAccessToken?: string,
  ): Promise<FacebookInsights[]> {
    const response = await this.makeRequest<FacebookInsights[]>(
      `/${pageId}/insights`,
      'GET',
      {
        metric: metrics.join(','),
        period: 'day',
      },
      pageAccessToken,
    );

    return response.data || [];
  }

  /**
   * Get Facebook pages for user
   */
  async getFacebookPages(): Promise<FacebookPage[]> {
    const response = await this.makeRequest<FacebookPage[]>('/me/accounts', 'GET', {
      fields: 'id,name,access_token,category,fan_count,followers_count',
    });

    const pages = response.data || [];
    return pages.map(page => ({
      ...page,
      likes: page.likes ?? page.fan_count ?? page.followers_count,
    }));
  }

  /**
   * Upload photo to Facebook
   */
  async uploadPhotoToFacebook(
    pageId: string,
    imageUrl: string,
    caption?: string,
    pageAccessToken?: string,
  ): Promise<{ id: string } | null> {
    const response = await this.makeRequest<{ id: string }>(
      `/${pageId}/photos`,
      'POST',
      {
        url: imageUrl,
        caption,
      },
      pageAccessToken,
    );

    return response.data || null;
  }

  /**
   * Get user profile information
   */
  async getUserProfile() {
    const response = await this.makeRequest('/me', 'GET', {
      fields: 'id,name,email,picture.width(256).height(256)',
    });

    return response.data;
  }

  /**
   * Get all accessible pages and accounts
   */
  async getAllAccounts() {
    const pages = await this.getFacebookPages();
    return {
      pages,
      instagramAccounts: await Promise.all(
        pages.map(page => this.getInstagramBusinessAccount(page.id)),
      ),
    };
  }

  /**
   * Exchange a short-lived user token for a long-lived token (if applicable)
   */
  async refreshAccessToken(shortLivedToken: string): Promise<string | null> {
    try {
      const url = new URL(`${this.baseUrl}/oauth/access_token`);
      url.searchParams.append('grant_type', 'fb_exchange_token');
      url.searchParams.append('client_id', this.config.appId);
      url.searchParams.append('client_secret', this.config.appSecret);
      url.searchParams.append('fb_exchange_token', shortLivedToken);

      const response = await fetch(url.toString(), { method: 'GET' });
      const data = await response.json();

      if (data.access_token) {
        this.config.accessToken = data.access_token;
        return data.access_token;
      }

      return null;
    } catch (error) {
      console.error('[Meta Token Refresh Error]', error);
      return null;
    }
  }

  /**
   * Handle webhook verification
   */
  static verifyWebhookToken(
    token: string,
    verifyToken: string,
  ): {
    valid: boolean;
    challenge?: string;
  } {
    if (token === verifyToken) {
      return { valid: true };
    }
    return { valid: false };
  }
}

/**
 * Initialize Meta Graph API client
 */
export function initializeMetaGraphApi(config: MetaGraphConfig): MetaGraphApiClient {
  return new MetaGraphApiClient(config);
}

/**
 * Hook for React components
 */
export function useMetaGraphApi() {
  const client = new MetaGraphApiClient({
    appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    accessToken: process.env.NEXT_PUBLIC_META_ACCESS_TOKEN || '',
    apiVersion: 'v18.0',
    businessAccountId: process.env.NEXT_PUBLIC_META_BUSINESS_ACCOUNT_ID,
  });

  return client;
}
