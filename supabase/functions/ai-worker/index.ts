/**
 * Supabase Edge Function for AI model processing
 * Handles all 6 AI workflows with HMAC-signed callbacks
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHash } from "https://deno.land/std@0.168.0/crypto/mod.ts"

// Configuration
const BACKEND_URL = Deno.env.get('BACKEND_URL') || 'https://preet-ugc-ads.onrender.com'
const HMAC_SECRET = Deno.env.get('WORKER_HMAC_SECRET') || 'your-worker-hmac-secret-key'
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
const FAL_API_KEY = Deno.env.get('FAL_API_KEY')

// Types
interface JobPayload {
  jobId: string
  module: string
  params: Record<string, any>
  userId: string
}

interface ModelConfig {
  name: string
  provider: string
  model: string
  avg_time_seconds: number
}

// Module configurations (matching backend)
const MODULE_CONFIGS: Record<string, ModelConfig> = {
  "chat": {
    name: "Chat/Text Generation",
    provider: "openrouter",
    model: "openai/gpt-4o-mini",
    avg_time_seconds: 5
  },
  "image": {
    name: "Text to Image",
    provider: "openrouter",
    model: "google/gemini-flash-1.5",
    avg_time_seconds: 15
  },
  "img2vid_noaudio": {
    name: "Image to Video (No Audio)",
    provider: "fal",
    model: "fal-ai/wan/v2.2-5b/image-to-video",
    avg_time_seconds: 60  // ~60 seconds for Wan v2.2-5B
  },
  "tts": {
    name: "Text to Speech",
    provider: "fal",
    model: "fal-ai/elevenlabs-text-to-speech",
    avg_time_seconds: 10
  },
  "img2vid_audio": {
    name: "Image to Video (With Audio)",
    provider: "fal",
    model: "fal-ai/kling-video/v1/pro/ai-avatar",
    avg_time_seconds: 480  // 8 minutes for AI Avatar
  },
  "audio2vid": {
    name: "Audio to Video",
    provider: "veed",
    model: "veed-ugc",
    avg_time_seconds: 90
  }
}

// HMAC utilities
function generateHMAC(jobId: string, timestamp: string, payloadHash: string): string {
  const message = `${jobId}|${timestamp}|${payloadHash}`
  const key = new TextEncoder().encode(HMAC_SECRET)
  const data = new TextEncoder().encode(message)

  return crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(cryptoKey =>
    crypto.subtle.sign('HMAC', cryptoKey, data)
  ).then(signature =>
    Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  )
}

// Cloudinary upload utility
async function uploadToCloudinary(file: Blob, path: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'ugc_ai_preset') // You'll need to create this
  formData.append('public_id', path)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${Deno.env.get('CLOUDINARY_CLOUD_NAME')}/auto/upload`,
    {
      method: 'POST',
      body: formData
    }
  )

  const result = await response.json()
  return result.secure_url
}

// AI model adapters with real implementations
class ModelAdapter {
  static async generatePreview(module: string, params: Record<string, any>): Promise<any> {
    const config = MODULE_CONFIGS[module]

    switch (config.provider) {
      case 'openrouter':
        return await this.processOpenRouter(module, params, true)
      case 'fal':
        return await this.processFal(module, params, true)
      case 'veed':
        return await this.processVeed(module, params, true)
      default:
        throw new Error(`Unsupported provider: ${config.provider}`)
    }
  }

  static async generateFinal(module: string, params: Record<string, any>): Promise<any> {
    const config = MODULE_CONFIGS[module]

    switch (config.provider) {
      case 'openrouter':
        return await this.processOpenRouter(module, params, false)
      case 'fal':
        return await this.processFal(module, params, false)
      case 'veed':
        return await this.processVeed(module, params, false)
      default:
        throw new Error(`Unsupported provider: ${config.provider}`)
    }
  }

  private static async processOpenRouter(module: string, params: Record<string, any>, isPreview: boolean): Promise<any> {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured')
    }

    if (module === 'chat') {
      // Chat generation
      const messages = [
        {
          role: 'system',
          content: isPreview
            ? 'You are a helpful AI assistant. Provide concise, helpful responses.'
            : 'You are a helpful AI assistant. Provide detailed, informative responses while being concise and clear.'
        },
        { role: 'user', content: params.prompt || 'Hello! How can I help you today?' }
      ]

      const payload = {
        model: 'openai/gpt-4o-mini',
        messages,
        max_tokens: isPreview ? 150 : 1000,
        temperature: 0.7,
        top_p: 0.9
      }

      if (!isPreview) {
        payload.frequency_penalty = 0.1
        payload.presence_penalty = 0.1
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://preet-ugc-ads.lovable.app',
          'X-Title': 'UGC AI Platform'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status} - ${await response.text()}`)
      }

      const result = await response.json()

      if (!result.choices || result.choices.length === 0) {
        throw new Error('No response from OpenRouter')
      }

      return {
        type: 'text',
        content: result.choices[0].message.content,
        model: 'gpt-4o-mini',
        tokens_used: result.usage?.total_tokens || 0,
        preview: isPreview
      }
    } else if (module === 'image') {
      // Image prompt enhancement using Gemini 2.5 Flash
      const imagePrompt = isPreview
        ? `Create a detailed visual description for image generation based on this prompt: "${params.prompt}"\n\nProvide a detailed description that includes:\n- Main subject and composition\n- Style and artistic approach\n- Colors and lighting\n- Mood and atmosphere\n- Technical details for best results\n\nKeep it concise but descriptive for AI image generation.`
        : `Enhance this image prompt for professional AI image generation: "${params.prompt}"\n\nStyle: ${params.style || 'photorealistic'}\nAspect Ratio: ${params.aspect_ratio || '16:9'}\nQuality: ${params.quality || 'high'}\n\nCreate an enhanced prompt that includes:\n1. Detailed visual description\n2. Specific artistic style and technique\n3. Lighting and color palette\n4. Composition and framing\n5. Technical quality indicators\n6. Mood and atmosphere\n\nFormat the response as a single, comprehensive prompt ready for image generation AI.`

      const payload = {
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          {
            role: 'system',
            content: isPreview
              ? 'You are an expert at creating detailed prompts for AI image generation. Always respond with clear, descriptive visual prompts.'
              : 'You are a master prompt engineer specializing in AI image generation. Create detailed, technical prompts that produce stunning results.'
          },
          { role: 'user', content: imagePrompt }
        ],
        max_tokens: isPreview ? 300 : 500,
        temperature: isPreview ? 0.8 : 0.7
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://preet-ugc-ads.lovable.app',
          'X-Title': 'UGC AI Platform'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status} - ${await response.text()}`)
      }

      const result = await response.json()

      if (!result.choices || result.choices.length === 0) {
        throw new Error('No response from OpenRouter')
      }

      return {
        type: 'image_prompt',
        enhanced_prompt: result.choices[0].message.content,
        original_prompt: params.prompt,
        style: params.style || 'photorealistic',
        aspect_ratio: params.aspect_ratio || '16:9',
        quality: params.quality || 'high',
        model: 'gemini-2.5-flash',
        tokens_used: result.usage?.total_tokens || 0,
        preview: isPreview
      }
    }

    throw new Error(`Unsupported OpenRouter module: ${module}`)
  }

  private static async processFal(module: string, params: Record<string, any>, isPreview: boolean): Promise<any> {
    if (!FAL_API_KEY) {
      throw new Error('Fal API key not configured')
    }

    // Use fal_client for proper async processing with queue support
    const fal_client = await import('https://esm.sh/@fal-ai/serverless-client@0.14.2')
    fal_client.config({ credentials: FAL_API_KEY })

    let endpoint: string
    let requestPayload: any

    switch (module) {
      case 'tts':
        endpoint = 'fal-ai/elevenlabs-text-to-speech'
        requestPayload = {
          text: params.text || 'Hello, this is a test speech.',
          voice: params.voice || 'Rachel',
          model_id: isPreview ? 'eleven_monolingual_v1' : 'eleven_multilingual_v2',
          voice_settings: {
            stability: isPreview ? 0.5 : 0.75,
            similarity_boost: isPreview ? 0.5 : 0.75
          }
        }
        break

      case 'img2vid_noaudio':
        endpoint = 'fal-ai/wan/v2.2-5b/image-to-video'
        requestPayload = {
          image_url: params.image_url,
          prompt: params.prompt || 'Smooth cinematic motion with natural camera movement',
          num_frames: 120,  // 120 frames for exactly 5 seconds at 24fps
          frames_per_second: 24,
          resolution: '720p',
          aspect_ratio: 'auto',
          num_inference_steps: 30,
          enable_safety_checker: true,
          enable_prompt_expansion: false,
          guidance_scale: 3.5,
          shift: 5,
          interpolator_model: 'film',
          num_interpolated_frames: 0,
          adjust_fps_for_interpolation: true,
          video_quality: 'high',
          video_write_mode: 'balanced'
        }
        // Add optional parameters if provided
        if (params.seed) {
          requestPayload.seed = parseInt(params.seed)
        }
        if (params.negative_prompt) {
          requestPayload.negative_prompt = params.negative_prompt
        }
        break

      case 'img2vid_audio':
        endpoint = 'fal-ai/kling-video/v1/pro/ai-avatar'
        requestPayload = {
          image_url: params.image_url,
          audio_url: params.audio_url
        }
        if (!params.audio_url) {
          throw new Error('Audio URL is required for AI Avatar')
        }
        break

      case 'audio2vid':
        endpoint = 'veed/avatars/audio-to-video'
        requestPayload = {
          avatar_id: params.avatar_id || 'emily_vertical_primary',
          audio_url: params.audio_url
        }
        if (!params.audio_url) {
          throw new Error('Audio URL is required for audio-to-video')
        }
        break

      default:
        throw new Error(`Unsupported Fal AI module: ${module}`)
    }

    // Use subscribe for synchronous processing with proper error handling
    const result = await fal_client.subscribe(endpoint, {
      input: requestPayload,
      logs: true,
      onQueueUpdate: (update) => {
        console.log(`${module} queue update:`, update.status)
      }
    })

    if (!result) {
      throw new Error(`No result from Fal AI for ${module}`)
    }

    console.log(`Fal AI ${module} result:`, JSON.stringify(result, null, 2))

    // Handle different response formats based on module
    switch (module) {
      case 'tts':
        if (!result.audio_url && !result.audio?.url) {
          throw new Error('No audio URL in TTS result')
        }
        return {
          type: 'audio',
          audio_url: result.audio_url || result.audio?.url,
          text: params.text,
          voice: params.voice,
          duration: result.duration || 0,
          model: 'elevenlabs',
          preview: isPreview
        }

      case 'img2vid_noaudio':
      case 'img2vid_audio':
        if (!result.video && !result.video_url) {
          throw new Error(`No video in ${module} result: ${JSON.stringify(result)}`)
        }
        const videoUrl = result.video?.url || result.video_url
        const thumbnailUrl = result.video?.thumbnail_url || result.thumbnail_url

        return {
          type: 'video',
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration: result.video?.duration || result.duration || (module === 'img2vid_noaudio' ? 5 : params.duration_seconds || 5),
          aspect_ratio: params.aspect_ratio || '16:9',
          fps: result.video?.fps || (isPreview ? 24 : 30),
          has_audio: module === 'img2vid_audio',
          model: module === 'img2vid_noaudio' ? 'wan-v2.2-5b' : 'kling-v1-pro',
          preview: isPreview
        }

      case 'audio2vid':
        if (!result.video && !result.video_url) {
          throw new Error(`No video in audio2vid result: ${JSON.stringify(result)}`)
        }
        return {
          type: 'video',
          video_url: result.video?.url || result.video_url,
          thumbnail_url: result.video?.thumbnail_url || result.thumbnail_url,
          duration: result.video?.duration || result.duration || params.duration_seconds,
          aspect_ratio: params.aspect_ratio || '9:16',
          quality: params.quality,
          model: 'veed-avatars',
          preview: isPreview
        }

      default:
        throw new Error(`Unsupported result format for module: ${module}`)
    }
  }

  private static async processVeed(module: string, params: Record<string, any>, isPreview: boolean): Promise<any> {
    // VEED API integration would go here
    // For now, return a mock response that matches our expected format
    console.log('VEED processing not yet implemented, returning mock data')

    return {
      type: 'video',
      video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnail_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.jpg',
      duration: Math.min(params.duration_seconds || 30, isPreview ? 15 : 120),
      aspect_ratio: '16:9',
      quality: isPreview ? 'standard' : 'high',
      model: 'veed-ugc',
      preview: isPreview
    }
  }
}


// Asset upload utility for different media types
async function uploadAsset(assetData: any, module: string, userId: string, jobId: string, isPreview: boolean): Promise<string[]> {
  const stage = isPreview ? 'preview' : 'final'
  const uploadedUrls: string[] = []

  try {
    switch (assetData.type) {
      case 'text':
        // For text content, create a JSON file
        const textData = {
          content: assetData.content,
          model: assetData.model,
          tokens_used: assetData.tokens_used,
          created_at: new Date().toISOString()
        }
        const textBlob = new Blob([JSON.stringify(textData, null, 2)], { type: 'application/json' })
        const textPath = `user_${userId}/job_${jobId}/${stage}_text.json`
        const textUrl = await uploadToCloudinary(textBlob, textPath)
        uploadedUrls.push(textUrl)
        break

      case 'image_prompt':
        // For image prompts, create a JSON file with prompt data
        const promptData = {
          original_prompt: assetData.original_prompt,
          enhanced_prompt: assetData.enhanced_prompt,
          style: assetData.style,
          aspect_ratio: assetData.aspect_ratio,
          quality: assetData.quality,
          model: assetData.model,
          tokens_used: assetData.tokens_used,
          created_at: new Date().toISOString()
        }
        const promptBlob = new Blob([JSON.stringify(promptData, null, 2)], { type: 'application/json' })
        const promptPath = `user_${userId}/job_${jobId}/${stage}_prompt.json`
        const promptUrl = await uploadToCloudinary(promptBlob, promptPath)
        uploadedUrls.push(promptUrl)
        break

      case 'audio':
        // Download and re-upload audio file
        if (assetData.audio_url) {
          const audioResponse = await fetch(assetData.audio_url)
          const audioBlob = await audioResponse.blob()
          const audioPath = `user_${userId}/job_${jobId}/${stage}_audio`
          const audioUrl = await uploadToCloudinary(audioBlob, audioPath)
          uploadedUrls.push(audioUrl)
        }
        break

      case 'video':
        // Download and re-upload video file
        if (assetData.video_url) {
          const videoResponse = await fetch(assetData.video_url)
          const videoBlob = await videoResponse.blob()
          const videoPath = `user_${userId}/job_${jobId}/${stage}_video`
          const videoUrl = await uploadToCloudinary(videoBlob, videoPath)
          uploadedUrls.push(videoUrl)
        }

        // Also upload thumbnail if available
        if (assetData.thumbnail_url) {
          const thumbResponse = await fetch(assetData.thumbnail_url)
          const thumbBlob = await thumbResponse.blob()
          const thumbPath = `user_${userId}/job_${jobId}/${stage}_thumbnail`
          const thumbUrl = await uploadToCloudinary(thumbBlob, thumbPath)
          uploadedUrls.push(thumbUrl)
        }
        break

      default:
        console.warn(`Unknown asset type: ${assetData.type}`)
    }

    return uploadedUrls
  } catch (error) {
    console.error(`Failed to upload ${assetData.type} asset:`, error)
    return []
  }
}

// Main worker function
async function processJob(jobPayload: JobPayload): Promise<void> {
  const { jobId, module, params, userId } = jobPayload

  try {
    console.log(`Processing job ${jobId} for module ${module}`)

    // Generate preview
    console.log(`Generating preview for ${module}...`)
    const previewResult = await ModelAdapter.generatePreview(module, params)

    // Upload preview assets
    const previewUrls = await uploadAsset(previewResult, module, userId, jobId, true)

    if (previewUrls.length > 0) {
      // Send preview ready callback with asset metadata
      const previewPayload = {
        preview_url: previewUrls[0], // Primary URL
        preview_urls: previewUrls, // All URLs
        preview_meta: {
          type: previewResult.type,
          model: previewResult.model,
          duration: previewResult.duration || 0,
          file_count: previewUrls.length,
          generated_at: new Date().toISOString()
        }
      }

      await sendCallback(jobId, '/preview_ready', previewPayload)
      console.log(`Preview ready for job ${jobId}`)
    }

    // Generate final
    console.log(`Generating final for ${module}...`)
    const finalResult = await ModelAdapter.generateFinal(module, params)

    // Upload final assets
    const finalUrls = await uploadAsset(finalResult, module, userId, jobId, false)

    if (finalUrls.length > 0) {
      // Send completion callback with comprehensive metadata
      const completionPayload = {
        status: 'completed',
        final_urls: finalUrls,
        worker_meta: {
          type: finalResult.type,
          model: finalResult.model,
          duration: finalResult.duration || 0,
          file_count: finalUrls.length,
          processed_at: new Date().toISOString(),
          tokens_used: finalResult.tokens_used || 0
        },
        generation_type: module,
        asset_metadata: {
          preview_generated: previewUrls.length > 0,
          final_generated: true,
          total_assets: previewUrls.length + finalUrls.length
        }
      }

      await sendCallback(jobId, '/callback', completionPayload)
      console.log(`Job ${jobId} completed successfully`)
    } else {
      throw new Error('No final assets were uploaded')
    }

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error)

    // Send failure callback
    const failurePayload = {
      status: 'failed',
      error_message: error.message,
      worker_meta: {
        failed_at: new Date().toISOString(),
        module: module,
        error_type: error.name || 'WorkerError'
      }
    }

    await sendCallback(jobId, '/callback', failurePayload)
  }
}

// Unified callback function
async function sendCallback(jobId: string, endpoint: string, payload: any): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const payloadString = JSON.stringify(payload)
  const payloadHash = Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payloadString)))
  ).map(b => b.toString(16).padStart(2, '0')).join('')

  const signature = await generateHMAC(jobId, timestamp, payloadHash)

  const response = await fetch(`${BACKEND_URL}/api/jobs/${jobId}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Worker-Signature': signature,
      'X-Worker-Timestamp': timestamp
    },
    body: payloadString
  })

  if (!response.ok) {
    console.error(`Callback failed: ${response.status} - ${await response.text()}`)
    throw new Error(`Callback to ${endpoint} failed`)
  }
}

// Edge Function handler
serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const jobPayload: JobPayload = await req.json()

    // Validate payload
    if (!jobPayload.jobId || !jobPayload.module || !MODULE_CONFIGS[jobPayload.module]) {
      return new Response('Invalid job payload', { status: 400 })
    }

    // Process job asynchronously (fire and forget)
    processJob(jobPayload).catch(console.error)

    return new Response(
      JSON.stringify({ success: true, message: 'Job processing started' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Worker error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})