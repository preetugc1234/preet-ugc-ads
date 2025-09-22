#!/usr/bin/env python3
"""
Simple server that runs without uvicorn/httptools
Uses basic HTTP server for development/deployment
"""

import os
from wsgiref.simple_server import make_server
from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware

def create_app():
    """Create FastAPI app without uvicorn dependencies"""
    app = FastAPI(
        title="UGC AI Backend",
        description="Minimal AI backend",
        version="1.0.0"
    )

    @app.get("/")
    async def root():
        return {"message": "UGC AI Backend is running!", "status": "ok"}

    @app.get("/health")
    async def health():
        return {"status": "healthy", "python_version": os.sys.version}

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 8000))

    print(f"🚀 Starting server on port {port}")
    print("📝 Note: Using simple HTTP server (no uvicorn/httptools)")

    # Use basic WSGI server
    from wsgiref.simple_server import make_server
    with make_server('', port, app) as httpd:
        print(f"✅ Server running at http://0.0.0.0:{port}")
        httpd.serve_forever()