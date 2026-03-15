const { app } = require('@azure/functions');

app.http('copilot-prompt', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const { prompt, userId, tier, userContext } = await request.json();

      if (!prompt) {
        return {
          status: 400,
          jsonBody: { error: 'Prompt required' }
        };
      }

      // Check tier-based limits
      if (tier === 'free') {
        // In real implementation, check daily usage
        context.log(`[Free tier] User ${userId} used prompt: ${prompt.substring(0, 50)}...`);
      }

      // TODO: Integrate Grok API here
      // For now, return mock responses based on keywords
      let response = 'I understand. How can I help you with LiTreeLabStudio™?';

      if (prompt.toLowerCase().includes('create')) {
        response = '✨ Ready to create! You can start with:\n1. Post (share with community)\n2. Video (stream or upload)\n3. World (build immersive space)\n4. Asset (for marketplace)\n\nWhich interests you?';
      } else if (prompt.toLowerCase().includes('earn') || prompt.toLowerCase().includes('money')) {
        response = '💰 Ways to earn LITBIT:\n1. Create & sell content\n2. Join guilds for rewards\n3. Complete missions\n4. Stake & trade\n5. Develop plugins\n\nWhich path interests you?';
      } else if (prompt.toLowerCase().includes('explore')) {
        response = '🔍 Explore options:\n• Worlds: Immersive 3D experiences\n• Media: Streams, videos, podcasts\n• Creators: Follow interesting people\n• Missions: Challenges & rewards\n• Marketplace: Buy/sell items & services\n\nWhat would you like to check out?';
      }

      return {
        status: 200,
        jsonBody: {
          response,
          tokens_used: prompt.split(' ').length,
          tier_remaining: tier === 'free' ? '5 prompts remaining today' : 'unlimited'
        }
      };
    } catch (error) {
      context.log('Copilot error:', error);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});
