# Security Policy

## Overview
This document outlines the security practices and policies for LitLabs. We take security seriously and encourage responsible disclosure of any vulnerabilities.

## Reporting Security Issues

**Please do NOT open public GitHub issues for security vulnerabilities.**

If you discover a security vulnerability, please email security@litlabs.app with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 24 hours and provide a status update within 72 hours.

## Security Best Practices

### Authentication & Authorization
- All API endpoints require authentication (JWT or API key)
- Passwords must be at least 8 characters with uppercase, numbers, and special characters
- Session tokens expire after 24 hours
- All authentication attempts are rate limited (5 attempts per 15 minutes)

### Data Protection
- All data in transit is encrypted using HTTPS/TLS 1.2+
- Sensitive data at rest is encrypted using AES-256
- PII is never logged or exposed in error messages
- Database credentials are stored in environment variables, never in code

### Rate Limiting
- General API: 100 requests per 15 minutes per user
- Authentication: 5 attempts per 15 minutes per IP
- Critical operations: 10 requests per hour per user

### CORS Policy
- CORS is enabled only for whitelisted origins
- Credentials are required for cross-origin requests
- Preflight requests are cached for 24 hours

### Input Validation
- All user input is validated using Zod schemas
- SQL injection prevention via parameterized queries
- XSS prevention via HTML escaping
- CSRF tokens on all state-changing operations

### Dependency Management
- All dependencies are kept up to date
- Security patches are applied within 24 hours
- Vulnerable dependencies are removed immediately
- npm audit is run on every deployment

## Security Headers

All responses include these headers:
- `Strict-Transport-Security`: HTTPS enforcement
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `X-Frame-Options`: Prevents clickjacking
- `Content-Security-Policy`: Restricts resource loading
- `Referrer-Policy`: Controls referrer information

## Compliance

- GDPR compliant data handling
- SOC 2 Type II controls implemented
- Regular security audits (quarterly)
- Penetration testing (annually)

## Environment Variables

Never commit sensitive environment variables. Always use:
- `.env.local` for local development (git-ignored)
- Environment-specific variables for production (encrypted in deployment)
- Rotate keys monthly in production

See `.env.example` for required variables.

## Deployment Security

- All deployments are signed and verified
- Rollback procedures are tested monthly
- Zero-downtime deployments with health checks
- Automated security scanning on every merge to main
- Staging environment mirrors production security

## Incident Response

In case of a security incident:
1. We will immediately patch the vulnerability
2. Affected users will be notified within 24 hours
3. A postmortem will be conducted and published
4. Security improvements will be implemented to prevent recurrence

## Contact

Security inquiries: security@litlabs.app
Support: support@litlabs.app

Last Updated: December 3, 2025
