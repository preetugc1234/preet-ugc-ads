#!/usr/bin/env python3
"""
Post-install script to install AI packages that might conflict
This runs after requirements.txt installation
"""

import subprocess
import sys
import os

def run_command(cmd):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, check=True,
                              capture_output=True, text=True)
        print(f"✅ {cmd}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {cmd}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🚀 Installing AI packages...")

    # Install packages one by one
    packages = [
        "supabase>=1.0.0,<3.0.0",
        "razorpay>=1.2.0,<2.0.0",
        "fal-client>=0.2.0,<1.0.0"
    ]

    for package in packages:
        cmd = f"pip install '{package}'"
        run_command(cmd)

    print("🎯 AI packages installation complete!")

if __name__ == "__main__":
    main()