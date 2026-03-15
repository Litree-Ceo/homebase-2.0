# LitLabs AI - Security Fix Checklist

**Date Created:** December 5, 2025  
**Last Updated:** December 5, 2025  
**Status:** 🔴 URGENT ACTION REQUIRED

---

## 🔴 CRITICAL FIXES (Days 1-3) - MUST DO FIRST

### Payment Security

- [ ] **Task 1.1:** Add authentication to `/app/api/checkout-session/route.ts`
  - [ ] Import `getUserFromRequest`
  - [ ] Add auth check at start of handler
  - [ ] Use `user.uid` and `user.email` from token, not client
  - [ ] Add Guardian fraud check
  - [ ] Test with valid/invalid tokens
- [ ] **Task 1.2:** Add authentication to `/app/api/create-checkout-session/route.ts`
  - [ ] Import `getUserFromRequest`
  - [ ] Add auth check
  - [ ] Remove userId/email from request body
  - [ ] Use authenticated user data only
  - [ ] Test thoroughly
- [ ] **Task 1.3:** Add authentication to `/app/api/stripe-checkout/route.ts`
  - [ ] Add auth check
  - [ ] Validate tier with Zod
  - [ ] Add Guardian check
  - [ ] Test
- [ ] **Task 1.4:** Add authentication to `/app/api/paypal-checkout/route.ts`
  - [ ] Add auth check
  - [ ] Validate inputs
  - [ ] Add Guardian check
  - [ ] Test

- [ ] **Task 1.5:** Remove user-provided URLs from all payment endpoints
  - [ ] Use fixed successUrl/cancelUrl from env
  - [ ] Remove URL parameters from request bodies
  - [ ] Test redirect flows

- [ ] **Task 1.6:** Add Zod validation to all payment endpoints
  - [ ] Create `payment-schemas.ts`
  - [ ] Add `tierSchema`
  - [ ] Add `checkoutRequestSchema`
  - [ ] Apply to all payment routes
  - [ ] Test with invalid inputs

### Admin Security

- [ ] **Task 2.1:** Add authentication to `/app/api/admin/users/route.ts`
  - [ ] Add `requireAdmin` to GET handler
  - [ ] Add `requireAdmin` to POST handler
  - [ ] Test with regular user token (should fail)
  - [ ] Test with admin token (should work)
- [ ] **Task 2.2:** Add Guardian monitoring to admin actions
  - [ ] Add Guardian check for listing users
  - [ ] Add Guardian check for banning users
  - [ ] Add Guardian check for tier changes
  - [ ] Log all admin actions to Firestore
  - [ ] Test and verify logs

- [ ] **Task 2.3:** Add input validation to admin endpoint
  - [ ] Create `adminActionSchema`
  - [ ] Validate action type
  - [ ] Validate tier (if provided)
  - [ ] Validate reason (if provided)
  - [ ] Test with invalid inputs

### Subscription Security

- [ ] **Task 3.1:** Secure subscription-update endpoint
  - [ ] OPTION A: Move to internal function (recommended)
    - [ ] Create `lib/subscription-manager.ts`
    - [ ] Move logic to `updateSubscriptionInternal()`
    - [ ] Remove public API route
    - [ ] Update webhook handlers to use internal function
  - [ ] OPTION B: Add webhook signature verification
    - [ ] Add INTERNAL_WEBHOOK_SECRET to env
    - [ ] Verify HMAC signature
    - [ ] Test with valid/invalid signatures
- [ ] **Task 3.2:** Test subscription update flow end-to-end
  - [ ] Test Stripe webhook → subscription update
  - [ ] Test PayPal webhook → subscription update
  - [ ] Verify user tier updates correctly
  - [ ] Verify transaction logs created

### Webhook Security

- [ ] **Task 4.1:** Verify Stripe webhook signature verification
  - [ ] Review `/app/api/stripe-webhook/route.ts`
  - [ ] Test with Stripe CLI
  - [ ] Test with invalid signature (should fail)
  - [ ] Test with valid signature (should work)
- [ ] **Task 4.2:** Verify PayPal webhook (if used)
  - [ ] Review webhook signature verification
  - [ ] Test webhook delivery
  - [ ] Test with invalid data

### Deployment Blockers

- [ ] **Task 5.1:** Review all changes
  - [ ] Code review by senior dev
  - [ ] Security review of critical changes
  - [ ] Update documentation

- [ ] **Task 5.2:** Test critical flows
  - [ ] Test user signup → payment → upgrade flow
  - [ ] Test admin banning user
  - [ ] Test API without auth (should all fail)
  - [ ] Test rate limiting

- [ ] **Task 5.3:** Deploy to staging
  - [ ] Deploy critical fixes to staging
  - [ ] Run full test suite
  - [ ] Manual security testing
  - [ ] Load testing

---

## 🟠 HIGH PRIORITY (Week 1)

### Authentication Coverage

- [ ] **Task 6.1:** Add auth to `/app/api/activity/route.ts`
- [ ] **Task 6.2:** Add auth to `/app/api/assistant/route.ts`
- [ ] **Task 6.3:** Add auth to `/app/api/email-sequences-enhanced/route.ts`
- [ ] **Task 6.4:** Add auth to POST `/app/api/referrals/route.ts`
- [ ] **Task 6.5:** Add auth to `/app/api/send-email-sequence/route.ts`
- [ ] **Task 6.6:** Add auth to `/app/api/send-verification-email/route.ts`
- [ ] **Task 6.7:** Remove `/app/api/test-ai/route.ts` (or add auth)
- [ ] **Task 6.8:** Review `/app/api/security/route.ts` (remove or fix)

### Rate Limiting

- [ ] **Task 7.1:** Create rate limiting middleware
  - [ ] Create `lib/middleware/rate-limit-middleware.ts`
  - [ ] Implement `withRateLimit()` function
  - [ ] Add rate limit headers
  - [ ] Test with rapid requests

- [ ] **Task 7.2:** Apply rate limiting to all public endpoints
  - [ ] `/app/api/demo/route.ts` (already has it ✅)
  - [ ] `/app/api/health/route.ts`
  - [ ] `/app/api/referrals/route.ts`
  - [ ] All authentication endpoints
  - [ ] All email endpoints

- [ ] **Task 7.3:** Apply rate limiting to AI endpoints
  - [ ] `/app/api/ai/generate-content/route.ts` (already has it ✅)
  - [ ] `/app/api/ai/generate-image/route.ts`
  - [ ] `/app/api/ai/generate-video/route.ts`
  - [ ] `/app/api/ai/dm-reply/route.ts`
  - [ ] `/app/api/ai/money-play/route.ts`

### Guardian Bot Expansion

- [ ] **Task 8.1:** Add Guardian to payment operations
  - [ ] Fraud check on all checkout sessions
  - [ ] Monitor payment patterns
  - [ ] Alert on suspicious behavior

- [ ] **Task 8.2:** Add Guardian to admin operations
  - [ ] Monitor admin actions
  - [ ] Alert on suspicious admin behavior
  - [ ] Log all admin operations

- [ ] **Task 8.3:** Add Guardian to email operations
  - [ ] Spam detection
  - [ ] Rate limiting email sends
  - [ ] Monitor bulk email patterns

- [ ] **Task 8.4:** Add Guardian to referral system
  - [ ] Referral fraud detection
  - [ ] Monitor abuse patterns
  - [ ] Alert on suspicious referrals

### Input Validation

- [ ] **Task 9.1:** Create comprehensive Zod schemas
  - [ ] Create `lib/validators/api-schemas.ts`
  - [ ] Add schema for each endpoint type
  - [ ] Document schema usage

- [ ] **Task 9.2:** Apply validation to all endpoints
  - [ ] Activity endpoints
  - [ ] Referral endpoints
  - [ ] Email endpoints
  - [ ] AI endpoints (where missing)
  - [ ] Admin endpoints (already done ✅)

- [ ] **Task 9.3:** Test validation
  - [ ] Test with valid inputs (should work)
  - [ ] Test with invalid inputs (should fail)
  - [ ] Test with missing fields (should fail)
  - [ ] Test with XSS attempts (should be sanitized/rejected)

### CORS Configuration

- [ ] **Task 10.1:** Create middleware for CORS
  - [ ] Create or update `middleware.ts`
  - [ ] Define allowed origins
  - [ ] Set CORS headers
  - [ ] Handle preflight requests

- [ ] **Task 10.2:** Test CORS
  - [ ] Test from allowed origin (should work)
  - [ ] Test from unknown origin (should fail)
  - [ ] Test preflight requests
  - [ ] Test with credentials

### Security Headers

- [ ] **Task 11.1:** Add security headers to Next.js config
  - [ ] Content-Security-Policy
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Referrer-Policy
  - [ ] Permissions-Policy
  - [ ] Strict-Transport-Security

- [ ] **Task 11.2:** Test headers
  - [ ] Verify headers present in responses
  - [ ] Test CSP doesn't break functionality
  - [ ] Test in multiple browsers

---

## 🟡 MEDIUM PRIORITY (Weeks 2-3)

### Environment Variables

- [ ] **Task 12.1:** Create environment validator
  - [ ] Create `lib/env-validator.ts`
  - [ ] Define Zod schema for all env vars
  - [ ] Add startup validation
  - [ ] Test with missing vars (should exit)

- [ ] **Task 12.2:** Document all environment variables
  - [ ] Update `.env.example`
  - [ ] Add descriptions for each var
  - [ ] Mark required vs optional
  - [ ] Document where to get values

### Firebase Admin Improvements

- [ ] **Task 13.1:** Improve error handling
  - [ ] Make `getAdminDb()` throw on error
  - [ ] Make `getAdminAuth()` throw on error
  - [ ] Add try-catch in all routes using Firebase
  - [ ] Return 503 Service Unavailable on Firebase errors

- [ ] **Task 13.2:** Add better logging
  - [ ] Log Firebase initialization
  - [ ] Log Firebase errors to Sentry
  - [ ] Add structured logging

### Request Tracking

- [ ] **Task 14.1:** Add request ID middleware
  - [ ] Generate UUID for each request
  - [ ] Add X-Request-ID header
  - [ ] Log request ID with all logs
  - [ ] Test tracing through multiple services

### Error Message Review

- [ ] **Task 15.1:** Review all error messages
  - [ ] Identify verbose error messages
  - [ ] Replace with generic messages
  - [ ] Ensure no stack traces in production
  - [ ] Log detailed errors server-side only

- [ ] **Task 15.2:** Expand Sentry usage
  - [ ] Add Sentry to all catch blocks
  - [ ] Add context to errors
  - [ ] Set up error alerts
  - [ ] Test error reporting

### Webhook Enhancements

- [ ] **Task 16.1:** Add IP validation for webhooks
  - [ ] Get Stripe webhook IP ranges
  - [ ] Add IP allowlist
  - [ ] Log unexpected IPs
  - [ ] Alert on suspicious webhook sources

### Email Validation

- [ ] **Task 17.1:** Enhance email validation
  - [ ] Check for disposable email domains
  - [ ] Validate email format strictly
  - [ ] Check for common typos
  - [ ] Add email verification before critical actions

---

## 🟢 LOW PRIORITY (Weeks 4-6)

### Documentation

- [ ] **Task 18.1:** Create security.txt
  - [ ] Add to `public/.well-known/security.txt`
  - [ ] Include contact information
  - [ ] Set expiration date
  - [ ] Add encryption key (if available)

- [ ] **Task 18.2:** Update security documentation
  - [ ] Update `SECURITY.md`
  - [ ] Document incident response plan
  - [ ] Document security monitoring
  - [ ] Add security best practices

### Dependency Management

- [ ] **Task 19.1:** Set up automated dependency audits
  - [ ] Create GitHub Actions workflow
  - [ ] Run npm audit weekly
  - [ ] Auto-create issues for vulnerabilities
  - [ ] Set up Dependabot

- [ ] **Task 19.2:** Run initial audit
  - [ ] Run `npm audit`
  - [ ] Fix critical/high vulnerabilities
  - [ ] Document any exceptions
  - [ ] Update dependencies

### Performance Optimization

- [ ] **Task 20.1:** Add Redis for rate limiting
  - [ ] Set up Redis instance
  - [ ] Update rate limiter to use Redis
  - [ ] Test distributed rate limiting
  - [ ] Monitor performance

- [ ] **Task 20.2:** Optimize Guardian bot
  - [ ] Add caching for user behavior
  - [ ] Batch analysis requests
  - [ ] Monitor performance impact

### Secret Management

- [ ] **Task 21.1:** Evaluate secret management services
  - [ ] Research options (AWS Secrets Manager, etc.)
  - [ ] Estimate costs
  - [ ] Plan migration if beneficial

---

## Testing Checklist

### Unit Tests

- [ ] Authentication helpers
- [ ] Input validation schemas
- [ ] Rate limiting logic
- [ ] Guardian bot analysis

### Integration Tests

- [ ] Complete payment flow
- [ ] Complete signup flow
- [ ] Admin operations
- [ ] Webhook processing

### Security Tests

- [ ] Unauthorized access attempts
- [ ] Invalid input injection
- [ ] Rate limit violations
- [ ] CORS policy violations
- [ ] XSS attempts
- [ ] SQL/NoSQL injection attempts

### Performance Tests

- [ ] Load testing API endpoints
- [ ] Rate limiter under load
- [ ] Guardian bot performance
- [ ] Database query performance

---

## Deployment Checklist

### Pre-Deployment

- [ ] All critical fixes completed
- [ ] All high priority fixes completed
- [ ] Code reviewed
- [ ] Security reviewed
- [ ] Tested in staging
- [ ] Database backed up
- [ ] Rollback plan ready
- [ ] Team notified

### Deployment

- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Monitor Guardian alerts
- [ ] Verify webhooks working
- [ ] Test critical flows
- [ ] Monitor for 4 hours

### Post-Deployment

- [ ] Verify all endpoints responding
- [ ] Check authentication working
- [ ] Verify payments processing
- [ ] Review logs for errors
- [ ] Check Guardian reports
- [ ] Update documentation
- [ ] Notify stakeholders

---

## Monitoring Setup

### Alerts to Configure

- [ ] Failed authentication attempts > 10/min
- [ ] Guardian critical threats
- [ ] Payment processing failures
- [ ] Webhook delivery failures
- [ ] API error rate > 5%
- [ ] Rate limit violations > 100/hour
- [ ] Admin actions (all)
- [ ] Database connection failures

### Dashboards to Create

- [ ] Security metrics dashboard
  - Failed auth attempts
  - Guardian threat levels
  - Rate limit violations
  - Blocked IPs
- [ ] API health dashboard
  - Request volume
  - Error rates
  - Response times
  - Endpoint usage
- [ ] Payment dashboard
  - Successful payments
  - Failed payments
  - Fraud attempts
  - Revenue metrics

---

## Success Criteria

### Must Have Before "Complete"

- [ ] ✅ 100% authentication on protected routes
- [ ] ✅ 100% input validation with Zod
- [ ] ✅ 100% rate limiting on public routes
- [ ] ✅ Guardian bot on all sensitive operations
- [ ] ✅ Zero critical vulnerabilities
- [ ] ✅ Zero high vulnerabilities
- [ ] ✅ All security headers implemented
- [ ] ✅ CORS properly configured
- [ ] ✅ Monitoring and alerts configured
- [ ] ✅ Documentation updated

### Nice to Have

- [ ] ⭐ Redis for distributed rate limiting
- [ ] ⭐ Secret management service
- [ ] ⭐ Automated security testing
- [ ] ⭐ Security.txt file
- [ ] ⭐ Performance optimizations

---

## Progress Tracking

### Overall Progress

- Critical Issues Fixed: 0/8 (0%)
- High Priority Issues Fixed: 0/12 (0%)
- Medium Priority Issues Fixed: 0/7 (0%)
- Low Priority Issues Fixed: 0/5 (0%)

**Total Progress: 0/32 (0%)**

### Weekly Goals

**Week 1:** Fix all 8 critical issues ✅  
**Week 2:** Fix 6/12 high priority issues ✅  
**Week 3:** Fix remaining 6 high priority issues ✅  
**Week 4:** Fix all 7 medium priority issues ✅  
**Week 5-6:** Complete low priority items and testing ✅

---

## Notes

- Update this checklist daily during fix period
- Mark items complete with ✅
- Add notes for any blockers or issues
- Review progress weekly
- Adjust timeline as needed

---

**Last Updated:** December 5, 2025  
**Next Review:** Daily during fix period  
**Completion Target:** 6 weeks from start date
