"""
Perfect Text-to-Speech service using ElevenLabs Turbo v2.5 via FAL AI
Handles audio generation, Cloudinary upload, progress tracking, and user history
"""

import os
import asyncio
import logging
from typing import Dict, Any, Optional, List
import httpx
import json
import time
from datetime import datetime, timezone
import tempfile
import aiofiles
import base64
from pathlib import Path

try:
    import cloudinary
    import cloudinary.uploader
    from cloudinary.utils import cloudinary_url
except ImportError:
    cloudinary = None

logger = logging.getLogger(__name__)

class TTSService:
    """Perfect TTS service with comprehensive error handling and file management."""

    def __init__(self):
        self.fal_api_key = os.getenv("FAL_API_KEY")
        if not self.fal_api_key:
            logger.error("FAL_API_KEY not configured")
            raise ValueError("FAL_API_KEY is required")

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
            logger.info("Cloudinary configured successfully")
        else:
            self.cloudinary_configured = False
            logger.warning("Cloudinary not configured - uploads will be disabled")

        # FAL client setup
        try:
            import fal_client
            os.environ["FAL_KEY"] = self.fal_api_key
            self.fal = fal_client
            logger.info("FAL client configured successfully")
        except ImportError:
            logger.error("fal-client not installed")
            raise ImportError("Please install fal-client: pip install fal-client")

        # ElevenLabs TTS Turbo v2.5 model
        self.tts_model = "fal-ai/elevenlabs/tts/turbo-v2.5"

        # Available voices with descriptions
        self.available_voices = {
            "Rachel": {"name": "Rachel", "gender": "Female", "accent": "American", "description": "Professional, warm female voice"},
            "Drew": {"name": "Drew", "gender": "Male", "accent": "American", "description": "Confident, articulate male voice"},
            "Clyde": {"name": "Clyde", "gender": "Male", "accent": "American", "description": "Friendly, approachable male voice"},
            "Paul": {"name": "Paul", "gender": "Male", "accent": "British", "description": "Sophisticated British male voice"},
            "Domi": {"name": "Domi", "gender": "Female", "accent": "American", "description": "Youthful, energetic female voice"},
            "Dave": {"name": "Dave", "gender": "Male", "accent": "British", "description": "Mature British male voice"},
            "Fin": {"name": "Fin", "gender": "Male", "accent": "Irish", "description": "Charismatic Irish male voice"},
            "Sarah": {"name": "Sarah", "gender": "Female", "accent": "American", "description": "Clear, professional female voice"},
            "Antoni": {"name": "Antoni", "gender": "Male", "accent": "American", "description": "Warm, engaging male voice"},
            "Thomas": {"name": "Thomas", "gender": "Male", "accent": "American", "description": "Authoritative, clear male voice"},
            "Charlie": {"name": "Charlie", "gender": "Male", "accent": "Australian", "description": "Friendly Australian male voice"},
            "Emily": {"name": "Emily", "gender": "Female", "accent": "American", "description": "Gentle, soothing female voice"},
            "Elli": {"name": "Elli", "gender": "Female", "accent": "American", "description": "Bright, cheerful female voice"},
            "Callum": {"name": "Callum", "gender": "Male", "accent": "American", "description": "Strong, confident male voice"},
            "Patrick": {"name": "Patrick", "gender": "Male", "accent": "American", "description": "Smooth, professional male voice"},
            "Harry": {"name": "Harry", "gender": "Male", "accent": "American", "description": "Dynamic, versatile male voice"},
            "Liam": {"name": "Liam", "gender": "Male", "accent": "American", "description": "Young, energetic male voice"},
            "Dorothy": {"name": "Dorothy", "gender": "Female", "accent": "British", "description": "Elegant British female voice"},
            "Josh": {"name": "Josh", "gender": "Male", "accent": "American", "description": "Casual, relatable male voice"},
            "Arnold": {"name": "Arnold", "gender": "Male", "accent": "American", "description": "Deep, resonant male voice"},
            "Charlotte": {"name": "Charlotte", "gender": "Female", "accent": "British", "description": "Refined British female voice"},
            "Matilda": {"name": "Matilda", "gender": "Female", "accent": "American", "description": "Articulate, intelligent female voice"},
            "Matthew": {"name": "Matthew", "gender": "Male", "accent": "American", "description": "Calm, reassuring male voice"},
            "James": {"name": "James", "gender": "Male", "accent": "Australian", "description": "Charismatic Australian male voice"},
            "Joseph": {"name": "Joseph", "gender": "Male", "accent": "British", "description": "Distinguished British male voice"},
            "Jeremy": {"name": "Jeremy", "gender": "Male", "accent": "American", "description": "Expressive, animated male voice"},
            "Michael": {"name": "Michael", "gender": "Male", "accent": "American", "description": "Versatile, professional male voice"},
            "Ethan": {"name": "Ethan", "gender": "Male", "accent": "American", "description": "Modern, youthful male voice"},
            "Gigi": {"name": "Gigi", "gender": "Female", "accent": "American", "description": "Playful, vibrant female voice"},
            "Freya": {"name": "Freya", "gender": "Female", "accent": "American", "description": "Strong, confident female voice"},
            "Grace": {"name": "Grace", "gender": "Female", "accent": "American", "description": "Elegant, sophisticated female voice"},
            "Daniel": {"name": "Daniel", "gender": "Male", "accent": "British", "description": "Polished British male voice"},
            "Lily": {"name": "Lily", "gender": "Female", "accent": "British", "description": "Sweet, melodic British female voice"},
            "Serena": {"name": "Serena", "gender": "Female", "accent": "American", "description": "Dramatic, expressive female voice"},
            "Adam": {"name": "Adam", "gender": "Male", "accent": "American", "description": "Deep, authoritative male voice"},
            "Nicole": {"name": "Nicole", "gender": "Female", "accent": "American", "description": "Smooth, professional female voice"},
            "Jessie": {"name": "Jessie", "gender": "Female", "accent": "American", "description": "Friendly, approachable female voice"},
            "Ryan": {"name": "Ryan", "gender": "Male", "accent": "American", "description": "Energetic, upbeat male voice"},
            "Sam": {"name": "Sam", "gender": "Male", "accent": "American", "description": "Casual, conversational male voice"},
            "Glinda": {"name": "Glinda", "gender": "Female", "accent": "American", "description": "Magical, enchanting female voice"},
            "Giovanni": {"name": "Giovanni", "gender": "Male", "accent": "American", "description": "Romantic, passionate male voice"},
            "Mimi": {"name": "Mimi", "gender": "Female", "accent": "American", "description": "Cute, bubbly female voice"}
        }

        # Progress tracking
        self.active_jobs = {}

    async def generate_tts(
        self,
        text: str,
        voice: str = "Rachel",
        stability: float = 0.5,
        similarity_boost: float = 0.75,
        style: Optional[float] = None,
        speed: float = 1.0,
        timestamps: bool = False,
        previous_text: Optional[str] = None,
        next_text: Optional[str] = None,
        language_code: Optional[str] = None,
        user_id: Optional[str] = None,
        job_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate perfect TTS audio with comprehensive error handling.

        Args:
            text: Text to convert to speech (max 5000 chars)
            voice: Voice name from available voices
            stability: Voice stability (0.0-1.0)
            similarity_boost: Similarity boost (0.0-1.0)
            style: Style exaggeration (0.0-1.0)
            speed: Speech speed (0.25-4.0)
            timestamps: Whether to return word timestamps
            previous_text: Previous text for continuity
            next_text: Next text for continuity
            language_code: ISO 639-1 language code
            user_id: User ID for history tracking
            job_id: Job ID for progress tracking

        Returns:
            Dict with success status, audio_url, cloudinary_url, metadata
        """
        start_time = time.time()

        try:
            # Input validation
            validation_result = self._validate_tts_input(text, voice, stability, similarity_boost, style, speed)
            if not validation_result["valid"]:
                return {"success": False, "error": validation_result["error"]}

            # Initialize job tracking
            if job_id:
                self.active_jobs[job_id] = {
                    "status": "processing",
                    "progress": 0,
                    "stage": "initializing",
                    "start_time": start_time
                }

            # Prepare FAL request parameters
            input_data = {
                "text": text,
                "voice": voice,
                "stability": stability,
                "similarity_boost": similarity_boost,
                "speed": speed
            }

            # Add optional parameters
            if style is not None:
                input_data["style"] = style
            if timestamps:
                input_data["timestamps"] = timestamps
            if previous_text:
                input_data["previous_text"] = previous_text
            if next_text:
                input_data["next_text"] = next_text
            if language_code:
                input_data["language_code"] = language_code

            logger.info(f"TTS Request - Text length: {len(text)}, Voice: {voice}, Job: {job_id}")

            # Update progress
            if job_id:
                self._update_job_progress(job_id, 10, "submitting_to_fal")

            # Submit to FAL AI with timeout
            try:
                result = await asyncio.wait_for(
                    self._submit_to_fal(input_data, job_id),
                    timeout=300.0  # 5 minute timeout
                )
            except asyncio.TimeoutError:
                error_msg = "TTS generation timed out after 5 minutes"
                logger.error(error_msg)
                if job_id:
                    self._update_job_progress(job_id, -1, "timeout")
                return {"success": False, "error": error_msg}

            if not result["success"]:
                if job_id:
                    self._update_job_progress(job_id, -1, "fal_error")
                return result

            # Update progress
            if job_id:
                self._update_job_progress(job_id, 60, "processing_audio")

            # Handle the audio result
            audio_url = result.get("audio_url")
            timestamps_data = result.get("timestamps", [])

            if not audio_url:
                error_msg = "No audio URL received from FAL AI"
                logger.error(error_msg)
                if job_id:
                    self._update_job_progress(job_id, -1, "no_audio_url")
                return {"success": False, "error": error_msg}

            # Download and upload to Cloudinary
            if job_id:
                self._update_job_progress(job_id, 80, "uploading_to_cloudinary")

            cloudinary_result = await self._handle_audio_upload(
                audio_url, text, voice, user_id, job_id
            )

            if not cloudinary_result["success"]:
                logger.warning(f"Cloudinary upload failed: {cloudinary_result.get('error')}")
                # Continue with original URL if Cloudinary fails
                cloudinary_url = audio_url
                public_id = None
            else:
                cloudinary_url = cloudinary_result["cloudinary_url"]
                public_id = cloudinary_result["public_id"]

            # Calculate audio duration estimate
            estimated_duration = self._estimate_audio_duration(text, speed)

            # Prepare final result
            final_result = {
                "success": True,
                "audio_url": cloudinary_url,
                "original_fal_url": audio_url,
                "cloudinary_public_id": public_id,
                "timestamps": timestamps_data,
                "metadata": {
                    "text": text,
                    "text_length": len(text),
                    "voice": voice,
                    "voice_info": self.available_voices.get(voice, {}),
                    "stability": stability,
                    "similarity_boost": similarity_boost,
                    "style": style,
                    "speed": speed,
                    "language_code": language_code,
                    "estimated_duration": estimated_duration,
                    "processing_time": round(time.time() - start_time, 2),
                    "model": "elevenlabs-tts-turbo-v2.5",
                    "generated_at": datetime.now(timezone.utc).isoformat()
                }
            }

            # Update progress to completed
            if job_id:
                self._update_job_progress(job_id, 100, "completed")
                # Clean up job tracking after a delay
                asyncio.create_task(self._cleanup_job(job_id, delay=300))  # 5 minutes

            logger.info(f"TTS generation completed successfully in {round(time.time() - start_time, 2)}s")
            return final_result

        except Exception as e:
            logger.error(f"TTS generation failed: {e}")
            if job_id:
                self._update_job_progress(job_id, -1, "error")
                # Clean up failed job
                asyncio.create_task(self._cleanup_job(job_id, delay=60))
            return {"success": False, "error": str(e)}

    async def _submit_to_fal(self, input_data: Dict[str, Any], job_id: Optional[str] = None) -> Dict[str, Any]:
        """Submit TTS request to FAL AI with proper error handling."""
        try:
            # Use synchronous FAL client in async context
            result = await asyncio.to_thread(
                self.fal.subscribe,
                self.tts_model,
                arguments=input_data,
                with_logs=True
            )

            # Handle different response formats
            if hasattr(result, 'data'):
                data = result.data
            elif isinstance(result, dict):
                data = result
            else:
                logger.error(f"Unexpected FAL result format: {type(result)}")
                return {"success": False, "error": "Unexpected response format from FAL AI"}

            # Extract audio URL
            audio_data = data.get("audio")
            if audio_data and isinstance(audio_data, dict):
                audio_url = audio_data.get("url")
            elif isinstance(audio_data, str):
                audio_url = audio_data
            else:
                audio_url = data.get("audio_url")

            if not audio_url:
                logger.error(f"No audio URL in FAL response: {data}")
                return {"success": False, "error": "No audio URL in response"}

            # Extract timestamps if available
            timestamps = data.get("timestamps", [])

            return {
                "success": True,
                "audio_url": audio_url,
                "timestamps": timestamps
            }

        except Exception as e:
            logger.error(f"FAL AI request failed: {e}")
            return {"success": False, "error": f"FAL AI request failed: {str(e)}"}

    async def _handle_audio_upload(
        self,
        audio_url: str,
        text: str,
        voice: str,
        user_id: Optional[str],
        job_id: Optional[str]
    ) -> Dict[str, Any]:
        """Download audio from FAL and upload to Cloudinary."""
        if not self.cloudinary_configured:
            return {"success": False, "error": "Cloudinary not configured"}

        try:
            # Download audio file
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(audio_url)
                response.raise_for_status()
                audio_data = response.content

            if not audio_data:
                return {"success": False, "error": "Empty audio file downloaded"}

            # Create meaningful public ID
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            safe_voice = voice.lower().replace(" ", "_")
            text_preview = text[:30].replace(" ", "_").replace("/", "_").replace("\\", "_")
            public_id_parts = ["tts", timestamp, safe_voice]

            if user_id:
                public_id_parts.insert(1, f"user_{user_id}")
            if job_id:
                public_id_parts.append(f"job_{job_id}")

            public_id = "_".join(public_id_parts)

            # Upload to Cloudinary
            upload_result = await asyncio.to_thread(
                cloudinary.uploader.upload,
                audio_data,
                public_id=public_id,
                resource_type="video",  # Audio files use video resource type
                format="mp3",
                context={
                    "text_preview": text[:100],
                    "voice": voice,
                    "text_length": str(len(text)),
                    "generated_at": datetime.now(timezone.utc).isoformat()
                },
                tags=["tts", "elevenlabs", voice.lower(), f"user_{user_id}" if user_id else "anonymous"]
            )

            cloudinary_url = upload_result.get("secure_url") or upload_result.get("url")

            if not cloudinary_url:
                return {"success": False, "error": "No URL returned from Cloudinary"}

            logger.info(f"Audio uploaded to Cloudinary: {public_id}")

            return {
                "success": True,
                "cloudinary_url": cloudinary_url,
                "public_id": upload_result["public_id"],
                "bytes": upload_result.get("bytes", 0),
                "format": upload_result.get("format", "mp3"),
                "resource_type": upload_result.get("resource_type", "video")
            }

        except httpx.HTTPError as e:
            logger.error(f"Failed to download audio: {e}")
            return {"success": False, "error": f"Failed to download audio: {str(e)}"}
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}")
            return {"success": False, "error": f"Cloudinary upload failed: {str(e)}"}

    def _validate_tts_input(
        self,
        text: str,
        voice: str,
        stability: float,
        similarity_boost: float,
        style: Optional[float],
        speed: float
    ) -> Dict[str, Any]:
        """Validate TTS input parameters."""
        # Text validation
        if not text or not text.strip():
            return {"valid": False, "error": "Text is required"}

        if len(text) > 5000:
            return {"valid": False, "error": "Text exceeds maximum length of 5000 characters"}

        # Voice validation
        if voice not in self.available_voices:
            return {"valid": False, "error": f"Invalid voice '{voice}'. Available voices: {list(self.available_voices.keys())}"}

        # Parameter range validation
        if not 0.0 <= stability <= 1.0:
            return {"valid": False, "error": "Stability must be between 0.0 and 1.0"}

        if not 0.0 <= similarity_boost <= 1.0:
            return {"valid": False, "error": "Similarity boost must be between 0.0 and 1.0"}

        if style is not None and not 0.0 <= style <= 1.0:
            return {"valid": False, "error": "Style must be between 0.0 and 1.0"}

        if not 0.25 <= speed <= 4.0:
            return {"valid": False, "error": "Speed must be between 0.25 and 4.0"}

        return {"valid": True}

    def _estimate_audio_duration(self, text: str, speed: float) -> float:
        """Estimate audio duration based on text length and speed."""
        # Average speaking rate: ~150 words per minute at normal speed
        words = len(text.split())
        base_duration = (words / 150) * 60  # Duration in seconds at normal speed
        adjusted_duration = base_duration / speed  # Adjust for speed
        return round(adjusted_duration, 1)

    def _update_job_progress(self, job_id: str, progress: int, stage: str):
        """Update job progress for real-time tracking."""
        if job_id in self.active_jobs:
            self.active_jobs[job_id].update({
                "progress": progress,
                "stage": stage,
                "updated_at": time.time()
            })

    async def _cleanup_job(self, job_id: str, delay: int = 0):
        """Clean up job tracking after delay."""
        if delay > 0:
            await asyncio.sleep(delay)
        self.active_jobs.pop(job_id, None)

    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get current job status for progress tracking."""
        return self.active_jobs.get(job_id)

    def get_available_voices(self) -> List[Dict[str, Any]]:
        """Get list of available voices with metadata."""
        return [
            {
                "id": voice_id,
                **voice_data
            }
            for voice_id, voice_data in self.available_voices.items()
        ]

    async def test_service(self) -> Dict[str, Any]:
        """Test the TTS service with a simple request."""
        try:
            result = await self.generate_tts(
                text="Hello! This is a test of the text-to-speech system.",
                voice="Rachel",
                job_id="test_job"
            )
            return result
        except Exception as e:
            logger.error(f"TTS service test failed: {e}")
            return {"success": False, "error": str(e)}