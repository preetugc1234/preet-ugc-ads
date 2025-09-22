#!/usr/bin/env python3
"""
Install AI packages separately to avoid dependency conflicts
Run this after the main requirements.txt installation
"""

import subprocess
import sys

def install_package(package):
    """Install a single package"""
    try:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package, "--no-deps"])
        print(f"✅ {package} installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def main():
    ai_packages = [
        "supabase==1.0.4",
        "razorpay==1.3.0",
        "fal-client==0.2.7"
    ]

    success_count = 0
    for package in ai_packages:
        if install_package(package):
            success_count += 1

    print(f"\n🎯 Installed {success_count}/{len(ai_packages)} AI packages")

    if success_count == len(ai_packages):
        print("✅ All AI packages installed successfully!")
    else:
        print("⚠️ Some AI packages failed to install")

if __name__ == "__main__":
    main()