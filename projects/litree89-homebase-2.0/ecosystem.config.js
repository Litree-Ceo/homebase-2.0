module.exports = {
  apps: [
    {
      name: 'litlabs-web',
      // Run the main Next.js app (apps/web) in production mode
      script: 'node',
      args: 'node_modules/next/dist/bin/next start -p 3001',
      cwd: './apps/web',
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
