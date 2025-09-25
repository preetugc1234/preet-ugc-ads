from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
import asyncio
import json
from ..ai_models.fal_adapter import FalAdapter
from ..ai_models.openrouter_adapter import OpenRouterAdapter
from ..auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)
fal_adapter = FalAdapter()
openrouter_adapter = OpenRouterAdapter()

class GenerateRequest(BaseModel):
    prompt: Optional[str] = None
    params: Optional[Dict[str, Any]] = None

class GenerateResponse(BaseModel):
    message: str
    status: str

class KlingAvatarRequest(BaseModel):
    image_url: str
    audio_url: str
    prompt: Optional[str] = ""

class KlingAvatarResponse(BaseModel):
    success: bool
    request_id: Optional[str] = None
    video_url: Optional[str] = None
    status: str
    error: Optional[str] = None
    estimated_processing_time: Optional[str] = None

class StatusRequest(BaseModel):
    request_id: str

class StatusResponse(BaseModel):
    success: bool
    request_id: str
    status: str
    logs: Optional[list] = None
    error: Optional[str] = None

class Audio2VideoRequest(BaseModel):
    audio_url: str
    avatar_id: Optional[str] = "emily_vertical_primary"
    audio_duration_seconds: Optional[int] = 30

    def validate_audio_duration(self):
        if self.audio_duration_seconds and self.audio_duration_seconds > 300:  # 5 minutes = 300 seconds
            raise ValueError("Audio duration cannot exceed 5 minutes (300 seconds)")

class Audio2VideoResponse(BaseModel):
    success: bool
    request_id: Optional[str] = None
    video_url: Optional[str] = None
    status: str
    error: Optional[str] = None
    avatar_id: Optional[str] = None
    estimated_processing_time: Optional[str] = None

class ChatRequest(BaseModel):
    prompt: str
    model: Optional[str] = "gpt-4o-mini"  # Model selection
    conversation_history: Optional[list] = []
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7

class ChatResponse(BaseModel):
    success: bool
    content: Optional[str] = None
    model: str
    tokens_used: Optional[int] = 0
    error: Optional[str] = None

class ImageGenerationRequest(BaseModel):
    prompt: str  # Required text prompt
    image_input: Optional[str] = None  # Optional base64 image or URL
    style: Optional[str] = "photorealistic"
    aspect_ratio: Optional[str] = "1:1"
    quality: Optional[str] = "high"

class ImageGenerationResponse(BaseModel):
    success: bool
    image_url: Optional[str] = None
    text_prompt: Optional[str] = None
    has_image_input: Optional[bool] = False
    model: str
    processing_time: Optional[str] = None
    error: Optional[str] = None

class TTSTurboRequest(BaseModel):
    text: str
    voice: Optional[str] = "Rachel"
    stability: Optional[float] = 0.5
    similarity_boost: Optional[float] = 0.75
    style: Optional[float] = None
    speed: Optional[float] = 1.0
    timestamps: Optional[bool] = False
    previous_text: Optional[str] = None
    next_text: Optional[str] = None
    language_code: Optional[str] = None

class TTSResponse(BaseModel):
    success: bool
    request_id: Optional[str] = None
    audio_url: Optional[str] = None
    timestamps: Optional[list] = None
    status: str
    error: Optional[str] = None
    estimated_processing_time: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def generate_chat(request: ChatRequest):
    """Marketing-focused chat generation using OpenRouter models"""
    try:
        result = await openrouter_adapter.generate_chat_final({
            "prompt": request.prompt,
            "model": request.model,
            "conversation_history": request.conversation_history,
            "max_tokens": request.max_tokens,
            "temperature": request.temperature
        })

        return ChatResponse(
            success=result["success"],
            content=result.get("content"),
            model=result.get("model", request.model),
            tokens_used=result.get("tokens_used", 0),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"Chat generation failed: {e}")
        return ChatResponse(
            success=False,
            content=None,
            model=request.model,
            error=str(e)
        )

@router.post("/image", response_model=ImageGenerationResponse)
async def generate_image(request: ImageGenerationRequest, current_user = Depends(get_current_user)):
    """Image generation using Gemini 2.5 Flash via OpenRouter - Credit System"""
    try:
        # TODO: Add user authentication and subscription validation here
        # For now, we'll simulate the credit system validation

        # Credit System:
        # Free users: 3 images per month
        # Pro users: 50 images per month, then 30 credits per image
        # This validation should be implemented with actual user data

        result = await openrouter_adapter.generate_image_final({
            "prompt": request.prompt,
            "image_input": request.image_input,
            "style": request.style,
            "aspect_ratio": request.aspect_ratio,
            "quality": request.quality
        })

        # Save to history if successful
        if result["success"] and result.get("image_url"):
            try:
                from ..database import get_db
                from datetime import datetime, timezone

                db = get_db()

                # Save generation to user's history
                generation_record = {
                    "userId": current_user.id if current_user else "anonymous",
                    "type": "image",
                    "prompt": request.prompt,
                    "previewUrl": result.get("image_url"),
                    "finalUrls": [result.get("image_url")] if result.get("image_url") else [],
                    "sizeBytes": 0,  # TODO: Calculate actual size
                    "model": "gemini-2.5-flash",
                    "style": request.style,
                    "aspectRatio": request.aspect_ratio,
                    "hasImageInput": bool(request.image_input),
                    "creditCost": 0,  # Free for now
                    "createdAt": datetime.now(timezone.utc),
                    "status": "completed"
                }

                db.generations.insert_one(generation_record)
                logger.info(f"Image generation saved to history: {generation_record['_id']}")

            except Exception as e:
                logger.error(f"Failed to save generation to history: {e}")
                # Don't fail the API call if history saving fails

        return ImageGenerationResponse(
            success=result["success"],
            image_url=result.get("image_url"),
            text_prompt=result.get("text_prompt"),
            has_image_input=result.get("has_image_input", False),
            model="gemini-2.5-flash",
            processing_time=result.get("processing_time", "2m"),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        return ImageGenerationResponse(
            success=False,
            image_url=None,
            text_prompt=request.prompt,
            has_image_input=bool(request.image_input),
            model="gemini-2.5-flash",
            error=str(e)
        )

class ImageToVideoLegacyRequest(BaseModel):
    """Legacy request model for image-to-video generation."""
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    prompt: Optional[str] = ""
    params: Optional[Dict[str, Any]] = None

class ImageToVideoLegacyResponse(BaseModel):
    """Legacy response model for image-to-video generation."""
    success: bool
    video_url: Optional[str] = None
    status: str
    processing_time: Optional[str] = None
    model: Optional[str] = None
    error: Optional[str] = None
    message: Optional[str] = None

@router.post("/image-to-video", response_model=ImageToVideoLegacyResponse)
async def generate_image_to_video(request: ImageToVideoLegacyRequest):
    """Image-to-video generation using new Kling AI Avatar backend - FREE during testing"""
    try:
        logger.info(f"🎬 Legacy image-to-video endpoint called")

        # Extract image and audio URLs from request
        image_url = request.image_url
        audio_url = request.audio_url

        # If params are provided, try to extract URLs from there
        if request.params:
            image_url = image_url or request.params.get("image_url")
            audio_url = audio_url or request.params.get("audio_url")
            if not request.prompt and request.params.get("prompt"):
                request.prompt = request.params.get("prompt")

        # Validate required inputs
        if not image_url:
            raise HTTPException(
                status_code=400,
                detail="Image URL is required for image-to-video generation"
            )

        if not audio_url:
            raise HTTPException(
                status_code=400,
                detail="Audio URL is required for image-to-video generation with Kling AI Avatar"
            )

        # Import the new image-to-video service
        from ..services.image_to_video_service import ImageToVideoService

        img2vid_service = ImageToVideoService()

        logger.info(f"🎭 Processing with Kling AI Avatar:")
        logger.info(f"📷 Image: {image_url[:50]}...")
        logger.info(f"🎵 Audio: {audio_url[:50]}...")

        # Generate unique job ID
        import uuid
        job_id = str(uuid.uuid4())

        # Generate video using the new service
        result = await img2vid_service.generate_image_to_video_async(
            image_url=image_url,
            audio_url=audio_url,
            prompt=request.prompt or "",
            user_id=None,  # Legacy endpoint doesn't have user auth
            job_id=job_id
        )

        if result["success"]:
            logger.info(f"✅ Image-to-video completed successfully: {result.get('video_url')}")

            return ImageToVideoLegacyResponse(
                success=True,
                video_url=result.get("video_url"),
                status="completed",
                processing_time=result.get("processing_time"),
                model=result.get("model", "kling-v1-pro-ai-avatar"),
                message="Video generated successfully with Kling AI Avatar - FREE during testing"
            )
        else:
            logger.error(f"❌ Image-to-video failed: {result.get('error')}")

            return ImageToVideoLegacyResponse(
                success=False,
                status="failed",
                error=result.get("error"),
                message="Image-to-video generation failed"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Legacy image-to-video endpoint error: {e}")
        return ImageToVideoLegacyResponse(
            success=False,
            status="error",
            error=str(e),
            message="Internal server error during image-to-video generation"
        )

@router.post("/text-to-speech", response_model=GenerateResponse)
async def generate_text_to_speech(request: GenerateRequest):
    """Text to speech endpoint (100 credits) - Legacy endpoint"""
    return GenerateResponse(
        message="Text to speech endpoint - Use /tts-turbo for ElevenLabs TTS Turbo v2.5",
        status="deprecated"
    )

@router.post("/audio-to-video", response_model=GenerateResponse)
async def generate_audio_to_video(request: GenerateRequest):
    """Audio to video endpoint (100 credits/min) - Legacy endpoint"""
    return GenerateResponse(
        message="Audio to video endpoint - Use /audio2video for veed/avatars/audio-to-video",
        status="deprecated"
    )

@router.post("/ugc-video", response_model=GenerateResponse)
async def generate_ugc_video(request: GenerateRequest):
    """UGC video generation endpoint (200-400 credits)"""
    return GenerateResponse(
        message="UGC video generation endpoint - Coming soon",
        status="placeholder"
    )

# New Kling AI Avatar endpoints
@router.post("/kling-avatar/submit", response_model=KlingAvatarResponse)
async def submit_kling_avatar(request: KlingAvatarRequest):
    """Submit Kling AI Avatar request asynchronously (12-minute processing)"""
    try:
        result = await fal_adapter.submit_kling_avatar_async({
            "image_url": request.image_url,
            "audio_url": request.audio_url,
            "prompt": request.prompt
        })

        return KlingAvatarResponse(
            success=result["success"],
            request_id=result.get("request_id"),
            video_url=result.get("video_url"),
            status=result.get("status", "error"),
            error=result.get("error"),
            estimated_processing_time=result.get("estimated_processing_time")
        )
    except Exception as e:
        logger.error(f"Kling Avatar submission failed: {e}")
        return KlingAvatarResponse(
            success=False,
            status="error",
            error=str(e)
        )

@router.post("/kling-avatar/status", response_model=StatusResponse)
async def check_kling_avatar_status(request: StatusRequest):
    """Check status of Kling AI Avatar request"""
    try:
        result = await fal_adapter.check_kling_avatar_status(request.request_id)

        return StatusResponse(
            success=result["success"],
            request_id=request.request_id,
            status=result.get("status", "unknown"),
            logs=result.get("logs"),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        return StatusResponse(
            success=False,
            request_id=request.request_id,
            status="error",
            error=str(e)
        )

@router.post("/kling-avatar/result", response_model=KlingAvatarResponse)
async def get_kling_avatar_result(request: StatusRequest):
    """Get result from completed Kling AI Avatar request"""
    try:
        result = await fal_adapter.get_kling_avatar_result(request.request_id)

        return KlingAvatarResponse(
            success=result["success"],
            request_id=request.request_id,
            video_url=result.get("video_url"),
            status="completed" if result["success"] else "failed",
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"Result retrieval failed: {e}")
        return KlingAvatarResponse(
            success=False,
            request_id=request.request_id,
            status="error",
            error=str(e)
        )

@router.post("/upload-file")
async def upload_file_to_fal(file: UploadFile = File(...)):
    """Upload file to Fal storage and return URL"""
    try:
        # Read file data
        file_data = await file.read()

        # Upload to Fal storage
        url = await fal_adapter.upload_file(file_data, file.filename)

        return {
            "success": True,
            "file_url": url,
            "filename": file.filename,
            "size": len(file_data)
        }
    except Exception as e:
        logger.error(f"File upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ElevenLabs TTS Turbo v2.5 endpoints (Updated)
@router.post("/tts-turbo/submit", response_model=TTSResponse)
async def submit_tts_turbo(request: TTSTurboRequest):
    """Submit ElevenLabs TTS Turbo v2.5 request asynchronously (12-minute processing)"""
    try:
        # Validate text length
        if len(request.text) > 5000:
            raise HTTPException(status_code=400, detail="Text length exceeds maximum of 5000 characters")

        result = await fal_adapter.submit_tts_turbo_async({
            "text": request.text,
            "voice": request.voice,
            "stability": request.stability,
            "similarity_boost": request.similarity_boost,
            "style": request.style,
            "speed": request.speed,
            "timestamps": request.timestamps,
            "previous_text": request.previous_text,
            "next_text": request.next_text,
            "language_code": request.language_code
        })

        return TTSResponse(
            success=result["success"],
            request_id=result.get("request_id"),
            audio_url=result.get("audio_url"),
            timestamps=result.get("timestamps"),
            status=result.get("status", "error"),
            error=result.get("error"),
            estimated_processing_time=result.get("estimated_processing_time")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS Turbo submission failed: {e}")
        return TTSResponse(
            success=False,
            status="error",
            error=str(e)
        )

@router.post("/tts-turbo/status", response_model=StatusResponse)
async def check_tts_turbo_status(request: StatusRequest):
    """Check status of ElevenLabs TTS Turbo request"""
    try:
        result = await fal_adapter.check_tts_turbo_status(request.request_id)

        return StatusResponse(
            success=result["success"],
            request_id=request.request_id,
            status=result.get("status", "unknown"),
            logs=result.get("logs"),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"TTS Turbo status check failed: {e}")
        return StatusResponse(
            success=False,
            request_id=request.request_id,
            status="error",
            error=str(e)
        )

@router.post("/tts-turbo/result", response_model=TTSResponse)
async def get_tts_turbo_result(request: StatusRequest):
    """Get result from completed ElevenLabs TTS Turbo request"""
    try:
        result = await fal_adapter.get_tts_turbo_result(request.request_id)

        return TTSResponse(
            success=result["success"],
            request_id=request.request_id,
            audio_url=result.get("audio_url"),
            timestamps=result.get("timestamps"),
            status="completed" if result["success"] else "failed",
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"TTS Turbo result retrieval failed: {e}")
        return TTSResponse(
            success=False,
            request_id=request.request_id,
            status="error",
            error=str(e)
        )

@router.post("/tts-turbo/stream")
async def stream_tts_turbo(request: TTSTurboRequest):
    """Stream ElevenLabs TTS Turbo v2.5 for real-time audio generation"""
    try:
        # Validate text length
        if len(request.text) > 5000:
            raise HTTPException(status_code=400, detail="Text length exceeds maximum of 5000 characters")

        from fastapi.responses import StreamingResponse

        async def stream_generator():
            try:
                stream = await fal_adapter.stream_tts_turbo({
                    "text": request.text,
                    "voice": request.voice,
                    "stability": request.stability,
                    "similarity_boost": request.similarity_boost,
                    "style": request.style,
                    "speed": request.speed,
                    "language_code": request.language_code
                })

                async for event in stream:
                    yield f"data: {json.dumps(event)}\n\n"

            except Exception as e:
                error_event = {"type": "error", "error": str(e)}
                yield f"data: {json.dumps(error_event)}\n\n"

        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS Turbo streaming failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced Audio-to-Video endpoints using veed/avatars/audio-to-video with perfect integration
@router.post("/audio2video/submit", response_model=Audio2VideoResponse)
async def submit_audio2video(request: Audio2VideoRequest, current_user = Depends(get_current_user)):
    """Submit Audio-to-Video request using veed/avatars/audio-to-video with Cloudinary integration"""
    try:
        # Import video service here to avoid circular imports
        from ..services.video_service import VideoService

        # Enhanced validation
        if request.audio_duration_seconds and request.audio_duration_seconds > 300:
            raise HTTPException(status_code=400, detail="Audio duration cannot exceed 5 minutes (300 seconds)")

        if not request.audio_url or not request.audio_url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail="Valid audio URL is required")

        # Validate avatar_id
        video_service = VideoService()
        avatars = await video_service.get_available_avatars()
        valid_avatar_ids = [avatar["id"] for avatar in avatars]

        if request.avatar_id not in valid_avatar_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid avatar_id: {request.avatar_id}. Available: {valid_avatar_ids[:5]}"
            )

        logger.info(f"🎤 Audio-to-Video request: user={current_user.id if current_user else 'anonymous'}, "
                   f"avatar={request.avatar_id}, duration={request.audio_duration_seconds}s")

        # Generate unique job ID for tracking
        import uuid
        job_id = str(uuid.uuid4())

        # Submit async job using enhanced video service
        result = await video_service.generate_audio_to_video_async(
            audio_url=request.audio_url,
            avatar_id=request.avatar_id,
            audio_duration_seconds=request.audio_duration_seconds,
            user_id=current_user.id if current_user else None,
            job_id=job_id
        )

        # Save to user history if successful and we have a user
        if result.get("success") and current_user and result.get("video_url"):
            try:
                from ..database import get_db
                from datetime import datetime, timezone

                db = get_db()

                # Calculate credits based on audio duration (SET TO 0 FOR TESTING)
                duration_increments = max(1, (request.audio_duration_seconds + 29) // 30)
                credit_cost = 0  # Set to 0 for testing - normally would be: duration_increments * 100

                generation_record = {
                    "userId": current_user.id,
                    "type": "audio_to_video",
                    "jobId": job_id,
                    "audioUrl": request.audio_url,
                    "avatarId": request.avatar_id,
                    "audioDurationSeconds": request.audio_duration_seconds,
                    "previewUrl": result.get("video_url"),
                    "finalUrls": [result.get("video_url")] if result.get("video_url") else [],
                    "cloudinaryPublicId": result.get("cloudinary_public_id"),
                    "sizeBytes": 0,  # TODO: Get actual file size from Cloudinary result
                    "model": "veed-avatars-audio2video",
                    "processingTime": result.get("processing_time"),
                    "creditCost": credit_cost,
                    "createdAt": datetime.now(timezone.utc),
                    "status": "completed"
                }

                db.generations.insert_one(generation_record)
                logger.info(f"✅ Audio-to-Video generation saved to history: user={current_user.id}, job={job_id}")

            except Exception as e:
                logger.error(f"❌ Failed to save generation to history: {e}")
                # Don't fail the API call if history saving fails

        return Audio2VideoResponse(
            success=result["success"],
            request_id=result.get("request_id"),
            video_url=result.get("video_url"),
            status="completed" if result["success"] else "failed",
            error=result.get("error"),
            avatar_id=request.avatar_id,
            estimated_processing_time=result.get("processing_time")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Audio2Video submission failed: {e}")
        return Audio2VideoResponse(
            success=False,
            status="error",
            error=str(e)
        )

@router.post("/audio2video/status", response_model=StatusResponse)
async def check_audio2video_status(request: StatusRequest):
    """Check status of Audio-to-Video request"""
    try:
        result = await fal_adapter.check_audio2vid_status(request.request_id)

        return StatusResponse(
            success=result["success"],
            request_id=request.request_id,
            status=result.get("status", "unknown"),
            logs=result.get("logs"),
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"Audio2Video status check failed: {e}")
        return StatusResponse(
            success=False,
            request_id=request.request_id,
            status="error",
            error=str(e)
        )

@router.post("/audio2video/result", response_model=Audio2VideoResponse)
async def get_audio2video_result(request: StatusRequest):
    """Get result from completed Audio-to-Video request"""
    try:
        result = await fal_adapter.get_audio2vid_result(request.request_id)

        return Audio2VideoResponse(
            success=result["success"],
            request_id=request.request_id,
            video_url=result.get("video_url"),
            status="completed" if result["success"] else "failed",
            error=result.get("error")
        )
    except Exception as e:
        logger.error(f"Audio2Video result retrieval failed: {e}")
        return Audio2VideoResponse(
            success=False,
            request_id=request.request_id,
            status="error",
            error=str(e)
        )

@router.get("/audio2video/avatars")
async def get_available_avatars():
    """Get list of available avatars for audio-to-video generation with enhanced metadata"""
    try:
        from ..services.video_service import VideoService

        video_service = VideoService()
        avatars = await video_service.get_available_avatars()

        return {
            "success": True,
            "avatars": avatars,
            "total_count": len(avatars),
            "model": "veed-avatars-audio2video",
            "pricing": {
                "credits_per_30s": 0,  # Set to 0 for testing - normally 100
                "max_duration_seconds": 300,
                "processing_estimate": "~200 seconds for 30s audio"
            }
        }
    except Exception as e:
        logger.error(f"Failed to get avatars: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio2video/estimate")
async def estimate_processing_cost(request: dict):
    """Estimate processing time and credit cost for audio duration"""
    try:
        from ..services.video_service import VideoService

        audio_duration = request.get("audio_duration_seconds", 30)

        if audio_duration > 300:
            raise HTTPException(status_code=400, detail="Audio duration cannot exceed 5 minutes (300 seconds)")

        video_service = VideoService()
        estimate = await video_service.estimate_processing_time(audio_duration)

        return estimate
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to estimate processing cost: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio2video/upload-audio")
async def upload_audio_for_processing(file: UploadFile = File(...)):
    """Upload audio file to FAL storage for audio-to-video processing"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Must be an audio file."
            )

        # Validate file size (max 50MB)
        file_data = await file.read()
        if len(file_data) > 50 * 1024 * 1024:  # 50MB
            raise HTTPException(status_code=400, detail="Audio file too large. Maximum size is 50MB.")

        # Upload to FAL storage
        url = await fal_adapter.upload_file(file_data, file.filename)

        # Try to get audio duration (optional)
        audio_duration = None
        try:
            # This would require additional audio processing library
            # For now, we'll let the user specify duration
            pass
        except:
            pass

        return {
            "success": True,
            "audio_url": url,
            "filename": file.filename,
            "size_bytes": len(file_data),
            "content_type": file.content_type,
            "duration_seconds": audio_duration,
            "message": "Audio uploaded successfully. You can now use this URL for audio-to-video generation."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Audio upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))