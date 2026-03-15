const { app } = require('@azure/functions');

app.http('auth-login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const { email, password } = await request.json();

      if (!email || !password) {
        return {
          status: 400,
          jsonBody: { error: 'Email and password required' }
        };
      }

      // TODO: Replace with real database lookup
      // For demo, return success
      const user = {
        id: `user_${email}`,
        email,
        tier: 'free'
      };

      const sessionId = `session_${Date.now()}`;

      return {
        status: 200,
        jsonBody: {
          message: 'Login successful',
          user,
          tier: 'free',
          sessionId
        }
      };
    } catch (error) {
      context.log('Login error:', error);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});
