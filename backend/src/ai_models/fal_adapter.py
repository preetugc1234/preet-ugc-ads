"""
Fal AI adapter for TTS, Video generation (with/without audio), and UGC workflows
Handles all video and audio generation tasks
"""

import os
import asyncio
import logging
from typing import Dict, Any, List, Optional, Tuple, Union
import httpx
import base64
import json
from datetime import datetime
import time
import fal_client

logger = logging.getLogger(__name__)

class FalAdapter:
    """Fal AI integration for TTS, Video, and UGC generation."""

    def __init__(self):
        self.api_key = os.getenv("FAL_API_KEY")
        self.base_url = "https://fal.run"

        # Initialize new fal client
        self.fal = fal_client.SyncClient(key=self.api_key) if self.api_key else None

        # Fal AI model endpoints
        self.models = {
            "tts": "fal-ai/elevenlabs-text-to-speech",
            "tts_turbo": "fal-ai/elevenlabs/tts/turbo-v2.5",  # ElevenLabs TTS Turbo v2.5
            "img2vid_noaudio": "fal-ai/kling-video/v2.1/pro/image-to-video",  # Kling v2.1 Pro (no audio)
            "img2vid_audio": "fal-ai/kling-video/v1/pro/ai-avatar",  # Kling v1 Pro AI Avatar (with audio)
            "audio2vid": "veed/avatars/audio-to-video",  # Veed Avatars Audio-to-Video via Fal AI
            "image_generation": "fal-ai/flux/schnell"  # FLUX Schnell for image generation
        }

        # Configure environment variable for backward compatibility
        if self.api_key:
            os.environ["FAL_KEY"] = self.api_key

        if not self.api_key:
            logger.warning("Fal AI API key not configured")

    # Async submission methods for long-running requests
    async def submit_img2vid_noaudio_async(self, params: Dict[str, Any], webhook_url: str = None) -> Dict[str, Any]:
        """Submit Image-to-Video (no audio) request asynchronously with optional webhook."""
        try:
            image_url = params.get("image_url")
            prompt = params.get("prompt", "")
            duration = min(params.get("duration_seconds", 10), 10)

            if not image_url:
                raise Exception("Image URL is required")

            arguments = {
                "image_url": image_url,
                "prompt": prompt,
                "duration": str(duration),
                "negative_prompt": params.get("negative_prompt", "blur, distort, and low quality"),
                "cfg_scale": params.get("cfg_scale", 0.5)
            }

            if params.get("tail_image_url"):
                arguments["tail_image_url"] = params["tail_image_url"]

            # Submit request for async processing
            handler = await asyncio.to_thread(
                fal_client.submit,
                self.models["img2vid_noaudio"],
                arguments=arguments,
                webhook_url=webhook_url
            )

            return {
                "success": True,
                "request_id": handler.request_id,
                "status": "submitted",
                "model": "kling-v2.1-pro",
                "estimated_processing_time": "6 minutes"
            }

        except Exception as e:
            logger.error(f"Async submission failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def get_async_result(self, request_id: str) -> Dict[str, Any]:
        """Get result from async submission."""
        try:
            result = await asyncio.to_thread(
                fal_client.result,
                self.models["img2vid_noaudio"],
                request_id
            )

            if result and "video" in result:
                video_data = result["video"]
                return {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "model": "kling-v2.1-pro",
                    "status": "completed"
                }
            else:
                return {
                    "success": False,
                    "status": "failed",
                    "error": "No video generated"
                }

        except Exception as e:
            logger.error(f"Failed to get async result: {e}")
            return {
                "success": False,
                "error": str(e),
                "status": "error"
            }

    async def upload_file_to_fal(self, file_path: str) -> str:
        """Upload file to Fal AI storage and return URL."""
        try:
            url = await asyncio.to_thread(fal_client.upload_file, file_path)
            return url
        except Exception as e:
            logger.error(f"Failed to upload file to Fal: {e}")
            raise

    # ElevenLabs TTS Turbo v2.5 Methods (New Implementation)
    async def submit_tts_turbo_async(self, params: Dict[str, Any], webhook_url: str = None) -> Dict[str, Any]:
        """Submit ElevenLabs TTS Turbo v2.5 request asynchronously with 12-minute timeout support."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            text = params.get("text")
            if not text:
                raise Exception("Text is required for TTS")

            if len(text) > 5000:
                raise Exception("Text length exceeds maximum of 5000 characters")

            input_data = {
                "text": text,
                "voice": params.get("voice", "Rachel"),
                "stability": params.get("stability", 0.5),
                "similarity_boost": params.get("similarity_boost", 0.75),
                "speed": params.get("speed", 1.0)
            }

            # Optional parameters
            if params.get("style") is not None:
                input_data["style"] = params["style"]
            if params.get("timestamps"):
                input_data["timestamps"] = params["timestamps"]
            if params.get("previous_text"):
                input_data["previous_text"] = params["previous_text"]
            if params.get("next_text"):
                input_data["next_text"] = params["next_text"]
            if params.get("language_code"):
                input_data["language_code"] = params["language_code"]

            # Submit for async processing using queue
            handle = await asyncio.to_thread(
                self.fal.submit,
                self.models["tts_turbo"],
                input_data,
                webhook_url=webhook_url
            )

            # Return handle for async processing
            result = handle

            if hasattr(result, 'request_id'):
                return {
                    "success": True,
                    "request_id": result.request_id,
                    "status": "submitted",
                    "model": "elevenlabs-tts-turbo-v2.5",
                    "estimated_processing_time": "8 minutes",
                    "timeout_buffer": "4 minutes",
                    "total_timeout": "12 minutes"
                }
            else:
                # Immediate result case
                return self._format_tts_result(result, is_async=False)

        except Exception as e:
            logger.error(f"TTS Turbo async submission failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def check_tts_turbo_status(self, request_id: str) -> Dict[str, Any]:
        """Check status of ElevenLabs TTS Turbo request."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            status = await asyncio.to_thread(
                self.fal.status,
                self.models["tts_turbo"],
                request_id,
                with_logs=True
            )

            return {
                "success": True,
                "request_id": request_id,
                "status": status.get("status", "unknown"),
                "logs": status.get("logs", []),
                "queue_position": status.get("queue_position"),
                "estimated_time": status.get("estimated_time")
            }

        except Exception as e:
            logger.error(f"Failed to check TTS Turbo status: {e}")
            return {
                "success": False,
                "error": str(e),
                "request_id": request_id
            }

    async def get_tts_turbo_result(self, request_id: str) -> Dict[str, Any]:
        """Get result from completed ElevenLabs TTS Turbo request."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            result = await asyncio.to_thread(
                self.fal.result,
                self.models["tts_turbo"],
                request_id
            )

            return self._format_tts_result(result, request_id=request_id)

        except Exception as e:
            logger.error(f"Failed to get TTS Turbo result: {e}")
            return {
                "success": False,
                "error": str(e),
                "request_id": request_id
            }

    async def stream_tts_turbo(self, params: Dict[str, Any]):
        """Stream ElevenLabs TTS Turbo v2.5 for real-time audio generation."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            text = params.get("text")
            if not text:
                raise Exception("Text is required for TTS")

            input_data = {
                "text": text,
                "voice": params.get("voice", "Rachel"),
                "stability": params.get("stability", 0.5),
                "similarity_boost": params.get("similarity_boost", 0.75),
                "speed": params.get("speed", 1.0)
            }

            # Optional parameters
            if params.get("style") is not None:
                input_data["style"] = params["style"]
            if params.get("language_code"):
                input_data["language_code"] = params["language_code"]

            # Use streaming API
            async def stream_generator():
                stream = await asyncio.to_thread(
                    self.fal.stream,
                    self.models["tts_turbo"],
                    {"input": input_data}
                )

                async for event in stream:
                    yield event

                # Get final result
                result = await stream.done()
                yield {"type": "final", "data": result}

            return stream_generator()

        except Exception as e:
            logger.error(f"TTS Turbo streaming failed: {e}")
            raise

    def _format_tts_result(self, result, request_id=None, is_async=True):
        """Format TTS result response."""
        try:
            if result and hasattr(result, 'data') and "audio" in result.data:
                audio_data = result.data["audio"]
                timestamps = result.data.get("timestamps", [])

                response = {
                    "success": True,
                    "audio_url": audio_data.get("url"),
                    "timestamps": timestamps,
                    "model": "elevenlabs-tts-turbo-v2.5",
                    "processing_completed": True
                }

                if request_id:
                    response["request_id"] = request_id
                if hasattr(result, 'requestId'):
                    response["request_id"] = result.requestId

                return response
            else:
                return {
                    "success": False,
                    "error": "No audio generated",
                    "request_id": request_id
                }

        except Exception as e:
            logger.error(f"Failed to format TTS result: {e}")
            return {
                "success": False,
                "error": str(e),
                "request_id": request_id
            }

    # Text-to-Speech Methods (Legacy)
    async def generate_tts_preview(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate TTS preview using ElevenLabs via Fal AI."""
        try:
            text = params.get("text", "Hello, this is a test speech.")
            voice = params.get("voice", "rachel")  # Default voice

            # Truncate text for preview (faster generation)
            preview_text = text[:100] + "..." if len(text) > 100 else text

            payload = {
                "text": preview_text,
                "voice": voice,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.75,
                    "style": 0.0,
                    "use_speaker_boost": True
                },
                "output_format": "mp3_22050_32"
            }

            result = await self._make_request(self.models["tts"], payload)

            if result and "audio_url" in result:
                return {
                    "success": True,
                    "audio_url": result["audio_url"],
                    "text": preview_text,
                    "voice": voice,
                    "model": "elevenlabs-tts",
                    "duration": result.get("duration", 0),
                    "preview": True
                }
            else:
                raise Exception("No audio generated")

        except Exception as e:
            logger.error(f"TTS preview generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "audio_url": None
            }

    async def generate_tts_final(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final TTS using ElevenLabs via Fal AI."""
        try:
            text = params.get("text", "Hello, this is a test speech.")
            voice = params.get("voice", "rachel")
            model_id = params.get("model_id", "eleven_multilingual_v2")  # Better model for final

            payload = {
                "text": text,
                "voice": voice,
                "model_id": model_id,
                "voice_settings": {
                    "stability": 0.4,
                    "similarity_boost": 0.8,
                    "style": 0.2,
                    "use_speaker_boost": True
                },
                "output_format": "mp3_44100_128"  # Higher quality for final
            }

            result = await self._make_request(self.models["tts"], payload)

            if result and "audio_url" in result:
                return {
                    "success": True,
                    "audio_url": result["audio_url"],
                    "text": text,
                    "voice": voice,
                    "model": model_id,
                    "duration": result.get("duration", 0),
                    "file_size": result.get("file_size", 0),
                    "preview": False
                }
            else:
                raise Exception("No audio generated")

        except Exception as e:
            logger.error(f"TTS final generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "audio_url": None
            }

    # Image-to-Video (No Audio) Methods
    async def generate_img2vid_noaudio_preview(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Image-to-Video preview (no audio) using Kling v2.1 Pro."""
        try:
            image_url = params.get("image_url")
            prompt = params.get("prompt", "")
            duration = min(params.get("duration_seconds", 5), 5)  # Max 5s for preview

            if not image_url:
                raise Exception("Image URL is required")

            # Use fal_client for Kling v2.1 Pro
            arguments = {
                "image_url": image_url,
                "prompt": prompt,
                "duration": str(duration),
                "negative_prompt": params.get("negative_prompt", "blur, distort, and low quality"),
                "cfg_scale": params.get("cfg_scale", 0.5)
            }

            # Submit request asynchronously
            result = await asyncio.to_thread(
                fal_client.subscribe,
                self.models["img2vid_noaudio"],
                arguments=arguments,
                with_logs=True
            )

            if result and "video" in result:
                video_data = result["video"]
                return {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "duration": duration,
                    "aspect_ratio": params.get("aspect_ratio", "16:9"),
                    "model": "kling-v2.1-pro",
                    "has_audio": False,
                    "preview": True,
                    "processing_time": "~2-3 minutes"
                }
            else:
                raise Exception("No video generated from Kling v2.1 Pro")

        except Exception as e:
            logger.error(f"Image-to-video (no audio) preview failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }

    async def generate_img2vid_noaudio_final(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final Image-to-Video (no audio) using Kling v2.1 Pro."""
        try:
            image_url = params.get("image_url")
            prompt = params.get("prompt", "")
            duration = min(params.get("duration_seconds", 10), 10)  # Max 10s for final

            if not image_url:
                raise Exception("Image URL is required")

            # Use fal_client for Kling v2.1 Pro with full parameters
            arguments = {
                "image_url": image_url,
                "prompt": prompt,
                "duration": str(duration),
                "negative_prompt": params.get("negative_prompt", "blur, distort, and low quality"),
                "cfg_scale": params.get("cfg_scale", 0.5)
            }

            # Add tail image if provided for more sophisticated videos
            if params.get("tail_image_url"):
                arguments["tail_image_url"] = params["tail_image_url"]

            # Submit request asynchronously
            result = await asyncio.to_thread(
                fal_client.subscribe,
                self.models["img2vid_noaudio"],
                arguments=arguments,
                with_logs=True
            )

            if result and "video" in result:
                video_data = result["video"]
                return {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "duration": duration,
                    "aspect_ratio": params.get("aspect_ratio", "16:9"),
                    "quality": "pro",
                    "model": "kling-v2.1-pro",
                    "has_audio": False,
                    "preview": False,
                    "processing_time": "~6 minutes"
                }
            else:
                raise Exception("No video generated from Kling v2.1 Pro")

        except Exception as e:
            logger.error(f"Image-to-video (no audio) final failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }

    # Image-to-Video (With Audio) Methods - Using Kling v1 Pro AI Avatar
    async def generate_img2vid_audio_preview(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Image-to-Video preview (with audio) using Kling v1 Pro AI Avatar."""
        try:
            image_url = params.get("image_url")
            audio_url = params.get("audio_url")

            if not image_url:
                raise Exception("Image URL is required")
            if not audio_url:
                raise Exception("Audio URL is required for AI Avatar")

            # Kling v1 Pro AI Avatar parameters (simplified for preview)
            arguments = {
                "image_url": image_url,
                "audio_url": audio_url
            }

            # Submit request using fal_client
            result = await asyncio.to_thread(
                fal_client.subscribe,
                self.models["img2vid_audio"],
                arguments=arguments,
                with_logs=True
            )

            if result and "video" in result:
                video_data = result["video"]
                return {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "duration": params.get("duration_seconds", 5),
                    "aspect_ratio": params.get("aspect_ratio", "1:1"),  # AI Avatar typically square
                    "model": "kling-v1-pro-ai-avatar",
                    "has_audio": True,
                    "audio_synced": True,
                    "preview": True,
                    "processing_time": "~7-8 minutes"
                }
            else:
                raise Exception("No video generated from Kling v1 Pro AI Avatar")

        except Exception as e:
            logger.error(f"Image-to-video (with audio) preview failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }

    async def generate_img2vid_audio_final(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final Image-to-Video (with audio) using Kling v1 Pro AI Avatar."""
        try:
            image_url = params.get("image_url")
            audio_url = params.get("audio_url")

            if not image_url:
                raise Exception("Image URL is required")
            if not audio_url:
                raise Exception("Audio URL is required for AI Avatar")

            # Kling v1 Pro AI Avatar parameters
            arguments = {
                "image_url": image_url,
                "audio_url": audio_url
            }

            # Submit request using fal_client
            result = await asyncio.to_thread(
                fal_client.subscribe,
                self.models["img2vid_audio"],
                arguments=arguments,
                with_logs=True
            )

            if result and "video" in result:
                video_data = result["video"]
                return {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "duration": params.get("duration_seconds", 10),
                    "aspect_ratio": params.get("aspect_ratio", "1:1"),  # AI Avatar typically square
                    "quality": "pro",
                    "model": "kling-v1-pro-ai-avatar",
                    "has_audio": True,
                    "audio_synced": True,
                    "preview": False,
                    "processing_time": "~7-8 minutes"
                }
            else:
                raise Exception("No video generated from Kling v1 Pro AI Avatar")

        except Exception as e:
            logger.error(f"Image-to-video (with audio) final failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }

    # New Kling AI Avatar methods using modern fal client
    async def submit_kling_avatar_async(self, params: Dict[str, Any], webhook_url: str = None) -> Dict[str, Any]:
        """Submit Kling AI Avatar request asynchronously with 12-minute timeout support."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            image_url = params.get("image_url")
            audio_url = params.get("audio_url")
            prompt = params.get("prompt", "")

            if not image_url:
                raise Exception("Image URL is required")
            if not audio_url:
                raise Exception("Audio URL is required")

            input_data = {
                "image_url": image_url,
                "audio_url": audio_url
            }

            if prompt:
                input_data["prompt"] = prompt

            # Submit with logs and queue handling for long-running request
            result = await asyncio.to_thread(
                self.fal.subscribe,
                self.models["img2vid_audio"],
                {
                    "input": input_data,
                    "logs": True,
                    "onQueueUpdate": self._queue_update_handler if not webhook_url else None
                }
            )

            if hasattr(result, 'requestId'):
                return {
                    "success": True,
                    "request_id": result.requestId,
                    "status": "submitted",
                    "model": "kling-v1-pro-ai-avatar",
                    "estimated_processing_time": "7-8 minutes",
                    "timeout_buffer": "4 minutes",
                    "total_timeout": "12 minutes"
                }
            else:
                # Immediate result case
                return self._format_avatar_result(result, is_async=False)

        except Exception as e:
            logger.error(f"Kling Avatar async submission failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def check_kling_avatar_status(self, request_id: str) -> Dict[str, Any]:
        """Check status of Kling AI Avatar request."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            status = await asyncio.to_thread(
                self.fal.queue.status,
                self.models["img2vid_audio"],
                {"requestId": request_id, "logs": True}
            )

            return {
                "success": True,
                "request_id": request_id,
                "status": status.get("status", "unknown"),
                "logs": status.get("logs", []),
                "queue_position": status.get("queue_position"),
                "estimated_time": status.get("estimated_time")
            }

        except Exception as e:
            logger.error(f"Failed to check Kling Avatar status: {e}")
            return {
                "success": False,
                "error": str(e),
                "request_id": request_id
            }

    async def get_kling_avatar_result(self, request_id: str) -> Dict[str, Any]:
        """Get result from completed Kling AI Avatar request."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            result = await asyncio.to_thread(
                self.fal.queue.result,
                self.models["img2vid_audio"],
                {"requestId": request_id}
            )

            return self._format_avatar_result(result, request_id=request_id)

        except Exception as e:
            logger.error(f"Failed to get Kling Avatar result: {e}")
            return {
                "success": False,
                "error": str(e),
                "request_id": request_id
            }

    async def upload_file(self, file_data: bytes, filename: str) -> str:
        """Upload file to Fal storage and return URL."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            # Convert bytes to file-like object
            import io
            file_obj = io.BytesIO(file_data)
            file_obj.name = filename

            url = await asyncio.to_thread(self.fal.storage.upload, file_obj)
            return url

        except Exception as e:
            logger.error(f"Failed to upload file to Fal: {e}")
            raise

    def _queue_update_handler(self, update):
        """Handle queue updates for long-running requests."""
        if update.get("status") == "IN_PROGRESS":
            logs = update.get("logs", [])
            for log in logs:
                if "message" in log:
                    logger.info(f"Kling Avatar Progress: {log['message']}")

    def _format_avatar_result(self, result, request_id=None, is_async=True):
        """Format Kling AI Avatar result response."""
        try:
            if result and hasattr(result, 'data') and "video" in result.data:
                video_data = result.data["video"]
                duration = result.data.get("duration", 0)

                response = {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "duration": duration,
                    "model": "kling-v1-pro-ai-avatar",
                    "has_audio": True,
                    "audio_synced": True,
                    "processing_completed": True
                }

                if request_id:
                    response["request_id"] = request_id
                if hasattr(result, 'requestId'):
                    response["request_id"] = result.requestId

                return response
            else:
                return {
                    "success": False,
                    "error": "No video generated",
                    "request_id": request_id
                }

        except Exception as e:
            logger.error(f"Failed to format avatar result: {e}")
            return {
                "success": False,
                "error": str(e),
                "request_id": request_id
            }

    # Audio-to-Video using Veed Avatars via Fal AI
    async def generate_audio2vid_preview(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Audio-to-Video preview using veed/avatars/audio-to-video."""
        try:
            audio_url = params.get("audio_url")
            avatar_id = params.get("avatar_id", "emily_vertical_primary")  # Default avatar

            if not audio_url:
                raise Exception("Audio URL is required")

            # Use fal_client for veed/avatars/audio-to-video
            arguments = {
                "avatar_id": avatar_id,
                "audio_url": audio_url
            }

            # Submit request asynchronously
            result = await asyncio.to_thread(
                fal_client.subscribe,
                self.models["audio2vid"],
                arguments=arguments,
                with_logs=True
            )

            if result and "video" in result:
                video_data = result["video"]
                return {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "avatar_id": avatar_id,
                    "model": "veed-avatars-audio2video",
                    "preview": True,
                    "processing_time": "~3-4 seconds per audio second"
                }
            else:
                raise Exception("No video generated from veed/avatars/audio-to-video")

        except Exception as e:
            logger.error(f"Audio-to-video preview failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }

    async def generate_audio2vid_final(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final Audio-to-Video using veed/avatars/audio-to-video."""
        try:
            audio_url = params.get("audio_url")
            avatar_id = params.get("avatar_id", "emily_vertical_primary")  # Default avatar

            if not audio_url:
                raise Exception("Audio URL is required")

            # Use fal_client for veed/avatars/audio-to-video
            arguments = {
                "avatar_id": avatar_id,
                "audio_url": audio_url
            }

            # Submit request asynchronously
            result = await asyncio.to_thread(
                fal_client.subscribe,
                self.models["audio2vid"],
                arguments=arguments,
                with_logs=True
            )

            if result and "video" in result:
                video_data = result["video"]
                return {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "avatar_id": avatar_id,
                    "quality": "high",
                    "model": "veed-avatars-audio2video",
                    "preview": False,
                    "processing_time": "~3-4 seconds per audio second"
                }
            else:
                raise Exception("No video generated from veed/avatars/audio-to-video")

        except Exception as e:
            logger.error(f"Audio-to-video final failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }

    # New Audio-to-Video methods using modern fal client with queue support
    async def submit_audio2vid_async(self, params: Dict[str, Any], webhook_url: str = None) -> Dict[str, Any]:
        """Submit Audio-to-Video request asynchronously using veed/avatars/audio-to-video."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            audio_url = params.get("audio_url")
            avatar_id = params.get("avatar_id", "emily_vertical_primary")
            audio_duration = params.get("audio_duration_seconds", 30)

            if not audio_url:
                raise Exception("Audio URL is required")

            # Validate audio duration (max 5 minutes = 300 seconds)
            if audio_duration > 300:
                raise Exception("Audio duration cannot exceed 5 minutes (300 seconds)")

            # Validate avatar_id
            valid_avatars = self.get_available_avatars()
            if avatar_id not in [avatar["id"] for avatar in valid_avatars]:
                raise Exception(f"Invalid avatar_id: {avatar_id}")

            input_data = {
                "avatar_id": avatar_id,
                "audio_url": audio_url
            }

            # Submit with logs and queue handling for long-running request
            result = await asyncio.to_thread(
                self.fal.subscribe,
                self.models["audio2vid"],
                {
                    "input": input_data,
                    "logs": True,
                    "onQueueUpdate": self._queue_update_handler if not webhook_url else None
                }
            )

            if hasattr(result, 'requestId'):
                # Calculate estimated processing time based on audio duration
                estimated_time = self._calculate_audio2vid_processing_time(params)

                return {
                    "success": True,
                    "request_id": result.requestId,
                    "status": "submitted",
                    "model": "veed-avatars-audio2video",
                    "avatar_id": avatar_id,
                    "estimated_processing_time": estimated_time["display"],
                    "timeout_buffer": "2 minutes",
                    "total_timeout": estimated_time["total_timeout"]
                }
            else:
                # Immediate result case
                return self._format_audio2vid_result(result, is_async=False)

        except Exception as e:
            logger.error(f"Audio-to-Video async submission failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def check_audio2vid_status(self, request_id: str) -> Dict[str, Any]:
        """Check status of Audio-to-Video request."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            status = await asyncio.to_thread(
                self.fal.queue.status,
                self.models["audio2vid"],
                {"requestId": request_id, "logs": True}
            )

            return {
                "success": True,
                "request_id": request_id,
                "status": status.get("status", "unknown"),
                "logs": status.get("logs", []),
                "queue_position": status.get("queue_position"),
                "estimated_time": status.get("estimated_time")
            }

        except Exception as e:
            logger.error(f"Failed to check Audio-to-Video status: {e}")
            return {
                "success": False,
                "error": str(e),
                "request_id": request_id
            }

    async def get_audio2vid_result(self, request_id: str) -> Dict[str, Any]:
        """Get result from completed Audio-to-Video request."""
        try:
            if not self.fal:
                raise Exception("Fal client not initialized - check API key")

            result = await asyncio.to_thread(
                self.fal.queue.result,
                self.models["audio2vid"],
                {"requestId": request_id}
            )

            return self._format_audio2vid_result(result, request_id=request_id)

        except Exception as e:
            logger.error(f"Failed to get Audio-to-Video result: {e}")
            return {
                "success": False,
                "error": str(e),
                "request_id": request_id
            }

    def _calculate_audio2vid_processing_time(self, params: Dict[str, Any]) -> Dict[str, str]:
        """Calculate processing time for audio-to-video: 200 seconds for 30 seconds of audio."""
        try:
            # Get audio duration in seconds (default 30s if not provided)
            audio_duration = params.get("audio_duration_seconds", 30)

            # Validate and clamp audio duration to 5 minutes maximum
            audio_duration = min(audio_duration, 300)

            # Processing formula: 200 seconds for 30 seconds of audio
            # This equals approximately 6.67 seconds per second of audio
            processing_seconds = int((audio_duration / 30) * 200)

            # Add 3-4 minute buffer for queue and initialization (240 seconds = 4 minutes)
            buffer_seconds = 240
            total_seconds = processing_seconds + buffer_seconds

            # Format display time
            if processing_seconds < 60:
                display_time = f"{processing_seconds} seconds"
            else:
                minutes = processing_seconds // 60
                seconds = processing_seconds % 60
                display_time = f"{minutes}m {seconds}s" if seconds > 0 else f"{minutes}m"

            # Format total timeout
            total_minutes = total_seconds // 60
            total_timeout = f"{total_minutes} minutes"

            return {
                "display": display_time,
                "total_timeout": total_timeout,
                "processing_seconds": processing_seconds,
                "total_seconds": total_seconds
            }

        except Exception as e:
            logger.error(f"Failed to calculate processing time: {e}")
            return {
                "display": "5-7 minutes",
                "total_timeout": "12 minutes",
                "processing_seconds": 360,
                "total_seconds": 720
            }

    def _format_audio2vid_result(self, result, request_id=None, is_async=True):
        """Format Audio-to-Video result response."""
        try:
            if result and hasattr(result, 'data') and "video" in result.data:
                video_data = result.data["video"]

                response = {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "content_type": video_data.get("content_type", "video/mp4"),
                    "model": "veed-avatars-audio2video",
                    "processing_completed": True
                }

                if request_id:
                    response["request_id"] = request_id
                if hasattr(result, 'requestId'):
                    response["request_id"] = result.requestId

                return response
            else:
                return {
                    "success": False,
                    "error": "No video generated",
                    "request_id": request_id
                }

        except Exception as e:
            logger.error(f"Failed to format audio2vid result: {e}")
            return {
                "success": False,
                "error": str(e),
                "request_id": request_id
            }

    async def _make_request(self, model: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Make authenticated request to Fal AI API."""
        if not self.api_key:
            raise Exception("Fal AI API key not configured")

        headers = {
            "Authorization": f"Key {self.api_key}",
            "Content-Type": "application/json"
        }

        url = f"{self.base_url}/{model}"

        try:
            async with httpx.AsyncClient(timeout=300.0) as client:  # 5 minute timeout for video
                response = await client.post(url, json=payload, headers=headers)

                if response.status_code == 200:
                    return response.json()
                else:
                    error_text = response.text
                    logger.error(f"Fal AI API error {response.status_code}: {error_text}")
                    raise Exception(f"Fal AI API error: {response.status_code} - {error_text}")

        except httpx.TimeoutException:
            logger.error("Fal AI API request timed out")
            raise Exception("Request timed out")
        except Exception as e:
            logger.error(f"Fal AI API request failed: {e}")
            raise

    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available Fal AI models."""
        return [
            {
                "id": "fal-ai/elevenlabs-text-to-speech",
                "name": "ElevenLabs TTS",
                "description": "High-quality text-to-speech synthesis",
                "type": "audio",
                "max_characters": 5000,
                "supported_voices": ["rachel", "drew", "clyde", "paul"]
            },
            {
                "id": "fal-ai/kling-video-v1/pro/image-to-video",
                "name": "Kling Video V2 Pro",
                "description": "Image-to-video generation without audio",
                "type": "video",
                "max_duration": 10,
                "supports_audio": False
            },
            {
                "id": "fal-ai/kling-video-v1/image-to-video",
                "name": "Kling Video V1 Pro",
                "description": "Image-to-video generation with audio sync",
                "type": "video",
                "max_duration": 10,
                "supports_audio": True
            },
            {
                "id": "veed/avatars/audio-to-video",
                "name": "Veed Avatars Audio-to-Video",
                "description": "AI avatars that speak your audio content",
                "type": "avatar_video",
                "processing_time": "100 seconds for 30 seconds of audio",
                "avatars_available": 26
            }
        ]

    async def test_connection(self) -> Dict[str, Any]:
        """Test Fal AI API connection."""
        try:
            # Test with a simple TTS request
            payload = {
                "text": "Hello, this is a test.",
                "voice": "rachel",
                "model_id": "eleven_monolingual_v1"
            }

            result = await self._make_request(self.models["tts"], payload)

            return {
                "success": True,
                "message": "Fal AI connection successful",
                "models_available": len(self.get_available_models())
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Fal AI connection failed"
            }

    def get_available_avatars(self) -> List[Dict[str, Any]]:
        """Get available avatars for veed/avatars/audio-to-video."""
        return [
            # Vertical Primary Avatars
            {
                "id": "emily_vertical_primary",
                "name": "Emily (Vertical Primary)",
                "description": "Professional female avatar in vertical format",
                "orientation": "vertical",
                "style": "primary",
                "gender": "female"
            },
            {
                "id": "emily_vertical_secondary",
                "name": "Emily (Vertical Secondary)",
                "description": "Alternative Emily style in vertical format",
                "orientation": "vertical",
                "style": "secondary",
                "gender": "female"
            },
            {
                "id": "marcus_vertical_primary",
                "name": "Marcus (Vertical Primary)",
                "description": "Professional male avatar in vertical format",
                "orientation": "vertical",
                "style": "primary",
                "gender": "male"
            },
            {
                "id": "marcus_vertical_secondary",
                "name": "Marcus (Vertical Secondary)",
                "description": "Alternative Marcus style in vertical format",
                "orientation": "vertical",
                "style": "secondary",
                "gender": "male"
            },
            {
                "id": "mira_vertical_primary",
                "name": "Mira (Vertical Primary)",
                "description": "Elegant female avatar in vertical format",
                "orientation": "vertical",
                "style": "primary",
                "gender": "female"
            },
            {
                "id": "mira_vertical_secondary",
                "name": "Mira (Vertical Secondary)",
                "description": "Alternative Mira style in vertical format",
                "orientation": "vertical",
                "style": "secondary",
                "gender": "female"
            },
            {
                "id": "jasmine_vertical_primary",
                "name": "Jasmine (Vertical Primary)",
                "description": "Modern female avatar in vertical format",
                "orientation": "vertical",
                "style": "primary",
                "gender": "female"
            },
            {
                "id": "jasmine_vertical_secondary",
                "name": "Jasmine (Vertical Secondary)",
                "description": "Alternative Jasmine style in vertical format",
                "orientation": "vertical",
                "style": "secondary",
                "gender": "female"
            },
            {
                "id": "jasmine_vertical_walking",
                "name": "Jasmine (Vertical Walking)",
                "description": "Dynamic walking Jasmine in vertical format",
                "orientation": "vertical",
                "style": "walking",
                "gender": "female"
            },
            {
                "id": "aisha_vertical_walking",
                "name": "Aisha (Vertical Walking)",
                "description": "Dynamic walking Aisha in vertical format",
                "orientation": "vertical",
                "style": "walking",
                "gender": "female"
            },
            {
                "id": "elena_vertical_primary",
                "name": "Elena (Vertical Primary)",
                "description": "Sophisticated female avatar in vertical format",
                "orientation": "vertical",
                "style": "primary",
                "gender": "female"
            },
            {
                "id": "elena_vertical_secondary",
                "name": "Elena (Vertical Secondary)",
                "description": "Alternative Elena style in vertical format",
                "orientation": "vertical",
                "style": "secondary",
                "gender": "female"
            },
            # Generic Avatars
            {
                "id": "any_male_vertical_primary",
                "name": "Generic Male (Vertical Primary)",
                "description": "Generic male avatar in vertical format",
                "orientation": "vertical",
                "style": "primary",
                "gender": "male"
            },
            {
                "id": "any_female_vertical_primary",
                "name": "Generic Female (Vertical Primary)",
                "description": "Generic female avatar in vertical format",
                "orientation": "vertical",
                "style": "primary",
                "gender": "female"
            },
            {
                "id": "any_male_vertical_secondary",
                "name": "Generic Male (Vertical Secondary)",
                "description": "Alternative generic male in vertical format",
                "orientation": "vertical",
                "style": "secondary",
                "gender": "male"
            },
            {
                "id": "any_female_vertical_secondary",
                "name": "Generic Female (Vertical Secondary)",
                "description": "Alternative generic female in vertical format",
                "orientation": "vertical",
                "style": "secondary",
                "gender": "female"
            },
            {
                "id": "any_female_vertical_walking",
                "name": "Generic Female (Vertical Walking)",
                "description": "Dynamic walking generic female in vertical format",
                "orientation": "vertical",
                "style": "walking",
                "gender": "female"
            },
            # Horizontal Avatars
            {
                "id": "emily_primary",
                "name": "Emily (Horizontal Primary)",
                "description": "Professional Emily in horizontal format",
                "orientation": "horizontal",
                "style": "primary",
                "gender": "female"
            },
            {
                "id": "emily_side",
                "name": "Emily (Horizontal Side)",
                "description": "Side-view Emily in horizontal format",
                "orientation": "horizontal",
                "style": "side",
                "gender": "female"
            },
            {
                "id": "marcus_primary",
                "name": "Marcus (Horizontal Primary)",
                "description": "Professional Marcus in horizontal format",
                "orientation": "horizontal",
                "style": "primary",
                "gender": "male"
            },
            {
                "id": "marcus_side",
                "name": "Marcus (Horizontal Side)",
                "description": "Side-view Marcus in horizontal format",
                "orientation": "horizontal",
                "style": "side",
                "gender": "male"
            },
            {
                "id": "aisha_walking",
                "name": "Aisha (Horizontal Walking)",
                "description": "Dynamic walking Aisha in horizontal format",
                "orientation": "horizontal",
                "style": "walking",
                "gender": "female"
            },
            {
                "id": "elena_primary",
                "name": "Elena (Horizontal Primary)",
                "description": "Professional Elena in horizontal format",
                "orientation": "horizontal",
                "style": "primary",
                "gender": "female"
            },
            {
                "id": "elena_side",
                "name": "Elena (Horizontal Side)",
                "description": "Side-view Elena in horizontal format",
                "orientation": "horizontal",
                "style": "side",
                "gender": "female"
            },
            {
                "id": "any_male_primary",
                "name": "Generic Male (Horizontal Primary)",
                "description": "Generic male in horizontal format",
                "orientation": "horizontal",
                "style": "primary",
                "gender": "male"
            },
            {
                "id": "any_female_primary",
                "name": "Generic Female (Horizontal Primary)",
                "description": "Generic female in horizontal format",
                "orientation": "horizontal",
                "style": "primary",
                "gender": "female"
            },
            {
                "id": "any_male_side",
                "name": "Generic Male (Horizontal Side)",
                "description": "Side-view generic male in horizontal format",
                "orientation": "horizontal",
                "style": "side",
                "gender": "male"
            },
            {
                "id": "any_female_side",
                "name": "Generic Female (Horizontal Side)",
                "description": "Side-view generic female in horizontal format",
                "orientation": "horizontal",
                "style": "side",
                "gender": "female"
            }
        ]

    # Image Generation Methods
    async def generate_image_preview(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate image preview using FLUX Schnell."""
        try:
            text_prompt = params.get("prompt", "A beautiful landscape")
            style = params.get("style", "photorealistic")
            aspect_ratio = params.get("aspect_ratio", "1:1")
            quality = params.get("quality", "high")

            # Enhance prompt for better results
            enhanced_prompt = f"{style} style: {text_prompt}"

            # Convert aspect ratio to image size
            image_size = self._get_image_size(aspect_ratio)

            # Use fal_client for FLUX Schnell image generation
            arguments = {
                "prompt": enhanced_prompt,
                "image_size": image_size,
                "num_inference_steps": 4,  # FLUX Schnell is optimized for 4 steps
                "seed": None,  # Random seed
                "enable_safety_checker": True
            }

            # Submit request asynchronously for preview (fast)
            result = await asyncio.to_thread(
                fal_client.subscribe,
                self.models["image_generation"],
                arguments=arguments,
                with_logs=True
            )

            if result and "images" in result and len(result["images"]) > 0:
                image_data = result["images"][0]
                return {
                    "success": True,
                    "image_url": image_data.get("url"),
                    "text_prompt": text_prompt,
                    "enhanced_prompt": enhanced_prompt,
                    "style": style,
                    "aspect_ratio": aspect_ratio,
                    "quality": quality,
                    "model": "flux-schnell",
                    "preview": True,
                    "processing_time": "~2m"
                }
            else:
                raise Exception("No image generated from FLUX Schnell")

        except Exception as e:
            logger.error(f"Image preview generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "text_prompt": params.get("prompt", "A beautiful landscape")
            }

    async def generate_image_final(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final high-quality image using FLUX Schnell."""
        try:
            text_prompt = params.get("prompt", "A beautiful landscape")
            image_input = params.get("image_input")  # Optional reference image
            style = params.get("style", "photorealistic")
            aspect_ratio = params.get("aspect_ratio", "1:1")
            quality = params.get("quality", "high")

            # Enhance prompt for marketing focus
            enhanced_prompt = f"Professional {style} marketing image: {text_prompt}, high quality, detailed, commercial use"

            # Convert aspect ratio to image size
            image_size = self._get_image_size(aspect_ratio)

            # Use fal_client for FLUX Schnell image generation
            arguments = {
                "prompt": enhanced_prompt,
                "image_size": image_size,
                "num_inference_steps": 4,  # FLUX Schnell optimized steps
                "seed": None,  # Random seed for variety
                "enable_safety_checker": True
            }

            # Submit request asynchronously for final (higher quality)
            result = await asyncio.to_thread(
                fal_client.subscribe,
                self.models["image_generation"],
                arguments=arguments,
                with_logs=True
            )

            if result and "images" in result and len(result["images"]) > 0:
                image_data = result["images"][0]
                return {
                    "success": True,
                    "image_url": image_data.get("url"),
                    "text_prompt": text_prompt,
                    "enhanced_prompt": enhanced_prompt,
                    "has_image_input": bool(image_input),
                    "style": style,
                    "aspect_ratio": aspect_ratio,
                    "quality": quality,
                    "model": "flux-schnell",
                    "processing_time": "~2m",
                    "preview": False
                }
            else:
                raise Exception("No image generated from FLUX Schnell")

        except Exception as e:
            logger.error(f"Image final generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "text_prompt": params.get("prompt", "A beautiful landscape")
            }

    def _get_image_size(self, aspect_ratio: str) -> str:
        """Convert aspect ratio to FLUX Schnell compatible image size."""
        size_map = {
            "1:1": "square_hd",       # 1024x1024
            "16:9": "landscape_16_9", # 1344x768
            "9:16": "portrait_9_16",  # 768x1344
            "4:3": "landscape_4_3",   # 1152x896
            "3:4": "portrait_3_4",    # 896x1152
            "21:9": "landscape_21_9", # 1536x640
            "9:21": "portrait_9_21"   # 640x1536
        }
        return size_map.get(aspect_ratio, "square_hd")