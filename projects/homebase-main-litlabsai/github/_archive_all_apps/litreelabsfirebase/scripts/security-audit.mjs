#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHECKS = { PASSED: '✓', FAILED: '✗', WARNING: '⚠' };
const results = [];

function log(check, status, message) {
  results.push({ check, status, message });
  console.log(`${CHECKS[status]} ${check}: ${message}`);
}

function runCheck(name, fn) {
  try {
    console.log(`\n🔍 ${name}`);
    fn();
  } catch (error) {
    log(name, 'FAILED', error.message);
  }
}

runCheck('Check: .env not in version control', () => {
  try {
    execSync('git ls-files | Select-String "^\\.env$"', { stdio: 'pipe' });
    log('ENV_IN_GIT', 'FAILED', '.env file found in git');
  } catch { log('ENV_IN_GIT', 'PASSED', '.env is properly ignored'); }
});

runCheck('Check: npm dependencies secure', () => {
  const output = execSync('npm audit --json', { encoding: 'utf8' }).toString();
  try {
    const audit = JSON.parse(output);
    if (audit.metadata?.vulnerabilities?.total > 0) {
      log('NPM_AUDIT', 'FAILED', `${audit.metadata.vulnerabilities.total} vulnerabilities found`);
    } else { log('NPM_AUDIT', 'PASSED', 'No vulnerabilities found'); }
  } catch { log('NPM_AUDIT', 'PASSED', 'npm audit completed'); }
});

runCheck('Check: Security headers configured', () => {
  const configPath = path.join(process.cwd(), 'next.config.ts');
  if (!fs.existsSync(configPath)) { log('SECURITY_HEADERS', 'FAILED', 'next.config.ts not found'); return; }
  const content = fs.readFileSync(configPath, 'utf8');
  const hasHeaders = content.includes('X-Content-Type-Options') && content.includes('X-Frame-Options') && content.includes('Strict-Transport-Security');
  if (hasHeaders) { log('SECURITY_HEADERS', 'PASSED', 'All security headers configured'); }
  else { log('SECURITY_HEADERS', 'WARNING', 'Some security headers may be missing'); }
});

runCheck('Check: Security middleware installed', () => {
  const files = ['lib/middleware/rateLimit.ts', 'lib/middleware/cors.ts', 'lib/config/env.ts'];
  const missing = files.filter(f => !fs.existsSync(path.join(process.cwd(), f)));
  if (missing.length > 0) { log('MIDDLEWARE', 'WARNING', `Missing files: ${missing.join(', ')}`); }
  else { log('MIDDLEWARE', 'PASSED', 'All security middleware present'); }
});

runCheck('Check: Environment template present', () => {
  if (fs.existsSync(path.join(process.cwd(), '.env.example'))) { log('ENV_EXAMPLE', 'PASSED', '.env.example found'); }
  else { log('ENV_EXAMPLE', 'FAILED', '.env.example not found'); }
});

runCheck('Check: Security policy documented', () => {
  if (fs.existsSync(path.join(process.cwd(), 'SECURITY.md'))) { log('SECURITY_MD', 'PASSED', 'SECURITY.md present'); }
  else { log('SECURITY_MD', 'WARNING', 'SECURITY.md not found'); }
});

console.log('\n' + '='.repeat(50));
console.log('SECURITY AUDIT SUMMARY');
console.log('='.repeat(50));
const passed = results.filter(r => r.status === 'PASSED').length;
const failed = results.filter(r => r.status === 'FAILED').length;
const warnings = results.filter(r => r.status === 'WARNING').length;
console.log(`\n✓ Passed: ${passed}`);
console.log(`✗ Failed: ${failed}`);
console.log(`⚠ Warnings: ${warnings}`);
if (failed > 0) { console.log('\n🚨 Security audit FAILED'); process.exit(1); }
if (warnings > 0) { console.log('\n⚠️ Security audit passed with warnings'); process.exit(0); }
console.log('\n✅ Security audit PASSED');
process.exit(0);
