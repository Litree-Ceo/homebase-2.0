module.exports = {
  apps: [
    {
      name: 'telegram-bot',
      script: 'index.js',
      watch: true,
      ignore_watch: ['node_modules', 'logs'],
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
    },
  ],
};
