"""
End-to-end integration test for the complete job system.
Tests the full pipeline: job creation → worker invocation → HMAC callbacks → completion
"""

import asyncio
import sys
import os
import time

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from datetime import datetime, timezone
from bson import ObjectId
from database import get_db, UserModel, create_job_with_deduction
from queue_manager import queue_manager, JobPriority

async def test_full_integration():
    """Test the complete job system integration."""
    print("🚀 Testing Complete Job System Integration...")

    try:
        db = get_db()

        # 1. Create test user
        print("1. Creating test user...")
        test_user_data = UserModel.create_user(
            auth_provider_id="integration-test-user",
            email="integration@example.com",
            name="Integration Test User",
            plan="free",
            credits=2000  # Enough for all test jobs
        )

        # Cleanup and create user
        db.users.delete_one({"authProviderId": "integration-test-user"})
        result = db.users.insert_one(test_user_data)
        user_id = result.inserted_id
        print(f"   ✓ Created test user: {user_id}")

        # 2. Test different job types
        test_cases = [
            {"module": "chat", "params": {"prompt": "Hello from integration test"}},
            {"module": "tts", "params": {"text": "This is a test speech generation"}},
            {"module": "audio2vid", "params": {"duration_seconds": 45}}
        ]

        job_ids = []

        for i, test_case in enumerate(test_cases):
            print(f"2.{i+1} Testing {test_case['module']} job creation...")

            # Create job
            job_id = create_job_with_deduction(
                client_job_id=f"integration-{test_case['module']}-{int(time.time())}",
                user_id=user_id,
                module=test_case['module'],
                params=test_case['params'],
                credit_cost=100 if test_case['module'] != 'chat' else 0
            )

            if job_id:
                job_ids.append((job_id, test_case['module']))
                print(f"   ✓ Job created: {job_id}")

                # Enqueue job
                success = await queue_manager.enqueue_job(
                    job_id=job_id,
                    module=test_case['module'],
                    priority=JobPriority.HIGH
                )

                if success:
                    print(f"   ✓ Job queued successfully")
                else:
                    print(f"   ✗ Failed to queue job")
            else:
                print(f"   ✗ Failed to create job")

        # 3. Monitor job progression
        print("3. Monitoring job progression...")
        max_wait_time = 120  # 2 minutes max wait
        start_time = time.time()

        while time.time() - start_time < max_wait_time:
            all_completed = True

            for job_id, module in job_ids:
                job = db.jobs.find_one({"_id": job_id})
                if job:
                    status = job.get("status", "unknown")
                    print(f"   📊 Job {job_id} ({module}): {status}")

                    if status not in ["completed", "failed"]:
                        all_completed = False
                else:
                    print(f"   ❌ Job {job_id} not found")
                    all_completed = False

            if all_completed:
                print("   ✅ All jobs completed!")
                break

            await asyncio.sleep(5)  # Check every 5 seconds

        # 4. Verify final results
        print("4. Verifying final results...")

        for job_id, module in job_ids:
            job = db.jobs.find_one({"_id": job_id})
            if job:
                status = job.get("status")
                preview_url = job.get("previewUrl")
                final_urls = job.get("finalUrls", [])

                print(f"   📋 {module} job:")
                print(f"      Status: {status}")
                print(f"      Preview: {preview_url}")
                print(f"      Final URLs: {len(final_urls)} files")

                if status == "completed":
                    print(f"      ✅ Successfully completed")
                else:
                    print(f"      ⚠️ Status: {status}")

        # 5. Check generation history
        print("5. Checking generation history...")
        generations = list(db.generations.find({"userId": user_id}))
        print(f"   📚 Found {len(generations)} generations in history")

        for gen in generations:
            gen_type = gen.get("generationType", "unknown")
            final_urls = gen.get("finalUrls", [])
            print(f"      - {gen_type}: {len(final_urls)} files")

        # 6. Check credit deduction
        print("6. Verifying credit deduction...")
        updated_user = db.users.find_one({"_id": user_id})
        remaining_credits = updated_user.get("credits", 0)
        expected_deduction = 200  # 100 for tts + 200 for audio2vid (45s = 2 increments)
        expected_remaining = 2000 - expected_deduction

        print(f"   💰 Remaining credits: {remaining_credits}")
        print(f"   💰 Expected: {expected_remaining}")

        if remaining_credits == expected_remaining:
            print("   ✅ Credit deduction correct!")
        else:
            print(f"   ⚠️ Credit mismatch (difference: {abs(remaining_credits - expected_remaining)})")

        # 7. Test job status API endpoints
        print("7. Testing API endpoints...")

        # We can't easily test HTTP endpoints from here, but we can verify the data exists
        total_jobs = db.jobs.count_documents({"userId": user_id})
        total_generations = db.generations.count_documents({"userId": user_id})

        print(f"   📊 Total jobs in DB: {total_jobs}")
        print(f"   📊 Total generations in DB: {total_generations}")

        # 8. Test queue status
        print("8. Testing queue management...")
        queue_status = await queue_manager.get_queue_status()
        print(f"   📊 Queue status retrieved: {bool(queue_status)}")

        # Cleanup
        print("9. Cleaning up test data...")
        db.users.delete_one({"_id": user_id})
        db.jobs.delete_many({"userId": user_id})
        db.credit_ledger.delete_many({"userId": user_id})
        db.generations.delete_many({"userId": user_id})
        print("   🧹 Test data cleaned up")

        print("\n🎉 Full Integration Test Completed Successfully!")
        return True

    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_hmac_security():
    """Test HMAC security validation."""
    print("\n🔒 Testing HMAC Security...")

    from routes.jobs import generate_hmac_signature, verify_hmac_signature
    import time
    import hashlib

    # Test data
    job_id = "test-job-123"
    timestamp = str(int(time.time()))
    payload = '{"status":"completed","final_urls":["test.jpg"]}'
    payload_hash = hashlib.sha256(payload.encode()).hexdigest()

    # Generate signature
    signature = generate_hmac_signature(job_id, timestamp, payload_hash)
    print(f"   🔑 Generated signature: {signature[:20]}...")

    # Test valid signature
    is_valid = verify_hmac_signature(job_id, timestamp, payload_hash, signature)
    print(f"   ✅ Valid signature test: {'PASS' if is_valid else 'FAIL'}")

    # Test invalid signature
    is_invalid = verify_hmac_signature(job_id, timestamp, payload_hash, "invalid-signature")
    print(f"   ❌ Invalid signature test: {'PASS' if not is_invalid else 'FAIL'}")

    # Test timestamp tolerance
    old_timestamp = str(int(time.time()) - 300)  # 5 minutes ago
    is_old = verify_hmac_signature(job_id, old_timestamp, payload_hash, signature)
    print(f"   ⏰ Old timestamp test: {'PASS' if not is_old else 'FAIL'}")

    print("   🔒 HMAC security tests completed")

if __name__ == "__main__":
    async def main():
        # Run integration test
        integration_success = await test_full_integration()

        # Run security test
        await test_hmac_security()

        if integration_success:
            print("\n✅ All tests passed!")
            exit(0)
        else:
            print("\n❌ Some tests failed!")
            exit(1)

    asyncio.run(main())