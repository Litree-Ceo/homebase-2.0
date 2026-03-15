const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('<html><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:Arial;background:#1a1a2e;color:#eee;"><h1>🚀 Hello GKE!</h1></body></html>');
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
