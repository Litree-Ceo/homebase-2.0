# Operations & Maintenance

Operational documentation for running and maintaining HomeBase 2.0 in production.

## Key Topics

### Monitoring & Observability

- Azure Monitor setup
- Logging configuration
- Performance metrics
- Alert configuration

### Troubleshooting

- Common issues and solutions
- Error resolution
- Debugging procedures
- Performance optimization

### Security

- **SECURITY_ADVISORY.md** - Current security status and advisories
- API key management
- Database encryption
- Token handling

### Maintenance

- Dependency updates
- Database maintenance
- Log management
- Cleanup procedures

## Common Tasks

### Check System Health

```bash
# Azure
az containerapp show --name homebase-web --resource-group homebase-rg

# Google Cloud
gcloud run services describe homebase-web
```

### View Logs

```bash
# Azure
az containerapp logs show --name homebase-web --resource-group homebase-rg

# Google Cloud
gcloud run services describe homebase-web
```

### Update Dependencies

```bash
pnpm update
pnpm audit
```

## Emergency Procedures

- Rollback deployment
- Database recovery
- API failover
- Security incident response

---

**Need help?** Check [SECURITY_ADVISORY.md](./SECURITY_ADVISORY.md) and troubleshooting guides
