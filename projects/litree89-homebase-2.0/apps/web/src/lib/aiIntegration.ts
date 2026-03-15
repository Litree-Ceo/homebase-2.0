/**
 * Advanced AI Integration for HomeBase 2.0
 * Connects to Grok and other AI services
 */

import { api } from './smartFeatures';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Smart AI Chat Client
export class SmartAIClient {
  private conversationHistory: AIMessage[] = [];
  private readonly maxHistory = 10;

  async chat(
    message: string,
    options?: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<AIResponse> {
    // Add user message to history
    this.addMessage('user', message);

    const payload = {
      messages: this.conversationHistory,
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000,
      systemPrompt: options?.systemPrompt,
    };

    try {
      const response = await api.request<AIResponse>('/GrokChat', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Add assistant response to history
      this.addMessage('assistant', response.content);

      return response;
    } catch (error) {
      console.error('AI chat failed:', error);
      throw new Error('Failed to communicate with AI service');
    }
  }

  async streamChat(
    message: string,
    onChunk: (chunk: string) => void,
    options?: {
      systemPrompt?: string;
      temperature?: number;
    },
  ): Promise<void> {
    this.addMessage('user', message);

    const payload = {
      messages: this.conversationHistory,
      temperature: options?.temperature ?? 0.7,
      systemPrompt: options?.systemPrompt,
      stream: true,
    };

    try {
      const response = await fetch('/api/GrokChat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk;
        onChunk(chunk);
      }

      this.addMessage('assistant', fullResponse);
    } catch (error) {
      console.error('AI stream failed:', error);
      throw new Error('Failed to stream from AI service');
    }
  }

  async generateContent(
    prompt: string,
    options?: {
      format?: 'text' | 'markdown' | 'json';
      creativity?: 'low' | 'medium' | 'high';
    },
  ): Promise<string> {
    let temperature = 0.7;
    if (options?.creativity === 'low') temperature = 0.3;
    else if (options?.creativity === 'high') temperature = 0.9;

    let systemPrompt: string | undefined;
    if (options?.format === 'json') {
      systemPrompt = 'You are a JSON generator. Only respond with valid JSON.';
    } else if (options?.format === 'markdown') {
      systemPrompt = 'Format your response in clean markdown.';
    }

    const response = await this.chat(prompt, { systemPrompt, temperature });
    return response.content;
  }

  async summarize(content: string, maxLength?: number): Promise<string> {
    const prompt = maxLength
      ? `Summarize this in ${maxLength} words or less:\n\n${content}`
      : `Provide a concise summary:\n\n${content}`;

    const response = await this.chat(prompt, { temperature: 0.3 });
    return response.content;
  }

  async analyze(
    content: string,
    analysisType: 'sentiment' | 'keywords' | 'topics',
  ): Promise<string> {
    const prompts = {
      sentiment: `Analyze the sentiment of this text (positive/negative/neutral):\n\n${content}`,
      keywords: `Extract the key themes and keywords from this text:\n\n${content}`,
      topics: `Identify the main topics discussed in this text:\n\n${content}`,
    };

    const response = await this.chat(prompts[analysisType], { temperature: 0.3 });
    return response.content;
  }

  private addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now(),
    });

    // Keep only last N messages
    if (this.conversationHistory.length > this.maxHistory) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistory);
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): AIMessage[] {
    return [...this.conversationHistory];
  }
}

// Smart Content Generator
export class SmartContentGenerator {
  private readonly ai: SmartAIClient;

  constructor() {
    this.ai = new SmartAIClient();
  }

  async generateBlogPost(
    topic: string,
    keywords?: string[],
  ): Promise<{
    title: string;
    content: string;
    excerpt: string;
  }> {
    const keywordText = keywords?.length ? ` Include these keywords: ${keywords.join(', ')}` : '';
    const prompt = `Generate a professional blog post about "${topic}".${keywordText}
    
Format the response as JSON with these fields:
- title: catchy title
- content: full blog post in markdown
- excerpt: 2-sentence summary`;

    const response = await this.ai.generateContent(prompt, { format: 'json' });
    return JSON.parse(response);
  }

  async generateSocialPost(
    content: string,
    platform: 'twitter' | 'linkedin' | 'instagram',
  ): Promise<string> {
    const limits = {
      twitter: '280 characters',
      linkedin: '3000 characters, professional tone',
      instagram: '2200 characters, engaging with emojis',
    };

    const prompt = `Create a ${platform} post based on this content. Keep it within ${limits[platform]}:

${content}`;

    return await this.ai.generateContent(prompt, { creativity: 'high' });
  }

  async improveText(text: string, style: 'casual' | 'professional' | 'creative'): Promise<string> {
    const prompt = `Rewrite this text in a ${style} style, improving clarity and impact:

${text}`;

    return await this.ai.generateContent(prompt, { creativity: 'medium' });
  }

  async generateIdeas(topic: string, count: number = 5): Promise<string[]> {
    const prompt = `Generate ${count} creative and unique ideas about: ${topic}
    
Return only a JSON array of strings, one idea per string.`;

    const response = await this.ai.generateContent(prompt, { format: 'json', creativity: 'high' });
    return JSON.parse(response);
  }
}

// Smart Code Assistant
export class SmartCodeAssistant {
  private readonly ai: SmartAIClient;

  constructor() {
    this.ai = new SmartAIClient();
  }

  async explainCode(code: string, language: string = 'typescript'): Promise<string> {
    const prompt = `Explain this ${language} code in simple terms:

\`\`\`${language}
${code}
\`\`\``;

    return await this.ai.generateContent(prompt, { creativity: 'low' });
  }

  async generateCode(description: string, language: string = 'typescript'): Promise<string> {
    const prompt = `Generate ${language} code for: ${description}

Only return the code, no explanations.`;

    return await this.ai.generateContent(prompt, { format: 'text', creativity: 'medium' });
  }

  async reviewCode(
    code: string,
    language: string = 'typescript',
  ): Promise<{
    issues: string[];
    suggestions: string[];
    security: string[];
  }> {
    const prompt = `Review this ${language} code for issues, improvements, and security concerns:

\`\`\`${language}
${code}
\`\`\`

Return JSON with: issues[], suggestions[], security[]`;

    const response = await this.ai.generateContent(prompt, { format: 'json', creativity: 'low' });
    return JSON.parse(response);
  }

  async optimizeCode(code: string, language: string = 'typescript'): Promise<string> {
    const prompt = `Optimize this ${language} code for performance and readability:

\`\`\`${language}
${code}
\`\`\`

Return only the optimized code.`;

    return await this.ai.generateContent(prompt, { creativity: 'low' });
  }
}

// Export singleton instances
export const aiClient = new SmartAIClient();
export const contentGenerator = new SmartContentGenerator();
export const codeAssistant = new SmartCodeAssistant();
