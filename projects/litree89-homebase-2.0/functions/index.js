/**
 * Grok Chat Integration - Azure Function Handler
 * 
 * Triggers on:
 * - HTTP requests: Query Grok directly
 * - Cosmos DB changes: Broadcast via SignalR (when integrated)
 * 
 * Environment vars (from Key Vault):
 * - GROK_API_KEY: xAI API key (starts with xai_)
 * - COSMOS_ENDPOINT: Cosmos DB endpoint
 * - SIGNALR_CONN: SignalR connection string
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async function (context, req) {
  context.log('Grok integration function triggered');

  try {
    // ========== INPUT VALIDATION ==========
    const query = req.body?.query || req.query?.q;
    const model = req.body?.model || 'grok-3-mini'; // faster, cheaper
    
    if (!query) {
      return (context.res = {
        status: 400,
        body: { 
          error: 'Missing query parameter',
          hint: 'POST with { "query": "your question" } or use ?q=your+question'
        }
      });
    }

    // ========== API KEY VALIDATION ==========
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey || apiKey.startsWith('REPLACE_')) {
      context.log.error('GROK_API_KEY not configured in Key Vault');
      return (context.res = {
        status: 500,
        body: { 
          error: 'GROK_API_KEY not configured',
          hint: 'Set secret in Key Vault: az keyvault secret set --vault-name <vault> --name GROK-API-KEY --value xai_YOUR_KEY'
        }
      });
    }

    context.log(`Calling Grok API with model: ${model}`);

    // ========== CALL GROK API ==========
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful AI assistant for the EverythingHomebase application. Be concise and practical.' 
          },
          { 
            role: 'user', 
            content: query 
          }
        ],
        model: model,
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    // ========== RESPONSE HANDLING ==========
    if (!grokResponse.ok) {
      const error = await grokResponse.text();
      context.log.error(`Grok API error: ${grokResponse.status} - ${error}`);
      
      return (context.res = {
        status: grokResponse.status,
        body: { 
          error: `Grok API error: ${grokResponse.status}`,
          details: error.substring(0, 200) // limit error output
        }
      });
    }

    const grokData = await grokResponse.json();
    const reply = grokData.choices?.[0]?.message?.content;

    if (!reply) {
      return (context.res = {
        status: 500,
        body: { error: 'Invalid response from Grok API' }
      });
    }

    // ========== SUCCESS RESPONSE ==========
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        query: query,
        response: reply,
        model: grokData.model,
        usage: {
          prompt_tokens: grokData.usage?.prompt_tokens,
          completion_tokens: grokData.usage?.completion_tokens,
          total_tokens: grokData.usage?.total_tokens
        },
        timestamp: new Date().toISOString()
      }
    };

    context.log(`Grok query successful (${grokData.usage?.total_tokens} tokens used)`);

  } catch (error) {
    context.log.error(`Exception in Grok function: ${error.message}`);
    
    context.res = {
      status: 500,
      body: { 
        error: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };
  }
};
