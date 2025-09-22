#!/usr/bin/env python3
"""
Render startup script - FIXED VERSION
Handles all server startup with proper error handling
"""

import os
import sys
import subprocess
import importlib

def check_package_available(package_name):
    """Check if a package is available without importing"""
    try:
        importlib.import_module(package_name)
        return True
    except ImportError:
        return False

def main():
    port = int(os.environ.get('PORT', 8000))
    host = '0.0.0.0'

    print("[START] UGC AI Backend starting...")
    print(f"[INFO] Port: {port}")

    # Method 1: Try uvicorn with pure Python configuration
    if check_package_available('uvicorn'):
        print("[INFO] Attempting uvicorn with zero-compilation mode...")
        try:
            import uvicorn
            from main import app

            # Configure uvicorn to avoid httptools
            config = uvicorn.Config(
                app=app,
                host=host,
                port=port,
                loop="asyncio",      # Pure Python event loop
                http="h11",          # Pure Python HTTP implementation
                ws="none",           # Disable WebSocket
                access_log=True,
                log_level="info",
                use_colors=False,
                reload=False
            )

            server = uvicorn.Server(config)
            server.run()
            return

        except Exception as e:
            print(f"[WARN] uvicorn failed: {e}")

    # Method 2: Try gunicorn
    if check_package_available('gunicorn'):
        print("[INFO] Trying gunicorn...")
        try:
            subprocess.run([
                'gunicorn', 'main:app',
                '--bind', f'{host}:{port}',
                '--worker-class', 'sync',
                '--workers', '1',
                '--timeout', '120'
            ], check=True)
            return
        except Exception as e:
            print(f"[WARN] gunicorn failed: {e}")

    # Method 3: Pure Python fallback
    print("[FALLBACK] Using direct Python import...")
    try:
        from main import app
        print("[OK] FastAPI app imported successfully")

        # Use basic WSGI server as last resort
        from wsgiref.simple_server import make_server
        print(f"[INFO] Starting basic server on {host}:{port}")

        # Note: This is very basic but will work
        with make_server(host, port, app) as httpd:
            print(f"[OK] Server running at http://{host}:{port}")
            httpd.serve_forever()

    except Exception as e:
        print(f"[ERROR] Complete failure: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()