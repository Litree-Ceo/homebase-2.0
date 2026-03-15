/* global require */
const { app } = require('@azure/functions');

app.http('hello', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('Processing hello request...');
        
        const name = request.query.get('name') || 'World';
        
        return {
            status: 200,
            jsonBody: {
                message: `Hello, ${name}!`,
                timestamp: new Date().toISOString(),
                environment: 'Azure Static Web App',
                api: 'Node.js Serverless Function'
            }
        };
    }
});
