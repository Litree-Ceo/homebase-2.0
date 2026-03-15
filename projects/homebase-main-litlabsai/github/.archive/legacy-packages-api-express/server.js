/* eslint-env node */
const path = require('node:path');
const express = require('express');
const http = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ping } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Paddle Payment Routes
const billingRoutes = require('./src/routes/billing');
const checkoutRoutes = require('./src/routes/checkout');
app.use('/api/billing', billingRoutes);
app.use('/api/checkout', checkoutRoutes);

// @workspace Add affiliate endpoints
app.get('/hero', (req, res) => res.json({ ui: 'Neon Tree', tiers: ['Free', 'Pro', 'Enterprise'] }));

// Database health probe (MySQL wire protocol: MySQL, MariaDB, TiDB)
app.get('/db/health', async (_req, res) => {
  try {
    await ping();
    res.json({ ok: true });
  } catch (err) {
    console.error('DB health check failed', err);
    res.status(500).json({
      ok: false,
      error: 'DB connection failed',
      detail: err?.code || err?.message || 'unknown',
    });
  }
});

// SignalR Negotiation Mock (for Azure SignalR Service compatibility)
app.post('/hub/negotiate', (req, res) => {
  res.json({
    url: process.env.SIGNALR_URL || 'http://localhost:3000/hub',
    accessToken: 'mock-token',
  });
});

// Socket.io for Metaverse
io.on('connection', socket => {
  console.log('User connected to Metaverse:', socket.id);

  socket.on('avatar:position', data => {
    socket.broadcast.emit('avatar:position', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`✅ Backend Ready on port ${PORT}`);
  console.log('🔌 Socket.io and SignalR endpoints active');
  console.log(`📍 Health check: http://localhost:${PORT}/hero`);
});
