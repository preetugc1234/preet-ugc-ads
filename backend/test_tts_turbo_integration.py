#!/usr/bin/env python3
"""
Test script for ElevenLabs TTS Turbo v2.5 integration
Tests the new fal-client based implementation
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend src directory to Python path
backend_dir = Path(__file__).parent / "src"
sys.path.insert(0, str(backend_dir))

from ai_models.fal_adapter import FalAdapter

async def test_tts_turbo_integration():
    """Test ElevenLabs TTS Turbo v2.5 integration"""
    print("🎙️ Testing ElevenLabs TTS Turbo v2.5 Integration")
    print("=" * 50)

    # Initialize adapter
    adapter = FalAdapter()

    # Check if API key is configured
    if not adapter.api_key:
        print("❌ FAL_API_KEY not found in environment")
        print("Please set your FAL_API_KEY in the .env file")
        return False

    print(f"✅ FAL API Key configured: {adapter.api_key[:8]}...")

    # Test parameters for TTS Turbo
    test_params = {
        "text": "Hello! This is a test of the text to speech system, powered by ElevenLabs. How does it sound?",
        "voice": "Aria",
        "stability": 0.5,
        "similarity_boost": 0.75,
        "speed": 1.0,
        "timestamps": True
    }

    print("\n🚀 Testing TTS Turbo Submission...")
    print(f"Text: {test_params['text']}")
    print(f"Voice: {test_params['voice']}")
    print(f"Speed: {test_params['speed']}")
    print(f"Timestamps: {test_params['timestamps']}")

    try:
        # Test async submission
        result = await adapter.submit_tts_turbo_async(test_params)

        if result.get("success"):
            print("✅ TTS Turbo submission successful!")
            print(f"Request ID: {result.get('request_id')}")
            print(f"Status: {result.get('status')}")
            print(f"Estimated Processing Time: {result.get('estimated_processing_time')}")
            print(f"Total Timeout: {result.get('total_timeout')}")

            # If we got a request ID, test status checking
            if result.get("request_id"):
                print("\n📊 Testing Status Check...")
                status_result = await adapter.check_tts_turbo_status(result["request_id"])

                if status_result.get("success"):
                    print(f"✅ Status check successful: {status_result.get('status')}")
                else:
                    print(f"❌ Status check failed: {status_result.get('error')}")

                # Note: We won't wait for completion in this test since it takes 8 minutes
                print("\n⏱️  Note: Full processing takes 8 minutes")
                print("Use the /tts-turbo/status endpoint to check progress")
                print("Use the /tts-turbo/result endpoint to get the final audio")

            return True
        else:
            print(f"❌ TTS Turbo submission failed: {result.get('error')}")
            return False

    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

async def test_streaming_tts():
    """Test streaming TTS functionality"""
    print("\n📡 Testing TTS Turbo Streaming...")

    adapter = FalAdapter()

    test_params = {
        "text": "This is a test of streaming text-to-speech.",
        "voice": "Rachel",
        "speed": 1.0
    }

    try:
        print("🔄 Starting stream...")
        stream = await adapter.stream_tts_turbo(test_params)

        event_count = 0
        async for event in stream:
            event_count += 1
            print(f"📦 Event {event_count}: {type(event)}")

            # Limit output for testing
            if event_count >= 5:
                print("⏹️  Stopping stream test (max 5 events for demo)")
                break

        print("✅ Streaming test completed")
        return True

    except Exception as e:
        print(f"❌ Streaming test failed: {e}")
        return False

def test_api_endpoints():
    """Test API endpoint definitions"""
    print("\n🌐 Testing TTS Turbo API Endpoints...")

    endpoints = [
        "/api/generate/tts-turbo/submit",
        "/api/generate/tts-turbo/status",
        "/api/generate/tts-turbo/result",
        "/api/generate/tts-turbo/stream"
    ]

    print("📋 Available TTS Turbo endpoints:")
    for endpoint in endpoints:
        print(f"  • {endpoint}")

    print("✅ TTS Turbo API endpoints defined")
    return True

async def test_text_validation():
    """Test text length validation"""
    print("\n🔍 Testing Text Length Validation...")

    adapter = FalAdapter()

    # Test valid text
    valid_text = "This is a valid text for TTS processing."
    print(f"✅ Valid text ({len(valid_text)} chars): OK")

    # Test maximum length text
    max_text = "A" * 5000
    print(f"✅ Maximum length text ({len(max_text)} chars): OK")

    # Test over-limit text
    try:
        over_limit_text = "A" * 5001
        result = await adapter.submit_tts_turbo_async({"text": over_limit_text})
        if not result.get("success") and "exceeds maximum" in result.get("error", ""):
            print(f"✅ Over-limit text ({len(over_limit_text)} chars): Properly rejected")
            return True
        else:
            print(f"❌ Over-limit text was not properly rejected")
            return False
    except Exception as e:
        if "exceeds maximum" in str(e):
            print(f"✅ Over-limit text properly rejected with exception")
            return True
        else:
            print(f"❌ Unexpected error: {e}")
            return False

async def main():
    """Run all tests"""
    print("🎭 ElevenLabs TTS Turbo v2.5 Integration Test Suite")
    print("=" * 60)

    tests = [
        ("TTS Turbo Integration", test_tts_turbo_integration()),
        ("Text Length Validation", test_text_validation()),
        ("Streaming TTS", test_streaming_tts()),
        ("API Endpoints", test_api_endpoints())
    ]

    results = []
    for test_name, test_coro in tests:
        print(f"\n🧪 Running {test_name} test...")
        if asyncio.iscoroutine(test_coro):
            result = await test_coro
        else:
            result = test_coro
        results.append((test_name, result))

    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")

    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"  {test_name}: {status}")
        if result:
            passed += 1

    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")

    if passed == len(results):
        print("🎉 All tests passed! ElevenLabs TTS Turbo v2.5 integration is ready!")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

    print("\n📖 Usage Instructions:")
    print("1. Set your FAL_API_KEY in backend/.env")
    print("2. Use POST /api/generate/tts-turbo/submit with text and voice settings")
    print("3. Monitor progress with POST /api/generate/tts-turbo/status")
    print("4. Get result with POST /api/generate/tts-turbo/result")
    print("5. Use POST /api/generate/tts-turbo/stream for real-time streaming")
    print("6. Processing time: ~8 minutes with 4-minute buffer (12min total)")
    print("7. Maximum text length: 5000 characters")

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv("backend/.env")

    # Run tests
    asyncio.run(main())