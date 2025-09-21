#!/usr/bin/env python3
"""
Test Cloudinary integration with the provided credentials
"""

import os
import sys
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from ai_models.asset_handler import AssetHandler

async def test_cloudinary_config():
    """Test Cloudinary configuration and connection."""
    print("Testing Cloudinary Integration...")

    handler = AssetHandler()
    config = handler.get_cloudinary_config()

    print(f"Cloudinary Configuration:")
    print(f"   • Configured: {config['configured']}")
    print(f"   • Cloud Name: {config['cloud_name']}")
    print(f"   • Upload Preset: {config['upload_preset']}")

    if config['configured']:
        print("All Cloudinary credentials are properly configured!")

        # Test a simple text upload
        try:
            test_content = b"Hello from UGC AI Platform! This is a test file."
            test_path = "test/integration_test.txt"

            print(f"Testing file upload to Cloudinary...")
            result = await handler._upload_to_cloudinary(
                test_content,
                test_path,
                resource_type="raw",
                format="txt"
            )

            if result:
                print(f"Upload successful!")
                print(f"   • URL: {result.get('secure_url')}")
                print(f"   • Public ID: {result.get('public_id')}")
                print(f"   • Resource Type: {result.get('resource_type')}")
                return True
            else:
                print("Upload failed - no result returned")
                return False

        except Exception as e:
            print(f"Upload test failed: {e}")
            return False
    else:
        print("Cloudinary credentials are missing or incomplete")
        return False

async def test_asset_handling():
    """Test the asset handling for different content types."""
    print("\nTesting Asset Handler Methods...")

    handler = AssetHandler()

    # Test chat result handling
    chat_result = {
        "success": True,
        "content": "# Marketing Strategy\n\n## Social Media Campaign\n\nCreate engaging content for Instagram and TikTok...",
        "model": "gpt-4o-mini",
        "tokens_used": 150
    }

    print("Testing chat asset handling...")
    chat_asset = await handler.handle_chat_result(chat_result, "test_job_123", "user_456", is_preview=True)

    if chat_asset["success"]:
        print("Chat asset handling successful")
        print(f"   • Type: {chat_asset['asset_data']['type']}")
        print(f"   • Content length: {chat_asset['metadata']['content_length']} chars")
    else:
        print(f"Chat asset handling failed: {chat_asset.get('error')}")

    return chat_asset["success"]

if __name__ == "__main__":
    print("Cloudinary Integration Test\n")

    async def run_tests():
        success = True

        # Test configuration
        config_success = await test_cloudinary_config()
        success = success and config_success

        # Test asset handling
        asset_success = await test_asset_handling()
        success = success and asset_success

        print(f"\n{'='*50}")
        if success:
            print("All Cloudinary tests passed! Integration is working perfectly.")
            print("Ready for production use with marketing content!")
        else:
            print("Some tests failed. Please check your Cloudinary credentials.")
            print("Make sure your cloud name, API key, and secret are correct.")
        print(f"{'='*50}")

        return success

    result = asyncio.run(run_tests())
    sys.exit(0 if result else 1)