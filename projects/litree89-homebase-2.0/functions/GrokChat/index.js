const fetch = require('node-fetch');

/**
 * Azure Function for xAI Grok API Integration
 * 
 * Environment Variables (from Key Vault):
 * - GROK_API_KEY: xAI API key (stored in Key Vault)
 * 
 * Usage:
 * POST /api/GrokChat
 * Body: { "query": "Your question here" }
 */

module.exports = async function (context, req) {
    try {
        // Log incoming request
        context.log(`[GrokChat] Received request with method: ${req.method}`);

        // Validate HTTP method
        if (req.method !== 'POST') {
            return context.res = {
                status: 405,
                body: { error: 'Method not allowed. Use POST.' }
            };
        }

        // Retrieve Grok API key from environment (sourced from Key Vault via Managed Identity)
        const apiKey = process.env.GROK_API_KEY;
        if (!apiKey || apiKey.startsWith('REPLACE_')) {
            context.log.error('[GrokChat] GROK_API_KEY is missing or placeholder');
            return context.res = {
                status: 500,
                body: { error: 'GROK_API_KEY not configured. Set in Function App settings.' }
            };
        }

        // Extract query from request body or query parameters
        const query = req.body?.query || req.query?.q;
        if (!query) {
            context.log.warn('[GrokChat] Missing query parameter');
            return context.res = {
                status: 400,
                body: { error: 'Missing "query" parameter. Send POST with body: { "query": "your question" }' }
            };
        }

        context.log(`[GrokChat] Processing query: ${query.substring(0, 50)}...`);

        // Prepare request to xAI Grok API
        const grokModel = req.body?.model || 'grok-4-fast-reasoning';
        const maxTokens = req.body?.max_tokens || 1024;
        const systemPrompt = req.body?.system || 'You are a helpful assistant for the EverythingHomebase application.';

        const grokRequest = {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ],
            model: grokModel,
            max_tokens: maxTokens,
            temperature: req.body?.temperature || 0.7
        };

        context.log(`[GrokChat] Calling xAI API with model: ${grokModel}`);

        // Call xAI Grok API
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(grokRequest),
            timeout: 30000 // 30 second timeout
        });

        // Handle API response status
        if (!response.ok) {
            const errorText = await response.text();
            context.log.error(`[GrokChat] API error: ${response.status} ${errorText}`);
            
            if (response.status === 429) {
                return context.res = {
                    status: 429,
                    body: { error: 'Rate limit exceeded. Try again in a moment.' }
                };
            } else if (response.status === 401) {
                return context.res = {
                    status: 401,
                    body: { error: 'Authentication failed. Check GROK_API_KEY.' }
                };
            }

            return context.res = {
                status: response.status,
                body: { error: `xAI API error: ${response.statusText}` }
            };
        }

        // Parse Grok response
        const data = await response.json();
        
        if (!data.choices || !data.choices[0]) {
            context.log.error('[GrokChat] Invalid response structure from xAI API');
            return context.res = {
                status: 502,
                body: { error: 'Invalid response from xAI API' }
            };
        }

        const result = data.choices[0].message.content;
        context.log(`[GrokChat] Successfully received response (${data.usage.output_tokens} tokens)`);

        // Return success response
        context.res = {
            status: 200,
            body: {
                success: true,
                query: query,
                result: result,
                model: data.model,
                usage: {
                    input_tokens: data.usage.input_tokens,
                    output_tokens: data.usage.output_tokens,
                    total_tokens: data.usage.input_tokens + data.usage.output_tokens
                },
                timestamp: new Date().toISOString()
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };

    } catch (error) {
        context.log.error(`[GrokChat] Unhandled error: ${error.message}`);
        context.log.error(error);

        context.res = {
            status: 500,
            body: { 
                error: 'Internal server error',
                message: error.message,
                trace: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        };
    }
};
