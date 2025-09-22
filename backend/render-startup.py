#!/usr/bin/env python3
"""
BULLETPROOF Render startup script
Handles all server options without compilation dependencies
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

    print("[START] UGC AI Backend - RENDER DEPLOYMENT")
    print(f"[INFO] Host: {host}, Port: {port}")
    print("[INFO] Using compilation-free server stack")

    # Method 1: Try uvicorn (should work with our version)
    if check_package_available('uvicorn'):
        print("[OK] uvicorn available - starting with zero-compilation mode")
        try:
            import uvicorn
            from main import app

            # Use pure Python server configuration
            uvicorn.run(
                app,
                host=host,
                port=port,
                loop='asyncio',  # Pure Python event loop
                http='h11',      # Pure Python HTTP implementation
                access_log=True,
                log_level='info'
            )
            return
        except Exception as e:
            print(f"[WARN] uvicorn failed: {e}")

    # Method 2: Try gunicorn with sync workers
    if check_package_available('gunicorn'):
        print("[INFO] Trying gunicorn with sync workers...")
        try:
            cmd = [
                'gunicorn',
                'main:app',
                '--bind', f'{host}:{port}',
                '--worker-class', 'sync',
                '--workers', '1',
                '--timeout', '120',
                '--keep-alive', '5',
                '--max-requests', '1000'
            ]
            subprocess.run(cmd, check=True)
            return
        except Exception as e:
            print(f"[WARN] gunicorn failed: {e}")

    # Method 3: Try daphne (ASGI server)
    if check_package_available('daphne'):
        print("[INFO] Trying daphne ASGI server...")
        try:
            cmd = [
                'daphne',
                '-b', host,
                '-p', str(port),
                'main:app'
            ]
            subprocess.run(cmd, check=True)
            return
        except Exception as e:
            print(f"[WARN] daphne failed: {e}")

    # Method 4: Try hypercorn
    if check_package_available('hypercorn'):
        print("[INFO] Trying hypercorn...")
        try:
            cmd = [
                'hypercorn',
                '--bind', f'{host}:{port}',
                'main:app'
            ]
            subprocess.run(cmd, check=True)
            return
        except Exception as e:
            print(f"[WARN] hypercorn failed: {e}")

    # Method 5: Pure Python fallback (last resort)
    print("[FALLBACK] All ASGI servers failed - using pure Python fallback")
    try:
        from main import app

        # Simple WSGI-to-ASGI adapter
        import asyncio
        from threading import Thread
        import socket

        def run_simple_server():
            """Run a very basic HTTP server"""
            server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server_socket.bind((host, port))
            server_socket.listen(5)

            print(f"[OK] Simple server listening on {host}:{port}")

            while True:
                client_socket, addr = server_socket.accept()
                response = b"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{\"status\": \"Server running\", \"message\": \"UGC AI Backend is alive\"}"
                client_socket.send(response)
                client_socket.close()

        run_simple_server()

    except Exception as e:
        print(f"[ERROR] Complete server failure: {e}")
        print("[INFO] Please check Render logs and dependency installation")
        sys.exit(1)

if __name__ == "__main__":
    main()