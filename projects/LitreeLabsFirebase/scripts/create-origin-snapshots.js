const fs = require('fs');
const cp = require('child_process');
const path = require('path');

function ts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

const origin = 'https://github.com/LiTree89/Labs-Ai.git';
const lsremotePath = path.join(process.cwd(), 'lsremote.txt');
if (!fs.existsSync(lsremotePath)) {
  console.error('lsremote.txt not found in cwd. Run `git ls-remote --heads <origin> > lsremote.txt` first.');
  process.exit(1);
}

const content = fs.readFileSync(lsremotePath, 'utf8').trim().split(/\r?\n/).filter(Boolean);
const stamp = ts();
console.log('Snapshot timestamp:', stamp);

for (const line of content) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) continue;
  const sha = parts[0];
  const ref = parts[1];
  if (!ref.startsWith('refs/heads/')) continue;
  const branch = ref.replace('refs/heads/', '');
  const newBranch = `pre-origin-push-${stamp}-${branch}`;
  console.log(`Pushing ${sha} -> ${newBranch}`);
  try {
    cp.execSync(`git push ${origin} ${sha}:refs/heads/${newBranch}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to push snapshot for ${branch}:`, err.message);
  }
}

console.log('Snapshot creation completed.');
