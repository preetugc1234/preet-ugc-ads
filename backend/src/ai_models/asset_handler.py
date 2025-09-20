"""
Asset handler for managing previews and final assets
Handles Cloudinary uploads, file conversions, and asset optimization
"""

import os
import asyncio
import logging
from typing import Dict, Any, List, Optional, Tuple, Union
import httpx
import hashlib
import mimetypes
from datetime import datetime
import tempfile
import aiofiles
from pathlib import Path

logger = logging.getLogger(__name__)

class AssetHandler:
    """Handles asset upload, optimization, and management."""

    def __init__(self):
        self.cloudinary_cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
        self.cloudinary_api_key = os.getenv("CLOUDINARY_API_KEY")
        self.cloudinary_api_secret = os.getenv("CLOUDINARY_API_SECRET")
        self.cloudinary_upload_preset = os.getenv("CLOUDINARY_UPLOAD_PRESET", "ugc_ai_preset")

        if not all([self.cloudinary_cloud_name, self.cloudinary_api_key, self.cloudinary_api_secret]):
            logger.warning("Cloudinary credentials not fully configured")

    async def handle_chat_result(self, result: Dict[str, Any], job_id: str, user_id: str, is_preview: bool) -> Dict[str, Any]:
        """Handle chat generation result (text only)."""
        try:
            if not result.get("success"):
                raise Exception(result.get("error", "Chat generation failed"))

            content = result.get("content", "")

            # For chat, we don't upload to Cloudinary, just return the text
            asset_data = {
                "type": "text",
                "content": content,
                "model": result.get("model", "gpt-4o-mini"),
                "tokens_used": result.get("tokens_used", 0),
                "is_preview": is_preview,
                "created_at": datetime.utcnow().isoformat(),
                "file_urls": []  # No files for text
            }

            return {
                "success": True,
                "asset_data": asset_data,
                "urls": [],  # No URLs for text content
                "metadata": {
                    "type": "chat",
                    "content_length": len(content),
                    "model": result.get("model"),
                    "tokens_used": result.get("tokens_used", 0)
                }
            }

        except Exception as e:
            logger.error(f"Error handling chat result: {e}")
            return {"success": False, "error": str(e)}

    async def handle_image_result(self, result: Dict[str, Any], job_id: str, user_id: str, is_preview: bool) -> Dict[str, Any]:
        """Handle image generation result (enhanced prompts)."""
        try:
            if not result.get("success"):
                raise Exception(result.get("error", "Image generation failed"))

            enhanced_prompt = result.get("enhanced_prompt", "")
            original_prompt = result.get("original_prompt", "")

            # Create a structured text file with the prompts
            prompt_data = {
                "original_prompt": original_prompt,
                "enhanced_prompt": enhanced_prompt,
                "style": result.get("style", ""),
                "aspect_ratio": result.get("aspect_ratio", ""),
                "model": result.get("model", "gemini-2.5-flash"),
                "tokens_used": result.get("tokens_used", 0),
                "generated_at": datetime.utcnow().isoformat()
            }

            # Upload prompt data as JSON to Cloudinary
            file_path = f"user_{user_id}/job_{job_id}/{'preview' if is_preview else 'final'}_prompt.json"

            # Convert to bytes for upload
            import json
            json_content = json.dumps(prompt_data, indent=2).encode('utf-8')

            upload_result = await self._upload_to_cloudinary(
                json_content,
                file_path,
                resource_type="raw",
                format="json"
            )

            asset_data = {
                "type": "image_prompt",
                "original_prompt": original_prompt,
                "enhanced_prompt": enhanced_prompt,
                "style": result.get("style"),
                "aspect_ratio": result.get("aspect_ratio"),
                "model": result.get("model"),
                "tokens_used": result.get("tokens_used", 0),
                "is_preview": is_preview,
                "created_at": datetime.utcnow().isoformat(),
                "file_urls": [upload_result["secure_url"]] if upload_result else []
            }

            return {
                "success": True,
                "asset_data": asset_data,
                "urls": [upload_result["secure_url"]] if upload_result else [],
                "metadata": {
                    "type": "image_prompt",
                    "prompt_length": len(enhanced_prompt),
                    "model": result.get("model"),
                    "tokens_used": result.get("tokens_used", 0)
                }
            }

        except Exception as e:
            logger.error(f"Error handling image result: {e}")
            return {"success": False, "error": str(e)}

    async def handle_tts_result(self, result: Dict[str, Any], job_id: str, user_id: str, is_preview: bool) -> Dict[str, Any]:
        """Handle TTS generation result (audio file)."""
        try:
            if not result.get("success"):
                raise Exception(result.get("error", "TTS generation failed"))

            audio_url = result.get("audio_url")
            if not audio_url:
                raise Exception("No audio URL in TTS result")

            # Download and re-upload to our Cloudinary
            audio_data = await self._download_file(audio_url)
            if not audio_data:
                raise Exception("Failed to download audio file")

            # Upload to Cloudinary
            file_path = f"user_{user_id}/job_{job_id}/{'preview' if is_preview else 'final'}_audio"
            upload_result = await self._upload_to_cloudinary(
                audio_data,
                file_path,
                resource_type="video",  # Cloudinary treats audio as video resource
                format="mp3"
            )

            asset_data = {
                "type": "audio",
                "text": result.get("text", ""),
                "voice": result.get("voice", ""),
                "model": result.get("model", "elevenlabs"),
                "duration": result.get("duration", 0),
                "file_size": len(audio_data) if audio_data else 0,
                "is_preview": is_preview,
                "created_at": datetime.utcnow().isoformat(),
                "file_urls": [upload_result["secure_url"]] if upload_result else []
            }

            return {
                "success": True,
                "asset_data": asset_data,
                "urls": [upload_result["secure_url"]] if upload_result else [],
                "metadata": {
                    "type": "audio",
                    "duration": result.get("duration", 0),
                    "voice": result.get("voice"),
                    "file_size": len(audio_data) if audio_data else 0
                }
            }

        except Exception as e:
            logger.error(f"Error handling TTS result: {e}")
            return {"success": False, "error": str(e)}

    async def handle_video_result(self, result: Dict[str, Any], job_id: str, user_id: str, is_preview: bool) -> Dict[str, Any]:
        """Handle video generation result (video file with optional thumbnail)."""
        try:
            if not result.get("success"):
                raise Exception(result.get("error", "Video generation failed"))

            video_url = result.get("video_url")
            thumbnail_url = result.get("thumbnail_url")

            if not video_url:
                raise Exception("No video URL in result")

            uploaded_urls = []

            # Download and upload video
            video_data = await self._download_file(video_url)
            if video_data:
                video_path = f"user_{user_id}/job_{job_id}/{'preview' if is_preview else 'final'}_video"
                video_upload = await self._upload_to_cloudinary(
                    video_data,
                    video_path,
                    resource_type="video",
                    format="mp4"
                )
                if video_upload:
                    uploaded_urls.append(video_upload["secure_url"])

            # Download and upload thumbnail if available
            if thumbnail_url:
                thumbnail_data = await self._download_file(thumbnail_url)
                if thumbnail_data:
                    thumb_path = f"user_{user_id}/job_{job_id}/{'preview' if is_preview else 'final'}_thumbnail"
                    thumb_upload = await self._upload_to_cloudinary(
                        thumbnail_data,
                        thumb_path,
                        resource_type="image",
                        format="jpg"
                    )
                    if thumb_upload:
                        uploaded_urls.append(thumb_upload["secure_url"])

            asset_data = {
                "type": "video",
                "duration": result.get("duration", 0),
                "aspect_ratio": result.get("aspect_ratio", "16:9"),
                "quality": result.get("quality", "medium"),
                "fps": result.get("fps", 24),
                "has_audio": result.get("has_audio", False),
                "model": result.get("model", "kling"),
                "file_size": result.get("file_size", 0),
                "is_preview": is_preview,
                "created_at": datetime.utcnow().isoformat(),
                "file_urls": uploaded_urls
            }

            return {
                "success": True,
                "asset_data": asset_data,
                "urls": uploaded_urls,
                "metadata": {
                    "type": "video",
                    "duration": result.get("duration", 0),
                    "has_audio": result.get("has_audio", False),
                    "file_size": result.get("file_size", 0)
                }
            }

        except Exception as e:
            logger.error(f"Error handling video result: {e}")
            return {"success": False, "error": str(e)}

    async def _download_file(self, url: str) -> Optional[bytes]:
        """Download file from URL."""
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    return response.content
                else:
                    logger.error(f"Failed to download file: {response.status_code}")
                    return None
        except Exception as e:
            logger.error(f"Error downloading file from {url}: {e}")
            return None

    async def _upload_to_cloudinary(
        self,
        file_data: bytes,
        public_id: str,
        resource_type: str = "auto",
        format: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Upload file to Cloudinary."""
        try:
            if not all([self.cloudinary_cloud_name, self.cloudinary_api_key, self.cloudinary_api_secret]):
                logger.warning("Cloudinary not configured, skipping upload")
                return None

            # Create upload URL
            upload_url = f"https://api.cloudinary.com/v1_1/{self.cloudinary_cloud_name}/{resource_type}/upload"

            # Prepare form data
            form_data = {
                "file": file_data,
                "public_id": public_id,
                "upload_preset": self.cloudinary_upload_preset,
                "resource_type": resource_type
            }

            if format:
                form_data["format"] = format

            # Add timestamp and signature for authenticated upload
            import time
            timestamp = int(time.time())
            form_data["timestamp"] = str(timestamp)

            # Create signature
            signature_string = f"public_id={public_id}&timestamp={timestamp}&upload_preset={self.cloudinary_upload_preset}{self.cloudinary_api_secret}"
            signature = hashlib.sha1(signature_string.encode()).hexdigest()
            form_data["signature"] = signature
            form_data["api_key"] = self.cloudinary_api_key

            # Upload file
            async with httpx.AsyncClient(timeout=120.0) as client:
                # Prepare multipart form data
                files = {"file": ("file", file_data, mimetypes.guess_type(f"file.{format}")[0] if format else "application/octet-stream")}
                data = {k: v for k, v in form_data.items() if k != "file"}

                response = await client.post(upload_url, data=data, files=files)

                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"Successfully uploaded to Cloudinary: {result.get('secure_url')}")
                    return result
                else:
                    logger.error(f"Cloudinary upload failed: {response.status_code} - {response.text}")
                    return None

        except Exception as e:
            logger.error(f"Error uploading to Cloudinary: {e}")
            return None

    def generate_file_path(self, user_id: str, job_id: str, file_type: str, is_preview: bool, extension: str = "") -> str:
        """Generate standardized file path for assets."""
        stage = "preview" if is_preview else "final"
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

        if extension and not extension.startswith('.'):
            extension = f".{extension}"

        return f"user_{user_id}/job_{job_id}/{stage}_{file_type}_{timestamp}{extension}"

    async def cleanup_temp_files(self, file_paths: List[str]) -> None:
        """Clean up temporary files."""
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.debug(f"Cleaned up temp file: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to cleanup temp file {file_path}: {e}")

    async def optimize_for_preview(self, file_data: bytes, file_type: str) -> bytes:
        """Optimize file for preview (smaller size, lower quality)."""
        # For now, return as-is. In production, you might want to:
        # - Compress images/videos
        # - Reduce audio bitrate
        # - Limit file size
        return file_data

    async def get_file_metadata(self, file_data: bytes, file_type: str) -> Dict[str, Any]:
        """Extract metadata from file."""
        metadata = {
            "size_bytes": len(file_data),
            "type": file_type,
            "created_at": datetime.utcnow().isoformat()
        }

        # Add type-specific metadata
        if file_type == "video":
            # In production, you might use ffprobe to get video metadata
            metadata.update({
                "estimated_duration": 0,  # Would extract from video
                "estimated_fps": 24,
                "estimated_resolution": "unknown"
            })
        elif file_type == "audio":
            # In production, you might use audio analysis libraries
            metadata.update({
                "estimated_duration": 0,  # Would extract from audio
                "estimated_bitrate": "unknown",
                "estimated_format": "mp3"
            })

        return metadata

    def get_cloudinary_config(self) -> Dict[str, Any]:
        """Get Cloudinary configuration status."""
        return {
            "configured": bool(all([
                self.cloudinary_cloud_name,
                self.cloudinary_api_key,
                self.cloudinary_api_secret
            ])),
            "cloud_name": self.cloudinary_cloud_name,
            "upload_preset": self.cloudinary_upload_preset
        }