#!/usr/bin/env python3
"""
Test script to verify Wan v2.2-5B integration matches local working setup
"""
import os
import sys
import asyncio
import logging

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'src'))

from ai_models.fal_adapter import FalAdapter

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_wan_integration():
    """Test the Wan v2.2-5B integration that worked locally."""
    logger.info("🧪 Testing Wan v2.2-5B integration...")

    # Initialize FalAdapter
    fal_adapter = FalAdapter()

    # Check API keys
    logger.info(f"🔑 General FAL API Key: {bool(fal_adapter.api_key)}")
    logger.info(f"🔑 IMG2VID API Key: {bool(fal_adapter.img2vid_api_key)}")

    # Test parameters (same as working local test)
    test_params = {
        "image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "prompt": "Gentle head nod and subtle eye movement, natural portrait animation",
        "duration_seconds": 5,
        "quality": "hd"
    }

    logger.info("📝 Test parameters:")
    logger.info(f"   - Image URL: {test_params['image_url'][:50]}...")
    logger.info(f"   - Prompt: {test_params['prompt']}")
    logger.info(f"   - Duration: {test_params['duration_seconds']}s")

    try:
        # Test async submission (same method that worked locally)
        logger.info("🚀 Submitting Wan v2.2-5B request...")
        submit_result = await fal_adapter.submit_img2vid_noaudio_async(test_params)

        logger.info("📊 Submission result:")
        for key, value in submit_result.items():
            logger.info(f"   {key}: {value}")

        if submit_result.get("success"):
            request_id = submit_result.get("request_id")
            logger.info(f"✅ Submission successful! Request ID: {request_id}")

            # Check status
            logger.info("⏳ Checking job status...")
            status_result = await fal_adapter.get_async_result(request_id)

            logger.info("📈 Status result:")
            for key, value in status_result.items():
                logger.info(f"   {key}: {value}")

            if status_result.get("success") and status_result.get("video_url"):
                logger.info("🎉 VIDEO GENERATION SUCCESSFUL!")
                logger.info(f"🎬 Video URL: {status_result['video_url']}")
                logger.info(f"⏱️ Duration: {status_result.get('duration', 'unknown')}s")
                logger.info(f"🏷️ Model: {status_result.get('model', 'unknown')}")
                return True
            else:
                logger.error("❌ Video generation failed or incomplete")
                return False
        else:
            logger.error(f"❌ Submission failed: {submit_result.get('error', 'Unknown error')}")
            return False

    except Exception as e:
        logger.error(f"❌ Test failed with exception: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_wan_integration())
    if success:
        print("\n✅ Wan v2.2-5B integration test PASSED")
        print("🔧 Your frontend and backend are now aligned!")
    else:
        print("\n❌ Wan v2.2-5B integration test FAILED")
        print("🔍 Check API keys and model configuration")

    sys.exit(0 if success else 1)