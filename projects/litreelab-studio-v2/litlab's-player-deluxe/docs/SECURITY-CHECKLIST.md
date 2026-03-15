# Security Hardening Checklist for Production Deployment

This checklist ensures Overlord Monolith meets security standards before going live.

## Pre-Deployment Security Audit

Complete this checklist before deploying to production.

### ✓ Application Security

- [ ] **Authentication & Authorization**
  - [ ] All sensitive endpoints require authentication
  - [ ] JWT tokens validated on every request
  - [ ] Session timeout configured (recommend 1 hour)
  - [ ] Password hashing uses bcrypt/argon2 (NOT plaintext)
  - [ ] Role-based access control (RBAC) implemented
  - [ ] Users cannot access others' data

- [ ] **API Security**
  - [ ] Run security tests: `bash scripts/validate-firebase-rules.sh`
  - [ ] CORS configured (NOT `*` in prod)
  - [ ] Security headers set (see [WEB-SECURITY-BASELINE.md](docs/WEB-SECURITY-BASELINE.md))
  - [ ] Rate limiting enabled (5-10 /min for login, 100+/hr for API)
  - [ ] Input validation on all endpoints
  - [ ] File uploads restricted (size, type, content)
  - [ ] SQL injection prevention (use parameterized queries)
  - [ ] XSS prevention (output encoding enabled)

- [ ] **Logging & Monitoring**
  - [ ] Authentication events logged (login, logout, failed attempts)
  - [ ] Data modifications logged (create, update, delete)
  - [ ] Error logs don't expose sensitive info
  - [ ] Logs stored securely (NOT in git, NOT on client)
  - [ ] All code changes logged (audit trail)
  - [ ] Alerts configured for suspicious activity

### ✓ Infrastructure Security

- [ ] **Secrets Management**
  - [ ] `.env` file created from `.env.example` (NOT in git)
  - [ ] All API keys/tokens in `.env` only
  - [ ] Firebase key file NOT in git (in `.gitignore`)
  - [ ] No hardcoded credentials in code
  - [ ] Secrets rotated every 90 days
  - [ ] Backup keys for rotation stored securely

- [ ] **Network Security**
  - [ ] HTTPS/TLS enforced (NO HTTP in production)
  - [ ] Firewall rules configured (restrict ports)
  - [ ] SSH keys with 600 permissions
  - [ ] SSH password auth disabled (keys only)
  - [ ] Run hardening script: `sudo bash scripts/harden-ssh-tunnel.sh`
  - [ ] Fail2Ban rate limiting enabled
  - [ ] VPN/proxy in place if needed

- [ ] **Database Security**
  - [ ] Database user NOT root/admin
  - [ ] Backups encrypted and stored offline
  - [ ] Database backups tested (restore works)
  - [ ] Access logs enabled
  - [ ] Prepared statements used (prevent SQL injection)
  - [ ] Sensitive fields encrypted at rest

- [ ] **Container/Docker Security**
  - [ ] Base images scanned for vulnerabilities
  - [ ] No secrets in Docker images
  - [ ] Minimal base images used (Alpine where possible)
  - [ ] Non-root user in containers (NOT running as root)
  - [ ] Resource limits set (CPU, RAM)
  - [ ] Read-only file systems where possible

### ✓ Code Quality & Dependency

- [ ] **Code Review**
  - [ ] All code reviewed before merge
  - [ ] Run linters: `bash scripts/lint-all.sh`
  - [ ] Tests passing: `pytest tests/`
  - [ ] No hardcoded secrets/credentials
  - [ ] No TODO/FIXME security items

- [ ] **Dependencies**
  - [ ] Dependencies pinned (see [requirements.txt](requirements.txt))
  - [ ] Vulnerability scan passed: `pip audit`
  - [ ] No high/critical CVEs
  - [ ] Outdated packages updated
  - [ ] Unused dependencies removed

- [ ] **Git History**
  - [ ] No secrets in commit history (use `git-filter-repo` if needed)
  - [ ] `.gitignore` blocks sensitive files
  - [ ] Branch protection enabled (require reviews)
  - [ ] Signed commits enabled (GPG)

### ✓ Firebase Configuration

- [ ] **Firestore Rules**
  - [ ] Rules audit passed: `bash scripts/validate-firebase-rules.sh`
  - [ ] All rules require `request.auth != null`
  - [ ] User data limited to own documents
  - [ ] Admin operations require custom claims
  - [ ] Rules tested in emulator

- [ ] **Firebase Security**
  - [ ] Firebase project privacy policy set
  - [ ] Audit logging enabled
  - [ ] Sensitive rules enforced (payment, PII data)
  - [ ] Custom tokens validated
  - [ ] Service account key file secured (NOT in repo)

### ✓ Deployment & DevOps

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions workflows active
  - [ ] Lint checks run on every PR
  - [ ] Security scans run on every push
  - [ ] Tests required before merge
  - [ ] Deployment limited to `main` branch
  - [ ] Manual approval for prod deployments

- [ ] **Monitoring & Alerting**
  - [ ] Application Insights configured
  - [ ] Error tracking enabled (Sentry/similar)
  - [ ] Performance monitoring set up
  - [ ] Alerts configured (errors, high latency, low disk space)
  - [ ] On-call rotation established

- [ ] **Incident Response**
  - [ ] Incident response plan documented
  - [ ] Team on-call and trained
  - [ ] Backup restore procedures tested
  - [ ] Communication plan in place (notify users if needed)
  - [ ] Post-incident review process defined

### ✓ Compliance & Legal

- [ ] **Data Protection**
  - [ ] Privacy policy published
  - [ ] Terms of service published
  - [ ] GDPR compliant (if EU users)
  - [ ] Data retention policy documented
  - [ ] User data deletion implemented

- [ ] **Access Control**
  - [ ] Admin access audited
  - [ ] Role separation enforced
  - [ ] Principle of least privilege
  - [ ] Access logs retained for 90 days
  - [ ] Offboarding procedures (remove access)

---

## Pre-Launch Security Test

Run this before going live:

```bash
# 1. Environment validation
python scripts/validate-env.py --strict

# 2. Lint all code
bash scripts/lint-all.sh

# 3. Run tests
pytest tests/ -v

# 4. Firebase rules audit
bash scripts/validate-firebase-rules.sh

# 5. Dependency scan
pip audit

# 6. Check for secrets in git
# If needed: pip install git-filter-repo
# git-filter-repo --invert-paths --path '*.key' --path '.env'

# 7. Security headers check
curl -I https://yourdomain.com | grep -E "Strict-Transport-Security|X-Content-Type-Options|X-Frame-Options"
```

---

## Post-Launch Checklist

- [ ] Monitor error logs daily for first week
- [ ] Verify backup/restore process works
- [ ] Test incident response procedures
- [ ] Schedule dependency update reviews (monthly)
- [ ] Plan security audit (quarterly)
- [ ] Rotate secrets at 90-day mark
- [ ] Review access logs for anomalies

---

## Incident Response

If a security issue is discovered:

1. **Immediately:**
   - [ ] Stop affected service if necessary
   - [ ] Notify team
   - [ ] Preserve logs and evidence

2. **Within 1 hour:**
   - [ ] Assess impact (affected users, data)
   - [ ] Determine cause
   - [ ] Begin remediation

3. **Communication:**
   - [ ] Update user-facing status page
   - [ ] Notify affected users (if required)
   - [ ] Communicate timeline/updates

4. **Post-Incident:**
   - [ ] Root cause analysis
   - [ ] Implement permanent fix
   - [ ] Deploy fix and verify
   - [ ] Document lessons learned
   - [ ] Update procedures to prevent recurrence

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [WEB-SECURITY-BASELINE.md](docs/WEB-SECURITY-BASELINE.md) - API security
- [scripts/harden-ssh-tunnel.sh](scripts/harden-ssh-tunnel.sh) - SSH hardening
- [scripts/validate-firebase-rules.sh](scripts/validate-firebase-rules.sh) - Firebase audit
- [requirements.txt](requirements.txt) - Pinned dependencies

---

**Sign-off:** Before production deployment, this checklist must be reviewed and signed by:
- [ ] Development Lead
- [ ] Security Lead (if available)
- [ ] Ops/DevOps Lead

**Date:** ________________  
**Approved by:** ________________
