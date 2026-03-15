/**
 * Meta Webhook Handler
 * @workspace Handles real-time events from Meta (Instagram, Facebook)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'node:crypto';
import { storeMetaWebhookEvent } from '@/lib/cosmos';

interface MetaWebhookEvent {
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      field: string;
      value: any;
    }>;
  }>;
  object: string;
}

/**
 * Read the raw body for signature verification.
 */
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Verify Meta webhook signature
 */
function verifyWebhookSignature(rawBody: Buffer, signatureHeader: string, appSecret: string): boolean {
  const [scheme, signature] = signatureHeader.split('=');

  if (scheme?.toLowerCase() !== 'sha256' || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

/**
 * Handle webhook verification challenge
 * GET /api/webhooks/meta?hub.mode=subscribe&hub.challenge=...&hub.verify_token=...
 */
function handleVerification(req: NextApiRequest, res: NextApiResponse) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error('[Meta Webhook] Missing META_WEBHOOK_VERIFY_TOKEN env var');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    console.log('[Meta Webhook] Verification successful');
    res.status(200).send(challenge);
  } else {
    console.error('[Meta Webhook] Verification failed', { mode, token });
    res.status(403).json({ error: 'Verification failed' });
  }
}

/**
 * Process webhook event
 */
async function processWebhookEvent(event: MetaWebhookEvent): Promise<void> {
  const { entry } = event;
  const object = (event.object || '').toLowerCase();
  const isInstagramObject =
    object === 'instagram' || object === 'instagram_business_account' || object === 'instagram_business';

  for (const item of entry) {
    console.log(`[Meta Webhook] Processing ${object} event for ${item.id}`);

    if (!item.changes) continue;

    for (const change of item.changes) {
      const { field, value } = change;

      try {
        if (isInstagramObject) {
          switch (field) {
            case 'comments':
              await handleInstagramCommentsEvent(item.id, value);
              break;
            case 'messages':
              await handleInstagramMessagesEvent(item.id, value);
              break;
            case 'story_insights':
              await handleInstagramStoryInsightsEvent(item.id, value);
              break;
            default:
              console.log(`[Meta Webhook] Unhandled Instagram field: ${field}`);
          }
        } else {
          switch (field) {
            case 'feed':
              await handleFacebookFeedEvent(item.id, value);
              break;
            case 'comments':
              await handleFeedCommentEvent(item.id, value);
              break;
            case 'likes':
              await handleLikesEvent(item.id, value);
              break;
            case 'page':
              await handlePageEvent(item.id, value);
              break;
            default:
              console.log(`[Meta Webhook] Unhandled field: ${field}`);
          }
        }
      } catch (error) {
        console.error(`[Meta Webhook] Error processing ${field}:`, error);
      }
    }
  }
}

/**
 * Handle Facebook feed events (new posts, updates)
 */
async function handleFacebookFeedEvent(pageId: string, value: any): Promise<void> {
  console.log('[Meta Webhook] Facebook feed event', {
    pageId,
    postId: value.post_id,
    status: value.status,
  });

  // Store feed event to Cosmos DB for audit trail
  try {
    await storeMetaWebhookEvent({
      eventId: `fb_feed_${value.post_id}_${Date.now()}`,
      userId: pageId,
      eventType: 'facebook_feed',
      data: { postId: value.post_id, status: value.status },
      createdAt: new Date(),
      ttl: 7776000, // 90 days
    });
  } catch (error) {
    console.warn(
      '[Meta Webhook Storage Warning] Facebook feed',
      error instanceof Error ? error.message : 'Storage failed',
    );
  }
}

/**
 * Handle comments on Facebook posts
 * Future: Store and notify relevant stakeholders
 */
async function handleFeedCommentEvent(pageId: string, value: any): Promise<void> {
  console.log('[Meta Webhook] Facebook feed comment event', {
    pageId,
    objectId: value.object_id,
    commentId: value.comment_id,
  });

  // Process and store comment to Cosmos DB
  try {
    await storeMetaWebhookEvent({
      eventId: `fb_comment_${value.comment_id}_${Date.now()}`,
      userId: pageId,
      eventType: 'facebook_comment',
      data: { objectId: value.object_id, commentId: value.comment_id, text: value.text },
      createdAt: new Date(),
      ttl: 7776000,
    });
    // Trigger notifications would go here for relevant stakeholders
  } catch (error) {
    console.warn(
      '[Meta Webhook Storage Warning] Comment',
      error instanceof Error ? error.message : 'Storage failed',
    );
  }
}

/**
 * Handle likes on Facebook posts
 * Future: Update engagement metrics and analytics
 */
async function handleLikesEvent(pageId: string, value: any): Promise<void> {
  console.log('[Meta Webhook] Facebook likes event', {
    pageId,
    objectId: value.object_id,
  });

  // Update engagement metrics in Cosmos DB
  try {
    await storeMetaWebhookEvent({
      eventId: `fb_like_${value.object_id}_${Date.now()}`,
      userId: pageId,
      eventType: 'facebook_like',
      data: { objectId: value.object_id, engagementType: 'like' },
      createdAt: new Date(),
      ttl: 7776000,
    });
  } catch (error) {
    console.warn(
      '[Meta Webhook Storage Warning] Like',
      error instanceof Error ? error.message : 'Storage failed',
    );
  }
}

/**
 * Handle page-level events (subscriptions, updates)
 * Future: Maintain page status and subscription tracking
 */
async function handlePageEvent(pageId: string, value: any): Promise<void> {
  console.log('[Meta Webhook] Facebook page event', {
    pageId,
    eventType: value.event,
  });

  // Track page metadata changes
  try {
    await storeMetaWebhookEvent({
      eventId: `fb_page_${pageId}_${Date.now()}`,
      userId: pageId,
      eventType: 'facebook_page',
      data: { eventType: value.event, timestamp: value.timestamp },
      createdAt: new Date(),
      ttl: 7776000,
    });
  } catch (error) {
    console.warn(
      '[Meta Webhook Storage Warning] Page event',
      error instanceof Error ? error.message : 'Storage failed',
    );
  }
}

/**
 * Handle Instagram comments
 * Future: Store comments in database and trigger user notifications
 */
async function handleInstagramCommentsEvent(accountId: string, value: any): Promise<void> {
  console.log('[Meta Webhook] Instagram comment event', {
    accountId,
    commentId: value.id,
    text: value.text,
    username: value.from?.username,
  });

  // Store comment and notify user
  try {
    await storeMetaWebhookEvent({
      eventId: `ig_comment_${value.id}_${Date.now()}`,
      userId: accountId,
      eventType: 'instagram_comment',
      data: {
        commentId: value.id,
        text: value.text,
        fromUsername: value.from?.username,
        timestamp: value.timestamp,
      },
      createdAt: new Date(),
      ttl: 7776000,
    });
    // Send notification to user via WebSocket or push notification
  } catch (error) {
    console.warn(
      '[Meta Webhook Storage Warning] Instagram comment',
      error instanceof Error ? error.message : 'Storage failed',
    );
  }
}

/**
 * Handle Instagram Direct Messages
 * Future: Store messages and deliver notifications to user
 */
async function handleInstagramMessagesEvent(accountId: string, value: any): Promise<void> {
  console.log('[Meta Webhook] Instagram message event', {
    accountId,
    messageId: value.id,
    text: value.text,
    fromUsername: value.from?.username,
  });

  // Archive message and notify user
  try {
    await storeMetaWebhookEvent({
      eventId: `ig_message_${value.id}_${Date.now()}`,
      userId: accountId,
      eventType: 'instagram_message',
      data: {
        messageId: value.id,
        text: value.text,
        fromUsername: value.from?.username,
        timestamp: value.timestamp,
      },
      createdAt: new Date(),
      ttl: 7776000,
    });
    // Send alert to user
  } catch (error) {
    console.warn(
      '[Meta Webhook Storage Warning] Instagram message',
      error instanceof Error ? error.message : 'Storage failed',
    );
  }
}

/**
 * Handle Instagram story insights
 * Future: Update engagement and reach metrics
 */
async function handleInstagramStoryInsightsEvent(accountId: string, value: any): Promise<void> {
  console.log('[Meta Webhook] Instagram story insights event', {
    accountId,
    metric: value.metric,
    value: value.value,
  });

  // Track analytics metrics
  try {
    await storeMetaWebhookEvent({
      eventId: `ig_insights_${accountId}_${Date.now()}`,
      userId: accountId,
      eventType: 'instagram_story_insights',
      data: {
        metric: value.metric,
        metricValue: value.value,
        impressions: value.impressions,
        reach: value.reach,
      },
      createdAt: new Date(),
      ttl: 7776000,
    });
  } catch (error) {
    console.warn(
      '[Meta Webhook Storage Warning] Instagram insights',
      error instanceof Error ? error.message : 'Storage failed',
    );
  }
}

/**
 * Main webhook handler
 * GET /api/webhooks/meta - Verification
 * POST /api/webhooks/meta - Event processing
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle verification challenge
  if (req.method === 'GET') {
    return handleVerification(req, res);
  }

  // Handle webhook events
  if (req.method === 'POST') {
    try {
      // Get signature from headers (prefer sha256)
      const signatureHeaderRaw = req.headers['x-hub-signature-256'] ?? req.headers['x-hub-signature'];
      const signatureHeader = Array.isArray(signatureHeaderRaw) ? signatureHeaderRaw[0] : signatureHeaderRaw;

      if (!signatureHeader) {
        console.error('[Meta Webhook] Missing signature header');
        return res.status(403).json({ error: 'Signature verification failed' });
      }

      const appSecret = process.env.META_APP_SECRET;
      if (!appSecret) {
        console.error('[Meta Webhook] Missing META_APP_SECRET env var');
        return res.status(500).json({ error: 'Server misconfiguration' });
      }

      // Get raw request body for signature verification
      const rawBody = await getRawBody(req);

      // Verify signature (HMAC-SHA256)
      if (!verifyWebhookSignature(rawBody, signatureHeader, appSecret)) {
        console.error('[Meta Webhook] Signature verification failed');
        return res.status(403).json({ error: 'Signature verification failed' });
      }

      // Parse event body
      let event: MetaWebhookEvent;
      try {
        event = JSON.parse(rawBody.toString('utf8')) as MetaWebhookEvent;
      } catch (parseError) {
        console.error('[Meta Webhook] Invalid JSON payload', parseError);
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }

      // Process events asynchronously
      processWebhookEvent(event).catch(error => {
        console.error('[Meta Webhook] Error processing event:', error);
      });

      // Respond immediately (important for Meta to not retry)
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('[Meta Webhook Handler Error]', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
