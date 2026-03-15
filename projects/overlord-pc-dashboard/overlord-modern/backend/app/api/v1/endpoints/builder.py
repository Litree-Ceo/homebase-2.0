from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import ai_service

router = APIRouter()


class BuilderRequest(BaseModel):
    prompt: str


@router.post("/generate")
async def build_app(request: BuilderRequest):
    """
    Receives a natural language prompt to build an application.
    Generates a React frontend and Node.js backend structure.
    """
    try:
        # Generate using the AI service
        result = ai_service.generate_code(
            prompt=f"Create a full-stack application: {request.prompt}\n\nGenerate a React frontend and Node.js backend.",
            language="react"
        )
        
        if "error" in result:
            return {
                "status": "error",
                "message": result["error"],
            }
        
        # Generate a project structure preview
        import uuid
        
        return {
            "status": "success",
            "project_id": str(uuid.uuid4()),
            "preview": {
                "intent": f"Application: {request.prompt[:50]}...",
                "entities": {
                    "frameworks": ["React", "Node.js", "Express"],
                    "features": ["Frontend", "Backend", "API"],
                    "data_models": ["User", "Data"],
                },
                "files_generated": {
                    "frontend": 5,
                    "backend": 3,
                    "database": 1,
                },
                "code_preview": result["code"][:500] + "..." if len(result["code"]) > 500 else result["code"],
            },
            "provider": result.get("provider", "unknown"),
            "model": result.get("model", "unknown"),
        }
        
    except Exception as e:
        # Log the specific error for debugging
        print(f"An error occurred in the AI service: {e}")
        return {
            "status": "error",
            "message": f"An internal error occurred: {str(e)}",
        }


@router.get("/health")
async def builder_health():
    """Check if the app builder AI is configured."""
    status = ai_service.get_status()
    return {
        "available": status["configured"],
        "provider": status["provider"],
        "message": "App builder is ready" if status["configured"] else "AI not configured. Set GROQ_API_KEY or GEMINI_API_KEY in .env"
    }
