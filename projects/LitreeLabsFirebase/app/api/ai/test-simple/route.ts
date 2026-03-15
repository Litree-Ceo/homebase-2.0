import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST() {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "No API key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: "Say 'LitLabs AI tools are working!' in 5 words or less." }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 20,
      }
    });

    const text = result.response.text();

    return NextResponse.json({
      success: true,
      message: text
    });

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json({
      error: "Failed",
      details: error instanceof Error ? error.message : "Unknown"
    }, { status: 500 });
  }
}
