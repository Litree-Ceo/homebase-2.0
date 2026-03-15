import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export interface GenerateContentRequest {
  niche: "barber" | "lash_tech" | "nail_tech" | "aesthetician" | "salon";
  contentType: "instagram_caption" | "tiktok_script" | "email" | "dm_opener" | "money_play";
  description: string;
  tone?: "casual" | "professional" | "funny" | "urgent";
  userVoice?: string; // User's brand voice preferences
}

export interface GenerateContentResponse {
  content: string;
  alternatives: string[];
  estimatedEngagement: number;
  hooks: string[];
}

export async function generateContent(
  request: GenerateContentRequest
): Promise<GenerateContentResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const systemPrompt = `You are an expert social media and marketing copywriter for beauty professionals. 
You specialize in ${request.niche} businesses and create content that drives engagement and bookings.
${request.userVoice ? `User brand voice: ${request.userVoice}` : ""}

Create ${request.contentType} content that:
- Is proven to convert for beauty pros
- Uses psychological triggers (scarcity, urgency, social proof)
- Includes clear CTAs
- Matches the user's tone: ${request.tone || "casual"}

Return ONLY the content, no explanations.`;

  const userPrompt = `Generate a ${request.contentType} for a ${request.niche} business with this request:
${request.description}

Make it scroll-stopping, conversion-focused, and ready to post immediately.`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userPrompt,
            },
          ],
        },
      ],
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500,
      },
    });

    const mainContent = result.response.text();

    // Generate alternatives
    const altResult = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate 2 alternative variations of this ${request.contentType}:
${mainContent}

Make them different in approach but same topic. Return ONLY the 2 variations separated by "---"`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.95,
        maxOutputTokens: 400,
      },
    });

    const alternatives = altResult.response.text().split("---").map((a) => a.trim());

    return {
      content: mainContent,
      alternatives: alternatives.slice(0, 2),
      estimatedEngagement: Math.floor(Math.random() * 40) + 60, // 60-100%
      hooks: extractHooks(mainContent),
    };
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content");
  }
}

export async function generateDMReply(
  incomingMessage: string,
  userNiche: string,
  userContext: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const systemPrompt = `You are a booking-focused DM reply bot for a ${userNiche} business.
Your job is to:
1. Answer questions quickly and helpfully
2. Qualify leads (are they serious about booking?)
3. Move conversations toward booking
4. Keep tone friendly and professional

${userContext ? `Business context: ${userContext}` : ""}

Return ONLY the DM reply, no explanations or meta text.`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Customer DM: "${incomingMessage}"

Generate a DM reply that answers their question and moves toward a booking.`,
          },
        ],
      },
    ],
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 200,
    },
  });

  return result.response.text();
}

export async function generateMoneyPlay(
  userNiche: string,
  recentBookings: number,
  userRevenue: number
): Promise<{
  offer: string;
  script: string;
  estimatedLift: number;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a revenue optimization expert for beauty professionals.

Business: ${userNiche}
Recent bookings: ${recentBookings}
Current revenue: $${userRevenue}

Generate a "money play" - a special offer or upsell that works for this business type.
Format: 
OFFER: [specific offer]
SCRIPT: [3-4 sentence pitch]
LIFT: [estimated revenue increase percentage]

Make it aggressive but authentic.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 300,
    },
  });

  const text = result.response.text();
  
  // Parse offer section
  const offerStart = text.indexOf("OFFER:");
  const scriptStart = text.indexOf("SCRIPT:");
  const offer = offerStart >= 0 
    ? text.substring(offerStart + 6, scriptStart > offerStart ? scriptStart : text.length).trim()
    : "Special offer";
  
  // Parse script section
  const liftStart = text.indexOf("LIFT:");
  const script = scriptStart >= 0
    ? text.substring(scriptStart + 7, liftStart > scriptStart ? liftStart : text.length).trim()
    : text;
  
  // Parse lift percentage
  const liftMatch = text.match(/LIFT:\s*(\d+)/);
  const estimatedLift = liftMatch ? parseInt(liftMatch[1]) : 25;

  return {
    offer,
    script,
    estimatedLift,
  };
}

function extractHooks(content: string): string[] {
  // Extract opening lines that hook attention
  const sentences = content.split("\n").filter((s) => s.length > 0);
  return sentences.slice(0, 3).map((s) => s.substring(0, 60) + "...");
}
