# Overlord Project - Dependency Matrix

**Version:** 1.0  
**Date:** March 4, 2026  
**Status:** Active

---

## Visual Dependency Map

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            OVERLORD PROJECT DEPENDENCY MAP                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT LAYER                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │   Browser    │  │    PWA       │  │  Mobile App  │  │    CLI Tools            │  │
│  │  (index.html)│  │ (manifest)   │  │   (Future)   │  │   (scripts)             │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └───────────┬─────────────┘  │
└─────────┼─────────────────┼─────────────────┼──────────────────────┼───────────────┘
          │                 │                 │                      │
          └─────────────────┴─────────────────┴──────────────────────┘
                                    │
                                    ▼ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    API GATEWAY                                      │
│                           ┌───────────────────────┐                                 │
│                           │  Nginx Reverse Proxy  │                                 │
│                           │  (TLS, Rate Limiting) │                                 │
│                           └───────────┬───────────┘                                 │
└───────────────────────────────────────┼─────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│     DASHBOARD         │ │       SOCIAL          │ │        GRID           │
│    (Port 8080)        │ │     (Port 5001)       │ │     (Port 5002)       │
│ ┌───────────────────┐ │ │ ┌───────────────────┐ │ │ ┌───────────────────┐ │
│ │   server.py       │ │ │ │  Node.js + Next   │ │ │ │    server.py      │ │
│ │  • Python 3.12    │ │ │ │  • React 19       │ │ │ │  • Python 3.12    │ │
│ │  • psutil         │ │ │ │  • Firebase       │ │ │ │  • Analytics      │ │
│ │  • PyYAML         │ │ │ │  • Express        │ │ │ └───────────────────┘ │
│ │  • requests       │ │ │ └───────────────────┘ │ └───────────────────────┘
│ └───────────────────┘ │ └───────────────────────┘
└───────────┬───────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                DATA & SERVICES LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │  Firebase    │  │  File System │  │  External    │  │    Optional DB          │  │
│  │  (Cloud)     │  │  (Logs, PID) │  │  APIs        │  │    (Future)             │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Dependency Table

### Internal Module Dependencies

| Source Module | Depends On | Dependency Type | Criticality | Fallback Behavior |
|--------------|------------|-----------------|-------------|-------------------|
| Dashboard UI | server.py | Hard | Critical | No data display |
| server.py | psutil | Hard | High | Returns placeholder stats |
| server.py | PyYAML | Soft | Medium | Uses default config |
| server.py | firebase-admin | Soft | Low | Graceful disable |
| server.py | requests | Soft | Low | Real-Debrid disabled |
| Social Module | Node.js | Hard | Critical | Module won't start |
| Social Module | Firebase SDK | Hard | High | Limited functionality |
| Grid Module | Python stdlib | Hard | Medium | Module won't start |

### External Service Dependencies

| Service | Version Required | Purpose | SLA | Cost |
|---------|------------------|---------|-----|------|
| Python | >=3.9 | Runtime | N/A | Free |
| Node.js | >=18 | Social runtime | N/A | Free |
| psutil | >=5.9.0 | System metrics | Community | Free |
| PyYAML | >=6.0 | Config parsing | Community | Free |
| Nginx | >=1.24 | Reverse proxy | 99.9% | Free |
| Docker | >=20.0 | Containerization | N/A | Free |
| Firebase | Latest | Cloud sync | 99.95% | Free tier |

### Build/Development Dependencies

| Tool | Purpose | Required For | Version |
|------|---------|--------------|---------|
| black | Python formatting | Development | >=23.0 |
| ruff | Python linting | Development | >=0.4 |
| mypy | Type checking | Development | >=1.7 |
| pytest | Testing | Development | >=7.4 |
| pylint | Code analysis | Development | >=2.17 |
| ESLint | JS linting | Social dev | >=8.x |
| Prettier | JS formatting | Social dev | >=3.x |

---

## Dependency Risk Assessment

### High Risk Dependencies

| Dependency | Risk | Mitigation | Owner |
|------------|------|------------|-------|
| psutil | Single maintainer | Monitor forks, consider alternatives | Core Team |
| Firebase | Vendor lock-in | Abstract interface, local fallback | Architect |
| Node.js Social | Large dependency tree | Regular audits, lockfile | Frontend Lead |

### Medium Risk Dependencies

| Dependency | Risk | Mitigation | Owner |
|------------|------|------------|-------|
| PyYAML | CVE history | Pin to latest stable | DevOps |
| requests | Maintenance mode | Migrate to httpx if needed | Backend Lead |

### Low Risk Dependencies

| Dependency | Risk | Mitigation | Owner |
|------------|------|------------|-------|
| Python stdlib | Core project | Keep updated | Core Team |
| black/ruff/mypy | Dev tools | Regular updates | Core Team |

---

## License Compliance Matrix

| Package | License | Copyleft | Commercial Use | Attribution Required |
|---------|---------|----------|----------------|---------------------|
| Python | PSF-2.0 | No | Yes | No |
| psutil | BSD-3 | No | Yes | Yes |
| PyYAML | MIT | No | Yes | Yes |
| requests | Apache-2.0 | No | Yes | Yes |
| firebase-admin | Apache-2.0 | No | Yes | Yes |
| pytest | MIT | No | Yes | Yes |
| black | MIT | No | Yes | Yes |
| React | MIT | No | Yes | Yes |
| Next.js | MIT | No | Yes | Yes |

**Overall Project License:** MIT (Permissive)

---

## Update Schedule

| Dependency Type | Check Frequency | Update Policy |
|-----------------|-----------------|---------------|
| Security patches | Daily | Immediate (P0) |
| Minor versions | Weekly | After testing |
| Major versions | Monthly | Planned migration |
| Dev dependencies | Monthly | As needed |

---

## Dependency Monitoring

### Automated Tools
- **Dependabot:** GitHub-native dependency updates
- **Snyk:** Security vulnerability scanning
- **pip-audit:** Python CVE scanning
- **npm audit:** Node.js vulnerability scanning

### Manual Reviews
- Quarterly dependency audit
- License compliance review (annual)
- Architecture review (bi-annual)

---

*Last Updated: March 4, 2026*
