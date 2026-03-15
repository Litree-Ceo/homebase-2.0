const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4280;

const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // API Routes
    if (req.url === '/api/hello') {
        const name = new URL(`http://localhost${req.url}`, 'http://localhost').searchParams.get('name') || 'World';
        res.writeHead(200);
        res.end(JSON.stringify({
            message: `Hello, ${name}!`,
            timestamp: new Date().toISOString(),
            environment: 'Azure Static Web App',
            api: 'Node.js Serverless Function'
        }));
        return;
    }

    if (req.url === '/api/users') {
        res.writeHead(200);
        res.end(JSON.stringify({
            users: [
                { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
                { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User' },
                { id: 3, name: 'Carol Williams', email: 'carol@example.com', role: 'User' }
            ],
            count: 3,
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // Serve static files
    res.setHeader('Content-Type', 'text/html');
    const filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
    
    if (fs.existsSync(filePath)) {
        res.writeHead(200);
        res.end(fs.readFileSync(filePath));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`\n✅ Full-Stack Azure App is running at http://localhost:${PORT}`);
    console.log(`📂 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api/hello`);
    console.log(`👥 Users: http://localhost:${PORT}/api/users\n`);
});
