"""
Job Queue Management System for AI workflows.
Handles job scheduling, status tracking, worker communication, and retry logic.
"""

import os
import asyncio
import logging
import time
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
            logger.warning("Supabase credentials not configured. Using local processing.")
            # Schedule local processing that calls FAL AI directly
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

        # For img2vid_noaudio, always use local processing for reliability
        if job["module"] == "img2vid_noaudio":
            logger.info(f"Using local processing for img2vid_noaudio job {job_id}")
            # Use create_task but ensure proper completion handling
            asyncio.create_task(self._mock_job_processing(job_id, job))
            return

        # Call Supabase Edge Function for other modules
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
            # Fallback to local processing
            asyncio.create_task(self._mock_job_processing(job_id, job))

    async def _mock_job_processing(self, job_id: ObjectId, job: dict):
        """Process job using local AI adapters when Supabase is not available."""
        try:
            logger.info(f"Processing job {job_id} locally with module {job['module']}")

            # Import AI adapters
            from .ai_models.openrouter_adapter import OpenRouterAdapter
            from .ai_models.fal_adapter import FalAdapter
            from .ai_models.asset_handler import AssetHandler

            db = get_db()
            module = job['module']
            params = job['params']
            user_id = str(job['userId'])

            # Initialize adapters and variables
            asset_handler = AssetHandler()
            final_urls = []  # Initialize final_urls for all modules

            # Process based on module type
            if module == 'chat':
                # OpenRouter Chat
                adapter = OpenRouterAdapter()

                # Generate preview
                preview_result = await adapter.generate_chat_preview(params)
                if preview_result.get('success'):
                    preview_asset = await asset_handler.handle_chat_result(
                        preview_result, str(job_id), user_id, True
                    )

                    if preview_asset.get('success'):
                        db.jobs.update_one(
                            {"_id": job_id},
                            {
                                "$set": {
                                    "previewUrl": preview_asset.get('urls', [''])[0] if preview_asset.get('urls') else '',
                                    "status": "preview_ready",
                                    "previewMeta": preview_asset.get('metadata', {}),
                                    "updatedAt": datetime.now(timezone.utc)
                                }
                            }
                        )
                        logger.info(f"Chat preview ready for job {job_id}")

                # Generate final
                final_result = await adapter.generate_chat_final(params)
                if final_result.get('success'):
                    final_asset = await asset_handler.handle_chat_result(
                        final_result, str(job_id), user_id, False
                    )
                    final_urls = final_asset.get('urls', []) if final_asset.get('success') else []
                else:
                    raise Exception(f"Chat final generation failed: {final_result.get('error', 'Unknown error')}")

            elif module == 'image':
                # OpenRouter Image (Gemini 2.5 Flash)
                adapter = OpenRouterAdapter()

                # Generate preview
                preview_result = await adapter.generate_image_preview(params)
                if preview_result.get('success'):
                    preview_asset = await asset_handler.handle_image_result(
                        preview_result, str(job_id), user_id, True
                    )

                    if preview_asset.get('success'):
                        db.jobs.update_one(
                            {"_id": job_id},
                            {
                                "$set": {
                                    "previewUrl": preview_asset.get('urls', [''])[0] if preview_asset.get('urls') else '',
                                    "status": "preview_ready",
                                    "previewMeta": preview_asset.get('metadata', {}),
                                    "updatedAt": datetime.now(timezone.utc)
                                }
                            }
                        )
                        logger.info(f"Image preview ready for job {job_id}")

                # Generate final
                final_result = await adapter.generate_image_final(params)
                if final_result.get('success'):
                    final_asset = await asset_handler.handle_image_result(
                        final_result, str(job_id), user_id, False
                    )
                    final_urls = final_asset.get('urls', []) if final_asset.get('success') else []
                else:
                    raise Exception(f"Image final generation failed: {final_result.get('error', 'Unknown error')}")

            elif module == 'tts':
                # Fal AI TTS
                adapter = FalAdapter()

                # Generate preview
                preview_result = await adapter.generate_tts_preview(params)
                if preview_result.get('success'):
                    preview_asset = await asset_handler.handle_tts_result(
                        preview_result, str(job_id), user_id, True
                    )

                    if preview_asset.get('success'):
                        db.jobs.update_one(
                            {"_id": job_id},
                            {
                                "$set": {
                                    "previewUrl": preview_asset.get('urls', [''])[0] if preview_asset.get('urls') else '',
                                    "status": "preview_ready",
                                    "previewMeta": preview_asset.get('metadata', {}),
                                    "updatedAt": datetime.now(timezone.utc)
                                }
                            }
                        )
                        logger.info(f"TTS preview ready for job {job_id}")

                # Generate final
                final_result = await adapter.generate_tts_final(params)
                if final_result.get('success'):
                    final_asset = await asset_handler.handle_tts_result(
                        final_result, str(job_id), user_id, False
                    )
                    final_urls = final_asset.get('urls', []) if final_asset.get('success') else []
                else:
                    raise Exception(f"TTS final generation failed: {final_result.get('error', 'Unknown error')}")

            elif module in ['img2vid_noaudio', 'img2vid_audio', 'audio2vid']:
                # Fal AI Video workflows with improved async handling
                adapter = FalAdapter()

                # For img2vid_noaudio, use async workflow for better performance
                if module == 'img2vid_noaudio':
                    logger.info(f"Starting img2vid_noaudio async workflow for job {job_id}")
                    logger.info(f"Input params: image_url length: {len(params.get('image_url', ''))}, prompt: {params.get('prompt', '')[:50]}...")

                    # Submit async request to FAL AI
                    webhook_url = f"{os.getenv('BACKEND_URL', 'https://preet-ugc-ads.onrender.com')}/api/webhooks/fal/{job_id}"
                    logger.info(f"Webhook URL: {webhook_url}")

                    try:
                        async_result = await adapter.submit_img2vid_noaudio_async(params, webhook_url)
                        logger.info(f"FAL AI async result: {async_result}")
                    except Exception as fal_error:
                        logger.error(f"FAL AI submission error: {fal_error}")
                        raise Exception(f"FAL AI submission failed: {str(fal_error)}")

                    if async_result.get('success'):
                        # Store the request ID for tracking
                        request_id = async_result.get('request_id')
                        logger.info(f"FAL AI request ID: {request_id}")

                        db.jobs.update_one(
                            {"_id": job_id},
                            {
                                "$set": {
                                    "status": "processing",
                                    "providerRequestId": request_id,
                                    "processingMeta": {
                                        "model": async_result.get('model'),
                                        "estimated_time": async_result.get('estimated_processing_time'),
                                        "quality": async_result.get('quality'),
                                        "duration": async_result.get('duration'),
                                        "webhook_url": webhook_url
                                    },
                                    "updatedAt": datetime.now(timezone.utc)
                                }
                            }
                        )
                        logger.info(f"✅ Image-to-video job {job_id} submitted to FAL AI successfully: {request_id}")

                        # Job submitted successfully - let webhook handle completion
                        # Schedule background polling as backup in case webhook fails
                        asyncio.create_task(self._poll_fal_completion(job_id, request_id, user_id))
                        logger.info(f"✅ Job {job_id} submitted to FAL AI successfully: {request_id}")

                        # Exit the img2vid_noaudio processing since it's now async
                        return
                    else:
                        error_msg = async_result.get('error', 'Unknown FAL AI error')
                        logger.error(f"❌ FAL AI async submission failed: {error_msg}")

                        # Try direct sync method as fallback
                        logger.info(f"🔄 Attempting direct sync processing for job {job_id}")
                        try:
                            sync_result = await adapter.generate_img2vid_noaudio_final(params)
                            if sync_result.get('success'):
                                # Process sync result immediately
                                final_asset = await asset_handler.handle_video_result(
                                    sync_result, str(job_id), user_id, False
                                )
                                final_urls = final_asset.get('urls', []) if final_asset.get('success') else []

                                if final_urls:
                                    logger.info(f"✅ Direct sync processing successful for job {job_id}")
                                    # Continue with completion logic below
                                else:
                                    raise Exception("Direct sync processing failed to generate URLs")
                            else:
                                raise Exception(f"Direct sync processing failed: {sync_result.get('error')}")
                        except Exception as sync_error:
                            logger.error(f"❌ Direct sync processing also failed: {sync_error}")
                            raise Exception(f"All processing methods failed: {error_msg}, {sync_error}")

                else:
                    # Use existing sync workflow for other modules
                    # Generate preview
                    if module == 'img2vid_audio':
                        preview_result = await adapter.generate_img2vid_audio_preview(params)
                    else:  # audio2vid
                        preview_result = await adapter.generate_audio2vid_preview(params)

                    if preview_result.get('success'):
                        preview_asset = await asset_handler.handle_video_result(
                            preview_result, str(job_id), user_id, True
                        )

                        if preview_asset.get('success'):
                            db.jobs.update_one(
                                {"_id": job_id},
                                {
                                    "$set": {
                                        "previewUrl": preview_asset.get('urls', [''])[0] if preview_asset.get('urls') else '',
                                        "status": "preview_ready",
                                        "previewMeta": preview_asset.get('metadata', {}),
                                        "updatedAt": datetime.now(timezone.utc)
                                    }
                                }
                            )
                            logger.info(f"Video preview ready for job {job_id}")

                    # Generate final
                    if module == 'img2vid_audio':
                        final_result = await adapter.generate_img2vid_audio_final(params)
                    else:  # audio2vid
                        final_result = await adapter.generate_audio2vid_final(params)

                    if final_result.get('success'):
                        final_asset = await asset_handler.handle_video_result(
                            final_result, str(job_id), user_id, False
                        )
                        final_urls = final_asset.get('urls', []) if final_asset.get('success') else []
                    else:
                        raise Exception(f"Video final generation failed: {final_result.get('error', 'Unknown error')}")

                # For img2vid_noaudio, final_urls should already be set above
                # For non-img2vid_noaudio modules, continue with existing completion logic

            else:
                raise Exception(f"Unsupported module: {module}")

            # Update job as completed
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
            from .database import GenerationModel
            generation_doc = GenerationModel.create_generation(
                user_id=job["userId"],
                job_id=job["_id"],
                generation_type=job["module"],
                preview_url=db.jobs.find_one({"_id": job_id}).get("previewUrl", ""),
                final_urls=final_urls,
                size_bytes=sum([1024 for _ in final_urls])  # Mock size calculation
            )

            db.generations.insert_one(generation_doc)

            # Handle history eviction
            from .database import cleanup_old_generations
            cleanup_old_generations(job["userId"], max_count=30)

            # Remove from timeout tracking
            self.job_timeouts.pop(str(job_id), None)

            logger.info(f"Local AI processing completed for job {job_id}")

        except Exception as e:
            logger.error(f"Local AI processing failed for job {job_id}: {e}")
            await self._handle_job_failure(job_id, f"Local AI processing failed: {str(e)}")

    def _get_module_timeout(self, module: str) -> int:
        """Get timeout in minutes for each module type."""
        timeouts = {
            "chat": 2,
            "image": 5,
            "img2vid_noaudio": 10,  # 10 minutes for Kling v2.1 Pro (6 min + buffer)
            "tts": 3,
            "img2vid_audio": 12,  # 12 minutes for Kling v1 Pro AI Avatar (8 min + buffer)
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

    async def _poll_fal_completion(self, job_id: ObjectId, request_id: str, user_id: str):
        """Poll FAL AI for completion as backup to webhook."""
        try:
            from .ai_models.fal_adapter import FalAdapter
            from .ai_models.asset_handler import AssetHandler

            adapter = FalAdapter()
            asset_handler = AssetHandler()

            max_wait_time = 600  # 10 minutes
            start_time = time.time()

            # Poll every 30 seconds
            while time.time() - start_time < max_wait_time:
                await asyncio.sleep(30)

                try:
                    # Check if job was already completed by webhook
                    db = get_db()
                    job = db.jobs.find_one({"_id": job_id})
                    if job and job.get("status") in ["completed", "failed"]:
                        logger.info(f"Job {job_id} already completed via webhook")
                        return

                    # Get the result from FAL AI
                    async_result = await adapter.get_async_result(request_id)
                    if async_result.get('success'):
                        # Process the result
                        final_asset = await asset_handler.handle_video_result(
                            async_result, str(job_id), user_id, False
                        )
                        final_urls = final_asset.get('urls', []) if final_asset.get('success') else []

                        if final_urls:
                            logger.info(f"✅ FAL AI polling completion successful for job {job_id}")

                            # Update job as completed
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
                            from .database import GenerationModel
                            generation_doc = GenerationModel.create_generation(
                                user_id=ObjectId(user_id),
                                job_id=job_id,
                                generation_type="img2vid_noaudio",
                                preview_url="",
                                final_urls=final_urls,
                                size_bytes=sum([1024 for _ in final_urls])
                            )
                            db.generations.insert_one(generation_doc)

                            # Handle history eviction
                            from .database import cleanup_old_generations
                            cleanup_old_generations(ObjectId(user_id), max_count=30)

                            return

                    elif async_result.get('status') == 'failed':
                        raise Exception(f"FAL AI processing failed: {async_result.get('error')}")

                except Exception as poll_error:
                    logger.error(f"Polling error for job {job_id}: {poll_error}")
                    continue

            # Timeout reached - mark as failed
            logger.error(f"FAL AI polling timed out for job {job_id}")
            await self._handle_job_failure(job_id, "FAL AI processing timed out after 10 minutes")

        except Exception as e:
            logger.error(f"Error in FAL AI polling for job {job_id}: {e}")
            await self._handle_job_failure(job_id, f"Polling error: {str(e)}")

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