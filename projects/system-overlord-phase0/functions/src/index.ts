import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as cors from 'cors';

// Initialize Firebase
admin.initializeApp();

const corsHandler = cors({ origin: true });

// ============================================
// WebRTC Signaling Functions
// ============================================

export const webrtcSignal = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const { callerId, calleeId, offer, answer, iceCandidate } = req.body;

    try {
      if (offer) {
        // Store offer in Firestore
        await admin.firestore().collection('webrtc_calls').add({
          callerId,
          calleeId,
          offer,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          status: 'pending',
        });
        res.json({ success: true, message: 'Offer stored' });
      } else if (answer) {
        // Update with answer
        const callsSnapshot = await admin
          .firestore()
          .collection('webrtc_calls')
          .where('callerId', '==', calleeId)
          .where('calleeId', '==', callerId)
          .limit(1)
          .get();

        if (!callsSnapshot.empty) {
          await callsSnapshot.docs[0].ref.update({
            answer,
            status: 'connected',
          });
        }
        res.json({ success: true, message: 'Answer stored' });
      } else if (iceCandidate) {
        // Store ICE candidate
        await admin.firestore().collection('ice_candidates').add({
          callerId,
          calleeId,
          candidate: iceCandidate,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.json({ success: true, message: 'ICE candidate stored' });
      }
    } catch (error) {
      console.error('[WebRTC] Error:', error);
      res.status(500).json({ error: 'Signaling failed' });
    }
  });
});

// ============================================
// GG.deals Integration
// ============================================

export const ggDealsSync = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // Fetch from GG.deals API
      const response = await axios.get('https://www.gg.deals/api/games', {
        params: {
          limit: 50,
          offset: 0,
          sort: 'release_date',
          order: 'desc',
        },
      });

      const deals = response.data.data.map((game: any) => ({
        id: game.id,
        title: game.title,
        thumb: game.thumb,
        price: game.minPrice || game.priceNew,
        originalPrice: game.priceOld,
        url: `https://www.gg.deals/game/${game.slug}/?affiliateID=YOUR_GG_DEALS_ID`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }));

      // Batch write to Firestore
      const batch = admin.firestore().batch();
      deals.forEach((deal: any) => {
        const docRef = admin.firestore().collection('deals').doc(deal.id);
        batch.set(docRef, deal, { merge: true });
      });

      await batch.commit();
      res.json({ success: true, dealsCount: deals.length });
    } catch (error) {
      console.error('[GG.deals] Sync error:', error);
      res.status(500).json({ error: 'GG.deals sync failed' });
    }
  });
});

// ============================================
// Affiliate Click Tracking
// ============================================

export const trackAffiliateClick = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const { userId, gameId, gameTitle, dealUrl } = req.body;

    try {
      await admin.firestore().collection('affiliate_clicks').add({
        userId,
        gameId,
        gameTitle,
        dealUrl,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.json({ success: true, message: 'Click tracked' });
    } catch (error) {
      console.error('[Affiliate] Tracking error:', error);
      res.status(500).json({ error: 'Tracking failed' });
    }
  });
});

// ============================================
// Real-Debrid Integration
// ============================================

export const realDebridUnlock = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const { userId, magnetLink, apiToken } = req.body;

    try {
      const response = await axios.post(
        'https://api.real-debrid.com/rest/1.0/torrents/addMagnet',
        { magnet: magnetLink },
        {
          headers: { Authorization: `Bearer ${apiToken}` },
        }
      );

      await admin.firestore().collection('debrid_unlocks').add({
        userId,
        magnet: magnetLink,
        result: response.data,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ success: true, data: response.data });
    } catch (error) {
      console.error('[Real-Debrid] Error:', error);
      res.status(500).json({ error: 'Unlock failed' });
    }
  });
});

// ============================================
// Revenue Aggregation
// ============================================

export const aggregateRevenue = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get all revenue documents from last 24 hours
      const snapshot = await admin
        .firestore()
        .collection('revenue')
        .where('timestamp', '>=', yesterday)
        .get();

      let totalRevenue = 0;
      snapshot.forEach((doc) => {
        totalRevenue += doc.data().amount || 0;
      });

      // Store aggregated revenue
      await admin.firestore().collection('revenue_summary').add({
        totalRevenue,
        period: 'daily',
        date: now.toISOString().split('T')[0],
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[Revenue] Daily total: $${totalRevenue}`);
    } catch (error) {
      console.error('[Revenue Aggregation] Error:', error);
    }
  });

// ============================================
// Security Tool Command Execution
// ============================================

interface CommandRequest {
  toolId: string;
  parameters: Record<string, any>;
  targetAgent: 'termux' | 'pc-docker' | 'kali-remote';
  priority?: 'low' | 'normal' | 'high';
}

interface CommandValidation {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Load tool catalog from Firestore
async function getToolCatalog() {
  try {
    const catalogDoc = await admin
      .firestore()
      .collection('config')
      .doc('toolCatalog')
      .get();
    return catalogDoc.data() || {};
  } catch (error) {
    console.error('Failed to load tool catalog:', error);
    return {};
  }
}

// Validate command parameters against tool schema
async function validateCommand(toolId: string, parameters: Record<string, any>): Promise<CommandValidation> {
  const catalog = await getToolCatalog();
  const tool = findToolById(catalog, toolId);

  if (!tool) {
    return { valid: false, errors: [`Tool "${toolId}" not found in catalog`] };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required parameters
  const schema = tool.parameterSchema || {};
  for (const [paramName, paramDef] of Object.entries(schema)) {
    const value = parameters[paramName];

    if (paramDef.required && value === undefined) {
      errors.push(`Required parameter missing: ${paramName}`);
      continue;
    }

    if (value !== undefined) {
      // Type validation
      if (paramDef.type === 'string' && typeof value !== 'string') {
        errors.push(`Parameter ${paramName} must be string, got ${typeof value}`);
      }

      // Format validation
      if (paramDef.format === 'url' && !isValidUrl(value)) {
        errors.push(`Parameter ${paramName} is not a valid URL`);
      }

      if (paramDef.format === 'hostname|ipv4|ipv6|cidr' && !isValidTarget(value)) {
        errors.push(`Parameter ${paramName} is not a valid target (hostname/IP/CIDR)`);
      }

      // Pattern validation
      if (paramDef.pattern && !new RegExp(paramDef.pattern).test(value)) {
        errors.push(`Parameter ${paramName} does not match required pattern: ${paramDef.pattern}`);
      }

      // Enum validation
      if (paramDef.allowed && !paramDef.allowed.includes(value)) {
        errors.push(`Parameter ${paramName} must be one of: ${paramDef.allowed.join(', ')}`);
      }

      // Blacklist validation
      if (paramDef.validation === '!matches(INTERNAL_RANGES)' && isInternalRange(value)) {
        errors.push(`Parameter ${paramName} targets internal network (not allowed)`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

function findToolById(catalog: any, toolId: string): any {
  for (const category of Object.values(catalog.categories || {})) {
    const cat = category as any;
    const tool = cat.tools?.find((t: any) => t.id === toolId);
    if (tool) return tool;
  }
  return null;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidTarget(target: string): boolean {
  // Simple validation for IP, hostname, or CIDR
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  const hostnameRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  return ipv4Regex.test(target) || hostnameRegex.test(target);
}

function isInternalRange(target: string): boolean {
  const internalRanges = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '127.0.0.1', 'localhost'];
  const ip = target.split('/')[0]; // Extract IP from CIDR if present

  if (internalRanges.some((range) => ip.startsWith(range.split('/')[0]) || ip.startsWith('192.168') || ip.startsWith('10.'))) {
    return true;
  }
  return false;
}

// Queue command for execution
export const queueCommand = functions.https.onCall(async (data: CommandRequest, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { toolId, parameters, targetAgent, priority = 'normal' } = data;

  try {
    // Validate command
    const validation = await validateCommand(toolId, parameters);
    if (!validation.valid) {
      throw new functions.https.HttpsError('invalid-argument', `Command validation failed: ${validation.errors?.join('; ')}`);
    }

    // Get tool details
    const catalog = await getToolCatalog();
    const tool = findToolById(catalog, toolId);

    // Check authorization (approval required for high-risk tools)
    if (tool?.constraints?.requiresConfirmation) {
      // Implement biometric verification flow
      // For now, log and require manual verification
      console.warn(`High-risk tool "${toolId}" requires biometric verification`);
    }

    // Create command document in Firestore
    const commandDoc = await admin.firestore().collection('security_commands').add({
      userId,
      toolId,
      toolName: tool?.name,
      parameters,
      targetAgent,
      priority,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      result: null,
      error: null,
      auditLog: [
        {
          timestamp: new Date().toISOString(),
          event: 'command_queued',
          userId,
          details: 'Command submitted for execution',
        },
      ],
    });

    // Log to security audit trail
    await admin.firestore().collection('audit_log').add({
      userId,
      action: 'security_command_queued',
      toolId,
      targetAgent,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      commandId: commandDoc.id,
      ipAddress: context.rawRequest?.ip || 'unknown',
    });

    return {
      commandId: commandDoc.id,
      status: 'queued',
      message: `Command queued for execution on ${targetAgent}`,
    };
  } catch (error: any) {
    console.error('Queue command error:', error);

    // Log failed command attempt
    await admin.firestore().collection('audit_log').add({
      userId,
      action: 'security_command_failed',
      toolId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      error: error.message,
      ipAddress: context.rawRequest?.ip || 'unknown',
    });

    throw new functions.https.HttpsError('internal', `Failed to queue command: ${error.message}`);
  }
});

// Get command status
export const getCommandStatus = functions.https.onCall(async (data: { commandId: string }, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const commandDoc = await admin.firestore().collection('security_commands').doc(data.commandId).get();

    if (!commandDoc.exists) {
      throw new functions.https.HttpsError('not-found', `Command "${data.commandId}" not found`);
    }

    const command = commandDoc.data();

    // Verify ownership
    if (command?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'You do not have access to this command');
    }

    return {
      commandId: data.commandId,
      status: command?.status,
      result: command?.result,
      error: command?.error,
      createdAt: command?.createdAt,
      updatedAt: command?.updatedAt,
    };
  } catch (error: any) {
    console.error('Get command status error:', error);
    throw new functions.https.HttpsError('internal', `Failed to get command status: ${error.message}`);
  }
});

// ============================================
// Health Check
// ============================================

export const healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
