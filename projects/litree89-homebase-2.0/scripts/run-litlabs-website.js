const { spawn } = require('node:child_process');
const { join } = require('node:path');

const sitePath = join(__dirname, '../workspace/src/litlabs-web/sites/website-project');
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const proc = spawn(command, ['serve', 'public'], {
  cwd: sitePath,
  stdio: 'inherit',
});

proc.on('close', code => process.exit(code));
proc.on('error', error => {
  console.error('Failed to launch Litlabs site:', error);
  process.exit(1);
});
