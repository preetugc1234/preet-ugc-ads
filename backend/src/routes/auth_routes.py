"""
Authentication and user management routes.
Handles user registration, login, profile management, and admin operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import logging

from ..auth import (
    get_current_user, require_auth, require_admin, AuthUser,
    promote_user_to_admin, revoke_admin_access, get_all_users,
    update_user_profile, supabase_client
)
from ..database import get_db, get_user_by_id, update_user_credits, CreditLedgerModel
from bson import ObjectId

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Pydantic models for request/response
class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    is_admin: bool
    plan: str
    credits: int
    created_at: datetime

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None

class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    is_admin: Optional[bool] = None

class CreditGift(BaseModel):
    credits: int
    reason: Optional[str] = "Admin gift"

class UsersListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    skip: int
    limit: int

# Public routes (no auth required)
@router.get("/status")
async def auth_status():
    """Check authentication system status."""
    return {
        "status": "ok",
        "supabase_configured": supabase_client is not None,
        "message": "Authentication system ready"
    }

# User routes (auth required)
@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: AuthUser = Depends(require_auth)):
    """Get current user's profile information."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        is_admin=current_user.is_admin,
        plan=current_user.plan,
        credits=current_user.credits,
        created_at=current_user.raw_user_data.get("createdAt", datetime.now(timezone.utc))
    )

@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    profile_update: UserProfileUpdate,
    current_user: AuthUser = Depends(require_auth)
):
    """Update current user's profile."""
    success = await update_user_profile(
        user_id=current_user.id,
        name=profile_update.name
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

    # Get updated user data
    updated_user = get_user_by_id(current_user.id)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=str(updated_user["_id"]),
        email=updated_user["email"],
        name=updated_user["name"],
        is_admin=updated_user["isAdmin"],
        plan=updated_user["plan"],
        credits=updated_user["credits"],
        created_at=updated_user["createdAt"]
    )

@router.get("/me/credits")
async def get_my_credits(current_user: AuthUser = Depends(require_auth)):
    """Get current user's credit balance and recent transactions."""
    try:
        db = get_db()

        # Get recent credit transactions
        recent_transactions = list(db.credit_ledger.find(
            {"userId": current_user.id}
        ).sort("createdAt", -1).limit(10))

        # Convert ObjectId to string for JSON serialization
        for transaction in recent_transactions:
            transaction["_id"] = str(transaction["_id"])
            transaction["userId"] = str(transaction["userId"])
            if transaction.get("jobId"):
                transaction["jobId"] = str(transaction["jobId"])
            if transaction.get("adminId"):
                transaction["adminId"] = str(transaction["adminId"])

        return {
            "current_credits": current_user.credits,
            "recent_transactions": recent_transactions
        }

    except Exception as e:
        logger.error(f"Failed to get user credits: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve credit information"
        )

# Admin routes
@router.get("/users", response_model=UsersListResponse)
async def list_users(
    skip: int = 0,
    limit: int = 50,
    admin_user: AuthUser = Depends(require_admin)
):
    """List all users (admin only)."""
    try:
        users_data = await get_all_users(admin_user, skip, limit)

        # Convert to response format
        users = [
            UserResponse(
                id=user["_id"],
                email=user["email"],
                name=user["name"],
                is_admin=user.get("isAdmin", False),
                plan=user.get("plan", "free"),
                credits=user.get("credits", 0),
                created_at=user.get("createdAt", datetime.now(timezone.utc))
            )
            for user in users_data
        ]

        # Get total count
        db = get_db()
        total = db.users.count_documents({})

        return UsersListResponse(
            users=users,
            total=total,
            skip=skip,
            limit=limit
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to list users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id_route(
    user_id: str,
    admin_user: AuthUser = Depends(require_admin)
):
    """Get user by ID (admin only)."""
    try:
        user_data = get_user_by_id(ObjectId(user_id))
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse(
            id=str(user_data["_id"]),
            email=user_data["email"],
            name=user_data["name"],
            is_admin=user_data.get("isAdmin", False),
            plan=user_data.get("plan", "free"),
            credits=user_data.get("credits", 0),
            created_at=user_data.get("createdAt", datetime.now(timezone.utc))
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user"
        )

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: str,
    user_update: AdminUserUpdate,
    admin_user: AuthUser = Depends(require_admin)
):
    """Update user information (admin only)."""
    try:
        # Handle admin role changes
        if user_update.is_admin is not None:
            if user_update.is_admin:
                success = await promote_user_to_admin(user_id, admin_user)
            else:
                success = await revoke_admin_access(user_id, admin_user)

            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update admin status"
                )

        # Handle other profile updates
        if user_update.name or user_update.plan:
            success = await update_user_profile(
                user_id=ObjectId(user_id),
                name=user_update.name,
                plan=user_update.plan
            )

            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update user profile"
                )

        # Return updated user
        updated_user = get_user_by_id(ObjectId(user_id))
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserResponse(
            id=str(updated_user["_id"]),
            email=updated_user["email"],
            name=updated_user["name"],
            is_admin=updated_user.get("isAdmin", False),
            plan=updated_user.get("plan", "free"),
            credits=updated_user.get("credits", 0),
            created_at=updated_user.get("createdAt", datetime.now(timezone.utc))
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )

@router.post("/users/{user_id}/gift-credits")
async def gift_credits_to_user(
    user_id: str,
    gift: CreditGift,
    admin_user: AuthUser = Depends(require_admin)
):
    """Gift credits to a user (admin only)."""
    try:
        if gift.credits <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Credit amount must be positive"
            )

        user_obj_id = ObjectId(user_id)

        # Check if user exists
        user_data = get_user_by_id(user_obj_id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Add credits to user
        success = update_user_credits(user_obj_id, gift.credits)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add credits"
            )

        # Get updated user data for new balance
        updated_user = get_user_by_id(user_obj_id)
        new_balance = updated_user["credits"]

        # Create ledger entry
        db = get_db()
        ledger_entry = CreditLedgerModel.create_ledger_entry(
            user_id=user_obj_id,
            change=gift.credits,
            balance_after=new_balance,
            reason=gift.reason,
            admin_id=admin_user.id
        )
        db.credit_ledger.insert_one(ledger_entry)

        logger.info(f"Admin {admin_user.email} gifted {gift.credits} credits to user {user_id}")

        return {
            "success": True,
            "credits_added": gift.credits,
            "new_balance": new_balance,
            "reason": gift.reason
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to gift credits: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to gift credits"
        )

@router.get("/admin/stats")
async def get_admin_stats(admin_user: AuthUser = Depends(require_admin)):
    """Get system statistics (admin only)."""
    try:
        db = get_db()

        # Get user counts
        total_users = db.users.count_documents({})
        admin_users = db.users.count_documents({"isAdmin": True})
        free_users = db.users.count_documents({"plan": "free"})
        pro_users = db.users.count_documents({"plan": {"$ne": "free"}})

        # Get job statistics
        total_jobs = db.jobs.count_documents({})
        completed_jobs = db.jobs.count_documents({"status": "completed"})
        failed_jobs = db.jobs.count_documents({"status": "failed"})

        # Get recent activity
        recent_users = list(db.users.find(
            {},
            {"email": 1, "name": 1, "createdAt": 1}
        ).sort("createdAt", -1).limit(5))

        # Convert ObjectIds to strings
        for user in recent_users:
            user["_id"] = str(user["_id"])

        return {
            "users": {
                "total": total_users,
                "admins": admin_users,
                "free_plan": free_users,
                "pro_plan": pro_users
            },
            "jobs": {
                "total": total_jobs,
                "completed": completed_jobs,
                "failed": failed_jobs,
                "success_rate": round((completed_jobs / total_jobs * 100) if total_jobs > 0 else 0, 2)
            },
            "recent_users": recent_users
        }

    except Exception as e:
        logger.error(f"Failed to get admin stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics"
        )