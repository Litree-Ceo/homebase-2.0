/**
 * @workspace Smart Model Router - Frontend Client
 * 
 * Automatically routes requests to the best AI model via orchestrator
 * Usage: import { aiChat, generateContent, translateText } from '@/lib/ai-router'
 */

const baseApi =
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  '';

const ORCHESTRATOR_URL = baseApi
  ? `${baseApi.replace(/\/$/, '')}/api/orchestrator`
  : 'http://localhost:7071/api/orchestrator';

export async function aiChat(message, options = {}) {
  return callOrchestrator('chat', message, options);
}

export async function generateSEOContent(topic, options = {}) {
  return callOrchestrator('seo_content', topic, {
    ...options,
    systemPrompt: 'Generate SEO-optimized content with high-value keywords and natural monetization opportunities.'
  });
}

export async function generateSocialPost(topic, options = {}) {
  return callOrchestrator('social_post', topic, {
    ...options,
    systemPrompt: 'Create viral-worthy social media content optimized for engagement and click-through.'
  });
}

export async function generateCode(prompt, options = {}) {
  return callOrchestrator('code', prompt, options);
}

export async function translateText(text, targetLanguage, options = {}) {
  return callOrchestrator('translation', `Translate to ${targetLanguage}: ${text}`, {
    ...options,
    language: targetLanguage
  });
}

export async function analyzeComplexity(input, options = {}) {
  return callOrchestrator('complex_reasoning', input, options);
}

async function callOrchestrator(task, input, options = {}) {
  try {
    const response = await fetch(ORCHESTRATOR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task,
        input,
        options
      })
    });

    if (!response.ok) {
      throw new Error(`Orchestrator error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      output: data.output,
      model: data.model,
      task: data.task,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('[AI Router] Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// @agent Example usage patterns
export const examples = {
  chat: async () => {
    const result = await aiChat('What are the benefits of AI automation?');
    console.log('Grok response:', result.output);
  },
  
  seo: async () => {
    const result = await generateSEOContent('Smart home security tips for 2026');
    console.log('Llama SEO content:', result.output);
  },
  
  code: async () => {
    const result = await generateCode('Create a Next.js API route for user authentication');
    console.log('Claude code:', result.output);
  },
  
  multilingual: async () => {
    const result = await translateText('AI-powered smart home automation', 'Spanish');
    console.log('Llama translation:', result.output);
  }
};
