import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export interface GodModeRequest {
  task: string;
  context?: string;
  userBusiness?: string;
  targetPlatform?: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'all';
  includeResearch?: boolean;
}

export interface GodModeResponse {
  plan: string[];
  research?: ResearchResult[];
  content: string;
  sources?: string[];
  confidence: number;
  executionTime: number;
}

export interface ResearchResult {
  query: string;
  findings: string;
  relevance: number;
}

/**
 * GOD MODE - Ultra-intelligent AI that researches, plans, and executes
 * Can pull from multiple sources, think critically, and deliver perfect results
 */
export async function godModeExecute(request: GodModeRequest): Promise<GodModeResponse> {
  const startTime = Date.now();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  // PHASE 1: UNDERSTAND & PLAN
  const planningPrompt = `You are GOD MODE - the most intelligent AI assistant ever created.

USER TASK: ${request.task}

CONTEXT:
Business: ${request.userBusiness || 'Unknown'}
Platform: ${request.targetPlatform || 'All platforms'}
Additional Context: ${request.context || 'None'}

YOUR MISSION:
1. Deeply understand what the user REALLY wants (read between the lines)
2. Create a step-by-step plan to execute this task perfectly
3. Identify what research/sources you need (trends, competitors, viral content patterns)
4. Think like a $500/hour strategist - not just a content writer

OUTPUT FORMAT:
Return ONLY a JSON object:
{
  "understanding": "What user actually wants in 1-2 sentences",
  "plan": ["Step 1: Research X", "Step 2: Analyze Y", "Step 3: Create Z"],
  "researchNeeded": ["Query 1", "Query 2"],
  "strategy": "The high-level approach"
}`;

  const planResult = await model.generateContent(planningPrompt);
  const planText = planResult.response.text();
  
  let planData;
  try {
    planData = JSON.parse(planText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
  } catch {
    planData = {
      understanding: "Execute user request",
      plan: ["Analyze request", "Generate content"],
      researchNeeded: [],
      strategy: "Direct execution"
    };
  }

  // PHASE 2: RESEARCH (if needed)
  const research: ResearchResult[] = [];
  if (request.includeResearch && planData.researchNeeded?.length > 0) {
    for (const query of planData.researchNeeded.slice(0, 3)) {
      const findings = await conductResearch(query, request.targetPlatform);
      research.push(findings);
    }
  }

  // PHASE 3: EXECUTE WITH FULL INTELLIGENCE
  const executionPrompt = `You are GOD MODE executing at maximum intelligence.

PLAN:
${planData.plan.join('\n')}

STRATEGY:
${planData.strategy}

RESEARCH FINDINGS:
${research.map(r => `${r.query}: ${r.findings}`).join('\n\n')}

USER REQUEST:
${request.task}

BUSINESS CONTEXT:
${request.userBusiness || 'Beauty/grooming business'}

PLATFORM:
${request.targetPlatform || 'Multi-platform'}

NOW EXECUTE THIS PERFECTLY:
- Use research to inform your output
- Make it viral-worthy (hooks, emotion, calls-to-action)
- Include specific tactics from successful competitors
- Add emojis naturally (don't overdo it)
- Make it sound human and authentic
- Include platform-specific optimizations
- Think about psychology: what makes people stop scrolling?

${request.targetPlatform === 'tiktok' ? 'TikTok specific: Hook in first 3 seconds, use trending sounds, pattern interrupt' : ''}
${request.targetPlatform === 'instagram' ? 'Instagram specific: Visual storytelling, carousel-worthy, story ideas, reel scripts' : ''}
${request.targetPlatform === 'youtube' ? 'YouTube specific: Clickable titles, watch time hooks, chapter timestamps' : ''}

OUTPUT THE FINAL CONTENT:`;

  const executionResult = await model.generateContent(executionPrompt);
  const content = executionResult.response.text();

  // PHASE 4: QUALITY CHECK
  const confidence = calculateConfidence(content, research);
  const executionTime = Date.now() - startTime;

  return {
    plan: planData.plan,
    research: research.length > 0 ? research : undefined,
    content,
    sources: research.map(r => r.query),
    confidence,
    executionTime,
  };
}

/**
 * Conduct intelligent research on a topic
 */
async function conductResearch(
  query: string,
  platform?: string
): Promise<ResearchResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const researchPrompt = `Research this query using your knowledge: "${query}"

${platform ? `Focus on ${platform} platform specifically.` : ''}

Provide:
1. Current trends (what's working NOW in 2025)
2. Viral patterns (formats, hooks, structures)
3. Competitor insights (what top creators are doing)
4. Psychology (why it works)
5. Specific tactics to implement

Keep it concise but actionable. 3-4 paragraphs max.`;

  const result = await model.generateContent(researchPrompt);
  const findings = result.response.text();
  
  // Calculate relevance based on length and detail
  const relevance = Math.min(findings.length / 500, 1.0);

  return {
    query,
    findings,
    relevance,
  };
}

/**
 * Calculate confidence score based on research and content quality
 */
function calculateConfidence(content: string, research: ResearchResult[]): number {
  let score = 0.5; // Base score

  // Longer, detailed content = higher confidence
  if (content.length > 500) score += 0.2;
  if (content.length > 1000) score += 0.1;

  // Research-backed = higher confidence
  if (research.length > 0) score += 0.1;
  if (research.some(r => r.relevance > 0.7)) score += 0.1;

  // Contains specific tactics (numbers, emojis, CTAs)
  if (/\d+/.test(content)) score += 0.05; // Has numbers
  if (/[💰🔥⚡️✨🎯]/u.test(content)) score += 0.05; // Has power emojis

  return Math.min(score, 1.0);
}

/**
 * GOD MODE for video scripts specifically
 */
export async function godModeVideoScript(request: {
  topic: string;
  duration: number; // seconds
  platform: 'tiktok' | 'youtube' | 'instagram';
  style?: 'educational' | 'entertaining' | 'salesy' | 'storytelling';
}): Promise<{
  script: string;
  scenes: Array<{ time: string; visual: string; audio: string; text?: string }>;
  hooks: string[];
  musicSuggestions: string[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `Create a VIRAL ${request.platform} video script.

SPECS:
Topic: ${request.topic}
Duration: ${request.duration} seconds
Style: ${request.style || 'entertaining'}
Platform: ${request.platform}

PLATFORM REQUIREMENTS:
${request.platform === 'tiktok' ? `
- Hook in first 1-2 seconds (pattern interrupt)
- Fast cuts every 2-3 seconds
- Use trending sounds/music
- Text overlays for emphasis
- End with CTA (follow, share, comment)
` : ''}
${request.platform === 'youtube' ? `
- Strong hook in first 5 seconds
- Clear structure with chapters
- Longer scenes (5-10 seconds)
- Professional pacing
- End screen CTA
` : ''}
${request.platform === 'instagram' ? `
- Visual-first approach
- Hook in first 3 seconds
- Quick pacing (2-4 second scenes)
- Strong visual story arc
- Reel-specific tricks
` : ''}

OUTPUT FORMAT (JSON):
{
  "hook": "The opening line that stops the scroll",
  "script": "Full narration/dialogue script with timing cues",
  "scenes": [
    {
      "time": "0:00-0:03",
      "visual": "What viewer sees",
      "audio": "What they hear",
      "text": "Text overlay if needed"
    }
  ],
  "alternativeHooks": ["Hook option 2", "Hook option 3"],
  "musicSuggestions": ["Upbeat electronic", "Trending sound: XYZ"],
  "captionIdeas": ["Caption 1", "Caption 2"]
}

Make it ACTUALLY VIRAL. Study what works in ${new Date().getFullYear()} and use those patterns.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  let data;
  try {
    data = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
  } catch {
    // Fallback if JSON parsing fails
    data = {
      script: response,
      scenes: [],
      hooks: [],
      musicSuggestions: []
    };
  }

  return {
    script: data.script,
    scenes: data.scenes || [],
    hooks: [data.hook, ...(data.alternativeHooks || [])].filter(Boolean),
    musicSuggestions: data.musicSuggestions || [],
  };
}

/**
 * GOD MODE intelligence for pulling competitor strategies
 */
export async function godModeCompetitorAnalysis(request: {
  businessType: string;
  location?: string;
  platforms: string[];
}): Promise<{
  topStrategies: string[];
  contentGaps: string[];
  viralFormats: string[];
  actionPlan: string[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const prompt = `Analyze competitors for a ${request.businessType} business.

Location: ${request.location || 'General'}
Platforms: ${request.platforms.join(', ')}

As an expert strategist, provide:

1. TOP STRATEGIES (what successful competitors are doing RIGHT NOW):
   - Content types that get engagement
   - Posting frequency and timing
   - Monetization tactics
   - Community building approaches

2. CONTENT GAPS (opportunities they're missing):
   - Underserved topics
   - Format innovations
   - Audience segments ignored

3. VIRAL FORMATS (what's trending in this niche):
   - Specific video/post structures
   - Caption formulas
   - Visual styles

4. ACTION PLAN (exact steps to dominate):
   - Week 1-4 roadmap
   - Content calendar themes
   - Growth hacks specific to this niche

Return as JSON with those 4 sections as arrays.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  try {
    const data = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    return data;
  } catch {
    return {
      topStrategies: [],
      contentGaps: [],
      viralFormats: [],
      actionPlan: [],
    };
  }
}
