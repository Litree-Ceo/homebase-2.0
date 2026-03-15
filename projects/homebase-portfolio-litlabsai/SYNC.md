# HomeBase Pro - Synchronization Guide

## Overview

This document outlines the comprehensive synchronization strategy for the HomeBase Pro application, ensuring data consistency, code alignment, and deployment coordination across all environments.

## Table of Contents

1. [Data Synchronization](#data-synchronization)
2. [Code Synchronization](#code-synchronization)
3. [Configuration Management](#configuration-management)
4. [Deployment Strategy](#deployment-strategy)
5. [Monitoring & Alerting](#monitoring--alerting)

---

## Data Synchronization

### Architecture

HomeBase Pro uses Firebase Firestore as its primary data store with real-time synchronization capabilities.

```text
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │◄───►│   Firestore  │◄───►│   Client    │
│  (Device A) │     │   (Primary)  │     │  (Device B) │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Local Cache │
                    │  (IndexedDB) │
                    └──────────────┘
```

### Implementation

The `useSync` hook provides automatic data synchronization:

```javascript
import { useSync } from './hooks/useSync';

const { data, syncStatus, getSyncHealth } = useSync('projects');

// Check sync health
const health = getSyncHealth();
console.log(health.isHealthy); // true/false
console.log(health.pendingChanges); // Number of offline changes
```

### Conflict Resolution

1. **Last-Write-Wins**: Default strategy for most data types
2. **Merge Strategy**: For collaborative documents (future enhancement)
3. **Manual Resolution**: For critical conflicts requiring user input

### Offline Support

- Pending changes are queued when offline
- Automatic sync when connection restored
- Visual indicators for sync status

---

## Code Synchronization

### Git Workflow

```text
feature/xxx ──► develop ──► staging ──► main (production)
     │              │            │           │
     │              │            │           │
   PR #1         PR #2        PR #3       Deploy
```

### Branch Strategy

- **main**: Production-ready code
- **staging**: Pre-production testing
- **develop**: Integration branch
- **feature/***: Individual features
- **hotfix/***: Critical production fixes

### CI/CD Pipeline

| Stage              | Trigger           | Actions                      |
| ------------------ | ----------------- | ---------------------------- |
| Lint               | PR / Push         | ESLint checks                |
| Build              | PR / Push         | Vite production build        |
| Test               | PR / Push         | Unit tests (future)          |
| Deploy Staging     | merge to develop  | Auto-deploy to staging       |
| Deploy Production  | merge to main     | Auto-deploy to production    |

### Code Quality Gates

1. All PRs require review
2. ESLint must pass
3. Build must succeed
4. No security vulnerabilities (moderate+)

---

## Configuration Management

### Environment Files

| File                | Purpose                     | Deployed |
| ------------------- | --------------------------- | -------- |
| `.env.example`      | Template for developers     | No       |
| `.env`              | Local development           | No       |
| `.env.staging`      | Staging environment         | Yes      |
| `.env.production`   | Production environment      | Yes      |

### Configuration Module

Centralized configuration in `src/config/environment.js`:

```javascript
import { env } from './config/environment';

// Check environment
if (env.isProduction) { ... }

// Check features
if (env.features.enableAI) { ... }

// Access Firebase config
const config = env.firebase;
```

### Secrets Management

- **Development**: Local `.env` file (never committed)
- **CI/CD**: GitHub Secrets
- **Production**: Firebase Environment Variables

---

## Deployment Strategy

### Automated Deployment

Deployments are triggered automatically via GitHub Actions:

1. **Push to main** → Production deployment
2. **Push to develop** → Staging deployment
3. **Manual trigger** → Custom deployment

### Deployment Process

```bash
# Using the deployment script
./scripts/deploy.sh production

# With functions
./scripts/deploy.sh production --functions

# Rollback
./scripts/deploy.sh --rollback
```

### Rollback Procedure

1. **Automatic**: Failed deployments trigger automatic rollback
2. **Manual**: Use `./scripts/deploy.sh --rollback`
3. **GitHub**: Revert commit and redeploy

### Environment URLs

| Environment | URL                                             |
| ----------- | ----------------------------------------------- |
| Production  | [site][prod]                                    |
| Staging     | [site][staging]                                 |

[prod]: https://studio-6082148059-d1fec.web.app
[staging]: https://staging-studio-6082148059-d1fec.web.app

---

## Monitoring & Alerting

### Health Checks

Automated health checks run every hour via GitHub Actions:

- Site availability
- API endpoint status
- Bundle size monitoring
- Error tracking

### Sync Status Dashboard

Real-time sync status available via:

```javascript
const sync = env.sync;
console.log(sync.getStatus());
// {
//   lastSync: "2024-01-15T10:30:00Z",
//   isOnline: true,
//   errorCount: 0,
//   recentErrors: []
// }
```

### Alerts

| Condition           | Action                      |
| ------------------- | --------------------------- |
| Sync error          | Log to console, retry       |
| 3+ sync failures    | Show user notification      |
| Offline > 5 min     | Show offline indicator      |
| Build failure       | GitHub notification         |
| Deployment failure  | Slack/Email alert           |

---

## Runbooks

### Sync Failure Recovery

1. Check network connectivity
2. Verify [Firebase status][firebase-status]
3. Check browser console for errors
4. Force refresh: `location.reload()`
5. Clear local storage if corrupted

[firebase-status]: https://status.firebase.google.com

### Deployment Failure Recovery

1. Check GitHub Actions logs
2. Verify secrets are configured
3. Run `./scripts/sync-check.sh`
4. Attempt rollback if needed
5. Contact team if unresolved

---

## Quick Reference

### Commands

```bash
# Check sync status
npm run sync:check

# Deploy to production
npm run deploy:prod

# Deploy to staging
npm run deploy:staging

# Run all checks
npm run check:all
```

### Scripts

| Script          | Purpose                        |
| --------------- | ------------------------------ |
| `deploy.sh`     | Deployment with rollback       |
| `sync-check.sh` | Synchronization verification   |

---

## Success Criteria

- ✅ All data stores reflect current state
- ✅ Main branch always deployable
- ✅ Configuration properly versioned
- ✅ Deployments coordinated and safe
- ✅ Monitoring provides real-time visibility

---

*Last Updated: 2024-02-26*
*Version: 2.0.0*
