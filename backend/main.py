from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup AI packages with fallbacks
try:
    from startup import setup_ai_packages, create_mock_modules
    setup_ai_packages()
    create_mock_modules()
    print("[OK] AI packages setup complete")
except Exception as e:
    print(f"[WARN] AI packages setup failed: {e}")
    print("[INFO] Continuing with core functionality only")

# Create FastAPI app
app = FastAPI(
    title="UGC AI Backend API",
    description="AI-powered video content generation platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "https://preet-ugc-ads.lovable.app"),
        "http://localhost:3000",
        "http://localhost:8080",
        "https://preet-ugc-ads.lovable.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from src.routes.auth_routes import router as auth_router
from src.routes.user_routes import router as user_router
from src.routes.health_routes import router as health_router
from src.routes.jobs import router as jobs_router
from src.routes.webhooks import router as webhooks_router
from src.routes.generate import router as generate_router
from src.routes.payments import router as payments_router
from src.routes.tts import router as tts_router
from src.api.routes.img2vid_audio import router as img2vid_audio_router

# Import error handlers
from src.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    database_exception_handler,
    invalid_object_id_handler,
    general_exception_handler
)
from fastapi.exceptions import RequestValidationError
from pymongo.errors import PyMongoError
from bson.errors import InvalidId

# Include routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(health_router)
app.include_router(jobs_router, prefix="/api/jobs", tags=["jobs"])
app.include_router(webhooks_router, prefix="/api/webhooks", tags=["webhooks"])
app.include_router(generate_router, prefix="/api/generate", tags=["generation"])
app.include_router(payments_router)  # Already has prefix in router
app.include_router(tts_router)  # Already has prefix in router
app.include_router(img2vid_audio_router)  # Already has prefix in router

# Add error handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(PyMongoError, database_exception_handler)
app.add_exception_handler(InvalidId, invalid_object_id_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Initialize queue management background tasks
from src.queue_manager import start_background_tasks

@app.on_event("startup")
async def startup_event():
    """Initialize background tasks on application startup."""
    start_background_tasks()

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "UGC AI Backend API",
        "version": "1.0.0",
        "status": "Running",
        "timestamp": datetime.utcnow().isoformat(),
        "tech_stack": "FastAPI + Python"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "OK",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "python_version": "3.11+",
        "framework": "FastAPI"
    }

# Note: Error handlers are now imported and registered above

if __name__ == "__main__":
    # Production-ready server with zero compilation dependencies
    import sys
    port = int(os.getenv("PORT", 8000))

    print("[START] UGC AI Backend - Zero Compilation Mode")
    print(f"[INFO] Port: {port}")

    try:
        # Use uvicorn with pure Python configuration
        import uvicorn

        # Configure uvicorn to avoid httptools completely
        config = uvicorn.Config(
            app=app,
            host="0.0.0.0",
            port=port,
            loop="asyncio",      # Pure Python event loop
            http="h11",          # Pure Python HTTP implementation
            ws="none",           # Disable WebSocket to avoid additional deps
            lifespan="on",       # Enable lifespan events
            access_log=True,
            log_level="info",
            use_colors=False,    # Disable colors for better Render compatibility
            reload=False         # Always disable reload in production
        )

        server = uvicorn.Server(config)
        server.run()

    except ImportError as e:
        print(f"[WARN] uvicorn import failed: {e}")
        print("[INFO] Falling back to alternative server")

        # Try gunicorn fallback
        try:
            import gunicorn.app.wsgiapp
            sys.argv = [
                "gunicorn",
                "--bind", f"0.0.0.0:{port}",
                "--worker-class", "sync",
                "--workers", "1",
                "--timeout", "120",
                "main:app"
            ]
            gunicorn.app.wsgiapp.run()
        except Exception as fallback_error:
            print(f"[ERROR] All server options failed: {fallback_error}")
            print("[INFO] Please check server dependencies")
            sys.exit(1)