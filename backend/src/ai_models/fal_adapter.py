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

        # Fal AI model endpoints
        self.models = {
            "tts": "fal-ai/elevenlabs-text-to-speech",
            "img2vid_noaudio": "fal-ai/kling-video/v2.1/pro/image-to-video",  # Kling v2.1 Pro (no audio)
            "img2vid_audio": "fal-ai/kling-video/v1/pro/ai-avatar",  # Kling v1 Pro AI Avatar (with audio)
            "audio2vid": "fal-ai/veed/audio-to-video"  # Custom UGC endpoint
        }

        # Configure fal_client with API key
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

    # Text-to-Speech Methods
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