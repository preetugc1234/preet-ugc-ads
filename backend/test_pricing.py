"""
Test script to verify the new audio2vid pricing calculation.
"""

def estimate_job_cost(module: str, params: dict) -> int:
    """Estimate credit cost for audio2vid module."""
    if module != "audio2vid":
        return 0

    # 30-second increment cost modules
    duration_seconds = params.get("duration_seconds", 30)  # Default 30 seconds
    # Round up to nearest 30-second increment
    increments = (duration_seconds + 29) // 30  # Ceiling division
    return increments * 100  # 100 credits per 30 seconds

def test_audio2vid_pricing():
    """Test the new 30-second increment pricing for audio2vid."""
    print("Testing Audio-to-Video Pricing (100 credits per 30 seconds)...")

    test_cases = [
        {"duration_seconds": 15, "expected": 100},   # 15s = 1 increment
        {"duration_seconds": 30, "expected": 100},   # 30s = 1 increment
        {"duration_seconds": 31, "expected": 200},   # 31s = 2 increments
        {"duration_seconds": 45, "expected": 200},   # 45s = 2 increments
        {"duration_seconds": 60, "expected": 200},   # 60s = 2 increments
        {"duration_seconds": 61, "expected": 300},   # 61s = 3 increments
        {"duration_seconds": 90, "expected": 300},   # 90s = 3 increments
        {"duration_seconds": 120, "expected": 400},  # 120s = 4 increments
        {"duration_seconds": 180, "expected": 600},  # 180s = 6 increments
    ]

    all_passed = True

    for test_case in test_cases:
        duration = test_case["duration_seconds"]
        expected = test_case["expected"]

        params = {"duration_seconds": duration}
        actual = estimate_job_cost("audio2vid", params)

        status = "PASS" if actual == expected else "FAIL"
        print(f"  {status}: {duration}s audio -> {actual} credits (expected {expected})")

        if actual != expected:
            all_passed = False

    print(f"\nResult: {'All tests passed!' if all_passed else 'Some tests failed!'}")
    return all_passed

if __name__ == "__main__":
    success = test_audio2vid_pricing()
    exit(0 if success else 1)