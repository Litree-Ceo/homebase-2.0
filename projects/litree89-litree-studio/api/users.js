/* global require */
const { app } = require('@azure/functions');

app.http('users', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Fetching users...');
        
        // Simulated database
        const users = [
            { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
            { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
            { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'User' }
        ];
        
        return {
            status: 200,
            jsonBody: {
                users: users,
                count: users.length,
                timestamp: new Date().toISOString()
            }
        };
    }
});
