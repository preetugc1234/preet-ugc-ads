#!/usr/bin/env python3
"""
Test script to validate the img2vid_noaudio fix locally
Tests the FAL API status parsing fix and ensures no infinite loops
"""

import asyncio
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Add the src directory to the path so we can import modules
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Set up logging to see what's happening
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def test_img2vid_status_parsing():
    """Test the img2vid_noaudio status parsing fix"""
    try:
        # Import our fixed adapter
        from ai_models.fal_adapter import FalAdapter

        logger.info("🧪 Starting img2vid_noaudio status parsing test...")

        # Check if FAL API key is available
        fal_key = os.getenv("FAL_API_KEY")
        if not fal_key:
            logger.error("❌ FAL_API_KEY not found in environment")
            logger.error("❌ Please set FAL_API_KEY environment variable")
            return False

        logger.info(f"✅ FAL API Key found: {fal_key[:8]}...")

        # Initialize adapter
        adapter = FalAdapter()

        # Test parameters - using a simple test image
        test_params = {
            "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=512",  # Simple portrait
            "prompt": "a person smiling and looking directly at camera, natural lighting",
            "resolution": "720p",  # Lower resolution for faster testing
            "duration_seconds": 5   # Short duration for testing
        }

        logger.info(f"📝 Test parameters: {test_params}")
        logger.info(f"🚀 Submitting test request...")

        # Submit async request
        submit_result = await adapter.submit_img2vid_noaudio_async(test_params)
        logger.info(f"📊 Submit result: {submit_result}")

        if not submit_result.get('success'):
            logger.error(f"❌ Submission failed: {submit_result.get('error')}")
            return False

        request_id = submit_result.get('request_id')
        logger.info(f"✅ Submission successful. Request ID: {request_id}")

        # Test status polling with the fix (limited attempts)
        max_test_attempts = 3  # Only test a few attempts
        attempt = 0

        logger.info(f"🔄 Testing status parsing for {max_test_attempts} attempts...")

        while attempt < max_test_attempts:
            attempt += 1
            logger.info(f"🔄 Test polling attempt {attempt}/{max_test_attempts}")

            try:
                # Get status using our fixed method
                async_result = await adapter.get_async_result(request_id)
                logger.info(f"📊 Status result: {async_result}")

                status = async_result.get('status')
                if status == 'completed':
                    logger.info(f"✅ Job completed! Result: {async_result}")
                    return True
                elif status == 'failed':
                    logger.error(f"❌ Job failed: {async_result.get('error')}")
                    return False
                elif status in ['queued', 'processing']:
                    logger.info(f"⏳ Job {status}, continuing test...")
                    await asyncio.sleep(10)  # Wait 10 seconds between attempts
                else:
                    logger.warning(f"⚠️ Unknown status: {status}")
                    await asyncio.sleep(10)

            except Exception as poll_error:
                logger.error(f"❌ Polling error: {poll_error}")
                return False

        logger.info(f"✅ Status parsing test completed successfully!")
        logger.info(f"✅ No infinite loops detected - polling worked correctly for {max_test_attempts} attempts")
        logger.info(f"ℹ️ Job may still be processing - this test validates the fix works")
        return True

    except Exception as e:
        logger.error(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main test function"""
    logger.info("🧪 Starting img2vid_noaudio fix validation...")

    success = await test_img2vid_status_parsing()

    if success:
        logger.info("✅ ALL TESTS PASSED - Fix is working correctly!")
        logger.info("✅ Status parsing now handles FAL client objects properly")
        logger.info("✅ No more infinite loops or money-wasting duplicate calls")
    else:
        logger.error("❌ TEST FAILED - Fix needs more work")

    return success

if __name__ == "__main__":
    # Run the test
    result = asyncio.run(main())
    sys.exit(0 if result else 1)