const { app } = require('@azure/functions');

// Mock database for demo (replace with real DB later)
const users = new Map();
const sessions = new Map();

app.http('auth-signup', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const { email, password, interests, goals } = await request.json();

      if (!email || !password) {
        return {
          status: 400,
          jsonBody: { error: 'Email and password required' }
        };
      }

      if (users.has(email)) {
        return {
          status: 409,
          jsonBody: { error: 'User already exists' }
        };
      }

      const userId = `user_${Date.now()}`;
      const user = {
        id: userId,
        email,
        password, // TODO: Hash password with bcrypt
        interests: interests || [],
        goals: goals || '',
        tier: 'free',
        createdAt: new Date().toISOString()
      };

      users.set(email, user);

      const sessionId = `session_${Date.now()}`;
      sessions.set(sessionId, { userId, email });

      return {
        status: 201,
        jsonBody: {
          message: 'User created successfully',
          user: {
            id: user.id,
            email: user.email,
            interests: user.interests,
            tier: user.tier
          },
          sessionId
        }
      };
    } catch (error) {
      context.log('Signup error:', error);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});
