import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export interface SparkContext {
  userId?: string;
  userTier?: string;
  userEmail?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface SparkResponse {
  message: string;
  intent: 'sales' | 'support' | 'upsell' | 'general';
  suggestedActions?: string[];
  escalateToHuman?: boolean;
  confidence: number;
}

/**
 * SPARK - Customer Support AI Bot
 * Handles sales, support, and upselling automatically
 */
export async function sparkChat(
  userMessage: string,
  context: SparkContext = {}
): Promise<SparkResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  // Build context-aware system prompt
  const systemPrompt = `You are SPARK, the helpful AI assistant for LitLabs - an AI content generation platform for beauty & grooming businesses.

YOUR PERSONALITY:
- Friendly, enthusiastic, and helpful
- Use emojis sparingly (1-2 per message)
- Keep responses under 3 sentences unless explaining features
- Always provide next steps or call-to-action

YOUR KNOWLEDGE BASE:
LitLabs Pricing:
- FREE: 5 AI gens/day, 3 DM replies/day, 1 money play/day, 2 images/day
- STARTER ($9.99/mo): 50 gens, 20 DMs, 5 money plays, 10 images/month - Perfect impulse buy
- CREATOR ($29/mo): 500 gens, 100 DMs, unlimited money plays, 50 images - Most popular
- PRO ($59/mo): UNLIMITED everything + voice input, scheduling, analytics
- AGENCY ($149/mo): Everything + 5 team accounts, white-label, API access
- EDUCATION ($499/year): 50 student accounts, teacher dashboard, training

Features:
- AI content generation (Instagram captions, TikTok scripts)
- DM reply generator (booking-focused)
- Money play generator (revenue-boosting offers)
- DALL-E 3 image generation
- Smart context (AI remembers your business)
- Template library (save & reuse)
- Analytics dashboard
- Multi-platform export

YOUR ABILITIES:
1. Answer questions about features & pricing
2. Help troubleshoot issues
3. Detect upsell opportunities
4. Compare plans
5. Explain ROI ("Save 10 hours/week = $200+ value")
6. Book demo calls (offer this for Agency/Education)

UPSELL TRIGGERS:
- User hits free limits → "Upgrade to Starter for just $9.99!"
- User asks about unlimited → "Pro gives you unlimited everything for $59/mo"
- User mentions team → "Agency plan includes 5 team accounts"
- User is a teacher → "Education plan: 50 students for $499/year"

USER CONTEXT:
${context.userTier ? `Current Tier: ${context.userTier.toUpperCase()}` : 'Tier: Unknown (likely free)'}
${context.userEmail ? `Email: ${context.userEmail}` : ''}

CONVERSATION HISTORY:
${context.conversationHistory?.map(msg => `${msg.role}: ${msg.content}`).join('\n') || 'No history'}

USER MESSAGE: ${userMessage}

Respond helpfully. If you detect an upsell opportunity, mention it naturally. If the question is complex or the user seems frustrated, suggest escalating to human support.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();
    
    // Analyze intent
    const intent = detectIntent(userMessage, response);
    const escalate = shouldEscalate(userMessage, context);
    const confidence = calculateConfidence(response);
    
    // Generate suggested actions
    const actions = generateSuggestedActions(intent, context);
    
    return {
      message: response,
      intent,
      suggestedActions: actions,
      escalateToHuman: escalate,
      confidence,
    };
  } catch (error) {
    console.error('Spark error:', error);
    return {
      message: "I'm having trouble connecting right now. Please try again in a moment, or email us at support@litlabs.ai",
      intent: 'support',
      escalateToHuman: true,
      confidence: 0,
    };
  }
}

/**
 * Detect user intent from message
 */
function detectIntent(message: string, response: string): SparkResponse['intent'] {
  const lower = message.toLowerCase();
  
  if (lower.includes('price') || lower.includes('cost') || lower.includes('plan') || lower.includes('upgrade')) {
    return 'sales';
  }
  
  if (lower.includes('help') || lower.includes('how') || lower.includes('error') || lower.includes('not working')) {
    return 'support';
  }
  
  if (response.toLowerCase().includes('upgrade') || response.toLowerCase().includes('$')) {
    return 'upsell';
  }
  
  return 'general';
}

/**
 * Determine if conversation should escalate to human
 */
function shouldEscalate(message: string, context: SparkContext): boolean {
  const lower = message.toLowerCase();
  
  // Escalate on frustration
  if (lower.includes('frustrated') || lower.includes('angry') || lower.includes('terrible')) {
    return true;
  }
  
  // Escalate on refund requests
  if (lower.includes('refund') || lower.includes('cancel') || lower.includes('money back')) {
    return true;
  }
  
  // Escalate on technical issues for paying customers
  if (context.userTier !== 'free' && (lower.includes('not working') || lower.includes('broken'))) {
    return true;
  }
  
  return false;
}

/**
 * Calculate confidence score
 */
function calculateConfidence(response: string): number {
  // Simple heuristic: longer, more detailed responses = higher confidence
  if (response.length < 50) return 0.5;
  if (response.length > 200) return 0.95;
  return 0.8;
}

/**
 * Generate suggested action buttons
 */
function generateSuggestedActions(intent: SparkResponse['intent'], context: SparkContext): string[] {
  const actions: string[] = [];
  
  if (intent === 'sales') {
    actions.push('View Pricing');
    actions.push('Start Free Trial');
    if (context.userTier === 'free') {
      actions.push('Upgrade to Starter ($9.99)');
    }
  }
  
  if (intent === 'support') {
    actions.push('View Documentation');
    actions.push('Watch Tutorial');
    actions.push('Email Support');
  }
  
  if (intent === 'upsell') {
    actions.push('Compare Plans');
    actions.push('See ROI Calculator');
    if (context.userTier !== 'pro') {
      actions.push('Upgrade Now');
    }
  }
  
  actions.push('Talk to Human');
  
  return actions;
}

/**
 * Track conversation for learning
 */
export async function trackSparkConversation(
  userId: string | undefined,
  message: string,
  response: SparkResponse,
  helpful: boolean
) {
  // TODO: Store in Firestore for analytics
  // Track: What questions convert best, what responses users rate as helpful
  console.log('Spark conversation tracked:', { userId, helpful, intent: response.intent });
}
