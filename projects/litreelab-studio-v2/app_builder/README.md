# App Builder

Natural language application generator for the Overlord Dashboard.

## Features

- **Natural Language Processing**: Describe your app in plain English
- **Code Generation**: Generates complete React frontend + Node.js backend
- **Project Management**: Save, view, and download generated projects
- **Real-time Preview**: See generated file structure instantly

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/app-builder/generate` | POST | Generate app from natural language |
| `/api/app-builder/refine` | POST | Refine existing project |
| `/api/app-builder/projects` | GET | List all projects |
| `/api/app-builder/projects/{id}` | GET | Get project details |
| `/api/app-builder/projects/{id}` | DELETE | Delete project |
| `/api/app-builder/download/{id}` | GET | Download ZIP of generated code |
| `/api/app-builder/health` | GET | Health check |

## Project Structure

```
app_builder/
├── api/
│   ├── __init__.py
│   └── routes.py          # FastAPI endpoints
├── code_gen/
│   ├── __init__.py
│   └── generator.py       # Code generation engine
├── nlp/
│   ├── __init__.py
│   └── engine.py          # NLP processing
├── schema/
│   ├── __init__.py
│   └── models.py          # Pydantic models
├── web/                   # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── __init__.py
├── requirements.txt
└── README.md
```

## Usage

### Backend Integration

The app_builder module is automatically integrated into the overlord-modern backend:

```python
# In overlord-modern/backend/app/api/v1/router.py
from app_builder.api.routes import router as app_builder_router

api_router.include_router(app_builder_router, tags=["app-builder"])
```

### Frontend Integration

The NaturalLanguageInput component in overlord-modern connects to the API:

```typescript
const response = await fetch('/api/app-builder/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: userInput })
});
```

### Standalone Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Start backend
cd overlord-modern/backend
python -m app.main

# Start frontend (optional standalone)
cd app_builder/web
npm install
npm run dev
```

## Example Prompts

- "Create a to-do list app with user authentication"
- "Build an e-commerce site with products and shopping cart"
- "Make a blog with posts, comments, and categories"
- "Develop a task management app with boards"

## Generated Code Structure

Each project generates:

```
frontend/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── tailwind.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    └── pages/
        └── [GeneratedPages].tsx

backend/
├── package.json
├── .env.example
└── src/
    ├── index.js
    ├── models/
    ├── controllers/
    └── routes/

database/
├── schema.sql
└── prisma/
    └── schema.prisma
```
