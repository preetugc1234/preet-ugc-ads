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
from ..ai_models.asset_handler import AssetHandler

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
        asset_handler = AssetHandler()

        # Process based on module type
        asset_data = None

        if module == "img2vid_noaudio":
            # Handle video result from direct Fal AI response
            video_info = payload_data.get("video", {})
            video_url = video_info.get("url")

            if not video_url:
                raise Exception(f"No video URL in payload: {payload_data}")

            video_result = {
                "success": True,
                "video_url": video_url,
                "thumbnail_url": video_info.get("thumbnail_url"),
                "duration": video_info.get("duration", 10),
                "model": "kling-v2.1-pro",
                "has_audio": False
            }

            asset_data = await asset_handler.handle_video_result(
                video_result, str(job_id), user_id, False
            )

        elif module == "img2vid_audio" or module == "kling_avatar":
            # Handle Kling AI Avatar result
            video_info = payload_data.get("video", {})
            video_result = {
                "success": True,
                "video_url": video_info.get("url"),
                "duration": video_info.get("duration", 0),
                "model": "kling-v1-pro-ai-avatar",
                "has_audio": True,
                "audio_synced": True
            }

            asset_data = await asset_handler.handle_video_result(
                video_result, str(job_id), user_id, True  # has_audio = True
            )

        elif module == "tts" or module == "tts_turbo":
            # Handle ElevenLabs TTS Turbo v2.5 result
            audio_info = payload_data.get("audio", {})
            audio_result = {
                "success": True,
                "audio_url": audio_info.get("url"),
                "timestamps": payload_data.get("timestamps", []),
                "model": "elevenlabs-tts-multilingual-v2",
                "has_audio": True
            }

            asset_data = await asset_handler.handle_audio_result(
                audio_result, str(job_id), user_id
            )

        if asset_data and asset_data.get("success"):
            final_urls = asset_data.get("urls", [])

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
            from ..database import GenerationModel
            generation_doc = GenerationModel.create_generation(
                user_id=ObjectId(user_id),
                job_id=job_id,
                generation_type=module,
                preview_url=db.jobs.find_one({"_id": job_id}).get("previewUrl", ""),
                final_urls=final_urls,
                size_bytes=sum([1024 for _ in final_urls])
            )

            db.generations.insert_one(generation_doc)

            # Handle history eviction
            from ..database import cleanup_old_generations
            cleanup_old_generations(ObjectId(user_id), max_count=30)

            logger.info(f"Fal AI job {job_id} completed successfully via direct webhook")

        else:
            raise Exception("Failed to process video asset or unsupported module")

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
    """Process completed Fal AI result in background."""
    try:
        db = get_db()
        asset_handler = AssetHandler()

        # Process based on module type
        asset_data = None

        if module == "img2vid_noaudio":
            # Handle video result
            video_result = {
                "success": True,
                "video_url": result.get("video", {}).get("url"),
                "duration": 10,  # Default duration
                "model": "kling-v2.1-pro",
                "has_audio": False
            }

            asset_data = await asset_handler.handle_video_result(
                video_result, str(job_id), user_id, False
            )

        elif module == "img2vid_audio" or module == "kling_avatar":
            # Handle Kling AI Avatar result
            video_result = {
                "success": True,
                "video_url": result.get("video", {}).get("url"),
                "duration": result.get("duration", 0),
                "model": "kling-v1-pro-ai-avatar",
                "has_audio": True,
                "audio_synced": True
            }

            asset_data = await asset_handler.handle_video_result(
                video_result, str(job_id), user_id, True  # has_audio = True
            )

        elif module == "tts" or module == "tts_turbo":
            # Handle ElevenLabs TTS Turbo v2.5 result
            audio_result = {
                "success": True,
                "audio_url": result.get("audio", {}).get("url"),
                "timestamps": result.get("timestamps", []),
                "model": "elevenlabs-tts-multilingual-v2",
                "has_audio": True
            }

            asset_data = await asset_handler.handle_audio_result(
                audio_result, str(job_id), user_id
            )

        if asset_data and asset_data.get("success"):
            final_urls = asset_data.get("urls", [])

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
            from ..database import GenerationModel
            generation_doc = GenerationModel.create_generation(
                user_id=ObjectId(user_id),
                job_id=job_id,
                generation_type=module,
                preview_url=db.jobs.find_one({"_id": job_id}).get("previewUrl", ""),
                final_urls=final_urls,
                size_bytes=sum([1024 for _ in final_urls])
            )

            db.generations.insert_one(generation_doc)

            # Handle history eviction
            from ..database import cleanup_old_generations
            cleanup_old_generations(ObjectId(user_id), max_count=30)

            logger.info(f"Fal AI job {job_id} completed successfully via webhook")

        else:
            raise Exception("Failed to process video asset or unsupported module")

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