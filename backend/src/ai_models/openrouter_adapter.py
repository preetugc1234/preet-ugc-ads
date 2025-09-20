"""
OpenRouter API adapter for GPT-4o mini and Gemini 2.5 Flash
Handles both chat and image generation workflows
"""

import os
import asyncio
import logging
from typing import Dict, Any, List, Optional, Tuple
import httpx
import base64
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class OpenRouterAdapter:
    """OpenRouter API integration for chat and image generation."""

    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.app_name = "UGC AI Platform"
        self.app_url = "https://preet-ugc-ads.lovable.app"

        if not self.api_key:
            logger.warning("OpenRouter API key not configured")

    async def generate_chat_preview(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate chat preview using GPT-4o mini."""
        try:
            prompt = params.get("prompt", "Hello! How can I help you today?")

            # Use faster, shorter response for preview
            payload = {
                "model": "openai/gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful AI assistant. Provide concise, helpful responses."
                    },
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 150,  # Shorter for preview
                "temperature": 0.7,
                "top_p": 0.9
            }

            result = await self._make_request("/chat/completions", payload)

            if result and "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]

                return {
                    "success": True,
                    "content": content,
                    "type": "text",
                    "model": "gpt-4o-mini",
                    "tokens_used": result.get("usage", {}).get("total_tokens", 0),
                    "preview": True
                }
            else:
                raise Exception("No response from OpenRouter")

        except Exception as e:
            logger.error(f"Chat preview generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "content": f"Error generating response: {str(e)}"
            }

    async def generate_chat_final(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final chat response using GPT-4o mini."""
        try:
            prompt = params.get("prompt", "Hello! How can I help you today?")
            conversation_history = params.get("conversation_history", [])

            # Build conversation context
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant. Provide detailed, informative responses while being concise and clear."
                }
            ]

            # Add conversation history if provided
            for msg in conversation_history[-10:]:  # Last 10 messages for context
                messages.append(msg)

            # Add current prompt
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": "openai/gpt-4o-mini",
                "messages": messages,
                "max_tokens": 1000,  # Longer for final response
                "temperature": 0.7,
                "top_p": 0.9,
                "frequency_penalty": 0.1,
                "presence_penalty": 0.1
            }

            result = await self._make_request("/chat/completions", payload)

            if result and "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]

                return {
                    "success": True,
                    "content": content,
                    "type": "text",
                    "model": "gpt-4o-mini",
                    "tokens_used": result.get("usage", {}).get("total_tokens", 0),
                    "finish_reason": result["choices"][0].get("finish_reason"),
                    "preview": False
                }
            else:
                raise Exception("No response from OpenRouter")

        except Exception as e:
            logger.error(f"Chat final generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "content": f"Error generating response: {str(e)}"
            }

    async def generate_image_preview(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate image preview using Gemini 2.5 Flash."""
        try:
            prompt = params.get("prompt", "A beautiful landscape")

            # For Gemini 2.5 Flash, we'll use the chat completion to generate image descriptions
            # Since OpenRouter's Gemini doesn't directly support image generation,
            # we'll create a detailed description that can be used for actual image generation

            image_prompt = f"""Create a detailed visual description for image generation based on this prompt: "{prompt}"

            Provide a detailed description that includes:
            - Main subject and composition
            - Style and artistic approach
            - Colors and lighting
            - Mood and atmosphere
            - Technical details for best results

            Keep it concise but descriptive for AI image generation."""

            payload = {
                "model": "google/gemini-2.0-flash-exp",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert at creating detailed prompts for AI image generation. Always respond with clear, descriptive visual prompts."
                    },
                    {"role": "user", "content": image_prompt}
                ],
                "max_tokens": 300,
                "temperature": 0.8
            }

            result = await self._make_request("/chat/completions", payload)

            if result and "choices" in result and len(result["choices"]) > 0:
                enhanced_prompt = result["choices"][0]["message"]["content"]

                return {
                    "success": True,
                    "enhanced_prompt": enhanced_prompt,
                    "original_prompt": prompt,
                    "type": "image_description",
                    "model": "gemini-2.5-flash",
                    "tokens_used": result.get("usage", {}).get("total_tokens", 0),
                    "preview": True
                }
            else:
                raise Exception("No response from OpenRouter")

        except Exception as e:
            logger.error(f"Image preview generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "enhanced_prompt": params.get("prompt", "A beautiful landscape")
            }

    async def generate_image_final(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final enhanced image prompt using Gemini 2.5 Flash."""
        try:
            prompt = params.get("prompt", "A beautiful landscape")
            style = params.get("style", "photorealistic")
            aspect_ratio = params.get("aspect_ratio", "16:9")
            quality = params.get("quality", "high")

            # Create comprehensive image generation prompt
            detailed_prompt = f"""Enhance this image prompt for professional AI image generation: "{prompt}"

            Style: {style}
            Aspect Ratio: {aspect_ratio}
            Quality: {quality}

            Create an enhanced prompt that includes:
            1. Detailed visual description
            2. Specific artistic style and technique
            3. Lighting and color palette
            4. Composition and framing
            5. Technical quality indicators
            6. Mood and atmosphere

            Format the response as a single, comprehensive prompt ready for image generation AI."""

            payload = {
                "model": "google/gemini-2.0-flash-exp",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a master prompt engineer specializing in AI image generation. Create detailed, technical prompts that produce stunning results."
                    },
                    {"role": "user", "content": detailed_prompt}
                ],
                "max_tokens": 500,
                "temperature": 0.7
            }

            result = await self._make_request("/chat/completions", payload)

            if result and "choices" in result and len(result["choices"]) > 0:
                enhanced_prompt = result["choices"][0]["message"]["content"]

                return {
                    "success": True,
                    "enhanced_prompt": enhanced_prompt,
                    "original_prompt": prompt,
                    "style": style,
                    "aspect_ratio": aspect_ratio,
                    "quality": quality,
                    "type": "enhanced_image_prompt",
                    "model": "gemini-2.5-flash",
                    "tokens_used": result.get("usage", {}).get("total_tokens", 0),
                    "preview": False
                }
            else:
                raise Exception("No response from OpenRouter")

        except Exception as e:
            logger.error(f"Image final generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "enhanced_prompt": params.get("prompt", "A beautiful landscape")
            }

    async def _make_request(self, endpoint: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Make authenticated request to OpenRouter API."""
        if not self.api_key:
            raise Exception("OpenRouter API key not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.app_url,
            "X-Title": self.app_name
        }

        url = f"{self.base_url}{endpoint}"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)

                if response.status_code == 200:
                    return response.json()
                else:
                    error_text = response.text
                    logger.error(f"OpenRouter API error {response.status_code}: {error_text}")
                    raise Exception(f"OpenRouter API error: {response.status_code} - {error_text}")

        except httpx.TimeoutException:
            logger.error("OpenRouter API request timed out")
            raise Exception("Request timed out")
        except Exception as e:
            logger.error(f"OpenRouter API request failed: {e}")
            raise

    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available OpenRouter models."""
        return [
            {
                "id": "openai/gpt-4o-mini",
                "name": "GPT-4o Mini",
                "description": "Fast, efficient chat model for conversations",
                "type": "chat",
                "context_length": 128000,
                "cost_per_1k_tokens": 0.00015
            },
            {
                "id": "google/gemini-2.0-flash-exp",
                "name": "Gemini 2.5 Flash",
                "description": "Google's fast multimodal model for image understanding and generation prompts",
                "type": "multimodal",
                "context_length": 1000000,
                "cost_per_1k_tokens": 0.0001
            }
        ]

    async def test_connection(self) -> Dict[str, Any]:
        """Test OpenRouter API connection."""
        try:
            payload = {
                "model": "openai/gpt-4o-mini",
                "messages": [{"role": "user", "content": "Hello, this is a test."}],
                "max_tokens": 10
            }

            result = await self._make_request("/chat/completions", payload)

            return {
                "success": True,
                "message": "OpenRouter connection successful",
                "models_available": len(self.get_available_models())
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "OpenRouter connection failed"
            }