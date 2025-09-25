#!/usr/bin/env python3
"""
Test script for WAN v2.2-5B model using the proper subscribe method
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

async def test_wan_v22_5b():
    """Test WAN v2.2-5B model with subscribe method"""
    try:
        import fal_client
        from ai_models.asset_handler import AssetHandler

        logger.info("🎬 Starting WAN v2.2-5B test with subscribe method...")

        # Check API key - WAN v2.2-5B uses FAL_KEY
        fal_key = os.getenv("FAL_API_KEY")
        if not fal_key:
            logger.error("❌ FAL_API_KEY not found")
            return False

        # Set FAL_KEY for fal_client
        os.environ["FAL_KEY"] = fal_key
        logger.info(f"✅ FAL_KEY set for WAN v2.2-5B: {fal_key[:8]}...")

        # Initialize asset handler
        asset_handler = AssetHandler()

        # User's image and motion prompt
        image_path = r"c:\\Users\\mt\\Downloads\\ss17-animation-mfa-ruchirek-somrit-3d-short-1024x572.jpg"
        motion_prompt = "the kid is moving straight to the flower looking happy and his hand is also going to upfront to touch the flower and camera is stably moving forward to his face like zoom in very slowly"

        logger.info(f"📷 Image: {image_path}")
        logger.info(f"🎭 Motion: {motion_prompt}")

        # Step 1: Upload image
        logger.info("📤 Uploading image to FAL storage...")
        upload_url = await asyncio.to_thread(
            fal_client.upload_file,
            image_path
        )
        logger.info(f"✅ Image uploaded: {upload_url}")

        # Step 2: Use submit/result approach for WAN v2.2-5B
        logger.info("🚀 Starting WAN v2.2-5B generation with submit method...")

        # WAN v2.2-5B arguments
        arguments = {
            "image_url": upload_url,
            "prompt": motion_prompt,
            "num_frames": 81,  # 17-161 frames
            "frames_per_second": 24,  # 4-60 FPS
            "resolution": "720p",  # 580p or 720p
            "aspect_ratio": "auto",  # auto, 16:9, 9:16, 1:1
            "num_inference_steps": 40,
            "enable_safety_checker": True,
            "enable_prompt_expansion": False,
            "guidance_scale": 3.5,
            "shift": 5,
            "interpolator_model": "film",  # none, film, rife
            "num_interpolated_frames": 1,  # 0-4 for smoother motion
            "video_quality": "high",  # low, medium, high, maximum
            "video_write_mode": "balanced"  # fast, balanced, small
        }

        logger.info(f"🚀 Arguments: {arguments}")

        # Submit request
        handler = await asyncio.to_thread(
            fal_client.submit,
            "fal-ai/wan/v2.2-5b/image-to-video",
            arguments=arguments
        )

        request_id = handler.request_id
        logger.info(f"✅ WAN v2.2-5B submitted! Request ID: {request_id}")

        # Poll for completion (WAN v2.2-5B typically takes 5-6 minutes)
        max_attempts = 30  # 7.5 minutes max (plenty of buffer for 5-6 min generation)
        attempt = 0

        logger.info("🔄 Monitoring WAN v2.2-5B progress...")

        while attempt < max_attempts:
            attempt += 1
            logger.info(f"🔄 Check {attempt}/{max_attempts} - Waiting for completion...")

            await asyncio.sleep(15)  # Wait 15 seconds between checks

            try:
                # Use handler.get() method to check if ready
                result = await asyncio.to_thread(handler.get)

                if result:
                    logger.info("✅ WAN v2.2-5B generation completed!")
                    break
                else:
                    logger.info(f"⏳ Still processing... (not ready yet)")
                    continue

            except Exception as poll_error:
                # If result not ready yet, continue polling
                logger.info(f"⏳ Still processing... ({poll_error})")
                continue

        else:
            logger.error("❌ WAN v2.2-5B generation timed out after 7.5 minutes")
            return {'success': False, 'error': 'Generation timeout'}

        logger.info(f"🎉 WAN v2.2-5B generation completed!")
        logger.info(f"✅ Result: {result}")

        # Step 3: Process and save to Cloudinary
        if result and "video" in result:
            logger.info("☁️ Saving to Cloudinary...")

            # Prepare result in expected format
            formatted_result = {
                "success": True,
                "video_url": result["video"]["url"],
                "prompt": result.get("prompt", motion_prompt),
                "seed": result.get("seed", 0),
                "duration": 81 / 24,  # frames / fps = duration in seconds
                "model": "wan-v2.2-5b"
            }

            # Save to Cloudinary
            final_asset = await asset_handler.handle_img2vid_noaudio_result(
                formatted_result, "user_video_wan_v22_5b", "user123", False
            )

            if final_asset.get('success'):
                cloudinary_urls = final_asset.get('urls', [])
                logger.info(f"✅ SUCCESS! Video saved to Cloudinary:")
                for url in cloudinary_urls:
                    logger.info(f"🎬 CLOUDINARY URL: {url}")

                # Also show direct FAL URL
                fal_url = result["video"]["url"]
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
        else:
            logger.error("❌ No video in result")
            return {'success': False, 'error': 'No video generated'}

    except Exception as e:
        logger.error(f"❌ WAN v2.2-5B test failed: {e}")
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}

async def main():
    """Main function"""
    logger.info("🎬 Starting WAN v2.2-5B complete test...")

    result = await test_wan_v22_5b()

    if result.get('success'):
        logger.info("🎉 WAN v2.2-5B TEST COMPLETED SUCCESSFULLY!")
        logger.info("✅ Perfect 1-click generation workflow")
        logger.info("✅ Video saved to Cloudinary")
        logger.info("✅ Ready for production use")
    else:
        logger.error(f"❌ WAN v2.2-5B test failed: {result.get('error')}")

    return result.get('success', False)

if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)