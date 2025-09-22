#!/usr/bin/env python3
"""
Test MongoDB connection for debugging
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Test connection
def test_mongodb():
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb+srv://Preet1234:Preet1246@ugc.qqqbt5d.mongodb.net/?retryWrites=true&w=majority&appName=UGC")

    print(f"Testing MongoDB connection...")
    print(f"URI: {mongodb_uri[:50]}...")

    try:
        client = MongoClient(
            mongodb_uri,
            maxPoolSize=10,
            wtimeoutMS=2500,
            serverSelectionTimeoutMS=5000
        )

        # Test the connection
        client.admin.command('ping')
        print("[OK] MongoDB connection successful!")

        # Test database access
        db = client["ugc_ai_saas"]
        collections = db.list_collection_names()
        print(f"[OK] Database access successful! Collections: {collections}")

        return True

    except Exception as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
        return False

if __name__ == "__main__":
    test_mongodb()