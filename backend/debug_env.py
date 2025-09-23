#!/usr/bin/env python3
"""
Debug script to check environment variables and deployment status
"""

import os
from dotenv import load_dotenv

def check_deployment_status():
    """Check if the deployment has the latest environment variables."""
    load_dotenv()

    print("DEPLOYMENT STATUS CHECK")
    print("=" * 50)

    print("\n🔑 API Keys:")
    print(f"FAL_API_KEY: {bool(os.getenv('FAL_API_KEY'))}")
    print(f"FAL_IMG2VID_API_KEY: {bool(os.getenv('FAL_IMG2VID_API_KEY'))}")

    print("\n☁️ Cloudinary:")
    print(f"CLOUDINARY_CLOUD_NAME: {os.getenv('CLOUDINARY_CLOUD_NAME', 'Not set')}")
    print(f"CLOUDINARY_API_KEY: {bool(os.getenv('CLOUDINARY_API_KEY'))}")
    print(f"CLOUDINARY_API_SECRET: {bool(os.getenv('CLOUDINARY_API_SECRET'))}")

    print("\n🌐 URLs:")
    print(f"BACKEND_URL: {os.getenv('BACKEND_URL', 'Not set')}")
    print(f"FRONTEND_URL: {os.getenv('FRONTEND_URL', 'Not set')}")

    print("\n🏗️ Environment:")
    print(f"ENVIRONMENT: {os.getenv('ENVIRONMENT', 'Not set')}")
    print(f"PORT: {os.getenv('PORT', 'Not set')}")

    # Check model configuration
    try:
        from src.ai_models.fal_adapter import FalAdapter
        adapter = FalAdapter()
        model = adapter.models.get("img2vid_noaudio", "Not found")
        print(f"\n🤖 Current Model: {model}")
        print(f"Has IMG2VID key: {bool(adapter.img2vid_api_key)}")
    except Exception as e:
        print(f"\n❌ Model check failed: {e}")

if __name__ == "__main__":
    check_deployment_status()