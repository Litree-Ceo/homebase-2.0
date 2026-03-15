// Example: Using Grok API from Azure Function
// File: functions/GrokChat/examples.js

/**
 * Example 1: Basic Chat Completion
 * Calls the Grok API with a simple question
 */
async function basicChatExample() {
  const fetch = require('node-fetch');
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the capital of France?' }
      ],
      model: 'grok-4-fast-reasoning',
      max_tokens: 500
    })
  });

  const data = await response.json();
  console.log('Response:', data.choices[0].message.content);
  console.log('Tokens used:', data.usage.output_tokens);
}

/**
 * Example 2: Reasoning with Complex Query
 * Use grok-4-fast-reasoning for problems requiring step-by-step logic
 */
async function reasoningExample() {
  const fetch = require('node-fetch');
  
  const query = `
    I have a scheduling problem. I need to arrange 5 meetings (A, B, C, D, E) 
    with constraints:
    - A must be before B
    - C must be before D
    - E must be after D
    - Maximum 8 hours available
    - Each meeting is 1 hour
    
    What's an optimal schedule?
  `;

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: query }
      ],
      model: 'grok-4-fast-reasoning',
      max_tokens: 2000  // Longer for detailed reasoning
    })
  });

  const data = await response.json();
  console.log('Reasoning:', data.choices[0].message.content);
}

/**
 * Example 3: Cost-Optimized Query
 * Use grok-3-mini for simple questions to save on tokens
 */
async function costOptimizedExample() {
  const fetch = require('node-fetch');
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'What is 2+2?' }
      ],
      model: 'grok-3-mini',  // Cheaper model for simple queries
      max_tokens: 50
    })
  });

  const data = await response.json();
  console.log('Response:', data.choices[0].message.content);
  console.log('Cost:', `$${(data.usage.input_tokens * 0.30 / 1000000).toFixed(6)} input + $${(data.usage.output_tokens * 0.50 / 1000000).toFixed(6)} output`);
}

/**
 * Example 4: Multi-turn Conversation
 * Maintain conversation context across multiple messages
 */
async function conversationExample() {
  const fetch = require('node-fetch');
  
  // First message
  let messages = [
    { role: 'user', content: 'What is machine learning?' }
  ];

  let response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      model: 'grok-4-fast-reasoning',
      max_tokens: 500
    })
  });

  let data = await response.json();
  const firstResponse = data.choices[0].message.content;
  console.log('Assistant:', firstResponse);

  // Add to conversation history
  messages.push({ role: 'assistant', content: firstResponse });
  messages.push({ role: 'user', content: 'Can you explain neural networks?' });

  // Second message with context
  response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      model: 'grok-4-fast-reasoning',
      max_tokens: 500
    })
  });

  data = await response.json();
  console.log('Assistant:', data.choices[0].message.content);
}

/**
 * Example 5: Using Vision (grok-2-vision)
 * Analyze images along with text
 */
async function visionExample() {
  const fetch = require('node-fetch');
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What is in this image?' },
            {
              type: 'image_url',
              image_url: {
                url: 'https://example.com/image.jpg'
              }
            }
          ]
        }
      ],
      model: 'grok-2-vision-1212',
      max_tokens: 500
    })
  });

  const data = await response.json();
  console.log('Vision Analysis:', data.choices[0].message.content);
}

/**
 * Example 6: Azure Function Integration
 * How to use Grok in an Azure Function with proper error handling
 */
async function azureFunctionExample(context, req) {
  const fetch = require('node-fetch');
  
  try {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) throw new Error('GROK_API_KEY not configured');

    const query = req.body.query || req.query.q;
    if (!query) {
      return context.res = {
        status: 400,
        body: { error: 'Missing query' }
      };
    }

    context.log(`Processing query: ${query}`);

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: query }
        ],
        model: 'grok-4-fast-reasoning',
        max_tokens: 1024
      }),
      timeout: 30000
    });

    if (!response.ok) {
      const error = await response.text();
      context.log.error(`API error: ${response.status} ${error}`);
      
      return context.res = {
        status: response.status,
        body: { error: `API error: ${response.statusText}` }
      };
    }

    const data = await response.json();
    
    context.res = {
      status: 200,
      body: {
        result: data.choices[0].message.content,
        tokens: data.usage
      }
    };

  } catch (error) {
    context.log.error(`Error: ${error.message}`);
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
}

/**
 * Example 7: Streaming Responses (if using compatible SDK)
 * For long responses, stream chunks as they arrive
 */
async function streamingExample() {
  const fetch = require('node-fetch');
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Write a short story about a robot' }
      ],
      model: 'grok-4-fast-reasoning',
      max_tokens: 2000,
      stream: true  // Enable streaming
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i];
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.choices[0].delta.content) {
          process.stdout.write(data.choices[0].delta.content);
        }
      }
    }
    
    buffer = lines[lines.length - 1];
  }
}

/**
 * Example 8: Error Handling & Retries
 * Implement exponential backoff for rate limits
 */
async function retryExample() {
  const fetch = require('node-fetch');
  
  async function callGrokWithRetry(query, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: query }],
            model: 'grok-4-fast-reasoning',
            max_tokens: 500
          }),
          timeout: 30000
        });

        if (response.ok) {
          return await response.json();
        }

        if (response.status === 429) {
          // Rate limited - wait and retry
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        throw new Error(`API error: ${response.status}`);

      } catch (error) {
        if (attempt === maxRetries - 1) throw error;
        console.log(`Attempt ${attempt + 1} failed: ${error.message}`);
      }
    }
  }

  try {
    const result = await callGrokWithRetry('What is the meaning of life?');
    console.log(result.choices[0].message.content);
  } catch (error) {
    console.error('Failed after all retries:', error);
  }
}

module.exports = {
  basicChatExample,
  reasoningExample,
  costOptimizedExample,
  conversationExample,
  visionExample,
  azureFunctionExample,
  streamingExample,
  retryExample
};
