"""
Webhook endpoints for AI model integrations
Handles callbacks from Fal AI and other services
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any

from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel
from bson import ObjectId

from ..database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

class FalWebhookPayload(BaseModel):
    """Webhook payload from Fal AI."""
    request_id: str
    status: str
    result: Dict[str, Any] = None
    error: str = None

@router.post("/fal/{job_id}")
async def fal_webhook_with_job_id(job_id: str, request: Request, background_tasks: BackgroundTasks):
    """Handle webhook from Fal AI with job ID in URL path."""
    try:
        payload_data = await request.json()
        logger.info(f"Received Fal webhook for job {job_id}: {payload_data}")

        db = get_db()

        # Find job by ID directly
        try:
            job = db.jobs.find_one({"_id": ObjectId(job_id)})
        except:
            logger.error(f"Invalid job ID format: {job_id}")
            return {"success": False, "message": "Invalid job ID"}

        if not job:
            logger.warning(f"Job not found for ID: {job_id}")
            return {"success": False, "message": "Job not found"}

        user_id = str(job["userId"])

        # Handle different Fal AI response formats
        if "video" in payload_data and payload_data["video"]:
            # Process the completed result
            background_tasks.add_task(
                process_fal_completion_direct,
                ObjectId(job_id),
                user_id,
                job["module"],
                payload_data
            )
            return {"success": True, "message": "Webhook processed"}

        elif "error" in payload_data or "status" in payload_data:
            # Handle failure
            error_message = payload_data.get("error", "Fal AI processing failed")
            db.jobs.update_one(
                {"_id": ObjectId(job_id)},
                {
                    "$set": {
                        "status": "failed",
                        "errorMessage": error_message,
                        "failedAt": datetime.now(timezone.utc),
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )
            logger.error(f"Fal AI job {job_id} failed: {error_message}")
            return {"success": True, "message": "Failure processed"}

        else:
            logger.info(f"Fal AI job {job_id} status update: {payload_data}")
            return {"success": True, "message": "Status updated"}

    except Exception as e:
        logger.error(f"Error processing Fal webhook for job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.post("/fal")
async def fal_webhook(payload: FalWebhookPayload, background_tasks: BackgroundTasks):
    """Handle webhook from Fal AI for async job completion."""
    try:
        logger.info(f"Received Fal webhook: {payload.request_id} - {payload.status}")

        db = get_db()

        # Find job by provider request ID (updated field name)
        job = db.jobs.find_one({"providerRequestId": payload.request_id})
        if not job:
            # Try legacy field name for compatibility
            job = db.jobs.find_one({"falRequestId": payload.request_id})
            if not job:
                logger.warning(f"Job not found for Fal request ID: {payload.request_id}")
                return {"success": False, "message": "Job not found"}

        job_id = job["_id"]
        user_id = str(job["userId"])

        if payload.status == "completed" and payload.result:
            # Process the completed result
            background_tasks.add_task(
                process_fal_completion,
                job_id,
                user_id,
                job["module"],
                payload.result
            )

            return {"success": True, "message": "Webhook processed"}

        elif payload.status == "failed":
            # Handle failure
            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "failed",
                        "errorMessage": payload.error or "Fal AI processing failed",
                        "failedAt": datetime.now(timezone.utc),
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            logger.error(f"Fal AI job {payload.request_id} failed: {payload.error}")
            return {"success": True, "message": "Failure processed"}

        else:
            logger.info(f"Fal AI job {payload.request_id} status: {payload.status}")
            return {"success": True, "message": "Status updated"}

    except Exception as e:
        logger.error(f"Error processing Fal webhook: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

async def process_fal_completion_direct(job_id: ObjectId, user_id: str, module: str, payload_data: Dict[str, Any]):
    """Process completed Fal AI result directly from webhook payload."""
    try:
        db = get_db()

        # Process based on module type - DIRECT SAVE APPROACH

        if module == "img2vid_noaudio":
            # Handle video result from direct Fal AI response - SIMPLE APPROACH
            video_info = payload_data.get("video", {})
            video_url = video_info.get("url")

            if not video_url:
                raise Exception(f"No video URL in webhook payload: {payload_data}")

            logger.info(f"✅ WEBHOOK SUCCESS: Got video URL directly from FAL AI: {video_url}")

            # SIMPLE: Just save the video URL directly without any additional API calls
            final_urls = [video_url]

            # Update job to completed immediately
            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "completedAt": datetime.now(timezone.utc),
                        "finalUrls": final_urls,
                        "workerMeta": {
                            "video_url": video_url,
                            "processing_complete": True,
                            "model": "kling-v2.5-turbo-pro",
                            "completed_via": "webhook",
                            "completed_at": datetime.now(timezone.utc).isoformat()
                        },
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            # Create generation record
            from ..database import GenerationModel
            generation_doc = GenerationModel.create_generation(
                user_id=ObjectId(user_id),
                job_id=job_id,
                generation_type="img2vid_noaudio",
                preview_url="",
                final_urls=final_urls,
                size_bytes=1024  # Placeholder
            )

            db.generations.insert_one(generation_doc)

            # Handle history eviction
            from ..database import cleanup_old_generations
            cleanup_old_generations(ObjectId(user_id), max_count=30)

            logger.info(f"Fal AI job {job_id} completed successfully via direct webhook")
            return

        elif module == "img2vid_audio" or module == "kling_avatar":
            # Handle Kling AI Avatar result - DIRECT SAVE (no additional API calls)
            video_info = payload_data.get("video", {})
            video_url = video_info.get("url")

            if not video_url:
                raise Exception(f"No video URL in webhook payload: {payload_data}")

            final_urls = [video_url]

            # Update job to completed immediately
            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "completedAt": datetime.now(timezone.utc),
                        "finalUrls": final_urls,
                        "workerMeta": {
                            "video_url": video_url,
                            "processing_complete": True,
                            "model": "kling-v1-pro-ai-avatar",
                            "completed_via": "webhook",
                            "completed_at": datetime.now(timezone.utc).isoformat()
                        },
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            # Create generation record
            from ..database import GenerationModel
            generation_doc = GenerationModel.create_generation(
                user_id=ObjectId(user_id),
                job_id=job_id,
                generation_type=module,
                preview_url="",
                final_urls=final_urls,
                size_bytes=1024
            )

            db.generations.insert_one(generation_doc)

            # Handle history eviction
            from ..database import cleanup_old_generations
            cleanup_old_generations(ObjectId(user_id), max_count=30)

            logger.info(f"Fal AI job {job_id} completed successfully via direct webhook")
            return

        elif module == "tts" or module == "tts_turbo":
            # Handle ElevenLabs TTS result - DIRECT SAVE (no additional API calls)
            audio_info = payload_data.get("audio", {})
            audio_url = audio_info.get("url")

            if not audio_url:
                raise Exception(f"No audio URL in webhook payload: {payload_data}")

            final_urls = [audio_url]

            # Update job to completed immediately
            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "completedAt": datetime.now(timezone.utc),
                        "finalUrls": final_urls,
                        "workerMeta": {
                            "audio_url": audio_url,
                            "processing_complete": True,
                            "model": "elevenlabs-tts-multilingual-v2",
                            "completed_via": "webhook",
                            "completed_at": datetime.now(timezone.utc).isoformat()
                        },
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            # Create generation record
            from ..database import GenerationModel
            generation_doc = GenerationModel.create_generation(
                user_id=ObjectId(user_id),
                job_id=job_id,
                generation_type=module,
                preview_url="",
                final_urls=final_urls,
                size_bytes=1024
            )

            db.generations.insert_one(generation_doc)

            # Handle history eviction
            from ..database import cleanup_old_generations
            cleanup_old_generations(ObjectId(user_id), max_count=30)

            logger.info(f"Fal AI job {job_id} completed successfully via direct webhook")
            return

        else:
            raise Exception(f"Unsupported module: {module}")

    except Exception as e:
        logger.error(f"Error processing Fal completion directly: {e}")

        # Mark job as failed
        db = get_db()
        db.jobs.update_one(
            {"_id": job_id},
            {
                "$set": {
                    "status": "failed",
                    "errorMessage": f"Post-processing failed: {str(e)}",
                    "failedAt": datetime.now(timezone.utc),
                    "updatedAt": datetime.now(timezone.utc)
                }
            }
        )

async def process_fal_completion(job_id: ObjectId, user_id: str, module: str, result: Dict[str, Any]):
    """Process completed Fal AI result in background - DIRECT SAVE APPROACH."""
    try:
        db = get_db()

        # Process based on module type - DIRECT SAVE APPROACH
        if module == "img2vid_noaudio":
            # Handle video result - DIRECT SAVE
            video_url = result.get("video", {}).get("url")

            if not video_url:
                raise Exception(f"No video URL in result: {result}")

            final_urls = [video_url]

            # Update job as completed
            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "finalUrls": final_urls,
                        "completedAt": datetime.now(timezone.utc),
                        "workerMeta": {
                            "video_url": video_url,
                            "processing_complete": True,
                            "model": "kling-v2.5-turbo-pro",
                            "completed_via": "legacy_webhook",
                            "completed_at": datetime.now(timezone.utc).isoformat()
                        },
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            # Create generation record
            from ..database import GenerationModel
            generation_doc = GenerationModel.create_generation(
                user_id=ObjectId(user_id),
                job_id=job_id,
                generation_type=module,
                preview_url="",
                final_urls=final_urls,
                size_bytes=1024
            )

            db.generations.insert_one(generation_doc)

            # Handle history eviction
            from ..database import cleanup_old_generations
            cleanup_old_generations(ObjectId(user_id), max_count=30)

            logger.info(f"Fal AI job {job_id} completed successfully via legacy webhook")

        elif module == "img2vid_audio" or module == "kling_avatar":
            # Handle Kling AI Avatar result - DIRECT SAVE
            video_url = result.get("video", {}).get("url")

            if not video_url:
                raise Exception(f"No video URL in result: {result}")

            final_urls = [video_url]

            # Update job as completed
            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "finalUrls": final_urls,
                        "completedAt": datetime.now(timezone.utc),
                        "workerMeta": {
                            "video_url": video_url,
                            "processing_complete": True,
                            "model": "kling-v1-pro-ai-avatar",
                            "completed_via": "legacy_webhook",
                            "completed_at": datetime.now(timezone.utc).isoformat()
                        },
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            # Create generation record
            from ..database import GenerationModel
            generation_doc = GenerationModel.create_generation(
                user_id=ObjectId(user_id),
                job_id=job_id,
                generation_type=module,
                preview_url="",
                final_urls=final_urls,
                size_bytes=1024
            )

            db.generations.insert_one(generation_doc)

            # Handle history eviction
            from ..database import cleanup_old_generations
            cleanup_old_generations(ObjectId(user_id), max_count=30)

            logger.info(f"Fal AI job {job_id} completed successfully via legacy webhook")

        elif module == "tts" or module == "tts_turbo":
            # Handle ElevenLabs TTS result - DIRECT SAVE
            audio_url = result.get("audio", {}).get("url")

            if not audio_url:
                raise Exception(f"No audio URL in result: {result}")

            final_urls = [audio_url]

            # Update job as completed
            db.jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "finalUrls": final_urls,
                        "completedAt": datetime.now(timezone.utc),
                        "workerMeta": {
                            "audio_url": audio_url,
                            "processing_complete": True,
                            "model": "elevenlabs-tts-multilingual-v2",
                            "completed_via": "legacy_webhook",
                            "completed_at": datetime.now(timezone.utc).isoformat()
                        },
                        "updatedAt": datetime.now(timezone.utc)
                    }
                }
            )

            # Create generation record
            from ..database import GenerationModel
            generation_doc = GenerationModel.create_generation(
                user_id=ObjectId(user_id),
                job_id=job_id,
                generation_type=module,
                preview_url="",
                final_urls=final_urls,
                size_bytes=1024
            )

            db.generations.insert_one(generation_doc)

            # Handle history eviction
            from ..database import cleanup_old_generations
            cleanup_old_generations(ObjectId(user_id), max_count=30)

            logger.info(f"Fal AI job {job_id} completed successfully via legacy webhook")

        else:
            raise Exception(f"Unsupported module: {module}")

    except Exception as e:
        logger.error(f"Error processing Fal completion: {e}")

        # Mark job as failed
        db = get_db()
        db.jobs.update_one(
            {"_id": job_id},
            {
                "$set": {
                    "status": "failed",
                    "errorMessage": f"Post-processing failed: {str(e)}",
                    "failedAt": datetime.now(timezone.utc),
                    "updatedAt": datetime.now(timezone.utc)
                }
            }
        )

@router.get("/fal/test")
async def test_fal_webhook():
    """Test endpoint for Fal webhook integration."""
    return {
        "service": "Fal AI Webhook",
        "status": "active",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "endpoints": {
            "webhook": "/api/webhooks/fal",
            "test": "/api/webhooks/fal/test"
        }
    }

@router.post("/openrouter")
async def openrouter_webhook(request: Request):
    """Handle webhook from OpenRouter (if needed in future)."""
    try:
        payload = await request.json()
        logger.info(f"Received OpenRouter webhook: {payload}")

        # OpenRouter doesn't typically use webhooks, but this is here for future use
        return {"success": True, "message": "OpenRouter webhook received"}

    except Exception as e:
        logger.error(f"Error processing OpenRouter webhook: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

@router.get("/status")
async def webhook_status():
    """Get webhook service status."""
    return {
        "webhooks": {
            "fal": {
                "endpoint": "/api/webhooks/fal",
                "description": "Handles Fal AI async job completions",
                "supported_events": ["completed", "failed"]
            },
            "openrouter": {
                "endpoint": "/api/webhooks/openrouter",
                "description": "Future OpenRouter webhook support",
                "supported_events": []
            }
        },
        "status": "active",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }