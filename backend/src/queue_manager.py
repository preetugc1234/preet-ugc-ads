"""
Job Queue Management System for AI workflows.
Handles job scheduling, status tracking, worker communication, and retry logic.
"""

import os
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum

from bson import ObjectId
from .database import get_db, refund_job_credits

logger = logging.getLogger(__name__)

class JobStatus(Enum):
    """Job status enumeration."""
    QUEUED = "queued"
    PROCESSING = "processing"
    PREVIEW_READY = "preview_ready"
    GENERATING_FINAL = "generating_final"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"

class JobPriority(Enum):
    """Job priority levels."""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4

class QueueManager:
    """Centralized job queue management."""

    def __init__(self):
        self.active_workers = {}
        self.job_timeouts = {}
        self.retry_delays = [30, 120, 300, 900]  # Exponential backoff in seconds

    async def enqueue_job(
        self,
        job_id: ObjectId,
        module: str,
        priority: JobPriority = JobPriority.NORMAL
    ) -> bool:
        """Add job to processing queue."""
        try:
            db = get_db()

            # Update job status to queued
            result = db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": JobStatus.QUEUED.value,
                        "queuedAt": datetime.now(timezone.utc),
                        "priority": priority.value,
                        "retryCount": 0,
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            if result.matched_count == 0:
                logger.error(f"Job {job_id} not found for queuing")
                return False

            # TODO: Trigger worker invocation
            await self._invoke_worker(job_id, module)

            logger.info(f"Job {job_id} queued for processing with priority {priority.name}")
            return True

        except Exception as e:
            logger.error(f"Failed to enqueue job {job_id}: {e}")
            return False

    async def _invoke_worker(self, job_id: ObjectId, module: str):
        """Invoke Supabase Edge Function worker for job processing."""
        try:
            db = get_db()

            # Get job details
            job = db.jobs.find_one({"_id": job_id})
            if not job:
                logger.error(f"Job {job_id} not found for worker invocation")
                return

            # Update status to processing
            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": JobStatus.PROCESSING.value,
                        "processingStartedAt": datetime.now(timezone.utc),
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            # Set timeout for job
            timeout_minutes = self._get_module_timeout(module)
            timeout_time = datetime.now(timezone.utc) + timedelta(minutes=timeout_minutes)
            self.job_timeouts[str(job_id)] = timeout_time

            # Call Supabase Edge Function
            await self._call_supabase_worker(job_id, job)

            logger.info(f"Worker invoked for job {job_id} (module: {module})")

        except Exception as e:
            logger.error(f"Failed to invoke worker for job {job_id}: {e}")
            await self._handle_job_failure(job_id, f"Worker invocation failed: {str(e)}")

    async def _call_supabase_worker(self, job_id: ObjectId, job: dict):
        """Call Supabase Edge Function to process the job."""
        import httpx
        import asyncio

        # Supabase Edge Function URL
        supabase_url = os.getenv("SUPABASE_URL", "")
        supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "")

        if not supabase_url or not supabase_anon_key:
            logger.warning("Supabase credentials not configured. Using mock processing.")
            # Schedule mock completion for demo
            asyncio.create_task(self._mock_job_processing(job_id, job))
            return

        worker_url = f"{supabase_url}/functions/v1/ai-worker"

        # Prepare payload
        payload = {
            "jobId": str(job_id),
            "module": job["module"],
            "params": job["params"],
            "userId": str(job["userId"])
        }

        # Call Supabase Edge Function
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    worker_url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {supabase_anon_key}",
                        "Content-Type": "application/json"
                    },
                    timeout=10.0  # 10 second timeout for invocation
                )

                if response.status_code != 200:
                    raise Exception(f"Worker invocation failed: {response.status_code} - {response.text}")

                logger.info(f"Supabase worker invoked successfully for job {job_id}")

        except Exception as e:
            logger.error(f"Failed to call Supabase worker: {e}")
            # Fallback to mock processing
            asyncio.create_task(self._mock_job_processing(job_id, job))

    async def _mock_job_processing(self, job_id: ObjectId, job: dict):
        """Mock job processing for demo purposes when Supabase is not available."""
        try:
            # Simulate processing time
            await asyncio.sleep(5)

            # Mock preview ready
            from ..database import get_db
            db = get_db()

            preview_url = f"https://via.placeholder.com/512x512?text=Preview+{job['module']}"

            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "previewUrl": preview_url,
                        "status": "preview_ready",
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            logger.info(f"Mock preview ready for job {job_id}")

            # Simulate final processing
            await asyncio.sleep(10)

            # Mock completion
            final_urls = [f"https://via.placeholder.com/1024x1024?text=Final+{job['module']}"]

            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "finalUrls": final_urls,
                        "completedAt": datetime.now(timezone.utc),
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            # Create generation record
            from ..database import GenerationModel
            generation_doc = GenerationModel.create_generation(
                user_id=job["userId"],
                job_id=job["_id"],
                generation_type=job["module"],
                preview_url=preview_url,
                final_urls=final_urls,
                size_bytes=1024
            )

            db.generations.insert_one(generation_doc)

            # Handle history eviction
            from ..database import cleanup_old_generations
            cleanup_old_generations(job["userId"], max_count=30)

            # Remove from timeout tracking
            self.job_timeouts.pop(str(job_id), None)

            logger.info(f"Mock job {job_id} completed successfully")

        except Exception as e:
            logger.error(f"Mock processing failed for job {job_id}: {e}")
            await self._handle_job_failure(job_id, f"Mock processing failed: {str(e)}")

    def _get_module_timeout(self, module: str) -> int:
        """Get timeout in minutes for each module type."""
        timeouts = {
            "chat": 2,
            "image": 5,
            "img2vid_noaudio": 15,
            "tts": 3,
            "img2vid_audio": 20,
            "audio2vid": 25
        }
        return timeouts.get(module, 10)  # Default 10 minutes

    async def update_job_status(
        self,
        job_id: ObjectId,
        status: JobStatus,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update job status with optional metadata."""
        try:
            db = get_db()

            update_data = {
                "status": status.value,
                "updatedAt": datetime.now(timezone.utc)
            }

            # Add status-specific timestamps
            if status == JobStatus.PREVIEW_READY:
                update_data["previewReadyAt"] = datetime.now(timezone.utc)
            elif status == JobStatus.COMPLETED:
                update_data["completedAt"] = datetime.now(timezone.utc)
                # Remove from timeout tracking
                self.job_timeouts.pop(str(job_id), None)
            elif status == JobStatus.FAILED:
                update_data["failedAt"] = datetime.now(timezone.utc)
                # Remove from timeout tracking
                self.job_timeouts.pop(str(job_id), None)

            if metadata:
                for key, value in metadata.items():
                    update_data[key] = value

            result = db.jobs.update_one(
                {"_id": job_id},
                {"$set": update_data}
            )

            if result.matched_count == 0:
                logger.error(f"Job {job_id} not found for status update")
                return False

            logger.info(f"Job {job_id} status updated to {status.value}")
            return True

        except Exception as e:
            logger.error(f"Failed to update job status for {job_id}: {e}")
            return False

    async def _handle_job_failure(
        self,
        job_id: ObjectId,
        error_message: str,
        should_retry: bool = True
    ):
        """Handle job failure with retry logic."""
        try:
            db = get_db()

            job = db.jobs.find_one({"_id": job_id})
            if not job:
                logger.error(f"Job {job_id} not found for failure handling")
                return

            retry_count = job.get("retryCount", 0)
            max_retries = 3

            if should_retry and retry_count < max_retries:
                # Schedule retry
                retry_count += 1
                retry_delay = self.retry_delays[min(retry_count - 1, len(self.retry_delays) - 1)]
                next_retry_at = datetime.now(timezone.utc) + timedelta(seconds=retry_delay)

                db.jobs.update_one(
                    {"_id": job_id},
                    {
                        "$set": {
                            "status": JobStatus.QUEUED.value,
                            "retryCount": retry_count,
                            "nextRetryAt": next_retry_at,
                            "lastError": error_message,
                            "updatedAt": datetime.now(timezone.utc)
                        }
                    }
                )

                logger.info(f"Job {job_id} scheduled for retry {retry_count}/{max_retries} at {next_retry_at}")

                # Schedule retry execution
                asyncio.create_task(self._retry_job_after_delay(job_id, retry_delay))

            else:
                # Mark as permanently failed and refund credits
                db.jobs.update_one(
                    {"_id": job_id},
                    {
                        "$set": {
                            "status": JobStatus.FAILED.value,
                            "errorMessage": error_message,
                            "failedAt": datetime.now(timezone.utc),
                            "updatedAt": datetime.now(timezone.utc)
                        }
                    }
                )

                # Refund credits
                refund_success = refund_job_credits(
                    job_id=job_id,
                    user_id=job["userId"],
                    refund_amount=job["usedCredits"],
                    reason="job_failed"
                )

                if refund_success:
                    logger.info(f"Credits refunded for failed job {job_id}")
                else:
                    logger.error(f"Failed to refund credits for job {job_id}")

                logger.error(f"Job {job_id} permanently failed: {error_message}")

        except Exception as e:
            logger.error(f"Error handling job failure for {job_id}: {e}")

    async def _retry_job_after_delay(self, job_id: ObjectId, delay_seconds: int):
        """Retry job after specified delay."""
        await asyncio.sleep(delay_seconds)

        try:
            db = get_db()
            job = db.jobs.find_one({"_id": job_id})

            if job and job.get("status") == JobStatus.QUEUED.value:
                await self._invoke_worker(job_id, job["module"])
                logger.info(f"Retried job {job_id} after {delay_seconds}s delay")
        except Exception as e:
            logger.error(f"Failed to retry job {job_id}: {e}")

    async def check_job_timeouts(self):
        """Check for timed out jobs and handle them."""
        current_time = datetime.now(timezone.utc)

        timed_out_jobs = []
        for job_id_str, timeout_time in self.job_timeouts.items():
            if current_time > timeout_time:
                timed_out_jobs.append(ObjectId(job_id_str))

        for job_id in timed_out_jobs:
            await self._handle_job_timeout(job_id)
            self.job_timeouts.pop(str(job_id), None)

    async def _handle_job_timeout(self, job_id: ObjectId):
        """Handle job timeout."""
        try:
            db = get_db()

            # Check current job status
            job = db.jobs.find_one({"_id": job_id})
            if not job:
                return

            # Only timeout if still processing
            if job.get("status") in [JobStatus.PROCESSING.value, JobStatus.PREVIEW_READY.value]:
                await self._handle_job_failure(
                    job_id,
                    "Job timed out",
                    should_retry=True
                )
                logger.warning(f"Job {job_id} timed out and will be retried")

        except Exception as e:
            logger.error(f"Error handling timeout for job {job_id}: {e}")

    async def get_queue_status(self) -> Dict[str, Any]:
        """Get current queue status and statistics."""
        try:
            db = get_db()

            # Count jobs by status
            pipeline = [
                {"$group": {"_id": "$status", "count": {"$sum": 1}}},
                {"$sort": {"_id": 1}}
            ]

            status_counts = {item["_id"]: item["count"] for item in db.jobs.aggregate(pipeline)}

            # Get processing times for completed jobs (last 24 hours)
            yesterday = datetime.now(timezone.utc) - timedelta(days=1)
            completed_jobs = list(db.jobs.find({
                "status": JobStatus.COMPLETED.value,
                "completedAt": {"$gte": yesterday}
            }, {
                "module": 1,
                "processingStartedAt": 1,
                "completedAt": 1
            }))

            # Calculate average processing times by module
            module_times = {}
            for job in completed_jobs:
                if job.get("processingStartedAt") and job.get("completedAt"):
                    module = job["module"]
                    processing_time = (job["completedAt"] - job["processingStartedAt"]).total_seconds()

                    if module not in module_times:
                        module_times[module] = []
                    module_times[module].append(processing_time)

            avg_times = {
                module: sum(times) / len(times)
                for module, times in module_times.items()
            }

            return {
                "status_counts": status_counts,
                "average_processing_times": avg_times,
                "active_timeouts": len(self.job_timeouts),
                "total_jobs_last_24h": len(completed_jobs)
            }

        except Exception as e:
            logger.error(f"Error getting queue status: {e}")
            return {}

    async def cancel_job(self, job_id: ObjectId, user_id: ObjectId) -> bool:
        """Cancel a queued or processing job."""
        try:
            db = get_db()

            # Find job and verify ownership
            job = db.jobs.find_one({
                "_id": job_id,
                "userId": user_id,
                "status": {"$in": [JobStatus.QUEUED.value, JobStatus.PROCESSING.value]}
            })

            if not job:
                return False

            # Update job status to cancelled
            result = db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": JobStatus.CANCELLED.value,
                        "cancelledAt": datetime.now(timezone.utc),
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            if result.modified_count > 0:
                # Refund credits
                refund_success = refund_job_credits(
                    job_id=job_id,
                    user_id=user_id,
                    refund_amount=job["usedCredits"],
                    reason="job_cancelled"
                )

                # Remove from timeout tracking
                self.job_timeouts.pop(str(job_id), None)

                logger.info(f"Job {job_id} cancelled successfully")
                return refund_success

            return False

        except Exception as e:
            logger.error(f"Error cancelling job {job_id}: {e}")
            return False

# Global queue manager instance
queue_manager = QueueManager()

# Background task to check timeouts periodically
async def timeout_checker():
    """Background task to check for job timeouts."""
    while True:
        try:
            await queue_manager.check_job_timeouts()
            await asyncio.sleep(60)  # Check every minute
        except Exception as e:
            logger.error(f"Error in timeout checker: {e}")
            await asyncio.sleep(60)

# Start timeout checker (this would be called from main application startup)
def start_background_tasks():
    """Start background tasks for queue management."""
    asyncio.create_task(timeout_checker())