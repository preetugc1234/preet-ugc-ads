"""
Image-to-Video+Audio API Routes
Handles image + audio to video generation using Kling AI Avatar
"""

from fastapi import APIRouter, HTTPException, Form, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Dict, Any, List
import logging
import uuid
import asyncio
from datetime import datetime

from ...services.image_to_video_service import ImageToVideoService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/generate/img2vid-audio", tags=["img2vid-audio"])

# Initialize service
img2vid_service = ImageToVideoService()

# Request Models
class ImageToVideoRequest(BaseModel):
    """Request model for image+audio to video generation."""
    image_url: HttpUrl = Field(..., description="URL of the input image")
    audio_url: HttpUrl = Field(..., description="URL of the input audio file")
    prompt: Optional[str] = Field("", description="Optional prompt to guide the video generation")
    user_id: Optional[str] = Field(None, description="Optional user identifier")

    class Config:
        json_schema_extra = {
            "example": {
                "image_url": "https://example.com/portrait.jpg",
                "audio_url": "https://example.com/speech.mp3",
                "prompt": "Professional speaking avatar with natural expressions",
                "user_id": "user123"
            }
        }

class EstimateRequest(BaseModel):
    """Request model for processing time estimation."""
    has_audio: bool = Field(True, description="Whether the video will include audio")

# Response Models
class ImageToVideoResponse(BaseModel):
    """Response model for image+audio to video generation."""
    success: bool
    job_id: str
    request_id: Optional[str] = None
    video_url: Optional[str] = None
    original_video_url: Optional[str] = None
    duration: Optional[float] = None
    has_audio: Optional[bool] = None
    audio_synced: Optional[bool] = None
    cloudinary_public_id: Optional[str] = None
    processing_time: Optional[str] = None
    model: Optional[str] = None
    prompt: Optional[str] = None
    error: Optional[str] = None

class EstimateResponse(BaseModel):
    """Response model for processing estimates."""
    success: bool
    processing_time: Optional[str] = None
    processing_seconds: Optional[int] = None
    total_credits: Optional[int] = None
    credit_breakdown: Optional[str] = None
    model: Optional[str] = None
    has_audio: Optional[bool] = None
    quality: Optional[str] = None
    error: Optional[str] = None

@router.post("/submit", response_model=ImageToVideoResponse)
async def submit_image_to_video(request: ImageToVideoRequest):
    """
    Submit an image+audio to video generation request.

    Uses Kling AI Avatar model (fal-ai/kling-video/v1/pro/ai-avatar) to:
    - Take an input image and audio file
    - Generate a high-quality video where the person in the image speaks the audio
    - Sync lip movements and expressions with the audio
    - Return a professional MP4 video with audio

    Processing time: ~7-8 minutes
    """
    try:
        logger.info(f"🎬 Image+Audio to Video submission received")
        logger.info(f"📷 Image: {str(request.image_url)[:50]}...")
        logger.info(f"🎵 Audio: {str(request.audio_url)[:50]}...")

        # Generate unique job ID
        job_id = str(uuid.uuid4())

        # Convert URLs to strings for processing
        image_url_str = str(request.image_url)
        audio_url_str = str(request.audio_url)

        # Validate URLs
        if not image_url_str.startswith(('http://', 'https://')):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image URL format: {image_url_str[:50]}..."
            )

        if not audio_url_str.startswith(('http://', 'https://')):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid audio URL format: {audio_url_str[:50]}..."
            )

        logger.info(f"✅ Starting async processing for job {job_id}")

        # Start async generation
        result = await img2vid_service.generate_image_to_video_async(
            image_url=image_url_str,
            audio_url=audio_url_str,
            prompt=request.prompt or "",
            user_id=request.user_id,
            job_id=job_id
        )

        if result["success"]:
            logger.info(f"✅ Image+Audio to Video completed for job {job_id}")
            return ImageToVideoResponse(
                success=True,
                job_id=job_id,
                request_id=result.get("request_id"),
                video_url=result.get("video_url"),
                original_video_url=result.get("original_video_url"),
                duration=result.get("duration"),
                has_audio=result.get("has_audio", True),
                audio_synced=result.get("audio_synced", True),
                cloudinary_public_id=result.get("cloudinary_public_id"),
                processing_time=result.get("processing_time"),
                model=result.get("model", "kling-v1-pro-ai-avatar"),
                prompt=result.get("prompt")
            )
        else:
            logger.error(f"❌ Image+Audio to Video failed for job {job_id}: {result.get('error')}")
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Image+Audio to Video generation failed")
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Image+Audio to Video API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-and-submit")
async def upload_and_submit_image_to_video(
    image_file: UploadFile = File(..., description="Image file (JPG, PNG, WEBP)"),
    audio_file: UploadFile = File(..., description="Audio file (MP3, WAV, M4A)"),
    prompt: Optional[str] = Form("", description="Optional prompt to guide video generation"),
    user_id: Optional[str] = Form(None, description="Optional user identifier")
):
    """
    Upload image and audio files, then generate video.

    This endpoint:
    1. Uploads the image and audio files to FAL storage
    2. Submits the image+audio to video generation request
    3. Returns the final video result

    Supported formats:
    - Images: JPG, PNG, WEBP (max 2048x2048)
    - Audio: MP3, WAV, M4A, AAC (max 5 minutes)
    """
    try:
        logger.info(f"📁 File upload and submit received")
        logger.info(f"📷 Image file: {image_file.filename} ({image_file.content_type})")
        logger.info(f"🎵 Audio file: {audio_file.filename} ({audio_file.content_type})")

        # Generate unique job ID
        job_id = str(uuid.uuid4())

        # Validate file types
        allowed_image_types = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
        allowed_audio_types = {"audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/aac"}

        if image_file.content_type not in allowed_image_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported image format: {image_file.content_type}. Supported: JPG, PNG, WEBP"
            )

        if audio_file.content_type not in allowed_audio_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported audio format: {audio_file.content_type}. Supported: MP3, WAV, M4A, AAC"
            )

        # Read file data
        image_data = await image_file.read()
        audio_data = await audio_file.read()

        # Validate file sizes (10MB for image, 50MB for audio)
        if len(image_data) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="Image file too large (max 10MB)")

        if len(audio_data) > 50 * 1024 * 1024:  # 50MB
            raise HTTPException(status_code=400, detail="Audio file too large (max 50MB)")

        logger.info(f"📤 Uploading files to FAL storage...")

        # Upload files to FAL storage
        try:
            # Upload image
            image_url = await img2vid_service.fal_adapter.upload_file(
                image_data, image_file.filename or "image.jpg"
            )
            logger.info(f"✅ Image uploaded: {image_url[:50]}...")

            # Upload audio
            audio_url = await img2vid_service.fal_adapter.upload_file(
                audio_data, audio_file.filename or "audio.mp3"
            )
            logger.info(f"✅ Audio uploaded: {audio_url[:50]}...")

        except Exception as upload_error:
            logger.error(f"❌ File upload failed: {upload_error}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload files: {str(upload_error)}"
            )

        logger.info(f"🎬 Starting image+audio to video generation for job {job_id}")

        # Start async generation
        result = await img2vid_service.generate_image_to_video_async(
            image_url=image_url,
            audio_url=audio_url,
            prompt=prompt or "",
            user_id=user_id,
            job_id=job_id
        )

        if result["success"]:
            logger.info(f"✅ Image+Audio to Video completed for job {job_id}")
            return ImageToVideoResponse(
                success=True,
                job_id=job_id,
                request_id=result.get("request_id"),
                video_url=result.get("video_url"),
                original_video_url=result.get("original_video_url"),
                duration=result.get("duration"),
                has_audio=result.get("has_audio", True),
                audio_synced=result.get("audio_synced", True),
                cloudinary_public_id=result.get("cloudinary_public_id"),
                processing_time=result.get("processing_time"),
                model=result.get("model", "kling-v1-pro-ai-avatar"),
                prompt=result.get("prompt")
            )
        else:
            logger.error(f"❌ Image+Audio to Video failed for job {job_id}: {result.get('error')}")
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Image+Audio to Video generation failed")
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Upload and submit API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/estimate", response_model=EstimateResponse)
async def estimate_processing_time(request: EstimateRequest):
    """
    Estimate processing time and costs for image+audio to video generation.

    Returns:
    - Estimated processing time (~7-8 minutes for Kling Avatar)
    - Credit costs (currently free for testing)
    - Model information
    """
    try:
        logger.info(f"📊 Processing estimate requested")

        result = await img2vid_service.estimate_processing_time(request.has_audio)

        if result["success"]:
            return EstimateResponse(
                success=True,
                processing_time=result.get("processing_time"),
                processing_seconds=result.get("processing_seconds"),
                total_credits=result.get("total_credits"),
                credit_breakdown=result.get("credit_breakdown"),
                model=result.get("model"),
                has_audio=result.get("has_audio"),
                quality=result.get("quality")
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Failed to estimate processing time")
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Estimate API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/formats")
async def get_supported_formats():
    """
    Get supported input and output formats for image+audio to video generation.

    Returns detailed information about:
    - Supported image formats
    - Supported audio formats
    - Output specifications
    - Processing capabilities
    """
    try:
        formats = await img2vid_service.get_supported_formats()

        return JSONResponse(content={
            "success": True,
            "formats": formats,
            "model": "kling-v1-pro-ai-avatar",
            "capabilities": {
                "lip_sync": True,
                "expression_sync": True,
                "high_quality": True,
                "audio_preservation": True,
                "professional_output": True
            }
        })

    except Exception as e:
        logger.error(f"❌ Formats API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cleanup/{public_id}")
async def cleanup_video(public_id: str):
    """
    Clean up a video from Cloudinary storage.

    Use this to delete videos that are no longer needed.
    """
    try:
        logger.info(f"🗑️ Cleanup requested for: {public_id}")

        success = await img2vid_service.delete_video_from_cloudinary(public_id)

        if success:
            return JSONResponse(content={
                "success": True,
                "message": f"Video {public_id} deleted successfully"
            })
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete video: {public_id}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Cleanup API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transform/{public_id}")
async def get_video_transform_url(
    public_id: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    quality: str = "auto"
):
    """
    Generate a transformed video URL with specific dimensions and quality.

    Useful for creating thumbnails, previews, or optimized versions.
    """
    try:
        logger.info(f"🔄 Transform requested for: {public_id}")

        transform_url = img2vid_service.get_video_transform_url(
            public_id=public_id,
            width=width,
            height=height,
            quality=quality
        )

        if transform_url:
            return JSONResponse(content={
                "success": True,
                "transform_url": transform_url,
                "public_id": public_id,
                "width": width,
                "height": height,
                "quality": quality
            })
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate transform URL for: {public_id}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Transform API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint for image+audio to video service."""
    try:
        # Test FAL adapter connection
        has_fal = hasattr(img2vid_service.fal_adapter, 'fal') and img2vid_service.fal_adapter.fal is not None

        return JSONResponse(content={
            "success": True,
            "service": "img2vid-audio",
            "model": "kling-v1-pro-ai-avatar",
            "fal_connected": has_fal,
            "cloudinary_configured": img2vid_service.cloudinary_configured,
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ Health check error: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )