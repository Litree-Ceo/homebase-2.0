"""
API Routes for App Builder
FastAPI endpoints for natural language application generation
"""

import json
import zipfile
import io
from datetime import datetime
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app_builder.nlp.engine import create_nlp_engine, Intent
from app_builder.code_gen.generator import create_code_generator


router = APIRouter(prefix="/app-builder", tags=["app-builder"])

# Initialize engines
nlp_engine = create_nlp_engine()
code_generator = create_code_generator()

# In-memory storage (use database in production)
projects_storage = {}


# ============ Request/Response Models ============


class GenerateRequest(BaseModel):
    prompt: str = Field(
        ..., description="Natural language description of the app to build"
    )
    project_id: Optional[str] = Field(None, description="Existing project ID to update")


class GenerateResponse(BaseModel):
    project_id: str
    status: str
    message: str
    preview: Optional[dict] = None


class RefineRequest(BaseModel):
    project_id: str
    prompt: str = Field(..., description="Natural language refinement instructions")


class ProjectInfo(BaseModel):
    id: str
    name: str
    status: str
    created_at: str
    updated_at: str


class ProjectDetail(BaseModel):
    id: str
    name: str
    status: str
    code: dict
    created_at: str
    updated_at: str


# ============ API Endpoints ============


@router.post("/generate", response_model=GenerateResponse)
async def generate_app(request: GenerateRequest):
    """Generate an application from natural language description."""
    try:
        # Parse the natural language input
        parsed = await nlp_engine.parse(request.prompt)

        # Generate the code
        generated_code = await code_generator.generate(parsed)

        # Create or update project
        if request.project_id and request.project_id in projects_storage:
            project = projects_storage[request.project_id]
            project["code"] = generated_code
            project["updated_at"] = datetime.utcnow().isoformat()
            project["status"] = "completed"
        else:
            project_id = str(uuid4())
            project = {
                "id": project_id,
                "name": (
                    parsed.raw_input[:50] + "..."
                    if len(parsed.raw_input) > 50
                    else parsed.raw_input
                ),
                "status": "completed",
                "code": generated_code,
                "prompt": request.prompt,
                "parsed_intent": parsed.intent.value,
                "entities": parsed.entities.to_dict(),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
            projects_storage[project_id] = project

        # Create preview
        preview = {
            "intent": parsed.intent.value,
            "entities": parsed.entities.to_dict(),
            "files_generated": {
                "frontend": len(generated_code.get("frontend", {})),
                "backend": len(generated_code.get("backend", {})),
                "database": len(generated_code.get("database", {})),
            },
        }

        return GenerateResponse(
            project_id=project["id"],
            status="completed",
            message=f"Successfully generated application: {project['name']}",
            preview=preview,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.post("/refine", response_model=GenerateResponse)
async def refine_app(request: RefineRequest):
    """Refine an existing application with additional instructions."""
    if request.project_id not in projects_storage:
        raise HTTPException(status_code=404, detail="Project not found")

    project = projects_storage[request.project_id]

    try:
        # Parse the refinement instruction
        parsed = await nlp_engine.parse(request.prompt)

        # Combine prompts and regenerate
        combined_prompt = f"{project['prompt']}. Additionally: {request.prompt}"
        new_parsed = await nlp_engine.parse(combined_prompt)

        # Generate updated code
        generated_code = await code_generator.generate(new_parsed)

        # Update project
        project["code"] = generated_code
        project["updated_at"] = datetime.utcnow().isoformat()
        project["status"] = "completed"

        return GenerateResponse(
            project_id=project["id"],
            status="completed",
            message="Successfully refined application",
            preview={
                "intent": parsed.intent.value,
                "entities": parsed.entities.to_dict(),
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refinement failed: {str(e)}")


@router.get("/projects", response_model=list[ProjectInfo])
async def list_projects():
    """List all generated projects"""
    return [
        ProjectInfo(
            id=p["id"],
            name=p["name"],
            status=p["status"],
            created_at=p["created_at"],
            updated_at=p["updated_at"],
        )
        for p in projects_storage.values()
    ]


@router.get("/projects/{project_id}", response_model=ProjectDetail)
async def get_project(project_id: str):
    """Get detailed project information"""
    if project_id not in projects_storage:
        raise HTTPException(status_code=404, detail="Project not found")

    project = projects_storage[project_id]
    return ProjectDetail(
        id=project["id"],
        name=project["name"],
        status=project["status"],
        code=project["code"],
        created_at=project["created_at"],
        updated_at=project["updated_at"],
    )


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project"""
    if project_id not in projects_storage:
        raise HTTPException(status_code=404, detail="Project not found")

    del projects_storage[project_id]
    return {"message": "Project deleted successfully"}


@router.get("/download/{project_id}")
async def download_project(project_id: str):
    """Download generated code as ZIP"""
    if project_id not in projects_storage:
        raise HTTPException(status_code=404, detail="Project not found")

    project = projects_storage[project_id]

    # Create ZIP in memory
    buffer = io.BytesIO()

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add frontend code
        frontend = project.get("code", {}).get("frontend", {})
        for filename, content in frontend.items():
            zf.writestr(f"frontend/{filename}", content)

        # Add backend code
        backend = project.get("code", {}).get("backend", {})
        for filename, content in backend.items():
            zf.writestr(f"backend/{filename}", content)

        # Add database code
        database = project.get("code", {}).get("database", {})
        for filename, content in database.items():
            zf.writestr(f"database/{filename}", content)

        # Add README
        readme = f"""# {project['name']}
Generated by Overlord App Builder

## Original Prompt
{project.get('prompt', 'N/A')}

## Getting Started
### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```
"""
        zf.writestr("README.md", readme)

    buffer.seek(0)

    return {
        "filename": f"{project['name'].replace(' ', '-').lower()}-code.zip",
        "content": buffer.getvalue().hex(),
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "app-builder"}
