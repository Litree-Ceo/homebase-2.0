import { NextRequest, NextResponse } from "next/server";
import { aiChatSchema } from "@/lib/validation";
import { getUserFromRequest } from "@/lib/auth-helper";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const SYSTEM_PROMPT = process.env.LITLABS_MASTER_SYSTEM_PROMPT || "";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" },
        { status: 500 }
      );
    }

    // Validate input
    const body = await req.json();
    const validation = aiChatSchema.safeParse({ message: body.command || body.userMessage, conversationId: body.conversationId });
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { command, userMessage } = body;

    if (!command) {
      return NextResponse.json(
        { error: "Missing command parameter" },
        { status: 400 }
      );
    }

    const prompt = `
You are LitLabs AI, a professional marketing assistant for beauty professionals (hair stylists, lash artists, nail techs, etc.).

System Instructions:
${SYSTEM_PROMPT}

User Command: ${command}

${userMessage ? `Additional Context: ${userMessage}` : ""}

Respond with practical, actionable content that the user can copy-paste directly into Instagram, TikTok, or messaging apps. Be specific, include relevant emojis, and always add a clear call-to-action.`;

    // Call Google's Generative AI API (Gemini)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const json = await res.json();

    if (json.error) {
      return NextResponse.json(
        { error: `Google AI Error: ${json.error.message}` },
        { status: 500 }
      );
    }

    const text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "LitLabs AI could not generate a response. Please try again.";

    return NextResponse.json({ text });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Error calling LitLabs AI" },
      { status: 500 }
    );
  }
}
