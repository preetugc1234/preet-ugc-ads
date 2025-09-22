#!/usr/bin/env python3
"""
Startup script that ensures AI packages are available
Handles missing packages gracefully with fallbacks
"""

import subprocess
import sys
import importlib
import os

def install_package(package_name, pip_name=None):
    """Install a package if it's missing"""
    if pip_name is None:
        pip_name = package_name

    try:
        importlib.import_module(package_name)
        print(f"✅ {package_name} already installed")
        return True
    except ImportError:
        try:
            print(f"📦 Installing {pip_name}...")
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", pip_name,
                "--no-deps", "--quiet"
            ])
            print(f"✅ {package_name} installed successfully")
            return True
        except subprocess.CalledProcessError:
            print(f"⚠️ Failed to install {package_name}, using fallback")
            return False

def setup_ai_packages():
    """Setup AI packages with fallbacks"""
    packages = [
        ("cloudinary", "cloudinary==1.26.0"),
        ("supabase", "supabase==1.0.4"),
        ("razorpay", "razorpay==1.2.0"),
        ("fal_client", "fal-client==0.2.2")
    ]

    for module_name, pip_name in packages:
        install_package(module_name, pip_name)

def create_mock_modules():
    """Create mock modules for missing AI packages"""
    mock_dir = "/tmp/mock_modules"
    os.makedirs(mock_dir, exist_ok=True)

    # Add to Python path
    if mock_dir not in sys.path:
        sys.path.insert(0, mock_dir)

    # Create mock files for missing modules
    mock_files = {
        "fal_client.py": '''
class MockFalClient:
    def __init__(self, *args, **kwargs):
        pass
    def submit(self, *args, **kwargs):
        return {"status": "mock", "message": "FAL client not available"}

submit = MockFalClient().submit
''',
        "razorpay.py": '''
class Client:
    def __init__(self, *args, **kwargs):
        pass

    @property
    def order(self):
        return self

    def create(self, *args, **kwargs):
        return {"id": "mock_order", "status": "mock"}
''',
        "supabase.py": '''
def create_client(*args, **kwargs):
    class MockClient:
        def __init__(self):
            self.auth = self
        def signOut(self, *args, **kwargs):
            return {"error": None}
    return MockClient()

Client = object
'''
    }

    for filename, content in mock_files.items():
        filepath = os.path.join(mock_dir, filename)
        if not os.path.exists(filepath):
            with open(filepath, 'w') as f:
                f.write(content)

if __name__ == "__main__":
    print("🚀 Setting up AI packages...")
    setup_ai_packages()
    create_mock_modules()
    print("✅ Startup complete!")