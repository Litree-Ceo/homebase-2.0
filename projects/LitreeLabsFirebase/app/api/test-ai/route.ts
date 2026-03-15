import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST() {
  try {
    // Check if API key exists
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'Missing API Key',
        details: 'GOOGLE_GENERATIVE_AI_API_KEY not found in environment variables. Check your .env.local file.'
      }, { status: 500 });
    }

    if (apiKey === 'TEMP_GET_FROM_GOOGLE_AI_STUDIO') {
      return NextResponse.json({
        error: 'Placeholder API Key',
        details: 'You need to replace the placeholder with your actual Google AI API key. See SETUP_MISSING_TOOLS.md for instructions.'
      }, { status: 500 });
    }

    // Try to initialize Google AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Test with a simple prompt
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: 'Say "LitLabs AI is working!" in a fun way.' }]
      }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 50,
      }
    });

    const response = result.response.text();

    return NextResponse.json({
      message: 'AI Tools are working correctly!',
      aiResponse: response,
      status: 'operational'
    });

  } catch (error) {
    console.error('AI Test Error:', error);
    
    return NextResponse.json({
      error: 'AI Connection Failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      hint: 'Check if your API key is valid and has not exceeded rate limits.'
    }, { status: 500 });
  }
}
