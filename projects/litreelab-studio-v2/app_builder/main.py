import os
import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn

# Add current directory to path to allow absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app_builder.api.routes import router as app_builder_router
from app_builder.api.social import router as social_router

app = FastAPI(title="LiTreeLab Studio - App Builder API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(app_builder_router, prefix="/api")
app.include_router(social_router, prefix="/api")

# Determine the base directory and web dist path
BASE_DIR = Path(__file__).parent
WEB_DIST = BASE_DIR / "web" / "dist"

# Mount static files from React build if dist exists
if WEB_DIST.exists():
    # Mount assets folder
    assets_dir = WEB_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
    
    # Mount any other static folders that might exist
    for static_folder in ["images", "fonts", "icons"]:
        folder_path = WEB_DIST / static_folder
        if folder_path.exists():
            app.mount(f"/{static_folder}", StaticFiles(directory=str(folder_path)), name=static_folder)


# SPA fallback: serve index.html for all non-API routes
@app.get("/{path:path}", include_in_schema=False)
async def serve_react_app(path: str):
    # Skip API paths
    if path.startswith("api/"):
        raise StarletteHTTPException(status_code=404)
    
    # Check if file exists (for direct file access like favicon.ico, manifest.json, etc.)
    file_path = WEB_DIST / path
    if file_path.exists() and file_path.is_file():
        return FileResponse(str(file_path))
    
    # Serve index.html for everything else → React router takes over
    index_path = WEB_DIST / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    
    # If no dist folder yet, return helpful message
    raise StarletteHTTPException(
        status_code=503,
        detail="Frontend not built. Run 'cd web && npm run build' first."
    )


# Root endpoint - serve the React app
@app.get("/", include_in_schema=False)
async def root():
    index_path = WEB_DIST / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "LiTreeLab Studio API", "status": "Frontend not built"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
