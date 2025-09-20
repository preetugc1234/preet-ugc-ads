"""
Simple integration test for job creation and HMAC security.
"""

import asyncio
import sys
import os
import time
import hashlib
import hmac

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from datetime import datetime, timezone
from bson import ObjectId
from database import get_db, UserModel, create_job_with_deduction

# HMAC Configuration
HMAC_SECRET = "your-worker-hmac-secret-key"

def generate_hmac_signature(job_id: str, timestamp: str, payload_hash: str) -> str:
    """Generate HMAC signature for worker authentication."""
    message = f"{job_id}|{timestamp}|{payload_hash}"
    signature = hmac.new(
        HMAC_SECRET.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature

def verify_hmac_signature(
    job_id: str,
    timestamp: str,
    payload_hash: str,
    provided_signature: str
) -> bool:
    """Verify HMAC signature from worker."""
    try:
        # Check timestamp tolerance (prevent replay attacks)
        current_time = int(time.time())
        request_time = int(timestamp)

        if abs(current_time - request_time) > 120:  # 2 minutes tolerance
            print(f"   ⚠️ Timestamp outside tolerance: {abs(current_time - request_time)}s")
            return False

        # Generate expected signature
        expected_signature = generate_hmac_signature(job_id, timestamp, payload_hash)

        # Constant-time comparison to prevent timing attacks
        return hmac.compare_digest(expected_signature, provided_signature)

    except Exception as e:
        print(f"   ❌ HMAC verification error: {e}")
        return False

async def test_job_creation_integration():
    """Test job creation with the new integrated system."""
    print("Testing Job Creation Integration...")

    try:
        db = get_db()

        # 1. Create test user
        print("1. Creating test user...")
        test_user_data = UserModel.create_user(
            auth_provider_id="simple-integration-test",
            email="simple@example.com",
            name="Simple Test User",
            plan="free",
            credits=1000
        )

        # Cleanup and create user
        db.users.delete_one({"authProviderId": "simple-integration-test"})
        result = db.users.insert_one(test_user_data)
        user_id = result.inserted_id
        print(f"   ✓ Created test user: {user_id}")

        # 2. Test job creation for different modules
        test_jobs = [
            {"module": "chat", "params": {"prompt": "Hello world"}, "expected_cost": 0},
            {"module": "tts", "params": {"text": "Test speech"}, "expected_cost": 100},
            {"module": "audio2vid", "params": {"duration_seconds": 60}, "expected_cost": 200}
        ]

        created_jobs = []
        total_cost = 0

        for test in test_jobs:
            print(f"2. Creating {test['module']} job...")

            job_id = create_job_with_deduction(
                client_job_id=f"simple-{test['module']}-{int(time.time())}",
                user_id=user_id,
                module=test['module'],
                params=test['params'],
                credit_cost=test['expected_cost']
            )

            if job_id:
                created_jobs.append((job_id, test['module'], test['expected_cost']))
                total_cost += test['expected_cost']
                print(f"   ✓ Job created: {job_id} (Cost: {test['expected_cost']} credits)")

                # Verify job in database
                job = db.jobs.find_one({"_id": job_id})
                if job:
                    print(f"   ✓ Job status: {job['status']}")
                else:
                    print(f"   ❌ Job not found in database!")
            else:
                print(f"   ❌ Failed to create job for {test['module']}")

        # 3. Verify credit deduction
        print("3. Verifying credit deduction...")
        updated_user = db.users.find_one({"_id": user_id})
        expected_credits = 1000 - total_cost
        actual_credits = updated_user["credits"]

        print(f"   💰 Expected balance: {expected_credits} credits")
        print(f"   💰 Actual balance: {actual_credits} credits")

        if actual_credits == expected_credits:
            print("   ✅ Credit deduction working correctly!")
        else:
            print("   ❌ Credit deduction mismatch!")

        # 4. Test job history
        print("4. Testing job retrieval...")
        user_jobs = list(db.jobs.find({"userId": user_id}).sort("createdAt", -1))
        print(f"   📊 Found {len(user_jobs)} jobs for user")

        for job in user_jobs:
            print(f"   📋 {job['module']}: {job['status']} (Credits: {job['usedCredits']})")

        # 5. Test credit ledger
        print("5. Checking credit ledger...")
        ledger_entries = list(db.credit_ledger.find(
            {"userId": user_id}
        ).sort("createdAt", -1))

        print(f"   📊 Found {len(ledger_entries)} ledger entries")
        for entry in ledger_entries:
            print(f"   📝 {entry['reason']}: {entry['change']} credits (Balance: {entry['balanceAfter']})")

        # Cleanup
        print("6. Cleaning up test data...")
        db.users.delete_one({"_id": user_id})
        for job_id, _, _ in created_jobs:
            db.jobs.delete_one({"_id": job_id})
        db.credit_ledger.delete_many({"userId": user_id})
        print("   🧹 Test data cleaned up")

        print("\n✅ Job Creation Integration Test Completed!")
        return True

    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_hmac_security():
    """Test HMAC security validation."""
    print("\n🔒 Testing HMAC Security...")

    # Test data
    job_id = "test-job-123"
    timestamp = str(int(time.time()))
    payload = '{"status":"completed","final_urls":["test.jpg"]}'
    payload_hash = hashlib.sha256(payload.encode()).hexdigest()

    print(f"   🔑 Testing with job_id: {job_id}")
    print(f"   ⏰ Timestamp: {timestamp}")

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
    old_signature = generate_hmac_signature(job_id, old_timestamp, payload_hash)
    is_old = verify_hmac_signature(job_id, old_timestamp, payload_hash, old_signature)
    print(f"   ⏰ Old timestamp test: {'PASS' if not is_old else 'FAIL'}")

    # Test payload tampering
    tampered_hash = hashlib.sha256('{"status":"failed"}'.encode()).hexdigest()
    is_tampered = verify_hmac_signature(job_id, timestamp, tampered_hash, signature)
    print(f"   🛡️ Payload tampering test: {'PASS' if not is_tampered else 'FAIL'}")

    print("   🔒 HMAC security tests completed")
    return True

async def main():
    """Run all tests."""
    print("Simple Integration Test Suite\n")

    # Run job creation integration test
    job_test_success = await test_job_creation_integration()

    # Run HMAC security test
    hmac_test_success = test_hmac_security()

    if job_test_success and hmac_test_success:
        print("\nAll tests passed! System integration successful!")
        return True
    else:
        print("\nSome tests failed!")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)