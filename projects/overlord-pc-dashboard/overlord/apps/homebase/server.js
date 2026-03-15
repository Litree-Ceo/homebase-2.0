const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Static files
app.use(express.static('public'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'homebase', timestamp: new Date().toISOString() });
});

// Home route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Overlord Homebase</title>
      <style>
        body { font-family: sans-serif; background: #0a0a0a; color: #00ff88; padding: 40px; }
        h1 { color: #00ff88; }
        .status { padding: 20px; background: #111; border-radius: 8px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>Overlord Homebase</h1>
      <div class="status">
        <p>Status: <strong>Online</strong></p>
        <p>Port: ${PORT}</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`[Homebase] Server running on http://localhost:${PORT}`);
});
