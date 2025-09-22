"""
User management routes and credit system.
Handles user profiles, credit operations, and account management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import logging

from ..auth import get_current_user, require_auth, require_admin, AuthUser
from ..database import (
    get_db, get_user_by_id, update_user_credits, CreditLedgerModel,
    get_user_generations, cleanup_old_generations
)
from bson import ObjectId

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/user", tags=["user_management"])

# Pydantic models for request/response
class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: str
    plan: str
    credits: int
    is_admin: bool
    created_at: datetime
    updated_at: datetime

class UserStatsResponse(BaseModel):
    total_generations: int
    credits_used_total: int
    credits_remaining: int
    plan: str
    member_since: datetime

class CreditTransaction(BaseModel):
    id: str
    change: int
    balance_after: int
    reason: str
    created_at: datetime
    job_id: Optional[str] = None
    admin_id: Optional[str] = None

class CreditHistory(BaseModel):
    current_balance: int
    transactions: List[CreditTransaction]
    total_earned: int
    total_spent: int

class GenerationItem(BaseModel):
    id: str
    type: str
    preview_url: Optional[str]
    final_urls: List[str]
    size_bytes: int
    created_at: datetime

class UserHistoryResponse(BaseModel):
    generations: List[GenerationItem]
    total_count: int
    limit: int

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None

    @validator('name')
    def validate_name(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) < 2:
                raise ValueError('Name must be at least 2 characters long')
            if len(v) > 100:
                raise ValueError('Name must be less than 100 characters')
        return v

class PlanChangeRequest(BaseModel):
    plan: str

    @validator('plan')
    def validate_plan(cls, v):
        allowed_plans = ['free', 'pro', 'enterprise']
        if v not in allowed_plans:
            raise ValueError(f'Plan must be one of: {allowed_plans}')
        return v

# User Profile Endpoints
@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(current_user: AuthUser = Depends(require_auth)):
    """Get current user's detailed profile information."""
    try:
        # Get fresh user data from database
        user_data = get_user_by_id(current_user.id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return UserProfileResponse(
            id=str(user_data["_id"]),
            email=user_data["email"],
            name=user_data["name"],
            plan=user_data.get("plan", "free"),
            credits=user_data.get("credits", 0),
            is_admin=user_data.get("isAdmin", False),
            created_at=user_data.get("createdAt", datetime.now(timezone.utc)),
            updated_at=user_data.get("updatedAt", datetime.now(timezone.utc))
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile"
        )

@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile_endpoint(
    profile_update: ProfileUpdateRequest,
    current_user: AuthUser = Depends(require_auth)
):
    """Update current user's profile information."""
    try:
        from ..auth import update_user_profile

        success = await update_user_profile(
            user_id=current_user.id,
            name=profile_update.name
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile"
            )

        # Return updated profile
        return await get_user_profile(current_user)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(current_user: AuthUser = Depends(require_auth)):
    """Get user statistics and usage metrics."""
    try:
        db = get_db()

        # Get generation count
        total_generations = db.generations.count_documents({"userId": current_user.id})

        # Get total credits used
        credit_pipeline = [
            {"$match": {"userId": current_user.id, "change": {"$lt": 0}}},
            {"$group": {"_id": None, "total_spent": {"$sum": {"$abs": "$change"}}}}
        ]

        credits_used_result = list(db.credit_ledger.aggregate(credit_pipeline))
        credits_used_total = credits_used_result[0]["total_spent"] if credits_used_result else 0

        return UserStatsResponse(
            total_generations=total_generations,
            credits_used_total=credits_used_total,
            credits_remaining=current_user.credits,
            plan=current_user.plan,
            member_since=current_user.raw_user_data.get("createdAt", datetime.now(timezone.utc))
        )

    except Exception as e:
        logger.error(f"Failed to get user stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user statistics"
        )

# Credit Management Endpoints
@router.get("/credits", response_model=CreditHistory)
async def get_credit_history(
    limit: int = Query(20, ge=1, le=100),
    current_user: AuthUser = Depends(require_auth)
):
    """Get user's credit balance and transaction history."""
    try:
        db = get_db()

        # Get recent transactions
        transactions_cursor = db.credit_ledger.find(
            {"userId": current_user.id}
        ).sort("createdAt", -1).limit(limit)

        transactions = []
        for transaction in transactions_cursor:
            transactions.append(CreditTransaction(
                id=str(transaction["_id"]),
                change=transaction["change"],
                balance_after=transaction["balanceAfter"],
                reason=transaction["reason"],
                created_at=transaction["createdAt"],
                job_id=str(transaction["jobId"]) if transaction.get("jobId") else None,
                admin_id=str(transaction["adminId"]) if transaction.get("adminId") else None
            ))

        # Calculate totals
        total_earned_result = list(db.credit_ledger.aggregate([
            {"$match": {"userId": current_user.id, "change": {"$gt": 0}}},
            {"$group": {"_id": None, "total": {"$sum": "$change"}}}
        ]))

        total_spent_result = list(db.credit_ledger.aggregate([
            {"$match": {"userId": current_user.id, "change": {"$lt": 0}}},
            {"$group": {"_id": None, "total": {"$sum": {"$abs": "$change"}}}}
        ]))

        total_earned = total_earned_result[0]["total"] if total_earned_result else 0
        total_spent = total_spent_result[0]["total"] if total_spent_result else 0

        return CreditHistory(
            current_balance=current_user.credits,
            transactions=transactions,
            total_earned=total_earned,
            total_spent=total_spent
        )

    except Exception as e:
        logger.error(f"Failed to get credit history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve credit history"
        )

@router.get("/credits/balance")
async def get_credit_balance(current_user: AuthUser = Depends(require_auth)):
    """Get current credit balance (quick endpoint)."""
    try:
        # Get fresh balance from database
        user_data = get_user_by_id(current_user.id)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {
            "credits": user_data.get("credits", 0),
            "plan": user_data.get("plan", "free"),
            "updated_at": user_data.get("updatedAt", datetime.now(timezone.utc))
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get credit balance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve credit balance"
        )

# User History Endpoints
@router.get("/history", response_model=UserHistoryResponse)
async def get_user_history(
    limit: int = Query(30, ge=1, le=100),
    current_user: AuthUser = Depends(require_auth)
):
    """Get user's generation history (max 100 items)."""
    try:
        generations_data = get_user_generations(current_user.id, limit)

        generations = []
        for gen in generations_data:
            generations.append(GenerationItem(
                id=str(gen["_id"]),
                type=gen["type"],
                preview_url=gen.get("previewUrl"),
                final_urls=gen.get("finalUrls", []),
                size_bytes=gen.get("sizeBytes", 0),
                created_at=gen["createdAt"]
            ))

        # Get total count
        db = get_db()
        total_count = db.generations.count_documents({"userId": current_user.id})

        return UserHistoryResponse(
            generations=generations,
            total_count=total_count,
            limit=limit
        )

    except Exception as e:
        logger.error(f"Failed to get user history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve history"
        )

@router.delete("/history/{generation_id}")
async def delete_generation(
    generation_id: str,
    current_user: AuthUser = Depends(require_auth)
):
    """Delete a specific generation from user's history."""
    try:
        db = get_db()

        # Verify generation belongs to user
        generation = db.generations.find_one({
            "_id": ObjectId(generation_id),
            "userId": current_user.id
        })

        if not generation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Generation not found"
            )

        # TODO: Add Cloudinary deletion logic here
        # For now, just delete from database
        result = db.generations.delete_one({
            "_id": ObjectId(generation_id),
            "userId": current_user.id
        })

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Generation not found"
            )

        logger.info(f"User {current_user.email} deleted generation {generation_id}")

        return {
            "success": True,
            "message": "Generation deleted successfully",
            "generation_id": generation_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete generation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete generation"
        )

@router.delete("/history/cleanup")
async def cleanup_user_history(current_user: AuthUser = Depends(require_auth)):
    """Manually trigger history cleanup (remove oldest items beyond 30)."""
    try:
        cleanup_old_generations(current_user.id, max_count=30)

        return {
            "success": True,
            "message": "History cleanup completed",
            "max_items": 30
        }

    except Exception as e:
        logger.error(f"Failed to cleanup history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cleanup history"
        )

# Account Management
@router.put("/plan", response_model=UserProfileResponse)
async def change_user_plan(
    plan_request: PlanChangeRequest,
    current_user: AuthUser = Depends(require_auth)
):
    """Change user's subscription plan."""
    try:
        from ..auth import update_user_profile

        # In a real app, you'd verify payment/subscription here
        success = await update_user_profile(
            user_id=current_user.id,
            plan=plan_request.plan
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update plan"
            )

        logger.info(f"User {current_user.email} changed plan to {plan_request.plan}")

        # Return updated profile
        return await get_user_profile(current_user)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to change plan: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change plan"
        )

@router.delete("/account")
async def delete_user_account(current_user: AuthUser = Depends(require_auth)):
    """Delete user account (soft delete for now)."""
    try:
        db = get_db()

        # Mark account as deleted (implement soft delete)
        result = db.users.update_one(
            {"_id": current_user.id},
            {
                "$set": {
                    "isDeleted": True,
                    "deletedAt": datetime.now(timezone.utc),
                    "email": f"deleted_{current_user.id}@deleted.com"
                }
            }
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        logger.warning(f"User account deleted: {current_user.email}")

        return {
            "success": True,
            "message": "Account deletion initiated",
            "note": "Your account has been marked for deletion"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete account: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )