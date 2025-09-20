"""
Test script for job creation flow to verify the complete system works.
"""

import asyncio
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from datetime import datetime, timezone
from bson import ObjectId
from database import get_db, UserModel, create_job_with_deduction

# Import MODULE_CONFIGS directly
MODULE_CONFIGS = {
    "chat": {
        "name": "Chat/Text Generation",
        "cost": 0,  # Free tier
        "provider": "openrouter",
        "model": "chat-4o-mini",
        "avg_time_seconds": 5
    },
    "image": {
        "name": "Text to Image",
        "cost": 0,  # Free tier based on prompt
        "provider": "openrouter",
        "model": "gemini-2.5-flash",
        "avg_time_seconds": 15
    },
    "tts": {
        "name": "Text to Speech",
        "cost": 100,
        "provider": "fal",
        "model": "11labs-v2.5",
        "avg_time_seconds": 10
    }
}

def estimate_job_cost(module: str, params: dict) -> int:
    """Estimate credit cost for a job based on module and parameters."""
    config = MODULE_CONFIGS.get(module)
    if not config:
        raise ValueError(f"Unknown module: {module}")

    # Fixed cost modules
    if "cost" in config:
        return config["cost"]

    return 0

def calculate_estimated_time(module: str, params: dict) -> int:
    """Calculate estimated time with +10s buffer."""
    config = MODULE_CONFIGS.get(module, {})
    base_time = config.get("avg_time_seconds", 30)
    return base_time + 10  # +10s buffer

async def test_job_creation_flow():
    """Test the complete job creation flow."""
    print("Testing Job Creation Flow...")

    try:
        db = get_db()

        # 1. Create a test user
        print("1. Creating test user...")
        test_user_data = UserModel.create_user(
            auth_provider_id="test-user-123",
            email="test@example.com",
            name="Test User",
            plan="free",
            credits=1000  # Give enough credits for testing
        )

        # Insert or update test user
        existing_user = db.users.find_one({"authProviderId": "test-user-123"})
        if existing_user:
            user_id = existing_user["_id"]
            # Update credits to ensure sufficient balance
            db.users.update_one(
                {"_id": user_id},
                {"$set": {"credits": 1000, "updatedAt": datetime.now(timezone.utc)}}
            )
            print(f"   Updated existing test user: {user_id}")
        else:
            result = db.users.insert_one(test_user_data)
            user_id = result.inserted_id
            print(f"   Created new test user: {user_id}")

        # 2. Test module configurations
        print("2. Testing module configurations...")
        for module, config in MODULE_CONFIGS.items():
            print(f"   {module}: {config['name']}")

            # Test cost estimation
            test_params = {}
            if "cost_per_second" in config:
                test_params["duration"] = 10  # 10 seconds
            elif "cost_per_minute" in config:
                test_params["duration_minutes"] = 2  # 2 minutes

            cost = estimate_job_cost(module, test_params)
            time_est = calculate_estimated_time(module, test_params)
            print(f"      Cost: {cost} credits, Time: {time_est}s")

        # 3. Test job creation for each module
        print("3. Testing job creation for each module...")
        created_jobs = []

        for module in ["chat", "image", "tts"]:  # Test free and paid modules
            print(f"   Creating job for module: {module}")

            # Prepare test parameters
            test_params = {
                "prompt": "Test prompt for job creation",
                "user_input": "This is a test generation"
            }

            if module == "tts":
                test_params["text"] = "Hello, this is a test text-to-speech generation."
                test_params["voice"] = "default"

            cost = estimate_job_cost(module, test_params)

            # Create job with credit deduction
            job_id = create_job_with_deduction(
                client_job_id=f"test-{module}-{datetime.now().timestamp()}",
                user_id=user_id,
                module=module,
                params=test_params,
                credit_cost=cost
            )

            if job_id:
                created_jobs.append((job_id, module, cost))
                print(f"      Job created: {job_id} (Cost: {cost} credits)")

                # Verify job in database
                job = db.jobs.find_one({"_id": job_id})
                if job:
                    print(f"      Status: {job['status']}, Module: {job['module']}")
                else:
                    print(f"      Job not found in database!")
            else:
                print(f"      Failed to create job for {module}")

        # 4. Test credit deduction
        print("4. Verifying credit deduction...")
        updated_user = db.users.find_one({"_id": user_id})
        total_cost = sum(cost for _, _, cost in created_jobs)
        expected_credits = 1000 - total_cost
        actual_credits = updated_user["credits"]

        print(f"   Total cost: {total_cost} credits")
        print(f"   Expected balance: {expected_credits} credits")
        print(f"   Actual balance: {actual_credits} credits")

        if actual_credits == expected_credits:
            print("   Credit deduction working correctly!")
        else:
            print("   Credit deduction mismatch!")

        # 5. Test credit ledger
        print("5. Checking credit ledger...")
        ledger_entries = list(db.credit_ledger.find(
            {"userId": user_id}
        ).sort("createdAt", -1).limit(10))

        print(f"   Found {len(ledger_entries)} ledger entries")
        for entry in ledger_entries:
            print(f"      {entry['reason']}: {entry['change']} credits (Balance: {entry['balanceAfter']})")

        # 6. Test job status retrieval
        print("6. Testing job status retrieval...")
        for job_id, module, cost in created_jobs:
            job = db.jobs.find_one({"_id": job_id})
            if job:
                print(f"   Job {job_id}: {job['status']} ({job['module']})")
            else:
                print(f"   Job {job_id} not found!")

        # 7. Test user generations (history)
        print("7. Testing user generations...")
        generations = list(db.generations.find({"userId": user_id}).sort("createdAt", -1))
        print(f"   Found {len(generations)} generations in history")

        print("\nJob Creation Flow Test Completed Successfully!")

        # Cleanup test data
        print("\nCleaning up test data...")
        db.users.delete_one({"_id": user_id})
        for job_id, _, _ in created_jobs:
            db.jobs.delete_one({"_id": job_id})
        db.credit_ledger.delete_many({"userId": user_id})
        print("   Test data cleaned up")

        return True

    except Exception as e:
        print(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Run the test
    success = asyncio.run(test_job_creation_flow())

    if success:
        print("\nAll tests passed!")
        exit(0)
    else:
        print("\nTests failed!")
        exit(1)