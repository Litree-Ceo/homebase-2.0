module.exports = {
  apps: [{
    name: 'telegram-bot',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info'
    },
    env_development: {
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
      watch: true
    },
    // PM2 logs
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Auto restart on failure
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 5000,
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000
  }]
};
