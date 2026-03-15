// Azure Functions v4 - Entry point
// Import only essential functions that compile successfully

import { app } from '@azure/functions';

// Core Health Check
import './functions/health.js';

// Crypto Price API
import './functions/crypto.js';

// Automated Trading
import { traderStart, traderStatus, traderHistory } from './functions/trader-api.js';

// Register trader endpoints
app.http('traderStart', {
  methods: ['POST'],
  route: 'trader/start',
  handler: traderStart,
});

app.http('traderStatus', {
  methods: ['GET'],
  route: 'trader/status',
  handler: traderStatus,
});

app.http('traderHistory', {
  methods: ['GET'],
  route: 'trader/history',
  handler: traderHistory,
});
