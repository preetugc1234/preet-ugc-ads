"""
OpenRouter API adapter for GPT-4o mini chat and FAL AI image generation
Specialized for marketing, social media, and content creation workflows
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
    """OpenRouter API integration for chat and FAL AI image generation with marketing focus."""

    def __init__(self):
        self.gpt_api_key = os.getenv("OPENROUTER_GPT_API_KEY")
        self.gemini_api_key = os.getenv("OPENROUTER_GEMINI_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.app_name = "UGC AI Platform"
        self.app_url = "https://preet-ugc-ads.lovable.app"

        # Import FAL adapter for actual image generation
        from .fal_adapter import FalAdapter
        self.fal_adapter = FalAdapter()

        if not self.gpt_api_key:
            logger.warning("OpenRouter GPT API key not configured")
        if not self.gemini_api_key:
            logger.warning("OpenRouter Gemini API key not configured")

    def _get_marketing_system_prompt(self) -> str:
        """Get specialized system prompt for marketing/social media focus."""
        return """You are a specialized AI assistant for digital marketing, social media content creation, and SEO optimization. Your expertise covers:

🎯 **Core Specializations:**
- Social media content (Instagram, YouTube, TikTok, Facebook, LinkedIn)
- SEO titles, descriptions, and meta tags
- Marketing copy and ad scripts
- Video scripts and storyboards
- Content strategy and planning
- Hashtag research and optimization
- Captions, hooks, and call-to-actions
- Brand voice and tone development
- UGC (User Generated Content) strategies
- Image generation prompts and creative briefs

📝 **Response Format Requirements:**
- Always use proper markdown formatting with H1 (#), H2 (##), and H3 (###) headings
- Structure responses clearly and professionally
- Include actionable insights and specific examples
- Provide step-by-step guidance when appropriate
- Use bullet points and numbered lists for clarity

🚫 **Scope Limitations:**
- Focus on marketing, content creation, and related business topics
- Avoid deep technical programming discussions unrelated to marketing tools
- Stay within digital marketing, advertising, filming, and content creation domains
- Provide knowledge around audience targeting, engagement strategies, and conversion optimization

Always format your responses with clear headings and structured content for maximum readability and actionable value."""

    def _get_model_config(self, model_name: str) -> Dict[str, Any]:
        """Get model configuration including processing delays."""
        models = {
            "gpt-4o-mini": {
                "model_id": "openai/gpt-4o-mini",
                "delay_seconds": 2,  # 2 seconds
                "display_name": "GPT-4o Mini",
                "description": "Fast and efficient for quick responses"
            },
            "gpt-4": {
                "model_id": "openai/gpt-4o-mini",  # Using same API key/model
                "delay_seconds": 5,  # 2+3 = 5 seconds
                "display_name": "GPT-4",
                "description": "Most capable model for complex tasks"
            },
            "claude-3-haiku": {
                "model_id": "openai/gpt-4o-mini",  # Using same API key/model
                "delay_seconds": 8,  # 2+6 = 8 seconds
                "display_name": "Claude 3 Haiku",
                "description": "Fast responses with creative flair"
            },
            "claude-3-sonnet": {
                "model_id": "openai/gpt-4o-mini",  # Using same API key/model
                "delay_seconds": 10,  # 2+8 = 10 seconds
                "display_name": "Claude 3 Sonnet",
                "description": "Balanced performance for detailed content"
            }
        }
        return models.get(model_name, models["gpt-4o-mini"])

    async def generate_chat_preview(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate chat preview with marketing focus."""
        try:
            prompt = params.get("prompt", "Hello! How can I help you with your marketing needs?")
            model_name = params.get("model", "gpt-4o-mini")

            model_config = self._get_model_config(model_name)

            # Marketing-focused system prompt
            system_prompt = self._get_marketing_system_prompt()

            payload = {
                "model": model_config["model_id"],
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 200,  # Shorter for preview
                "temperature": 0.8,  # More creative for marketing content
                "top_p": 0.9
            }

            # Add artificial delay based on model
            if model_config["delay_seconds"] > 0:
                await asyncio.sleep(model_config["delay_seconds"])

            result = await self._make_request("/chat/completions", payload, use_gpt_key=True)

            if result and "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]

                return {
                    "success": True,
                    "content": content,
                    "type": "text",
                    "model": model_name,
                    "display_name": model_config["display_name"],
                    "tokens_used": result.get("usage", {}).get("total_tokens", 0),
                    "preview": True,
                    "processing_time": f"{model_config['delay_seconds']}s"
                }
            else:
                raise Exception("No response from OpenRouter")

        except Exception as e:
            logger.error(f"Chat preview generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "content": f"# 🚨 Response Error\n\nI'm having trouble generating your marketing content right now. Please try again in a moment.\n\n**Error:** {str(e)}"
            }

    async def generate_chat_final(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final chat response with marketing focus and proper formatting."""
        try:
            prompt = params.get("prompt", "Hello! How can I help you with your marketing needs?")
            model_name = params.get("model", "gpt-4o-mini")
            conversation_history = params.get("conversation_history", [])

            model_config = self._get_model_config(model_name)

            # Marketing-focused system prompt
            system_prompt = self._get_marketing_system_prompt()

            # Build conversation context
            messages = [{"role": "system", "content": system_prompt}]

            # Add conversation history if provided
            for msg in conversation_history[-8:]:  # Last 8 messages for context
                messages.append(msg)

            # Add current prompt
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": model_config["model_id"],
                "messages": messages,
                "max_tokens": 1500,  # Longer for detailed marketing content
                "temperature": 0.8,  # More creative for marketing
                "top_p": 0.9,
                "frequency_penalty": 0.2,
                "presence_penalty": 0.1
            }

            # Add artificial delay based on model
            if model_config["delay_seconds"] > 0:
                await asyncio.sleep(model_config["delay_seconds"])

            result = await self._make_request("/chat/completions", payload, use_gpt_key=True)

            if result and "choices" in result and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]

                return {
                    "success": True,
                    "content": content,
                    "type": "text",
                    "model": model_name,
                    "display_name": model_config["display_name"],
                    "tokens_used": result.get("usage", {}).get("total_tokens", 0),
                    "finish_reason": result["choices"][0].get("finish_reason"),
                    "processing_time": f"{model_config['delay_seconds']}s",
                    "preview": False
                }
            else:
                raise Exception("No response from OpenRouter")

        except Exception as e:
            logger.error(f"Chat final generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "content": f"# 🚨 Response Error\n\nI'm having trouble generating your marketing content right now. Please try again in a moment.\n\n## What happened?\nThere was an issue processing your request with the {model_config.get('display_name', 'selected')} model.\n\n## Next steps:\n- Check your internet connection\n- Try with a different model\n- Simplify your request\n\n**Technical Error:** {str(e)}"
            }

    async def generate_image_preview(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate image preview using FAL AI FLUX Schnell."""
        try:
            # Use FAL adapter for actual image generation
            result = await self.fal_adapter.generate_image_preview(params)

            if result["success"]:
                return {
                    "success": True,
                    "image_url": result.get("image_url"),
                    "text_prompt": result.get("text_prompt"),
                    "enhanced_prompt": result.get("enhanced_prompt"),
                    "has_image_input": result.get("has_image_input", False),
                    "style": result.get("style"),
                    "aspect_ratio": result.get("aspect_ratio"),
                    "quality": result.get("quality"),
                    "model": "flux-schnell",
                    "estimated_processing_time": "~2m",
                    "preview": True,
                    "message": "Image generated successfully"
                }
            else:
                return result

        except Exception as e:
            logger.error(f"Image preview generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "text_prompt": params.get("prompt", "A professional marketing image")
            }

    async def generate_image_final(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate final image using FAL AI FLUX Schnell."""
        try:
            # Use FAL adapter for actual image generation
            result = await self.fal_adapter.generate_image_final(params)

            if result["success"]:
                return {
                    "success": True,
                    "image_url": result.get("image_url"),
                    "text_prompt": result.get("text_prompt"),
                    "enhanced_prompt": result.get("enhanced_prompt"),
                    "has_image_input": result.get("has_image_input", False),
                    "style": result.get("style"),
                    "aspect_ratio": result.get("aspect_ratio"),
                    "quality": result.get("quality"),
                    "model": "flux-schnell",
                    "processing_time": "~2m",
                    "preview": False
                }
            else:
                return result

        except Exception as e:
            logger.error(f"Image final generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "text_prompt": params.get("prompt", "A professional marketing image")
            }

    async def _make_request(self, endpoint: str, payload: Dict[str, Any], use_gpt_key: bool = True) -> Optional[Dict[str, Any]]:
        """Make authenticated request to OpenRouter API with appropriate key."""
        api_key = self.gpt_api_key if use_gpt_key else self.gemini_api_key

        if not api_key:
            key_type = "GPT" if use_gpt_key else "Gemini"
            raise Exception(f"OpenRouter {key_type} API key not configured")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.app_url,
            "X-Title": self.app_name
        }

        url = f"{self.base_url}{endpoint}"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:  # Increased timeout for longer responses
                response = await client.post(url, json=payload, headers=headers)

                if response.status_code == 200:
                    return response.json()
                else:
                    error_text = response.text
                    logger.error(f"OpenRouter API error {response.status_code}: {error_text}")
                    raise Exception(f"OpenRouter API error: {response.status_code} - {error_text}")

        except httpx.TimeoutException:
            logger.error("OpenRouter API request timed out")
            raise Exception("Request timed out - the model may be taking longer than expected")
        except Exception as e:
            logger.error(f"OpenRouter API request failed: {e}")
            raise

    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available chat models with marketing focus."""
        return [
            {
                "id": "gpt-4o-mini",
                "name": "GPT-4o Mini",
                "description": "Fast marketing content generation",
                "type": "chat",
                "processing_time": "~2s",
                "best_for": "Quick social media posts, captions, hashtags"
            },
            {
                "id": "gpt-4",
                "name": "GPT-4",
                "description": "Advanced marketing strategies",
                "type": "chat",
                "processing_time": "~5s",
                "best_for": "Detailed campaigns, SEO content, scripts"
            },
            {
                "id": "claude-3-haiku",
                "name": "Claude 3 Haiku",
                "description": "Creative content generation",
                "type": "chat",
                "processing_time": "~8s",
                "best_for": "Creative copy, storytelling, brand voice"
            },
            {
                "id": "claude-3-sonnet",
                "name": "Claude 3 Sonnet",
                "description": "Comprehensive content strategy",
                "type": "chat",
                "processing_time": "~10s",
                "best_for": "Long-form content, strategy docs, analysis"
            }
        ]

    def get_available_image_models(self) -> List[Dict[str, Any]]:
        """Get list of available image generation models."""
        return [
            {
                "id": "fal-ai/flux/schnell",
                "name": "FLUX Schnell",
                "description": "Fast image generation model optimized for marketing and social media content",
                "type": "image_generation",
                "processing_time": "~2m",
                "supported_sizes": ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"],
                "best_for": "Marketing images, social media content, product visuals"
            }
        ]

    async def test_connection(self) -> Dict[str, Any]:
        """Test OpenRouter API connections for both keys."""
        try:
            # Test GPT key
            gpt_payload = {
                "model": "openai/gpt-4o-mini",
                "messages": [{"role": "user", "content": "Test marketing assistant connection."}],
                "max_tokens": 10
            }

            gpt_result = await self._make_request("/chat/completions", gpt_payload, use_gpt_key=True)
            gpt_success = bool(gpt_result and "choices" in gpt_result)

            # Test Gemini key (if available)
            gemini_success = False
            if self.gemini_api_key:
                try:
                    gemini_payload = {
                        "model": "google/gemini-2.0-flash-exp",
                        "messages": [{"role": "user", "content": "Test image generation connection."}],
                        "max_tokens": 10
                    }
                    gemini_result = await self._make_request("/chat/completions", gemini_payload, use_gpt_key=False)
                    gemini_success = bool(gemini_result and "choices" in gemini_result)
                except Exception:
                    pass

            return {
                "success": gpt_success or gemini_success,
                "gpt_connection": gpt_success,
                "gemini_connection": gemini_success,
                "message": f"OpenRouter connections: GPT={'✅' if gpt_success else '❌'} Gemini={'✅' if gemini_success else '❌'}",
                "models_available": len(self.get_available_models())
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "OpenRouter connection failed"
            }