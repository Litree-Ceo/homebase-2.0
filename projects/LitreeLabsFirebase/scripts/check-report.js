#!/usr/bin/env node

(async () => {
  try {
    const fs = await import('fs');
    const candidates = [
      './.git/gitleaks-report.json',
      './gitleaks-report.json',
      './gitleaks-report/gitleaks-report.json',
      './artifacts/gitleaks-report.json',
    ];
    let found = null;
    for (const p of candidates) {
      if (fs.existsSync(p)) { found = p; break; }
    }
    if (!found) {
      console.error('gitleaks-report.json not found — failing CI');
      process.exit(1);
    }
    const rpt = JSON.parse(fs.readFileSync(found, 'utf8'));
    const count = rpt.findings_count ?? (Array.isArray(rpt.findings) ? rpt.findings.length : 0);
    console.log('gitleaks findings_count=', count);
    const threshold = parseInt(process.env.GITLEAKS_FAIL_THRESHOLD || '0', 10);
    if (count > threshold) {
      console.error(`Failing CI: findings_count (${count}) > threshold (${threshold})`);
      process.exit(2);
    }
    console.log('Report below threshold — OK');
    process.exit(0);
  } catch (err) {
    console.error('Error reading gitleaks report', err);
    process.exit(3);
  }
})();
