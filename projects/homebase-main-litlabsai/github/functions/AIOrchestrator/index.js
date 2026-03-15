const fetch = require('node-fetch');

/**
 * @workspace AI Orchestrator - Multi-Model Intelligence System
 *
 * Routes tasks to optimal AI model based on task type:
 * - Grok (grok-4-fast-reasoning): Speed, real-time chat, social posts
 * - Llama 3.3 (70B): Multilingual, content generation, SEO
 * - Claude Opus 4.5: Complex reasoning, code generation, architecture
 *
 * Environment Variables:
 * - GROK_API_KEY: xAI API key
 * - ANTHROPIC_API_KEY: Claude API key
 * - GITHUB_TOKEN: For GitHub-hosted models (Llama via GitHub Models)
 *
 * Usage:
 * POST /api/orchestrator
 * Body: {
 *   "task": "generate_content|chat|code|translate|analyze",
 *   "input": "Your content here",
 *   "options": { "language": "es", "tone": "professional" }
 * }
 */

// @agent Task routing intelligence
const TASK_MODEL_MAP = {
  chat: 'grok',
  social_post: 'grok',
  real_time: 'grok',
  content_generation: 'llama',
  seo_content: 'llama',
  translation: 'llama',
  multilingual: 'llama',
  code: 'claude',
  architecture: 'claude',
  complex_reasoning: 'claude',
  default: 'grok'
};

// @agent Revenue optimization prompts
const REVENUE_SYSTEM_PROMPTS = {
  seo: 'Generate SEO-optimized content with high-value keywords, natural ad placement opportunities, and viral potential. Focus on monetization.',
  social: 'Create engaging social media content designed for maximum virality and click-through. Include strategic CTA placement.',
  affiliate: 'Generate product review content optimized for affiliate conversions. Include natural product mentions and comparison points.'
};

async function callGrok(input, options = {}) {
  const apiKey = process.env.GROK_API_KEY;
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: input }
      ],
      model: 'grok-4-fast-reasoning',
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.8
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callLlama(input, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: options.systemPrompt || 'You are a helpful multilingual assistant.' },
        { role: 'user', content: input }
      ],
      model: 'meta-llama-3.3-70b-instruct',
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callClaude(input, options = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-opus-4.5',
      max_tokens: options.maxTokens || 8192,
      messages: [
        { role: 'user', content: input }
      ],
      system: options.systemPrompt || 'You are an expert software architect and developer.'
    })
  });

  const data = await response.json();
  return data.content[0].text;
}

// @debugger Main orchestration logic
module.exports = async function (context, req) {
  try {
    context.log('[AIOrchestrator] Request received');

    const { task, input, options = {} } = req.body;

    if (!input) {
      return context.res = {
        status: 400,
        body: { error: 'Missing "input" parameter' }
      };
    }

    // Determine best model for task
    const modelChoice = TASK_MODEL_MAP[task] || TASK_MODEL_MAP.default;
    context.log(`[AIOrchestrator] Task: ${task}, Selected Model: ${modelChoice}`);

    // Add revenue-optimized system prompts for content tasks
    if (task === 'seo_content') {
      options.systemPrompt = REVENUE_SYSTEM_PROMPTS.seo;
    } else if (task === 'social_post') {
      options.systemPrompt = REVENUE_SYSTEM_PROMPTS.social;
    } else if (task === 'affiliate') {
      options.systemPrompt = REVENUE_SYSTEM_PROMPTS.affiliate;
    }

    let result;
    let modelUsed;

    // Route to appropriate model with fallback chain
    try {
      if (modelChoice === 'grok') {
        result = await callGrok(input, options);
        modelUsed = 'grok-4-fast-reasoning';
      } else if (modelChoice === 'llama') {
        result = await callLlama(input, options);
        modelUsed = 'llama-3.3-70b';
      } else if (modelChoice === 'claude') {
        result = await callClaude(input, options);
        modelUsed = 'claude-opus-4.5';
      }
    } catch (primaryError) {
      context.log.warn(`[AIOrchestrator] Primary model ${modelChoice} failed, falling back to Grok`);
      result = await callGrok(input, options);
      modelUsed = 'grok-4-fast-reasoning (fallback)';
    }

    return context.res = {
      status: 200,
      body: {
        success: true,
        model: modelUsed,
        task,
        output: result,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    context.log.error(`[AIOrchestrator] Error: ${error.message}`);
    return context.res = {
      status: 500,
      body: {
        error: 'Orchestration failed',
        details: error.message
      }
    };
  }
};
