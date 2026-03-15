/**
 * Meta/Facebook Metaverse SDK Configuration
 * @workspace Setup for Facebook SDK, Instagram Graph API, and VR interactions
 * Used by: pages/bots.tsx for metaverse bot deployment
 */

export const metaverseConfig = {
  // Meta Developer App Configuration
  appId: process.env.NEXT_PUBLIC_META_APP_ID || '',
  appSecret: process.env.META_APP_SECRET || '',
  pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN || '',
  businessAccountId: process.env.META_BUSINESS_ACCOUNT_ID || '',

  // Graph API Configuration
  graphApi: {
    version: 'v18.0',
    baseUrl: 'https://graph.instagram.com/v18.0',
    endpoints: {
      // Instagram Business Account endpoints
      instagramBusinessAccount: '/me/instagram_business_accounts',
      mediaList: '/ig_hashtag_search?user_id={user_id}&fields=id,name',
      insights: '/insights?metric={metric}&period=lifetime',
      // VR/Metaverse endpoints
      spaces: '/me/spaces',
      webAssets: '/me/web_assets',
      avatars: '/me/avatars',
    },
  },

  // Metaverse/VR Configuration
  metaverse: {
    // Horizon Worlds SDK
    horizonWorldsEnabled: true,
    avatarCustomization: {
      supportedFormats: ['glb', 'fbx', 'usdz'],
      maxFileSize: 50 * 1024 * 1024, // 50MB
      vrReady: true,
    },

    // Virtual Spaces & Worlds
    worldConfig: {
      maxConcurrentUsers: 100,
      supportedPlatforms: ['Quest 3', 'Quest Pro', 'PC VR', 'Browser'],
      interactionTypes: [
        'avatar-presence',
        'voice-chat',
        'spatial-audio',
        'object-interaction',
        'payment-processing',
        'live-streaming',
        'e-commerce',
      ],
    },

    // Commerce in Metaverse
    commerce: {
      enabled: true,
      supportedCurrencies: ['USD', 'EUR', 'crypto'], // crypto for Web3 integration
      paymentMethods: ['meta-pay', 'stripe', 'paddle', 'crypto'],
      productCatalog: {
        physical: true,
        digital: true,
        nfts: true,
        services: true,
      },
    },

    // Social Interactions
    social: {
      presence: true,
      voiceChat: true,
      textChat: true,
      broadcasting: true,
      recording: true,
      sharing: true,
    },
  },

  // Bot Configuration for Metaverse
  botConfig: {
    // Avatar Bot Settings
    avatar: {
      name: 'LitLabs Commerce Bot',
      description: 'AI-powered commerce and interaction bot for metaverse',
      appearance: {
        type: 'humanoid', // or 'abstract', 'animal'
        customModel: '/models/bot-avatar.glb',
      },
    },

    // AI/NLP for Bot Interactions
    ai: {
      enabled: true,
      model: 'gpt-4',
      voiceEnabled: true,
      languages: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
      capabilities: [
        'product-recommendations',
        'customer-support',
        'transaction-processing',
        'event-hosting',
        'entertainment',
      ],
    },

    // Autonomous Behaviors
    automation: {
      scheduling: true,
      eventResponse: true,
      userTracking: true,
      analyticsCollection: true,
    },

    // API Integrations
    integrations: {
      crypto: true,
      ecommerce: true,
      analytics: true,
      crm: true,
      webhooks: true,
    },
  },

  // Webhook Configuration
  webhooks: {
    verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || 'webhook_token',
    endpoints: {
      messages: '/webhook/messages',
      orders: '/webhook/orders',
      payments: '/webhook/payments',
      events: '/webhook/events',
    },
  },

  // Security & Compliance
  security: {
    appSecretProof: true, // Require app secret in requests
    dataEncryption: true,
    dataDeletion: true,
    consentManagement: true,
    gdprCompliant: true,
  },
};

/**
 * Initialize Meta SDK in browser
 * Called from pages/bots.tsx useEffect
 */
export function initializeMetaSdk(): void {
  if (globalThis.window === undefined) return;

  const win = globalThis.window as any;
  win.fbAsyncInit = () => {
    win.FB.init({
      appId: metaverseConfig.appId,
      xfbml: true,
      version: metaverseConfig.graphApi.version,
    });

    // Test the SDK
    win.FB.AppEvents.logEvent('fb_sdk_initialized');
  };

  // Load SDK script
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=${metaverseConfig.graphApi.version}&appId=${metaverseConfig.appId}`;

  document.body.appendChild(script);
}

/**
 * Call Meta Graph API
 */
export async function callMetaGraphApi(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  params: Record<string, string> = {}
): Promise<Record<string, unknown>> {
  const accessToken = metaverseConfig.pageAccessToken;
  const url = new URL(`${metaverseConfig.graphApi.baseUrl}${endpoint}`);

  // Add standard params
  url.searchParams.append('access_token', accessToken);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), { method });

  if (!response.ok) {
    throw new Error(`Meta Graph API error: ${response.statusText}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

/**
 * Deploy bot to specific Horizon World
 */
export async function deployBotToWorld(
  botId: string,
  worldId: string,
  avatarConfig: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return callMetaGraphApi('/me/spaces', 'POST', {
    name: `deployment-${botId}`,
    world_id: worldId,
    avatar_config: JSON.stringify(avatarConfig),
  });
}

/**
 * Create/Configure Avatar for Bot
 */
export async function configureAvatar(
  botName: string,
  avatarModelUrl: string
): Promise<Record<string, unknown>> {
  return callMetaGraphApi('/me/avatars', 'POST', {
    name: botName,
    model_url: avatarModelUrl,
    is_ai_agent: 'true',
  });
}

/**
 * Set up Commerce in Metaverse
 */
export async function setupCommerceSpace(
  spaceName: string,
  productCatalogId: string
): Promise<Record<string, unknown>> {
  return callMetaGraphApi('/me/spaces', 'POST', {
    name: spaceName,
    commerce_enabled: 'true',
    product_catalog_id: productCatalogId,
  });
}

export default metaverseConfig;
