#!/usr/bin/env python3
"""
Render startup script that handles uvicorn/gunicorn selection
Tries uvicorn first (for Render compatibility), falls back to alternatives
"""

import os
import sys
import subprocess

def main():
    port = os.environ.get('PORT', 8000)

    print("🚀 UGC AI Backend starting...")
    print(f"📍 Port: {port}")

    # Method 1: Try uvicorn (what Render expects)
    try:
        print("🔄 Attempting uvicorn...")
        subprocess.run([
            'uvicorn', 'main:app',
            '--host', '0.0.0.0',
            '--port', str(port),
            '--no-use-colors'
        ], check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️ uvicorn failed, trying gunicorn...")

        # Method 2: Try gunicorn
        try:
            subprocess.run([
                'gunicorn', 'main:app',
                '--bind', f'0.0.0.0:{port}',
                '--worker-class', 'sync',
                '--workers', '1'
            ], check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️ gunicorn failed, using Python fallback...")

            # Method 3: Direct Python execution
            from main import app
            import uvicorn

            try:
                uvicorn.run(app, host="0.0.0.0", port=int(port))
            except ImportError:
                print("❌ All server options failed")
                sys.exit(1)

if __name__ == "__main__":
    main()