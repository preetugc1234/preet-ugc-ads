#!/usr/bin/env python3
"""
Quick test script to verify FAL AI connection and img2vid_noaudio processing
"""

import asyncio
import logging
import os
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_fal_connection():
    """Test FAL AI connection and processing"""
    try:
        # Load environment variables
        load_dotenv()

        # Import FAL adapter
        from src.ai_models.fal_adapter import FalAdapter

        # Initialize adapter
        adapter = FalAdapter()
        logger.info("✅ FAL Adapter initialized")

        # Test connection
        connection_test = await adapter.test_connection()
        logger.info(f"🔗 Connection test: {connection_test}")

        # Test with sample image-to-video params
        test_params = {
            "image_url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",  # 1x1 test image
            "prompt": "Create smooth cinematic motion with natural camera movement",
            "duration_seconds": 5,
            "quality": "hd"
        }

        logger.info("🎬 Testing img2vid_noaudio processing...")
        result = await adapter.generate_img2vid_noaudio_final(test_params)

        logger.info(f"🎯 Processing result: {result}")

        if result.get('success'):
            logger.info("✅ FAL AI img2vid_noaudio processing works!")
            return True
        else:
            logger.error(f"❌ FAL AI processing failed: {result.get('error')}")
            return False

    except Exception as e:
        logger.error(f"💥 Test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing FAL AI Connection for img2vid_noaudio...")
    print("=" * 60)

    success = asyncio.run(test_fal_connection())

    if success:
        print("\n✅ All tests passed! FAL AI is working correctly.")
    else:
        print("\n❌ Tests failed. Check the logs above for issues.")