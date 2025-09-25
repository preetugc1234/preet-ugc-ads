#!/usr/bin/env python3
"""
Test script to generate video from user's specific image and motion prompt
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

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def generate_user_video():
    """Generate video from user's image and motion prompt"""
    try:
        from ai_models.fal_adapter import FalAdapter
        from ai_models.asset_handler import AssetHandler

        logger.info("🎬 Starting user video generation...")

        # Initialize adapters
        adapter = FalAdapter()
        asset_handler = AssetHandler()

        # User's image path and motion prompt
        image_path = r"c:\Users\mt\Downloads\ss17-animation-mfa-ruchirek-somrit-3d-short-1024x572.jpg"
        motion_prompt = "the kid is moving straight to the flower looking happy and his hand is also going to upfront to touch the flower and camera is stably moving forward to his face like zoom in very slowly"

        logger.info(f"📷 Image: {image_path}")
        logger.info(f"🎭 Motion: {motion_prompt}")

        # Step 1: Upload image to FAL storage
        logger.info("📤 Uploading image to FAL storage...")

        with open(image_path, 'rb') as f:
            image_data = f.read()

        image_url = await adapter.upload_file(image_data, "kid_flower_scene.jpg")
        logger.info(f"✅ Image uploaded: {image_url}")

        # Step 2: Submit video generation with WAN v2.2-5B parameters
        test_params = {
            "image_url": image_url,
            "prompt": motion_prompt,
            "num_frames": 81,  # Higher frame count for smooth motion (17-161)
            "frames_per_second": 24,  # Standard cinematic frame rate
            "resolution": "720p",  # WAN v2.2-5B supports 580p or 720p
            "aspect_ratio": "auto",  # Auto-detect from image
            "num_inference_steps": 40,  # High quality inference
            "enable_safety_checker": True,
            "enable_prompt_expansion": False,  # Use exact prompt
            "guidance_scale": 3.5,  # Good balance
            "shift": 5,  # Default shift
            "interpolator_model": "film",  # FILM interpolation for smoothness
            "num_interpolated_frames": 1,  # Add 1 interpolated frame for smoother motion
            "video_quality": "high",  # High quality output
            "video_write_mode": "balanced"  # Balanced speed/quality
        }

        logger.info("🚀 Submitting WAN v2.2-5B generation...")
        submit_result = await adapter.submit_img2vid_noaudio_async(test_params)

        if not submit_result.get('success'):
            logger.error(f"❌ Submission failed: {submit_result.get('error')}")
            return False

        request_id = submit_result.get('request_id')
        logger.info(f"✅ Generation submitted! Request ID: {request_id}")

        # Step 3: Poll for completion (with timeout)
        max_attempts = 40  # 10 minutes max
        attempt = 0

        logger.info("🔄 Monitoring generation progress...")

        while attempt < max_attempts:
            attempt += 1
            logger.info(f"🔄 Check {attempt}/{max_attempts} - Waiting for completion...")

            try:
                async_result = await adapter.get_async_result(request_id)
                logger.info(f"📊 Status: {async_result.get('status')}")

                if async_result.get('success'):
                    logger.info("🎉 Video generation completed!")

                    # Step 4: Process and save to Cloudinary
                    logger.info("☁️ Saving to Cloudinary...")
                    final_asset = await asset_handler.handle_img2vid_noaudio_result(
                        async_result, "user_video_test", "user123", False
                    )

                    if final_asset.get('success'):
                        cloudinary_urls = final_asset.get('urls', [])
                        logger.info(f"✅ SUCCESS! Video saved to Cloudinary:")
                        for url in cloudinary_urls:
                            logger.info(f"🎬 VIDEO URL: {url}")

                        # Also show direct FAL URL as backup
                        fal_url = async_result.get('video_url')
                        if fal_url:
                            logger.info(f"🔗 Direct FAL URL: {fal_url}")

                        return {
                            'success': True,
                            'cloudinary_urls': cloudinary_urls,
                            'fal_url': fal_url,
                            'metadata': final_asset.get('metadata', {})
                        }
                    else:
                        logger.error("❌ Failed to save to Cloudinary")
                        return {'success': False, 'error': 'Cloudinary save failed'}

                elif async_result.get('status') == 'failed':
                    logger.error(f"❌ Generation failed: {async_result.get('error')}")
                    return {'success': False, 'error': async_result.get('error')}

                elif async_result.get('status') in ['queued', 'processing']:
                    logger.info(f"⏳ Still {async_result.get('status')}... waiting 15 seconds")
                    await asyncio.sleep(15)

                else:
                    logger.info(f"🤔 Status: {async_result.get('status')} - continuing to wait")
                    await asyncio.sleep(15)

            except Exception as poll_error:
                logger.error(f"❌ Polling error: {poll_error}")
                await asyncio.sleep(15)

        logger.error("❌ Generation timed out after 10 minutes")
        return {'success': False, 'error': 'Generation timeout'}

    except Exception as e:
        logger.error(f"❌ Generation failed: {e}")
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}

async def main():
    """Main function"""
    logger.info("🎬 Starting user video generation with WAN v2.2-5B...")

    result = await generate_user_video()

    if result.get('success'):
        logger.info("🎉 VIDEO GENERATION COMPLETED SUCCESSFULLY!")
        logger.info("✅ No infinite loops detected")
        logger.info("✅ Video saved to Cloudinary")
        logger.info("✅ Ready for user download")
    else:
        logger.error(f"❌ Video generation failed: {result.get('error')}")

    return result.get('success', False)

if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)