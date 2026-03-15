# Litrelab - Primary Project

**Status:** Most recently updated (2026-03-14)  
**Source:** archive/homebase-3.0/modules/

## Components

### litrelab-backend
- FastAPI backend server
- Modified: 2026-03-14 13:02
- Port: 8000
- Files: main.py, Dockerfile, pyproject.toml

### litrelab-studio  
- Astro frontend
- Modified: 2026-03-14 13:02
- Port: 4321
- Files: package.json, astro.config.mjs, src/

## Quick Start

```bash
# Start backend
cd litrelab-backend
python main.py
# or: uvicorn main:app --host 0.0.0.0 --port 8000

# Start frontend (in another terminal)
cd litrelab-studio
npm run dev
# or: astro dev --host 0.0.0.0
```

## Access
- Frontend: http://localhost:4321
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Older Projects

- `src/` - Organized overlord-dashboard (moved March 7)
- `overlord-dashboard/` - Original version
- `overlord-modern/` - FastAPI experiment
- `archive/` - Old versions
