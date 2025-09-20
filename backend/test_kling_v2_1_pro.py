"""
Test script for Kling v2.1 Pro integration
Tests the new fal-client implementation with real API calls
"""

import asyncio
import sys
import os
import time
from typing import Dict, Any

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.ai_models.fal_adapter import FalAdapter

async def test_kling_v2_1_pro_preview():
    """Test Kling v2.1 Pro preview generation."""
    print("Testing Kling v2.1 Pro Preview...")

    adapter = FalAdapter()

    # Test parameters
    params = {
        "image_url": "https://v3.fal.media/files/lion/_I_io6Gtk83c72d-afXf8_image.webp",
        "prompt": "A gentle breeze moves through the scene, creating subtle motion in hair and clothing",
        "duration_seconds": 5,
        "aspect_ratio": "16:9",
        "negative_prompt": "blur, distort, and low quality",
        "cfg_scale": 0.5
    }

    print(f"  Image URL: {params['image_url']}")
    print(f"  Prompt: {params['prompt']}")
    print(f"  Duration: {params['duration_seconds']} seconds")

    try:
        result = await adapter.generate_img2vid_noaudio_preview(params)

        print(f"  Success: {result.get('success', False)}")
        if result.get('success'):
            print(f"  Video URL: {result.get('video_url', 'N/A')}")
            print(f"  Model: {result.get('model', 'N/A')}")
            print(f"  Processing Time: {result.get('processing_time', 'N/A')}")
        else:
            print(f"  Error: {result.get('error', 'Unknown error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"  Exception: {e}")
        return False

async def test_kling_v2_1_pro_final():
    """Test Kling v2.1 Pro final generation."""
    print("\nTesting Kling v2.1 Pro Final...")

    adapter = FalAdapter()

    # Test parameters with more sophisticated options
    params = {
        "image_url": "https://v3.fal.media/files/lion/_I_io6Gtk83c72d-afXf8_image.webp",
        "prompt": "Warm, incandescent streetlights paint the rain-slicked cobblestones in pools of amber light as a couple walks hand-in-hand, their silhouettes stark against the blurry backdrop of a city shrouded in a gentle downpour; the camera lingers on the subtle textures of their rain-soaked coats and the glistening reflections dancing on the wet pavement, creating a sense of intimate vulnerability and shared quietude.",
        "duration_seconds": 10,
        "aspect_ratio": "16:9",
        "negative_prompt": "blur, distort, and low quality",
        "cfg_scale": 0.5
    }

    print(f"  Image URL: {params['image_url']}")
    print(f"  Prompt: {params['prompt'][:50]}...")
    print(f"  Duration: {params['duration_seconds']} seconds")

    try:
        print("  Starting generation (this may take ~6 minutes)...")
        start_time = time.time()

        result = await adapter.generate_img2vid_noaudio_final(params)

        end_time = time.time()
        actual_time = end_time - start_time

        print(f"  Success: {result.get('success', False)}")
        print(f"  Actual processing time: {actual_time:.1f} seconds")

        if result.get('success'):
            print(f"  Video URL: {result.get('video_url', 'N/A')}")
            print(f"  Model: {result.get('model', 'N/A')}")
            print(f"  Quality: {result.get('quality', 'N/A')}")
        else:
            print(f"  Error: {result.get('error', 'Unknown error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"  Exception: {e}")
        return False

async def test_async_submission():
    """Test async submission with webhooks."""
    print("\nTesting Async Submission...")

    adapter = FalAdapter()

    params = {
        "image_url": "https://v3.fal.media/files/lion/_I_io6Gtk83c72d-afXf8_image.webp",
        "prompt": "Gentle camera movement revealing more of the scene",
        "duration_seconds": 10,
        "cfg_scale": 0.5
    }

    # Test webhook URL (you can replace with your actual webhook)
    webhook_url = "https://preet-ugc-ads.onrender.com/api/jobs/webhook/fal"

    print(f"  Submitting async request...")
    print(f"  Webhook URL: {webhook_url}")

    try:
        result = await adapter.submit_img2vid_noaudio_async(params, webhook_url)

        print(f"  Success: {result.get('success', False)}")
        if result.get('success'):
            request_id = result.get('request_id')
            print(f"  Request ID: {request_id}")
            print(f"  Status: {result.get('status', 'N/A')}")
            print(f"  Estimated Time: {result.get('estimated_processing_time', 'N/A')}")

            # Optionally test getting the result (this would normally be done via webhook)
            print(f"  Testing result retrieval (after a delay)...")
            await asyncio.sleep(5)  # Wait a bit before checking

            result_check = await adapter.get_async_result(request_id)
            print(f"  Result check: {result_check.get('status', 'N/A')}")

        else:
            print(f"  Error: {result.get('error', 'Unknown error')}")

        return result.get('success', False)

    except Exception as e:
        print(f"  Exception: {e}")
        return False

async def test_file_upload():
    """Test file upload to Fal AI storage."""
    print("\nTesting File Upload...")

    adapter = FalAdapter()

    # Create a small test file
    test_file_path = "test_image.txt"
    with open(test_file_path, "w") as f:
        f.write("This is a test file for Fal AI upload")

    try:
        print(f"  Uploading test file: {test_file_path}")
        url = await adapter.upload_file_to_fal(test_file_path)
        print(f"  Upload successful!")
        print(f"  File URL: {url}")

        # Cleanup
        os.remove(test_file_path)
        return True

    except Exception as e:
        print(f"  Upload failed: {e}")
        # Cleanup on failure
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
        return False

async def main():
    """Run all Kling v2.1 Pro tests."""
    print("Kling v2.1 Pro Integration Test Suite")
    print("=" * 50)

    # Check API key
    api_key = os.getenv("FAL_API_KEY")
    if not api_key:
        print("❌ FAL_API_KEY not set in environment variables")
        print("Please set your Fal AI API key to run these tests.")
        return False

    print(f"✅ FAL_API_KEY configured")
    print()

    results = {}

    # Test preview generation
    try:
        results['preview'] = await test_kling_v2_1_pro_preview()
    except Exception as e:
        print(f"Preview test failed: {e}")
        results['preview'] = False

    # Test async submission
    try:
        results['async'] = await test_async_submission()
    except Exception as e:
        print(f"Async test failed: {e}")
        results['async'] = False

    # Test file upload
    try:
        results['upload'] = await test_file_upload()
    except Exception as e:
        print(f"Upload test failed: {e}")
        results['upload'] = False

    # Only test final generation if preview worked (to save time/credits)
    if results['preview']:
        try:
            results['final'] = await test_kling_v2_1_pro_final()
        except Exception as e:
            print(f"Final test failed: {e}")
            results['final'] = False
    else:
        print("\nSkipping final test due to preview failure")
        results['final'] = False

    # Summary
    print(f"\n" + "=" * 50)
    print("Test Results Summary:")
    print(f"Preview Generation: {'✅ PASS' if results['preview'] else '❌ FAIL'}")
    print(f"Async Submission: {'✅ PASS' if results['async'] else '❌ FAIL'}")
    print(f"File Upload: {'✅ PASS' if results['upload'] else '❌ FAIL'}")
    print(f"Final Generation: {'✅ PASS' if results['final'] else '❌ FAIL'}")

    passed = sum(results.values())
    total = len(results)
    print(f"\nOverall: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All Kling v2.1 Pro tests passed!")
        return True
    else:
        print("⚠️  Some tests failed. Check API key and network connectivity.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)