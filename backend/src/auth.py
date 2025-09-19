"""
Authentication system with Supabase Auth integration.
Handles JWT verification, user management, and role-based access control.
"""

import os
import jwt
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from functools import wraps

from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from jose import JWTError, jwt as jose_jwt

from .database import (
    get_db, UserModel, get_user_by_auth_id,
    get_user_by_id, update_user_credits
)
from bson import ObjectId

logger = logging.getLogger(__name__)

# Supabase configuration (will be set via environment variables)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

# Initialize Supabase client
supabase_client: Optional[Client] = None

def initialize_supabase():
    """Initialize Supabase client with credentials."""
    global supabase_client

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.warning("Supabase credentials not configured. Auth will be disabled.")
        return None

    try:
        supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logger.info("Supabase client initialized successfully")
        return supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)

class AuthUser:
    """Current authenticated user context."""

    def __init__(self, user_data: Dict[str, Any], supabase_user: Dict[str, Any]):
        self.id = ObjectId(user_data["_id"])
        self.auth_provider_id = user_data["authProviderId"]
        self.email = user_data["email"]
        self.name = user_data["name"]
        self.is_admin = user_data.get("isAdmin", False)
        self.plan = user_data.get("plan", "free")
        self.credits = user_data.get("credits", 0)
        self.supabase_user = supabase_user
        self.raw_user_data = user_data

def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify Supabase JWT token and return user data."""
    try:
        if not SUPABASE_JWT_SECRET:
            logger.error("Supabase JWT secret not configured")
            return None

        # Decode and verify the JWT token
        payload = jose_jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )

        return payload
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        return None
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return None

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[AuthUser]:
    """Get current authenticated user from JWT token."""
    if not credentials:
        return None

    try:
        # Verify Supabase token
        supabase_user = verify_supabase_token(credentials.credentials)
        if not supabase_user:
            return None

        # Get user from our database
        auth_provider_id = supabase_user.get("sub")
        if not auth_provider_id:
            logger.warning("No subject in JWT token")
            return None

        user_data = get_user_by_auth_id(auth_provider_id)
        if not user_data:
            # User doesn't exist in our database, create them
            user_data = await create_user_from_supabase(supabase_user)
            if not user_data:
                return None

        return AuthUser(user_data, supabase_user)

    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return None

async def require_auth(
    current_user: Optional[AuthUser] = Depends(get_current_user)
) -> AuthUser:
    """Require authentication for protected routes."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

async def require_admin(
    current_user: AuthUser = Depends(require_auth)
) -> AuthUser:
    """Require admin role for admin-only routes."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

async def create_user_from_supabase(supabase_user: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Create a new user in our database from Supabase user data."""
    try:
        db = get_db()

        # Extract user information from Supabase token
        auth_provider_id = supabase_user.get("sub")
        email = supabase_user.get("email", "")
        name = supabase_user.get("user_metadata", {}).get("full_name", "") or email.split("@")[0]

        # Create user document
        user_doc = UserModel.create_user(
            auth_provider_id=auth_provider_id,
            email=email,
            name=name,
            plan="free",
            credits=500  # Free tier starting credits
        )

        # Insert user
        result = db.users.insert_one(user_doc)

        # Return the created user
        user_doc["_id"] = result.inserted_id
        logger.info(f"Created new user: {email} (ID: {result.inserted_id})")

        return user_doc

    except Exception as e:
        logger.error(f"Failed to create user from Supabase data: {e}")
        return None

# Decorators for route protection
def auth_required(func):
    """Decorator to require authentication for a route."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        # Extract current_user from dependencies
        current_user = kwargs.get('current_user')
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        return await func(*args, **kwargs)
    return wrapper

def admin_required(func):
    """Decorator to require admin role for a route."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        current_user = kwargs.get('current_user')
        if not current_user or not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        return await func(*args, **kwargs)
    return wrapper

def credits_required(min_credits: int):
    """Decorator to require minimum credits for a route."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )

            if current_user.credits < min_credits:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"Insufficient credits. Required: {min_credits}, Available: {current_user.credits}"
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Admin management functions
async def promote_user_to_admin(user_id: str, admin_user: AuthUser) -> bool:
    """Promote a user to admin role."""
    if not admin_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can promote users"
        )

    try:
        db = get_db()
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "isAdmin": True,
                    "updatedAt": datetime.now(timezone.utc)
                }
            }
        )

        if result.modified_count > 0:
            logger.info(f"User {user_id} promoted to admin by {admin_user.email}")
            return True
        return False

    except Exception as e:
        logger.error(f"Failed to promote user to admin: {e}")
        return False

async def revoke_admin_access(user_id: str, admin_user: AuthUser) -> bool:
    """Revoke admin access from a user."""
    if not admin_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can revoke admin access"
        )

    # Prevent self-demotion
    if str(admin_user.id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot revoke your own admin access"
        )

    try:
        db = get_db()
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "isAdmin": False,
                    "updatedAt": datetime.now(timezone.utc)
                }
            }
        )

        if result.modified_count > 0:
            logger.info(f"Admin access revoked for user {user_id} by {admin_user.email}")
            return True
        return False

    except Exception as e:
        logger.error(f"Failed to revoke admin access: {e}")
        return False

async def get_all_users(admin_user: AuthUser, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
    """Get all users (admin only)."""
    if not admin_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    try:
        db = get_db()
        users = list(db.users.find(
            {},
            {"authProviderId": 0}  # Don't return sensitive auth data
        ).skip(skip).limit(limit).sort("createdAt", -1))

        # Convert ObjectId to string for JSON serialization
        for user in users:
            user["_id"] = str(user["_id"])

        return users

    except Exception as e:
        logger.error(f"Failed to get users: {e}")
        return []

# User profile management
async def update_user_profile(
    user_id: ObjectId,
    name: Optional[str] = None,
    plan: Optional[str] = None
) -> bool:
    """Update user profile information."""
    try:
        db = get_db()
        update_data = {"updatedAt": datetime.now(timezone.utc)}

        if name:
            update_data["name"] = name
        if plan:
            update_data["plan"] = plan

        result = db.users.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )

        return result.modified_count > 0

    except Exception as e:
        logger.error(f"Failed to update user profile: {e}")
        return False

# Initialize Supabase on module import
try:
    initialize_supabase()
except Exception as e:
    logger.error(f"Failed to initialize authentication system: {e}")

# Export commonly used dependencies
__all__ = [
    "get_current_user",
    "require_auth",
    "require_admin",
    "AuthUser",
    "auth_required",
    "admin_required",
    "credits_required",
    "promote_user_to_admin",
    "revoke_admin_access",
    "get_all_users",
    "update_user_profile",
    "initialize_supabase"
]