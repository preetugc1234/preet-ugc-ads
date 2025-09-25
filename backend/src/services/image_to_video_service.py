"""
Image-to-Video+Audio Service - Using Kling AI Avatar model
Handles image + audio to video generation, progress tracking, and Cloudinary integration
"""

import os
import asyncio
import logging
import uuid
import json
import httpx
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from ..ai_models.fal_adapter import FalAdapter
from ..queue_manager import QueueManager

# Import Cloudinary with error handling
try:
    import cloudinary
    import cloudinary.uploader
    from cloudinary.utils import cloudinary_url
except ImportError:
    cloudinary = None

logger = logging.getLogger(__name__)

class ImageToVideoService:
    """Service for handling Image+Audio-to-Video generation using Kling AI Avatar."""

    def __init__(self):
        self.fal_adapter = FalAdapter()
        self.queue_manager = QueueManager()

        # Cloudinary configuration
        self.cloudinary_cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
        self.cloudinary_api_key = os.getenv("CLOUDINARY_API_KEY")
        self.cloudinary_api_secret = os.getenv("CLOUDINARY_API_SECRET")

        if cloudinary and all([self.cloudinary_cloud_name, self.cloudinary_api_key, self.cloudinary_api_secret]):
            cloudinary.config(
                cloud_name=self.cloudinary_cloud_name,
                api_key=self.cloudinary_api_key,
                api_secret=self.cloudinary_api_secret,
                secure=True
            )
            self.cloudinary_configured = True
            logger.info("✅ Cloudinary configured successfully for image-to-video uploads")
        else:
            self.cloudinary_configured = False
            logger.warning("⚠️ Cloudinary not configured - video uploads will use original URLs")

    async def generate_image_to_video_async(self,
                                          image_url: str,
                                          audio_url: str,
                                          prompt: str = "",
                                          user_id: str = None,
                                          job_id: str = None) -> Dict[str, Any]:
        """
        Generate Image+Audio-to-Video asynchronously using Kling AI Avatar.

        Returns:
            Dict with success status, request_id, video_url, cloudinary_url, metadata
        """
        try:
            # Generate unique job ID if not provided
            if not job_id:
                job_id = str(uuid.uuid4())

            logger.info(f"🎬 Starting Image+Audio-to-Video generation for job {job_id}")

            # Update job progress
            if self.queue_manager:
                self._update_job_progress(job_id, 10, "initializing")

            # Validate inputs
            if not image_url:
                raise ValueError("Image URL is required")
            if not audio_url:
                raise ValueError("Audio URL is required")

            if not image_url.startswith(('http://', 'https://')):
                raise ValueError(f"Invalid image URL format: {image_url}")
            if not audio_url.startswith(('http://', 'https://')):
                raise ValueError(f"Invalid audio URL format: {audio_url}")

            logger.info(f"🖼️ Image URL: {image_url[:50]}...")
            logger.info(f"🎵 Audio URL: {audio_url[:50]}...")
            if prompt:
                logger.info(f"💬 Prompt: {prompt}")

            # Update progress
            if self.queue_manager:
                self._update_job_progress(job_id, 20, "submitting_to_fal")

            # Submit to FAL AI Kling Avatar
            fal_params = {
                "image_url": image_url,
                "audio_url": audio_url
            }

            if prompt.strip():
                fal_params["prompt"] = prompt

            fal_result = await self.fal_adapter.submit_kling_avatar_async(fal_params)

            if not fal_result.get("success"):
                error_msg = fal_result.get("error", "Kling Avatar submission failed")
                logger.error(f"❌ Kling Avatar submission failed: {error_msg}")

                if self.queue_manager:
                    self._update_job_progress(job_id, 0, "failed", error_msg)

                return {
                    "success": False,
                    "error": error_msg,
                    "job_id": job_id
                }

            request_id = fal_result.get("request_id")
            estimated_time = fal_result.get("estimated_processing_time", "7-8 minutes")

            logger.info(f"✅ Kling Avatar submission successful: {request_id}")

            # Update progress
            if self.queue_manager:
                self._update_job_progress(job_id, 30, "processing_on_fal",
                                        f"Request ID: {request_id}, ETA: {estimated_time}")

            # Poll for completion with optimized intervals
            max_polls = 50  # 50 polls * 20 seconds = ~17 minutes max
            poll_count = 0

            while poll_count < max_polls:
                # Wait 20 seconds between polls (optimized for Kling Avatar)
                await asyncio.sleep(20)
                poll_count += 1

                # Update progress incrementally
                progress = min(30 + (poll_count * 1.2), 85)
                self._update_job_progress(job_id, int(progress), "processing_on_fal",
                                        f"Polling attempt {poll_count}/{max_polls}")

                # Check Kling Avatar status
                try:
                    status_result = await self.fal_adapter.check_kling_avatar_status(request_id)
                    logger.info(f"📊 Kling Avatar status check result: {status_result}")

                    if not status_result.get("success"):
                        logger.warning(f"⚠️ Status check failed: {status_result.get('error')}")
                        continue

                    status = status_result.get("status", "unknown").lower()
                    logger.info(f"📊 Kling Avatar status: {status} (poll {poll_count}/{max_polls})")

                    if status in ["completed", "success"]:
                        logger.info(f"🎉 Kling Avatar processing completed! Getting result...")

                        # Get the result
                        result = await self.fal_adapter.get_kling_avatar_result(request_id)
                        logger.info(f"📋 Kling Avatar result: {result}")

                        if result.get("success") and result.get("video_url"):
                            video_url = result["video_url"]
                            duration = result.get("duration", 0)
                            logger.info(f"🎬 Got video URL: {video_url}")

                            # Update progress
                            self._update_job_progress(job_id, 90, "uploading_to_cloudinary")

                            # Download and upload to Cloudinary
                            logger.info(f"☁️ Starting Cloudinary upload...")
                            cloudinary_result = await self._handle_video_upload(
                                video_url, user_id, job_id, "kling_avatar"
                            )

                            if not cloudinary_result["success"]:
                                logger.warning(f"⚠️ Cloudinary upload failed: {cloudinary_result.get('error')}")
                                logger.info(f"📁 Using original Kling Avatar URL: {video_url}")
                                # Continue with original URL if Cloudinary fails
                                final_video_url = video_url
                                public_id = None
                            else:
                                final_video_url = cloudinary_result["cloudinary_url"]
                                public_id = cloudinary_result["public_id"]
                                logger.info(f"✅ Cloudinary upload successful: {final_video_url}")

                            # Update final progress
                            self._update_job_progress(job_id, 100, "completed")

                            return {
                                "success": True,
                                "job_id": job_id,
                                "request_id": request_id,
                                "video_url": final_video_url,
                                "original_video_url": video_url,
                                "duration": duration,
                                "has_audio": True,
                                "audio_synced": True,
                                "cloudinary_public_id": public_id,
                                "processing_time": f"{poll_count * 20} seconds",
                                "model": "kling-v1-pro-ai-avatar",
                                "prompt": prompt
                            }
                        else:
                            error_msg = result.get("error", "No video URL in result")
                            logger.error(f"❌ Kling Avatar result error: {error_msg}")
                            logger.error(f"❌ Full result: {result}")

                            self._update_job_progress(job_id, 0, "failed", error_msg)

                            return {
                                "success": False,
                                "error": error_msg,
                                "job_id": job_id,
                                "debug_result": result
                            }

                    elif status in ["failed", "error"]:
                        error_msg = status_result.get("error", "Kling Avatar processing failed")
                        logger.error(f"❌ Kling Avatar processing failed: {error_msg}")

                        self._update_job_progress(job_id, 0, "failed", error_msg)

                        return {
                            "success": False,
                            "error": error_msg,
                            "job_id": job_id
                        }

                    else:
                        # Continue polling for other statuses (in_progress, queued, etc.)
                        logger.info(f"⏳ Still processing... Status: {status}")

                except Exception as poll_error:
                    logger.error(f"❌ Polling error: {poll_error}")
                    # Continue polling even if individual poll fails

            # Timeout reached
            error_msg = f"Processing timeout after {max_polls * 20} seconds (~{max_polls * 20 // 60} minutes)"
            logger.error(f"⏰ {error_msg}")

            if self.queue_manager:
                self._update_job_progress(job_id, 0, "timeout", error_msg)

            return {
                "success": False,
                "error": error_msg,
                "job_id": job_id
            }

        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Image+Audio-to-Video generation failed: {error_msg}")

            if self.queue_manager and job_id:
                self._update_job_progress(job_id, 0, "failed", error_msg)

            return {
                "success": False,
                "error": error_msg,
                "job_id": job_id
            }

    async def _handle_video_upload(self, video_url: str, user_id: str, job_id: str, model_type: str) -> Dict[str, Any]:
        """Download video from FAL and upload to Cloudinary with retry logic."""
        if not self.cloudinary_configured:
            return {"success": False, "error": "Cloudinary not configured"}

        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"📥 Downloading video from Kling Avatar: {video_url} (attempt {attempt + 1})")

                # Download video from FAL with timeout
                timeout = httpx.Timeout(90.0, connect=30.0)  # 90s total, 30s connect timeout
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(video_url)
                    response.raise_for_status()
                    video_data = response.content

                # Generate public ID with meaningful naming
                timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
                public_id = f"ugc_videos/img2vid_audio/{user_id or 'anonymous'}/{job_id}_{model_type}_{timestamp}"

                logger.info(f"☁️ Uploading to Cloudinary: {public_id} (attempt {attempt + 1})")

                # Upload to Cloudinary with proper timeout and optimized parameters
                upload_result = await asyncio.wait_for(
                    asyncio.to_thread(
                        cloudinary.uploader.upload,
                        video_data,
                        public_id=public_id,
                        resource_type="video",
                        folder="ugc_videos/img2vid_audio",
                        use_filename=False,
                        unique_filename=True,
                        overwrite=False,
                        quality="auto",
                        format="mp4",
                        tags=[f"user_{user_id}", f"job_{job_id}", f"model_{model_type}", "img2vid_audio"],
                        # Optimized for high quality image-to-video results
                        eager_async=False,
                        timeout=180  # 3 minutes timeout for Cloudinary upload (longer for high quality)
                    ),
                    timeout=210  # 3.5 minutes total timeout for the upload
                )

                cloudinary_url = upload_result.get("secure_url") or upload_result.get("url")

                if not cloudinary_url:
                    raise Exception("No URL returned from Cloudinary")

                logger.info(f"✅ Video uploaded to Cloudinary: {public_id}")

                return {
                    "success": True,
                    "cloudinary_url": cloudinary_url,
                    "public_id": public_id,
                    "file_size": len(video_data),
                    "format": upload_result.get("format", "mp4"),
                    "duration": upload_result.get("duration"),
                    "width": upload_result.get("width"),
                    "height": upload_result.get("height"),
                    "quality": upload_result.get("quality", "auto")
                }

            except (httpx.HTTPError, httpx.TimeoutException, asyncio.TimeoutError) as e:
                logger.warning(f"⚠️ Attempt {attempt + 1} failed with network error: {type(e).__name__}: {e}")
                if attempt == max_retries - 1:  # Last attempt
                    logger.error(f"❌ All {max_retries} attempts failed - network error: {e}")
                    return {"success": False, "error": f"Network error after {max_retries} attempts: {str(e)}"}
                # Wait before retry (exponential backoff)
                await asyncio.sleep(2 ** attempt)
                continue

            except Exception as e:
                # Check if it's a connection-related error that we should retry
                error_str = str(e).lower()
                if any(keyword in error_str for keyword in ['connection', 'timeout', 'protocol', 'remote end closed']):
                    logger.warning(f"⚠️ Attempt {attempt + 1} failed with connection error: {e}")
                    if attempt == max_retries - 1:  # Last attempt
                        logger.error(f"❌ All {max_retries} attempts failed - connection error: {e}")
                        return {"success": False, "error": f"Connection error after {max_retries} attempts: {str(e)}"}
                    # Wait before retry (exponential backoff)
                    await asyncio.sleep(2 ** attempt)
                    continue
                else:
                    # Non-retryable error
                    logger.error(f"❌ Cloudinary upload failed with non-retryable error: {e}")
                    return {"success": False, "error": f"Cloudinary upload failed: {str(e)}"}

        # This should never be reached due to the retry logic, but just in case
        return {"success": False, "error": f"Upload failed after {max_retries} attempts"}

    def _update_job_progress(self, job_id: str, progress: int, status: str, details: str = None):
        """Update job progress (simplified logging for image-to-video)."""
        try:
            # Just log the progress instead of trying to update database
            # since we're not creating actual job records for direct API calls
            logger.info(f"🔄 Job {job_id[:8]}... Progress: {progress}% ({status})")
            if details:
                logger.info(f"   └── {details}")
        except Exception as e:
            logger.warning(f"Failed to log job progress: {e}")

    async def estimate_processing_time(self, audio_duration_seconds: int = None) -> Dict[str, Any]:
        """Calculate processing time and cost estimates for Kling Avatar based on audio duration."""
        try:
            # Base processing time for Kling Avatar: ~7-8 minutes regardless of audio length
            # Kling Avatar automatically matches video duration to audio length
            base_processing_seconds = 450  # 7.5 minutes average

            # Credits: Set to 0 for testing purposes
            total_credits = 0  # FREE FOR TESTING

            # Add buffer for queue and initialization
            total_seconds_with_buffer = base_processing_seconds + 300  # 5 minutes buffer

            # Format display time
            if base_processing_seconds < 60:
                processing_time = f"{base_processing_seconds} seconds"
            else:
                minutes = base_processing_seconds // 60
                seconds = base_processing_seconds % 60
                processing_time = f"{minutes}m {seconds}s" if seconds > 0 else f"{minutes}m"

            # Audio duration info
            audio_info = ""
            if audio_duration_seconds:
                if audio_duration_seconds < 60:
                    audio_info = f"{audio_duration_seconds} seconds"
                else:
                    audio_minutes = audio_duration_seconds // 60
                    audio_secs = audio_duration_seconds % 60
                    audio_info = f"{audio_minutes}m {audio_secs}s" if audio_secs > 0 else f"{audio_minutes}m"

            return {
                "success": True,
                "processing_time": processing_time,
                "processing_seconds": base_processing_seconds,
                "total_seconds_with_buffer": total_seconds_with_buffer,
                "total_credits": total_credits,
                "credit_breakdown": "FREE FOR TESTING - No credits required during testing phase",
                "model": "kling-v1-pro-ai-avatar",
                "has_audio": True,
                "quality": "pro",
                "video_duration": "Auto-matches audio length" + (f" (~{audio_info})" if audio_info else ""),
                "duration_policy": "Video duration automatically matches the provided audio duration"
            }
        except Exception as e:
            logger.error(f"Failed to estimate processing time: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def delete_video_from_cloudinary(self, public_id: str) -> bool:
        """Delete video from Cloudinary (for cleanup)."""
        if not self.cloudinary_configured:
            return False

        try:
            result = await asyncio.to_thread(
                cloudinary.uploader.destroy,
                public_id,
                resource_type="video"
            )

            success = result.get("result") == "ok"
            if success:
                logger.info(f"✅ Deleted video from Cloudinary: {public_id}")
            else:
                logger.warning(f"⚠️ Failed to delete video from Cloudinary: {public_id}")

            return success
        except Exception as e:
            logger.error(f"❌ Error deleting video from Cloudinary: {e}")
            return False

    def get_video_transform_url(self, public_id: str, width: int = None, height: int = None, quality: str = "auto") -> str:
        """Generate optimized video URL with transformations."""
        if not self.cloudinary_configured or not public_id:
            return ""

        try:
            transform_params = {
                "resource_type": "video",
                "quality": quality,
                "format": "mp4"
            }

            if width:
                transform_params["width"] = width
            if height:
                transform_params["height"] = height

            url, _ = cloudinary_url(public_id, **transform_params)
            return url
        except Exception as e:
            logger.error(f"Failed to generate transform URL: {e}")
            return ""

    async def get_supported_formats(self) -> List[Dict[str, Any]]:
        """Get supported input/output formats for image-to-video."""
        return [
            {
                "input": {
                    "image_formats": ["jpg", "jpeg", "png", "webp"],
                    "audio_formats": ["mp3", "wav", "m4a", "aac"],
                    "max_image_size": "2048x2048",
                    "max_audio_duration": 600,  # 10 minutes max for Kling Avatar
                    "audio_duration_policy": "Video duration automatically matches audio length"
                },
                "output": {
                    "video_format": "mp4",
                    "quality": "pro",
                    "has_audio": True,
                    "audio_synced": True,
                    "duration_policy": "Automatically matches input audio duration",
                    "lip_sync": True,
                    "expression_sync": True
                },
                "pricing": {
                    "credits_required": 0,
                    "pricing_policy": "FREE FOR TESTING - No credits charged during testing phase"
                },
                "model": "kling-v1-pro-ai-avatar",
                "processing_time": "7-8 minutes (regardless of audio length)",
                "features": [
                    "Professional quality video output",
                    "Perfect lip synchronization",
                    "Natural facial expressions",
                    "Audio-video length matching",
                    "High-resolution output"
                ]
            }
        ]