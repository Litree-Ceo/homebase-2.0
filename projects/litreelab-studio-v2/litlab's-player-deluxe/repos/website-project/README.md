# Social Site — Website Project

## Structure
- frontend/: Legacy static site
- frontend-new/: Modern React app (recommended)
- backend/: API server (add requirements or package.json)
- infra/: Infrastructure as code (Bicep)

## Quick Start (Frontend-New)
```bash
cd frontend-new
npm install
npm start
```

## Backend
- Add requirements.txt (Python) or package.json (Node.js) for API server.
- Copy .env.example to .env and fill in secrets.

## Deployment
- See .github/workflows/build-and-deploy.yml for CI/CD.
- Infrastructure: infra/ai-platform-baseline.bicep
