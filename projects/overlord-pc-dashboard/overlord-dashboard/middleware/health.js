const os = require('os');
const fs = require('fs');
const path = require('path');

class HealthMonitor {
  constructor(serviceName, port) {
    this.serviceName = serviceName;
    this.port = port;
    this.startTime = Date.now();
    this.requestCount = 0;
    this.lastError = null;
  }

  middleware() {
    return (req, res, next) => {
      this.requestCount++;
      if (req.path === '/health') {
        const health = {
          status: 'healthy',
          service: this.serviceName,
          port: this.port,
          timestamp: new Date().toISOString(),
          uptime: Math.floor((Date.now() - this.startTime) / 1000),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          requests: this.requestCount,
          pid: process.pid,
          node: process.version,
          platform: os.platform(),
          loadAvg: os.loadavg(),
          lastError: this.lastError,
          version: require('../package.json').version || '1.0.0'
        };
        return res.status(200).json(health);
      }
      next();
    };
  }

  trackError(error) {
    this.lastError = {
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };
  }
}

module.exports = HealthMonitor;
