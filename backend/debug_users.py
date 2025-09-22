#!/usr/bin/env python3
"""
Debug script to check users in database
"""

import os
import sys
from dotenv import load_dotenv

# Add src to path
sys.path.append('src')

load_dotenv()

from src.database import get_db

def check_users():
    """Check all users in database"""
    try:
        db = get_db()

        users = list(db.users.find())
        print(f"Found {len(users)} users in database:")

        for user in users:
            print(f"- Email: {user.get('email')}")
            print(f"  Name: {user.get('name')}")
            print(f"  Plan: {user.get('plan')}")
            print(f"  Credits: {user.get('credits')}")
            print(f"  Auth ID: {user.get('authProviderId')}")
            print(f"  Created: {user.get('createdAt')}")
            print()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()