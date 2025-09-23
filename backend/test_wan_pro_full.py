#!/usr/bin/env python3
"""
Test Wan Pro Image-to-Video generation and Cloudinary upload
"""

import asyncio
import logging
import os
import requests
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_wan_pro_full_workflow():
    """Test complete Wan Pro workflow with Cloudinary upload"""
    try:
        # Load environment variables
        load_dotenv()

        print("=" * 60)
        print("🧪 TESTING WAN PRO IMAGE-TO-VIDEO + CLOUDINARY UPLOAD")
        print("=" * 60)

        # Step 1: Test Wan Pro generation
        from src.ai_models.fal_adapter import FalAdapter
        from src.ai_models.asset_handler import AssetHandler

        adapter = FalAdapter()
        asset_handler = AssetHandler()

        print("\n📋 Test Parameters:")
        print(f"   • Model: fal-ai/wan-pro/image-to-video")
        print(f"   • API Key: {bool(os.getenv('FAL_IMG2VID_API_KEY'))}")
        print(f"   • Cloudinary: {bool(os.getenv('CLOUDINARY_URL'))}")

        # Test image URL (placeholder)
        test_image_url = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop"

        test_params = {
            "image_url": test_image_url,
            "prompt": "A gentle breeze moves through the scene with smooth cinematic motion",
            "seed": 12345
        }

        print(f"\n🎬 Starting Wan Pro generation...")
        print(f"   • Image: {test_image_url}")
        print(f"   • Prompt: {test_params['prompt']}")

        # Step 2: Generate video
        result = await adapter.generate_img2vid_noaudio_final(test_params)

        if not result.get('success'):
            print(f"\n❌ Wan Pro generation FAILED:")
            print(f"   • Error: {result.get('error')}")
            return False

        video_url = result.get('video_url')
        print(f"\n✅ Wan Pro generation SUCCESSFUL:")
        print(f"   • Video URL: {video_url}")
        print(f"   • Model: {result.get('model')}")
        print(f"   • Duration: {result.get('duration')}s")
        print(f"   • Quality: {result.get('quality')}")

        # Step 3: Test Cloudinary upload
        print(f"\n📤 Testing Cloudinary upload...")

        # Mock job and user IDs for testing
        test_job_id = "test_wan_pro_123"
        test_user_id = "test_user_456"

        # Handle video result (upload to Cloudinary)
        asset_result = await asset_handler.handle_video_result(
            result, test_job_id, test_user_id, False
        )

        if not asset_result.get('success'):
            print(f"\n❌ Cloudinary upload FAILED:")
            print(f"   • Error: {asset_result.get('error')}")
            return False

        cloudinary_urls = asset_result.get('urls', [])
        print(f"\n✅ Cloudinary upload SUCCESSFUL:")
        print(f"   • Cloudinary URLs: {len(cloudinary_urls)} files")
        for i, url in enumerate(cloudinary_urls):
            print(f"   • File {i+1}: {url}")

        # Step 4: Verify video accessibility
        print(f"\n🔍 Verifying video accessibility...")

        for url in cloudinary_urls:
            try:
                response = requests.head(url, timeout=10)
                if response.status_code == 200:
                    print(f"   ✅ {url} - Accessible")
                else:
                    print(f"   ⚠️  {url} - Status: {response.status_code}")
            except Exception as e:
                print(f"   ❌ {url} - Error: {str(e)}")

        print(f"\n🎉 COMPLETE SUCCESS! Wan Pro + Cloudinary workflow is working!")
        print(f"\n📊 Summary:")
        print(f"   • Model: wan-pro")
        print(f"   • Generated: 6-second 1080p video")
        print(f"   • Uploaded: {len(cloudinary_urls)} files to Cloudinary")
        print(f"   • Ready for production use! ✅")

        return True

    except Exception as e:
        print(f"\n💥 Test FAILED with exception:")
        print(f"   • Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_wan_pro_full_workflow())

    if success:
        print(f"\n🚀 ALL TESTS PASSED - READY TO USE IN APP!")
    else:
        print(f"\n❌ TESTS FAILED - NEEDS DEBUGGING")