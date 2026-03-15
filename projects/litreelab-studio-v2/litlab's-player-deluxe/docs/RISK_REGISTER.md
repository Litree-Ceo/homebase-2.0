# Overlord Project - Risk Register

**Version:** 1.0  
**Date:** March 4, 2026  
**Classification:** Internal Use  
**Review Cycle:** Bi-weekly

---

## Risk Scoring Matrix

| Likelihood \ Impact | Negligible (1) | Low (2) | Medium (3) | High (4) | Critical (5) |
|---------------------|----------------|---------|------------|----------|--------------|
| **Almost Certain (5)** | 5 | 10 | 15 | 20 | 25 |
| **Likely (4)** | 4 | 8 | 12 | 16 | 20 |
| **Possible (3)** | 3 | 6 | 9 | 12 | 15 |
| **Unlikely (2)** | 2 | 4 | 6 | 8 | 10 |
| **Rare (1)** | 1 | 2 | 3 | 4 | 5 |

**Risk Levels:**
- 🔴 **Critical (15-25):** Immediate action required
- 🟠 **High (10-14):** Action required within sprint
- 🟡 **Medium (5-9):** Action required within quarter
- 🟢 **Low (1-4):** Monitor and accept

---

## Active Risks

### Technical Risks

#### T001: Default API Key Exposure
| Attribute | Value |
|-----------|-------|
| **Risk ID** | T001 |
| **Category** | Security |
| **Description** | Current config.yaml contains weak API key "1421" which could be easily guessed |
| **Likelihood** | High (4) |
| **Impact** | Critical (5) |
| **Risk Score** | 🔴 **20 (Critical)** |
| **Owner** | Lead Developer |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Generate cryptographically secure key immediately
2. Update config.yaml with new key
3. Document key generation process
4. Add pre-commit hook to detect weak keys

**Contingency:**
- If key is exposed in git history, rotate immediately
- Enable auth on all network-facing instances

---

#### T002: Unencrypted HTTP Traffic
| Attribute | Value |
|-----------|-------|
| **Risk ID** | T002 |
| **Category** | Security |
| **Description** | Dashboard serves HTTP only; credentials and data transmitted in plaintext |
| **Likelihood** | High (4) |
| **Impact** | Critical (5) |
| **Risk Score** | 🔴 **20 (Critical)** |
| **Owner** | DevOps Lead |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Deploy Nginx reverse proxy with TLS
2. Obtain SSL certificate (Let's Encrypt)
3. Redirect HTTP to HTTPS
4. Add HSTS headers

**Contingency:**
- Use Cloudflare tunnel for immediate TLS
- Restrict to localhost-only access until TLS ready

---

#### T003: Missing Security Headers
| Attribute | Value |
|-----------|-------|
| **Risk ID** | T003 |
| **Category** | Security |
| **Description** | No X-Frame-Options, CSP, or other security headers; vulnerable to XSS/clickjacking |
| **Likelihood** | Medium (3) |
| **Impact** | High (4) |
| **Risk Score** | 🟠 **12 (High)** |
| **Owner** | Backend Developer |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Add security header middleware to server.py
2. Configure Nginx with security headers
3. Test with securityheaders.com
4. Document required headers

---

#### T004: XSS via Unescaped Output
| Attribute | Value |
|-----------|-------|
| **Risk ID** | T004 |
| **Category** | Security |
| **Description** | User data displayed in UI without proper escaping; potential XSS vector |
| **Likelihood** | Medium (3) |
| **Impact** | High (4) |
| **Risk Score** | 🟠 **12 (High)** |
| **Owner** | Frontend Developer |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Audit all DOM insertion points
2. Implement textContent instead of innerHTML
3. Add Content Security Policy
4. Use DOMPurify for any HTML content

---

#### T005: Dependency Vulnerabilities
| Attribute | Value |
|-----------|-------|
| **Risk ID** | T005 |
| **Category** | Security |
| **Description** | Dependencies may have known CVEs; no automated scanning in place |
| **Likelihood** | Medium (3) |
| **Impact** | Medium (3) |
| **Risk Score** | 🟡 **9 (Medium)** |
| **Owner** | Security Lead |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Enable Dependabot alerts
2. Add pip-audit to CI pipeline
3. Schedule weekly dependency reviews
4. Pin all dependency versions

---

#### T006: No Input Validation
| Attribute | Value |
|-----------|-------|
| **Risk ID** | T006 |
| **Category** | Security |
| **Description** | API endpoints lack comprehensive input validation; injection risk |
| **Likelihood** | Medium (3) |
| **Impact** | High (4) |
| **Risk Score** | 🟠 **12 (High)** |
| **Owner** | Backend Developer |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Implement Pydantic models for all inputs
2. Add length and type validation
3. Sanitize all query parameters
4. Add WAF rules if applicable

---

#### T007: Data Loss on Restart
| Attribute | Value |
|-----------|-------|
| **Risk ID** | T007 |
| **Category** | Reliability |
| **Description** | Historical data stored in memory only; lost on server restart |
| **Likelihood** | High (4) |
| **Impact** | Medium (3) |
| **Risk Score** | 🟠 **12 (High)** |
| **Owner** | Backend Developer |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Add SQLite for local persistence
2. Implement periodic data snapshot
3. Add data export functionality
4. Consider Redis for distributed setup

---

#### T008: No Disaster Recovery Plan
| Attribute | Value |
|-----------|-------|
| **Risk ID** | T008 |
| **Category** | Operations |
| **Description** | No documented backup/restore procedures; extended downtime risk |
| **Likelihood** | Medium (3) |
| **Impact** | Critical (5) |
| **Risk Score** | 🟠 **15 (Critical)** |
| **Owner** | DevOps Lead |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Document backup procedures
2. Automate daily backups
3. Test restore process monthly
4. Create runbooks for common issues

---

### Operational Risks

#### O001: Single Point of Failure
| Attribute | Value |
|-----------|-------|
| **Risk ID** | O001 |
| **Category** | Infrastructure |
| **Description** | Single server instance; no redundancy or failover |
| **Likelihood** | Medium (3) |
| **Impact** | High (4) |
| **Risk Score** | 🟠 **12 (High)** |
| **Owner** | DevOps Lead |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Deploy to cloud with auto-restart
2. Configure health checks
3. Set up monitoring alerts
4. Document manual failover

---

#### O002: No Monitoring/Alerting
| Attribute | Value |
|-----------|-------|
| **Risk ID** | O002 |
| **Category** | Observability |
| **Description** | No automated monitoring; issues discovered reactively |
| **Likelihood** | High (4) |
| **Impact** | High (4) |
| **Risk Score** | 🟠 **16 (Critical)** |
| **Owner** | DevOps Lead |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Set up Application Insights
2. Configure alerts for errors
3. Add uptime monitoring
4. Create dashboards

---

#### O003: Secrets in Version Control
| Attribute | Value |
|-----------|-------|
| **Risk ID** | O003 |
| **Category** | Security |
| **Description** | Risk of accidentally committing .env files or keys |
| **Likelihood** | Medium (3) |
| **Impact** | Critical (5) |
| **Risk Score** | 🟠 **15 (Critical)** |
| **Owner** | Security Lead |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Add git-secrets to repo
2. Configure pre-commit hooks
3. Audit git history
4. Document secrets handling

---

#### O004: No Staging Environment
| Attribute | Value |
|-----------|-------|
| **Risk ID** | O004 |
| **Category** | Operations |
| **Description** | Changes tested in production; risk of introducing bugs |
| **Likelihood** | High (4) |
| **Impact** | Medium (3) |
| **Risk Score** | 🟠 **12 (High)** |
| **Owner** | DevOps Lead |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Create staging environment
2. Implement blue/green deployment
3. Add feature flags
4. Require staging testing

---

### Business/Compliance Risks

#### B001: GDPR Non-Compliance
| Attribute | Value |
|-----------|-------|
| **Risk ID** | B001 |
| **Category** | Compliance |
| **Description** | No privacy policy or data deletion mechanism; EU user risk |
| **Likelihood** | Medium (3) |
| **Impact** | Critical (5) |
| **Risk Score** | 🟠 **15 (Critical)** |
| **Owner** | Product Owner |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Draft privacy policy
2. Implement data export/deletion
3. Add cookie consent if needed
4. Legal review

---

#### B002: Missing Terms of Service
| Attribute | Value |
|-----------|-------|
| **Risk ID** | B002 |
| **Category** | Legal |
| **Description** | No terms of service; liability exposure |
| **Likelihood** | Medium (3) |
| **Impact** | Medium (3) |
| **Risk Score** | 🟡 **9 (Medium)** |
| **Owner** | Product Owner |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Draft terms of service
2. Review with legal
3. Add to website
4. Require acceptance

---

#### B003: Accessibility Non-Compliance
| Attribute | Value |
|-----------|-------|
| **Risk ID** | B003 |
| **Category** | Compliance |
| **Description** | UI may not meet WCAG standards; legal risk in some jurisdictions |
| **Likelihood** | Low (2) |
| **Impact** | Medium (3) |
| **Risk Score** | 🟢 **6 (Medium)** |
| **Owner** | Frontend Lead |
| **Status** | Open |
| **Identified** | March 4, 2026 |

**Mitigation Plan:**
1. Conduct accessibility audit
2. Add ARIA labels
3. Test with screen readers
4. Fix contrast issues

---

## Closed Risks

| Risk ID | Description | Closure Date | Reason |
|---------|-------------|--------------|--------|
| T000 | Example closed risk | N/A | Template |

---

## Risk Trends

### By Category
```
Security:    🔴🔴🔴🔴🔴🔴🟠🟠🟠🟡 (High concentration)
Operations:  🔴🔴🟠🟠🟠🟡 (Moderate)
Technical:   🔴🔴🟠🟠🟠🟡🟡 (Moderate)
Compliance:  🔴🟠🟡 (Emerging)
```

### By Status
```
Open:    16
Closed:  0
Total:   16
```

### Risk Score Distribution
```
Critical (15-25): ████████████████ 5 risks
High (10-14):     ████████████████████████ 8 risks
Medium (5-9):     ████████ 3 risks
Low (1-4):        0 risks
```

---

## Risk Response Strategies

| Strategy | Description | Applied To |
|----------|-------------|------------|
| **Avoid** | Eliminate risk by not doing activity | N/A |
| **Mitigate** | Reduce likelihood or impact | T001, T002, T003, T004, T006, T007, T008 |
| **Transfer** | Shift risk to third party | B001 (insurance) |
| **Accept** | Acknowledge and monitor | T005 (residual risk) |

---

## Risk Review Schedule

| Review Type | Frequency | Participants |
|-------------|-----------|--------------|
| Daily standup | Daily | Dev team |
| Sprint review | Bi-weekly | Full team |
| Risk register review | Monthly | Leadership |
| External audit | Quarterly | Security consultant |

---

## Appendices

### Appendix A: Risk Assessment Methodology

1. **Identify:** Brainstorm potential risks
2. **Assess:** Score likelihood and impact
3. **Prioritize:** Rank by risk score
4. **Plan:** Define mitigation strategies
5. **Monitor:** Track and review regularly

### Appendix B: Risk Owner Responsibilities

| Role | Responsibilities |
|------|------------------|
| Lead Developer | Technical risks, implementation |
| DevOps Lead | Infrastructure, operations risks |
| Security Lead | Security assessment, compliance |
| Product Owner | Business, legal risks |

### Appendix C: Escalation Criteria

Escalate to leadership when:
- New critical risk identified
- Risk score increases by 5+ points
- Risk owner unavailable for 48 hours
- Multiple related risks emerge

---

*This risk register is a living document. Update whenever new risks are identified or existing risks change status.*

**Next Review:** March 18, 2026
