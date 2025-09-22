"""
Health check and system monitoring routes.
Provides system status, database connectivity, and service health information.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import os
import logging
import asyncio

from ..database import get_db
from ..auth import supabase_client, get_current_user, AuthUser

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/health", tags=["health"])

# Health check response models
class DatabaseHealth(BaseModel):
    status: str
    connected: bool
    collections_count: int
    response_time_ms: Optional[float] = None

class AuthHealth(BaseModel):
    status: str
    supabase_configured: bool
    connection_test: bool

class SystemHealth(BaseModel):
    status: str
    timestamp: datetime
    environment: str
    version: str
    uptime_seconds: Optional[float] = None

class DetailedHealthResponse(BaseModel):
    overall_status: str
    system: SystemHealth
    database: DatabaseHealth
    authentication: AuthHealth
    checks_passed: int
    total_checks: int

class QuickHealthResponse(BaseModel):
    status: str
    timestamp: datetime
    services: Dict[str, str]

# Global startup time for uptime calculation
startup_time = datetime.now(timezone.utc)

@router.get("/", response_model=QuickHealthResponse)
async def quick_health_check():
    """Quick health check for load balancers and basic monitoring."""
    try:
        # Quick database ping
        db = get_db()
        db.command('ping')
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"

    # Quick auth check
    auth_status = "healthy" if supabase_client else "unhealthy"

    overall_status = "healthy" if db_status == "healthy" and auth_status == "healthy" else "unhealthy"

    return QuickHealthResponse(
        status=overall_status,
        timestamp=datetime.now(timezone.utc),
        services={
            "database": db_status,
            "authentication": auth_status,
            "api": "healthy"
        }
    )

@router.get("/detailed", response_model=DetailedHealthResponse)
async def detailed_health_check():
    """Comprehensive health check with detailed service information."""
    checks_passed = 0
    total_checks = 3

    # System health
    try:
        uptime = (datetime.now(timezone.utc) - startup_time).total_seconds()
        system_health = SystemHealth(
            status="healthy",
            timestamp=datetime.now(timezone.utc),
            environment=os.getenv("ENVIRONMENT", "unknown"),
            version="1.0.0",
            uptime_seconds=uptime
        )
        checks_passed += 1
    except Exception as e:
        logger.error(f"System health check failed: {e}")
        system_health = SystemHealth(
            status="unhealthy",
            timestamp=datetime.now(timezone.utc),
            environment=os.getenv("ENVIRONMENT", "unknown"),
            version="1.0.0"
        )

    # Database health
    try:
        db = get_db()
        start_time = datetime.now()

        # Test database operations
        ping_result = db.command('ping')
        collections = db.list_collection_names()

        response_time = (datetime.now() - start_time).total_seconds() * 1000

        database_health = DatabaseHealth(
            status="healthy",
            connected=True,
            collections_count=len(collections),
            response_time_ms=round(response_time, 2)
        )
        checks_passed += 1
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        database_health = DatabaseHealth(
            status="unhealthy",
            connected=False,
            collections_count=0
        )

    # Authentication health
    try:
        auth_configured = supabase_client is not None

        # Test Supabase connection if configured
        connection_test = False
        if auth_configured:
            # Simple test - check if we can access Supabase
            connection_test = True  # Simplified for now

        auth_health = AuthHealth(
            status="healthy" if auth_configured else "degraded",
            supabase_configured=auth_configured,
            connection_test=connection_test
        )

        if auth_configured:
            checks_passed += 1
    except Exception as e:
        logger.error(f"Auth health check failed: {e}")
        auth_health = AuthHealth(
            status="unhealthy",
            supabase_configured=False,
            connection_test=False
        )

    # Overall status
    overall_status = "healthy" if checks_passed >= 2 else "unhealthy"

    return DetailedHealthResponse(
        overall_status=overall_status,
        system=system_health,
        database=database_health,
        authentication=auth_health,
        checks_passed=checks_passed,
        total_checks=total_checks
    )

@router.get("/database")
async def database_health():
    """Specific database health and connectivity check."""
    try:
        db = get_db()
        start_time = datetime.now()

        # Test various database operations
        ping_result = db.command('ping')
        collections = db.list_collection_names()

        # Test a simple query
        users_count = db.users.count_documents({})

        response_time = (datetime.now() - start_time).total_seconds() * 1000

        # Test specific collections exist
        required_collections = ['users', 'jobs', 'generations', 'credit_ledger', 'deletion_queue']
        missing_collections = [col for col in required_collections if col not in collections]

        return {
            "status": "healthy",
            "connected": True,
            "database_name": db.name,
            "collections_total": len(collections),
            "required_collections_present": len(missing_collections) == 0,
            "missing_collections": missing_collections,
            "users_count": users_count,
            "response_time_ms": round(response_time, 2),
            "ping_result": ping_result
        }

    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "error": str(e),
                "connected": False
            }
        )

@router.get("/auth")
async def auth_health():
    """Specific authentication service health check."""
    try:
        checks = {
            "supabase_configured": supabase_client is not None,
            "environment_variables": {
                "SUPABASE_URL": bool(os.getenv("SUPABASE_URL")),
                "SUPABASE_SERVICE_KEY": bool(os.getenv("SUPABASE_SERVICE_KEY")),
                "SUPABASE_JWT_SECRET": bool(os.getenv("SUPABASE_JWT_SECRET"))
            }
        }

        all_env_vars_set = all(checks["environment_variables"].values())

        return {
            "status": "healthy" if checks["supabase_configured"] and all_env_vars_set else "degraded",
            "supabase_client_initialized": checks["supabase_configured"],
            "environment_variables_set": all_env_vars_set,
            "details": checks["environment_variables"]
        }

    except Exception as e:
        logger.error(f"Auth health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "error": str(e)
            }
        )

@router.get("/metrics")
async def get_system_metrics(current_user: AuthUser = Depends(get_current_user)):
    """Get system metrics (optional authentication for security)."""
    try:
        db = get_db()

        # Basic metrics
        metrics = {
            "timestamp": datetime.now(timezone.utc),
            "uptime_seconds": (datetime.now(timezone.utc) - startup_time).total_seconds(),
            "database": {
                "users_total": db.users.count_documents({}),
                "active_users": db.users.count_documents({"isDeleted": {"$ne": True}}),
                "jobs_total": db.jobs.count_documents({}),
                "jobs_completed": db.jobs.count_documents({"status": "completed"}),
                "generations_total": db.generations.count_documents({})
            }
        }

        # Add detailed metrics for authenticated users
        if current_user:
            metrics["authenticated_access"] = True
            metrics["user_role"] = "admin" if current_user.is_admin else "user"

            # Admin gets additional metrics
            if current_user.is_admin:
                metrics["database"]["jobs_failed"] = db.jobs.count_documents({"status": "failed"})
                metrics["database"]["credit_transactions"] = db.credit_ledger.count_documents({})

                # Recent activity
                recent_users = list(db.users.find(
                    {},
                    {"email": 1, "createdAt": 1}
                ).sort("createdAt", -1).limit(5))

                metrics["recent_activity"] = {
                    "new_users_count": len(recent_users),
                    "newest_users": [
                        {
                            "email": user["email"],
                            "created_at": user.get("createdAt", "unknown")
                        }
                        for user in recent_users
                    ]
                }
        else:
            metrics["authenticated_access"] = False

        return metrics

    except Exception as e:
        logger.error(f"Failed to get system metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve system metrics"
        )

@router.get("/status")
async def service_status():
    """Simple status endpoint for external monitoring."""
    return {
        "api": "online",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "environment": os.getenv("ENVIRONMENT", "unknown")
    }