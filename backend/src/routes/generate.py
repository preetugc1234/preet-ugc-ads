from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
import asyncio
import json
from ..ai_models.fal_adapter import FalAdapter

router = APIRouter()
logger = logging.getLogger(__name__)
fal_adapter = FalAdapter()

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

@router.post("/chat", response_model=GenerateResponse)
async def generate_chat(request: GenerateRequest):
    """Chat generation endpoint (Free)"""
    return GenerateResponse(
        message="Chat generation endpoint - Coming soon",
        status="placeholder"
    )

@router.post("/image", response_model=GenerateResponse)
async def generate_image(request: GenerateRequest):
    """Image generation endpoint (Free)"""
    return GenerateResponse(
        message="Image generation endpoint - Coming soon",
        status="placeholder"
    )

@router.post("/image-to-video", response_model=GenerateResponse)
async def generate_image_to_video(request: GenerateRequest):
    """Image to video endpoint (100-200 credits) - Legacy endpoint"""
    return GenerateResponse(
        message="Image to video endpoint - Use /kling-avatar for AI Avatar or check other video generation endpoints",
        status="deprecated"
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
    """Audio to video endpoint (100 credits/min)"""
    return GenerateResponse(
        message="Audio to video endpoint - Coming soon",
        status="placeholder"
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

# ElevenLabs TTS Turbo v2.5 endpoints
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