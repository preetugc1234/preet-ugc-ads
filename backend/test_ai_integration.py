"""
Test script for AI model integration
Tests all 6 AI workflows with real model adapters
"""

import asyncio
import sys
import os
import time
from typing import Dict, Any

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from ai_models.openrouter_adapter import OpenRouterAdapter
from ai_models.fal_adapter import FalAdapter
from ai_models.asset_handler import AssetHandler

async def test_openrouter_chat():
    """Test OpenRouter chat functionality."""
    print("Testing OpenRouter Chat (GPT-4o mini)...")

    adapter = OpenRouterAdapter()

    # Test preview generation
    print("  1. Testing chat preview...")
    preview_params = {
        "prompt": "Explain quantum computing in simple terms"
    }

    preview_result = await adapter.generate_chat_preview(preview_params)
    print(f"     Preview success: {preview_result.get('success', False)}")
    if preview_result.get('success'):
        print(f"     Preview content length: {len(preview_result.get('content', ''))}")
        print(f"     Tokens used: {preview_result.get('tokens_used', 0)}")

    # Test final generation
    print("  2. Testing chat final...")
    final_params = {
        "prompt": "Provide a comprehensive guide to machine learning for beginners",
        "conversation_history": [
            {"role": "user", "content": "I'm new to AI"},
            {"role": "assistant", "content": "I'd be happy to help you learn about AI!"}
        ]
    }

    final_result = await adapter.generate_chat_final(final_params)
    print(f"     Final success: {final_result.get('success', False)}")
    if final_result.get('success'):
        print(f"     Final content length: {len(final_result.get('content', ''))}")
        print(f"     Tokens used: {final_result.get('tokens_used', 0)}")

    return preview_result.get('success', False) and final_result.get('success', False)

async def test_openrouter_image():
    """Test OpenRouter image prompt enhancement."""
    print("Testing OpenRouter Image (Gemini 2.5 Flash)...")

    adapter = OpenRouterAdapter()

    # Test preview generation
    print("  1. Testing image preview...")
    preview_params = {
        "prompt": "A majestic dragon soaring through cloudy skies"
    }

    preview_result = await adapter.generate_image_preview(preview_params)
    print(f"     Preview success: {preview_result.get('success', False)}")
    if preview_result.get('success'):
        print(f"     Enhanced prompt length: {len(preview_result.get('enhanced_prompt', ''))}")
        print(f"     Tokens used: {preview_result.get('tokens_used', 0)}")

    # Test final generation
    print("  2. Testing image final...")
    final_params = {
        "prompt": "A futuristic cityscape at sunset with flying cars",
        "style": "cyberpunk",
        "aspect_ratio": "16:9",
        "quality": "high"
    }

    final_result = await adapter.generate_image_final(final_params)
    print(f"     Final success: {final_result.get('success', False)}")
    if final_result.get('success'):
        print(f"     Enhanced prompt length: {len(final_result.get('enhanced_prompt', ''))}")
        print(f"     Style: {final_result.get('style', 'N/A')}")
        print(f"     Tokens used: {final_result.get('tokens_used', 0)}")

    return preview_result.get('success', False) and final_result.get('success', False)

async def test_fal_tts():
    """Test Fal AI Text-to-Speech."""
    print("Testing Fal AI TTS...")

    adapter = FalAdapter()

    # Test preview generation
    print("  1. Testing TTS preview...")
    preview_params = {
        "text": "Hello, this is a short test message for preview generation.",
        "voice": "Rachel"
    }

    preview_result = await adapter.generate_tts_preview(preview_params)
    print(f"     Preview success: {preview_result.get('success', False)}")
    if preview_result.get('success'):
        print(f"     Audio URL available: {bool(preview_result.get('audio_url'))}")
        print(f"     Voice: {preview_result.get('voice', 'N/A')}")

    # Test final generation
    print("  2. Testing TTS final...")
    final_params = {
        "text": "Welcome to our UGC AI platform! This is a comprehensive text-to-speech demonstration showcasing high-quality voice synthesis with natural intonation and clear pronunciation.",
        "voice": "Adam",
        "model": "eleven_multilingual_v2"
    }

    final_result = await adapter.generate_tts_final(final_params)
    print(f"     Final success: {final_result.get('success', False)}")
    if final_result.get('success'):
        print(f"     Audio URL available: {bool(final_result.get('audio_url'))}")
        print(f"     Duration: {final_result.get('duration', 0)} seconds")
        print(f"     Voice: {final_result.get('voice', 'N/A')}")

    return preview_result.get('success', False) and final_result.get('success', False)

async def test_fal_video():
    """Test Fal AI video generation."""
    print("Testing Fal AI Video Generation...")

    adapter = FalAdapter()

    # Test image-to-video without audio
    print("  1. Testing image-to-video (no audio)...")
    img2vid_params = {
        "image_url": "https://picsum.photos/1024/576",  # Sample image
        "duration_seconds": 5,
        "aspect_ratio": "16:9"
    }

    img2vid_result = await adapter.generate_img2vid_noaudio_preview(img2vid_params)
    print(f"     Image-to-video success: {img2vid_result.get('success', False)}")
    if img2vid_result.get('success'):
        print(f"     Video URL available: {bool(img2vid_result.get('video_url'))}")
        print(f"     Duration: {img2vid_result.get('duration', 0)} seconds")

    # Test image-to-video with audio
    print("  2. Testing image-to-video (with audio)...")
    img2vid_audio_params = {
        "image_url": "https://picsum.photos/1024/576",
        "duration_seconds": 5,
        "aspect_ratio": "16:9",
        "audio_prompt": "Peaceful nature sounds"
    }

    img2vid_audio_result = await adapter.generate_img2vid_audio_preview(img2vid_audio_params)
    print(f"     Image-to-video (audio) success: {img2vid_audio_result.get('success', False)}")
    if img2vid_audio_result.get('success'):
        print(f"     Video URL available: {bool(img2vid_audio_result.get('video_url'))}")
        print(f"     Has audio: {img2vid_audio_result.get('has_audio', False)}")

    # Test audio-to-video (UGC)
    print("  3. Testing audio-to-video (UGC)...")
    audio2vid_params = {
        "audio_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        "prompt": "A person speaking enthusiastically about technology",
        "duration_seconds": 30
    }

    audio2vid_result = await adapter.generate_audio2vid_preview(audio2vid_params)
    print(f"     Audio-to-video success: {audio2vid_result.get('success', False)}")
    if audio2vid_result.get('success'):
        print(f"     Video URL available: {bool(audio2vid_result.get('video_url'))}")
        print(f"     Duration: {audio2vid_result.get('duration', 0)} seconds")

    return (img2vid_result.get('success', False) and
            img2vid_audio_result.get('success', False) and
            audio2vid_result.get('success', False))

async def test_asset_handler():
    """Test asset handler functionality."""
    print("Testing Asset Handler...")

    handler = AssetHandler()

    # Test configuration
    config = handler.get_cloudinary_config()
    print(f"  Cloudinary configured: {config.get('configured', False)}")
    print(f"  Cloud name: {config.get('cloud_name', 'Not set')}")

    # Test chat result handling
    print("  1. Testing chat result handling...")
    chat_result = {
        "success": True,
        "content": "This is a test chat response from GPT-4o mini.",
        "model": "gpt-4o-mini",
        "tokens_used": 25
    }

    chat_asset = await handler.handle_chat_result(chat_result, "test-job-123", "test-user-456", True)
    print(f"     Chat asset success: {chat_asset.get('success', False)}")
    if chat_asset.get('success'):
        print(f"     Asset type: {chat_asset.get('asset_data', {}).get('type', 'N/A')}")
        print(f"     Content length: {len(chat_asset.get('asset_data', {}).get('content', ''))}")

    # Test image result handling
    print("  2. Testing image result handling...")
    image_result = {
        "success": True,
        "enhanced_prompt": "A highly detailed cyberpunk cityscape with neon lights reflecting on wet streets, shot with professional cinematography, 8K resolution, dramatic lighting",
        "original_prompt": "cyberpunk city",
        "style": "cyberpunk",
        "aspect_ratio": "16:9",
        "model": "gemini-2.5-flash",
        "tokens_used": 45
    }

    image_asset = await handler.handle_image_result(image_result, "test-job-124", "test-user-456", False)
    print(f"     Image asset success: {image_asset.get('success', False)}")
    if image_asset.get('success'):
        print(f"     Asset type: {image_asset.get('asset_data', {}).get('type', 'N/A')}")
        print(f"     File URLs count: {len(image_asset.get('urls', []))}")

    return chat_asset.get('success', False) and image_asset.get('success', False)

async def main():
    """Run all AI integration tests."""
    print("AI Model Integration Test Suite")
    print("=" * 50)

    # Environment checks
    print("Environment Checks:")
    print(f"  OpenRouter API Key: {'Set' if os.getenv('OPENROUTER_API_KEY') else 'Not Set'}")
    print(f"  Fal API Key: {'Set' if os.getenv('FAL_API_KEY') else 'Not Set'}")
    print(f"  Cloudinary Cloud Name: {'Set' if os.getenv('CLOUDINARY_CLOUD_NAME') else 'Not Set'}")
    print()

    results = {}

    # Test OpenRouter integrations
    try:
        results['openrouter_chat'] = await test_openrouter_chat()
        print()
    except Exception as e:
        print(f"OpenRouter Chat test failed: {e}")
        results['openrouter_chat'] = False
        print()

    try:
        results['openrouter_image'] = await test_openrouter_image()
        print()
    except Exception as e:
        print(f"OpenRouter Image test failed: {e}")
        results['openrouter_image'] = False
        print()

    # Test Fal AI integrations
    try:
        results['fal_tts'] = await test_fal_tts()
        print()
    except Exception as e:
        print(f"Fal TTS test failed: {e}")
        results['fal_tts'] = False
        print()

    try:
        results['fal_video'] = await test_fal_video()
        print()
    except Exception as e:
        print(f"Fal Video test failed: {e}")
        results['fal_video'] = False
        print()

    # Test asset handler
    try:
        results['asset_handler'] = await test_asset_handler()
        print()
    except Exception as e:
        print(f"Asset Handler test failed: {e}")
        results['asset_handler'] = False
        print()

    # Summary
    print("Test Results Summary:")
    print("=" * 30)
    passed = 0
    total = len(results)

    for test_name, success in results.items():
        status = "PASS" if success else "FAIL"
        print(f"  {test_name}: {status}")
        if success:
            passed += 1

    print(f"\nOverall: {passed}/{total} tests passed")

    if passed == total:
        print("All AI integration tests completed successfully!")
        return True
    else:
        print("Some tests failed. Check configuration and API keys.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)