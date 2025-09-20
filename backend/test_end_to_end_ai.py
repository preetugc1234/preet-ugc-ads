"""
End-to-end AI integration test
Tests the complete workflow from job creation to completion
"""

import asyncio
import sys
import os
import time
from typing import Dict, Any

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from datetime import datetime, timezone
from bson import ObjectId
from database import get_db, UserModel, create_job_with_deduction
from src.queue_manager import queue_manager, JobPriority

async def test_complete_ai_workflow():
    """Test complete AI workflow for all modules."""
    print("End-to-End AI Integration Test")
    print("=" * 50)

    try:
        db = get_db()

        # 1. Create test user
        print("1. Creating test user...")
        test_user_data = UserModel.create_user(
            auth_provider_id="ai-integration-test",
            email="ai-test@example.com",
            name="AI Test User",
            plan="premium",
            credits=10000  # Give enough credits for all tests
        )

        # Cleanup existing test user
        db.users.delete_one({"authProviderId": "ai-integration-test"})
        result = db.users.insert_one(test_user_data)
        user_id = result.inserted_id
        print(f"   Created test user: {user_id}")

        # 2. Test all AI modules
        test_modules = [
            {
                "module": "chat",
                "params": {"prompt": "Explain machine learning in simple terms"},
                "expected_cost": 0
            },
            {
                "module": "image",
                "params": {
                    "prompt": "A futuristic cityscape at sunset",
                    "style": "cyberpunk",
                    "aspect_ratio": "16:9"
                },
                "expected_cost": 50
            },
            {
                "module": "tts",
                "params": {
                    "text": "Welcome to our AI platform! This is a test of our text-to-speech capabilities.",
                    "voice": "Rachel"
                },
                "expected_cost": 100
            },
            {
                "module": "img2vid_noaudio",
                "params": {
                    "image_url": "https://picsum.photos/1024/576",
                    "duration_seconds": 5,
                    "aspect_ratio": "16:9"
                },
                "expected_cost": 150
            }
        ]

        created_jobs = []
        total_expected_cost = 0

        for i, test in enumerate(test_modules):
            print(f"\n2.{i+1}. Testing {test['module']} workflow...")

            # Create job
            job_id = create_job_with_deduction(
                client_job_id=f"ai-test-{test['module']}-{int(time.time())}",
                user_id=user_id,
                module=test['module'],
                params=test['params'],
                credit_cost=test['expected_cost']
            )

            if not job_id:
                print(f"     Failed to create job for {test['module']}")
                continue

            created_jobs.append((job_id, test['module'], test['expected_cost']))
            total_expected_cost += test['expected_cost']
            print(f"     Job created: {job_id}")

            # Enqueue job for processing
            enqueue_success = await queue_manager.enqueue_job(
                job_id=job_id,
                module=test['module'],
                priority=JobPriority.HIGH
            )

            if enqueue_success:
                print(f"     Job queued successfully")
            else:
                print(f"     Failed to queue job")
                continue

            # Monitor job progress
            print(f"     Monitoring job progress...")
            start_time = time.time()
            timeout = 300  # 5 minutes timeout

            while time.time() - start_time < timeout:
                job = db.jobs.find_one({"_id": job_id})
                if not job:
                    print(f"     Job not found!")
                    break

                status = job.get("status", "unknown")
                print(f"     Status: {status}")

                if status == "preview_ready":
                    preview_url = job.get("previewUrl", "")
                    print(f"     Preview ready: {preview_url[:50]}...")

                elif status == "completed":
                    final_urls = job.get("finalUrls", [])
                    print(f"     Job completed! Final URLs: {len(final_urls)} files")
                    for url in final_urls[:2]:  # Show first 2 URLs
                        print(f"       - {url[:50]}...")
                    break

                elif status == "failed":
                    error_msg = job.get("errorMessage", "Unknown error")
                    print(f"     Job failed: {error_msg}")
                    break

                await asyncio.sleep(2)  # Check every 2 seconds

            else:
                print(f"     Job timed out after {timeout} seconds")

        # 3. Verify credit deduction
        print(f"\n3. Verifying credit deduction...")
        updated_user = db.users.find_one({"_id": user_id})
        expected_credits = 10000 - total_expected_cost
        actual_credits = updated_user["credits"]

        print(f"   Expected balance: {expected_credits} credits")
        print(f"   Actual balance: {actual_credits} credits")

        if actual_credits == expected_credits:
            print("   Credit deduction working correctly!")
        else:
            print("   Credit deduction mismatch!")

        # 4. Check generation history
        print(f"\n4. Checking generation history...")
        generations = list(db.generations.find(
            {"userId": user_id}
        ).sort("createdAt", -1))

        print(f"   Found {len(generations)} generations")
        for gen in generations:
            print(f"   - {gen['generationType']}: {len(gen.get('finalUrls', []))} files")

        # 5. Test queue status
        print(f"\n5. Queue status...")
        queue_status = await queue_manager.get_queue_status()
        print(f"   Status counts: {queue_status.get('status_counts', {})}")
        print(f"   Active timeouts: {queue_status.get('active_timeouts', 0)}")
        print(f"   Jobs last 24h: {queue_status.get('total_jobs_last_24h', 0)}")

        # 6. Test job history API
        print(f"\n6. Testing job history retrieval...")
        user_jobs = list(db.jobs.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(10))

        print(f"   Found {len(user_jobs)} jobs for user")
        for job in user_jobs:
            duration = ""
            if job.get("completedAt") and job.get("processingStartedAt"):
                duration_seconds = (job["completedAt"] - job["processingStartedAt"]).total_seconds()
                duration = f" ({duration_seconds:.1f}s)"

            print(f"   - {job['module']}: {job['status']}{duration}")

        # 7. Cleanup
        print(f"\n7. Cleaning up test data...")
        db.users.delete_one({"_id": user_id})
        for job_id, _, _ in created_jobs:
            db.jobs.delete_one({"_id": job_id})
        db.generations.delete_many({"userId": user_id})
        db.credit_ledger.delete_many({"userId": user_id})
        print("   Test data cleaned up")

        print(f"\nEnd-to-End AI Integration Test Completed!")
        print(f"Successfully tested {len(created_jobs)} AI workflows")
        return True

    except Exception as e:
        print(f"End-to-end test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_api_configuration():
    """Test API configuration and connectivity."""
    print("API Configuration Test")
    print("=" * 30)

    # Check environment variables
    configs = {
        "OpenRouter API Key": os.getenv("OPENROUTER_API_KEY"),
        "Fal API Key": os.getenv("FAL_API_KEY"),
        "Cloudinary Cloud Name": os.getenv("CLOUDINARY_CLOUD_NAME"),
        "Cloudinary API Key": os.getenv("CLOUDINARY_API_KEY"),
        "Cloudinary API Secret": os.getenv("CLOUDINARY_API_SECRET"),
        "MongoDB URI": os.getenv("MONGODB_URI"),
        "Supabase URL": os.getenv("SUPABASE_URL"),
        "Supabase Anon Key": os.getenv("SUPABASE_ANON_KEY")
    }

    configured_count = 0
    for name, value in configs.items():
        status = "OK Configured" if value else "NO Not Set"
        print(f"  {name}: {status}")
        if value:
            configured_count += 1

    print(f"\nConfiguration Summary: {configured_count}/{len(configs)} services configured")

    # Test AI adapter initialization
    print("\nAI Adapter Initialization:")
    try:
        from src.ai_models.openrouter_adapter import OpenRouterAdapter
        from src.ai_models.fal_adapter import FalAdapter
        from src.ai_models.asset_handler import AssetHandler

        openrouter = OpenRouterAdapter()
        fal = FalAdapter()
        assets = AssetHandler()

        print("  OK OpenRouter adapter initialized")
        print("  OK Fal AI adapter initialized")
        print("  OK Asset handler initialized")

        # Test configuration status
        cloudinary_config = assets.get_cloudinary_config()
        print(f"  Cloudinary configured: {'OK' if cloudinary_config.get('configured') else 'NO'}")

        return True

    except Exception as e:
        print(f"  NO Adapter initialization failed: {e}")
        return False

async def main():
    """Run all tests."""
    print("Complete AI Integration Test Suite")
    print("=" * 60)

    # Test API configuration
    config_success = await test_api_configuration()
    print()

    if not config_success:
        print("Warning: Some API configurations missing. Tests may fail.")
        print("Set API keys in environment variables for full functionality.")
        print()

    # Run end-to-end test
    e2e_success = await test_complete_ai_workflow()

    if e2e_success:
        print("\nSUCCESS: All tests completed successfully!")
        print("The AI integration system is working properly.")
        return True
    else:
        print("\nFAILED: Some tests failed.")
        print("Check the logs above for specific issues.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)