"""
Video Service - Audio-to-Video generation with Cloudinary integration
Handles veed/avatars/audio-to-video generation, progress tracking, and user history
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

class VideoService:
    """Service for handling Audio-to-Video generation using veed/avatars/audio-to-video."""

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
            logger.info("✅ Cloudinary configured successfully for video uploads")
        else:
            self.cloudinary_configured = False
            logger.warning("⚠️ Cloudinary not configured - video uploads will use original URLs")

    async def generate_audio_to_video_async(self,
                                          audio_url: str,
                                          avatar_id: str = "emily_vertical_primary",
                                          audio_duration_seconds: int = 30,
                                          user_id: str = None,
                                          job_id: str = None) -> Dict[str, Any]:
        """
        Generate Audio-to-Video asynchronously using veed/avatars/audio-to-video.

        Returns:
            Dict with success status, request_id, video_url, cloudinary_url, metadata
        """
        try:
            # Generate unique job ID if not provided
            if not job_id:
                job_id = str(uuid.uuid4())

            logger.info(f"🎤 Starting Audio-to-Video generation for job {job_id}")

            # Update job progress
            if self.queue_manager:
                self._update_job_progress(job_id, 10, "initializing")

            # Validate inputs
            if not audio_url:
                raise ValueError("Audio URL is required")

            if not audio_url.startswith(('http://', 'https://')):
                raise ValueError(f"Invalid audio URL format: {audio_url}")

            # Validate avatar_id
            valid_avatars = self.fal_adapter.get_available_avatars()
            valid_avatar_ids = [avatar["id"] for avatar in valid_avatars]
            if avatar_id not in valid_avatar_ids:
                raise ValueError(f"Invalid avatar_id: {avatar_id}. Available: {valid_avatar_ids[:5]}")

            # Validate audio duration (max 5 minutes)
            if audio_duration_seconds > 300:
                raise ValueError("Audio duration cannot exceed 5 minutes (300 seconds)")

            logger.info(f"🎭 Using avatar: {avatar_id}, duration: {audio_duration_seconds}s")

            # Update progress
            if self.queue_manager:
                self._update_job_progress(job_id, 20, "submitting_to_fal")

            # Submit to FAL AI
            fal_params = {
                "audio_url": audio_url,
                "avatar_id": avatar_id,
                "audio_duration_seconds": audio_duration_seconds
            }

            fal_result = await self.fal_adapter.submit_audio2vid_async(fal_params)

            if not fal_result.get("success"):
                error_msg = fal_result.get("error", "FAL AI submission failed")
                logger.error(f"❌ FAL AI submission failed: {error_msg}")

                if self.queue_manager:
                    self._update_job_progress(job_id, 0, "failed", error_msg)

                return {
                    "success": False,
                    "error": error_msg,
                    "job_id": job_id
                }

            request_id = fal_result.get("request_id")
            estimated_time = fal_result.get("estimated_processing_time", "5-7 minutes")

            logger.info(f"✅ FAL AI submission successful: {request_id}")

            # Update progress
            if self.queue_manager:
                self._update_job_progress(job_id, 30, "processing_on_fal",
                                        f"Request ID: {request_id}, ETA: {estimated_time}")

            # Poll for completion with shorter intervals
            max_polls = 60  # 60 polls * 15 seconds = 15 minutes max
            poll_count = 0

            while poll_count < max_polls:
                # Wait 15 seconds between polls (faster polling)
                await asyncio.sleep(15 if poll_count < 10 else 30)  # Shorter wait initially
                poll_count += 1

                # Update progress incrementally
                progress = min(30 + (poll_count * 1), 85)
                self._update_job_progress(job_id, int(progress), "processing_on_fal",
                                        f"Polling attempt {poll_count}/{max_polls}")

                # Check FAL AI status
                try:
                    status_result = await self.fal_adapter.check_audio2vid_status(request_id)
                    logger.info(f"📊 Status check result: {status_result}")

                    if not status_result.get("success"):
                        logger.warning(f"⚠️ Status check failed: {status_result.get('error')}")
                        continue

                    status = status_result.get("status", "unknown").lower()
                    logger.info(f"📊 FAL AI status: {status} (poll {poll_count}/{max_polls})")

                    if status in ["completed", "success"]:
                        logger.info(f"🎉 FAL AI processing completed! Getting result...")

                        # Get the result
                        result = await self.fal_adapter.get_audio2vid_result(request_id)
                        logger.info(f"📋 FAL AI result: {result}")

                        if result.get("success") and result.get("video_url"):
                            video_url = result["video_url"]
                            logger.info(f"🎬 Got video URL: {video_url}")

                            # Update progress
                            self._update_job_progress(job_id, 90, "uploading_to_cloudinary")

                            # Download and upload to Cloudinary
                            logger.info(f"☁️ Starting Cloudinary upload...")
                            cloudinary_result = await self._handle_video_upload(
                                video_url, user_id, job_id, avatar_id
                            )

                            if not cloudinary_result["success"]:
                                logger.warning(f"⚠️ Cloudinary upload failed: {cloudinary_result.get('error')}")
                                logger.info(f"📁 Using original FAL URL: {video_url}")
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
                                "avatar_id": avatar_id,
                                "audio_duration": audio_duration_seconds,
                                "cloudinary_public_id": public_id,
                                "processing_time": f"{poll_count * 15} seconds",
                                "model": "veed-avatars-audio2video"
                            }
                        else:
                            error_msg = result.get("error", "No video URL in result")
                            logger.error(f"❌ FAL AI result error: {error_msg}")
                            logger.error(f"❌ Full result: {result}")

                            self._update_job_progress(job_id, 0, "failed", error_msg)

                            return {
                                "success": False,
                                "error": error_msg,
                                "job_id": job_id,
                                "debug_result": result
                            }

                    elif status in ["failed", "error"]:
                        error_msg = status_result.get("error", "FAL AI processing failed")
                        logger.error(f"❌ FAL AI processing failed: {error_msg}")

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
            error_msg = f"Processing timeout after {max_polls * 30} seconds"
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
            logger.error(f"❌ Audio-to-Video generation failed: {error_msg}")

            if self.queue_manager and job_id:
                self._update_job_progress(job_id, 0, "failed", error_msg)

            return {
                "success": False,
                "error": error_msg,
                "job_id": job_id
            }

    async def _handle_video_upload(self, video_url: str, user_id: str, job_id: str, avatar_id: str) -> Dict[str, Any]:
        """Download video from FAL and upload to Cloudinary with retry logic."""
        if not self.cloudinary_configured:
            return {"success": False, "error": "Cloudinary not configured"}

        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"📥 Downloading video from FAL: {video_url} (attempt {attempt + 1})")

                # Download video from FAL with timeout
                timeout = httpx.Timeout(60.0, connect=30.0)  # 60s total, 30s connect timeout
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(video_url)
                    response.raise_for_status()
                    video_data = response.content

                # Generate public ID with meaningful naming
                timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
                public_id = f"ugc_videos/audio2video/{user_id or 'anonymous'}/{job_id}_{avatar_id}_{timestamp}"

                logger.info(f"☁️ Uploading to Cloudinary: {public_id} (attempt {attempt + 1})")

                # Upload to Cloudinary with proper timeout and simplified parameters
                upload_result = await asyncio.wait_for(
                    asyncio.to_thread(
                        cloudinary.uploader.upload,
                        video_data,
                        public_id=public_id,
                        resource_type="video",
                        folder="ugc_videos/audio2video",
                        use_filename=False,
                        unique_filename=True,
                        overwrite=False,
                        quality="auto",
                        format="mp4",
                        tags=[f"user_{user_id}", f"job_{job_id}", f"avatar_{avatar_id}", "audio2video"],
                        # Remove eager transformations to avoid timeout issues
                        eager_async=False,
                        timeout=120  # 2 minutes timeout for Cloudinary upload
                    ),
                    timeout=150  # 2.5 minutes total timeout for the upload
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
                    "height": upload_result.get("height")
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
        """Update job progress (simplified logging for audio-to-video)."""
        try:
            # Just log the progress instead of trying to update database
            # since we're not creating actual job records for direct API calls
            logger.info(f"🔄 Job {job_id[:8]}... Progress: {progress}% ({status})")
            if details:
                logger.info(f"   └── {details}")
        except Exception as e:
            logger.warning(f"Failed to log job progress: {e}")

    async def get_available_avatars(self) -> List[Dict[str, Any]]:
        """Get list of available avatars with enhanced metadata."""
        try:
            avatars = self.fal_adapter.get_available_avatars()

            # Add processing time estimates based on avatar type
            for avatar in avatars:
                # Estimate processing time: ~200 seconds for 30 seconds of audio
                avatar["processing_estimate"] = "~200 seconds for 30s audio"
                avatar["credits_per_30s"] = 0  # Set to 0 for testing - normally 100 credits per 30-second increment

                # Add thumbnail URL (placeholder for now)
                avatar["thumbnail_url"] = f"https://res.cloudinary.com/{self.cloudinary_cloud_name}/image/upload/v1/avatars/{avatar['id']}.jpg"

            return avatars
        except Exception as e:
            logger.error(f"Failed to get avatars: {e}")
            return []

    async def estimate_processing_time(self, audio_duration_seconds: int) -> Dict[str, Any]:
        """Calculate processing time and cost estimates."""
        try:
            # Processing formula: 200 seconds for 30 seconds of audio
            # Rounded up to nearest 30-second increment
            duration_increments = max(1, (audio_duration_seconds + 29) // 30)
            processing_seconds = duration_increments * 200

            # Credits: 0 per 30-second increment (SET TO 0 FOR TESTING)
            total_credits = duration_increments * 0  # Set to 0 for testing - normally: duration_increments * 100

            # Add buffer for queue and initialization
            total_seconds_with_buffer = processing_seconds + 240  # 4 minutes buffer

            # Format display time
            if processing_seconds < 60:
                processing_time = f"{processing_seconds} seconds"
            else:
                minutes = processing_seconds // 60
                seconds = processing_seconds % 60
                processing_time = f"{minutes}m {seconds}s" if seconds > 0 else f"{minutes}m"

            return {
                "success": True,
                "audio_duration": audio_duration_seconds,
                "duration_increments": duration_increments,
                "processing_time": processing_time,
                "processing_seconds": processing_seconds,
                "total_seconds_with_buffer": total_seconds_with_buffer,
                "total_credits": total_credits,
                "credit_breakdown": f"{duration_increments} × 30s increments × 0 credits (FREE FOR TESTING)"
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