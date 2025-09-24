"""
Perfect Text-to-Speech API endpoints with comprehensive validation and error handling
Supports ElevenLabs Turbo v2.5 via FAL AI with Cloudinary upload and user history
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
import logging
import asyncio
import json
import time
import uuid
from datetime import datetime, timezone

from ..services.tts_service import TTSService
from ..database import get_db

# Optional auth import with fallback
try:
    from ..auth import get_current_user
except ImportError:
    # Fallback for testing without auth dependencies
    def get_current_user():
        return None

router = APIRouter(prefix="/api/tts", tags=["Text-to-Speech"])
logger = logging.getLogger(__name__)

# Lazy TTS service initialization
tts_service = None

def get_tts_service():
    """Get or initialize TTS service with proper environment loading."""
    global tts_service
    if tts_service is None:
        try:
            # Ensure environment is loaded
            from dotenv import load_dotenv
            load_dotenv()

            tts_service = TTSService()
            logger.info("TTS service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize TTS service: {e}")
            raise HTTPException(status_code=503, detail=f"TTS service not available: {str(e)}")
    return tts_service

# Request/Response Models
class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Text to convert to speech")
    voice: str = Field(default="Rachel", description="Voice name")
    stability: float = Field(default=0.5, ge=0.0, le=1.0, description="Voice stability")
    similarity_boost: float = Field(default=0.75, ge=0.0, le=1.0, description="Similarity boost")
    style: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Style exaggeration")
    speed: float = Field(default=1.0, ge=0.25, le=4.0, description="Speech speed")
    timestamps: bool = Field(default=False, description="Include word timestamps")
    previous_text: Optional[str] = Field(default=None, max_length=500, description="Previous text for continuity")
    next_text: Optional[str] = Field(default=None, max_length=500, description="Next text for continuity")
    language_code: Optional[str] = Field(default=None, regex="^[a-z]{2}$", description="ISO 639-1 language code")

    @validator('text')
    def validate_text(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or whitespace only')
        return v.strip()

    @validator('voice')
    def validate_voice(cls, v):
        # Voice validation will be done at runtime in the endpoint
        # to avoid circular dependency issues
        return v

class TTSResponse(BaseModel):
    success: bool
    job_id: Optional[str] = None
    audio_url: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    timestamps: Optional[List] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None

class TTSJobStatus(BaseModel):
    job_id: str
    status: str  # processing, completed, failed, timeout
    progress: int  # 0-100, -1 for error
    stage: str  # initializing, submitting_to_fal, processing_audio, uploading_to_cloudinary, completed
    estimated_time_remaining: Optional[int] = None  # seconds
    error: Optional[str] = None

class VoiceInfo(BaseModel):
    id: str
    name: str
    gender: str
    accent: str
    description: str

# Endpoints
@router.get("/voices", response_model=List[VoiceInfo])
async def get_available_voices():
    """Get list of available TTS voices with metadata."""
    try:
        service = get_tts_service()
        voices = service.get_available_voices()
        return [VoiceInfo(**voice) for voice in voices]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get voices: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=TTSResponse)
async def generate_speech(
    request: TTSRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user)
):
    """
    Generate speech from text with perfect error handling and Cloudinary upload.
    Returns immediately with job_id for progress tracking.
    """
    try:
        service = get_tts_service()

        # Validate voice selection
        available_voices = [voice["id"] for voice in service.get_available_voices()]
        if request.voice not in available_voices:
            raise HTTPException(status_code=400, detail=f"Invalid voice '{request.voice}'. Available voices: {available_voices[:10]}...")

        # Generate unique job ID
        job_id = str(uuid.uuid4())
        user_id = current_user.id if current_user else None

        # Note: No credit validation during testing mode - TTS is free
        logger.info(f"TTS generation started - Job: {job_id}, User: {user_id}, Text length: {len(request.text)}")

        # Start TTS generation in background
        background_tasks.add_task(
            _process_tts_generation,
            job_id=job_id,
            user_id=user_id,
            request=request
        )

        return TTSResponse(
            success=True,
            job_id=job_id,
            metadata={
                "text_length": len(request.text),
                "voice": request.voice,
                "estimated_duration": service._estimate_audio_duration(request.text, request.speed),
                "submitted_at": datetime.now(timezone.utc).isoformat()
            }
        )

    except Exception as e:
        logger.error(f"TTS generation request failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/job/{job_id}/status", response_model=TTSJobStatus)
async def get_job_status(job_id: str):
    """Get real-time status of TTS generation job."""
    try:
        service = get_tts_service()
        status = service.get_job_status(job_id)

        if not status:
            raise HTTPException(status_code=404, detail="Job not found or expired")

        # Calculate estimated time remaining
        estimated_time = None
        if status["status"] == "processing" and status["progress"] > 0:
            elapsed = time.time() - status["start_time"]
            if status["progress"] < 100:
                estimated_time = int((elapsed / status["progress"]) * (100 - status["progress"]))

        return TTSJobStatus(
            job_id=job_id,
            status=status["status"],
            progress=status["progress"],
            stage=status["stage"],
            estimated_time_remaining=estimated_time,
            error=status.get("error")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/job/{job_id}/result", response_model=TTSResponse)
async def get_job_result(job_id: str, current_user=Depends(get_current_user)):
    """Get the final result of completed TTS generation job."""
    try:
        # Check if we have result cached
        db = get_db()
        result_doc = db.tts_results.find_one({"job_id": job_id})

        if not result_doc:
            raise HTTPException(status_code=404, detail="Job result not found or expired")

        # Verify user access (if user is authenticated)
        if current_user and result_doc.get("user_id") != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Convert MongoDB document to response
        return TTSResponse(
            success=result_doc["success"],
            job_id=job_id,
            audio_url=result_doc.get("audio_url"),
            cloudinary_public_id=result_doc.get("cloudinary_public_id"),
            timestamps=result_doc.get("timestamps"),
            metadata=result_doc.get("metadata"),
            error=result_doc.get("error"),
            processing_time=result_doc.get("processing_time")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job result: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/sync", response_model=TTSResponse)
async def generate_speech_sync(
    request: TTSRequest,
    current_user=Depends(get_current_user)
):
    """
    Generate speech synchronously (for testing or simple use cases).
    WARNING: This will block until completion (up to 5 minutes).
    """
    try:
        service = get_tts_service()
        user_id = current_user.id if current_user else None
        job_id = str(uuid.uuid4())

        result = await service.generate_tts(
            text=request.text,
            voice=request.voice,
            stability=request.stability,
            similarity_boost=request.similarity_boost,
            style=request.style,
            speed=request.speed,
            timestamps=request.timestamps,
            previous_text=request.previous_text,
            next_text=request.next_text,
            language_code=request.language_code,
            user_id=user_id,
            job_id=job_id
        )

        # Save to user history if successful
        if result["success"] and current_user:
            await _save_to_history(
                user_id=current_user.id,
                job_id=job_id,
                request=request,
                result=result
            )

        return TTSResponse(
            success=result["success"],
            job_id=job_id,
            audio_url=result.get("audio_url"),
            cloudinary_public_id=result.get("cloudinary_public_id"),
            timestamps=result.get("timestamps"),
            metadata=result.get("metadata"),
            error=result.get("error"),
            processing_time=result.get("metadata", {}).get("processing_time")
        )

    except Exception as e:
        logger.error(f"Sync TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test")
async def test_tts_service():
    """Test the TTS service with a simple request."""
    try:
        service = get_tts_service()
        result = await service.test_service()
        return {
            "service_status": "operational" if result["success"] else "error",
            "test_result": result,
            "available_voices": len(service.get_available_voices())
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS service test failed: {e}")
        return {
            "service_status": "error",
            "error": str(e)
        }

# Background task functions
async def _process_tts_generation(job_id: str, user_id: Optional[str], request: TTSRequest):
    """Process TTS generation in background task."""
    try:
        # Get TTS service
        service = get_tts_service()

        # Generate TTS
        result = await service.generate_tts(
            text=request.text,
            voice=request.voice,
            stability=request.stability,
            similarity_boost=request.similarity_boost,
            style=request.style,
            speed=request.speed,
            timestamps=request.timestamps,
            previous_text=request.previous_text,
            next_text=request.next_text,
            language_code=request.language_code,
            user_id=user_id,
            job_id=job_id
        )

        # Save result to database
        await _save_result(job_id, user_id, request, result)

        # Save to user history if successful and user is authenticated
        if result["success"] and user_id:
            await _save_to_history(user_id, job_id, request, result)

        logger.info(f"TTS generation completed - Job: {job_id}, Success: {result['success']}")

    except Exception as e:
        logger.error(f"Background TTS generation failed - Job: {job_id}, Error: {e}")

        # Save error result
        error_result = {"success": False, "error": str(e)}
        await _save_result(job_id, user_id, request, error_result)

async def _save_result(job_id: str, user_id: Optional[str], request: TTSRequest, result: Dict[str, Any]):
    """Save TTS result to database for retrieval."""
    try:
        db = get_db()

        result_doc = {
            "job_id": job_id,
            "user_id": user_id,
            "request": request.dict(),
            "result": result,
            "success": result["success"],
            "audio_url": result.get("audio_url"),
            "cloudinary_public_id": result.get("cloudinary_public_id"),
            "timestamps": result.get("timestamps"),
            "metadata": result.get("metadata"),
            "error": result.get("error"),
            "processing_time": result.get("metadata", {}).get("processing_time"),
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc).replace(hour=23, minute=59, second=59)  # Expire at end of day
        }

        # Merge result fields into document
        result_doc.update(result)

        db.tts_results.insert_one(result_doc)

        # Create TTL index for automatic cleanup
        db.tts_results.create_index("expires_at", expireAfterSeconds=0)

    except Exception as e:
        logger.error(f"Failed to save TTS result: {e}")

async def _save_to_history(user_id: str, job_id: str, request: TTSRequest, result: Dict[str, Any]):
    """Save successful TTS generation to user's history."""
    try:
        db = get_db()

        history_doc = {
            "userId": user_id,
            "type": "tts",
            "job_id": job_id,
            "text": request.text,
            "voice": request.voice,
            "audio_url": result.get("audio_url"),
            "cloudinary_public_id": result.get("cloudinary_public_id"),
            "previewUrl": result.get("audio_url"),
            "finalUrls": [result.get("audio_url")] if result.get("audio_url") else [],
            "sizeBytes": 0,  # TODO: Get actual file size from Cloudinary
            "model": "elevenlabs-tts-multilingual-v2",
            "voice_info": result.get("metadata", {}).get("voice_info", {}),
            "parameters": {
                "stability": request.stability,
                "similarity_boost": request.similarity_boost,
                "style": request.style,
                "speed": request.speed,
                "language_code": request.language_code
            },
            "timestamps": result.get("timestamps"),
            "duration": result.get("metadata", {}).get("estimated_duration"),
            "processing_time": result.get("metadata", {}).get("processing_time"),
            "creditCost": 0,  # Free during testing mode
            "createdAt": datetime.now(timezone.utc),
            "status": "completed"
        }

        db.generations.insert_one(history_doc)
        logger.info(f"TTS generation saved to history: {job_id}")

    except Exception as e:
        logger.error(f"Failed to save TTS to history: {e}")

# Cleanup expired results (run periodically)
@router.get("/admin/cleanup")
async def cleanup_expired_results():
    """Admin endpoint to cleanup expired TTS results."""
    try:
        db = get_db()

        # Remove expired results
        result = db.tts_results.delete_many({
            "expires_at": {"$lt": datetime.now(timezone.utc)}
        })

        return {
            "success": True,
            "deleted_count": result.deleted_count,
            "message": f"Cleaned up {result.deleted_count} expired TTS results"
        }

    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))