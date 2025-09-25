import os
import hmac
import hashlib
import uuid
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, HTTPException, Path, Depends, Request, Header
from pydantic import BaseModel, validator
from bson import ObjectId

from ..auth import require_auth, AuthUser, require_admin
from ..database import (
    get_db, JobModel, GenerationModel, CreditLedgerModel,
    create_job_with_deduction, get_user_generations, cleanup_old_generations
)
from ..queue_manager import queue_manager, JobPriority

logger = logging.getLogger(__name__)
router = APIRouter()

# HMAC Configuration
HMAC_SECRET = os.getenv("WORKER_HMAC_SECRET", "your-worker-hmac-secret-key")
HMAC_TOLERANCE_SECONDS = 120  # 2 minutes tolerance for timestamp validation

# Module configurations with credit costs
MODULE_CONFIGS = {
    "chat": {
        "name": "Chat/Text Generation",
        "cost": 0,  # Free tier
        "provider": "openrouter",
        "model": "chat-4o-mini",
        "avg_time_seconds": 5
    },
    "image": {
        "name": "Text to Image",
        "cost": 0,  # Free tier based on prompt
        "provider": "openrouter",
        "model": "gemini-2.5-flash",
        "avg_time_seconds": 15
    },
    "img2vid_noaudio": {
        "name": "Image to Video (No Audio)",
        "cost": 0,  # Free for testing - uses FAL AI directly
        "provider": "fal",
        "model": "wan-v2.2-5b",
        "avg_time_seconds": 240  # 4 minutes for WAN 2.2
    },
    "tts": {
        "name": "Text to Speech",
        "cost": 0,  # Free during testing mode
        "provider": "fal",
        "model": "11labs-v2.5",
        "avg_time_seconds": 10
    },
    "img2vid_audio": {
        "name": "Image to Video (With Audio)",
        "cost_per_second": 40,  # 200 credits per 5 seconds
        "provider": "fal",
        "model": "kling-v1-pro",
        "avg_time_seconds": 60
    },
    "audio2vid": {
        "name": "Audio to Video",
        "cost_per_30_seconds": 100,
        "provider": "veed",
        "model": "veed-ugc",
        "avg_time_seconds": 90
    }
}

# Pydantic Models
class CreateJobRequest(BaseModel):
    module: str
    params: Dict[str, Any]
    client_job_id: Optional[str] = None

    @validator('module')
    def validate_module(cls, v):
        if v not in MODULE_CONFIGS:
            raise ValueError(f"Invalid module. Must be one of: {list(MODULE_CONFIGS.keys())}")
        return v

    @validator('client_job_id', pre=True, always=True)
    def set_client_job_id(cls, v):
        return v or str(uuid.uuid4())

class JobResponse(BaseModel):
    success: bool
    message: str
    job_id: Optional[str] = None
    client_job_id: Optional[str] = None
    estimated_cost: Optional[int] = None
    estimated_time_seconds: Optional[int] = None
    status: Optional[str] = None

class JobStatusResponse(BaseModel):
    success: bool
    job_id: str
    client_job_id: str
    status: str
    module: str
    params: Dict[str, Any]
    used_credits: int
    preview_url: Optional[str] = None
    finalUrls: List[str] = []
    worker_meta: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None

class PreviewReadyRequest(BaseModel):
    preview_url: str
    preview_meta: Optional[Dict[str, Any]] = {}

class JobCallbackRequest(BaseModel):
    status: str  # completed, failed
    finalUrls: Optional[List[str]] = []
    worker_meta: Optional[Dict[str, Any]] = {}
    used_credits: Optional[int] = None
    error_message: Optional[str] = None
    generation_type: Optional[str] = None
    size_bytes: Optional[int] = 0

class HistoryResponse(BaseModel):
    success: bool
    generations: List[Dict[str, Any]]
    total_count: int
    message: str

def estimate_job_cost(module: str, params: Dict[str, Any]) -> int:
    """Estimate credit cost for a job based on module and parameters."""
    config = MODULE_CONFIGS.get(module)
    if not config:
        raise HTTPException(status_code=400, detail=f"Unknown module: {module}")

    # Fixed cost modules
    if "cost" in config:
        return config["cost"]

    # Duration-based cost modules
    if "cost_per_second" in config:
        duration = params.get("duration", 5)  # Default 5 seconds
        return int((duration / 5) * config["cost_per_second"] * 5)  # Round to 5-second increments

    # Minute-based cost modules (legacy - kept for compatibility)
    if "cost_per_minute" in config:
        duration_minutes = params.get("duration_minutes", 1)
        return int(duration_minutes) * config["cost_per_minute"]

    # 30-second increment cost modules
    if "cost_per_30_seconds" in config:
        duration_seconds = params.get("duration_seconds", 30)  # Default 30 seconds
        # Round up to nearest 30-second increment
        increments = (duration_seconds + 29) // 30  # Ceiling division
        return increments * config["cost_per_30_seconds"]

    return 0

def calculate_estimated_time(module: str, params: Dict[str, Any]) -> int:
    """Calculate estimated time with +10s buffer as per prompt specification."""
    config = MODULE_CONFIGS.get(module, {})
    base_time = config.get("avg_time_seconds", 30)
    return base_time + 10  # +10s buffer as specified in prompt

def generate_hmac_signature(job_id: str, timestamp: str, payload_hash: str) -> str:
    """Generate HMAC signature for worker authentication."""
    message = f"{job_id}|{timestamp}|{payload_hash}"
    signature = hmac.new(
        HMAC_SECRET.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature

def verify_hmac_signature(
    job_id: str,
    timestamp: str,
    payload_hash: str,
    provided_signature: str
) -> bool:
    """Verify HMAC signature from worker."""
    try:
        # Check timestamp tolerance (prevent replay attacks)
        current_time = int(time.time())
        request_time = int(timestamp)

        if abs(current_time - request_time) > HMAC_TOLERANCE_SECONDS:
            logger.warning(f"HMAC timestamp outside tolerance: {abs(current_time - request_time)}s")
            return False

        # Generate expected signature
        expected_signature = generate_hmac_signature(job_id, timestamp, payload_hash)

        # Constant-time comparison to prevent timing attacks
        return hmac.compare_digest(expected_signature, provided_signature)

    except Exception as e:
        logger.error(f"HMAC verification error: {e}")
        return False

# Route Implementations
@router.post("/create", response_model=JobResponse)
async def create_job(
    request: CreateJobRequest,
    current_user: AuthUser = Depends(require_auth)
):
    """Create a new AI generation job with immediate credit deduction."""
    try:
        db = get_db()

        # Check for duplicate client_job_id
        existing_job = db.jobs.find_one({"clientJobId": request.client_job_id})
        if existing_job:
            return JobResponse(
                success=False,
                message="Job with this client_job_id already exists",
                client_job_id=request.client_job_id
            )

        # Enhanced duplicate prevention for img2vid_noaudio
        if request.module == "img2vid_noaudio":
            # 🚨 CRITICAL: Check for very recent duplicate requests (within 30 seconds) to prevent double-clicks
            very_recent_threshold = datetime.now(timezone.utc) - timedelta(seconds=30)
            image_url = request.params.get("image_url")
            prompt = request.params.get("prompt", "")

            if image_url:
                # Check for exact duplicates in last 30 seconds (prevents double-click)
                very_recent_job = db.jobs.find_one({
                    "userId": ObjectId(current_user.id),
                    "module": "img2vid_noaudio",
                    "createdAt": {"$gte": very_recent_threshold},
                    "params.image_url": image_url,
                    "params.prompt": prompt,
                    "status": {"$nin": ["failed", "cancelled"]}  # Exclude failed/cancelled jobs
                })

                if very_recent_job:
                    logger.warning(f"🚫 BLOCKED DUPLICATE API CALL - Job created within 30 seconds: {very_recent_job['_id']}")
                    return JobResponse(
                        success=False,
                        message="⚠️ Duplicate request blocked - Please wait 30 seconds between identical requests",
                        client_job_id=request.client_job_id,
                        job_id=str(very_recent_job["_id"])
                    )

                # Check for similar requests from same user (within 5 minutes) for user convenience
                recent_threshold = datetime.now(timezone.utc) - timedelta(minutes=5)
                similar_job = db.jobs.find_one({
                    "userId": ObjectId(current_user.id),
                    "module": "img2vid_noaudio",
                    "createdAt": {"$gte": recent_threshold},
                    "params.image_url": image_url,
                    "params.prompt": prompt,
                    "status": {"$nin": ["failed", "cancelled"]}  # Exclude failed/cancelled jobs
                })

                if similar_job and str(similar_job["_id"]) != str(very_recent_job["_id"]):
                    return JobResponse(
                        success=False,
                        message="Duplicate request detected. Please wait before generating the same video again.",
                        client_job_id=request.client_job_id,
                        job_id=str(similar_job["_id"])
                    )

        # Estimate cost and time
        estimated_cost = estimate_job_cost(request.module, request.params)
        estimated_time = calculate_estimated_time(request.module, request.params)

        # Create job with atomic credit deduction
        job_id = create_job_with_deduction(
            client_job_id=request.client_job_id,
            user_id=current_user.id,
            module=request.module,
            params=request.params,
            credit_cost=estimated_cost
        )

        if not job_id:
            return JobResponse(
                success=False,
                message=f"Insufficient credits. Required: {estimated_cost}, Available: {current_user.credits}",
                estimated_cost=estimated_cost
            )

        # Enqueue job for processing
        queue_success = await queue_manager.enqueue_job(
            job_id=job_id,
            module=request.module,
            priority=JobPriority.NORMAL
        )

        if not queue_success:
            logger.error(f"Failed to queue job {job_id}")
            # Job was created but queuing failed - this should be rare
            # The job will remain in queued status and can be retried

        logger.info(f"Job created successfully: {job_id} for user {current_user.email}")

        return JobResponse(
            success=True,
            message="Job created and queued successfully",
            job_id=str(job_id),
            client_job_id=request.client_job_id,
            estimated_cost=estimated_cost,
            estimated_time_seconds=estimated_time,
            status="queued"
        )

    except Exception as e:
        logger.error(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail="Failed to create job")

@router.get("/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str = Path(..., description="Job ID"),
    current_user: AuthUser = Depends(require_auth)
):
    """Get status of a specific job."""
    try:
        db = get_db()

        # Find job and verify ownership
        job = db.jobs.find_one({
            "_id": ObjectId(job_id),
            "userId": current_user.id
        })

        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        return JobStatusResponse(
            success=True,
            job_id=str(job["_id"]),
            client_job_id=job["clientJobId"],
            status=job["status"],
            module=job["module"],
            params=job["params"],
            used_credits=job["usedCredits"],
            preview_url=job.get("previewUrl"),
            finalUrls=job.get("finalUrls", []),
            worker_meta=job.get("workerMeta", {}),
            created_at=job["createdAt"],
            updated_at=job["updatedAt"],
            error_message=job.get("errorMessage")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting job status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get job status")

@router.get("/user/history", response_model=HistoryResponse)
async def get_user_history(
    current_user: AuthUser = Depends(require_auth)
):
    """Get user's generation history (30-item rolling window)."""
    try:
        generations = get_user_generations(current_user.id, limit=30)

        # Convert ObjectIds to strings for JSON serialization
        for gen in generations:
            gen["_id"] = str(gen["_id"])
            gen["userId"] = str(gen["userId"])
            gen["jobId"] = str(gen["jobId"])

        return HistoryResponse(
            success=True,
            generations=generations,
            total_count=len(generations),
            message=f"Retrieved {len(generations)} generations"
        )

    except Exception as e:
        logger.error(f"Error getting user history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user history")

@router.get("/modules", response_model=Dict[str, Any])
async def get_available_modules():
    """Get all available AI modules with their configurations."""
    return {
        "success": True,
        "modules": MODULE_CONFIGS,
        "message": "Available AI modules retrieved successfully"
    }

# Worker Callback Endpoints (HMAC protected)
@router.post("/{job_id}/preview_ready")
async def job_preview_ready(
    job_id: str,
    request: PreviewReadyRequest,
    x_worker_signature: str = Header(..., alias="X-Worker-Signature"),
    x_worker_timestamp: str = Header(..., alias="X-Worker-Timestamp")
):
    """Worker callback when preview is ready (HMAC protected)."""
    try:
        # Calculate payload hash for HMAC verification
        payload_str = request.json()
        payload_hash = hashlib.sha256(payload_str.encode()).hexdigest()

        # Verify HMAC signature
        if not verify_hmac_signature(job_id, x_worker_timestamp, payload_hash, x_worker_signature):
            raise HTTPException(status_code=401, detail="Invalid HMAC signature")

        db = get_db()

        # Update job with preview URL
        result = db.jobs.update_one(
            {"_id": ObjectId(job_id)},
            {
                "$set": {
                    "previewUrl": request.preview_url,
                    "status": "preview_ready",
                    "updatedAt": datetime.now(timezone.utc),
                    "workerMeta.preview": request.preview_meta
                }
            }
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Job not found")

        # TODO: Emit WebSocket event for real-time updates
        logger.info(f"Preview ready for job {job_id}")

        return {"success": True, "message": "Preview status updated"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating preview status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update preview status")

@router.post("/{job_id}/callback")
async def job_callback(
    job_id: str,
    request: JobCallbackRequest,
    x_worker_signature: str = Header(..., alias="X-Worker-Signature"),
    x_worker_timestamp: str = Header(..., alias="X-Worker-Timestamp")
):
    """Worker callback when job is completed (HMAC protected)."""
    try:
        # Calculate payload hash for HMAC verification
        payload_str = request.json()
        payload_hash = hashlib.sha256(payload_str.encode()).hexdigest()

        # Verify HMAC signature
        if not verify_hmac_signature(job_id, x_worker_timestamp, payload_hash, x_worker_signature):
            raise HTTPException(status_code=401, detail="Invalid HMAC signature")

        db = get_db()

        # Get job to verify it exists and get user info
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Prevent duplicate callbacks (idempotency)
        if job["status"] in ["completed", "failed"]:
            logger.info(f"Job {job_id} already finalized with status {job['status']}")
            return {"success": True, "message": "Job already processed"}

        # Update job status
        update_data = {
            "status": request.status,
            "updatedAt": datetime.now(timezone.utc),
            "workerMeta": {**job.get("workerMeta", {}), **(request.worker_meta or {})}
        }

        if request.finalUrls:
            update_data["finalUrls"] = request.finalUrls

        if request.error_message:
            update_data["errorMessage"] = request.error_message

        if request.used_credits is not None:
            update_data["usedCredits"] = request.used_credits

        # Update job
        db.jobs.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": update_data}
        )

        # If job completed successfully, create generation record and handle eviction
        if request.status == "completed" and request.finalUrls:
            generation_doc = GenerationModel.create_generation(
                user_id=job["userId"],
                job_id=job["_id"],
                generation_type=request.generation_type or job["module"],
                preview_url=job.get("previewUrl", ""),
                final_urls=request.finalUrls,
                size_bytes=request.size_bytes or 0
            )

            # Insert generation record
            db.generations.insert_one(generation_doc)

            # Handle history eviction (30-item limit)
            cleanup_old_generations(job["userId"], max_count=30)

            logger.info(f"Generation record created for job {job_id}")

        # TODO: Emit WebSocket event for real-time updates
        logger.info(f"Job {job_id} callback processed: {request.status}")

        return {"success": True, "message": "Job callback processed"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing job callback: {e}")
        raise HTTPException(status_code=500, detail="Failed to process job callback")

# Queue Management Endpoints
@router.post("/{job_id}/cancel")
async def cancel_job(
    job_id: str = Path(..., description="Job ID"),
    current_user: AuthUser = Depends(require_auth)
):
    """Cancel a queued or processing job and refund credits."""
    try:
        success = await queue_manager.cancel_job(ObjectId(job_id), current_user.id)

        if not success:
            raise HTTPException(
                status_code=404,
                detail="Job not found or cannot be cancelled"
            )

        return {"success": True, "message": "Job cancelled successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel job")

@router.get("/queue/status")
async def get_queue_status(
    current_user: AuthUser = Depends(require_admin)
):
    """Get queue status and statistics (admin only)."""
    try:
        status = await queue_manager.get_queue_status()
        return {
            "success": True,
            "queue_status": status,
            "message": "Queue status retrieved successfully"
        }

    except Exception as e:
        logger.error(f"Error getting queue status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get queue status")

@router.get("/user/jobs")
async def get_user_jobs(
    status: Optional[str] = None,
    limit: int = 20,
    current_user: AuthUser = Depends(require_auth)
):
    """Get user's jobs with optional status filter."""
    try:
        db = get_db()

        # Build query
        query = {"userId": current_user.id}
        if status:
            query["status"] = status

        # Get jobs
        jobs = list(db.jobs.find(query).sort("createdAt", -1).limit(limit))

        # Convert ObjectIds to strings
        for job in jobs:
            job["_id"] = str(job["_id"])
            job["userId"] = str(job["userId"])

        return {
            "success": True,
            "jobs": jobs,
            "total_count": len(jobs),
            "message": f"Retrieved {len(jobs)} jobs"
        }

    except Exception as e:
        logger.error(f"Error getting user jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user jobs")

@router.post("/{job_id}/retry")
async def retry_failed_job(
    job_id: str = Path(..., description="Job ID"),
    current_user: AuthUser = Depends(require_auth)
):
    """Retry a failed job (admin only for now)."""
    try:
        db = get_db()

        # Find job and verify it's failed
        job = db.jobs.find_one({
            "_id": ObjectId(job_id),
            "userId": current_user.id,
            "status": "failed"
        })

        if not job:
            raise HTTPException(
                status_code=404,
                detail="Job not found or not in failed status"
            )

        # Reset job status and enqueue
        db.jobs.update_one(
            {"_id": ObjectId(job_id)},
            {
                "$set": {
                    "status": "queued",
                    "retryCount": job.get("retryCount", 0),
                    "updatedAt": datetime.now(timezone.utc)
                },
                "$unset": {
                    "errorMessage": "",
                    "failedAt": ""
                }
            }
        )

        # Enqueue for processing
        queue_success = await queue_manager.enqueue_job(
            job_id=ObjectId(job_id),
            module=job["module"],
            priority=JobPriority.HIGH  # Higher priority for retries
        )

        if not queue_success:
            raise HTTPException(status_code=500, detail="Failed to queue job for retry")

        return {"success": True, "message": "Job queued for retry"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrying job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retry job")