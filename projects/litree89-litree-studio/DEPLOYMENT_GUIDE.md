# GitLab CI/CD Deployment Guide

## 🚀 Deployment Process

1. **Configure GitLab Variables**
   - Go to GitLab repo → Settings → CI/CD → Variables
   - Add necessary deployment variables:
     - `SSH_PRIVATE_KEY`: Your server SSH key  
     - `PRODUCTION_HOST`: Production server address

2. **Run Deployment**
```bash
git push origin main  # Triggers GitLab CI/CD pipeline
```

3. **Monitor Pipeline**
   - Go to GitLab → CI/CD → Pipelines
   - View job logs and status

## 🔐 Required Variables

| Variable             | Description                        |
|----------------------|------------------------------------|
| SSH_PRIVATE_KEY       | Private key for server deployment  |  
| PRODUCTION_HOST       | Production server hostname         |

## 🔍 Troubleshooting

- Check pipeline logs for errors
- Verify SSH key permissions (chmod 600)
- Ensure GitLab runner has proper access

## 🛡️ Security Best Practices

- Always restrict variable visibility
- Use project-level runners for isolation
- Regularly rotate deployment keys
