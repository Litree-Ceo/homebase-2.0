module.exports = async function (context, req) {
    context.log('Health check endpoint called');

    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            message: "HomeBase API is running!",
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            status: "healthy"
        }
    };
};
