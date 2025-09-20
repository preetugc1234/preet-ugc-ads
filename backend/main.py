from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

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
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") == "development"
    )