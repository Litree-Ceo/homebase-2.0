import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export interface VideoScript {
  title: string;
  hook: string;
  duration: number;
  platform: 'tiktok' | 'instagram' | 'youtube';
  scenes: VideoScene[];
  voiceover: string;
  musicSuggestions: string[];
  hashtagSuggestions: string[];
  captionIdeas: string[];
}

export interface VideoScene {
  timeStart: number;
  timeEnd: number;
  duration: number;
  sceneNumber: number;
  visual: string;
  action: string;
  textOverlay?: string;
  transition?: string;
  notes?: string;
}

/**
 * Generate viral video script with scene-by-scene breakdown
 */
export async function generateVideoScript(params: {
  topic: string;
  duration: number;
  platform: 'tiktok' | 'instagram' | 'youtube';
  style: 'educational' | 'entertaining' | 'salesy' | 'storytelling';
  businessType?: string;
}): Promise<VideoScript> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  const platformGuidelines = {
    tiktok: {
      hookTime: '1-2 seconds',
      sceneDuration: '2-3 seconds',
      style: 'Fast cuts, trending sounds, text overlays',
      tips: 'Pattern interrupt in first frame, use trending audio, vertical 9:16',
    },
    instagram: {
      hookTime: '2-3 seconds',
      sceneDuration: '3-5 seconds',
      style: 'Visual storytelling, aesthetic shots, smooth transitions',
      tips: 'Strong opening frame, carousel-worthy moments, vertical or square',
    },
    youtube: {
      hookTime: '3-5 seconds',
      sceneDuration: '5-10 seconds',
      style: 'Professional pacing, clear structure, value-driven',
      tips: 'Clickable thumbnail moment, chapters, landscape 16:9',
    },
  };

  const guidelines = platformGuidelines[params.platform];
  
  const prompt = `You are a viral video strategist. Create a ${params.duration}-second ${params.platform} video script.

TOPIC: ${params.topic}
STYLE: ${params.style}
BUSINESS: ${params.businessType || 'Beauty/grooming'}
DURATION: ${params.duration} seconds

${params.platform.toUpperCase()} REQUIREMENTS:
- Hook within ${guidelines.hookTime}
- Scene duration: ${guidelines.sceneDuration}
- Style: ${guidelines.style}
- Tips: ${guidelines.tips}

OUTPUT FORMAT (JSON):
{
  "title": "Video title",
  "hook": "The opening line that stops scrolling",
  "scenes": [
    {
      "timeStart": 0,
      "timeEnd": 3,
      "duration": 3,
      "sceneNumber": 1,
      "visual": "What the viewer sees (camera angle, subject, setting)",
      "action": "What's happening on screen",
      "textOverlay": "Text shown on screen (if any)",
      "transition": "How this scene transitions to next",
      "notes": "Filming tips or special effects"
    }
  ],
  "voiceover": "Complete narration script with timing cues like [0:00] Opening line [0:03] Next part...",
  "musicSuggestions": ["Upbeat electronic", "Trending: Song Name"],
  "hashtagSuggestions": ["#viral", "#trending", "#niche"],
  "captionIdeas": ["Caption 1", "Caption 2", "Caption 3"]
}

MAKE IT ACTUALLY VIRAL:
- Study what's working in ${new Date().getFullYear()}
- Use proven viral patterns
- Include pattern interrupts
- Create curiosity gaps
- Strong emotional hooks
- Clear call-to-action

Be specific with visuals. Don't say "show product" - say "Close-up of hands applying lash extensions, camera zooms on the curl".`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleanJson);

    return {
      title: data.title,
      hook: data.hook,
      duration: params.duration,
      platform: params.platform,
      scenes: data.scenes.map((scene: any, index: number) => ({
        ...scene,
        sceneNumber: index + 1,
      })),
      voiceover: data.voiceover,
      musicSuggestions: data.musicSuggestions || [],
      hashtagSuggestions: data.hashtagSuggestions || [],
      captionIdeas: data.captionIdeas || [],
    };
  } catch (error) {
    console.error('Video script generation error:', error);
    throw new Error('Failed to generate video script');
  }
}

/**
 * Generate multiple hook variations for A/B testing
 */
export async function generateHookVariations(
  topic: string,
  platform: string,
  count: number = 5
): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate ${count} viral hook variations for a ${platform} video about: ${topic}

Each hook should:
- Stop the scroll in 1-2 seconds
- Create curiosity or pattern interrupt
- Be platform-specific
- Use proven viral formulas

Return as JSON array of strings.

EXAMPLES OF VIRAL HOOKS:
- "I charged $300 for this... here's why 👇"
- "POV: You're doing it wrong (and here's the right way)"
- "This mistake cost me $5,000... don't repeat it"
- "Watch till the end... 👀"
- "Nobody talks about this..."

Make them specific to the topic: ${topic}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch {
    return [
      `Here's what nobody tells you about ${topic}...`,
      `Watch this before trying ${topic}`,
      `The ${topic} hack that went viral`,
      `This ${topic} secret changed everything`,
      `Stop doing ${topic} wrong (do this instead)`,
    ];
  }
}

/**
 * Analyze video performance and suggest improvements
 */
export async function analyzeVideoPerformance(params: {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgWatchTime: number;
  videoDuration: number;
}): Promise<{
  score: number;
  insights: string[];
  recommendations: string[];
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const engagementRate = ((params.likes + params.comments + params.shares) / params.views) * 100;
  const retentionRate = (params.avgWatchTime / params.videoDuration) * 100;

  const prompt = `Analyze this video performance and provide actionable insights:

METRICS:
- Views: ${params.views.toLocaleString()}
- Likes: ${params.likes.toLocaleString()}
- Comments: ${params.comments}
- Shares: ${params.shares}
- Avg Watch Time: ${params.avgWatchTime}s / ${params.videoDuration}s
- Engagement Rate: ${engagementRate.toFixed(2)}%
- Retention Rate: ${retentionRate.toFixed(2)}%

Provide:
1. Overall performance score (0-100)
2. 3-5 key insights (what's working, what's not)
3. 3-5 specific recommendations to improve

Return as JSON:
{
  "score": 0-100,
  "insights": ["Insight 1", "Insight 2"],
  "recommendations": ["Do X to improve Y", "Change Z"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch {
    return {
      score: 50,
      insights: ['Unable to analyze performance at this time'],
      recommendations: ['Try posting at peak times', 'Improve your hook in the first 3 seconds'],
    };
  }
}
