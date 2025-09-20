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
from fal_client import Client

logger = logging.getLogger(__name__)

class FalAdapter:
    """Fal AI integration for TTS, Video, and UGC generation."""

    def __init__(self):
        self.api_key = os.getenv("FAL_API_KEY")
        self.base_url = "https://fal.run"

        # Initialize new fal client
        self.fal = Client(key=self.api_key) if self.api_key else None

        # Fal AI model endpoints
        self.models = {
            "tts": "fal-ai/elevenlabs-text-to-speech",
            "tts_turbo": "fal-ai/elevenlabs/tts/turbo-v2.5",  # ElevenLabs TTS Turbo v2.5
            "img2vid_noaudio": "fal-ai/kling-video/v2.1/pro/image-to-video",  # Kling v2.1 Pro (no audio)
            "img2vid_audio": "fal-ai/kling-video/v1/pro/ai-avatar",  # Kling v1 Pro AI Avatar (with audio)
            "audio2vid": "fal-ai/veed/audio-to-video"  # Custom UGC endpoint
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

            # Submit with logs and queue handling for long-running request
            result = await asyncio.to_thread(
                self.fal.subscribe,
                self.models["tts_turbo"],
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
                self.fal.queue.status,
                self.models["tts_turbo"],
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
                self.fal.queue.result,
                self.models["tts_turbo"],
                {"requestId": request_id}
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

    # Audio-to-Video (UGC) Methods
    async def generate_audio2vid_preview(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Audio-to-Video UGC preview."""
        try:
            audio_url = params.get("audio_url")
            template = params.get("template", "podcast_visualizer")
            duration_seconds = min(params.get("duration_seconds", 30), 30)  # Max 30s for preview

            if not audio_url:
                raise Exception("Audio URL is required")

            payload = {
                "audio_url": audio_url,
                "template": template,
                "duration": duration_seconds,
                "aspect_ratio": params.get("aspect_ratio", "16:9"),
                "style": params.get("style", "modern"),
                "quality": "medium",  # Lower quality for preview
                "watermark": True     # Watermark for preview
            }

            # Template-specific settings
            if template == "podcast_visualizer":
                payload["show_waveform"] = True
                payload["background_color"] = params.get("background_color", "#1a1a1a")
                payload["waveform_color"] = params.get("waveform_color", "#00ff88")
            elif template == "music_video":
                payload["beat_sync"] = True
                payload["visual_effects"] = "subtle"
            elif template == "social_story":
                payload["aspect_ratio"] = "9:16"  # Force vertical for stories
                payload["add_captions"] = True

            result = await self._make_request(self.models["audio2vid"], payload)

            if result and "video" in result:
                video_data = result["video"]
                return {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "thumbnail_url": video_data.get("thumbnail_url"),
                    "duration": duration_seconds,
                    "template": template,
                    "aspect_ratio": payload["aspect_ratio"],
                    "model": "veed-ugc",
                    "has_watermark": True,
                    "preview": True
                }
            else:
                raise Exception("No video generated")

        except Exception as e:
            logger.error(f"Audio-to-video UGC preview failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
            }

    async def generate_audio2vid_final(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final Audio-to-Video UGC."""
        try:
            audio_url = params.get("audio_url")
            template = params.get("template", "podcast_visualizer")
            duration_seconds = params.get("duration_seconds", 300)  # Up to 5 minutes for final

            if not audio_url:
                raise Exception("Audio URL is required")

            payload = {
                "audio_url": audio_url,
                "template": template,
                "duration": duration_seconds,
                "aspect_ratio": params.get("aspect_ratio", "16:9"),
                "style": params.get("style", "modern"),
                "quality": "high",   # High quality for final
                "watermark": False,  # No watermark for final
                "export_format": "mp4"
            }

            # Template-specific settings
            if template == "podcast_visualizer":
                payload["show_waveform"] = True
                payload["background_color"] = params.get("background_color", "#1a1a1a")
                payload["waveform_color"] = params.get("waveform_color", "#00ff88")
                payload["show_progress"] = True
                payload["brand_logo"] = params.get("brand_logo")
            elif template == "music_video":
                payload["beat_sync"] = True
                payload["visual_effects"] = "dynamic"
                payload["color_scheme"] = params.get("color_scheme", "vibrant")
            elif template == "social_story":
                payload["aspect_ratio"] = "9:16"
                payload["add_captions"] = True
                payload["caption_style"] = params.get("caption_style", "modern")

            result = await self._make_request(self.models["audio2vid"], payload)

            if result and "video" in result:
                video_data = result["video"]
                return {
                    "success": True,
                    "video_url": video_data.get("url"),
                    "thumbnail_url": video_data.get("thumbnail_url"),
                    "duration": duration_seconds,
                    "template": template,
                    "aspect_ratio": payload["aspect_ratio"],
                    "quality": "high",
                    "file_size": video_data.get("file_size", 0),
                    "model": "veed-ugc",
                    "has_watermark": False,
                    "preview": False
                }
            else:
                raise Exception("No video generated")

        except Exception as e:
            logger.error(f"Audio-to-video UGC final failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "video_url": None
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
                "id": "fal-ai/veed/audio-to-video",
                "name": "VEED UGC Generator",
                "description": "Audio-to-video UGC content creation",
                "type": "ugc",
                "max_duration": 300,
                "templates": ["podcast_visualizer", "music_video", "social_story"]
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

    def get_ugc_templates(self) -> List[Dict[str, Any]]:
        """Get available UGC templates for audio-to-video."""
        return [
            {
                "id": "podcast_visualizer",
                "name": "Podcast Visualizer",
                "description": "Professional waveform with branding",
                "aspect_ratios": ["16:9", "1:1"],
                "customizable": ["background_color", "waveform_color", "brand_logo"]
            },
            {
                "id": "music_video",
                "name": "Music Video",
                "description": "Animated graphics synced to beat",
                "aspect_ratios": ["16:9", "9:16"],
                "customizable": ["color_scheme", "visual_effects"]
            },
            {
                "id": "social_story",
                "name": "Social Media Story",
                "description": "Vertical format with captions",
                "aspect_ratios": ["9:16"],
                "customizable": ["caption_style", "background_theme"]
            },
            {
                "id": "audiobook_cover",
                "name": "Audiobook Cover",
                "description": "Static design with progress indicator",
                "aspect_ratios": ["16:9", "1:1"],
                "customizable": ["cover_image", "progress_style"]
            },
            {
                "id": "corporate_training",
                "name": "Corporate Training",
                "description": "Clean layout with transcription",
                "aspect_ratios": ["16:9"],
                "customizable": ["brand_colors", "transcription_style"]
            }
        ]