import os
import sys

# Add backend root directory to sys.path so 'app' is found natively everywhere
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.endpoints import router as api_router

app = FastAPI(
    title="CodeTrace AI API",
    description="AI-Powered Code Integrity & Plagiarism Intelligence Engine",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router under /api
app.include_router(api_router, prefix="/api")

# Path to static frontend dist build
FRONTEND_DIST = os.path.abspath(
    os.path.join(
        BACKEND_DIR,
        "..",
        "frontend",
        "dist"
    )
)

# Mount /assets if frontend/dist/assets exists
assets_path = os.path.join(FRONTEND_DIST, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    """
    Serves the static production frontend React application for all root & client routes.
    If API endpoint is called, it is handled by /api router.
    """
    if full_path.startswith("api"):
        return {"error": "API Route not found"}

    file_path = os.path.join(FRONTEND_DIST, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)

    index_html = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_html):
        return FileResponse(index_html)

    return {
        "status": "online",
        "service": "CodeTrace AI Backend",
        "message": "Frontend build not found."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
