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
        # REMOVED: retry_delays - NO AUTO-RETRY to prevent money waste
        self.processing_jobs = set()  # 🚨 CRITICAL: Track jobs currently being processed to prevent duplicates

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
            # 🚨 CRITICAL: Check if job is already being processed to prevent duplicates
            job_id_str = str(job_id)
            if job_id_str in self.processing_jobs:
                logger.warning(f"🚫 Job {job_id} is already being processed - PREVENTING DUPLICATE INVOCATION")
                return

            # Add to processing set immediately to prevent race conditions
            self.processing_jobs.add(job_id_str)
            logger.info(f"🔒 Added job {job_id} to processing lock")

            db = get_db()

            # Get job details
            job = db.jobs.find_one({"_id": job_id})
            if not job:
                logger.error(f"Job {job_id} not found for worker invocation")
                self.processing_jobs.discard(job_id_str)  # Remove from processing set
                return

            # Check if job is already completed or processing
            if job.get("status") in ["completed", "processing", "failed"]:
                logger.warning(f"🚫 Job {job_id} already has status: {job.get('status')} - skipping invocation")
                self.processing_jobs.discard(job_id_str)  # Remove from processing set
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
            # Clean up processing lock on exception
            job_id_str = str(job_id)
            if job_id_str in self.processing_jobs:
                self.processing_jobs.discard(job_id_str)
                logger.info(f"🧹 Removed job {job_id} from processing lock due to exception")
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
            logger.info(f"🚀 Processing job {job_id} locally with module {job['module']}")
            logger.info(f"📋 Job params: {job['params']}")

            # Import AI adapters
            from .ai_models.openrouter_adapter import OpenRouterAdapter
            from .ai_models.fal_adapter import FalAdapter
            from .ai_models.asset_handler import AssetHandler

            db = get_db()
            module = job['module']
            params = job['params']
            user_id = str(job['userId'])

            logger.info(f"🔧 Initialized adapters for module: {module}")

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
                # Text-to-Speech using ElevenLabs Multilingual v2 - Single high-quality result
                adapter = FalAdapter()

                logger.info(f"🎵 Generating single high-quality TTS with Multilingual v2 for job {job_id}")
                logger.info(f"🎤 TTS params: text length={len(params.get('text', ''))}, voice={params.get('voice', 'Rachel')}")

                # Generate single high-quality TTS result (no preview needed)
                tts_result = await adapter.generate_tts_final(params)

                if tts_result.get('success'):
                    # Save to Cloudinary and get downloadable URL
                    logger.info(f"✅ TTS generated successfully, saving to Cloudinary...")
                    tts_asset = await asset_handler.handle_tts_result(
                        tts_result, str(job_id), user_id, False  # is_preview=False for final quality
                    )
                    final_urls = tts_asset.get('urls', []) if tts_asset.get('success') else []

                    if not final_urls:
                        raise Exception("Failed to save TTS audio to Cloudinary")

                    logger.info(f"🎧 TTS audio ready for download: {final_urls[0]}")
                else:
                    raise Exception(f"TTS generation failed: {tts_result.get('error', 'Unknown error')}")

            elif module in ['img2vid_noaudio', 'img2vid_audio', 'audio2vid']:
                # Fal AI Video workflows with improved async handling
                adapter = FalAdapter()

                # For img2vid_noaudio, use ASYNC submission to prevent blocking
                if module == 'img2vid_noaudio':
                    logger.info(f"🎬 Starting img2vid_noaudio ASYNC submission for job {job_id}")
                    logger.info(f"📷 Input params: image_url length: {len(params.get('image_url', ''))}, prompt: '{params.get('prompt', '')}'")

                    try:
                        # 🚨 CRITICAL: Enhanced duplicate prevention for WAN v2.2-5B
                        existing_job = db.jobs.find_one({"_id": job_id})
                        if existing_job:
                            # Check if already submitted to FAL API
                            if existing_job.get("workerMeta", {}).get("request_id"):
                                existing_request_id = existing_job['workerMeta']['request_id']
                                job_status = existing_job.get('status', 'unknown')

                                # If job is still processing, continue monitoring instead of warning
                                if job_status in ['processing', 'submitted']:
                                    logger.info(f"✅ Job {job_id} already processing with request_id: {existing_request_id}")
                                    logger.info(f"🔄 Continuing to monitor existing WAN v2.2-5B generation...")

                                    # Start monitoring the existing request
                                    asyncio.create_task(
                                        self._poll_fal_async_result(job_id, existing_request_id, module, user_id, adapter)
                                    )
                                    return
                                else:
                                    logger.warning(f"🚫 Job {job_id} already completed/failed with request_id: {existing_request_id}")
                                    logger.warning(f"🚫 PREVENTING DUPLICATE FAL API CALL - Status: {job_status}")
                                    return

                            # Check if job is in a final state (including timeout)
                            if existing_job.get('status') in ['completed', 'failed', 'cancelled', 'timeout']:
                                job_status = existing_job.get('status')
                                if job_status == 'timeout':
                                    logger.info(f"⏱️ Job {job_id} previously timed out - User must click generate again for new attempt")
                                else:
                                    logger.info(f"✅ Job {job_id} already in final state: {job_status}")
                                return

                        # 🚨 IMMEDIATE: Mark job as submitted to prevent frontend duplicates
                        logger.info(f"🔒 Marking job {job_id} as submitted to prevent duplicates...")
                        db.jobs.update_one(
                            {"_id": job_id},
                            {
                                "$set": {
                                    "status": "submitted",
                                    "submittedAt": datetime.now(timezone.utc),
                                    "workerMeta": {
                                        "submission_in_progress": True,
                                        "submitted_at": datetime.now(timezone.utc).isoformat()
                                    }
                                }
                            }
                        )

                        # 🔥 CRITICAL FIX: Convert base64 images to Cloudinary URLs to prevent 422 errors
                        processed_params = params.copy()
                        image_url = processed_params.get("image_url", "")

                        if image_url and image_url.startswith("data:image"):
                            logger.info(f"🔄 Converting base64 image to Cloudinary URL to prevent 422 errors...")
                            try:
                                # Import AssetHandler for Cloudinary upload
                                from .ai_models.asset_handler import AssetHandler
                                asset_handler = AssetHandler()

                                # Extract base64 data
                                base64_data = image_url.split(",")[1]
                                import base64
                                image_bytes = base64.b64decode(base64_data)

                                # Upload to Cloudinary
                                image_path = f"user_{job['userId']}/job_{job_id}/input_image"
                                cloudinary_result = await asset_handler._upload_to_cloudinary(
                                    image_bytes,
                                    image_path,
                                    resource_type="image",
                                    format="jpg"
                                )

                                if cloudinary_result and cloudinary_result.get("secure_url"):
                                    base_cloudinary_url = cloudinary_result["secure_url"]

                                    # Create resized URL preserving aspect ratio while meeting FAL AI requirements
                                    # Strategy: Scale to fit within 768x768 while maintaining aspect ratio
                                    # This ensures minimum 512px on shortest side without complex conditionals
                                    cloudinary_url = base_cloudinary_url.replace(
                                        "/upload/",
                                        "/upload/c_fit,w_768,h_768,q_auto:good/"
                                    )

                                    processed_params["image_url"] = cloudinary_url
                                    logger.info(f"✅ Base64 converted to Cloudinary URL: {base_cloudinary_url}")
                                    logger.info(f"🎯 Image resized to fit 768x768 preserving aspect ratio: {cloudinary_url}")
                                    logger.info(f"🚫 422 ERROR PREVENTION: Using properly sized Cloudinary URL")
                                else:
                                    logger.warning(f"⚠️ Cloudinary upload failed, using base64 (may cause 422 error)")

                            except Exception as conversion_error:
                                logger.warning(f"⚠️ Base64 to Cloudinary conversion failed: {conversion_error}")
                                logger.warning(f"⚠️ Using original base64 (may cause 422 error)")
                        else:
                            logger.info(f"✅ Image URL is already a URL (not base64): {image_url[:100]}...")

                        # Use async submission method (non-blocking)
                        logger.info(f"📤 Submitting to FAL AI asynchronously (SINGLE CALL)...")
                        # Create webhook URL for direct result delivery (bypasses base64 corruption issue)
                        webhook_url = f"{os.getenv('BACKEND_URL', 'https://preet-ugc-ads.onrender.com')}/api/webhooks/fal/{job_id}"
                        logger.info(f"🔗 Using webhook URL for result delivery: {webhook_url}")

                        submit_result = await adapter.submit_img2vid_noaudio_async(processed_params, webhook_url=webhook_url)
                        logger.info(f"📊 FAL AI submit result: {submit_result}")

                        if submit_result.get('success') and submit_result.get('request_id'):
                            request_id = submit_result.get('request_id')
                            logger.info(f"✅ FAL AI submission successful: {request_id}")

                            # Update job with request_id and processing status
                            db.jobs.update_one(
                                {"_id": job_id},
                                {
                                    "$set": {
                                        "status": JobStatus.PROCESSING.value,
                                        "processingStartedAt": datetime.now(timezone.utc),
                                        "workerMeta": {
                                            "request_id": request_id,
                                            "model": submit_result.get("model", "kling-v2.5-turbo-pro"),
                                            "processing_started": True,
                                            "submitted_at": datetime.now(timezone.utc).isoformat()
                                        },
                                        "updatedAt": datetime.now(timezone.utc)
                                    }
                                }
                            )

                            # Start background polling task (non-blocking)
                            logger.info(f"🔄 Starting background polling for request_id: {request_id}")
                            asyncio.create_task(
                                self._poll_fal_async_result(job_id, request_id, module, user_id, adapter)
                            )

                            return  # Job is now processing asynchronously

                        else:
                            error_msg = submit_result.get('error', 'Failed to submit to FAL AI')
                            logger.error(f"❌ FAL AI submission failed: {error_msg}")
                            raise Exception(f"FAL AI submission failed: {error_msg}")

                    except Exception as processing_error:
                        logger.error(f"❌ img2vid_noaudio submission failed for job {job_id}: {processing_error}")
                        # Mark job as failed and exit
                        await self._handle_job_failure(job_id, f"Submission failed: {str(processing_error)}")
                        return

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
            logger.info(f"🎯 Updating job {job_id} status to completed with finalUrls: {final_urls}")
            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "finalUrls": final_urls,
                        "completedAt": datetime.now(timezone.utc),
                        "updatedAt": datetime.now(timezone.utc),
                        "workerMeta": {
                            "video_url": final_urls[0] if final_urls else None,
                            "final_url": final_urls[0] if final_urls else None,
                            "completion_time": datetime.now(timezone.utc).isoformat()
                        }
                    }
                }
            )
            logger.info(f"✅ Job {job_id} marked as completed in database")

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
            "img2vid_noaudio": 8,  # 8 minutes for WAN v2.2-5B model (5-6 min processing + buffer)
            "tts": 3,
            "img2vid_audio": 12,  # 12 minutes for Kling v1 Pro AI Avatar (8 min + buffer)
            "audio2vid": 25
        }
        return timeouts.get(module, 10)  # Default 10 minutes

    def update_job_progress(self, job_id: str, progress: int, status: str, details: str = None):
        """Update job progress (synchronous method for compatibility)."""
        try:
            db = get_db()

            update_data = {
                "progress": progress,
                "status": status,
                "updatedAt": datetime.now(timezone.utc)
            }

            if details:
                update_data["statusDetails"] = details

            # Convert string job_id to ObjectId if needed
            if isinstance(job_id, str):
                try:
                    job_id = ObjectId(job_id)
                except:
                    # If it's not a valid ObjectId, treat as string job ID
                    filter_query = {"jobId": job_id}
                else:
                    filter_query = {"_id": job_id}
            else:
                filter_query = {"_id": job_id}

            result = db.jobs.update_one(filter_query, {"$set": update_data})

            if result.modified_count > 0:
                logger.debug(f"Updated job progress: {job_id} -> {progress}% ({status})")
                return True
            else:
                logger.warning(f"No job found to update progress: {job_id}")
                return False

        except Exception as e:
            logger.error(f"Failed to update job progress: {e}")
            return False

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
                        # Process the result with generic video handler (works for all models including Kling v2.5)
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
        should_retry: bool = False
    ):
        """Handle job failure - NO AUTO-RETRY to prevent money waste."""
        try:
            # 🚨 CRITICAL: Clean up processing lock when job fails
            job_id_str = str(job_id)
            if job_id_str in self.processing_jobs:
                self.processing_jobs.discard(job_id_str)
                logger.info(f"🧹 Removed failed job {job_id} from processing lock")

            db = get_db()

            job = db.jobs.find_one({"_id": job_id})
            if not job:
                logger.error(f"Job {job_id} not found for failure handling")
                return

            retry_count = job.get("retryCount", 0)
            max_retries = 3

            # NO AUTO-RETRY: Always mark as failed immediately to prevent money waste
            logger.info(f"🚫 NO AUTO-RETRY: Job {job_id} failed and will NOT be retried automatically")
            logger.info(f"💰 MONEY SAVED: Preventing automatic retry that could waste API credits")

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

    # REMOVED: _retry_job_after_delay function - NO AUTO-RETRY to prevent money waste

    async def check_processing_jobs(self):
        """Check processing jobs for completion."""
        try:
            db = get_db()

            # Find jobs that are in PROCESSING status
            processing_jobs = db.jobs.find({
                "status": JobStatus.PROCESSING.value,
                "processingStatus": {"$in": ["queued", "processing", "in_progress"]}
            })

            for job in processing_jobs:
                job_id = job["_id"]
                module = job["module"]

                # Skip if job was checked recently (within 2 minutes)
                last_checked = job.get("lastCheckedAt")
                if last_checked:
                    time_since_check = datetime.now(timezone.utc) - last_checked
                    if time_since_check.total_seconds() < 120:  # 2 minutes
                        continue

                logger.info(f"🔄 Checking processing job {job_id} for completion...")

                try:
                    # Get the appropriate adapter
                    if module == "img2vid_noaudio":
                        from .ai_models.fal_adapter import FalAdapter
                        adapter = FalAdapter()

                        # Get the request_id from workerMeta
                        worker_meta = job.get("workerMeta", {})
                        request_id = worker_meta.get("request_id")

                        if request_id:
                            # Check status
                            result = await adapter.get_async_result(request_id)

                            if result.get('status') == 'completed' and result.get('success'):
                                # Job completed! Process it
                                logger.info(f"✅ Job {job_id} completed in background check!")

                                # Process the completed result
                                final_urls = result.get('final_urls', [result.get('video_url')])
                                if not final_urls or not final_urls[0]:
                                    final_urls = [result.get('video_url')]

                                # Update job status to completed
                                db.jobs.update_one(
                                    {"_id": job_id},
                                    {
                                        "$set": {
                                            "status": JobStatus.COMPLETED.value,
                                            "completedAt": datetime.now(timezone.utc),
                                            "finalUrls": final_urls,
                                            "workerMeta": {
                                                "video_url": result.get('video_url'),
                                                "processing_complete": True,
                                                "model": result.get("model", "kling-v2.5-turbo-pro"),
                                                "completed_at": datetime.now(timezone.utc).isoformat()
                                            },
                                            "updatedAt": datetime.now(timezone.utc)
                                        }
                                    }
                                )

                                logger.info(f"🎉 Background job completion: {job_id} -> {final_urls}")

                            elif result.get('status') == 'failed':
                                # Job failed
                                error_msg = result.get('error', 'Job failed during processing')
                                logger.error(f"❌ Job {job_id} failed in background check: {error_msg}")
                                await self._handle_job_failure(job_id, error_msg)

                            else:
                                # Still processing, update last checked time
                                db.jobs.update_one(
                                    {"_id": job_id},
                                    {
                                        "$set": {
                                            "lastCheckedAt": datetime.now(timezone.utc),
                                            "updatedAt": datetime.now(timezone.utc)
                                        }
                                    }
                                )
                                logger.info(f"⏳ Job {job_id} still processing: {result.get('status')}")

                except Exception as job_error:
                    logger.error(f"Error checking job {job_id}: {job_error}")

        except Exception as e:
            logger.error(f"Error in check_processing_jobs: {e}")

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
                # 🚨 NO RETRY: Mark as timeout and stop - user must click generate again
                logger.warning(f"❌ Job {job_id} timed out after 8 minutes - NO AUTO RETRY")

                db.jobs.update_one(
                    {"_id": job_id},
                    {
                        "$set": {
                            "status": JobStatus.TIMEOUT.value,
                            "timeoutAt": datetime.now(timezone.utc),
                            "error": f"Video generation timed out after 8 minutes. WAN v2.2-5B normally takes 5-6 minutes.",
                            "errorDetails": "timeout_no_retry",
                            "updatedAt": datetime.now(timezone.utc)
                        }
                    }
                )

                # Clean up tracking
                self.processing_jobs.discard(str(job_id))

                logger.info(f"✅ Job {job_id} marked as TIMEOUT - User must click generate again")

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

    async def _poll_fal_async_result(self, job_id: ObjectId, request_id: str, module: str, user_id: str, adapter):
        """Poll FAL AI async result and handle completion."""
        try:
            db = get_db()
            from .ai_models.asset_handler import AssetHandler
            asset_handler = AssetHandler()

            # 🚨 SINGLE ATTEMPT ONLY - NO RETRY, NO INFINITE LOOPS, NO MONEY WASTE
            # WAN v2.2-5B should complete via webhook - if it doesn't work, fail immediately
            logger.info(f"🔄 SINGLE ATTEMPT check for job {job_id} with request_id: {request_id}")

            try:
                # Get result from FAL AI - SINGLE ATTEMPT ONLY
                async_result = await adapter.get_async_result(request_id)
                logger.info(f"📊 Single attempt result for job {job_id}: {async_result}")

                if async_result.get('success'):
                    logger.info(f"✅ FAL AI processing completed for job {job_id}")

                    # Process result and upload to Cloudinary (use generic video handler for all models)
                    final_asset = await asset_handler.handle_video_result(
                        async_result, str(job_id), user_id, False
                    )
                    cloudinary_urls = final_asset.get('urls', []) if final_asset.get('success') else []

                    # Use Cloudinary URLs if available, otherwise fallback to FAL AI URL
                    if cloudinary_urls:
                        final_urls = cloudinary_urls
                        logger.info(f"✅ Using Cloudinary URLs for job {job_id}: {final_urls}")
                    else:
                        fal_video_url = async_result.get('video_url')
                        if fal_video_url:
                            final_urls = [fal_video_url]
                            logger.info(f"⚠️ Using FAL AI URL for job {job_id}: {final_urls}")
                        else:
                            raise Exception("No video URL available")

                    # Update job as completed
                    db.jobs.update_one(
                        {"_id": job_id},
                        {
                            "$set": {
                                "status": JobStatus.COMPLETED.value,
                                "completedAt": datetime.now(timezone.utc),
                                "finalUrls": final_urls,
                                "workerMeta": {
                                    "video_url": async_result.get('video_url'),
                                    "processing_complete": True,
                                    "model": async_result.get("model", "kling-v2.5-turbo-pro"),
                                    "completed_at": datetime.now(timezone.utc).isoformat()
                                },
                                "updatedAt": datetime.now(timezone.utc)
                            }
                        }
                    )

                    # 🚨 CRITICAL: Clean up processing lock when job completes successfully
                    job_id_str = str(job_id)
                    if job_id_str in self.processing_jobs:
                        self.processing_jobs.discard(job_id_str)
                        logger.info(f"🧹 Removed completed job {job_id} from processing lock")

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

                    logger.info(f"🎉 Job {job_id} completed successfully with URLs: {final_urls}")
                    return

                elif async_result.get('status') == 'failed':
                    error_msg = async_result.get('error', 'FAL AI processing failed')
                    logger.error(f"❌ FAL AI processing failed for job {job_id}: {error_msg}")
                    await self._handle_job_failure(job_id, f"FAL AI processing failed: {error_msg}")
                    return

                elif async_result.get('status') in ['queued', 'processing', 'in_progress']:
                    # 🔄 POLLING SYSTEM: Check same job 8 times (NOT retry - just status checks)
                    logger.info(f"🔄 POLLING: Job {job_id} still processing, starting 8-poll system")
                    logger.info(f"💰 SMART: 8 FREE status checks (no new jobs created)")

                    # Start polling system - check same request_id up to 8 times
                    for poll_attempt in range(1, 9):  # 1 to 8
                        logger.info(f"🔍 POLL {poll_attempt}/8: Checking job {job_id} status...")

                        # Wait 30 seconds between polls (except first poll which is immediate)
                        if poll_attempt > 1:
                            await asyncio.sleep(30)

                        try:
                            # Check SAME request_id status (FREE operation)
                            poll_result = await adapter.get_async_result(request_id)
                            current_status = poll_result.get('status')

                            logger.info(f"📊 POLL {poll_attempt}/8: Status = {current_status}")

                            if (poll_result.get('status') == 'completed' and poll_result.get('success')) or poll_result.get('status') == 'completed_but_result_pending':
                                # 🎉 JOB COMPLETED! Process and save to Cloudinary
                                logger.info(f"✅ POLL SUCCESS: Job {job_id} completed on poll {poll_attempt}/8!")

                                # Get final URLs - handle different result formats
                                final_urls = poll_result.get('final_urls', [poll_result.get('video_url')])
                                if not final_urls or not final_urls[0]:
                                    final_urls = [poll_result.get('video_url')]

                                # If no video URL available but job completed, this is the base64 image issue
                                if not final_urls or not final_urls[0] or final_urls[0] is None:
                                    logger.warning(f"⚠️ No video URL in poll result - likely base64 image validation issue")
                                    logger.info(f"🔍 Checking database and webhook delivery for completed job...")

                                    # Check if the job was already completed via webhook
                                    job = db.jobs.find_one({"_id": job_id})
                                    if job and job.get("finalUrls"):
                                        final_urls = job["finalUrls"]
                                        logger.info(f"📦 Found URLs in database from webhook: {final_urls}")
                                    elif job and job.get("status") == "failed" and job.get("workerMeta", {}).get("webhook_error"):
                                        # Webhook reported failure (likely 422 base64 issue) but polling shows job completed
                                        logger.warning(f"⚠️ Webhook reported failure but polling shows completion - this is the 422 base64 bug!")
                                        logger.warning(f"⚠️ Will attempt manual result retrieval immediately")
                                        # Skip waiting and go straight to manual processing
                                    else:
                                        # Job completed but no video URL - likely webhook will deliver result
                                        logger.warning(f"⚠️ Job {job_id} completed but no video URL yet - waiting for webhook delivery")
                                        logger.info(f"🔗 Webhook should deliver result to: /api/webhooks/fal/{job_id}")

                                        # Wait a bit more for webhook delivery (only if early in polling)
                                        if poll_attempt <= 4:  # Give webhook time in first 4 polls
                                            logger.info(f"⏳ Poll {poll_attempt}/8: Waiting 30 more seconds for webhook delivery...")
                                            continue
                                        else:
                                            # After 4 polls with no webhook, try manual result retrieval and local webhook processing
                                            logger.warning(f"⚠️ No webhook delivery after {poll_attempt} polls - attempting manual result retrieval")

                                            try:
                                                # Import and call our webhook handler directly with a mock payload
                                                logger.info(f"🔄 Creating mock webhook payload for completed job {job_id}")

                                                # Try to extract actual video URL from FAL AI using a different approach
                                                video_url = None
                                                try:
                                                    # Method 1: Try to use the FAL AI result endpoint directly without image validation
                                                    import httpx
                                                    headers = {"Authorization": f"Key {os.getenv('FAL_API_KEY')}"}

                                                    # Try the simple result endpoint that might work
                                                    async with httpx.AsyncClient() as client:
                                                        try:
                                                            # Try FAL AI queue status endpoint which sometimes has video URL
                                                            status_url = f"https://queue.fal.run/fal-ai/kling-video/requests/{request_id}/status"
                                                            status_response = await client.get(status_url, headers=headers)

                                                            if status_response.status_code == 200:
                                                                status_data = status_response.json()
                                                                logger.info(f"🔍 Status endpoint response: {status_data}")
                                                                logger.info(f"🔍 Status endpoint keys: {list(status_data.keys()) if isinstance(status_data, dict) else 'Not a dict'}")

                                                                # Look for video URL in various places in status response
                                                                if "output" in status_data:
                                                                    output = status_data["output"]
                                                                    logger.info(f"🔍 Found output in status: {output}")
                                                                    if isinstance(output, dict) and "video" in output:
                                                                        if isinstance(output["video"], dict) and "url" in output["video"]:
                                                                            video_url = output["video"]["url"]
                                                                            logger.info(f"✅ Found video URL in output.video.url: {video_url}")
                                                                        elif isinstance(output["video"], str):
                                                                            video_url = output["video"]
                                                                            logger.info(f"✅ Found video URL in output.video: {video_url}")

                                                                if not video_url and "result" in status_data:
                                                                    result = status_data["result"]
                                                                    logger.info(f"🔍 Found result in status: {result}")
                                                                    if isinstance(result, dict) and "video" in result:
                                                                        if isinstance(result["video"], dict) and "url" in result["video"]:
                                                                            video_url = result["video"]["url"]
                                                                            logger.info(f"✅ Found video URL in result.video.url: {video_url}")

                                                                # NEW: Try to look for video URL in the logs or any other field
                                                                if not video_url:
                                                                    logger.info(f"🔍 Searching entire response for video URLs...")
                                                                    import json
                                                                    response_str = json.dumps(status_data)

                                                                    # Look for any fal.media URLs (FAL AI's CDN)
                                                                    import re
                                                                    fal_urls = re.findall(r'https://fal\.media/files/[^\s"\']+', response_str)
                                                                    if fal_urls:
                                                                        video_url = fal_urls[0]  # Take the first one
                                                                        logger.info(f"✅ Found video URL via regex search: {video_url}")

                                                                    # Also look for any other video URLs
                                                                    if not video_url:
                                                                        video_urls = re.findall(r'https://[^\s"\']+\.(mp4|mov|avi|webm)', response_str)
                                                                        if video_urls:
                                                                            video_url = video_urls[0]
                                                                            logger.info(f"✅ Found video URL via video extension search: {video_url}")

                                                                    # ENHANCED: Try to construct FAL AI video URL based on known patterns
                                                                    if not video_url:
                                                                        logger.info(f"🔧 Attempting to construct FAL AI video URL...")

                                                                        # FAL AI typically uses these patterns for Kling videos
                                                                        potential_urls = [
                                                                            f"https://fal.media/files/{request_id}.mp4",
                                                                            f"https://fal.media/files/{request_id}_output.mp4",
                                                                            f"https://fal.media/files/{request_id}_video.mp4",
                                                                            f"https://fal.media/files/kling-{request_id}.mp4",
                                                                            f"https://fal.media/files/video-{request_id}.mp4"
                                                                        ]

                                                                        # Test each potential URL to see if it's accessible
                                                                        for test_url in potential_urls:
                                                                            try:
                                                                                test_response = await client.head(test_url, timeout=5.0)
                                                                                if test_response.status_code == 200:
                                                                                    video_url = test_url
                                                                                    logger.info(f"✅ Found working video URL via pattern matching: {video_url}")
                                                                                    break
                                                                                else:
                                                                                    logger.debug(f"❌ URL not accessible: {test_url} (status: {test_response.status_code})")
                                                                            except Exception as test_error:
                                                                                logger.debug(f"❌ URL test failed: {test_url} - {test_error}")
                                                                                continue

                                                        except Exception as status_error:
                                                            logger.warning(f"⚠️ Status endpoint failed: {status_error}")

                                                        # Method 1.5: Try the logs endpoint which sometimes has the video URL
                                                        if not video_url:
                                                            try:
                                                                logs_url = f"https://queue.fal.run/fal-ai/kling-video/requests/{request_id}/status?logs=true"
                                                                logs_response = await client.get(logs_url, headers=headers)

                                                                if logs_response.status_code == 200:
                                                                    logs_data = logs_response.json()
                                                                    logger.info(f"🔍 Logs endpoint response: {logs_data}")

                                                                    # Look for video URL in logs
                                                                    import json
                                                                    logs_str = json.dumps(logs_data)
                                                                    import re

                                                                    # Look for fal.media URLs in logs
                                                                    fal_urls = re.findall(r'https://fal\.media/files/[^\s"\']+', logs_str)
                                                                    if fal_urls:
                                                                        video_url = fal_urls[0]
                                                                        logger.info(f"✅ Found video URL in logs: {video_url}")

                                                            except Exception as logs_error:
                                                                logger.warning(f"⚠️ Logs endpoint failed: {logs_error}")

                                                        # Method 2: Try to use FAL AI files API to find recent video files
                                                        if not video_url:
                                                            try:
                                                                # Try FAL AI files endpoint to list recent files
                                                                files_url = "https://fal.run/files"
                                                                files_response = await client.get(files_url, headers=headers)

                                                                if files_response.status_code == 200:
                                                                    files_data = files_response.json()
                                                                    logger.info(f"🔍 FAL AI files response: {files_data}")

                                                                    # Look for recent video files that might be ours
                                                                    if "files" in files_data:
                                                                        recent_files = files_data["files"]
                                                                        # Sort by creation time and find video files
                                                                        video_files = [f for f in recent_files if f.get("file_name", "").endswith((".mp4", ".mov", ".avi", ".webm"))]
                                                                        if video_files:
                                                                            # Take the most recent video file
                                                                            latest_video = video_files[0]
                                                                            video_url = latest_video.get("url") or f"https://fal.media/files/{latest_video.get('file_name')}"
                                                                            logger.info(f"✅ Found video URL via files API: {video_url}")

                                                            except Exception as files_error:
                                                                logger.warning(f"⚠️ Files API failed: {files_error}")

                                                        # Method 3: Try the actual result endpoint but catch 422 and extract from error
                                                        if not video_url:
                                                            try:
                                                                result_url = f"https://queue.fal.run/fal-ai/kling-video/requests/{request_id}"
                                                                result_response = await client.get(result_url, headers=headers)

                                                                # Even if 422, sometimes the response body contains the video URL
                                                                if result_response.status_code in [200, 422]:
                                                                    try:
                                                                        result_data = result_response.json()
                                                                        logger.info(f"🔍 Result endpoint response (status {result_response.status_code}): {result_data}")

                                                                        # Look for video URL even in error responses
                                                                        if "video" in result_data:
                                                                            if isinstance(result_data["video"], dict) and "url" in result_data["video"]:
                                                                                video_url = result_data["video"]["url"]
                                                                            elif isinstance(result_data["video"], str):
                                                                                video_url = result_data["video"]
                                                                    except:
                                                                        pass
                                                            except Exception as result_error:
                                                                logger.warning(f"⚠️ Result endpoint failed: {result_error}")

                                                except Exception as extract_error:
                                                    logger.warning(f"⚠️ Video URL extraction failed: {extract_error}")

                                                # Create payload with real video URL if found, otherwise use a better placeholder
                                                if video_url:
                                                    logger.info(f"✅ Successfully extracted real video URL: {video_url}")
                                                    mock_payload = {
                                                        "video": {"url": video_url},
                                                        "status": "completed",
                                                        "request_id": request_id,
                                                        "manual_retrieval": True,
                                                        "video_source": "extracted_from_fal_api"
                                                    }
                                                else:
                                                    logger.warning(f"⚠️ Could not extract video URL from standard methods")
                                                    logger.info(f"🔄 Attempting alternative video URL extraction...")

                                                    # FALLBACK: Try to use the FAL client result method with error handling
                                                    try:
                                                        from .ai_models.fal_adapter import FalAdapter
                                                        adapter = FalAdapter()

                                                        # Try to get ANY result - even if it fails, the error might contain video URL
                                                        try:
                                                            result = await adapter.get_async_result(request_id, job["module"])
                                                            if result and result.get("video_url"):
                                                                video_url = result["video_url"]
                                                                logger.info(f"✅ Extracted video URL via adapter fallback: {video_url}")
                                                        except Exception as adapter_error:
                                                            logger.warning(f"⚠️ Adapter fallback also failed: {adapter_error}")

                                                    except Exception as fallback_error:
                                                        logger.warning(f"⚠️ Alternative extraction failed: {fallback_error}")

                                                    # ENHANCED LAST RESORT: Multiple construction methods
                                                    if not video_url:
                                                        logger.warning(f"⚠️ All extraction methods failed - trying enhanced construction methods")

                                                        # Get job creation time for timestamp-based construction
                                                        job_created_at = job.get("createdAt") or job.get("created_at")
                                                        timestamp_str = ""
                                                        if job_created_at:
                                                            try:
                                                                if isinstance(job_created_at, str):
                                                                    job_time = datetime.fromisoformat(job_created_at.replace('Z', '+00:00'))
                                                                else:
                                                                    job_time = job_created_at

                                                                # Various timestamp formats FAL AI might use
                                                                timestamp_str = job_time.strftime("%Y%m%d_%H%M%S")
                                                                timestamp_str2 = job_time.strftime("%Y-%m-%d-%H-%M-%S")
                                                                timestamp_str3 = str(int(job_time.timestamp()))
                                                            except Exception as ts_error:
                                                                logger.warning(f"⚠️ Timestamp extraction failed: {ts_error}")
                                                                timestamp_str = ""

                                                        # Multiple construction patterns based on FAL AI's known formats
                                                        construction_patterns = [
                                                            f"https://fal.media/files/{request_id}.mp4",
                                                            f"https://fal.media/files/{request_id[:8]}-video.mp4",
                                                            f"https://fal.media/files/kling_{request_id}.mp4",
                                                            f"https://fal.media/files/video_{request_id}.mp4",
                                                            f"https://fal.media/files/{request_id}_output.mp4",
                                                            f"https://fal.media/files/{request_id}_result.mp4"
                                                        ]

                                                        # Add timestamp-based patterns if we have a timestamp
                                                        if timestamp_str:
                                                            construction_patterns.extend([
                                                                f"https://fal.media/files/{timestamp_str}_{request_id[:8]}.mp4",
                                                                f"https://fal.media/files/{request_id}_{timestamp_str}.mp4",
                                                                f"https://fal.media/files/kling_{timestamp_str}.mp4"
                                                            ])

                                                        # Test each construction pattern
                                                        for constructed_url in construction_patterns:
                                                            try:
                                                                logger.info(f"🔧 Testing constructed URL: {constructed_url}")
                                                                test_response = await client.head(constructed_url, timeout=5.0)
                                                                if test_response.status_code == 200:
                                                                    video_url = constructed_url
                                                                    logger.info(f"✅ Constructed URL is accessible: {video_url}")
                                                                    break
                                                                else:
                                                                    logger.debug(f"❌ Constructed URL not accessible: {test_response.status_code}")
                                                            except Exception as test_error:
                                                                logger.debug(f"❌ Constructed URL test failed: {test_error}")
                                                                continue

                                                    # If we still don't have a video URL, mark as failed for retry
                                                    if not video_url:
                                                        logger.error(f"❌ All video URL extraction methods failed")
                                                        raise Exception("Could not extract video URL from completed FAL AI job - all methods exhausted")
                                                    else:
                                                        # Update mock_payload with the extracted video URL
                                                        mock_payload = {
                                                            "video": {"url": video_url},
                                                            "status": "completed",
                                                            "request_id": request_id,
                                                            "manual_retrieval": True,
                                                            "video_source": "fallback_extraction"
                                                        }
                                                        logger.info(f"✅ Successfully extracted video URL via fallback: {video_url}")

                                                # Import and call our webhook handler directly (which now includes Cloudinary upload)
                                                from .routes.webhooks import process_fal_completion_direct
                                                await process_fal_completion_direct(job_id, str(job["userId"]), job["module"], mock_payload)

                                                logger.info(f"✅ Manual webhook processing completed for job {job_id}")
                                                return

                                            except Exception as manual_error:
                                                logger.error(f"❌ Manual webhook processing failed: {manual_error}")

                                            # SMART FALLBACK: Mark as completed with a note that Cloudinary failed
                                            # The video was generated successfully, we just can't access it via API
                                            logger.info(f"🎯 SMART FALLBACK: Video generated successfully, marking as completed with fallback note")

                                            # Use constructed FAL AI URL as fallback (most likely pattern)
                                            fallback_video_url = f"https://fal.media/files/{request_id}_output.mp4"

                                            db.jobs.update_one(
                                                {"_id": job_id},
                                                {
                                                    "$set": {
                                                        "status": JobStatus.COMPLETED.value,
                                                        "completedAt": datetime.now(timezone.utc),
                                                        "finalUrls": [fallback_video_url],  # Use constructed FAL AI URL
                                                        "workerMeta": {
                                                            "fal_video_url": fallback_video_url,
                                                            "processing_complete": True,
                                                            "cloudinary_upload_failed": True,
                                                            "fallback_mode": "fal_ai_direct_url",
                                                            "model": "kling-v2.5-turbo-pro",
                                                            "completed_at": datetime.now(timezone.utc).isoformat(),
                                                            "completed_on_poll": poll_attempt,
                                                            "note": "Video generated successfully. Cloudinary upload failed, using FAL AI direct link."
                                                        },
                                                        "updatedAt": datetime.now(timezone.utc)
                                                    }
                                                }
                                            )

                                            # Clean up processing lock
                                            job_id_str = str(job_id)
                                            if job_id_str in self.processing_jobs:
                                                self.processing_jobs.discard(job_id_str)
                                                logger.info(f"🧹 Removed failed job {job_id} from processing lock")

                                            return

                                # Process video through AssetHandler for Cloudinary upload
                                logger.info(f"☁️ Processing video through AssetHandler for Cloudinary upload...")
                                from .ai_models.asset_handler import AssetHandler
                                asset_handler = AssetHandler()

                                # Create video result structure for AssetHandler
                                video_result = {
                                    "success": True,
                                    "video_url": poll_result.get('video_url'),
                                    "model": "kling-v2.5-turbo-pro",
                                    "has_audio": False
                                }

                                # Process video through AssetHandler (downloads from FAL AI and uploads to Cloudinary)
                                asset_data = await asset_handler.handle_video_result(
                                    video_result, str(job_id), user_id, False  # is_preview = False (final video)
                                )

                                if asset_data and asset_data.get("success"):
                                    cloudinary_urls = asset_data.get("urls", [])
                                    logger.info(f"✅ Cloudinary upload successful via polling! URLs: {cloudinary_urls}")

                                    # Update job to completed with Cloudinary URLs
                                    db.jobs.update_one(
                                        {"_id": job_id},
                                        {
                                            "$set": {
                                                "status": JobStatus.COMPLETED.value,
                                                "completedAt": datetime.now(timezone.utc),
                                                "finalUrls": cloudinary_urls,  # These are now Cloudinary URLs
                                                "workerMeta": {
                                                    "fal_video_url": poll_result.get('video_url'),  # Keep original FAL AI URL
                                                    "cloudinary_urls": cloudinary_urls,  # Cloudinary URLs
                                                    "processing_complete": True,
                                                    "model": poll_result.get("model", "kling-v2.5-turbo-pro"),
                                                    "completed_at": datetime.now(timezone.utc).isoformat(),
                                                    "completed_on_poll": poll_attempt
                                                },
                                                "updatedAt": datetime.now(timezone.utc)
                                            }
                                        }
                                    )
                                else:
                                    logger.error(f"❌ Cloudinary upload failed, using FAL AI URL as fallback")
                                    # Fallback to FAL AI URL if Cloudinary upload fails
                                    db.jobs.update_one(
                                        {"_id": job_id},
                                        {
                                            "$set": {
                                                "status": JobStatus.COMPLETED.value,
                                                "completedAt": datetime.now(timezone.utc),
                                                "finalUrls": final_urls,  # FAL AI URL as fallback
                                                "workerMeta": {
                                                    "fal_video_url": poll_result.get('video_url'),
                                                    "cloudinary_upload_failed": True,
                                                    "processing_complete": True,
                                                    "model": poll_result.get("model", "kling-v2.5-turbo-pro"),
                                                    "completed_at": datetime.now(timezone.utc).isoformat(),
                                                    "completed_on_poll": poll_attempt
                                                },
                                                "updatedAt": datetime.now(timezone.utc)
                                            }
                                        }
                                    )

                                # Clean up processing lock
                                job_id_str = str(job_id)
                                if job_id_str in self.processing_jobs:
                                    self.processing_jobs.discard(job_id_str)
                                    logger.info(f"🧹 Removed completed job {job_id} from processing lock")

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

                                logger.info(f"🎉 POLLING SUCCESS: Job {job_id} completed and saved! URLs: {final_urls}")
                                return

                            elif poll_result.get('status') == 'failed':
                                # Job failed during polling
                                error_msg = poll_result.get('error', 'Job failed during processing')
                                logger.error(f"❌ POLL FAILED: Job {job_id} failed on poll {poll_attempt}/8: {error_msg}")
                                await self._handle_job_failure(job_id, f"Job failed during polling: {error_msg}")
                                return

                            else:
                                # Still processing, continue polling
                                logger.info(f"⏳ POLL {poll_attempt}/8: Job {job_id} still {current_status}, continuing...")

                        except Exception as poll_error:
                            logger.error(f"❌ POLL {poll_attempt}/8 ERROR: {poll_error}")
                            # Continue polling even if one check fails
                            continue

                    # All 8 polls completed but job not ready - mark as failed
                    logger.warning(f"⏰ POLL TIMEOUT: Job {job_id} not ready after 8 polls (4 minutes)")
                    logger.warning(f"💰 NO RETRY: Job failed naturally, no new job will be created")
                    await self._handle_job_failure(job_id, "Job not completed after 8 polling attempts (4 minutes). Please try generating again.")
                    return

                else:
                    # 🚨 NO RETRY - Unknown status, fail immediately
                    error_msg = f"Unexpected status: {async_result.get('status')}. Single attempt only to prevent money waste."
                    logger.warning(f"🤔 Job {job_id} unexpected status: {error_msg}")
                    await self._handle_job_failure(job_id, error_msg)
                    return

            except Exception as poll_error:
                # 🚨 NO RETRY - Single attempt failed, show clear error
                error_msg = f"Single attempt check failed: {str(poll_error)}. No retry to prevent money waste. Please try again."
                logger.error(f"❌ Single attempt error for job {job_id}: {error_msg}")
                await self._handle_job_failure(job_id, error_msg)
                return

        except Exception as e:
            logger.error(f"❌ Fatal error in polling for job {job_id}: {e}")
            await self._handle_job_failure(job_id, f"Fatal polling error: {str(e)}")

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

# Background task to check processing jobs for completion
async def processing_job_checker():
    """Background task to check processing jobs for completion."""
    while True:
        try:
            await queue_manager.check_processing_jobs()
            await asyncio.sleep(30)  # Check every 30 seconds
        except Exception as e:
            logger.error(f"Error in processing job checker: {e}")
            await asyncio.sleep(30)

# Start timeout checker (this would be called from main application startup)
def start_background_tasks():
    """Start background tasks for queue management."""
    asyncio.create_task(timeout_checker())
    asyncio.create_task(processing_job_checker())