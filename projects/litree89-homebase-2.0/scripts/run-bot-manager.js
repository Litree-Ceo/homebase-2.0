const { spawn } = require('node:child_process');
const { join } = require('node:path');

const workspacePath = join(__dirname, '../workspace');
const pythonBinary = process.platform === 'win32' ? 'python.exe' : 'python3';

const proc = spawn(pythonBinary, ['src/bot_manager.py'], {
  cwd: workspacePath,
  stdio: 'inherit',
});

proc.on('close', code => process.exit(code));
proc.on('error', error => {
  console.error('Bot manager failed to start:', error);
  process.exit(1);
});
